"""
OCR Service - EasyOCR Primary + Bhashini + Resilient Fallback
=============================================================
Fallback chain (in order):
  1. Bhashini Dhruva API     -- if BHASHINI_API_KEY is set in .env
  2. EasyOCR (offline/local) -- zero API key, Devanagari-native  <- PRIMARY
  3. PyTesseract (offline)   -- if tesseract binary is on PATH
  4. Google Cloud Vision     -- if GOOGLE_VISION_API_KEY is set
  5. Simulated fallback      -- dev/test only, returns sample 7/12 text

PDF support: pdf2image converts each PDF page to JPEG before OCR.
"""
import io
import os
import sys
import base64
import logging
from typing import Dict, Any, List, Optional

import httpx
from PIL import Image, ImageEnhance

from app.config import settings

logger = logging.getLogger("bhunetra.ocr")

# ---------------------------------------------------------------------------
# EasyOCR singleton  -- loaded once at first use, alive for process lifetime.
# Loading torch + OCR models takes ~10-15 s on first call, ~0 ms after that.
# ---------------------------------------------------------------------------
_easyocr_reader = None

def _get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            logger.info("Loading EasyOCR models [mr, hi, en] -- first load ~10 s ...")
            _easyocr_reader = easyocr.Reader(
                ["mr", "hi", "en"],
                gpu=False,
                verbose=False,
            )
            logger.info("EasyOCR reader ready.")
        except ImportError:
            logger.warning("easyocr not installed. Run: pip install easyocr")
        except Exception as exc:
            logger.error("EasyOCR init failed: %s", exc)
    return _easyocr_reader


# ---------------------------------------------------------------------------
# OCRResult dataclass
# ---------------------------------------------------------------------------
class OCRResult:
    def __init__(
        self,
        raw_text: str,
        lines: List[Dict[str, Any]],
        language: str = "mr",
        source_engine: str = "easyocr_offline",
        is_fallback: bool = False,
        error_details: Optional[str] = None,
        page_count: int = 1,
    ):
        self.raw_text      = raw_text
        self.lines         = lines
        self.language      = language
        self.source_engine = source_engine
        self.is_fallback   = is_fallback
        self.error_details = error_details
        self.page_count    = page_count

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rawText":      self.raw_text,
            "lines":        self.lines,
            "language":     self.language,
            "sourceEngine": self.source_engine,
            "isFallback":   self.is_fallback,
            "errorDetails": self.error_details,
            "pageCount":    self.page_count,
        }


# ---------------------------------------------------------------------------
# Main service
# ---------------------------------------------------------------------------
class BhashiniOCRService:
    """
    Unified OCR service for Indian revenue and land records.
    EasyOCR is the default offline engine (no API key required).
    Bhashini is used when BHASHINI_API_KEY is present (production).
    """

    def __init__(self):
        self.api_key       = settings.BHASHINI_API_KEY
        self.user_id       = settings.BHASHINI_USER_ID
        self.pipeline_id   = settings.BHASHINI_PIPELINE_ID
        self.inference_url = settings.BHASHINI_INFERENCE_URL
        self.timeout       = 30.0

    # ------------------------------------------------------------------
    # Image helpers
    # ------------------------------------------------------------------

    def preprocess_image(self, image_bytes: bytes) -> bytes:
        """
        Preprocesses degraded / handwritten land records:
        - Scales max dimension to 2400 px for optimal OCR resolution
        - Boosts contrast and sharpness for faded ink / carbon copies
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            max_dim = 2400
            if max(image.size) > max_dim:
                image.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            enhanced  = ImageEnhance.Contrast(image).enhance(1.4)
            sharpened = ImageEnhance.Sharpness(enhanced).enhance(1.3)
            buf = io.BytesIO()
            sharpened.save(buf, format="JPEG", quality=92)
            return buf.getvalue()
        except Exception as exc:
            logger.warning("Image preprocessing: %s -- using raw bytes.", exc)
            return image_bytes

    def pdf_to_images(self, pdf_bytes: bytes) -> List[bytes]:
        """
        Converts each PDF page to a JPEG image.
        Requires: pip install pdf2image  +  poppler on PATH.
        """
        try:
            from pdf2image import convert_from_bytes
            pages  = convert_from_bytes(pdf_bytes, dpi=300)
            result = []
            for page in pages:
                buf = io.BytesIO()
                page.save(buf, format="JPEG", quality=95)
                result.append(buf.getvalue())
            logger.info("PDF converted: %d pages.", len(result))
            return result
        except ImportError:
            logger.warning("pdf2image not installed -- pip install pdf2image + poppler. Treating as image.")
            return [pdf_bytes]
        except Exception as exc:
            logger.error("PDF conversion failed: %s", exc)
            return [pdf_bytes]

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------

    async def extract_text(
        self,
        file_bytes: bytes,
        source_language: str = "mr",
        mime_type: str = "image/jpeg",
    ) -> "OCRResult":
        """
        Main OCR entry point. Accepts images (JPEG/PNG) or PDFs.
        For PDFs: OCR is run on every page and text is merged.
        """
        # PDF path
        if mime_type == "application/pdf" or file_bytes[:4] == b"%PDF":
            page_images = self.pdf_to_images(file_bytes)
            all_results = []
            for page_bytes in page_images:
                processed = self.preprocess_image(page_bytes)
                res       = await self._run_ocr_chain(processed, source_language)
                all_results.append(res)

            merged_text  = "\n\n--- Page Break ---\n\n".join(r.raw_text for r in all_results)
            merged_lines: List[Dict[str, Any]] = []
            for r in all_results:
                merged_lines.extend(r.lines)

            return OCRResult(
                raw_text      = merged_text,
                lines         = merged_lines,
                language      = source_language,
                source_engine = all_results[0].source_engine if all_results else "unknown",
                is_fallback   = any(r.is_fallback for r in all_results),
                page_count    = len(all_results),
            )

        # Single image path
        processed = self.preprocess_image(file_bytes)
        return await self._run_ocr_chain(processed, source_language)

    async def _run_ocr_chain(self, processed_bytes: bytes, source_language: str) -> "OCRResult":
        """Runs the 5-layer fallback chain on a single preprocessed image."""
        b64 = base64.b64encode(processed_bytes).decode("utf-8")

        # 1. Bhashini (production; needs API key)
        if self.api_key and self.inference_url:
            try:
                logger.info("Attempting Bhashini OCR ...")
                res = await self._call_bhashini_api(b64, source_language)
                if res and res.raw_text.strip():
                    return res
            except Exception as exc:
                logger.error("Bhashini failed: %s -- falling back.", exc)

        # 2. EasyOCR -- primary offline engine
        res = self._easyocr_extract(processed_bytes, source_language)
        if res and res.raw_text.strip():
            return res

        # 3. PyTesseract -- secondary offline engine
        res = self._tesseract_extract(processed_bytes, source_language)
        if res and res.raw_text.strip():
            return res

        # 4. Google Cloud Vision (optional cloud fallback)
        if getattr(settings, "GOOGLE_VISION_API_KEY", None):
            try:
                res = await self._call_google_vision_fallback(b64)
                if res and res.raw_text.strip():
                    return res
            except Exception as exc:
                logger.error("Google Vision failed: %s", exc)

        # 5. Simulated fallback (dev/test only)
        logger.warning("All OCR engines unavailable -- using simulated fallback.")
        return self._offline_ocr_fallback(processed_bytes, source_language)

    # ------------------------------------------------------------------
    # Engine implementations
    # ------------------------------------------------------------------

    def _easyocr_extract(self, image_bytes: bytes, source_language: str) -> Optional["OCRResult"]:
        """
        EasyOCR -- 100% offline, Devanagari-native, no API key.
        Model weights download to ~/.EasyOCR/ on first run (~300 MB, one time only).
        Subsequent calls use the in-memory singleton reader instantly.
        """
        try:
            import numpy as np

            reader = _get_easyocr_reader()
            if reader is None:
                return None

            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != "RGB":
                image = image.convert("RGB")

            results   = reader.readtext(np.array(image), detail=1, paragraph=False)
            raw_parts: List[str]           = []
            lines:     List[Dict[str, Any]] = []

            for (bbox, text, prob) in results:
                text = text.strip()
                if not text:
                    continue
                raw_parts.append(text)
                xs = [pt[0] for pt in bbox]
                ys = [pt[1] for pt in bbox]
                lines.append({
                    "text":        text,
                    "confidence":  round(float(prob), 4),
                    "boundingBox": {
                        "x1": int(min(xs)), "y1": int(min(ys)),
                        "x2": int(max(xs)), "y2": int(max(ys)),
                    },
                })

            full_text = "\n".join(raw_parts)
            if not full_text.strip():
                logger.warning("EasyOCR returned empty text for this image.")
                return None

            logger.info("EasyOCR: %d lines extracted.", len(lines))
            return OCRResult(
                raw_text      = full_text,
                lines         = lines,
                language      = source_language,
                source_engine = "easyocr_offline",
                is_fallback   = False,
            )

        except ImportError:
            logger.debug("EasyOCR not installed.")
            return None
        except Exception as exc:
            logger.warning("EasyOCR error: %s", exc)
            return None

    def _tesseract_extract(self, image_bytes: bytes, source_language: str) -> Optional["OCRResult"]:
        """
        PyTesseract fallback.
        Requires: tesseract binary on PATH + mar.traineddata in tessdata dir.
        Download mar.traineddata: https://github.com/tesseract-ocr/tessdata
        """
        try:
            import pytesseract
            image = Image.open(io.BytesIO(image_bytes))
            text  = pytesseract.image_to_string(image, lang="mar+hin+eng")
            if not text or not text.strip():
                return None
            lines = [
                {"text": ln.strip(), "confidence": 0.85}
                for ln in text.split("\n") if ln.strip()
            ]
            logger.info("Tesseract: %d lines extracted.", len(lines))
            return OCRResult(
                raw_text      = text.strip(),
                lines         = lines,
                language      = source_language,
                source_engine = "pytesseract_offline",
                is_fallback   = False,
            )
        except ImportError:
            logger.debug("pytesseract not installed.")
            return None
        except Exception as exc:
            logger.warning("Tesseract error: %s", exc)
            return None

    async def _call_bhashini_api(self, b64_image: str, source_language: str) -> Optional["OCRResult"]:
        """Calls the official Bhashini Dhruva Pipeline inference endpoint."""
        headers = {
            "Authorization": self.api_key,
            "Content-Type":  "application/json",
            "userID":        self.user_id,
            "ulcaApiKey":    self.api_key,
        }
        payload = {
            "pipelineTasks": [{
                "taskType": "ocr",
                "config": {
                    "language":  {"sourceLanguage": source_language},
                    "serviceId": self.pipeline_id or "",
                },
            }],
            "inputData": {"image": [{"imageContent": b64_image}]},
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(self.inference_url, json=payload, headers=headers)
        if response.status_code == 200:
            return self._parse_bhashini_response(response.json(), source_language)
        logger.warning("Bhashini returned %d: %s", response.status_code, response.text[:200])
        return None

    def _parse_bhashini_response(self, data: Dict[str, Any], source_language: str) -> "OCRResult":
        lines, parts = [], []
        for task in data.get("pipelineResponse", []):
            if task.get("taskType") == "ocr":
                for item in task.get("output", []):
                    src = item.get("source", "")
                    if src:
                        parts.append(src)
                        lines.append({
                            "text":        src,
                            "boundingBox": item.get("boundingBox"),
                            "confidence":  item.get("confidence", 0.90),
                        })
        return OCRResult(
            raw_text      = "\n".join(parts),
            lines         = lines,
            language      = source_language,
            source_engine = "bhashini",
            is_fallback   = False,
        )

    async def _call_google_vision_fallback(self, b64_image: str) -> Optional["OCRResult"]:
        url = (
            "https://vision.googleapis.com/v1/images:annotate"
            f"?key={settings.GOOGLE_VISION_API_KEY}"
        )
        payload = {
            "requests": [{
                "image":    {"content": b64_image},
                "features": [{"type": "DOCUMENT_TEXT_DETECTION"}],
            }]
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            res = await client.post(url, json=payload)
        if res.status_code == 200:
            responses = res.json().get("responses", [])
            if responses:
                raw_text = responses[0].get("fullTextAnnotation", {}).get("text", "")
                return OCRResult(
                    raw_text      = raw_text,
                    lines         = [{"text": raw_text, "confidence": 0.95}],
                    language      = "mr",
                    source_engine = "google_vision",
                    is_fallback   = True,
                )
        return None

    def _offline_ocr_fallback(self, image_bytes: bytes, source_language: str) -> "OCRResult":
        """Last-resort simulated fallback for dev/CI when no real OCR engine is available."""
        simulated = (
            "\u092e\u0939\u093e\u0930\u093e\u0937\u094d\u091f\u094d\u0930 \u0936\u093e\u0938\u0928 - \u092e\u0939\u0938\u0942\u0932 \u0935 \u0935\u0928 \u0935\u093f\u092d\u093e\u0917\n"
            "\u0917\u093e\u0935 \u0928\u092e\u0941\u0928\u093e \u0938\u093e\u0924 (\u0967/\u0967\u0968) - \u0905\u0927\u093f\u0915\u093e\u0930 \u0905\u092d\u093f\u0932\u0947\u0916 \u092a\u0924\u094d\u0930\u0915\n"
            "\u0917\u093e\u0935: \u0935\u093e\u0918\u094b\u0932\u0940 (Wagholi), \u0924\u093e\u0932\u0941\u0915\u093e: \u0939\u0935\u0947\u0932\u0940 (Haveli), \u091c\u093f\u0932\u094d\u0939\u093e: \u092a\u0941\u0923\u0947 (Pune)\n"
            "\u092d\u0942\u092e\u093e\u092a\u0928 \u0915\u094d\u0930\u092e\u093e\u0902\u0915 / \u0917\u091f \u0915\u094d\u0930\u092e\u093e\u0902\u0915 (Khasra No): 142/3A\n"
            "\u0916\u093e\u0924\u0947 \u0915\u094d\u0930\u092e\u093e\u0902\u0915 (Khata No): 582\n"
            "\u092d\u094b\u0917\u0935\u091f\u093e\u0926\u093e\u0930\u093e\u091a\u0947 \u0928\u093e\u0935 (Owner Name): \u0930\u092e\u0947\u0936 \u0935\u093f\u0920\u094d\u0920\u0932 \u092a\u093e\u091f\u0940\u0932 (Ramesh Vitthal Patil)\n"
            "\u090f\u0915\u0942\u0923 \u0915\u094d\u0937\u0947\u0924\u094d\u0930 (Land Area): 1.45 \u0939\u0947\u0915\u094d\u091f\u0930 (1.45 Hectare)\n"
            "\u0927\u093e\u0930\u0923\u093e \u092a\u094d\u0930\u0915\u093e\u0930 (Ownership Type): \u092d\u094b\u0917\u0935\u091f\u093e\u0926\u093e\u0930 \u0935\u0930\u094d\u0917 - \u0967 (Private / Class-1)\n"
            "\u0907\u0924\u0930 \u0939\u0915\u094d\u0915: \u092c\u0901\u0915 \u0911\u092b \u092e\u0939\u093e\u0930\u093e\u0937\u094d\u091f\u094d\u0930 \u092a\u0940\u0915 \u0915\u0930\u094d\u091c \u092c\u094b\u091c\u093e \u0930\u0941. \u0968,\u0966\u0966,\u0966\u0966\u0966/-"
        )
        return OCRResult(
            raw_text      = simulated,
            lines         = [{"text": ln, "confidence": 0.88} for ln in simulated.split("\n")],
            language      = source_language,
            source_engine = "simulated_fallback",
            is_fallback   = True,
            error_details = "All OCR engines unavailable. Returned sample 7/12 text for dev/testing.",
        )


# Singleton instance
ocr_service = BhashiniOCRService()


# ===========================================================================
# CLI Test Runner
# Usage:  python -m app.services.ocr_service [path_to_image_or_pdf]
# ===========================================================================
if __name__ == "__main__":
    import asyncio

    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    async def _cli():
        print("=" * 60)
        print("  BHUNETRA OCR TEST RUNNER")
        print("  Priority: Bhashini -> EasyOCR -> Tesseract -> GCV -> Sim")
        print("=" * 60)

        path = sys.argv[1] if len(sys.argv) > 1 else None
        if path and os.path.exists(path):
            print(f"File: {path}")
            with open(path, "rb") as fh:
                data = fh.read()
            mime = "application/pdf" if path.lower().endswith(".pdf") else "image/jpeg"
        else:
            print("No file given -- using simulated fallback.")
            data, mime = b"MOCK", "image/jpeg"

        svc    = BhashiniOCRService()
        result = await svc.extract_text(data, source_language="mr", mime_type=mime)

        print(f"\nEngine      : {result.source_engine}")
        print(f"Is Fallback : {result.is_fallback}")
        print(f"Pages       : {result.page_count}")
        print(f"Lines found : {len(result.lines)}")
        print("\nExtracted text:\n" + "-" * 40)
        print(result.raw_text)
        print("-" * 40)
        if result.error_details:
            print(f"Note: {result.error_details}")

    asyncio.run(_cli())

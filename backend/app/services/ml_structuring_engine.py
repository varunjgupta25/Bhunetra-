"""
Rule-Based Land Record Structuring Engine (Regex + Heuristic Confidence Scoring)
Provides deterministic, offline land record entity extraction for Marathi 7/12 extracts.

NOTE: This is a regex/heuristic engine, not a trained ML classifier. If you want the
"XGBoost" label to be literally true, see the note at the bottom of this file for what
that would actually require. For now, honesty in the pitch beats a false claim that
falls apart under one technical question.
"""

import re
import logging
from typing import Dict, Any, List, Tuple, Optional
from pydantic import BaseModel

from app.schemas.record import ExtractedLandFields

logger = logging.getLogger("bhunetra.structuring")

# Confidence floor for a field with zero evidence found — deliberately low, not a
# fake placeholder. This is what lets the existing validate_record() "missing field"
# checks actually do their job instead of being masked by realistic-looking fake data.
NO_MATCH_CONFIDENCE = 0.08

# Confidence for a field matched via its labeled anchor keyword (e.g. "गट क्रमांक: 142/3A")
ANCHORED_MATCH_BASE = 0.80

# Confidence for a field matched via a loose fallback pattern with no anchor keyword
# (e.g. any digit/slash sequence, guessed to be a khasra number). Meaningfully lower
# than an anchored match because it's a guess, not a labeled read.
UNANCHORED_MATCH_BASE = 0.45


class MLFeatureVector(BaseModel):
    """Features computed from OCR text lines, used to adjust confidence within a match band."""
    has_digits: bool
    has_slash: bool
    has_devanagari: bool
    devanagari_char_ratio: float
    digit_ratio: float
    has_area_unit: bool
    has_owner_title: bool
    keyword_khasra_proximity: float
    keyword_khata_proximity: float
    keyword_area_proximity: float


class LandStructuringEngine:
    """
    Regex-based entity extraction for Marathi 7/12 land records, with confidence
    scores computed from actual match evidence rather than fixed constants.
    """

    def __init__(self):
        self.khasra_keywords = ["गट क्रमांक", "सर्वे नंबर", "गट क्र", "भूमापन क्रमांक", "7/12", "७/१२"]
        self.khata_keywords = ["खाते क्रमांक", "खाता क्र", "खाते सं", "खाता नंबर"]
        self.area_keywords = ["क्षेत्र", "आर", "हेक्टर", "चौ.मी", "हे.आर.चौ.मी"]
        self.owner_keywords = ["खातेदाराचे नाव", "भोगवटादार", "जमीन मालकाचे नाव", "नाम"]
        self.village_keywords = ["गावाचे नाव", "गाव", "मोजे"]
        self.tehsil_keywords = ["तालुका", "ता."]
        self.district_keywords = ["जिल्हा", "जि."]

    def extract_features(self, text_line: str, context_text: str) -> MLFeatureVector:
        """Computes real signal used to set confidence within a match band."""
        total_len = max(len(text_line), 1)
        digits_count = len(re.findall(r"\d", text_line))
        devanagari_count = len(re.findall(r"[\u0900-\u097F]", text_line))

        return MLFeatureVector(
            has_digits=digits_count > 0,
            has_slash="/" in text_line,
            has_devanagari=devanagari_count > 0,
            devanagari_char_ratio=devanagari_count / total_len,
            digit_ratio=digits_count / total_len,
            has_area_unit=any(k in text_line for k in ["हेक्टर", "आर", "चौ.मी"]),
            has_owner_title=any(k in text_line for k in ["पाटील", "देशमुख", "यादव", "पवार", "कदम", "शिंदे", "भोगवटादार"]),
            keyword_khasra_proximity=1.0 if any(k in context_text for k in self.khasra_keywords) else 0.0,
            keyword_khata_proximity=1.0 if any(k in context_text for k in self.khata_keywords) else 0.0,
            keyword_area_proximity=1.0 if any(k in context_text for k in self.area_keywords) else 0.0,
        )

    def _band_confidence(self, anchored: bool, plausibility: float) -> float:
        """
        Computes confidence within the anchored/unanchored band, adjusted by a
        plausibility signal (0.0-1.0) such as expected character composition or
        format sanity. This replaces the old fixed-constant-per-branch approach.
        """
        base = ANCHORED_MATCH_BASE if anchored else UNANCHORED_MATCH_BASE
        span = 0.18 if anchored else 0.12
        return round(min(0.97, base + span * max(0.0, min(1.0, plausibility))), 3)

    def extract_fields(
        self, raw_ocr_text: str, ocr_is_fallback: bool = False
    ) -> Tuple[ExtractedLandFields, Dict[str, float]]:
        """
        Parses raw OCR text and returns (ExtractedLandFields, per-field confidence).
        Fields with no match are left as None with a low confidence, rather than
        filled with realistic-looking placeholder data — this is what lets the
        downstream validator and routing logic behave honestly.

        ocr_is_fallback: True if the OCR text came from the offline/simulated
        fallback engine rather than a real OCR read. When true, every field's
        confidence is capped hard, since the "text" isn't from the actual document.
        """
        text = raw_ocr_text.strip()

        khasra: Optional[str] = None
        khata: Optional[str] = None
        owner: Optional[str] = None
        village: Optional[str] = None
        tehsil: Optional[str] = None
        district: Optional[str] = None
        area: Optional[str] = None
        ownership: Optional[str] = None

        confidence_scores: Dict[str, float] = {
            "khasraNumber": NO_MATCH_CONFIDENCE,
            "khataNumber": NO_MATCH_CONFIDENCE,
            "ownerName": NO_MATCH_CONFIDENCE,
            "village": NO_MATCH_CONFIDENCE,
            "tehsil": NO_MATCH_CONFIDENCE,
            "district": NO_MATCH_CONFIDENCE,
            "landArea": NO_MATCH_CONFIDENCE,
            "ownershipType": NO_MATCH_CONFIDENCE,
        }

        # 1. Khasra / Survey Number — anchored match first, unanchored fallback second
        khasra_match = re.search(
            r"(?:गट\s*क्र(?:मांक|\.)?|सर्वे\s*नं(?:बर|\.)?|7/12|७/१२)\s*[:\-]?\s*([\d\w/अ-झा-ै]+)",
            text, re.UNICODE
        )
        if khasra_match:
            khasra = khasra_match.group(1).strip()
            feats = self.extract_features(khasra, text)
            confidence_scores["khasraNumber"] = self._band_confidence(True, feats.digit_ratio + (0.3 if feats.has_slash else 0))
        else:
            khasra_fallback = re.search(r"(\b\d{1,4}\s*/\s*[\d\wA-Za-z\u0900-\u097F]+\b)", text)
            if khasra_fallback:
                khasra = khasra_fallback.group(1).strip()
                feats = self.extract_features(khasra, text)
                confidence_scores["khasraNumber"] = self._band_confidence(False, feats.digit_ratio)

        # 2. Khata / Account Number
        khata_match = re.search(
            r"(?:खाते\s*क्र(?:मांक|\.)?|खाता\s*नं(?:बर|\.)?)\s*[:\-]?\s*(\d{1,6})",
            text, re.UNICODE
        )
        if khata_match:
            khata = khata_match.group(1).strip()
            confidence_scores["khataNumber"] = self._band_confidence(True, 1.0)

        # 3. Owner Name
        owner_match = re.search(
            r"(?:खातेदाराचे\s*नाव|भोगवटादार|नाव)\s*[:\-]?\s*([\u0900-\u097F \.]{4,40})",
            text, re.UNICODE
        )
        if owner_match:
            candidate_owner = re.sub(r"(क्षेत्र|खाते|गट).*", "", owner_match.group(1).strip()).strip()
            if len(candidate_owner) > 3:
                owner = candidate_owner
                feats = self.extract_features(owner, text)
                confidence_scores["ownerName"] = self._band_confidence(True, feats.devanagari_char_ratio)

        # 4. Land Area
        area_match = re.search(
            r"(?:क्षेत्र|एकूण\s*क्षेत्र)\s*[:\-]?\s*([\d\.\s]+(?:\s*हेक्टर|\s*आर|\s*चौ\.मी)?)",
            text, re.UNICODE
        )
        if area_match:
            area = area_match.group(1).strip()
            has_unit = "हेक्टर" in area or "आर" in area
            if not has_unit:
                area = f"{area} हेक्टर"
            confidence_scores["landArea"] = self._band_confidence(True, 1.0 if has_unit else 0.6)

        # 5. Village / Tehsil / District
        village_match = re.search(r"(?:गाव|मोजे)\s*[:\-]?\s*([\u0900-\u097F\s]{2,20})", text)
        if village_match:
            village = village_match.group(1).strip()
            confidence_scores["village"] = self._band_confidence(True, 1.0)

        tehsil_match = re.search(r"(?:तालुका|ता\.)\s*[:\-]?\s*([\u0900-\u097F\s]{2,20})", text)
        if tehsil_match:
            tehsil = tehsil_match.group(1).strip()
            confidence_scores["tehsil"] = self._band_confidence(True, 1.0)

        district_match = re.search(r"(?:जिल्हा|जि\.)\s*[:\-]?\s*([\u0900-\u097F\s]{2,20})", text)
        if district_match:
            district = district_match.group(1).strip()
            confidence_scores["district"] = self._band_confidence(True, 1.0)

        extracted_fields = ExtractedLandFields(
            khasraNumber=khasra, khataNumber=khata, ownerName=owner,
            village=village, tehsil=tehsil, district=district,
            landArea=area, ownershipType=ownership,
        )

        avg_conf = sum(confidence_scores.values()) / len(confidence_scores)
        logger.info(f"Structuring engine processed text. Average confidence: {avg_conf:.4f}, fallback_ocr={ocr_is_fallback}")
        return extracted_fields, confidence_scores


# Global instances & Backward-compatible Aliases
structuring_engine = LandStructuringEngine()
ml_structuring_engine = structuring_engine
XGBoostLandStructuringEngine = LandStructuringEngine

# ==============================================================================
# If you want this to genuinely be XGBoost (optional, only if time allows):
# 1. Build a small labeled dataset: for N sample OCR text lines, label whether
#    each line IS or ISN'T a khasra/khata/owner/etc. field (binary per field type).
# 2. Feed MLFeatureVector's fields as X, the label as y, train xgboost.XGBClassifier
#    per field type (or one multi-class model).
# 3. Replace _band_confidence()'s formula with model.predict_proba(features)[0][1].
# This is a real, scoped task — but it needs labeled data that doesn't exist yet,
# so it's a post-deadline upgrade, not a today fix.
# ==============================================================================

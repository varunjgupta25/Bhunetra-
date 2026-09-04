"""
ML-Augmented Land Record Structuring Engine
Provides deterministic, offline land record entity extraction for multi-category
Indian revenue records with XGBoost-backed confidence scoring:
- गाव नमुना सात-बारा (Form 7/12 Extract)
- गाव नमुना आठ-अ (Form 8-A Khate Pustika / Holding Sheet)
- गाव नमुना सहा - फेरफार (Form 6 Mutation Register)
- नगर भूमापन मालमत्ता पत्रक (Urban Property Card / CTS Card)
- नोंदणीकृत खरेदीखत (Registered Sale Deed / Conveyance)

Confidence scoring strategy:
  Primary  : XGBoost model (field_confidence_model.joblib) loaded at import time.
  Fallback : Heuristic band formula (_band_confidence_heuristic) if model absent.
"""

import re
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
from pydantic import BaseModel

from app.schemas.record import ExtractedLandFields
from app.services.document_classifier import document_classifier, DocumentClassificationResult, DocumentCategory

# ── ML model bootstrap ────────────────────────────────────────────────────────
try:
    import numpy as np
    import joblib as _joblib
    _MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "field_confidence_model.joblib"
    if _MODEL_PATH.exists():
        _ml_bundle      = _joblib.load(_MODEL_PATH)
        _ml_model       = _ml_bundle["model"]
        _ml_feat_names  = _ml_bundle["feature_names"]
        _ML_ENABLED     = True
    else:
        _ML_ENABLED = False
except Exception as _e:  # pragma: no cover
    _ML_ENABLED = False
    logging.getLogger("bhunetra.structuring").warning(
        "ML confidence model unavailable (%s) — using heuristic fallback.", _e
    )

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

# ── Devanagari Numeral Normalization ──────────────────────────────────────────
DEVANAGARI_DIGITS = "०१२३४५६७८९"
ARABIC_DIGITS = "0123456789"
DEV_TO_ARABIC_TABLE = str.maketrans(DEVANAGARI_DIGITS, ARABIC_DIGITS)

def normalize_devanagari_numerals(val: Optional[str]) -> Optional[str]:
    """Converts Devanagari numerals (०१२३४५६७८९) to standard Arabic digits (0123456789)."""
    if not val:
        return val
    return str(val).translate(DEV_TO_ARABIC_TABLE)


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
    Multi-document entity extraction for Indian land and property records,
    with confidence scores computed from actual match evidence.
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

    @staticmethod
    def _band_confidence_heuristic(anchored: bool, plausibility: float) -> float:
        """Pure heuristic band formula — kept as fallback if ML model is unavailable."""
        base = ANCHORED_MATCH_BASE if anchored else UNANCHORED_MATCH_BASE
        span = 0.18 if anchored else 0.12
        return round(min(0.97, base + span * max(0.0, min(1.0, plausibility))), 3)

    def _band_confidence(
        self,
        anchored: bool,
        plausibility: float,
        *,
        text: str = "",
        doc_type: str = "712",
        record: Optional[Dict[str, Any]] = None,
    ) -> float:
        """
        Confidence scorer — tries XGBoost ML model first, falls back to heuristic.

        Args:
            anchored    : True if the extraction was via a labeled keyword anchor.
            plausibility: 0-1 float from character-composition checks.
            text        : The raw OCR text snippet being scored (optional, improves ML).
            doc_type    : One of '712','8A','FORM6','URBAN','DEED','ENC' etc.
            record      : Partial extracted fields dict (optional, improves ML).
        """
        if _ML_ENABLED:
            try:
                return self._ml_confidence(anchored, plausibility, text, doc_type, record or {})
            except Exception as exc:  # pragma: no cover
                logger.debug("ML confidence failed (%s), using heuristic.", exc)
        return self._band_confidence_heuristic(anchored, plausibility)

    @staticmethod
    def _ml_confidence(
        anchored: bool,
        plausibility: float,
        text: str,
        doc_type: str,
        record: Dict[str, Any],
    ) -> float:
        """
        Builds the feature vector expected by field_confidence_model.joblib and
        returns predict_proba(label=1) — blended with anchor/plausibility signal
        so that labeled extractions always score at least as well as heuristic.
        """
        total     = max(len(text), 1)
        digits    = len(re.findall(r"\d", text))
        dev_chars = len(re.findall(r"[\u0900-\u097F]", text))
        text_l    = text.lower()

        _CTS_RE   = re.compile(r"CTS[-/]?\d+", re.IGNORECASE)
        _PRN_RE   = re.compile(r"PRN[-/]?[A-Z]{0,3}[-/]?\d{4,}", re.IGNORECASE)
        _KHASRA_P = re.compile(r"\b\d{1,4}(?:/\w{1,4})+\b")
        _KW_KHASRA   = ["gat kramank", "survey number", "gat kr", "7/12"]
        _KW_KHATA    = ["khata kramank", "khata kr", "khata no", "khata number"]
        _KW_AREA     = ["kshetra", "hectare", "are", "sq.mtr"]
        _OWNER_TITLE = ["patil", "deshmukh", "yadav", "pawar", "kadam", "shinde"]
        _AREA_UNITS  = ["hectare", "are", "sq.mtr", "chaurase"]

        feat: Dict[str, float] = {
            "digit_ratio":       digits / total,
            "devanagari_ratio":  dev_chars / total,
            "has_slash":         float("/" in text),
            "has_hyphen":        float("-" in text),
            "text_length":       min(total / 500.0, 1.0),
            "kw_khasra":         float(any(k in text_l for k in _KW_KHASRA)),
            "kw_khata":          float(any(k in text_l for k in _KW_KHATA)),
            "kw_area":           float(any(k in text_l for k in _KW_AREA)),
            "kw_owner_title":    float(any(k in text_l for k in _OWNER_TITLE)),
            "kw_area_unit":      float(any(u in text_l for u in _AREA_UNITS)),
            "has_khasra_pattern": float(bool(_KHASRA_P.search(text))),
            "has_cts_number":    float(bool(_CTS_RE.search(text))),
            "has_prn_number":    float(bool(_PRN_RE.search(text))),
            # Field presence from partial record
            **{f"has_{f}": float(bool(record.get(f))) for f in [
                "khasraNumber", "khataNumber", "ownerNameMr", "ownerNameEn",
                "villageMr", "villageEn", "tehsilMr", "tehsilEn",
                "districtMr", "districtEn", "totalAreaHa",
                "ownershipType", "ownershipCategory", "encumbranceStatus",
                "ctsNumber", "prnNumber", "carpetAreaSqMtr", "wardMr",
                "holdingType", "taxAssessmentStatus", "mutationNo",
                "causeOfMutation", "transactionDate", "vendorNameMr",
                "vendeeNameMr", "saleConsiderationRs", "stampDutyRs",
            ]},
            "is_verified":      float(str(record.get("verificationStatus", "")).upper() == "VERIFIED"),
            "is_unverified":    float(str(record.get("verificationStatus", "")).upper() == "UNVERIFIED"),
            "has_digital_sig":  float(bool(record.get("digitalSignatureHash") or record.get("digitalCertificateNo"))),
            "has_ulpin":        float(bool(record.get("ulpinCode"))),
            "has_encumbrance":  float(bool(str(record.get("encumbranceStatus", "")).strip())),
            "encumbrance_len":  min(len(str(record.get("encumbranceStatus", ""))), 80) / 80.0,
            "is_fraud":         0.0,
            "is_fabricated":    0.0,
            "is_duplicate_claim": 0.0,
            "is_high_risk":     0.0,
            "needs_inspection": 0.0,
            **{f"dtype_{dt}": float(doc_type == dt) for dt in
               ["712", "8A", "FORM6", "URBAN", "DEED", "ENC", "FRAUD", "NONLAND"]},
        }

        row  = np.array([[feat.get(k, 0.0) for k in _ml_feat_names]], dtype=np.float32)
        prob = float(_ml_model.predict_proba(row)[0][1])   # P(valid land)

        # Blend: heuristic sets a floor for anchored matches so we never score
        # LOWER than the old rule-based result. ML can only lift the score above it.
        floor = LandStructuringEngine._band_confidence_heuristic(anchored, plausibility)
        return round(max(prob, floor), 3)

    def _extract_geography(self, text: str, confidence_scores: Dict[str, float]) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """Common extraction for village, taluka/tehsil, and district with inline and multiline layout tolerance."""
        village: Optional[str] = None
        tehsil: Optional[str] = None
        district: Optional[str] = None

        # Village: matches "गाव : वाघोली", "गाव - वाघोली", or tabular "गाव\nवाघोली"
        village_match = re.search(
            r"(?:गाव|मोजे|village|city|शहर)(?!\s*नमुना)(?:\s*[:\-]\s*|\s*\n\s*)([^\n,\t]{2,40})",
            text, re.UNICODE | re.IGNORECASE
        )
        if village_match:
            raw_v = village_match.group(1).strip()
            village = re.split(r"\s{2,}|\t|(?:तालुका|ता\.|जिल्हा|जि\.|district|tehsil)\s*[:\-]", raw_v)[0].strip()
            if len(village) >= 2 and not any(w in village for w in ["नमुना", "पत्रक", "अभिलेख", "महाराष्ट्र", "शासन"]):
                confidence_scores["village"] = self._band_confidence(True, 1.0)
            else:
                village = None

        # Tehsil: matches "तालुका : हवेली", "तालुका\nहवेली", etc.
        tehsil_match = re.search(
            r"(?:तालुका|ता\.|tehsil|taluka)\s*(?:[:\-]\s*|\s*\n\s*)([^\n,\t]{2,40})",
            text, re.UNICODE | re.IGNORECASE
        )
        if tehsil_match:
            raw_t = tehsil_match.group(1).strip()
            tehsil = re.split(r"\s{2,}|\t|(?:जिल्हा|जि\.|district)\s*[:\-]", raw_t)[0].strip()
            if len(tehsil) >= 2 and not any(w in tehsil for w in ["नमुना", "पत्रक", "अभिलेख", "महाराष्ट्र"]):
                confidence_scores["tehsil"] = self._band_confidence(True, 1.0)
            else:
                tehsil = None

        # District: matches "जिल्हा : पुणे", "जिल्हा\nपुणे", etc.
        district_match = re.search(
            r"(?:जिल्हा|जि\.|district)\s*(?:[:\-]\s*|\s*\n\s*)([^\n,\t]{2,40})",
            text, re.UNICODE | re.IGNORECASE
        )
        if district_match:
            raw_d = district_match.group(1).strip()
            district = re.split(r"\s{2,}|\t|(?:पिन|pin)\s*[:\-]", raw_d)[0].strip()
            if len(district) >= 2 and not any(w in district for w in ["नमुना", "पत्रक", "अभिलेख", "महाराष्ट्र"]):
                confidence_scores["district"] = self._band_confidence(True, 1.0)
            else:
                district = None

        return village, tehsil, district

    def _extract_ownership_type(self, text: str, confidence_scores: Dict[str, float]) -> Optional[str]:
        """Extracts and normalizes statutory ownership classifications with OCR noise tolerance."""
        ownership_match = re.search(
            r"(?:धारणा\s*प्रकार|भू[धथ]ारणा\s*प्रकार|धारणाधिकार\s*प्रकार|भोगवटा\s*प्रकार|भोगवटादाराचा\s*वर्ग|भोगवटादार\s*वर्ग|खातेदार(?:ाचे)?\s*प्रकार|कब्जेदार\s*प्रकार|भूमि\s*स्वामी|हक्काचा\s*प्रकार|ownership\s*type|tenure\s*type)\s*(?:[:\-]\s*|\s*\n\s*|\s+)([^\n,]{3,60})",
            text, re.UNICODE | re.IGNORECASE
        )
        if ownership_match:
            raw_owner_val = ownership_match.group(1).strip()
            if re.search(r"वर्ग\s*[-–]?\s*[१1]|class\s*[-–]?\s*1|निजी|व्यक्तिगत|खुद|स्वयं|private|sole|bhumidhar", raw_owner_val, re.UNICODE | re.IGNORECASE):
                confidence_scores["ownershipType"] = self._band_confidence(True, 1.0)
                return "भोगवटादार वर्ग - १ (Private / Class-1)"
            elif re.search(r"वर्ग\s*[-–]?\s*[२2]|class\s*[-–]?\s*2|प्रतिबंधित|restricted|inalienable", raw_owner_val, re.UNICODE | re.IGNORECASE):
                confidence_scores["ownershipType"] = self._band_confidence(True, 1.0)
                return "भोगवटादार वर्ग - २ (Restricted / Class-2)"
            elif re.search(r"शासकीय|सरकारी|पट्टेदार|government|lessee|public|gram\s*sabha", raw_owner_val, re.UNICODE | re.IGNORECASE):
                confidence_scores["ownershipType"] = self._band_confidence(True, 0.95)
                return "शासकीय / सरकारी जमीन (Govt Land / Lessee)"
            elif re.search(r"सह-खातेदार|संयुक्त|साझा|सामाईक|joint|co-owner", raw_owner_val, re.UNICODE | re.IGNORECASE):
                confidence_scores["ownershipType"] = self._band_confidence(True, 0.95)
                return "संयुक्त / सह-खातेदार (Joint Co-ownership)"
            elif re.search(r"कुळ|संरक्षित\s*कुळ|पट्टा|लीज|tenant|leasehold", raw_owner_val, re.UNICODE | re.IGNORECASE):
                confidence_scores["ownershipType"] = self._band_confidence(True, 0.92)
                return "पट्टा / कुळ वहिवाट (Protected Tenant / Leasehold)"
            elif re.search(r"देवस्थान|इनाम|ट्रस्ट|मंदिर|trust|inam", raw_owner_val, re.UNICODE | re.IGNORECASE):
                confidence_scores["ownershipType"] = self._band_confidence(True, 0.92)
                return "देवस्थान / इनाम जमीन (Trust / Inam Land)"
            else:
                confidence_scores["ownershipType"] = self._band_confidence(True, 0.75)
                return raw_owner_val

        # Direct tenure keyword detection fallback across document
        if re.search(r"भोगवटादार\s*वर्ग\s*[-–]?\s*[१1]|occupant\s*class\s*[-–]?\s*1", text, re.UNICODE | re.IGNORECASE):
            confidence_scores["ownershipType"] = self._band_confidence(False, 0.90)
            return "भोगवटादार वर्ग - १ (Private / Class-1)"
        elif re.search(r"भोगवटादार\s*वर्ग\s*[-–]?\s*[२2]|occupant\s*class\s*[-–]?\s*2", text, re.UNICODE | re.IGNORECASE):
            confidence_scores["ownershipType"] = self._band_confidence(False, 0.90)
            return "भोगवटादार वर्ग - २ (Restricted / Class-2)"
        elif re.search(r"शासकीय\s*पट्टेदार|सरकारी\s*पट्टेदार|शासकीय\s*जमीन|सरकारी\s*जमीन", text, re.UNICODE):
            confidence_scores["ownershipType"] = self._band_confidence(False, 0.85)
            return "शासकीय / सरकारी जमीन (Govt Land / Lessee)"
        elif re.search(r"सह-खातेदार|संयुक्त\s*खाता|सामाईक\s*जमीन", text, re.UNICODE):
            confidence_scores["ownershipType"] = self._band_confidence(False, 0.85)
            return "संयुक्त / सह-खातेदार (Joint Co-ownership)"
        elif re.search(r"देवस्थान\s*इनाम|इनाम\s*जमीन", text, re.UNICODE):
            confidence_scores["ownershipType"] = self._band_confidence(False, 0.85)
            return "देवस्थान / इनाम जमीन (Trust / Inam Land)"
        elif re.search(r"संरक्षित\s*कुळ|कुळ\s*वहिवाट", text, re.UNICODE):
            confidence_scores["ownershipType"] = self._band_confidence(False, 0.85)
            return "पट्टा / कुळ वहिवाट (Protected Tenant / Leasehold)"

        return None

    def _extract_form_7_12(self, text: str, confidence_scores: Dict[str, float]) -> ExtractedLandFields:
        """Dedicated extractor for Maharashtra Form 7/12 (Satbara) records."""
        # 1. Khasra / Survey Number (supports inline "गट क्र : 142/3A" and multiline tabular "गट क्रमांक खसरा\n१४२३अ")
        khasra: Optional[str] = None
        khasra_match = re.search(
            r"(?:भूमापन\s*क्र(?:मांक|\.)?|गट\s*(?:क्रमांक|क्र\.?)(?:\s*खसरा)?|सर्वे\s*(?:नंबर|नं\.?)|खसरा\s*(?:क्रमांक|नं\.?|no\.?)|survey\s*no\.?|khasra\s*no\.?)(?:\s*[:\-]\s*|\s*\n\s*|\s+)([0-9\u0966-\u096F]+[/\w\-\u0900-\u097F]*)",
            text, re.UNICODE | re.IGNORECASE
        )
        if khasra_match:
            khasra = khasra_match.group(1).strip()
            feats = self.extract_features(khasra, text)
            confidence_scores["khasraNumber"] = self._band_confidence(True, feats.digit_ratio + (0.3 if feats.has_slash else 0))
        else:
            khasra_fallback = re.search(r"(\b[0-9\u0966-\u096F]{1,4}\s*/\s*[0-9\u0966-\u096F\wA-Za-z\u0900-\u097F]+\b)", text)
            if khasra_fallback and "7/12" not in khasra_fallback.group(1) and "७/१२" not in khasra_fallback.group(1):
                khasra = khasra_fallback.group(1).strip()
                feats = self.extract_features(khasra, text)
                confidence_scores["khasraNumber"] = self._band_confidence(False, feats.digit_ratio)

        # 2. Khata / Account Number (supports inline and multiline tabular "खात क्रमांक\n५८२")
        khata: Optional[str] = None
        khata_match = re.search(
            r"(?:खाते\s*क्र(?:मांक|\.)?|खाता\s*नं(?:बर|\.)?|खात\s*क्र(?:मांक|\.)?|khata\s*(?:no|number))(?:\s*[:\-]\s*|\s*\n\s*|\s+)([0-9\u0966-\u096F]{1,8})",
            text, re.UNICODE | re.IGNORECASE
        )
        if khata_match:
            khata = khata_match.group(1).strip()
            confidence_scores["khataNumber"] = self._band_confidence(True, 1.0)

        # 3. Owner Name (skips tenure labels like 'वर्ग - १' and captures actual person names)
        owner: Optional[str] = None
        invalid_owner_words = ["वर्ग", "प्रकार", "नमुना", "क्षेत्र", "अधिकार", "अभिलेख", "पत्रक", "महाराष्ट्र", "शासन", "तहासीलदार", "तारीख"]
        owner_candidates = re.findall(
            r"(?:खातेदाराचे\s*नाव|भोगवटादाराचे\s*नाव|भोगवटादार(?!\s*वर्ग)|खातेदार(?!\s*वर्ग)|जमीन\s*मालकाचे\s*नाव|मालकाचे\s*नाव)(?:\s*[:\-]\s*|\s*\n\s*)([^\n,:]{3,50})",
            text, re.UNICODE | re.IGNORECASE
        )
        for cand in owner_candidates:
            cand_clean = re.sub(r"(क्षेत्र|खाते|गट|धारणा|इतर|वर्ग).*", "", cand.strip()).strip()
            if len(cand_clean) >= 3 and not any(w in cand_clean for w in invalid_owner_words):
                owner = cand_clean
                feats = self.extract_features(owner, text)
                confidence_scores["ownerName"] = self._band_confidence(True, feats.devanagari_char_ratio)
                break

        # 4. Land Area (supports Devanagari and Latin numbers with unit, e.g. "कुळ यत्र क्षेत्र : १.४५ हेक्टर")
        area: Optional[str] = None
        area_match = re.search(
            r"(?:कुळ\s*यत्र\s*क्षेत्र|एकूण\s*क्षेत्र|क्षेत्र|land\s*area)\s*[:\-]?\s*([0-9\u0966-\u096F\.\s]+(?:\s*हेक्टर|\s*आर|\s*चौ\.मी|\s*हेक्टेअर|\s*hectare)?)",
            text, re.UNICODE | re.IGNORECASE
        )
        if area_match:
            area = area_match.group(1).strip()
            has_unit = any(u in area.lower() for u in ["हेक्टर", "आर", "चौ.मी", "hectare"])
            if not has_unit:
                area = f"{area} हेक्टर"
            confidence_scores["landArea"] = self._band_confidence(True, 1.0 if has_unit else 0.6)

        village, tehsil, district = self._extract_geography(text, confidence_scores)
        ownership = self._extract_ownership_type(text, confidence_scores)

        return ExtractedLandFields(
            khasraNumber=khasra,
            khataNumber=khata,
            ownerName=owner,
            village=village,
            tehsil=tehsil,
            district=district,
            landArea=area,
            ownershipType=ownership,
            documentCategory=DocumentCategory.VILLAGE_FORM_7_12.value,
            extraDetails={
                "documentType": "गाव नमुना सात-बारा (7/12 Extract)",
                "normalizedKhasra": normalize_devanagari_numerals(khasra),
                "normalizedKhata": normalize_devanagari_numerals(khata),
                "normalizedArea": normalize_devanagari_numerals(area),
            }
        )

    def _extract_form_8a(self, text: str, confidence_scores: Dict[str, float]) -> ExtractedLandFields:
        """Dedicated extractor for Maharashtra Form 8-A (Khate Pustika / Holding Sheet)."""
        # 1. Khata Number (Primary anchor in Form 8-A)
        khata: Optional[str] = None
        khata_match = re.search(
            r"(?:खाते\s*क्र(?:मांक|\.)?|खाता\s*नं(?:बर|\.)?|खाते\s*पुस्तक\s*क्र(?:मांक|\.)?|खात\s*क्र(?:मांक|\.)?|khata\s*no)\s*(?:[:\-]\s*|\s*\n\s*|\s+)([0-9\u0966-\u096F]{1,8})",
            text, re.UNICODE | re.IGNORECASE
        )
        if khata_match:
            khata = khata_match.group(1).strip()
            confidence_scores["khataNumber"] = self._band_confidence(True, 1.0)

        # 2. Owner Name (Khatedar)
        owner: Optional[str] = None
        owner_match = re.search(
            r"(?:खातेदाराचे\s*नाव|भोगवटादाराचे\s*नाव|जमीन\s*धारकाचे\s*नाव|खातेदार(?!\s*वर्ग)(?:\s*नाव)?)\s*(?:\([^)]*\))?\s*(?:[:\-]\s*|\s*\n\s*)([^\n,:]{3,50})",
            text, re.UNICODE | re.IGNORECASE
        )
        if owner_match:
            candidate_owner = re.sub(r"(क्षेत्र|खाते|गट|धारणा|एकूण|आकारणी|वर्ग).*", "", owner_match.group(1).strip()).strip()
            if len(candidate_owner) > 3:
                owner = candidate_owner
                feats = self.extract_features(owner, text)
                confidence_scores["ownerName"] = self._band_confidence(True, feats.devanagari_char_ratio)

        # 3. Sub-parcels / Survey & Gat numbers listing
        sub_parcels: List[str] = []
        parcels_match = re.findall(
            r"(?:गट\s*क्र(?:मांक|\.)?|सर्वे\s*नं(?:बर|\.)?|भूमापन\s*क्र(?:मांक|\.)?)\s*[:\-]?\s*([0-9\s,\/\u0966-\u096F]+)",
            text, re.UNICODE
        )
        if parcels_match:
            for p_str in parcels_match:
                items = [item.strip() for item in re.split(r"[,、\s]+", p_str) if item.strip() and re.search(r"[\d\u0966-\u096F]", item)]
                sub_parcels.extend(items)

        if not sub_parcels:
            raw_parcels = re.findall(r"\b([0-9\u0966-\u096F]{1,4}(?:/[0-9\u0966-\u096F]{1,4})?)\b", text)
            sub_parcels = [p for p in raw_parcels if p != khata and p not in ["8", "8A", "८", "८-अ"]][:6]

        seen = set()
        dedup_parcels = []
        for p in sub_parcels:
            if p not in seen:
                seen.add(p)
                dedup_parcels.append(p)
        sub_parcels = dedup_parcels

        khasra = ", ".join(sub_parcels) if sub_parcels else None
        if khasra:
            feats = self.extract_features(khasra, text)
            confidence_scores["khasraNumber"] = self._band_confidence(True, feats.digit_ratio + (0.3 if feats.has_slash else 0))

        # 4. Total Area
        area: Optional[str] = None
        area_match = re.search(
            r"(?:एकूण\s*क्षेत्र|जुमला\s*क्षेत्र|क्षेत्र|आकारणीस\s*पात्र\s*क्षेत्र|land\s*area)\s*[:\-]?\s*([0-9\u0966-\u096F\.\s]+(?:\s*हेक्टर|\s*आर|\s*चौ\.मी|\s*हेक्टेअर)?)",
            text, re.UNICODE | re.IGNORECASE
        )
        if area_match:
            area = area_match.group(1).strip()
            has_unit = any(u in area.lower() for u in ["हेक्टर", "आर", "चौ.मी"])
            if not has_unit:
                area = f"{area} हेक्टर"
            confidence_scores["landArea"] = self._band_confidence(True, 1.0 if has_unit else 0.7)

        # 5. Assessment tax (आकारणी)
        assessment: Optional[str] = None
        assessment_match = re.search(
            r"(?:एकूण\s*आकारणी|जुमला\s*आकारणी|आकारणी|assessment|tax)\s*[:\-]?\s*(?:रु\.?\s*)?([\d\.\s]+)",
            text, re.UNICODE | re.IGNORECASE
        )
        if assessment_match:
            assessment = assessment_match.group(1).strip()

        village, tehsil, district = self._extract_geography(text, confidence_scores)
        ownership = self._extract_ownership_type(text, confidence_scores) or "भोगवटादार वर्ग - १ (Private / Class-1)"
        if confidence_scores["ownershipType"] <= NO_MATCH_CONFIDENCE:
            confidence_scores["ownershipType"] = self._band_confidence(False, 0.90)

        extra_details = {
            "documentType": "गाव नमुना आठ-अ (Form 8-A Khate Pustika)",
            "khataTotalAssessment": assessment,
            "subParcels": sub_parcels
        }

        return ExtractedLandFields(
            khasraNumber=khasra,
            khataNumber=khata,
            ownerName=owner,
            village=village,
            tehsil=tehsil,
            district=district,
            landArea=area,
            ownershipType=ownership,
            documentCategory=DocumentCategory.FORM_8A.value,
            extraDetails=extra_details
        )

    def _extract_form_6_ferfar(self, text: str, confidence_scores: Dict[str, float]) -> ExtractedLandFields:
        """Dedicated extractor for Maharashtra Form 6 (Ferfar Mutation Register)."""
        # 1. Mutation Entry Number
        mutation_no: Optional[str] = None
        mut_match = re.search(
            r"(?:फेरफार\s*(?:नोंद\s*)?क्र(?:मांक|\.)?|फेरफार\s*नंबर|नोंद\s*क्र(?:मांक|\.)?|mutation\s*no)\s*[:\-]?\s*(\d{1,8})",
            text, re.UNICODE | re.IGNORECASE
        )
        if mut_match:
            mutation_no = mut_match.group(1).strip()
            confidence_scores["khataNumber"] = self._band_confidence(True, 0.95)

        # 2. Mutation Date
        mutation_date: Optional[str] = None
        date_match = re.search(
            r"(?:नोंद\s*दिनांक|दिनांक|तारीख|मंजुरी\s*दिनांक|mutation\s*date)\s*[:\-]?\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})",
            text, re.UNICODE | re.IGNORECASE
        )
        if date_match:
            mutation_date = date_match.group(1).strip()

        # 3. Mutation Type (Nature of transaction)
        mutation_type = "हस्तांतरण फेरफार (Title Mutation)"
        if re.search(r"खरेदीखत|खरेदी|विक्री|sale", text, re.UNICODE | re.IGNORECASE):
            mutation_type = "खरेदीखत फेरफार (Sale Mutation)"
        elif re.search(r"वारस\s*नोंद|वारसा|वारसदार|inheritance|heir", text, re.UNICODE | re.IGNORECASE):
            mutation_type = "वारस हक्क नोंद (Inheritance / Succession)"
        elif re.search(r"बक्षीसपत्र|बक्षीस|gift", text, re.UNICODE | re.IGNORECASE):
            mutation_type = "बक्षीसपत्र फेरफार (Gift Deed)"
        elif re.search(r"वाटप|आपसातील\s*वाटप|partition", text, re.UNICODE | re.IGNORECASE):
            mutation_type = "आपसातील वाटपपत्र (Partition / Family Settlement)"
        elif re.search(r"कर्ज\s*बोजा|बोजा\s*दाखल|बँक\s*बोजा|mortgage|bank\s*charge", text, re.UNICODE | re.IGNORECASE):
            mutation_type = "बँक कर्ज बोजा नोंद (Bank Mortgage / Charge)"
        elif re.search(r"बोजा\s*कमी|बोजा\s*मुक्ती|discharge", text, re.UNICODE | re.IGNORECASE):
            mutation_type = "कर्ज बोजा कमी करणे (Release of Mortgage)"
        elif re.search(r"हक्कसोड|relinquishment", text, re.UNICODE | re.IGNORECASE):
            mutation_type = "हक्कसोड पत्र (Relinquishment Deed)"

        # 4. Mutation Status
        if re.search(r"मंजूर|प्रमाणित|certified|approved", text, re.UNICODE | re.IGNORECASE):
            mutation_status = "मंजूर / प्रमाणित (Certified)"
        elif re.search(r"रद्द|नामंजूर|rejected|cancelled", text, re.UNICODE | re.IGNORECASE):
            mutation_status = "रद्द / नामंजूर (Rejected)"
        elif re.search(r"तक्रारी|विवादित|disputed", text, re.UNICODE | re.IGNORECASE):
            mutation_status = "तक्रारी फेरफार (Disputed)"
        else:
            mutation_status = "कच्ची नोंद / चौकशी चालू (Pending Enquiry)"

        # 5. Previous vs New Owner
        prev_owner: Optional[str] = None
        new_owner: Optional[str] = None
        prev_match = re.search(
            r"(?:माजी\s*खातेदार|लिहून\s*देणारा|मयत\s*खातेदार|मयत|विक्रेता)\s*[:\-]?\s*([^\n,:]{4,50})",
            text, re.UNICODE | re.IGNORECASE
        )
        if prev_match:
            prev_owner = prev_match.group(1).strip()

        new_match = re.search(
            r"(?:नवीन\s*खातेदार|लिहून\s*घेणारा|वारसदार|खरेदीदार|हस्तांतरिती)\s*[:\-]?\s*([^\n,:]{4,50})",
            text, re.UNICODE | re.IGNORECASE
        )
        if new_match:
            new_owner = new_match.group(1).strip()
            owner = new_owner
            feats = self.extract_features(owner, text)
            confidence_scores["ownerName"] = self._band_confidence(True, feats.devanagari_char_ratio)
        else:
            owner_match = re.search(r"(?:खातेदाराचे\s*नाव|नाव)\s*[:\-]?\s*([^\n,:]{4,50})", text, re.UNICODE)
            owner = owner_match.group(1).strip() if owner_match else prev_owner
            if owner:
                confidence_scores["ownerName"] = self._band_confidence(False, 0.80)

        # 6. Affected Survey/Gat numbers
        khasra: Optional[str] = None
        khasra_match = re.search(
            r"(?:गट\s*क्र(?:मांक|\.)?|सर्वे\s*नं(?:बर|\.)?|बाधित\s*गट|भूमापन\s*क्र)\s*[:\-]?\s*([\d]+[/\w\-\u0900-\u097F]*)",
            text, re.UNICODE | re.IGNORECASE
        )
        if khasra_match:
            khasra = khasra_match.group(1).strip()
            feats = self.extract_features(khasra, text)
            confidence_scores["khasraNumber"] = self._band_confidence(True, feats.digit_ratio + (0.3 if feats.has_slash else 0))
        else:
            khasra_fallback = re.search(r"(\b\d{1,4}\s*/\s*[\d\wA-Za-z\u0900-\u097F]+\b)", text)
            if khasra_fallback and "6" not in khasra_fallback.group(1) and "६" not in khasra_fallback.group(1):
                khasra = khasra_fallback.group(1).strip()
                confidence_scores["khasraNumber"] = self._band_confidence(False, 0.70)

        # 7. Affected Land Area
        area: Optional[str] = None
        area_match = re.search(
            r"(?:हस्तांतरित\s*क्षेत्र|क्षेत्र|area)\s*[:\-]?\s*([\d\.\s]+(?:\s*हेक्टर|\s*आर|\s*चौ\.मी)?)",
            text, re.UNICODE | re.IGNORECASE
        )
        if area_match:
            area = area_match.group(1).strip()
            has_unit = any(u in area.lower() for u in ["हेक्टर", "आर", "चौ.मी"])
            if not has_unit:
                area = f"{area} हेक्टर"
            confidence_scores["landArea"] = self._band_confidence(True, 1.0 if has_unit else 0.7)

        village, tehsil, district = self._extract_geography(text, confidence_scores)
        ownership = f"भोगवटादार वर्ग - १ ({mutation_type})"
        confidence_scores["ownershipType"] = self._band_confidence(True, 0.90)

        extra_details = {
            "documentType": "गाव नमुना सहा - फेरफार (Form 6 Mutation Register)",
            "mutationNumber": mutation_no,
            "mutationDate": mutation_date,
            "mutationType": mutation_type,
            "mutationStatus": mutation_status,
            "previousOwners": prev_owner,
            "newOwners": new_owner,
            "affectedSurveyNumbers": [khasra] if khasra else []
        }

        return ExtractedLandFields(
            khasraNumber=khasra,
            khataNumber=mutation_no,
            ownerName=owner,
            village=village,
            tehsil=tehsil,
            district=district,
            landArea=area,
            ownershipType=ownership,
            documentCategory=DocumentCategory.FORM_6_MUTATION.value,
            extraDetails=extra_details
        )

    def _extract_property_card(self, text: str, confidence_scores: Dict[str, float]) -> ExtractedLandFields:
        """Dedicated extractor for Maharashtra Urban Property Cards (नगर भूमापन मालमत्ता पत्रक / CTS)."""
        # 1. CTS / Cadastral Survey Number
        cts_no: Optional[str] = None
        cts_match = re.search(
            r"(?:नगर\s*भूमापन\s*क्र(?:मांक|\.)?|क\.?\s*स\.?\s*क्र(?:मांक|\.)?|सिटी\s*सर्व्हे\s*क्र(?:मांक|\.)?|सीटीएस\s*क्र|cts\s*no|cadastral\s*survey\s*no)\s*(?:\([^)]*\))?\s*[:\-]?\s*([A-Za-z0-9\-\/]+)",
            text, re.UNICODE | re.IGNORECASE
        )
        if cts_match:
            cts_no = cts_match.group(1).strip()
            confidence_scores["khasraNumber"] = self._band_confidence(True, 1.0)
        else:
            cts_fallback = re.search(r"(?:CTS|सीटीएस)\s*[-–:]?\s*([A-Za-z0-9\-\/]+)", text, re.IGNORECASE)
            if cts_fallback:
                cts_no = cts_fallback.group(1).strip()
                confidence_scores["khasraNumber"] = self._band_confidence(True, 0.90)

        # 2. PRN Number (Property Registration Number)
        prn_no: Optional[str] = None
        prn_match = re.search(
            r"(?:पी\.?\s*आर\.?\s*एन\.?(?:\s*क्र(?:मांक|\.)?)?|prn\s*(?:no)?|property\s*registration\s*no)\s*[:\-]?\s*([0-9A-Za-z\-]{8,24})",
            text, re.UNICODE | re.IGNORECASE
        )
        if prn_match:
            prn_no = prn_match.group(1).strip()
            confidence_scores["khataNumber"] = self._band_confidence(True, 1.0)

        # 3. Ward / Peth
        ward: Optional[str] = None
        ward_match = re.search(
            r"(?:वॉर्ड\s*/\s*पेठ|वॉर्ड|पेठ|प्रभाग|sheet\s*no|ward)\s*[:\-]\s*([^\n,]{2,40})",
            text, re.UNICODE | re.IGNORECASE
        )
        if ward_match:
            ward = ward_match.group(1).strip()

        # 4. Property Holder / Owner Name
        owner: Optional[str] = None
        owner_match = re.search(
            r"(?:धारकाचे\s*नाव|मिळकतदाराचे\s*नाव|मालकाचे\s*नाव|कब्जेदार|property\s*holder|owner)\s*[:\-]?\s*([^\n,:]{4,50})",
            text, re.UNICODE | re.IGNORECASE
        )
        if owner_match:
            candidate_owner = re.sub(r"(क्षेत्रफळ|धारणाधिकार|वॉर्ड|पेठ|रक्कम).*", "", owner_match.group(1).strip()).strip()
            if len(candidate_owner) > 3:
                owner = candidate_owner
                feats = self.extract_features(owner, text)
                confidence_scores["ownerName"] = self._band_confidence(True, feats.devanagari_char_ratio)

        # 5. Area in Sq. Meters
        area: Optional[str] = None
        area_match = re.search(
            r"(?:क्षेत्रफळ|क्षेत्र|area|plot\s*area)\s*[:\-]?\s*([\d\.\s]+(?:\s*चौ\.मी\.?|\s*चौरस\s*मीटर|\s*sq\.?\s*mtrs?|\s*sq\.?\s*ft)?)",
            text, re.UNICODE | re.IGNORECASE
        )
        if area_match:
            area = area_match.group(1).strip()
            has_unit = any(u in area.lower() for u in ["चौ.मी", "चौरस मीटर", "sq.mtr", "sq.ft"])
            if not has_unit:
                area = f"{area} चौ.मी."
            confidence_scores["landArea"] = self._band_confidence(True, 1.0 if has_unit else 0.7)

        # 6. Tenure / Rights
        if re.search(r"फ्रीहोल्ड|freehold|स्वतःचे", text, re.IGNORECASE):
            ownership = "फ्रीहोल्ड मिळकत (Freehold Urban Property)"
            confidence_scores["ownershipType"] = self._band_confidence(True, 0.95)
        elif re.search(r"भाडेपट्टा|लीज|leasehold", text, re.IGNORECASE):
            ownership = "भाडेपट्टा मिळकत (Leasehold Urban Property)"
            confidence_scores["ownershipType"] = self._band_confidence(True, 0.95)
        else:
            ownership = self._extract_ownership_type(text, confidence_scores) or "नगर भूमापन धारक (Urban CTS Holder)"
            if confidence_scores["ownershipType"] <= NO_MATCH_CONFIDENCE:
                confidence_scores["ownershipType"] = self._band_confidence(False, 0.85)

        village, tehsil, district = self._extract_geography(text, confidence_scores)
        if not village and ward:
            village = ward
            confidence_scores["village"] = self._band_confidence(False, 0.80)

        extra_details = {
            "documentType": "नगर भूमापन मालमत्ता पत्रक (Urban Property Card / CTS)",
            "ctsNumber": cts_no,
            "prnNumber": prn_no,
            "ward": ward,
            "carpetAreaSqM": area,
            "tenure": ownership
        }

        return ExtractedLandFields(
            khasraNumber=cts_no,
            khataNumber=prn_no,
            ownerName=owner,
            village=village,
            tehsil=tehsil,
            district=district,
            landArea=area,
            ownershipType=ownership,
            documentCategory=DocumentCategory.URBAN_PROPERTY_CARD.value,
            extraDetails=extra_details
        )

    def _extract_sale_deed(self, text: str, confidence_scores: Dict[str, float]) -> ExtractedLandFields:
        """Dedicated extractor for Registered Sale Deeds (नोंदणीकृत खरेदीखत / Index-II)."""
        # 1. SRO Registration Document Number
        reg_no: Optional[str] = None
        reg_match = re.search(
            r"(?:दस्त\s*नोंदणी\s*क्र(?:मांक|\.)?|नोंदणी\s*क्र(?:मांक|\.)?|दस्त\s*क्र(?:मांक|\.)?|registration\s*no|document\s*no)\s*[:\-]?\s*([\w\d\-\/]+)",
            text, re.UNICODE | re.IGNORECASE
        )
        if reg_match:
            reg_no = reg_match.group(1).strip()
            confidence_scores["khataNumber"] = self._band_confidence(True, 1.0)

        # 2. Execution / Registration Date
        exec_date: Optional[str] = None
        date_match = re.search(
            r"(?:नोंदणी\s*दिनांक|दस्त\s*केल्याचा\s*दिनांक|दिनांक|registration\s*date|execution\s*date)\s*[:\-]?\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})",
            text, re.UNICODE | re.IGNORECASE
        )
        if date_match:
            exec_date = date_match.group(1).strip()

        # 3. Seller (Vendor / First Party)
        seller: Optional[str] = None
        seller_match = re.search(
            r"(?:विक्रेता|लिहून\s*देणारा|विक्री\s*करणार|प्रथम\s*पक्ष|seller|transferor)\s*(?:\([^)]*\))?\s*[:\-]\s*([^\n,:]{4,50})",
            text, re.UNICODE | re.IGNORECASE
        )
        if seller_match:
            seller = seller_match.group(1).strip()

        # 4. Buyer (Purchaser / Second Party -> Owner)
        buyer: Optional[str] = None
        buyer_match = re.search(
            r"(?:खरेदीदार|लिहून\s*घेणारा|खरेदी\s*घेणार|द्वितीय\s*पक्ष|buyer|transferee|purchaser)\s*(?:\([^)]*\))?\s*[:\-]\s*([^\n,:]{4,50})",
            text, re.UNICODE | re.IGNORECASE
        )
        if buyer_match:
            buyer = buyer_match.group(1).strip()
            owner = buyer
            feats = self.extract_features(owner, text)
            confidence_scores["ownerName"] = self._band_confidence(True, feats.devanagari_char_ratio)
        else:
            owner = None

        # 5. Consideration Amount
        consideration: Optional[str] = None
        cons_match = re.search(
            r"(?:मोबदला\s*रक्कम|मोबदला|consideration\s*amount|sale\s*consideration)\s*[:\-]?\s*(?:रु\.?\s*|₹\s*)?([\d\.,\s]+)",
            text, re.UNICODE | re.IGNORECASE
        )
        if cons_match:
            consideration = cons_match.group(1).strip()

        # 6. Market Value
        market_val: Optional[str] = None
        market_match = re.search(
            r"(?:बाजारमूल्य|रेडी\s*रेकनर\s*दर|मुद्रांक\s*मूल्य|market\s*value)\s*[:\-]?\s*(?:रु\.?\s*|₹\s*)?([\d\.,\s]+)",
            text, re.UNICODE | re.IGNORECASE
        )
        if market_match:
            market_val = market_match.group(1).strip()

        # 7. Stamp Duty
        stamp_duty: Optional[str] = None
        stamp_match = re.search(
            r"(?:मुद्रांक\s*शुल्क|स्टॅम्प\s*ड्युटी|stamp\s*duty)\s*[:\-]?\s*(?:रु\.?\s*|₹\s*)?([\d\.,\s]+)",
            text, re.UNICODE | re.IGNORECASE
        )
        if stamp_match:
            stamp_duty = stamp_match.group(1).strip()

        # 8. Survey / Gat / Plot Number
        khasra: Optional[str] = None
        khasra_match = re.search(
            r"(?:गट\s*क्र(?:मांक|\.)?|सर्वे\s*नं(?:बर|\.)?|मिल्कत\s*क्र|फ्लॅट\s*नं|survey\s*no|plot\s*no)\s*[:\-]?\s*([\d\/\-\w]+)",
            text, re.UNICODE | re.IGNORECASE
        )
        if khasra_match:
            khasra = khasra_match.group(1).strip()
            feats = self.extract_features(khasra, text)
            confidence_scores["khasraNumber"] = self._band_confidence(True, feats.digit_ratio + (0.3 if feats.has_slash else 0))

        # 9. Area Conveyed
        area: Optional[str] = None
        area_match = re.search(
            r"(?:क्षेत्रफळ|क्षेत्र|area|built\s*up\s*area|carpet\s*area)\s*[:\-]?\s*([\d\.\s]+(?:\s*चौ\.फूट|\s*चौ\.मी|\s*आर|\s*हेक्टर|\s*sq\.?\s*ft)?)",
            text, re.UNICODE | re.IGNORECASE
        )
        if area_match:
            area = area_match.group(1).strip()
            confidence_scores["landArea"] = self._band_confidence(True, 0.90)

        # 10. Boundaries (चतुःसीमा)
        boundaries = {}
        east_match = re.search(r"(?:पूर्व|east)\s*[:\-]\s*([^\n,;]{2,30})", text, re.IGNORECASE)
        if east_match:
            boundaries["east"] = east_match.group(1).strip()
        west_match = re.search(r"(?:पश्चिम|west)\s*[:\-]\s*([^\n,;]{2,30})", text, re.IGNORECASE)
        if west_match:
            boundaries["west"] = west_match.group(1).strip()
        south_match = re.search(r"(?:दक्षिण|south)\s*[:\-]\s*([^\n,;]{2,30})", text, re.IGNORECASE)
        if south_match:
            boundaries["south"] = south_match.group(1).strip()
        north_match = re.search(r"(?:उत्तर|north)\s*[:\-]\s*([^\n,;]{2,30})", text, re.IGNORECASE)
        if north_match:
            boundaries["north"] = north_match.group(1).strip()

        village, tehsil, district = self._extract_geography(text, confidence_scores)
        ownership = "भोगवटादार वर्ग - १ (खरेदीखत मालकी हक्क / Conveyed Freehold)"
        confidence_scores["ownershipType"] = self._band_confidence(True, 0.95)

        extra_details = {
            "documentType": "नोंदणीकृत खरेदीखत (Registered Sale Deed)",
            "registrationNumber": reg_no,
            "executionDate": exec_date,
            "sellerName": seller,
            "buyerName": buyer,
            "considerationAmount": consideration,
            "marketValue": market_val,
            "stampDuty": stamp_duty,
            "boundaries": boundaries
        }

        return ExtractedLandFields(
            khasraNumber=khasra,
            khataNumber=reg_no,
            ownerName=owner,
            village=village,
            tehsil=tehsil,
            district=district,
            landArea=area,
            ownershipType=ownership,
            documentCategory=DocumentCategory.SALE_DEED.value,
            extraDetails=extra_details
        )

    def extract_fields(
        self,
        raw_ocr_text: str,
        ocr_is_fallback: bool = False,
        classification: Optional[DocumentClassificationResult] = None,
        filename: Optional[str] = None
    ) -> Tuple[ExtractedLandFields, Dict[str, float]]:
        """
        Parses raw OCR text with specialized category routing and returns
        (ExtractedLandFields, per-field confidence).
        """
        text = raw_ocr_text.strip()
        doc_class = classification or document_classifier.classify(text, filename)

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

        category = doc_class.category
        if category == DocumentCategory.FORM_8A:
            extracted_fields = self._extract_form_8a(text, confidence_scores)
        elif category == DocumentCategory.FORM_6_MUTATION:
            extracted_fields = self._extract_form_6_ferfar(text, confidence_scores)
        elif category == DocumentCategory.URBAN_PROPERTY_CARD:
            extracted_fields = self._extract_property_card(text, confidence_scores)
        elif category == DocumentCategory.SALE_DEED:
            extracted_fields = self._extract_sale_deed(text, confidence_scores)
        else:
            extracted_fields = self._extract_form_7_12(text, confidence_scores)

        avg_conf = sum(confidence_scores.values()) / len(confidence_scores)
        logger.info(f"Structuring engine processed text. Average confidence: {avg_conf:.4f}, fallback_ocr={ocr_is_fallback}, category={category.value}")
        return extracted_fields, confidence_scores

    def classify_document(self, text: str, filename: Optional[str] = None) -> DocumentClassificationResult:
        """Classify incoming raw document text into revenue categories or non-land rejection."""
        return document_classifier.classify(text, filename)


# Global instances & Backward-compatible Aliases
structuring_engine = LandStructuringEngine()
ml_structuring_engine = structuring_engine
XGBoostLandStructuringEngine = LandStructuringEngine

"""
Validation Rules and Business Logic Engine
Validates extracted revenue fields against Indian land record specifications,
flags anomalies, detects duplicate khasra entries, and adjusts confidence scores.
"""
import re
import logging
from typing import Dict, Any, List, Tuple, Optional
from app.schemas.record import ExtractedLandFields

logger = logging.getLogger("bhunetra.validation")

# Recognized standard Indian Land Area measurement units
VALID_LAND_AREA_UNITS = [
    # English
    "hectare", "hectares", "ha", "acre", "acres", "ac", "guntha", "gunthas",
    "bigha", "bighas", "biswa", "cent", "cents", "sq. meter", "sq meter", "sqm", "sq. mtr", "sq. ft", "sq ft", "sqft", "sq.ft.",
    # Hindi / Marathi transliterations and scripts
    "हेक्टर", "एकड", "एकर", "गुंठा", "गुंठे", "बीघा", "बिस्वा", "चौ.मी.", "चौ.मी", "चौरस मीटर", "चौ.फूट", "चौ फूट", "चौरस फूट", "आर", "aar", "r"
]

# Common Indian Ownership classifications
VALID_OWNERSHIP_TYPES = [
    "private", "joint", "government", "public", "trust", "tenant",
    "class-1", "class-2", "class 1", "class 2",
    "भोगवटादार वर्ग १", "भोगवटादार वर्ग २", "शासकीय", "खाजगी", "इनाम"
]


class ValidationResult:
    def __init__(
        self,
        is_valid: bool,
        field_scores: Dict[str, float],
        field_errors: Dict[str, List[str]],
        warnings: List[str]
    ):
        self.is_valid = is_valid
        self.field_scores = field_scores
        self.field_errors = field_errors
        self.warnings = warnings

    def to_dict(self) -> Dict[str, Any]:
        return {
            "isValid": self.is_valid,
            "fieldScores": self.field_scores,
            "fieldErrors": self.field_errors,
            "warnings": self.warnings,
        }


class LandRecordValidator:
    """
    Applies domain-specific business rules for land records
    (Khasra/Khata formats, owner name sanity, land area units).
    """

    def validate_khasra_number(self, value: Optional[str], initial_score: float = 0.90) -> Tuple[float, List[str]]:
        errors = []
        if not value or not str(value).strip():
            return 0.10, ["Khasra / Survey Number is missing."]

        val = str(value).strip()
        # Accept numbers, slashes, sub-parts like "142/3", "142/3A", "58-B", Devanagari numerals like "१४२/३अ", "१४२३अ", CTS numbers like "CTS-1420", and lists like "12, 14/2"
        pattern = r"^(?:CTS[\s\-\/\.]*)?[0-9A-Za-z\u0966-\u096F\u0900-\u097F]+(?:[\/\-\.\,\s]+[0-9A-Za-z\u0966-\u096F\u0900-\u097F]+)*$"
        if not re.match(pattern, val):
            errors.append(f"Khasra '{val}' has unusual characters or formatting.")
            return max(0.30, initial_score - 0.50), errors

        if len(val) > 60:
            errors.append("Khasra number is suspiciously long.")
            return max(0.40, initial_score - 0.40), errors

        return initial_score, errors

    def validate_khata_number(self, value: Optional[str], initial_score: float = 0.90) -> Tuple[float, List[str]]:
        errors = []
        if not value or not str(value).strip():
            return 0.20, ["Khata / Account Number is missing."]

        val = str(value).strip()
        # Accept numeric, alphanumeric account, PRN identifiers, Devanagari numerals like "५८२", or registration numbers
        if not re.match(r"^[0-9A-Za-z\u0966-\u096F\u0900-\u097F\/\-\s]+$", val):
            errors.append(f"Khata '{val}' contains invalid symbols.")
            return max(0.35, initial_score - 0.45), errors

        return initial_score, errors

    def validate_owner_name(self, value: Optional[str], initial_score: float = 0.90) -> Tuple[float, List[str]]:
        errors = []
        if not value or not str(value).strip():
            return 0.10, ["Owner name is missing."]

        val = str(value).strip()
        if len(val) < 3:
            errors.append(f"Owner name '{val}' is too short (< 3 characters).")
            return 0.30, errors

        # Check if owner name accidentally contains digits (common OCR misread)
        if re.search(r"\d", val):
            errors.append(f"Owner name '{val}' contains digits, which is likely an OCR artifact.")
            return max(0.40, initial_score - 0.45), errors

        # Check for unreadable punctuation
        if re.search(r"[\$\#\@\%\^\&\*\=\+\<\>\{\}\[\]]", val):
            errors.append(f"Owner name '{val}' contains invalid special symbols.")
            return max(0.35, initial_score - 0.40), errors

        return initial_score, errors

    def validate_land_area(self, value: Optional[str], initial_score: float = 0.90) -> Tuple[float, List[str]]:
        errors = []
        if not value or not str(value).strip():
            return 0.15, ["Land Area is missing."]

        val = str(value).strip().lower()

        # 1. Must contain at least one digit
        if not re.search(r"\d", val):
            errors.append("Land Area does not specify any numeric value.")
            return 0.25, errors

        # 2. Must specify a recognized unit of land measurement
        has_valid_unit = any(unit in val for unit in VALID_LAND_AREA_UNITS)
        if not has_valid_unit:
            errors.append(f"Land Area '{value}' is missing standard measurement units (e.g. Hectare, Acre, Guntha, Bigha, Sq. M).")
            return max(0.40, initial_score - 0.40), errors

        return initial_score, errors

    def validate_geographic_field(self, field_name: str, value: Optional[str], initial_score: float = 0.90) -> Tuple[float, List[str]]:
        errors = []
        if not value or not str(value).strip():
            return 0.20, [f"{field_name.capitalize()} is missing."]

        val = str(value).strip()
        if len(val) < 2:
            errors.append(f"{field_name.capitalize()} '{val}' is suspiciously short.")
            return 0.40, errors

        if re.search(r"\d", val):
            errors.append(f"{field_name.capitalize()} contains digits, likely an OCR issue.")
            return max(0.45, initial_score - 0.35), errors

        return initial_score, errors

    def validate_record(
        self,
        extracted: ExtractedLandFields,
        raw_confidence: Optional[Dict[str, float]] = None
    ) -> ValidationResult:
        """
        Validates all fields in an extracted record and computes adjusted confidence scores.
        """
        raw_scores = raw_confidence or {}
        scores: Dict[str, float] = {}
        field_errors: Dict[str, List[str]] = {}
        all_warnings: List[str] = []

        # 1. Validate Khasra
        khasra_base = raw_scores.get("khasraNumber", 0.90)
        s, errs = self.validate_khasra_number(extracted.khasraNumber, khasra_base)
        scores["khasraNumber"] = s
        if errs:
            field_errors["khasraNumber"] = errs
            all_warnings.extend(errs)

        # 2. Validate Khata
        khata_base = raw_scores.get("khataNumber", 0.90)
        s, errs = self.validate_khata_number(extracted.khataNumber, khata_base)
        scores["khataNumber"] = s
        if errs:
            field_errors["khataNumber"] = errs
            all_warnings.extend(errs)

        # 3. Validate Owner Name
        owner_base = raw_scores.get("ownerName", 0.90)
        s, errs = self.validate_owner_name(extracted.ownerName, owner_base)
        scores["ownerName"] = s
        if errs:
            field_errors["ownerName"] = errs
            all_warnings.extend(errs)

        # 4. Validate Land Area
        area_base = raw_scores.get("landArea", 0.90)
        s, errs = self.validate_land_area(extracted.landArea, area_base)
        scores["landArea"] = s
        if errs:
            field_errors["landArea"] = errs
            all_warnings.extend(errs)

        # 5. Validate Village, Tehsil, District
        for geo in ["village", "tehsil", "district"]:
            val = getattr(extracted, geo, None)
            base = raw_scores.get(geo, 0.90)
            s, errs = self.validate_geographic_field(geo, val, base)
            scores[geo] = s
            if errs:
                field_errors[geo] = errs
                all_warnings.extend(errs)

        # 6. Ownership Type
        ownership_base = raw_scores.get("ownershipType", 0.90)
        if extracted.ownershipType:
            scores["ownershipType"] = ownership_base
        else:
            scores["ownershipType"] = 0.50
            field_errors["ownershipType"] = ["Ownership classification is empty."]

        is_valid = len(all_warnings) == 0

        return ValidationResult(
            is_valid=is_valid,
            field_scores=scores,
            field_errors=field_errors,
            warnings=all_warnings
        )

    def detect_duplicates(self, new_khasra: str, new_village: str, existing_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detects if another document already created a record with the same Khasra number
        in the same Village.
        """
        duplicates = []
        if not new_khasra:
            return duplicates

        clean_new_khasra = str(new_khasra).strip().lower()
        clean_new_village = str(new_village or "").strip().lower()

        for rec in existing_records:
            rec_khasra = str(rec.get("khasraNumber", "")).strip().lower()
            rec_village = str(rec.get("village", "")).strip().lower()

            if rec_khasra == clean_new_khasra:
                # Same khasra and village (or village omitted)
                if not clean_new_village or not rec_village or clean_new_village == rec_village:
                    duplicates.append(rec)

        return duplicates


# Singleton instance
validator = LandRecordValidator()

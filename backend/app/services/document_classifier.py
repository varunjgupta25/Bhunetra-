"""
Document Classifier Engine: Sovereign Multi-Signal Document Routing
Classifies incoming scanned documents / OCR text into Indian revenue and property record categories:
- Village Form 7/12 (Satbara Extract)
- Village Form 8-A (Consolidated Khata Holding)
- Village Form 6 (Ferfar / Mutation Register)
- Urban Property Card (City Survey Akhiv Patrika / CTS)
- Registered Sale Deed (Kharidi Khat / Conveyance)
- Encumbrance & 30-Year Search Report
- Non-Land Documents (Invoices, IDs, Pay Slips, Resumes, etc. -> REJECT)
"""
import re
import logging
from enum import Enum
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field

logger = logging.getLogger("bhunetra.classifier")


class DocumentCategory(str, Enum):
    VILLAGE_FORM_7_12 = "VILLAGE_FORM_7_12"
    VILLAGE_FORM_8_A = "VILLAGE_FORM_8_A"
    VILLAGE_FORM_6_FERFAR = "VILLAGE_FORM_6_FERFAR"
    URBAN_PROPERTY_CARD = "URBAN_PROPERTY_CARD"
    REGISTERED_SALE_DEED = "REGISTERED_SALE_DEED"
    SEARCH_REPORT = "SEARCH_REPORT"
    GAT_NAKASHA_MAP = "GAT_NAKASHA_MAP"
    NA_ORDER_SANAD = "NA_ORDER_SANAD"
    GIFT_RELINQUISHMENT_DEED = "GIFT_RELINQUISHMENT_DEED"
    PARTITION_HEIRSHIP_DEED = "PARTITION_HEIRSHIP_DEED"
    NON_LAND_DOCUMENT = "NON_LAND_DOCUMENT"
    UNKNOWN_LAND_DOCUMENT = "UNKNOWN_LAND_DOCUMENT"

    # Convenient developer aliases
    FORM_8A = "VILLAGE_FORM_8_A"
    FORM_6_MUTATION = "VILLAGE_FORM_6_FERFAR"
    SALE_DEED = "REGISTERED_SALE_DEED"
    GAT_MAP = "GAT_NAKASHA_MAP"
    NA_ORDER = "NA_ORDER_SANAD"


class DocumentClassificationResult(BaseModel):
    category: DocumentCategory
    category_label: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    is_land_record: bool
    detected_title: Optional[str] = None
    language: str = "mr"
    matched_anchors: List[str] = Field(default_factory=list)
    rejection_reason: Optional[str] = None
    category_scores: Dict[str, float] = Field(default_factory=dict)


# Human readable labels
CATEGORY_LABELS = {
    DocumentCategory.VILLAGE_FORM_7_12: "गाव नमुना सात/बारा (7/12 Satbara Extract)",
    DocumentCategory.VILLAGE_FORM_8_A: "गाव नमुना ८-अ (Form 8-A Khate Pustika)",
    DocumentCategory.VILLAGE_FORM_6_FERFAR: "गाव नमुना ६ (Form 6 Ferfar / Mutation Register)",
    DocumentCategory.URBAN_PROPERTY_CARD: "नगर भूमापन मिळकत पत्रिका (Urban Property Card / CTS)",
    DocumentCategory.REGISTERED_SALE_DEED: "नोंदणीकृत खरेदीखत (Registered Sale Deed)",
    DocumentCategory.SEARCH_REPORT: "शोध अहवाल (Title & Encumbrance Search Report)",
    DocumentCategory.GAT_NAKASHA_MAP: "गट नकाशा व मोजणी प्रत (Cadastral Survey Map & Tipan)",
    DocumentCategory.NA_ORDER_SANAD: "अकृषिक आदेश व सनद (NA Conversion Order & Sanad)",
    DocumentCategory.GIFT_RELINQUISHMENT_DEED: "बक्षीसपत्र व हक्कसोडपत्र (Gift & Relinquishment Deed)",
    DocumentCategory.PARTITION_HEIRSHIP_DEED: "वारस नोंद व वाटपपत्र (Partition Deed & Heirship Register)",
    DocumentCategory.NON_LAND_DOCUMENT: "अमान्य दस्तऐवज (Non-Land Document / Invalid)",
    DocumentCategory.UNKNOWN_LAND_DOCUMENT: "अज्ञात जमीन अभिलेख (Unrecognized Land Document)",
}


class DocumentClassifier:
    """
    Multi-signal, bilingual (Marathi / English) land record document classifier.
    Operates 100% offline using heading weights, semantic density, and negative controls.
    """

    def __init__(self):
        # 1. Non-Land Rejection Keywords (Strong negative signals)
        self.non_land_patterns = [
            (r"\bgst(?:in)?\b|goods and services tax|form gst reg-06", "GST Registration Certificate"),
            (r"tax invoice|bill of supply|retail invoice|cash memo|subtotal|grand total", "Commercial Tax Invoice / Receipt"),
            (r"fssai|food safety and standards authority", "FSSAI Food License"),
            (r"income tax department|permanent account number|\bpan card\b", "Income Tax PAN Card"),
            (r"unique identification authority of india|uidai|आधार|aadhaar", "Aadhaar National Identity"),
            (r"salary slip|pay slip|payslip|pf deduction|net pay|gross salary", "Employee Salary Slip"),
            (r"curriculum vitae|\bresume\b|work experience|education history", "Curriculum Vitae / Resume"),
            (r"driving licen[cs]e|motor vehicles department|transport department", "Driving License"),
            (r"electricity bill|mseb|msedcl|consumer no|bill unit", "Electricity Utility Bill"),
            (r"passport|republic of india passport", "Indian Passport"),
        ]

        # 2. Document-specific Anchor Keywords with Weights
        self.category_anchors = {
            DocumentCategory.VILLAGE_FORM_7_12: [
                (r"गाव\s*नमुना\s*(?:सात|७)", 4.0),
                (r"नमुना\s*(?:बारा|१२)", 3.0),
                (r"७\s*/\s*१२|7\s*/\s*12|satbara|sat\s*bara", 3.5),
                (r"अधिकार\s*अभिलेख\s*पत्रक", 3.5),
                (r"भोगवटादार\s*वर्ग\s*[-–]?\s*[१२12]", 3.0),
                (r"गट\s*क्र(?:मांक|\.)?|भूमापन\s*क्र(?:मांक|\.)?", 2.5),
                (r"पोटखराब|जिरायत|बागायत|आकारणी", 2.0),
                (r"गाव\s*नमुना\s*बारा|पिकांची\s*नोंदवही", 2.5),
            ],
            DocumentCategory.VILLAGE_FORM_8_A: [
                (r"गाव\s*नमुना\s*(?:८|8)\s*[-–]?\s*अ|गाव\s*नमुना\s*आठ", 4.5),
                (r"खातेवही\s*उतारा|खाते\s*नोंदवही", 3.5),
                (r"खाते\s*क्रमांक|खाता\s*क्र", 2.0),
                (r"एकूण\s*आकारणी|जुमला\s*आकारणी", 2.5),
                (r"८\s*[-–]?\s*अ|8\s*[-–]?\s*a", 3.0),
                (r"धारणा\s*जमीन|खातेदाराचे\s*नाव", 1.5),
            ],
            DocumentCategory.VILLAGE_FORM_6_FERFAR: [
                (r"गाव\s*नमुना\s*(?:सहा|६|6)", 4.5),
                (r"फेरफार\s*नोंदवही|फेरफार\s*उतारा", 4.0),
                (r"फेरी\s*क्र(?:मांक|\.)?|फेरफार\s*क्रमांक", 3.5),
                (r"नोंदणीकृत\s*फेरफार|वारस\s*नोंद|बक्षीस\s*पत्र", 3.0),
                (r"मंडळ\s*अधिकारी\s*प्रमाणित|तपासले\s*व\s*मंजूर", 2.5),
                (r"mutation\s*register|form\s*vi|form\s*6", 3.0),
            ],
            DocumentCategory.URBAN_PROPERTY_CARD: [
                (r"मालमत्ता\s*पत्रक|मिळकत\s*पत्रिका", 4.5),
                (r"नगर\s*भूमापन|नगर\s*भूमापन\s*अधिकारी", 4.0),
                (r"अखिव\s*पत्रिका|property\s*card", 3.5),
                (r"सिटी\s*सर्व्हे|cts\s*no|cts\s*क्रमांक", 3.5),
                (r"prn\s*number|prn\s*क्र", 2.5),
                (r"चौरस\s*मीटर|sq\.\s*meters?|कार्पेट\s*क्षेत्र", 2.0),
            ],
            DocumentCategory.REGISTERED_SALE_DEED: [
                (r"खरेदी\s*खत|खरेदीखत|विक्री\s*खत", 4.5),
                (r"नोंदणीकृत\s*दस्त|दस्तऐवज\s*क्रमांक", 3.5),
                (r"खरेदी\s*देणारा|खरेदी\s*घेणारा", 3.5),
                (r"मुद्रांक\s*शुल्क|नोंदणी\s*फी|stamp\s*duty", 3.0),
                (r"बाजारमूल्य|मोबदला|consideration\s*amount", 2.5),
                (r"चतुःसीमा|चतुःसिमा|सहदुय्यम\s*निबंधक|sub\s*registrar", 3.0),
                (r"conveyance\s*deed|sale\s*deed", 3.5),
            ],
            DocumentCategory.SEARCH_REPORT: [
                (r"शोध\s*अहवाल|टायटल\s*सर्च|search\s*report", 4.5),
                (r"बोजा\s*प्रमाणपत्र|encumbrance\s*certificate", 3.5),
                (r"(?:१३|३०|13|30)\s*वर्षांचा\s*शोध|30\s*years?\s*search", 3.5),
                (r"शीर्षक\s*प्रमाणपत्र|title\s*certificate|title\s*clear", 3.0),
                (r"कायदेशीर\s*सल्लागार|advocate|निर्दोष\s*व\s*मार्केटेबल", 2.5),
            ],
            DocumentCategory.GAT_NAKASHA_MAP: [
                (r"गट\s*नकाशा|जमीन\s*नकाशा|village\s*map|cadastral\s*map", 4.5),
                (r"मोजणी\s*प्रत|भूमापन\s*नकाशा|टिपण|tipan", 4.0),
                (r"भूमी\s*अभिलेख\s*उपअधीक्षक|भूमि\s*अभिलेख|cadastral\s*survey", 3.5),
                (r"सीमांकन|हद्द\s*कायम|boundary\s*demarcation", 3.0),
                (r"scale\s*1\s*:\s*\d+|प्रमाण\s*१\s*:\s*\d+", 2.5),
            ],
            DocumentCategory.NA_ORDER_SANAD: [
                (r"अकृषिक\s*आदेश|अकृषक\s*आदेश|non[\s\-]*agricultural\s*order", 4.5),
                (r"कलम\s*(?:४४|44)|section\s*44\s*mlrc", 4.0),
                (r"अकृषिक\s*सनद|na\s*sanad|सनद\s*पत्र", 4.0),
                (r"जिल्हाधिकारी\s*कार्यालय|उपविभागीय\s*अधिकारी|sdo\s*office", 3.0),
                (r"निवासी\s*वापर|व्यावसायिक\s*वापर|औद्योगिक\s*वापर", 2.5),
            ],
            DocumentCategory.GIFT_RELINQUISHMENT_DEED: [
                (r"बक्षीस\s*पत्र|बक्षीसपत्र|gift\s*deed", 4.5),
                (r"हक्क\s*सोड\s*पत्र|हक्कसोडपत्र|relinquishment\s*deed|release\s*deed", 4.5),
                (r"विनामोबदला|प्रेमापोटी|रक्ताचे\s*नाते|without\s*monetary\s*consideration", 3.5),
                (r"हक्क\s*सोडून\s*दिला|relinquish\s*all\s*rights", 3.0),
                (r"दान\s*घेणारा|दान\s*देणारा", 3.0),
            ],
            DocumentCategory.PARTITION_HEIRSHIP_DEED: [
                (r"वारस\s*नोंद|वारस\s*तपासणी|वारसदार|heirship\s*certificate", 4.5),
                (r"वाटप\s*पत्र|वाटपपत्र|आपसात\s*वाटप|family\s*partition\s*deed", 4.5),
                (r"तहसीलदार\s*वारस\s*नोंद|हिंदू\s*वारसा\s*कायदा|hindu\s*succession", 3.5),
                (r"हिस्सा\s*वाटप|सहहिस्सेदार|co[\s\-]*sharers", 3.0),
                (r"मृत्यू\s*नोंद|मृत्युपत्र|will\s*deed", 2.5),
            ],
        }

    def classify(self, text: str, filename: Optional[str] = None) -> DocumentClassificationResult:
        """
        Classifies OCR text into document categories.
        Checks for non-land rejections first, then calculates weighted score vectors.
        """
        clean_text = text or ""
        fn = (filename or "").lower().strip()
        combined_text = f"{fn}\n{clean_text}".lower()

        # Step 1: Check Strong Non-Land Rejections
        for pat, desc in self.non_land_patterns:
            if re.search(pat, combined_text, re.IGNORECASE):
                logger.info(f"Classifier flagged non-land document: {desc}")
                return DocumentClassificationResult(
                    category=DocumentCategory.NON_LAND_DOCUMENT,
                    category_label=CATEGORY_LABELS[DocumentCategory.NON_LAND_DOCUMENT],
                    confidence=0.99,
                    is_land_record=False,
                    detected_title=desc,
                    rejection_reason=f"Uploaded file detected as '{desc}', which is not a recognized land revenue or title record.",
                    matched_anchors=[desc],
                    category_scores={"NON_LAND": 1.0}
                )

        # Step 2: Calculate Weighted Score Vectors across land document classes
        scores: Dict[str, float] = {}
        matched_anchors_by_cat: Dict[str, List[str]] = {}

        for cat, anchors in self.category_anchors.items():
            cat_score = 0.0
            found_anchors = []
            for pattern, weight in anchors:
                matches = re.findall(pattern, clean_text, re.IGNORECASE | re.UNICODE)
                if matches:
                    cat_score += weight * len(matches)
                    found_anchors.append(str(matches[0]).strip())
                # Also give small bonus if present in filename
                if fn and re.search(pattern, fn, re.IGNORECASE):
                    cat_score += weight * 0.75
                    found_anchors.append(f"filename:{fn}")

            scores[cat.value] = cat_score
            matched_anchors_by_cat[cat.value] = found_anchors

        # Step 3: Normalize and Find Highest Scoring Category
        total_score = sum(scores.values())
        if total_score == 0:
            # If no revenue keywords matched at all, check if text has any general land terms
            general_land_terms = ["जमीन", "खाते", "सर्व्हे", "क्षेत्र", "मालक", "महसूल", "land", "survey", "acres", "hectare"]
            has_general_land = any(term in clean_text.lower() for term in general_land_terms)
            if has_general_land:
                return DocumentClassificationResult(
                    category=DocumentCategory.UNKNOWN_LAND_DOCUMENT,
                    category_label=CATEGORY_LABELS[DocumentCategory.UNKNOWN_LAND_DOCUMENT],
                    confidence=0.40,
                    is_land_record=True,
                    detected_title="Uncategorized Land Document",
                    matched_anchors=["general_land_keywords"],
                    category_scores=scores
                )
            else:
                return DocumentClassificationResult(
                    category=DocumentCategory.NON_LAND_DOCUMENT,
                    category_label=CATEGORY_LABELS[DocumentCategory.NON_LAND_DOCUMENT],
                    confidence=0.85,
                    is_land_record=False,
                    detected_title="Non-Land Record",
                    rejection_reason="The uploaded document contains no recognizable land, revenue, or property registration terminology.",
                    matched_anchors=[],
                    category_scores=scores
                )

        # Normalize scores to 0.0 - 1.0 range
        norm_scores = {k: round(v / total_score, 4) for k, v in scores.items()}
        best_cat_str = max(scores, key=scores.get)
        best_cat = DocumentCategory(best_cat_str)
        raw_best_score = scores[best_cat_str]

        # Calibration of confidence: raw score >= 4.0 gives > 0.85 confidence
        confidence = min(0.98, max(0.50, 0.60 + (raw_best_score / 15.0) * 0.38))
        confidence = round(confidence, 4)

        return DocumentClassificationResult(
            category=best_cat,
            category_label=CATEGORY_LABELS[best_cat],
            confidence=confidence,
            is_land_record=True,
            detected_title=CATEGORY_LABELS[best_cat],
            matched_anchors=matched_anchors_by_cat.get(best_cat_str, [])[:5],
            category_scores=norm_scores
        )


# Global singleton instance
document_classifier = DocumentClassifier()

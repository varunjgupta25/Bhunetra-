"""
Confidence Scoring Engine
Calculates per-field confidence scores, overall record confidence,
and automated routing decisions based on threshold.
"""
from typing import Dict, List, Tuple
from app.config import settings
from app.schemas.common import VerificationStatus


FIELD_WEIGHTS = {
    "khasraNumber": 0.25,    # Critical legal identifier
    "khataNumber": 0.15,     # Critical revenue identifier
    "ownerName": 0.20,       # Critical legal party
    "landArea": 0.15,        # Revenue quantification
    "village": 0.10,         # Geographic identifier
    "tehsil": 0.05,
    "district": 0.05,
    "ownershipType": 0.05,
}


def calculate_overall_confidence(
    field_scores: Dict[str, float],
    threshold: float = settings.AUTO_APPROVE_CONFIDENCE_THRESHOLD
) -> Tuple[float, VerificationStatus, List[str]]:
    """
    Computes weighted overall confidence and determines verification routing.
    
    Returns:
        (overall_confidence, verification_status, flagged_fields)
    """
    if not field_scores:
        return 0.0, VerificationStatus.PENDING_REVIEW, list(FIELD_WEIGHTS.keys())

    total_weight = 0.0
    weighted_sum = 0.0
    flagged_fields = []

    for field, weight in FIELD_WEIGHTS.items():
        score = field_scores.get(field, 0.0)
        # Cap score between 0.0 and 1.0
        clamped_score = max(0.0, min(1.0, float(score)))
        
        weighted_sum += clamped_score * weight
        total_weight += weight
        
        if clamped_score < threshold:
            flagged_fields.append(field)

    overall = round(weighted_sum / total_weight, 4) if total_weight > 0 else 0.0

    # Auto-approval rule:
    # 1. Overall confidence must meet threshold
    # 2. Critical fields (khasra, owner, area) must not have severe red flags (< 0.60)
    critical_check = all(
        field_scores.get(k, 0.0) >= 0.60
        for k in ["khasraNumber", "ownerName", "landArea"]
    )

    if overall >= threshold and critical_check and len(flagged_fields) == 0:
        status = VerificationStatus.AUTO_APPROVED
    else:
        status = VerificationStatus.PENDING_REVIEW

    return overall, status, flagged_fields

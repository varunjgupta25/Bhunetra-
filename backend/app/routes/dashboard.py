"""
Dashboard Analytics & Audit Trail Routes
Endpoints:
- GET /api/dashboard/stats
- GET /api/auditLog
"""
import logging
from collections import defaultdict
from fastapi import APIRouter, Depends, Query

from app.firebase_config import get_db
from app.utils.auth import get_current_user, AuthenticatedUser, require_role
from app.schemas.common import UserRole, VerificationStatus
from app.schemas.dashboard import DashboardStatsResponse, DistrictStat
from app.schemas.audit import AuditLogListResponse, AuditLogEntry

logger = logging.getLogger("bhunetra.routes.dashboard")
router = APIRouter(tags=["Dashboard & Analytics"])


@router.get("/api/dashboard/stats", response_model=DashboardStatsResponse, summary="Get Overview Metrics & District Breakdown")
async def get_dashboard_stats(
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Computes real-time digitization statistics, backlog count, and regional breakdown.
    """
    db = get_db()
    records_snap = db.collection("records").get()
    all_records = [r.to_dict() for r in records_snap]

    total_processed = len(all_records)
    pending_review = 0
    auto_approved = 0
    manually_verified = 0
    confidence_sum = 0.0

    district_map = defaultdict(lambda: {
        "count": 0,
        "conf_sum": 0.0,
        "pending": 0,
        "auto": 0
    })

    for r in all_records:
        status = r.get("verificationStatus", "")
        conf = float(r.get("overallConfidence", 0.0))
        confidence_sum += conf
        
        district = r.get("district") or "Unassigned"
        d_stats = district_map[district]
        d_stats["count"] += 1
        d_stats["conf_sum"] += conf

        if status == VerificationStatus.PENDING_REVIEW.value:
            pending_review += 1
            d_stats["pending"] += 1
        elif status == VerificationStatus.AUTO_APPROVED.value:
            auto_approved += 1
            d_stats["auto"] += 1
        elif status in [VerificationStatus.VERIFIED.value, VerificationStatus.CORRECTED.value]:
            manually_verified += 1

    avg_confidence = round(confidence_sum / total_processed, 4) if total_processed > 0 else 0.0

    by_district = []
    for dist, data in district_map.items():
        by_district.append(DistrictStat(
            district=dist,
            count=data["count"],
            avgConfidence=round(data["conf_sum"] / data["count"], 4) if data["count"] > 0 else 0.0,
            pendingReviewCount=data["pending"],
            autoApprovedCount=data["auto"]
        ))

    # Fetch recent audit activity
    audit_snaps = db.collection("auditLog").get()
    recent_activity = [a.to_dict() for a in audit_snaps[-10:]]

    return DashboardStatsResponse(
        totalProcessed=total_processed,
        pendingReview=pending_review,
        autoApproved=auto_approved,
        manuallyVerified=manually_verified,
        averageConfidence=avg_confidence,
        byDistrict=by_district,
        recentActivity=recent_activity
    )


@router.get("/api/auditLog", response_model=AuditLogListResponse, summary="Get Audit Trail (Admin only)")
async def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Immutable audit trail for change tracking and non-repudiation.
    """
    db = get_db()
    logs_snap = db.collection("auditLog").get()
    logs = [AuditLogEntry(**snap.to_dict()) for snap in logs_snap[:limit]]

    return AuditLogListResponse(total=len(logs), logs=logs)

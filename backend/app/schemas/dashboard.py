"""
Dashboard Analytics & Aggregation Schemas
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class DistrictStat(BaseModel):
    district: str
    count: int = 0
    avgConfidence: float = 0.0
    pendingReviewCount: int = 0
    autoApprovedCount: int = 0


class VillageStat(BaseModel):
    village: str
    district: str
    count: int = 0
    avgConfidence: float = 0.0


class DashboardStatsResponse(BaseModel):
    totalProcessed: int = 0
    pendingReview: int = 0
    autoApproved: int = 0
    manuallyVerified: int = 0
    averageConfidence: float = 0.0
    byDistrict: List[DistrictStat] = Field(default_factory=list)
    recentActivity: List[dict] = Field(default_factory=list)

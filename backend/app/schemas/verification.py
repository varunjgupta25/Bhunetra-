"""
Verification and Human-in-the-Loop Schemas
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.schemas.common import QueuePriority, QueueStatus, VerificationStatus
from app.schemas.record import ExtractedLandFields, LandRecord


class VerificationPatchRequest(BaseModel):
    correctedFields: Dict[str, Any] = Field(
        ...,
        description="Dictionary of field names and their corrected values submitted by the verifier"
    )
    approved: bool = Field(
        True,
        description="Whether the verifier officially approves this record"
    )
    notes: Optional[str] = Field(
        None,
        description="Optional reviewer notes or remarks regarding changes"
    )


class VerificationQueueItem(BaseModel):
    queueId: str
    recordId: str
    assignedTo: Optional[str] = None
    priority: QueuePriority = QueuePriority.NORMAL
    status: QueueStatus = QueueStatus.PENDING
    flaggedFields: List[str] = Field(default_factory=list)
    overallConfidence: float
    createdAt: str
    record: Optional[LandRecord] = None


class VerificationQueueResponse(BaseModel):
    total: int
    pendingCount: int
    items: List[VerificationQueueItem]

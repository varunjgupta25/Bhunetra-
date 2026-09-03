"""
Audit Logging Schemas
Ensures non-repudiation and immutable tracking of every manual verification or correction.
"""
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from app.schemas.common import AuditAction


class AuditLogDetails(BaseModel):
    before: Dict[str, Any] = Field(default_factory=dict, description="State before modification")
    after: Dict[str, Any] = Field(default_factory=dict, description="State after modification")
    notes: Optional[str] = None


class AuditLogEntry(BaseModel):
    logId: str
    action: AuditAction
    performedBy: str = Field(..., description="Firebase UID of the user who performed the action")
    userRole: Optional[str] = Field(None, description="Role of the user (e.g., admin, verifier)")
    targetRecordId: str
    docId: Optional[str] = None
    details: AuditLogDetails
    timestamp: str


class AuditLogListResponse(BaseModel):
    total: int
    logs: List[AuditLogEntry]

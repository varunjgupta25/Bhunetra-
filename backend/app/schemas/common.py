"""
Common Enums and Base Models for Bhunetra Schemas
"""
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    VERIFIER = "verifier"
    OFFICER = "officer"


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"
    REJECTED = "rejected"


class VerificationStatus(str, Enum):
    AUTO_APPROVED = "auto-approved"
    PENDING_REVIEW = "pending-review"
    VERIFIED = "verified"
    CORRECTED = "corrected"


class QueuePriority(str, Enum):
    HIGH = "high"
    NORMAL = "normal"


class QueueStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in-review"
    COMPLETED = "completed"


class AuditAction(str, Enum):
    DOCUMENT_UPLOADED = "document_uploaded"
    PIPELINE_PROCESSED = "pipeline_processed"
    RECORD_VERIFIED = "record_verified"
    RECORD_CORRECTED = "record_corrected"
    RECORD_FLAGGED = "record_flagged"

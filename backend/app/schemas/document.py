"""
Document Schemas
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.common import DocumentStatus


class DocumentUploadResponse(BaseModel):
    docId: str
    fileName: str
    storageUrl: str
    fileType: str
    status: DocumentStatus = DocumentStatus.PENDING
    uploadedBy: str
    uploadedAt: str
    message: str = "Document uploaded successfully and queued for processing"


class DocumentItem(BaseModel):
    docId: str
    fileName: str
    storageUrl: str
    fileType: str
    uploadedBy: str
    uploadedAt: str
    status: DocumentStatus
    documentCategory: Optional[str] = None
    categoryLabel: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    errorMessage: Optional[str] = None


class DocumentListResponse(BaseModel):
    total: int
    documents: List[DocumentItem]

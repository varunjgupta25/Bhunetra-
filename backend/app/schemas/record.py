"""
Land Record Schemas and Extracted Fields Contracts
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.common import VerificationStatus


class ExtractedLandFields(BaseModel):
    khasraNumber: Optional[str] = Field(None, description="Khasra / Survey Number (e.g., '142/3')")
    khataNumber: Optional[str] = Field(None, description="Khata / Account Number (e.g., '58')")
    ownerName: Optional[str] = Field(None, description="Primary Land Owner Name")
    village: Optional[str] = Field(None, description="Village (Gram / Mauza)")
    tehsil: Optional[str] = Field(None, description="Tehsil / Taluka")
    district: Optional[str] = Field(None, description="District (Zilla)")
    landArea: Optional[str] = Field(None, description="Land area with units (e.g., '2.5 Hectare', '3 Acre')")
    ownershipType: Optional[str] = Field(None, description="Ownership classification (e.g., Private, Joint, Government)")


class ConfidenceScores(BaseModel):
    khasraNumber: float = 0.0
    khataNumber: float = 0.0
    ownerName: float = 0.0
    village: float = 0.0
    tehsil: float = 0.0
    district: float = 0.0
    landArea: float = 0.0
    ownershipType: float = 0.0


class LandRecord(BaseModel):
    recordId: str
    docId: str
    khasraNumber: Optional[str] = None
    khataNumber: Optional[str] = None
    ownerName: Optional[str] = None
    village: Optional[str] = None
    tehsil: Optional[str] = None
    district: Optional[str] = None
    landArea: Optional[str] = None
    ownershipType: Optional[str] = None
    
    extractedFields: Dict[str, Any] = Field(default_factory=dict, description="Raw extracted key-values before verification")
    confidenceScores: Dict[str, float] = Field(default_factory=dict, description="Confidence per field (0.0 to 1.0)")
    overallConfidence: float = Field(0.0, description="Overall weighted confidence score")
    
    verificationStatus: VerificationStatus = VerificationStatus.PENDING_REVIEW
    flaggedFields: List[str] = Field(default_factory=list, description="Fields below the confidence threshold")
    
    documentUrl: Optional[str] = Field(None, description="Signed URL to view original document image/PDF")
    
    verifiedBy: Optional[str] = None
    verifiedAt: Optional[str] = None
    createdAt: str
    updatedAt: str


class LandRecordListResponse(BaseModel):
    total: int
    records: List[LandRecord]


class DuplicateRecordGroup(BaseModel):
    khasraNumber: str
    khataNumber: Optional[str] = None
    records: List[LandRecord]
    conflictType: str = "potential_duplicate_khasra"


class DuplicateDetectionResponse(BaseModel):
    totalDuplicates: int
    duplicates: List[DuplicateRecordGroup]

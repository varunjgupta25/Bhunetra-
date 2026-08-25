"""
Automated Test Suite for OCR Service, Validation Rules, Confidence Scoring, and Endpoints
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.ocr_service import ocr_service
from app.services.validation_rules import validator
from app.schemas.record import ExtractedLandFields
from app.utils.confidence import calculate_overall_confidence
from app.schemas.common import VerificationStatus


@pytest.mark.asyncio
async def test_ocr_extraction_on_image():
    """Validates that OCR service processes image bytes and returns structured text."""
    with open("data/sample_documents/sample_degraded_record.jpg", "rb") as f:
        img_bytes = f.read()

    result = await ocr_service.extract_text(img_bytes, source_language="mr")
    
    assert result is not None
    assert isinstance(result.raw_text, str)
    assert len(result.raw_text) > 0
    assert result.language == "mr"
    assert len(result.lines) > 0


def test_validation_rules_valid_record():
    """Validates that a correctly formatted record passes all business rules."""
    valid_record = ExtractedLandFields(
        khasraNumber="142/3A",
        khataNumber="582",
        ownerName="Ramesh Vitthal Patil",
        village="Wagholi",
        tehsil="Haveli",
        district="Pune",
        landArea="1.45 Hectare",
        ownershipType="Occupant Class-1"
    )
    
    result = validator.validate_record(valid_record)
    assert result.is_valid is True
    assert len(result.warnings) == 0
    assert result.field_scores["khasraNumber"] >= 0.85
    assert result.field_scores["landArea"] >= 0.85
    assert result.field_scores["ownerName"] >= 0.85


def test_validation_rules_flag_invalid_units_and_bad_names():
    """Validates that missing units or digits in names are flagged and penalized."""
    bad_record = ExtractedLandFields(
        khasraNumber="142@@3A!!",  # Invalid symbols
        khataNumber="582",
        ownerName="Ramesh 123 Patil",  # Contains numbers (OCR artifact)
        village="Wagholi",
        tehsil="Haveli",
        district="Pune",
        landArea="1.45",  # Missing units like Hectare / Acre
        ownershipType="Private"
    )

    result = validator.validate_record(bad_record)
    assert result.is_valid is False
    assert "landArea" in result.field_errors
    assert "ownerName" in result.field_errors
    assert "khasraNumber" in result.field_errors
    # Scores must be penalized
    assert result.field_scores["landArea"] < 0.60
    assert result.field_scores["ownerName"] < 0.60
    assert result.field_scores["khasraNumber"] < 0.60


def test_confidence_scoring_routing():
    """Validates that low confidence records are routed to pending-review and high confidence to auto-approved."""
    # High confidence scores
    high_scores = {
        "khasraNumber": 0.95,
        "khataNumber": 0.95,
        "ownerName": 0.92,
        "landArea": 0.90,
        "village": 0.95,
        "tehsil": 0.90,
        "district": 0.90,
        "ownershipType": 0.90,
    }
    overall, status, flagged = calculate_overall_confidence(high_scores, threshold=0.75)
    assert overall >= 0.75
    assert status == VerificationStatus.AUTO_APPROVED
    assert len(flagged) == 0

    # Low confidence scores
    low_scores = {
        "khasraNumber": 0.40,  # Below threshold
        "khataNumber": 0.90,
        "ownerName": 0.45,     # Below threshold
        "landArea": 0.35,      # Below threshold
        "village": 0.85,
        "tehsil": 0.85,
        "district": 0.85,
        "ownershipType": 0.80,
    }
    overall, status, flagged = calculate_overall_confidence(low_scores, threshold=0.75)
    assert status == VerificationStatus.PENDING_REVIEW
    assert "khasraNumber" in flagged
    assert "ownerName" in flagged
    assert "landArea" in flagged


@pytest.mark.asyncio
async def test_api_health_and_root():
    """Tests FastAPI root and health check endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

        root_resp = await client.get("/")
        assert root_resp.status_code == 200
        assert root_resp.json()["project"] == "Bhunetra Backend (SIH26018)"

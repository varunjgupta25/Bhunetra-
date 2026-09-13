import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.qr_certificate_generator import generate_record_pdf

client = TestClient(app)

def test_generate_record_pdf_content():
    """Test that the PDF generator successfully creates a valid PDF byte string."""
    record_id = "test-123"
    pdf_data = {
        "owner_name": "राहुल शर्मा",
        "property_id": "Khasra-456",
        "area": "1200",
        "village": "Pune",
        "district": "Pune",
        "state": "Maharashtra"
    }
    verification_url = "http://localhost:8000/api/records/test-123/verify-status"
    
    pdf_bytes = generate_record_pdf(record_id, pdf_data, verification_url)
    
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-")
    assert len(pdf_bytes) > 1000  # Basic size check for content

def test_verify_status_endpoint_not_found():
    """Test that the verify-status endpoint returns 404 for a non-existent record."""
    response = client.get("/api/records/non_existent_record_xyz/verify-status")
    assert response.status_code == 404

from fastapi import HTTPException
from app.utils.auth import get_current_user

def override_get_current_user():
    raise HTTPException(status_code=401, detail="Unauthorized")

def test_export_pdf_endpoint_auth_required():
    """Test that the export-pdf endpoint requires authentication."""
    app.dependency_overrides[get_current_user] = override_get_current_user
    response = client.get("/api/records/test-123/export-pdf")
    assert response.status_code == 401
    app.dependency_overrides.clear()

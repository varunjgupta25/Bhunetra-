"""
Tests for Synthetic SQLite Land-Record Database Integration with GET /api/records
Validates:
1. Response conforms to LandRecordListResponse and LandRecord schemas
2. Filtering by district, village, minConfidence, and verificationStatus
3. Detail view GET /api/records/{recordId} for synthetic records
4. PDF export GET /api/records/{recordId}/export-pdf for synthetic records
5. Preservation of existing endpoints
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.schemas.record import LandRecordListResponse, LandRecord


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.asyncio
async def test_get_records_list_schema():
    """Verify GET /api/records returns valid LandRecordListResponse conforming to schema."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/records?limit=10")
        assert response.status_code == 200
        data = response.json()

        # Validate with Pydantic model
        list_response = LandRecordListResponse(**data)
        assert list_response.total > 0
        assert len(list_response.records) > 0
        assert len(list_response.records) <= 10

        # Inspect individual record contract
        rec = list_response.records[0]
        assert rec.recordId.startswith("REC-SYN-")
        assert rec.docId.startswith("DOC-SYN-")
        assert rec.documentCategory == "VILLAGE_FORM_7_12"
        assert rec.khasraNumber is not None
        assert rec.khataNumber is not None
        assert rec.ownerName is not None
        assert rec.village is not None
        assert rec.tehsil is not None
        assert rec.district is not None
        assert rec.landArea is not None
        assert rec.ownershipType is not None
        assert rec.overallConfidence == 1.0
        assert rec.verificationStatus.value == "verified"
        assert isinstance(rec.confidenceScores, dict)
        assert isinstance(rec.extraDetails, dict)
        assert "ulpinCode" in rec.extraDetails
        assert "digitalSignatureHash" in rec.extraDetails


@pytest.mark.asyncio
async def test_filter_by_district():
    """Verify GET /api/records filtering by district (e.g. Pune)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/records?district=Pune&limit=10")
        assert response.status_code == 200
        data = response.json()
        list_response = LandRecordListResponse(**data)
        assert list_response.total > 0
        for rec in list_response.records:
            assert "pune" in rec.district.lower() or "पुणे" in rec.district


@pytest.mark.asyncio
async def test_filter_by_village():
    """Verify GET /api/records filtering by village (e.g. Wagholi)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/records?district=Pune&village=Wagholi&limit=10")
        assert response.status_code == 200
        data = response.json()
        list_response = LandRecordListResponse(**data)
        assert list_response.total >= 1
        for rec in list_response.records:
            assert "wagholi" in rec.village.lower() or "वाघोली" in rec.village


@pytest.mark.asyncio
async def test_filter_by_min_confidence():
    """Verify GET /api/records filtering by minConfidence."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # minConfidence 0.9 should include records with 1.0 confidence
        resp_included = await ac.get("/api/records?minConfidence=0.9&limit=5")
        assert resp_included.status_code == 200
        data_inc = resp_included.json()
        assert len(data_inc["records"]) > 0

        # minConfidence 1.1 should filter out 1.0 confidence records
        resp_excluded = await ac.get("/api/records?minConfidence=1.1&limit=5")
        assert resp_excluded.status_code == 200
        data_exc = resp_excluded.json()
        assert len(data_exc["records"]) == 0


@pytest.mark.asyncio
async def test_filter_by_status():
    """Verify GET /api/records filtering by verificationStatus."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 'verified' status should return records
        resp_verified = await ac.get("/api/records?status=verified&limit=5")
        assert resp_verified.status_code == 200
        assert len(resp_verified.json()["records"]) > 0

        # 'pending-review' status should not match canonical state records
        resp_pending = await ac.get("/api/records?status=pending-review&limit=5")
        assert resp_pending.status_code == 200
        assert len(resp_pending.json()["records"]) == 0


@pytest.mark.asyncio
async def test_get_synthetic_record_detail():
    """Verify GET /api/records/{recordId} retrieves synthetic record detail."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Fetch first record from listing
        list_resp = await ac.get("/api/records?limit=1")
        assert list_resp.status_code == 200
        first_rec = list_resp.json()["records"][0]
        record_id = first_rec["recordId"]

        # 2. Fetch detail
        detail_resp = await ac.get(f"/api/records/{record_id}")
        assert detail_resp.status_code == 200
        detail_data = detail_resp.json()
        rec = LandRecord(**detail_data)
        assert rec.recordId == record_id
        assert rec.khasraNumber == first_rec["khasraNumber"]
        assert rec.khataNumber == first_rec["khataNumber"]


@pytest.mark.asyncio
async def test_get_nonexistent_record_404():
    """Verify GET /api/records/{recordId} returns 404 for invalid record."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/records/REC-NONEXISTENT-9999999")
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_export_pdf_for_synthetic_record():
    """Verify GET /api/records/{recordId}/export-pdf streams PDF for synthetic record."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        list_resp = await ac.get("/api/records?limit=1")
        record_id = list_resp.json()["records"][0]["recordId"]

        pdf_resp = await ac.get(f"/api/records/{record_id}/export-pdf?lang=mr")
        assert pdf_resp.status_code == 200
        assert pdf_resp.headers["content-type"] == "application/pdf"
        assert pdf_resp.content.startswith(b"%PDF")


@pytest.mark.asyncio
async def test_existing_endpoints_preserved():
    """Verify existing endpoints like /duplicates and /verification-queue remain active."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        dup_resp = await ac.get("/api/records/duplicates")
        assert dup_resp.status_code == 200
        assert "duplicates" in dup_resp.json()

        queue_resp = await ac.get("/api/records/verification-queue")
        assert queue_resp.status_code == 200
        assert "items" in queue_resp.json()

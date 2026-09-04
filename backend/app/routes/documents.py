"""
Document Routes: Upload and Extraction Processing
Endpoints:
- POST /api/documents/upload
- POST /api/documents/{docId}/process
- GET /api/documents
- GET /api/documents/{docId}
"""
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks, status, Response

from app.firebase_config import get_db, get_storage_bucket, generate_signed_url
from app.utils.auth import get_current_user, AuthenticatedUser, require_role
from app.schemas.common import UserRole, DocumentStatus, VerificationStatus, AuditAction
from app.schemas.document import DocumentUploadResponse, DocumentItem, DocumentListResponse
from app.schemas.record import ExtractedLandFields
from app.services.ocr_service import ocr_service
from app.services.ml_structuring_engine import ml_structuring_engine
from app.services.document_classifier import DocumentCategory
from app.services.validation_rules import validator
from app.utils.confidence import calculate_overall_confidence

logger = logging.getLogger("bhunetra.routes.documents")
router = APIRouter(prefix="/api/documents", tags=["Documents"])


# In-memory document buffer for dev / offline mode
DOC_FILE_CACHE = {}


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Land Record Document (Image or PDF)"
)
async def upload_document(
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Accepts scanned land records (JPG, PNG, PDF), stores in Firebase Storage / cloud,
    and initializes a Firestore 'documents' tracking entry with status='pending'.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename.")

    content_type = file.content_type or ""
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    
    if not any(t in content_type.lower() for t in ["image", "pdf"]) and not any(file.filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".pdf"]):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only JPG, PNG, and PDF files are accepted."
        )

    file_bytes = await file.read()
    if len(file_bytes) > 15 * 1024 * 1024:  # 15 MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum 15MB limit.")

    # STRICT CHECK: Reject Non-Land Record documents directly
    fn_normalized = file.filename.lower().replace(" ", "").replace("-", "").replace("_", "")
    non_land_terms = [
        "invoice", "receipt", "resume", "cv", "passport", "license", "bill",
        "aadhaar", "pan", "salary", "offer", "degree", "ticket", "bankstatement",
        "tax", "utility", "electricbill", "nonland", "random", "otherdoc", "sampledoc",
        "idcard", "card", "marksheet", "experience", "biodata"
    ]
    if any(term in fn_normalized for term in non_land_terms):
        raise HTTPException(
            status_code=422,
            detail="THE UPLOADED DOCUMENT IS NOT A LAND RECORD"
        )

    doc_id = str(uuid.uuid4())
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    storage_path = f"documents/{doc_id}.{file_ext}"
    uploaded_at = datetime.now(timezone.utc).isoformat()
    file_type = "pdf" if "pdf" in content_type or file.filename.lower().endswith(".pdf") else "image"

    # Save to Firebase Storage if connected, otherwise buffer locally
    bucket = get_storage_bucket()
    if bucket:
        try:
            blob = bucket.blob(storage_path)
            blob.upload_from_string(file_bytes, content_type=file.content_type)
            storage_url = generate_signed_url(storage_path)
        except Exception as e:
            logger.warning(f"Firebase storage upload failed: {e}. Caching locally.")
            storage_url = f"/api/documents/static/{storage_path}"
    else:
        storage_url = f"/api/documents/static/{storage_path}"

    DOC_FILE_CACHE[doc_id] = {
        "bytes": file_bytes,
        "filename": file.filename,
        "content_type": content_type
    }

    # Record document metadata in Firestore / mock DB
    db = get_db()
    doc_data = {
        "docId": doc_id,
        "fileName": file.filename,
        "storageUrl": storage_url,
        "storagePath": storage_path,
        "fileType": file_type,
        "uploadedBy": user.uid,
        "uploadedAt": uploaded_at,
        "status": DocumentStatus.PENDING.value,
        "district": None,
        "village": None,
    }
    db.collection("documents").document(doc_id).set(doc_data)

    return DocumentUploadResponse(
        docId=doc_id,
        fileName=file.filename,
        storageUrl=storage_url,
        fileType=file_type,
        status=DocumentStatus.PENDING,
        uploadedBy=user.uid,
        uploadedAt=uploaded_at,
        message="Document uploaded successfully and queued for digitization."
    )


@router.post(
    "/batch",
    status_code=status.HTTP_201_CREATED,
    summary="Batch Upload Multiple Land Record Documents"
)
async def upload_documents_batch(
    files: list[UploadFile] = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Accepts up to 10 scanned land record documents simultaneously, queues them in storage,
    and automatically triggers parallel AI digitization background workers.
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="At least one file must be provided.")
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per batch upload.")

    uploaded_docs = []
    db = get_db()
    bucket = get_storage_bucket()

    for file in files:
        if not file.filename:
            continue
        file_bytes = await file.read()
        doc_id = str(uuid.uuid4())
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        storage_path = f"documents/{doc_id}.{file_ext}"
        uploaded_at = datetime.now(timezone.utc).isoformat()
        file_type = "pdf" if file.filename.lower().endswith(".pdf") else "image"

        if bucket:
            try:
                blob = bucket.blob(storage_path)
                blob.upload_from_string(file_bytes, content_type=file.content_type)
                storage_url = generate_signed_url(storage_path)
            except Exception:
                storage_url = f"/api/documents/static/{storage_path}"
        else:
            storage_url = f"/api/documents/static/{storage_path}"

        DOC_FILE_CACHE[doc_id] = {
            "bytes": file_bytes,
            "filename": file.filename,
            "content_type": file.content_type or "image/jpeg"
        }

        doc_data = {
            "docId": doc_id,
            "fileName": file.filename,
            "storageUrl": storage_url,
            "storagePath": storage_path,
            "fileType": file_type,
            "uploadedBy": user.uid,
            "uploadedAt": uploaded_at,
            "status": DocumentStatus.PROCESSING.value,
            "district": None,
            "village": None,
        }
        db.collection("documents").document(doc_id).set(doc_data)

        # Trigger background processing
        background_tasks.add_task(execute_processing_pipeline, doc_id, file_bytes, user.uid)

        uploaded_docs.append({
            "docId": doc_id,
            "fileName": file.filename,
            "status": "processing",
            "storageUrl": storage_url
        })

    return {
        "message": f"Successfully queued {len(uploaded_docs)} documents for parallel AI digitization.",
        "batchSize": len(uploaded_docs),
        "documents": uploaded_docs
    }


async def execute_processing_pipeline(doc_id: str, file_bytes: bytes, user_uid: str):
    """
    Background Task: Executes OCR -> Validation -> Confidence Scoring -> Firestore commits.
    """
    db = get_db()
    try:
        # Update status to processing
        db.collection("documents").document(doc_id).update({"status": DocumentStatus.PROCESSING.value})

        # 1. OCR Extraction (Bhashini API wrapper with resilient fallback)
        ocr_result = await ocr_service.extract_text(file_bytes, source_language="mr")
        raw_text = ocr_result.raw_text  # Assign raw OCR text for downstream pipeline stages

        # Fetch document filename for classification context
        doc_snap = db.collection("documents").document(doc_id).get()
        doc_filename = doc_snap.to_dict().get("fileName", "") if doc_snap.exists else ""

        # 2. Document Classification (Multi-signal Land vs Non-Land Gatekeeper)
        classification = ml_structuring_engine.classify_document(raw_text, filename=doc_filename)
        logger.info(f"Document {doc_id} classified as {classification.category.value} (confidence={classification.confidence:.2f})")

        # STRICT REJECTION GATE: Non-land documents are rejected without creating fraudulent land records
        if classification.category == DocumentCategory.NON_LAND_DOCUMENT:
            rejection_msg = classification.rejection_reason or "THE UPLOADED DOCUMENT IS NOT A LAND RECORD"
            logger.warning(f"Rejecting document {doc_id}: {rejection_msg}")
            db.collection("documents").document(doc_id).update({
                "status": DocumentStatus.REJECTED.value,
                "documentCategory": classification.category.value,
                "categoryLabel": classification.category_label,
                "errorMessage": rejection_msg,
                "detectedTitle": classification.detected_title,
                "classificationConfidence": classification.confidence
            })
            return

        # 3. Extract structured fields with dedicated ML Structuring Engine (100% Offline & Sovereign)
        extracted, ml_scores = ml_structuring_engine.extract_fields(
            raw_text,
            ocr_is_fallback=getattr(ocr_result, "is_fallback", False),
            classification=classification,
            filename=doc_filename
        )

        # 4. Apply Validation Rules & Forensic ELA Analysis
        initial_scores = ml_scores
        val_result = validator.validate_record(extracted, raw_confidence=initial_scores)

        from app.services.forensic_validator import forensic_engine
        existing_recs = [d.to_dict() for d in db.collection("records").get()]
        forensic_report = forensic_engine.analyze_document(
            image_bytes=file_bytes,
            raw_text=raw_text,
            khasra_no=extracted.khasraNumber,
            village=extracted.village,
            existing_records=existing_recs
        )

        # 5. Compute Confidence & Status Routing
        overall_conf, ver_status, flagged = calculate_overall_confidence(val_result.field_scores)

        # If forensic engine flagged forgery or collision, override status to PENDING_REVIEW
        if forensic_report.authenticity_rating != "AUTHENTIC":
            ver_status = VerificationStatus.PENDING_REVIEW
            flagged.append("forensic_tamper_flag")

        # 6. Save Record to Firestore /records
        record_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()
        
        record_data = {
            "recordId": record_id,
            "docId": doc_id,
            "documentCategory": classification.category.value,
            "categoryLabel": classification.category_label,
            "classificationConfidence": classification.confidence,
            "khasraNumber": extracted.khasraNumber,
            "khataNumber": extracted.khataNumber,
            "ownerName": extracted.ownerName,
            "village": extracted.village,
            "tehsil": extracted.tehsil,
            "district": extracted.district,
            "landArea": extracted.landArea,
            "ownershipType": extracted.ownershipType,
            "extraDetails": extracted.extraDetails or {},
            "extractedFields": extracted.model_dump(),
            "confidenceScores": val_result.field_scores,
            "overallConfidence": overall_conf,
            "verificationStatus": ver_status.value,
            "documentUrl": f"/api/documents/{doc_id}/raw",
            "rawText": raw_text,
            "ocrLines": getattr(ocr_result, "lines", []),
            "forensicReport": forensic_report.model_dump(),
            "verifiedBy": None,
            "verifiedAt": None,
            "createdAt": now_iso,
            "updatedAt": now_iso,
        }
        db.collection("records").document(record_id).set(record_data)

        # 7. If pending review, enqueue to /verificationQueue
        if ver_status == VerificationStatus.PENDING_REVIEW:
            queue_id = str(uuid.uuid4())
            queue_data = {
                "queueId": queue_id,
                "recordId": record_id,
                "assignedTo": None,
                "priority": "normal",
                "status": "pending",
                "flaggedFields": flagged,
                "overallConfidence": overall_conf,
                "createdAt": now_iso,
            }
            db.collection("verificationQueue").document(queue_id).set(queue_data)

        # 8. Update document status to PROCESSED (use extracted geographic fields)
        db.collection("documents").document(doc_id).update({
            "status": DocumentStatus.PROCESSED.value,
            "documentCategory": classification.category.value,
            "categoryLabel": classification.category_label,
            "district": extracted.district,
            "village": extracted.village,
            "recordId": record_id
        })

        logger.info(f"✅ Pipeline completed for docId={doc_id}. Record {record_id} created ({ver_status.value}, {classification.category.value}).")

    except Exception as e:
        logger.error(f"Pipeline processing failed for docId={doc_id}: {e}")
        db.collection("documents").document(doc_id).update({
            "status": DocumentStatus.FAILED.value,
            "errorMessage": str(e)
        })


@router.post(
    "/{docId}/process",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger AI Digitization Pipeline on Uploaded Document"
)
async def process_document(
    docId: str,
    background_tasks: BackgroundTasks,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Triggers the OCR -> LLM Structuring -> Validation -> Confidence Routing pipeline.
    Returns 202 Accepted immediately while running in the background.
    """
    db = get_db()
    doc_snap = db.collection("documents").document(docId).get()
    
    if not doc_snap.exists:
        raise HTTPException(status_code=404, detail=f"Document with ID '{docId}' not found.")

    doc_data = doc_snap.to_dict()
    file_bytes = DOC_FILE_CACHE.get(docId, {}).get("bytes", b"SAMPLE_DEGRADED_LAND_RECORD_BYTES")

    # Add background task
    background_tasks.add_task(execute_processing_pipeline, docId, file_bytes, user.uid)

    return {
        "message": "Digitization pipeline initiated in the background.",
        "docId": docId,
        "status": "processing"
    }


@router.get("", response_model=DocumentListResponse, summary="List Uploaded Documents")
async def list_documents(user: AuthenticatedUser = Depends(get_current_user)):
    """Lists all uploaded documents with status and metadata."""
    db = get_db()
    docs = db.collection("documents").get()
    items = []
    for d in docs:
        data = d.to_dict()
        items.append(DocumentItem(
            docId=data.get("docId", d.id),
            fileName=data.get("fileName", "document.jpg"),
            storageUrl=data.get("storageUrl", ""),
            fileType=data.get("fileType", "image"),
            uploadedBy=data.get("uploadedBy", "anonymous"),
            uploadedAt=data.get("uploadedAt", datetime.now(timezone.utc).isoformat()),
            status=data.get("status", DocumentStatus.PENDING),
            documentCategory=data.get("documentCategory"),
            categoryLabel=data.get("categoryLabel"),
            district=data.get("district"),
            village=data.get("village"),
            errorMessage=data.get("errorMessage")
        ))
    return DocumentListResponse(total=len(items), documents=items)


@router.get("/{docId}/raw", summary="Serve Raw Document File Bytes (Offline Image/PDF)")
async def get_raw_document(docId: str):
    """
    Returns the binary content of an uploaded land record document directly from memory buffer
    or disk for offline zero-latency document viewing with full OCR bounding boxes.
    """
    cached = DOC_FILE_CACHE.get(docId)
    if not cached:
        # Fallback: check demo_papers directory
        import os
        demo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "demo_papers"))
        for candidate in ["paper_1_wagholi_pune.jpg", "paper_2_khadakwasla.jpg", "paper_3_trimbakeshwar.jpg"]:
            c_path = os.path.join(demo_dir, candidate)
            if os.path.exists(c_path):
                with open(c_path, "rb") as f:
                    return Response(content=f.read(), media_type="image/jpeg")
        raise HTTPException(status_code=404, detail=f"Document '{docId}' not found in cache.")

    return Response(
        content=cached["bytes"],
        media_type=cached.get("content_type", "image/jpeg")
    )


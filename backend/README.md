# Bhunetra Backend (SIH26018)
## Intelligent Land Record Digitization and Validation System
**Ministry of Rural Development & Department of Land Resources (DoLR)**
*Status: Live Integration active with React/Vite Frontend*

---

## 🏛️ System Architecture

```
Client (React + Vite)
        │
        ▼ (HTTP REST + Multipart Upload / Auth Bearer Token)
FastAPI Backend Gateway (Port 8000)
 ├── Security & RBAC: Firebase Auth JWT Verification
 ├── Storage: Firebase Cloud Storage (Signed URLs) / Local Dev Storage
 ├── AI OCR Service: Bhashini API Wrapper (with Resilient Offline Engine)
 ├── LLM Structuring: Groq API (Llama 3.3 70B)
 ├── Validation Rules Engine: Land Record Sanitization & Duplicate Detection
 ├── Confidence Engine: Weighted Scoring (Auto-Approved vs Pending Review)
 └── Database: Cloud Firestore / Immutable Audit Trail (/auditLog)
```

---

## 📂 Project Structure

```
bhunetra backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI entrypoint, CORS, rate-limiting, error handling
│   ├── config.py                   # Pydantic Settings & environment variables (.env)
│   ├── firebase_config.py          # Firebase Admin SDK, Firestore DB, Storage, signed URLs
│   ├── schemas/                    # Pydantic v2 schemas (API Data Contracts)
│   │   ├── __init__.py
│   │   ├── common.py               # Enums (UserRole, DocumentStatus, VerificationStatus, etc.)
│   │   ├── document.py             # Document upload & list schemas
│   │   ├── record.py               # Land record, extracted fields, duplicate groups
│   │   ├── verification.py         # Verification PATCH & Queue schemas
│   │   ├── audit.py                # Immutable audit log schemas
│   │   └── dashboard.py            # Aggregate statistics & district metrics
│   ├── services/                   # Core Business & AI Engines
│   │   ├── __init__.py
│   │   ├── ocr_service.py          # Bhashini OCR API wrapper + resilient fallback engine
│   │   └── validation_rules.py     # Revenue field validation & duplicate detection
│   ├── utils/                      # Authentication & Scoring Helpers
│   │   ├── __init__.py
│   │   ├── auth.py                 # Firebase JWT verification & RBAC dependencies
│   │   └── confidence.py           # Per-field & overall weighted confidence calculator
│   └── routes/                     # API Routers
│       ├── __init__.py
│       ├── documents.py            # POST /api/documents/upload, POST /api/documents/:id/process
│       ├── records.py              # GET /api/records, GET /:id, PATCH /:id/verify, GET /duplicates
│       └── dashboard.py            # GET /api/dashboard/stats, GET /api/auditLog
├── data/
│   └── sample_documents/           # Sample degraded test documents & generator
├── tests/
│   ├── __init__.py
│   └── test_ocr_and_validation.py  # Automated Pytest suite
├── .env.example                    # Sample environment variables
├── requirements.txt                # Python dependencies
└── README.md
```

---

## ⚡ Quickstart & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```ini
# Server
ENVIRONMENT=development
PORT=8000
DEBUG=True

# Frontend Integration CORS (React/Vite)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Firebase Cloud Connection (Optional during early dev)
FIREBASE_CREDENTIALS_PATH=./firebase-adminsdk.json
FIREBASE_STORAGE_BUCKET=bhunetra-sih.appspot.com
ALLOW_DEV_AUTH_BYPASS=True

# Bhashini OCR API
BHASHINI_API_KEY=your_bhashini_key
BHASHINI_USER_ID=your_bhashini_user_id
BHASHINI_PIPELINE_ID=your_pipeline_id

# Groq LLM API
GROQ_API_KEY=your_groq_key
```

### 3. Run Standalone OCR Test
Run OCR directly on a test degraded document:
```bash
python -m app.services.ocr_service data/sample_documents/sample_degraded_record.jpg
```

### 4. Run Automated Tests
```bash
pytest -v
```

### 5. Start the FastAPI Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at: **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 🔌 Frontend & Cloud Wiring Guide

### Connecting the Frontend (React + Vite)
1. Ensure your React dev server (`http://localhost:5173`) is listed in `CORS_ORIGINS` in `.env`.
2. When calling API endpoints:
   - Pass the Firebase ID token in header: `Authorization: Bearer <FIREBASE_ID_TOKEN>`.
   - In dev mode, you can pass `Authorization: Bearer dev-admin-token`, `dev-verifier-token`, or `dev-officer-token`.

### Connecting Firebase Cloud Services
1. Download your Firebase service account private key JSON from **Firebase Console -> Project Settings -> Service Accounts -> Generate new private key**.
2. Save the file as `firebase-adminsdk.json` in the root folder of this project.
3. The backend will automatically detect it and connect to live Google Cloud Firestore and Firebase Storage.

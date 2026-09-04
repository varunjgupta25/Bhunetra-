# Bhunetra (भूनेत्र) 🇮🇳
> **Sovereign, Offline-First Land Record Digitization, Forensic Verification & Citizen Gateway System**  
> *Developed for Indian Land Governance & Built for Shesh OS*

[![Bhunetra Quality Gates](https://github.com/varunjgupta25/Bhunetra-/actions/workflows/quality-gates.yml/badge.svg)](https://github.com/varunjgupta25/Bhunetra-/actions/workflows/quality-gates.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev)
[![EasyOCR](https://img.shields.io/badge/OCR-EasyOCR%20(Devanagari)-FF6F00)](https://github.com/JaidedAI/EasyOCR)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-3776AB?logo=python&logoColor=white)](https://python.org)

---

## 🏛️ Executive Summary

**Bhunetra** is an India-native, privacy-first land record digitization and forensic auditing engine designed to process scanned historical and modern land revenue documents (Form 7/12 extract, Form 8-A, Property Cards, Sale Deeds) across Indian languages with 100% offline sovereign capability.

It eliminates data leakage by processing OCR, Devanagari numeral normalization, and forensic Error Level Analysis (ELA) entirely on-device, without requiring external cloud API dependencies.

---

## ✨ Key Capabilities

1. **Devanagari-Native Multilingual OCR Pipeline**:
   - Primary: **EasyOCR Singleton** (offline, Devanagari script native with CRAFT text detector).
   - Resilient 5-layer fallback chain (*Bhashini Dhruva $\to$ EasyOCR $\to$ PyTesseract $\to$ Google Vision $\to$ Simulated*).
   - Marathi/Devanagari numeral mapping (`०-९` $\to$ `0-9`) with tabular multiline parsing.
   - Intelligent Document Gatekeeper & Classifier (Form 7/12, 8-A, Property Cards, Sale Deeds, Non-Land Document rejection).

2. **Interactive Human-in-the-Loop Verification Workspace**:
   - High-fidelity scanned document viewer with zoom (70%–175%), rotation, and layer toggles (*OCR Overlays*, *Raw Scan*, *Text Layer*).
   - Bi-directional field focus synchronization: focusing a form field (Khasra No, Khata No, Owner Name, Area, Village) illuminates the matching bounding box on the original document.

3. **Public Citizen Gateway**:
   - Multi-criteria search bar supporting Devanagari & English queries.
   - Instant single-pass Land Extract Certificate generation across **22 Official Constitutional Languages (8th Schedule)** with digital verification seal and QR code.

4. **Forensic Integrity & Tamper Protection**:
   - Image Error Level Analysis (ELA) for pixel manipulation detection.
   - Mahabhulekh mutation cross-referencing and geographic collision detection.

---

## 📁 Repository Architecture

```text
Bhunetra-/
├── backend/                  # Active FastAPI Backend API
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint & unified SPA mounting
│   │   ├── routes/           # REST endpoints (documents, records, dashboard, audit)
│   │   ├── services/         # EasyOCR, ML Structuring Engine, Classifier, Forensic ELA
│   │   ├── schemas/          # Pydantic data contracts
│   │   └── utils/            # Confidence scoring & JWT auth utilities
│   ├── tests/                # Automated pytest suite (20/20 passing)
│   └── requirements.txt      # Python dependencies (EasyOCR, FastAPI, PyTorch, etc.)
│
├── frontend/                 # Active React 19 + Vite Frontend
│   ├── src/
│   │   ├── pages/            # Dashboard, Upload, Verification, CitizenPortal, Analytics
│   │   ├── components/       # UploadForm, DigitizedPdfModal, ConfidenceBadge, Navbar
│   │   ├── store/            # Zustand global state store
│   │   └── utils/            # 22 Constitutional Languages dictionary
│   ├── package.json          # Frontend dependencies & TailwindCSS
│   └── vite.config.js        # Vite production bundler
│
├── demo_papers/              # Standard test papers (Wagholi 7/12, Khadakwasla, Trimbakeshwar 8A, Forged)
├── .github/workflows/        # Automated CI Quality Gates (Lint, Build, PyTest)
├── start.bat                 # 1-Click Windows Dev Launcher
├── start.ps1                 # PowerShell Launcher
└── start_server.py           # Unified Production SPA Server
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### 1. Start with 1-Click Script (Windows)
```cmd
start.bat
```
This automatically launches:
- **Backend API**: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)
- **Frontend App**: `http://localhost:5173`

---

### 2. Manual Setup

#### Backend
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Automated Testing & Quality Gates

Run the test suite across both stacks:

```bash
# Run Backend Tests (20 tests covering OCR, Multi-Document extraction, and Classification)
cd backend
pytest -v tests

# Run Frontend Build Verification
cd frontend
npm run build
```

---

## 🔐 Data Sovereignty & Offline Guarantee

Bhunetra is intentionally engineered with **zero external cloud API requirements** as default. All OCR inferencing, normalization, and verification steps execute locally on-premise to comply with Indian data sovereignty principles and mission-critical land records security.
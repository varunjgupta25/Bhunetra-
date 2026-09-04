# Bhunetra

Intelligent land record digitization and validation platform with a React frontend and FastAPI backend.

## Active architecture (source of truth)

- **Frontend (active):** `/frontend` (React + Vite)
- **Backend (active):** `/backend` (FastAPI)
- **Legacy backend (archived, not maintained):** `/src` TypeScript/Express (`RuralRoute`)

The active product is Bhunetra. New feature work, bug fixes, CI checks, and operational maintenance should target `/backend` and `/frontend`.

## Repository layout

```text
Bhunetra-/
├── backend/          # Active FastAPI API
├── frontend/         # Active React app
├── src/              # Legacy archived backend (read-only for reference)
├── demo_papers/      # Demo/sample artifacts
├── prisma/           # Legacy RuralRoute Prisma assets
├── start_server.py   # Unified launcher (build frontend + serve through backend)
├── start.ps1         # Windows local dev launcher (two terminals)
└── start.bat         # Windows local dev launcher (two terminals)
```

## Quick start

### 1) Backend setup

```bash
cd /absolute/path/to/Bhunetra-/backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 2) Frontend setup

```bash
cd /absolute/path/to/Bhunetra-/frontend
npm ci
cp .env.example .env
```

### 3) Local development

Run backend and frontend separately:

```bash
# terminal 1
cd /absolute/path/to/Bhunetra-/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# terminal 2
cd /absolute/path/to/Bhunetra-/frontend
npm run dev
```

Or use repository launcher:

```bash
cd /absolute/path/to/Bhunetra-
python start_server.py
```

## Maintenance workflows

### Quality gates (active stack)

```bash
cd /absolute/path/to/Bhunetra-/frontend && npm run lint && npm run build
cd /absolute/path/to/Bhunetra-/backend && pytest -v tests
```

### Security/config hygiene

- Keep `.env` files out of version control.
- Keep Firebase service credentials (`firebase-adminsdk.json`) out of version control.
- Use `.env.example` files as templates only.
- Keep generated datasets and large synthetic data excluded from git.

## Notes on legacy code

- `/src`, root `tsconfig.json`, and `/prisma` come from a previous RuralRoute backend track.
- They are retained for reference but are not part of Bhunetra’s active release path.
# ==============================================================================
# BHUNETRA - Production image (FastAPI + React SPA on a single port)
# ==============================================================================

# ---- Stage 1: build the React/Vite frontend ----------------------------------
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend

# Firebase web config is public and baked into the bundle at build time.
# VITE_API_BASE_URL stays empty so the SPA calls the API on the same origin.
ARG VITE_API_BASE_URL=""
ARG VITE_FIREBASE_API_KEY=""
ARG VITE_FIREBASE_AUTH_DOMAIN=""
ARG VITE_FIREBASE_PROJECT_ID=""
ARG VITE_FIREBASE_STORAGE_BUCKET=""
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=""
ARG VITE_FIREBASE_APP_ID=""

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Python runtime ---------------------------------------------------
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    EASYOCR_MODULE_PATH=/opt/easyocr \
    ENVIRONMENT=production \
    DEBUG=False \
    ALLOW_DEV_AUTH_BYPASS=False \
    PORT=8000

RUN apt-get update \
    && apt-get install -y --no-install-recommends poppler-utils libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# CPU-only PyTorch first (avoids multi-GB CUDA wheels), then the pinned requirements
COPY backend/requirements.txt ./
RUN pip install --index-url https://download.pytorch.org/whl/cpu torch==2.14.0 torchvision==0.29.0 \
    && pip install -r requirements.txt

# Pre-download EasyOCR weights so the first OCR request does not fetch ~100 MB
RUN python -c "import easyocr; easyocr.Reader(['mr', 'hi', 'en'], gpu=False, verbose=False)"

COPY backend/ ./
COPY demo_papers/ /app/demo_papers/
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Uploaded documents live here: mount a persistent disk at /app/backend/uploads
RUN mkdir -p /app/backend/uploads

EXPOSE 8000

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]

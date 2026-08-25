"""
FastAPI Main Application Entrypoint
Bhunetra: Intelligent Land Record Digitization and Validation System (SIH26018)
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.firebase_config import initialize_firebase, is_firebase_connected
from app.routes.documents import router as documents_router
from app.routes.records import router as records_router
from app.routes.dashboard import router as dashboard_router

# Setup Logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("bhunetra.main")

# Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI application"""
    logger.info("🚀 Starting Bhunetra Backend API (SIH26018)...")
    logger.info(f"Environment: {settings.ENVIRONMENT} | Debug: {settings.DEBUG}")
    
    # Initialize cloud services
    initialize_firebase()
    if is_firebase_connected():
        logger.info("🔥 Connected to live Google Cloud Firebase services.")
    else:
        logger.info("⚡ Running with local development storage & mock Firestore.")

    yield
    logger.info("🛑 Shutting down Bhunetra Backend API...")


# Initialize FastAPI Application
app = FastAPI(
    title="Bhunetra API",
    description="Intelligent Land Record Digitization & Human-in-the-Loop Validation System (SIH26018)",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Attach state for slowapi
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware for Frontend React/Vite integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred. Please check logs.",
            "path": request.url.path
        }
    )


# Health Check & Root Endpoints
@app.get("/", tags=["Health"])
async def root():
    return {
        "project": "Bhunetra Backend (SIH26018)",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "cloudConnected": is_firebase_connected()
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "firebaseConnected": is_firebase_connected(),
        "bhashiniConfigured": bool(settings.BHASHINI_API_KEY),
        "groqConfigured": bool(settings.GROQ_API_KEY)
    }


# Include Domain Routers
app.include_router(documents_router)
app.include_router(records_router)
app.include_router(dashboard_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)

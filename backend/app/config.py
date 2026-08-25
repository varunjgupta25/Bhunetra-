"""
Application Configuration and Settings Management
Loads environment variables from .env using Pydantic Settings
"""
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Bhunetra Backend"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000

    # CORS Settings (Frontend integration)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[List[str], str]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    # Firebase Admin SDK Configuration
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-adminsdk.json"
    FIREBASE_STORAGE_BUCKET: str = "bhunetra-sih.appspot.com"
    ALLOW_DEV_AUTH_BYPASS: bool = True

    # Bhashini OCR API Configuration
    BHASHINI_API_KEY: str = Field(default="", description="Bhashini Authorization Key")
    BHASHINI_USER_ID: str = Field(default="", description="Bhashini User ID")
    BHASHINI_PIPELINE_ID: str = Field(default="", description="Bhashini Pipeline ID")
    BHASHINI_INFERENCE_URL: str = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    # Groq LLM API Configuration
    GROQ_API_KEY: str = Field(default="", description="Groq API Key for Llama 3.3")
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # Fallback OCR / Vision
    GOOGLE_VISION_API_KEY: str = ""

    # Pipeline Confidence Settings
    AUTO_APPROVE_CONFIDENCE_THRESHOLD: float = 0.75

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

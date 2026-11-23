from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "GharKaGod"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "gharkagod-secure-jwt-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./gharkagod.db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Gemini GenAI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TIMEOUT_SECONDS: int = 10
    
    # Outdoor Environmental Provider
    OPEN_METEO_AQI_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    AQI_CACHE_TTL_SECONDS: int = 1800  # 30 minutes
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

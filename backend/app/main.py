import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routers import (
    auth, households, assessments, recommendations,
    tracker, environmental, guest
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("gharkagod")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing GharKaGod SaaS Database Tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized successfully.")
    yield
    logger.info("Shutting down GharKaGod SaaS application.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "GharKaGod (घर का गॉड) - GenAI-powered household indoor air pollution SaaS. "
        "Strictly zero indoor sensor claims. Authoritative environmental & public health mitigations."
    ),
    lifespan=lifespan
)

# Restrictive CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# Mount routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(households.router, prefix=settings.API_V1_PREFIX)
app.include_router(assessments.router, prefix=settings.API_V1_PREFIX)
app.include_router(recommendations.router, prefix=settings.API_V1_PREFIX)
app.include_router(tracker.router, prefix=settings.API_V1_PREFIX)
app.include_router(environmental.router, prefix=settings.API_V1_PREFIX)
app.include_router(guest.router, prefix=settings.API_V1_PREFIX)

@app.get("/health", tags=["Health"])
@app.get(f"{settings.API_V1_PREFIX}/health", tags=["Health"])
def healthcheck():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "scientific_integrity": "strict_zero_indoor_sensor_policy"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to GharKaGod API. Visit /docs for OpenAPI interactive specification.",
        "version": settings.VERSION
    }

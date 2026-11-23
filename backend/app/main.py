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

# Static frontend SPA serving (for production container / Cloud Run deployment)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

static_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
]
static_dir = next((d for d in static_candidates if os.path.isdir(d)), None)

@app.get("/", tags=["Root"])
def root():
    if static_dir:
        index_path = os.path.join(static_dir, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
    return {
        "message": "Welcome to GharKaGod API. Visit /docs for OpenAPI interactive specification.",
        "version": settings.VERSION
    }

if static_dir:
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path == "health":
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_path = os.path.join(static_dir, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        return JSONResponse(status_code=404, content={"detail": "Static frontend not found"})


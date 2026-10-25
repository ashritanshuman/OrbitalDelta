"""FastAPI application factory for ORBITAL DELTA."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analyze, health, samples
from app.utils.errors import setup_exception_handlers

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("orbital_delta.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    has_gemini = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5)
    logger.info("==================================================")
    logger.info("  ORBITAL DELTA // SATELLITE CHANGE DETECTION API")
    logger.info(f"  Model Engine:     {settings.GEMINI_MODEL}")
    logger.info(f"  Gemini Active:    {has_gemini}")
    logger.info(f"  Max Image Side:   {settings.MAX_IMAGE_SIDE}px")
    logger.info(f"  Max Upload:       {settings.MAX_UPLOAD_MB}MB")
    logger.info(f"  Allowed Origins:  {settings.ALLOWED_ORIGINS}")
    logger.info("==================================================")
    yield
    logger.info("Shutting down ORBITAL DELTA service.")


def create_app() -> FastAPI:
    """Instantiate and configure the FastAPI application."""
    app = FastAPI(
        title="ORBITAL DELTA // Satellite Change Detection API",
        description=(
            "Autonomous Earth observation intelligence backend for dual-epoch satellite "
            "change detection, telemetry vector discrimination, and automated report synthesis."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )

    # Configure CORS for Vite frontend (supports localhost, Vercel deployments, and custom domains)
    origins = settings.ALLOWED_ORIGINS
    if "*" in origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Register standardized error handlers
    setup_exception_handlers(app)

    # Register API routers
    app.include_router(health.router)
    app.include_router(samples.router)
    app.include_router(analyze.router)

    return app


app = create_app()

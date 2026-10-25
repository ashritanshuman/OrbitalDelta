"""Health check endpoint router."""

from fastapi import APIRouter
from app.config import settings
from app.schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["System"])


@router.get("/health", response_model=HealthResponse, summary="System Health & Telemetry Status")
async def health_check() -> HealthResponse:
    """Check backend status and Gemini API key availability."""
    has_gemini = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5)
    return HealthResponse(status="ok", gemini=has_gemini)

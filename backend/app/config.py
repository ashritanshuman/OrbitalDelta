"""Application configuration and constants."""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Load .env file from backend root directory
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    """Settings loaded from environment variables with safe defaults."""

    # API Keys & Models
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

    # CORS configuration
    _raw_origins = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    )
    ALLOWED_ORIGINS: List[str] = [
        origin.strip() for origin in _raw_origins.split(",") if origin.strip()
    ]

    # File Upload & Image Geometry Limits
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "10"))
    MAX_UPLOAD_BYTES: int = MAX_UPLOAD_MB * 1024 * 1024
    MAX_IMAGE_SIDE: int = int(os.getenv("MAX_IMAGE_SIDE", "1600"))

    # Computer Vision & Detection Pipeline Tuning Constants
    ORB_N_FEATURES: int = 4000
    HOMOGRAPHY_MIN_INLIERS: int = 25
    MIN_SCALE: float = 0.70
    MAX_SCALE: float = 1.40

    SSIM_WEIGHT: float = 0.60
    LAB_DIFF_WEIGHT: float = 0.40
    GAUSSIAN_BLUR_KERNEL: int = 7

    MIN_REGION_AREA_PERCENT: float = 0.003  # 0.3% of total raster area
    PROXIMITY_MERGE_RATIO: float = 0.02  # 2% bounding box proximity threshold
    MAX_REGIONS: int = 6

    # Allowed Classification Enums
    ALLOWED_LABELS: List[str] = [
        "Deforestation",
        "Construction",
        "Excavation",
        "Coastal change",
        "Flooding",
        "Infrastructure damage",
        "Vegetation change",
        "Other",
    ]
    ALLOWED_CLASSIFICATIONS: List[str] = ["human-made", "natural"]

    # Gemini Inference Rules
    GEMINI_TIMEOUT_SECONDS: float = 30.0
    GEMINI_MAX_RETRIES: int = 1


settings = Settings()

"""Change detection analysis endpoint router."""

import asyncio
import logging
import time
from fastapi import APIRouter, File, UploadFile, status

from app.config import settings
from app.schemas import AnalyzeResponse
from app.services.align import align_rasters
from app.services.classify import classify_and_generate_report
from app.services.detect import detect_changes
from app.services.preprocess import prepare_image_pair
from app.services.report import assemble_analysis_response
from app.utils.errors import (
    FileTooLargeError,
    InvalidImageError,
    UnsupportedMediaTypeError,
)

logger = logging.getLogger("orbital_delta.analyze")
router = APIRouter(prefix="/api", tags=["Analysis"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/tiff",
    "image/webp",
}


from typing import Union
from pathlib import Path

@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Dual-Epoch Satellite Change Detection Pipeline",
)
async def analyze_images(
    before: Union[UploadFile, str] = File(..., description="T1 Baseline orbital raster file (PNG or JPEG)"),
    after: Union[UploadFile, str] = File(..., description="T2 Comparison orbital raster file (PNG or JPEG)"),
) -> AnalyzeResponse:
    """Ingest dual-epoch satellite captures and compute localized change vectors."""
    t0 = time.perf_counter()

    async def extract_bytes(input_data: Union[UploadFile, str], role: str) -> bytes:
        if isinstance(input_data, str):
            # Resolve potential sample reference
            target_str = input_data.strip()
            # If string is a path like /samples/urban_t1.jpg
            candidate_name = Path(target_str).name if target_str and target_str != "null" else ""
            candidate_path = settings.SAMPLES_DIR / candidate_name if candidate_name else None

            if not candidate_path or not candidate_path.exists():
                # Fallback to default sample if "null" or missing
                fallback_name = f"forest_{role}.jpg"
                candidate_path = settings.SAMPLES_DIR / fallback_name

            if candidate_path and candidate_path.exists():
                return candidate_path.read_bytes()
            raise InvalidImageError(f"{role.upper()} orbital raster could not be resolved from reference: '{input_data}'.")

        # Handle UploadFile
        if input_data.content_type and input_data.content_type.lower() not in ALLOWED_CONTENT_TYPES:
            raise UnsupportedMediaTypeError(
                f"{role.upper()} file type '{input_data.content_type}' is unsupported. Require image/jpeg or image/png."
            )

        data = await input_data.read()
        if len(data) > settings.MAX_UPLOAD_BYTES:
            raise FileTooLargeError(
                f"{role.upper()} file size ({len(data)} bytes) exceeds maximum {settings.MAX_UPLOAD_MB}MB."
            )
        if len(data) == 0:
            raise InvalidImageError(f"{role.upper()} file is empty.")
        return data

    before_bytes = await extract_bytes(before, "t1")
    after_bytes = await extract_bytes(after, "t2")

    t_read = time.perf_counter()
    logger.info(f"Ingested uploads in {(t_read - t0)*1000:.1f}ms (T1: {len(before_bytes)}B, T2: {len(after_bytes)}B)")

    # 3. Preprocess and rescale (asynchronously in threadpool)
    before_rgb, after_rgb, width, height = await asyncio.to_thread(
        prepare_image_pair, before_bytes, after_bytes
    )
    t_prep = time.perf_counter()
    logger.info(f"Preprocessing completed in {(t_prep - t_read)*1000:.1f}ms")

    # 4. Homography alignment
    aligned_after, is_aligned, inliers = await asyncio.to_thread(
        align_rasters, before_rgb, after_rgb
    )
    t_align = time.perf_counter()
    logger.info(
        f"Alignment completed in {(t_align - t_prep)*1000:.1f}ms (aligned: {is_aligned}, inliers: {inliers})"
    )

    # 5. Radiometric normalization and change detection
    raw_regions, changed_pct, overlay_url, _ = await asyncio.to_thread(
        detect_changes, before_rgb, aligned_after
    )
    t_detect = time.perf_counter()
    logger.info(
        f"Detection completed in {(t_detect - t_align)*1000:.1f}ms ({len(raw_regions)} regions, {changed_pct}% area)"
    )

    # 6. Classification & narrative generation (Gemini or heuristic fallback)
    classified_regions, report, source = await classify_and_generate_report(
        before_rgb, aligned_after, raw_regions, changed_pct
    )
    t_classify = time.perf_counter()
    logger.info(
        f"Classification ({source}) completed in {(t_classify - t_detect)*1000:.1f}ms"
    )

    # 7. Assemble final response payload
    response = assemble_analysis_response(
        width=width,
        height=height,
        overlay_url=overlay_url,
        before_rgb=before_rgb,
        after_rgb=aligned_after,
        changed_area_percent=changed_pct,
        regions=classified_regions,
        report=report,
    )
    total_time = (time.perf_counter() - t0) * 1000
    logger.info(f"Total analysis execution time: {total_time:.1f}ms (ID: {response.id})")

    return response

"""Assembly of the final AnalyzeResponse payload matching the contract."""

import uuid
from typing import List
import numpy as np

from app.schemas import AnalyzeResponse, ImageSize, RegionItem
from app.utils.images import numpy_to_base64_jpeg


def assemble_analysis_response(
    width: int,
    height: int,
    overlay_url: str,
    before_rgb: np.ndarray,
    after_rgb: np.ndarray,
    changed_area_percent: float,
    regions: List[RegionItem],
    report: List[str],
    custom_id: str = None,
) -> AnalyzeResponse:
    """Assemble the complete response object with data URLs and normalized metrics.
    
    Args:
        width: Raster width in pixels.
        height: Raster height in pixels.
        overlay_url: Transparent RGBA PNG data URL.
        before_rgb: Preprocessed T1 baseline RGB numpy array.
        after_rgb: Preprocessed and aligned T2 target RGB numpy array.
        changed_area_percent: Total surface area change percentage.
        regions: List of classified RegionItem objects.
        report: 3-paragraph executive mission briefing.
        custom_id: Optional UUID/identifier string.
        
    Returns:
        Validated AnalyzeResponse instance conforming to API contract.
    """
    analysis_id = custom_id or f"OD-{uuid.uuid4().hex[:8].upper()}"

    # Compute mean confidence across identified regions
    if regions:
        avg_confidence = round(sum(r.confidence for r in regions) / float(len(regions)), 2)
    else:
        avg_confidence = 0.0

    # Encode preprocessed rasters to base64 JPEG data URLs
    before_url = numpy_to_base64_jpeg(before_rgb, quality=88)
    after_url = numpy_to_base64_jpeg(after_rgb, quality=88)

    return AnalyzeResponse(
        id=analysis_id,
        image_size=ImageSize(width=width, height=height),
        overlay_url=overlay_url,
        before_url=before_url,
        after_url=after_url,
        changed_area_percent=round(changed_area_percent, 1),
        avg_confidence=avg_confidence,
        regions=regions,
        report=report,
    )

"""Change detection pipeline using SSIM + LAB radiometric fusion and morphology."""

import logging
from typing import Any, Dict, List, Tuple
import cv2
import numpy as np
from skimage.metrics import structural_similarity

from app.config import settings
from app.schemas import BoundingBox
from app.utils.images import create_transparent_overlay, numpy_to_base64_png

logger = logging.getLogger("orbital_delta.detect")


def normalize_radiometry_clahe(image_rgb: np.ndarray) -> np.ndarray:
    """Apply Contrast Limited Adaptive Histogram Equalization to Luminance channel."""
    lab = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_norm = clahe.apply(l_channel)

    lab_norm = cv2.merge((l_norm, a_channel, b_channel))
    return cv2.cvtColor(lab_norm, cv2.COLOR_LAB2RGB)


def boxes_overlap_or_proximate(
    b1: Tuple[int, int, int, int],
    b2: Tuple[int, int, int, int],
    proximity_px: int,
) -> bool:
    """Check if two bounding boxes (x, y, w, h) overlap or lie within proximity_px."""
    x1, y1, w1, h1 = b1
    x2, y2, w2, h2 = b2

    # Expand box 1 by proximity_px
    expanded_x1 = x1 - proximity_px
    expanded_y1 = y1 - proximity_px
    expanded_r1 = x1 + w1 + proximity_px
    expanded_b1 = y1 + h1 + proximity_px

    r2 = x2 + w2
    b2_bottom = y2 + h2

    # Check intersection of expanded box 1 with box 2
    return not (
        expanded_r1 < x2
        or expanded_x1 > r2
        or expanded_b1 < y2
        or expanded_y1 > b2_bottom
    )


def merge_bounding_boxes(
    boxes: List[Tuple[int, int, int, int]], proximity_px: int
) -> List[Tuple[int, int, int, int]]:
    """Iteratively merge overlapping or adjacent bounding boxes."""
    if not boxes:
        return []

    merged = list(boxes)
    changed = True

    while changed:
        changed = False
        new_merged = []
        visited = [False] * len(merged)

        for i in range(len(merged)):
            if visited[i]:
                continue
            curr = merged[i]
            visited[i] = True

            for j in range(i + 1, len(merged)):
                if not visited[j] and boxes_overlap_or_proximate(curr, merged[j], proximity_px):
                    # Compute bounding union
                    ux = min(curr[0], merged[j][0])
                    uy = min(curr[1], merged[j][1])
                    ur = max(curr[0] + curr[2], merged[j][0] + merged[j][2])
                    ub = max(curr[1] + curr[3], merged[j][1] + merged[j][3])
                    curr = (ux, uy, ur - ux, ub - uy)
                    visited[j] = True
                    changed = True

            new_merged.append(curr)

        merged = new_merged

    return merged


def extract_region_stats(
    before_rgb: np.ndarray,
    after_rgb: np.ndarray,
    box: Tuple[int, int, int, int],
) -> Dict[str, Any]:
    """Compute local color shift and spatial variance statistics for a region."""
    x, y, w, h = box
    crop_before = before_rgb[y : y + h, x : x + w]
    crop_after = after_rgb[y : y + h, x : x + w]

    if crop_before.size == 0 or crop_after.size == 0:
        return {"mean_delta": 0.0, "green_shift": 0.0, "edge_density": 0.0}

    # Mean RGB delta
    diff_rgb = np.abs(crop_after.astype(np.float32) - crop_before.astype(np.float32))
    mean_delta = float(np.mean(diff_rgb))

    # Green index shift (Green - (Red + Blue)/2)
    green_idx_before = crop_before[:, :, 1].astype(np.float32) - 0.5 * (
        crop_before[:, :, 0].astype(np.float32) + crop_before[:, :, 2].astype(np.float32)
    )
    green_idx_after = crop_after[:, :, 1].astype(np.float32) - 0.5 * (
        crop_after[:, :, 0].astype(np.float32) + crop_after[:, :, 2].astype(np.float32)
    )
    green_shift = float(np.mean(green_idx_after - green_idx_before))

    # Edge density on after crop using Canny
    gray_crop = cv2.cvtColor(crop_after, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray_crop, 50, 150)
    edge_density = float(np.count_nonzero(edges) / (w * h))

    return {
        "mean_delta": round(mean_delta, 2),
        "green_shift": round(green_shift, 2),
        "edge_density": round(edge_density, 3),
    }


def detect_changes(
    before_rgb: np.ndarray, after_rgb: np.ndarray
) -> Tuple[List[Dict[str, Any]], float, str, np.ndarray]:
    """Execute complete change detection pipeline and extract classified candidate regions.
    
    Args:
        before_rgb: Baseline T1 raster (H, W, 3).
        after_rgb: Aligned target T2 raster (H, W, 3).
        
    Returns:
        Tuple of:
          - detected_regions: list of region dicts with bboxes & stats
          - changed_area_percent: total area changed (0.0 to 100.0)
          - overlay_data_url: base64 PNG data URL
          - change_mask: binary uint8 mask
    """
    h, w = before_rgb.shape[:2]
    total_pixels = float(h * w)

    # 1. Radiometric lighting normalization
    norm_before = normalize_radiometry_clahe(before_rgb)
    norm_after = normalize_radiometry_clahe(after_rgb)

    # 2. Structural Dissimilarity Map (DSSIM) on grayscale
    gray1 = cv2.cvtColor(norm_before, cv2.COLOR_RGB2GRAY)
    gray2 = cv2.cvtColor(norm_after, cv2.COLOR_RGB2GRAY)

    gray1_blur = cv2.GaussianBlur(gray1, (5, 5), 0)
    gray2_blur = cv2.GaussianBlur(gray2, (5, 5), 0)

    _, ssim_map = structural_similarity(
        gray1_blur, gray2_blur, full=True, data_range=255.0
    )
    dssim = np.clip(1.0 - ssim_map, 0.0, 1.0)

    # 3. Normalized absolute difference in LAB color space
    lab1 = cv2.cvtColor(norm_before, cv2.COLOR_RGB2LAB).astype(np.float32)
    lab2 = cv2.cvtColor(norm_after, cv2.COLOR_RGB2LAB).astype(np.float32)
    diff_lab = np.linalg.norm(lab1 - lab2, axis=2)
    lab_norm = np.clip(diff_lab / 100.0, 0.0, 1.0)

    # 4. Fusion of DSSIM and LAB radiometric difference
    fused = settings.SSIM_WEIGHT * dssim + settings.LAB_DIFF_WEIGHT * lab_norm
    fused_blur = cv2.GaussianBlur(fused, (settings.GAUSSIAN_BLUR_KERNEL, settings.GAUSSIAN_BLUR_KERNEL), 0)
    fused_uint8 = np.clip(fused_blur * 255.0, 0, 255).astype(np.uint8)

    # Check for identical/near-identical rasters (zero change floor)
    max_val = np.max(fused_uint8)
    if max_val < 30:
        logger.info("Rasters are structurally identical; 0 regions detected.")
        empty_mask = np.zeros((h, w), dtype=np.uint8)
        overlay_url = numpy_to_base64_png(create_transparent_overlay(empty_mask))
        return [], 0.0, overlay_url, empty_mask

    # 5. Otsu thresholding with baseline noise floor clamp
    otsu_thresh, _ = cv2.threshold(
        fused_uint8, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )
    effective_thresh = max(int(otsu_thresh), 48)
    _, bin_mask = cv2.threshold(fused_uint8, effective_thresh, 255, cv2.THRESH_BINARY)

    # 6. Morphology: opening to prune specks, closing to unite broken structures
    kernel_size = max(3, int(min(h, w) * 0.007))
    if kernel_size % 2 == 0:
        kernel_size += 1

    kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    kernel_close = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (kernel_size * 2 + 1, kernel_size * 2 + 1)
    )

    clean_mask = cv2.morphologyEx(bin_mask, cv2.MORPH_OPEN, kernel_open)
    clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, kernel_close)

    # 7. Extract external contours and compute raw bounding boxes
    contours, _ = cv2.findContours(
        clean_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    min_area_pixels = total_pixels * settings.MIN_REGION_AREA_PERCENT
    raw_boxes: List[Tuple[int, int, int, int]] = []

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area >= min_area_pixels:
            x, y, bw, bh = cv2.boundingRect(cnt)
            raw_boxes.append((x, y, bw, bh))

    # 8. Merge overlapping or proximate bounding boxes
    proximity_px = int(max(h, w) * settings.PROXIMITY_MERGE_RATIO)
    merged_boxes = merge_bounding_boxes(raw_boxes, proximity_px)

    # Sort merged boxes by area descending and retain top MAX_REGIONS
    merged_boxes.sort(key=lambda b: b[2] * b[3], reverse=True)
    merged_boxes = merged_boxes[: settings.MAX_REGIONS]

    # 9. Build final change mask strictly within the retained candidate bounding envelopes
    final_mask = np.zeros((h, w), dtype=np.uint8)
    regions_output: List[Dict[str, Any]] = []

    for idx, (bx, by, bw, bh) in enumerate(merged_boxes, start=1):
        # Transfer the clean mask pixels within this box
        final_mask[by : by + bh, bx : bx + bw] = clean_mask[by : by + bh, bx : bx + bw]

        # Normalized coordinates relative to image size
        normalized_bbox = BoundingBox(
            x=round(bx / float(w), 4),
            y=round(by / float(h), 4),
            w=round(bw / float(w), 4),
            h=round(bh / float(h), 4),
        )

        stats = extract_region_stats(before_rgb, after_rgb, (bx, by, bw, bh))

        regions_output.append(
            {
                "id": f"R{idx}",
                "bbox": normalized_bbox,
                "pixel_box": (bx, by, bw, bh),
                "stats": stats,
            }
        )

    # 10. Compute total changed area percentage from active mask
    changed_pixels = np.count_nonzero(final_mask)
    changed_area_percent = round((changed_pixels / total_pixels) * 100.0, 1)

    # Generate transparent RGBA overlay PNG
    overlay_rgba = create_transparent_overlay(final_mask)
    overlay_data_url = numpy_to_base64_png(overlay_rgba)

    logger.info(
        f"Detected {len(regions_output)} change regions covering {changed_area_percent}% area."
    )
    return regions_output, changed_area_percent, overlay_data_url, final_mask

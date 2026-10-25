"""Automated tests for change detection computer vision pipeline."""

import numpy as np
import pytest
from app.services.detect import detect_changes


def create_synthetic_test_pair(width=800, height=600):
    """Create a baseline green raster and a target raster with an explicit changed patch."""
    # Seed for deterministic testing
    np.random.seed(42)

    # T1: Green texture background
    base_color = np.array([45, 110, 50], dtype=np.float32)
    noise = np.random.normal(0, 10, (height, width, 3))
    before_rgb = np.clip(base_color + noise, 0, 255).astype(np.uint8)

    # T2: Same background + explicit rectangular change block at x=200..400, y=150..300
    after_rgb = before_rgb.copy()
    # Tan / brown excavation patch (width=200, height=150)
    after_rgb[150:300, 200:400] = [180, 140, 90]

    return before_rgb, after_rgb


def test_detect_known_changed_block():
    """Verify that a known localized changed rectangle is correctly isolated."""
    before_rgb, after_rgb = create_synthetic_test_pair(width=800, height=600)

    regions, changed_pct, overlay_url, mask = detect_changes(before_rgb, after_rgb)

    # 1. Assert at least one region is detected
    assert len(regions) >= 1, "Expected at least one change region to be isolated."
    primary = regions[0]

    # 2. Check region ID formatting
    assert primary["id"] == "R1"

    # 3. Check normalized bounding box coordinates
    bbox = primary["bbox"]
    # Expected: x ≈ 200/800 = 0.25, y ≈ 150/600 = 0.25, w ≈ 200/800 = 0.25, h ≈ 150/600 = 0.25
    assert abs(bbox.x - 0.25) < 0.08, f"X coordinate {bbox.x} deviates from expected 0.25"
    assert abs(bbox.y - 0.25) < 0.08, f"Y coordinate {bbox.y} deviates from expected 0.25"
    assert abs(bbox.w - 0.25) < 0.08, f"Width {bbox.w} deviates from expected 0.25"
    assert abs(bbox.h - 0.25) < 0.08, f"Height {bbox.h} deviates from expected 0.25"

    # 4. Check changed area percentage (200*150 / 800*600 = 6.25%)
    assert 4.0 <= changed_pct <= 10.0, f"Changed area {changed_pct}% deviates from expectation"

    # 5. Check overlay URL format
    assert overlay_url.startswith("data:image/png;base64,")


def test_detect_identical_images_zero_change():
    """Verify that identical images produce zero detected change regions."""
    np.random.seed(99)
    before_rgb = np.random.randint(40, 180, (400, 400, 3), dtype=np.uint8)
    after_rgb = before_rgb.copy()

    regions, changed_pct, overlay_url, mask = detect_changes(before_rgb, after_rgb)

    assert len(regions) == 0, "Identical images must yield 0 change regions."
    assert changed_pct == 0.0, "Identical images must yield 0.0% changed area."
    assert overlay_url.startswith("data:image/png;base64,")

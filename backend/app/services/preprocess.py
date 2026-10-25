"""Image ingestion, validation, EXIF normalization, and spatial rescaling."""

import io
import logging
from typing import Tuple
import cv2
import numpy as np
from PIL import Image, ImageOps

from app.config import settings
from app.utils.errors import (
    FileTooLargeError,
    InvalidImageError,
    UnsupportedMediaTypeError,
)

logger = logging.getLogger("orbital_delta.preprocess")


def decode_and_validate_image(file_bytes: bytes, filename: str = "") -> np.ndarray:
    """Validate image bytes, normalize EXIF orientation, and decode to an RGB numpy array.
    
    Args:
        file_bytes: Raw binary upload data.
        filename: Optional filename for telemetry/logging.
        
    Returns:
        RGB numpy array of shape (H, W, 3).
        
    Raises:
        FileTooLargeError: If size exceeds MAX_UPLOAD_MB.
        UnsupportedMediaTypeError: If format is not PNG or JPEG.
        InvalidImageError: If byte stream is corrupt or unreadable.
    """
    if len(file_bytes) > settings.MAX_UPLOAD_BYTES:
        raise FileTooLargeError(
            f"File '{filename}' exceeds maximum allowed size of {settings.MAX_UPLOAD_MB}MB."
        )

    if not file_bytes:
        raise InvalidImageError(f"File '{filename}' is empty.")

    try:
        pil_img = Image.open(io.BytesIO(file_bytes))
        img_format = (pil_img.format or "").upper()
        if img_format not in ("JPEG", "JPG", "PNG", "TIFF", "WEBP"):
            raise UnsupportedMediaTypeError(
                f"Unsupported image format '{img_format}'. Only JPEG and PNG are permitted."
            )

        # Normalize EXIF orientation (crucial for mobile/drone captures)
        pil_img = ImageOps.exif_transpose(pil_img)

        # Ensure RGB mode
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")

        # Convert to numpy array
        img_np = np.array(pil_img, dtype=np.uint8)
        return img_np

    except (FileTooLargeError, UnsupportedMediaTypeError):
        raise
    except Exception as exc:
        logger.error(f"Failed to decode image '{filename}': {exc}")
        raise InvalidImageError(f"Corrupt or unreadable image file: {exc}")


def rescale_to_max_dimension(img_rgb: np.ndarray, max_side: int = 1600) -> np.ndarray:
    """Scale image so its longest side does not exceed max_side, preserving aspect ratio.
    
    Args:
        img_rgb: Input RGB array of shape (H, W, 3).
        max_side: Maximum allowed dimension in pixels.
        
    Returns:
        Rescaled RGB array.
    """
    h, w = img_rgb.shape[:2]
    longest = max(h, w)
    if longest <= max_side:
        return img_rgb

    scale = max_side / float(longest)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))

    # Use INTER_AREA for downsizing to preserve fine spatial details
    return cv2.resize(img_rgb, (new_w, new_h), interpolation=cv2.INTER_AREA)


def prepare_image_pair(
    before_bytes: bytes, after_bytes: bytes
) -> Tuple[np.ndarray, np.ndarray, int, int]:
    """Validate, decode, rescale, and align dimensions for baseline and target captures.
    
    Args:
        before_bytes: Raw bytes for T1 baseline image.
        after_bytes: Raw bytes for T2 comparison image.
        
    Returns:
        Tuple of (before_rgb, after_rgb, width, height) where after_rgb matches before_rgb shape.
    """
    before_raw = decode_and_validate_image(before_bytes, "before")
    after_raw = decode_and_validate_image(after_bytes, "after")

    # Rescale to max dimension limit
    before_scaled = rescale_to_max_dimension(before_raw, settings.MAX_IMAGE_SIDE)
    after_scaled = rescale_to_max_dimension(after_raw, settings.MAX_IMAGE_SIDE)

    target_h, target_w = before_scaled.shape[:2]

    # Force identical pixel grid dimensions for exact raster subtraction
    if after_scaled.shape[:2] != (target_h, target_w):
        interp = (
            cv2.INTER_AREA
            if (after_scaled.shape[0] > target_h or after_scaled.shape[1] > target_w)
            else cv2.INTER_LINEAR
        )
        after_aligned = cv2.resize(after_scaled, (target_w, target_h), interpolation=interp)
    else:
        after_aligned = after_scaled

    logger.info(f"Preprocessed image pair to target dimensions: {target_w}x{target_h} px")
    return before_scaled, after_aligned, target_w, target_h

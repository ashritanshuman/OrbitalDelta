"""In-memory image conversion and base64 data URL utilities."""

import base64
import io
import cv2
import numpy as np
from PIL import Image


def numpy_to_base64_jpeg(image_rgb: np.ndarray, quality: int = 88) -> str:
    """Encode an RGB numpy array to a JPEG data URL string.
    
    Args:
        image_rgb: Numpy array of shape (H, W, 3) in RGB order.
        quality: JPEG compression quality (1-100).
        
    Returns:
        A data URL string formatted as 'data:image/jpeg;base64,...'
    """
    # cv2.imencode operates on BGR
    image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    success, buffer = cv2.imencode(".jpg", image_bgr, encode_param)
    if not success:
        # Fallback to Pillow if cv2 fails
        pil_img = Image.fromarray(image_rgb)
        buf = io.BytesIO()
        pil_img.save(buf, format="JPEG", quality=quality)
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{b64}"

    b64 = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def numpy_to_base64_png(image_rgba: np.ndarray) -> str:
    """Encode an RGBA numpy array to a PNG data URL string.
    
    Args:
        image_rgba: Numpy array of shape (H, W, 4) in RGBA order.
        
    Returns:
        A data URL string formatted as 'data:image/png;base64,...'
    """
    image_bgra = cv2.cvtColor(image_rgba, cv2.COLOR_RGBA2BGRA)
    success, buffer = cv2.imencode(".png", image_bgra)
    if not success:
        pil_img = Image.fromarray(image_rgba)
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"

    b64 = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def create_transparent_overlay(
    mask_uint8: np.ndarray,
    color_rgb: tuple = (255, 90, 31),
    alpha: float = 0.45,
) -> np.ndarray:
    """Generate a transparent RGBA overlay highlighting binary mask change regions.
    
    Args:
        mask_uint8: 2D binary uint8 mask (0 or 255) of shape (H, W).
        color_rgb: RGB color tuple for the highlight fill (default International Orange).
        alpha: Alpha transparency (0.0 to 1.0) for the change mask fill.
        
    Returns:
        RGBA numpy array of shape (H, W, 4) with transparent background and orange fill/borders.
    """
    h, w = mask_uint8.shape[:2]
    overlay_rgba = np.zeros((h, w, 4), dtype=np.uint8)

    # Find where mask is positive
    change_pixels = mask_uint8 > 0

    # Fill change area
    overlay_rgba[change_pixels, 0] = color_rgb[0]
    overlay_rgba[change_pixels, 1] = color_rgb[1]
    overlay_rgba[change_pixels, 2] = color_rgb[2]
    overlay_rgba[change_pixels, 3] = int(255 * alpha)

    # Add crisp 1px outline around change regions for instrument clarity
    contours, _ = cv2.findContours(
        mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    cv2.drawContours(
        overlay_rgba,
        contours,
        -1,
        (color_rgb[0], color_rgb[1], color_rgb[2], 255),
        thickness=1,
    )

    return overlay_rgba

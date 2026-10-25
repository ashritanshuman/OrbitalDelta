"""Geometric registration using ORB feature matching and RANSAC homography."""

import logging
from typing import Tuple
import cv2
import numpy as np

from app.config import settings

logger = logging.getLogger("orbital_delta.align")


def is_homography_sane(H: np.ndarray, min_scale: float = 0.70, max_scale: float = 1.40) -> bool:
    """Validate that estimated homography does not introduce severe skew or collapse.
    
    Args:
        H: 3x3 perspective transformation matrix.
        min_scale: Lower bound for acceptable spatial scaling factor.
        max_scale: Upper bound for acceptable spatial scaling factor.
        
    Returns:
        True if transformation is realistic for orbital / aerial registration.
    """
    if H is None or H.shape != (3, 3):
        return False

    det = float(np.linalg.det(H[:2, :2]))
    if det <= 0.0:
        return False

    # Check effective area scaling
    area_scale = np.sqrt(det)
    if area_scale < min_scale or area_scale > max_scale:
        logger.info(f"Homography rejected: area scale {area_scale:.2f} out of bounds.")
        return False

    # Check perspective distortion coefficients
    if abs(H[2, 0]) > 0.005 or abs(H[2, 1]) > 0.005:
        logger.info(f"Homography rejected: excessive perspective skew.")
        return False

    return True


def align_rasters(
    before_rgb: np.ndarray, after_rgb: np.ndarray
) -> Tuple[np.ndarray, bool, int]:
    """Align the comparison capture to the baseline coordinate frame.
    
    Args:
        before_rgb: Fixed reference image (H, W, 3).
        after_rgb: Moving comparison image (H, W, 3) with identical dimensions.
        
    Returns:
        Tuple of (aligned_after_rgb, is_aligned, inlier_count).
    """
    h, w = before_rgb.shape[:2]

    # Convert to grayscale for feature extraction
    gray_before = cv2.cvtColor(before_rgb, cv2.COLOR_RGB2GRAY)
    gray_after = cv2.cvtColor(after_rgb, cv2.COLOR_RGB2GRAY)

    # Initialize ORB detector
    orb = cv2.ORB_create(
        nfeatures=settings.ORB_N_FEATURES,
        scaleFactor=1.2,
        nlevels=8,
        edgeThreshold=15,
        patchSize=31,
    )

    kp_before, des_before = orb.detectAndCompute(gray_before, None)
    kp_after, des_after = orb.detectAndCompute(gray_after, None)

    if des_before is None or des_after is None:
        logger.info("Insufficient keypoint descriptors for alignment. Using identity.")
        return after_rgb, False, 0

    if len(kp_before) < 30 or len(kp_after) < 30:
        logger.info("Keypoint count too low for homography estimation. Using identity.")
        return after_rgb, False, 0

    # Match features with BFMatcher using Hamming distance
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    raw_matches = bf.knnMatch(des_after, des_before, k=2)

    # Apply Lowe's ratio test (0.75 threshold)
    good_matches = []
    for pair in raw_matches:
        if len(pair) == 2:
            m, n = pair
            if m.distance < 0.75 * n.distance:
                good_matches.append(m)

    if len(good_matches) < settings.HOMOGRAPHY_MIN_INLIERS:
        logger.info(
            f"Only {len(good_matches)} good matches found (min {settings.HOMOGRAPHY_MIN_INLIERS}). Skipping alignment."
        )
        return after_rgb, False, len(good_matches)

    # Extract coordinates of matched points
    src_pts = np.float32([kp_after[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp_before[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

    # Compute homography via RANSAC
    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

    if H is None or mask is None:
        return after_rgb, False, 0

    inliers = int(np.sum(mask))
    if inliers < settings.HOMOGRAPHY_MIN_INLIERS:
        logger.info(
            f"Homography inlier count {inliers} below threshold {settings.HOMOGRAPHY_MIN_INLIERS}. Using identity."
        )
        return after_rgb, False, inliers

    if not is_homography_sane(H, settings.MIN_SCALE, settings.MAX_SCALE):
        return after_rgb, False, inliers

    # Apply perspective transformation to align after_rgb with before_rgb
    aligned_after = cv2.warpPerspective(
        after_rgb,
        H,
        (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REPLICATE,
    )

    logger.info(
        f"Successfully aligned rasters with {inliers} RANSAC inliers from {len(good_matches)} matches."
    )
    return aligned_after, True, inliers

"""AI classification service leveraging the official google-genai SDK."""

import asyncio
import json
import logging
import re
from typing import Any, Dict, List, Tuple
import cv2
import numpy as np

from app.config import settings
from app.schemas import BoundingBox, ClassificationType, LabelType, RegionItem
from app.services.fallback import apply_heuristic_fallback

logger = logging.getLogger("orbital_delta.classify")


def encode_image_to_jpeg_bytes(img_rgb: np.ndarray, quality: int = 85) -> bytes:
    """Encode RGB image array to JPEG bytes for multimodal API transport."""
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    success, buffer = cv2.imencode(
        ".jpg", img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    )
    if not success:
        raise ValueError("Failed to encode image to JPEG bytes")
    return buffer.tobytes()


def sanitize_json_text(raw_text: str) -> str:
    """Strip markdown code blocks or wrapping quotes from model responses."""
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


def build_classification_prompt(raw_regions: List[Dict[str, Any]]) -> str:
    """Construct structured instruction and region list for the vision model."""
    regions_payload = []
    for r in raw_regions:
        bbox: BoundingBox = r["bbox"]
        regions_payload.append(
            {
                "id": r["id"],
                "bbox": {"x": bbox.x, "y": bbox.y, "w": bbox.w, "h": bbox.h},
                "stats": r.get("stats", {}),
            }
        )

    allowed_labels = ", ".join(f'"{lbl}"' for lbl in settings.ALLOWED_LABELS)

    prompt = (
        "You are an expert aerospace satellite imagery analyst. You are provided with two images:\n"
        "- Image 1: T1 Baseline (earlier pass)\n"
        "- Image 2: T2 Target (later pass, aligned to T1)\n\n"
        "Your task is to classify the following detected bounding box regions and write an executive report.\n\n"
        f"Detected Regions:\n{json.dumps(regions_payload, indent=2)}\n\n"
        "STRICT REQUIREMENTS:\n"
        "1. For each region in the list, return: 'id', 'classification', 'label', 'description', 'confidence'.\n"
        "2. 'classification' MUST be either 'human-made' or 'natural'.\n"
        f"3. 'label' MUST be exactly one of: [{allowed_labels}].\n"
        "4. 'description' MUST be a single factual sentence of at most 18 words. No speculation.\n"
        "5. 'confidence' MUST be a float between 0.0 and 1.0 reflecting empirical clarity.\n"
        "6. Do NOT invent new region IDs; cover exactly the IDs provided.\n"
        "7. 'report' MUST be an array of exactly 3 paragraphs:\n"
        "   - Paragraph 1: What changed (surface area and primary visual shifts observed).\n"
        "   - Paragraph 2: Causal category (anthropogenic vs natural geomorphic/biospheric processes).\n"
        "   - Paragraph 3: Recommended follow-up action for ground operators.\n\n"
        "Respond ONLY with valid JSON matching this schema:\n"
        "{\n"
        '  "regions": [\n'
        '    {"id": "R1", "classification": "human-made", "label": "Deforestation", "description": "...", "confidence": 0.92}\n'
        "  ],\n"
        '  "report": ["Paragraph 1...", "Paragraph 2...", "Paragraph 3..."]\n'
        "}"
    )
    return prompt


async def call_gemini_vision(
    before_rgb: np.ndarray,
    after_rgb: np.ndarray,
    raw_regions: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Execute Gemini vision call using the official google-genai SDK with timeout and retry."""
    from google import genai
    from google.genai import types

    # Safe client initialization
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    # Encode images to compact JPEGs
    before_bytes = encode_image_to_jpeg_bytes(before_rgb, quality=80)
    after_bytes = encode_image_to_jpeg_bytes(after_rgb, quality=80)

    prompt_text = build_classification_prompt(raw_regions)

    parts = [
        types.Part.from_bytes(data=before_bytes, mime_type="image/jpeg"),
        types.Part.from_bytes(data=after_bytes, mime_type="image/jpeg"),
        types.Part.from_text(text=prompt_text),
    ]

    config = types.GenerateContentConfig(
        system_instruction="You are an autonomous Earth observation intelligence system analyzing satellite surface changes.",
        response_mime_type="application/json",
        temperature=0.1,
    )

    last_error = None
    for attempt in range(settings.GEMINI_MAX_RETRIES + 1):
        try:
            # Run in threadpool with strict timeout
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=settings.GEMINI_MODEL,
                    contents=parts,
                    config=config,
                ),
                timeout=settings.GEMINI_TIMEOUT_SECONDS,
            )

            raw_text = response.text or ""
            cleaned = sanitize_json_text(raw_text)
            parsed = json.loads(cleaned)
            return parsed

        except asyncio.TimeoutError:
            logger.warning(
                f"Gemini API timed out after {settings.GEMINI_TIMEOUT_SECONDS}s (attempt {attempt+1})"
            )
            last_error = TimeoutError("Gemini inference request timed out.")
        except Exception as exc:
            logger.warning(f"Gemini API call failed (attempt {attempt+1}): {exc}")
            last_error = exc

        if attempt < settings.GEMINI_MAX_RETRIES:
            await asyncio.sleep(1.5)

    raise last_error or RuntimeError("Gemini vision classification failed.")


async def classify_and_generate_report(
    before_rgb: np.ndarray,
    after_rgb: np.ndarray,
    raw_regions: List[Dict[str, Any]],
    changed_area_percent: float,
) -> Tuple[List[RegionItem], List[str], str]:
    """Classify detected change regions via Gemini vision model, falling back gracefully to heuristics.
    
    Returns:
        Tuple of (classified_regions, report_paragraphs, classifier_source_label).
    """
    if not raw_regions or changed_area_percent == 0.0:
        fallback_regions, fallback_report = apply_heuristic_fallback(
            raw_regions, changed_area_percent
        )
        return fallback_regions, fallback_report, "none"

    has_api_key = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5)

    if not has_api_key:
        logger.info("No Gemini API key configured. Executing deterministic heuristic classification.")
        regions, report = apply_heuristic_fallback(raw_regions, changed_area_percent)
        return regions, report, "fallback"

    try:
        data = await call_gemini_vision(before_rgb, after_rgb, raw_regions)
        model_regions = {r["id"]: r for r in data.get("regions", []) if "id" in r}
        model_report = data.get("report", [])

        final_regions: List[RegionItem] = []
        for raw in raw_regions:
            rid = raw["id"]
            if rid in model_regions:
                mr = model_regions[rid]
                classification: ClassificationType = (
                    "human-made"
                    if str(mr.get("classification")).lower() == "human-made"
                    else "natural"
                )
                raw_label = str(mr.get("label", "")).strip()
                label: LabelType = (
                    raw_label if raw_label in settings.ALLOWED_LABELS else "Other"
                )
                desc = str(mr.get("description", "Localized spatial change detected."))
                conf = float(mr.get("confidence", 0.85))
                clamped_conf = round(max(0.0, min(1.0, conf)), 2)

                final_regions.append(
                    RegionItem(
                        id=rid,
                        bbox=raw["bbox"],
                        classification=classification,
                        label=label,
                        description=desc,
                        confidence=clamped_conf,
                    )
                )
            else:
                # Fill missing region via heuristic fallback
                c, l, d, cf = apply_heuristic_fallback([raw], changed_area_percent)
                final_regions.extend(c)

        if not model_report or len(model_report) < 3:
            _, fallback_report = apply_heuristic_fallback(raw_regions, changed_area_percent)
            report = fallback_report
        else:
            report = [str(p) for p in model_report[:3]]

        logger.info(f"Successfully classified {len(final_regions)} regions using Gemini {settings.GEMINI_MODEL}.")
        return final_regions, report, "gemini"

    except Exception as exc:
        logger.error(
            f"Gemini classification exception: {exc}. Falling back to deterministic heuristics."
        )
        regions, report = apply_heuristic_fallback(raw_regions, changed_area_percent)
        return regions, report, "fallback"

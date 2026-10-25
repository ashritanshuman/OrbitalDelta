"""Heuristic rule-based anomaly classifier and report generator."""

import logging
from typing import Any, Dict, List, Tuple
from app.schemas import BoundingBox, ClassificationType, LabelType, RegionItem

logger = logging.getLogger("orbital_delta.fallback")


def classify_region_heuristically(
    region_raw: Dict[str, Any]
) -> Tuple[ClassificationType, LabelType, str, float]:
    """Classify a detected bounding box anomaly using localized spectral and edge metrics.
    
    Args:
        region_raw: Dict containing id, bbox, and pixel stats (mean_delta, green_shift, edge_density).
        
    Returns:
        Tuple of (classification, label, description, confidence).
    """
    stats = region_raw.get("stats", {})
    green_shift = stats.get("green_shift", 0.0)
    edge_density = stats.get("edge_density", 0.0)
    bbox: BoundingBox = region_raw["bbox"]

    # 1. Deforestation / Vegetation Depletion
    if green_shift < -15.0:
        if edge_density > 0.06:
            classification: ClassificationType = "human-made"
            label: LabelType = "Deforestation"
            desc = "Substantial canopy clearing with rectilinear machine-cut boundaries."
            conf = 0.74
        else:
            classification = "natural"
            label = "Vegetation change"
            desc = "Localized canopy stress and seasonal biomass reduction."
            conf = 0.68

    # 2. Construction / Urban Excavation
    elif edge_density > 0.075:
        classification = "human-made"
        label = "Construction"
        desc = "High-contrast rectilinear foundation footprints and industrial earthworks."
        conf = 0.72

    # 3. Fluvial / Coastal changes
    elif bbox.y > 0.50 and bbox.h > 0.20 and edge_density < 0.04:
        classification = "natural"
        label = "Coastal change"
        desc = "Shoreline boundary shift and sediment deposition along the waterline."
        conf = 0.65

    # 4. Flooding / Surface Inundation
    elif green_shift < -5.0 and edge_density < 0.05:
        classification = "natural"
        label = "Flooding"
        desc = "Surface reflectance drop consistent with standing water and saturated soil."
        conf = 0.70

    # 5. General Infrastructure / Excavation
    elif edge_density > 0.045:
        classification = "human-made"
        label = "Excavation"
        desc = "Ground clearing and unpaved access corridor development."
        conf = 0.62

    else:
        classification = "natural"
        label = "Other"
        desc = "Localized spectral variance observed across temporal raster capture."
        conf = 0.58

    return classification, label, desc, conf


def generate_fallback_report(
    regions: List[RegionItem],
    changed_area_percent: float,
) -> List[str]:
    """Synthesize a structured 3-paragraph executive intelligence report.
    
    Args:
        regions: List of classified RegionItem objects.
        changed_area_percent: Overall changed surface area percentage.
        
    Returns:
        List of 3 clean factual paragraphs.
    """
    if not regions or changed_area_percent == 0.0:
        return [
            "Baseline radiometric and structural comparison reveals no statistically significant spatial delta across the inspected raster frame.",
            "Variance indicators remain within nominal instrument calibration and seasonal atmospheric tolerances.",
            "Continue standard orbital revisit cadence; no critical anomaly triggers were registered.",
        ]

    human_count = sum(1 for r in regions if r.classification == "human-made")
    natural_count = len(regions) - human_count

    primary_label = regions[0].label

    # Paragraph 1: What changed
    p1 = (
        f"Automated spectral delta discrimination isolated {len(regions)} primary surface anomaly zones, "
        f"encompassing approximately {changed_area_percent}% of the monitored spatial grid. "
        f"Primary structural shifts correlate prominently with {primary_label.lower()} signatures."
    )

    # Paragraph 2: Causal classification
    if human_count > natural_count:
        p2 = (
            f"Classification metrics attribute {human_count} of {len(regions)} candidate sectors directly to "
            "anthropogenic ground operations, characterized by geometric clearing margins and elevated high-frequency edge density."
        )
    elif natural_count > human_count:
        p2 = (
            f"Geospatial evaluation attributes {natural_count} of {len(regions)} variance sectors to natural dynamic phenomena, "
            "including hydrodynamic sediment redistribution and seasonal canopy spectral drift."
        )
    else:
        p2 = (
            "Observation vectors indicate a concurrent combination of anthropogenic infrastructure alterations "
            "and natural bio-geomorphological boundary shifts across the dual-epoch timeframe."
        )

    # Paragraph 3: Recommended follow-up
    p3 = (
        "Recommended operational protocol entails tasking high-cadence optical revisit passes over designated "
        "bounding sectors and correlating findings with municipal cadastral and environmental GIS registries."
    )

    return [p1, p2, p3]


def apply_heuristic_fallback(
    raw_regions: List[Dict[str, Any]],
    changed_area_percent: float,
) -> Tuple[List[RegionItem], List[str]]:
    """Generate classified regions and executive report using deterministic heuristic rules."""
    classified_regions: List[RegionItem] = []

    for r in raw_regions:
        classification, label, desc, conf = classify_region_heuristically(r)
        classified_regions.append(
            RegionItem(
                id=r["id"],
                bbox=r["bbox"],
                classification=classification,
                label=label,
                description=desc,
                confidence=round(conf, 2),
            )
        )

    report = generate_fallback_report(classified_regions, changed_area_percent)
    logger.info(f"Applied heuristic classification for {len(classified_regions)} regions.")
    return classified_regions, report

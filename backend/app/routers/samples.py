"""Preset sample benchmarks endpoint router."""

from typing import List
from fastapi import APIRouter
from app.schemas import SampleItem

router = APIRouter(prefix="/api", tags=["Samples"])

SAMPLE_DATASETS: List[SampleItem] = [
    SampleItem(
        id="forest",
        name="Deforestation",
        description="Amazon Basin Sector 448B canopy depletion and logging roads",
        before="/samples/forest_t1.jpg",
        after="/samples/forest_t2.jpg",
        overlay_url="/samples/forest_overlay.png",
    ),
    SampleItem(
        id="urban",
        name="Urban construction",
        description="Rapid commercial building development and transport corridor",
        before="/samples/urban_t1.jpg",
        after="/samples/urban_t2.jpg",
        overlay_url="/samples/urban_overlay.png",
    ),
    SampleItem(
        id="coast",
        name="Coastal erosion",
        description="Wave-action shoreline loss and barrier island degradation",
        before="/samples/coast_t1.jpg",
        after="/samples/coast_t2.jpg",
        overlay_url="/samples/coast_overlay.png",
    ),
    SampleItem(
        id="flood",
        name="Flood damage",
        description="Monsoon river overflow and crop inundation perimeter",
        before="/samples/flood_t1.jpg",
        after="/samples/flood_t2.jpg",
        overlay_url="/samples/flood_overlay.png",
    ),
]


@router.get("/samples", response_model=List[SampleItem], summary="Get Preset Benchmark Satellite Pairs")
async def get_samples() -> List[SampleItem]:
    """Retrieve preloaded satellite imagery change detection pairs."""
    return SAMPLE_DATASETS

"""Preset sample benchmarks endpoint router."""

from typing import List
from fastapi import APIRouter
from app.schemas import SampleItem

router = APIRouter(prefix="/api", tags=["Samples"])

SAMPLE_DATASETS: List[SampleItem] = [
    SampleItem(
        id="deforestation",
        name="Deforestation",
        description="Amazon Basin Sector 448B canopy depletion and logging roads",
        before="/samples/deforestation/before.jpg",
        after="/samples/deforestation/after.jpg",
        overlay_url="/samples/deforestation/after.jpg",
    ),
    SampleItem(
        id="urban",
        name="Urban construction",
        description="Rapid commercial building development and transport corridor",
        before="/samples/urban/before.jpg",
        after="/samples/urban/after.jpg",
        overlay_url="/samples/urban/after.jpg",
    ),
    SampleItem(
        id="coastal",
        name="Coastal erosion",
        description="Wave-action shoreline loss and barrier island degradation",
        before="/samples/coastal/before.jpg",
        after="/samples/coastal/after.jpg",
        overlay_url="/samples/coastal/after.jpg",
    ),
    SampleItem(
        id="flood",
        name="Flood damage",
        description="Monsoon river overflow and crop inundation perimeter",
        before="/samples/flood/before.jpg",
        after="/samples/flood/after.jpg",
        overlay_url="/samples/flood/after.jpg",
    ),
]


@router.get("/samples", response_model=List[SampleItem], summary="Get Preset Benchmark Satellite Pairs")
async def get_samples() -> List[SampleItem]:
    """Retrieve preloaded satellite imagery change detection pairs."""
    return SAMPLE_DATASETS

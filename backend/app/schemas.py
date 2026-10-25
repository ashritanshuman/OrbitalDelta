"""Pydantic v2 models and schemas for API contracts."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(..., examples=["ok"])
    gemini: bool = Field(..., description="True if Gemini API key is configured and active", examples=[True])


class SampleItem(BaseModel):
    """Metadata schema for benchmark dual-epoch satellite datasets."""

    id: str = Field(..., examples=["forest"])
    name: str = Field(..., examples=["Deforestation"])
    description: Optional[str] = Field(None, examples=["Amazon Basin Sector 448B canopy depletion and logging roads"])
    before: str = Field(..., examples=["/samples/forest_t1.jpg"])
    after: str = Field(..., examples=["/samples/forest_t2.jpg"])
    overlay_url: Optional[str] = Field(None, examples=["/samples/forest_overlay.png"])


class ImageSize(BaseModel):
    """Image dimension specification."""

    width: int = Field(..., examples=[1024])
    height: int = Field(..., examples=[768])


class BoundingBox(BaseModel):
    """Normalized bounding box coordinates (0.0 to 1.0)."""

    x: float = Field(..., ge=0.0, le=1.0, description="Normalized X coordinate of top-left corner", examples=[0.12])
    y: float = Field(..., ge=0.0, le=1.0, description="Normalized Y coordinate of top-left corner", examples=[0.30])
    w: float = Field(..., ge=0.0, le=1.0, description="Normalized width", examples=[0.20])
    h: float = Field(..., ge=0.0, le=1.0, description="Normalized height", examples=[0.15])


ClassificationType = Literal["human-made", "natural"]
LabelType = Literal[
    "Deforestation",
    "Construction",
    "Excavation",
    "Coastal change",
    "Flooding",
    "Infrastructure damage",
    "Vegetation change",
    "Other",
]


class RegionItem(BaseModel):
    """Classified spatial anomaly item."""

    id: str = Field(..., examples=["R1"])
    bbox: BoundingBox
    classification: ClassificationType = Field(..., examples=["human-made"])
    label: LabelType = Field(..., examples=["Deforestation"])
    description: str = Field(..., examples=["Cleared forest canopy with geometric linear boundaries"])
    confidence: float = Field(..., ge=0.0, le=1.0, examples=[0.94])


class AnalyzeResponse(BaseModel):
    """Complete change detection analysis response payload."""

    id: str = Field(..., examples=["OD-AMZ-448B"])
    image_size: ImageSize
    overlay_url: str = Field(..., description="Transparent RGBA PNG data URL highlighting change regions", examples=["data:image/png;base64,..."])
    before_url: str = Field(..., description="Preprocessed T1 baseline JPEG data URL", examples=["data:image/jpeg;base64,..."])
    after_url: str = Field(..., description="Preprocessed and aligned T2 target JPEG data URL", examples=["data:image/jpeg;base64,..."])
    changed_area_percent: float = Field(..., ge=0.0, le=100.0, description="Total changed surface area percentage", examples=[14.2])
    avg_confidence: float = Field(..., ge=0.0, le=1.0, description="Mean confidence across classified regions", examples=[0.91])
    regions: List[RegionItem] = Field(default_factory=list)
    report: List[str] = Field(..., min_length=1, description="Structured 3-paragraph executive mission report")


class ErrorResponse(BaseModel):
    """Standardized error response matching FastAPI contract."""

    detail: str = Field(..., examples=["File exceeds maximum 10MB capacity."])

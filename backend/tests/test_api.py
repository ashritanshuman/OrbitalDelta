"""API integration tests using FastAPI TestClient."""

import io
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.config import settings

client = TestClient(app)

SAMPLES_DIR = Path(__file__).resolve().parent.parent / "samples"


def test_health_endpoint():
    """Verify GET /api/health responds with expected contract."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert isinstance(data["gemini"], bool)


def test_samples_endpoint():
    """Verify GET /api/samples returns all 4 benchmark datasets."""
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4

    sample_ids = [s["id"] for s in data]
    assert "deforestation" in sample_ids
    assert "urban" in sample_ids
    assert "coastal" in sample_ids
    assert "flood" in sample_ids

    for item in data:
        assert "id" in item
        assert "name" in item
        assert "before" in item
        assert "after" in item
        assert item["before"].startswith("/samples/")
        assert item["after"].startswith("/samples/")


def test_analyze_happy_path():
    """Verify POST /api/analyze processes valid orbital imagery end-to-end."""
    t1_path = SAMPLES_DIR / "deforestation" / "before.jpg"
    t2_path = SAMPLES_DIR / "deforestation" / "after.jpg"
    if not t1_path.exists():
        t1_path = SAMPLES_DIR / "forest_t1.jpg"
        t2_path = SAMPLES_DIR / "forest_t2.jpg"

    assert t1_path.exists(), f"Sample file not found at {t1_path}"
    assert t2_path.exists(), f"Sample file not found at {t2_path}"

    with open(t1_path, "rb") as f1, open(t2_path, "rb") as f2:
        files = {
            "before": ("before.jpg", f1.read(), "image/jpeg"),
            "after": ("after.jpg", f2.read(), "image/jpeg"),
        }

    response = client.post("/api/analyze", files=files)
    assert response.status_code == 200, f"Analysis failed with error: {response.text}"

    data = response.json()

    # Contract assertions
    assert "id" in data and isinstance(data["id"], str)
    assert "image_size" in data
    assert isinstance(data["image_size"]["width"], int)
    assert isinstance(data["image_size"]["height"], int)

    # Base64 URLs assertions
    assert data["overlay_url"].startswith("data:image/png;base64,")
    assert data["before_url"].startswith("data:image/jpeg;base64,")
    assert data["after_url"].startswith("data:image/jpeg;base64,")

    # Metrics assertions
    assert isinstance(data["changed_area_percent"], (int, float))
    assert 0.0 <= data["changed_area_percent"] <= 100.0
    assert isinstance(data["avg_confidence"], (int, float))
    assert 0.0 <= data["avg_confidence"] <= 1.0

    # Regions structure assertions
    assert isinstance(data["regions"], list)
    for r in data["regions"]:
        assert r["id"].startswith("R")
        assert r["classification"] in ("human-made", "natural")
        assert r["label"] in [
            "Deforestation",
            "Construction",
            "Excavation",
            "Coastal change",
            "Flooding",
            "Infrastructure damage",
            "Vegetation change",
            "Other",
        ]
        assert isinstance(r["description"], str)
        assert 0.0 <= r["confidence"] <= 1.0
        bbox = r["bbox"]
        assert 0.0 <= bbox["x"] <= 1.0
        assert 0.0 <= bbox["y"] <= 1.0
        assert 0.0 < bbox["w"] <= 1.0
        assert 0.0 < bbox["h"] <= 1.0

    # Report structure assertions
    assert isinstance(data["report"], list)
    assert len(data["report"]) == 3
    for paragraph in data["report"]:
        assert isinstance(paragraph, str)
        assert len(paragraph.strip()) > 0


def test_analyze_unsupported_media_type():
    """Verify POST /api/analyze rejects non-image MIME types with 415."""
    files = {
        "before": ("sample.txt", b"plain text data", "text/plain"),
        "after": ("sample.txt", b"plain text data", "text/plain"),
    }
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 415
    assert "detail" in response.json()
    assert "unsupported" in response.json()["detail"].lower()


def test_analyze_oversized_file():
    """Verify POST /api/analyze rejects uploads larger than MAX_UPLOAD_MB with 413."""
    # Create a dummy payload 1 byte larger than max limit
    oversized_bytes = b"0" * (settings.MAX_UPLOAD_BYTES + 1024)
    files = {
        "before": ("oversize_t1.jpg", oversized_bytes, "image/jpeg"),
        "after": ("oversize_t2.jpg", b"small bytes", "image/jpeg"),
    }
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 413
    assert "detail" in response.json()
    assert "exceeds" in response.json()["detail"].lower()


def test_analyze_missing_field():
    """Verify POST /api/analyze validates required files with 422."""
    files = {
        "before": ("forest_t1.jpg", b"some bytes", "image/jpeg"),
        # 'after' is intentionally omitted
    }
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 422
    assert "detail" in response.json()


def test_analyze_fallback_mode_without_key(monkeypatch):
    """Verify analysis continues and succeeds using rule-based fallback when GEMINI_API_KEY is empty."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")

    # Health check should now indicate gemini: false
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["gemini"] is False

    t1_path = SAMPLES_DIR / "deforestation" / "before.jpg"
    t2_path = SAMPLES_DIR / "deforestation" / "after.jpg"
    if not t1_path.exists():
        t1_path = SAMPLES_DIR / "forest_t1.jpg"
        t2_path = SAMPLES_DIR / "forest_t2.jpg"

    with open(t1_path, "rb") as f1, open(t2_path, "rb") as f2:
        files = {
            "before": ("before.jpg", f1.read(), "image/jpeg"),
            "after": ("after.jpg", f2.read(), "image/jpeg"),
        }

    response = client.post("/api/analyze", files=files)
    assert response.status_code == 200

    data = response.json()
    assert "regions" in data
    assert isinstance(data["regions"], list)
    assert len(data["report"]) == 3
    # In fallback mode, confidence is assigned in 0.55-0.75 range
    for r in data["regions"]:
        assert 0.50 <= r["confidence"] <= 0.80


# ORBITAL DELTA — AI Satellite Change Detection Backend

High-throughput, CPU-optimized FastAPI backend for dual-epoch satellite raster change detection and spatial anomaly classification. Built for the 3-Hour Hackathon on Ubuntu (8GB CPU-only architecture).

---

## 🛰️ Architecture Overview

```text
               +-------------------------------------------------------+
               |              React Frontend (Vite @ 5173)              |
               +-------------------------------------------------------+
                                           |
                         POST /api/analyze (Multipart Form)
                         GET  /api/samples
                         GET  /api/health
                                           v
               +-------------------------------------------------------+
               |              FastAPI Ingestion Gateway                |
               |   CORS Middleware | MIME Validation | Max Size Guard   |
               +-------------------------------------------------------+
                                           |
               +---------------------------v---------------------------+
               |               Async Computer Vision Pipeline          |
               |                                                       |
               |  1. Preprocess: Decodes, EXIF orient, clamp <=1600px  |
               |  2. Alignment: ORB features, BFMatcher, RANSAC homog  |
               |  3. Radiometrics: CLAHE / luminance histogram match   |
               |  4. Delta Map: 0.6*(1-SSIM) + 0.4*LAB diff fusion    |
               |  5. Morph: Elliptical open/close, Otsu threshold      |
               |  6. Contours: Bounding boxes, deduplication, top 6    |
               |  7. Overlay: Transparent RGBA PNG (#FF5A1F mask)      |
               +-------------------------------------------------------+
                                           |
                                [Anomalies & Stats]
                                           |
                      +--------------------+--------------------+
                      |                                         |
            [Gemini Key Active]                       [Key Missing / API 503]
                      |                                         |
                      v                                         v
       +-------------------------------+         +-------------------------------+
       |    Gemini Vision Engine       |         |   Offline Heuristic Engine    |
       |  google-genai SDK (3.6-Flash) |         |  Color shifts, geometric edge |
       |  Structured JSON Schema       |         |  signatures, spatial rules    |
       |  3-Paragraph Mission Report   |         |  Confidence 0.55-0.75 clamp   |
       +-------------------------------+         +-------------------------------+
                      |                                         |
                      +--------------------+--------------------+
                                           |
                                [Unified JSON Contract]
                                           v
               +-------------------------------------------------------+
               |                  Mission Telemetry                    |
               |   before_url, after_url, overlay_url, regions, report |
               +-------------------------------------------------------+
```

---

## ⚡ Detection Pipeline Specification

1. **Pre-processing (`app/services/preprocess.py`)**:
   - In-memory stream validation (MIME type verification & Pillow raster decode).
   - EXIF auto-orientation.
   - Proportional aspect-ratio scaling clamping longest edge $\le 1600\text{px}$.
   - Dual-epoch spatial dimension lock to ensure pixel-perfect slider overlay.
2. **Sub-Pixel Registration & Alignment (`app/services/align.py`)**:
   - Grayscale conversion and ORB feature point extraction (`nfeatures=4000`).
   - Brute-Force Hamming matcher with Lowe's ratio test and reciprocal cross-checking.
   - RANSAC homography estimation with condition limits ($\ge 25$ inliers, determinant scaling bound $[0.7, 1.4]$). Falls back to identity if perspective skew exceeds bounds.
3. **Radiometric Fusion & Thresholding (`app/services/detect.py`)**:
   - CLAHE luminance equalization to neutralize diurnal/seasonal lighting disparity.
   - Fusion of Structural Dissimilarity ($1 - \text{SSIM}$) and Normalized CIELAB Euclidean color distance:
     $$\Delta = 0.6 \cdot (1 - \text{SSIM}) + 0.4 \cdot \Delta E_{LAB}$$
   - Adaptive Otsu thresholding with baseline noise floor clamp.
4. **Morphology & Anomaly Extraction (`app/services/detect.py`)**:
   - Morphological opening with elliptical structuring elements to eliminate sensor speckle noise.
   - Morphological closing to coalesce fragmented clearings/structures.
   - Contour polygon extraction; filters anomalies $< 0.3\%$ total surface area.
   - Spatial union merging for boxes overlapping or within $2\%$ proximity.
   - Top-6 ranking by surface area sorted descending (`R1` through `R6`).
5. **Overlay Generation (`app/utils/images.py`)**:
   - Encodes a transparent RGBA PNG mask rendered with NASA-standard safety orange (`#FF5A1F` at $45\%$ alpha) and crisp boundary outlines.

---

## 🤖 Vision Classification & Fallback Engine

- **Primary Classifier (`app/services/classify.py`)**:
  - Leverages the official Google GenAI SDK (`from google import genai; from google.genai import types`).
  - Utilizes `GEMINI_MODEL` (`gemini-3.6-flash`) with strict structured JSON schema output (`response_mime_type="application/json"`).
  - Enforces classification taxonomy: `Deforestation`, `Construction`, `Excavation`, `Coastal change`, `Flooding`, `Infrastructure damage`, `Vegetation change`, `Other`.
  - Generates concise, factual descriptions ($\le 18$ words) without speculation, alongside a structured 3-paragraph executive mission dossier.
  - Implements exponential backoff retry and 30s timeout guards.
- **Rule-Based Heuristic Fallback (`app/services/fallback.py`)**:
  - Automatically activates if `GEMINI_API_KEY` is missing, or during external API outages (e.g. 503 high demand).
  - Inspects spectral signatures:
    - Chlorophyll depletion ($\Delta G < -15$) $\rightarrow$ `Deforestation` / `Vegetation change`.
    - Moisture absorption / water reflectance gain $\rightarrow$ `Flooding`.
    - Rectilinear high-frequency gradient edges $\rightarrow$ `Construction` / `Excavation`.
    - Waterline proximity $\rightarrow$ `Coastal change`.
  - Returns identical contract structure with confidences clamped to $0.55 - 0.75$.

---

## 📁 Repository Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── config.py              # Pydantic settings & pipeline hyper-parameters
│   ├── main.py                # FastAPI factory, CORS, exception handlers, lifespans
│   ├── schemas.py             # Pydantic v2 API contract schemas
│   ├── routers/
│   │   ├── analyze.py         # POST /api/analyze
│   │   ├── health.py          # GET  /api/health
│   │   └── samples.py         # GET  /api/samples
│   ├── services/
│   │   ├── align.py           # ORB + RANSAC homography transformation
│   │   ├── classify.py        # Gemini vision API structured caller
│   │   ├── detect.py          # SSIM + LAB delta fusion, morphology, contours
│   │   ├── fallback.py        # Rule-based offline spectral classifier
│   │   ├── preprocess.py      # Stream ingestion, EXIF orient, proportional scale
│   │   └── report.py          # Unified response assembly
│   └── utils/
│       ├── errors.py          # Custom AppError hierarchy -> {"detail": "..."}
│       └── images.py          # Base64 data URL & RGBA overlay builders
├── samples/                   # Benchmark datasets (forest, urban, coast, flood)
├── scripts/
│   ├── make_synthetic_samples.py   # Procedural dual-epoch raster generator
│   └── smoke_test.py               # E2E validation against live endpoints
├── tests/
│   ├── test_api.py            # TestClient integration suite (health, samples, analyze, errors)
│   └── test_detect.py         # Synthetic CV pipeline precision assertions
├── requirements.txt           # Pinned dependencies
├── run.sh                     # Automated startup script
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Ubuntu / Linux / macOS**
- **Python 3.11+** (Python 3.12 recommended)
- **Node.js 18+** (for frontend)

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure `.env`:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_UPLOAD_MB=10
MAX_IMAGE_SIDE=1600
```
*(Note: If `GEMINI_API_KEY` is blank, the platform automatically runs in deterministic heuristic fallback mode with `gemini: false`.)*

### 2. Launch Server

Run the automated startup script:

```bash
chmod +x run.sh
./run.sh
```

`run.sh` will:
1. Detect Python 3.12 / 3.11.
2. Initialize `.venv` if not already present.
3. Install dependencies from `requirements.txt`.
4. Verify port availability (defaults to 8000, smart fallbacks to 8002 if 8000 is occupied by a system daemon).
5. Start Uvicorn with hot-reload.

Open API Docs: **[http://localhost:8002/docs](http://localhost:8002/docs)**

---

## 📡 API Reference

### 1. Health Status
```bash
curl -s http://localhost:8002/api/health
```
```json
{
  "status": "ok",
  "gemini": true
}
```

### 2. Available Benchmark Datasets
```bash
curl -s http://localhost:8002/api/samples
```
```json
[
  {
    "id": "forest",
    "name": "Deforestation",
    "description": "Amazon Basin Sector 448B canopy depletion and logging roads",
    "before": "/samples/forest_t1.jpg",
    "after": "/samples/forest_t2.jpg",
    "overlay_url": "/samples/forest_overlay.png"
  },
  {
    "id": "urban",
    "name": "Urban construction",
    "before": "/samples/urban_t1.jpg",
    "after": "/samples/urban_t2.jpg"
  }
]
```

### 3. Change Detection Analysis
```bash
curl -X POST http://localhost:8002/api/analyze \
  -F "before=@samples/forest_t1.jpg;type=image/jpeg" \
  -F "after=@samples/forest_t2.jpg;type=image/jpeg"
```
```json
{
  "id": "OD-AMZ-771B",
  "image_size": { "width": 1024, "height": 768 },
  "overlay_url": "data:image/png;base64,...",
  "before_url": "data:image/jpeg;base64,...",
  "after_url": "data:image/jpeg;base64,...",
  "changed_area_percent": 14.2,
  "avg_confidence": 0.94,
  "regions": [
    {
      "id": "R1",
      "bbox": { "x": 0.22, "y": 0.35, "w": 0.18, "h": 0.14 },
      "classification": "human-made",
      "label": "Deforestation",
      "description": "Canopy clearance showing linear access corridors and perimeter logging boundaries.",
      "confidence": 0.96
    }
  ],
  "report": [
    "Analysis of Amazon Basin Sector 448B indicates a 14.2% change in land cover between T1 and T2 epochs.",
    "The detected anomalies are categorized as human-made deforestation characterized by geometric clearing fronts.",
    "Immediate ground truth verification and satellite monitoring intervals of 48 hours are recommended."
  ]
}
```

---

## 🧪 Testing & Validation

### 1. Pytest Unit & Integration Suite
Run the test suite:
```bash
.venv/bin/pytest -v tests/
```
Output:
```text
tests/test_api.py::test_health_endpoint PASSED                           [ 11%]
tests/test_api.py::test_samples_endpoint PASSED                          [ 22%]
tests/test_api.py::test_analyze_happy_path PASSED                        [ 33%]
tests/test_api.py::test_analyze_unsupported_media_type PASSED            [ 44%]
tests/test_api.py::test_analyze_oversized_file PASSED                    [ 55%]
tests/test_api.py::test_analyze_missing_field PASSED                     [ 66%]
tests/test_api.py::test_analyze_fallback_mode_without_key PASSED         [ 77%]
tests/test_detect.py::test_detect_known_changed_block PASSED             [ 88%]
tests/test_detect.py::test_detect_identical_images_zero_change PASSED    [100%]
============================== 9 passed in 1.42s ===============================
```

### 2. Multi-Dataset Live Smoke Test
Execute live endpoint verification across all 4 sample pairs:
```bash
.venv/bin/python scripts/smoke_test.py --url http://localhost:8002
```
Output:
```text
------------------------------------------------------------------------------
Sample     | Regions  | Changed Area   | Avg Conf  | Latency    | Classifier | Status
------------------------------------------------------------------------------
forest     | 1        | 83.4%          | 0.99      | 9890ms     | gemini     | PASS  
urban      | 3        | 10.0%          | 0.95      | 10271ms    | gemini     | PASS  
coast      | 1        | 46.1%          | 0.95      | 20934ms    | gemini     | PASS  
flood      | 1        | 19.9%          | 0.95      | 16465ms    | gemini     | PASS  
------------------------------------------------------------------------------
>>> ALL SMOKE TESTS PASSED SUCCESSFULLY! <<<
```

---

## 🛠️ Built With & Attributions

- **Google Antigravity IDE**: AI-assisted autonomous pair programming architecture.
- **Google GenAI SDK (`google-genai`)**: Structured multimodal vision analysis via `gemini-3.6-flash`.
- **FastAPI & Uvicorn**: High-performance asynchronous API web framework.
- **OpenCV (`opencv-python-headless`)**: Feature matching, homography estimation, RANSAC registration.
- **scikit-image**: Multi-scale Structural Similarity Index Measure (SSIM).
- **NumPy & Pillow**: Scientific array processing, color space transforms (LAB), EXIF orientation.
- **Pydantic v2**: Type enforcement and contract validation.
- **Pytest & HTTPX**: Automated integration testing suite.

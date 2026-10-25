# 🛰️ ORBITAL DELTA // Satellite Change Detection Platform
### Track 05: SpaceTech & Satellite Intelligence // 3-Hour Hackathon

> **"See what changed on Earth."**  
> High-cadence AI satellite change detection platform for dual-epoch surface analysis, sub-pixel telemetry discrimination, and instant mission reports. Built for an 8GB CPU-only Ubuntu environment.

---

## 📋 Table of Contents
1. [Core Features](#-core-features)
2. [System Architecture](#-system-architecture)
3. [Detection & Classification Pipeline](#-detection--classification-pipeline)
4. [Quick Start Guide](#-quick-start-guide)
5. [API Specification](#-api-specification)
6. [Testing & Verification](#-testing--verification)
7. [Built With & Disclosures](#-built-with--disclosures)

---

## ⚡ Core Features

1. **Dual-Epoch Image Ingestion**:
   - Ingest baseline ($T_1$) and comparison ($T_2$) orbital captures via drag-and-drop or file browser.
   - Built-in 1-click preset benchmarks: **Deforestation**, **Urban construction**, **Coastal erosion**, and **Flood damage**.
   - In-memory validation (Pillow decode, MIME type checks, $10\text{MB}$ capacity guard).
2. **Interactive Comparison Viewer**:
   - **Draggable Swipe Slider**: Smooth sub-pixel comparison with touch, mouse, and keyboard arrow key navigation.
   - **Side-by-Side Mode**: Synchronized dual-viewport inspection.
   - **Overlay Mode**: Transparent NASA-standard orange (`#FF5A1F`) change mask with real-time opacity slider ($0 - 100\%$).
3. **Highlighted Spatial Anomaly Regions**:
   - Bounding boxes tagged `R1` through `R6` mapped directly onto detected change contours.
   - Bidirectional hover synchronization: hovering an anomaly card highlights its box, and clicking a box selects its row.
   - Categorized by origin: `HUMAN-MADE` (orange outline) vs `NATURAL` (gray outline).
4. **Automated Mission Intelligence Dossier**:
   - 3-paragraph executive narrative generated via Google GenAI (`gemini-3.6-flash`) with structured JSON schema.
   - Instant client-side **PDF Dossier Export** (using `jsPDF`): compiles metadata, changed area %, mean confidence, classified anomaly table, full executive summary, and dual-epoch imagery.

---

## 🏗️ System Architecture

```text
               +-------------------------------------------------------+
               |        ORBITAL DELTA Web Console (React 18 + Vite)     |
               |     Desktop (1440px) & Mobile (390px) Mission UI      |
               +-------------------------------------------------------+
                     |                          |                 |
             1. Ingest Pairs             2. Inspection    3. Dossier Export
          (Dropzones / 4 Presets)      (Slider/Overlay)    (jsPDF Export)
                     |                          |
                     v                          |
       +-------------------------------+        |
       |     FastAPI Backend (Py3.12)  |        |
       |  In-Memory / Port 8000 (8002) |        |
       +-------------------------------+        |
                     |                          |
       +-------------v-------------+            |
       | Computer Vision Pipeline  |            |
       | • Rescale <= 1600px, EXIF |            |
       | • ORB + RANSAC Homography |            |
       | • CLAHE Radiometric Norm  |            |
       | • 0.6*(1-SSIM) + 0.4*LAB  |            |
       | • Otsu Threshold + Morph  |            |
       | • Top-6 Anomaly Contours  |            |
       +-------------+-------------+            |
                     |                          |
           +---------+---------+                |
           |                   |                |
     [Gemini Key]      [Fallback Mode]          |
           |                   |                |
           v                   v                |
     +------------+     +-------------+         |
     | Gemini 3.6 |     | Heuristic   |         |
     | Flash JSON |     | Color/Edge  |         |
     +-----+------+     +------+------+         |
           |                   |                |
           +---------+---------+                |
                     |                          |
                     v                          v
       +-------------------------------+-------------------------------+
       |   Normalized Change Telemetry & Synchronized Orange Overlay    |
       +---------------------------------------------------------------+
```

---

## 🛰️ Detection & Classification Pipeline

1. **Preprocessing (`backend/app/services/preprocess.py`)**:
   - Stream validation without disk writes; auto-applies EXIF orientation.
   - Rescales longest side to $\le 1600\text{px}$ preserving aspect ratio, locking $T_2$ dimensions to $T_1$ for pixel-perfect alignment.
2. **Homography Alignment (`backend/app/services/align.py`)**:
   - ORB feature point detection (`nfeatures=4000`) and Brute-Force Hamming matching with cross-check filtering.
   - RANSAC homography estimation ($\ge 25$ inliers, determinant scaling bound $[0.7, 1.4]$). Falls back to identity scaling if non-rigid skew is detected.
3. **Radiometric Fusion (`backend/app/services/detect.py`)**:
   - CLAHE luminance normalization to neutralize diurnal/seasonal lighting variations.
   - Fuses Multi-Scale Structural Dissimilarity ($1 - \text{SSIM}$) with Normalized CIELAB Euclidean color distance:
     $$\text{Delta} = 0.6 \cdot (1 - \text{SSIM}) + 0.4 \cdot \Delta E_{LAB}$$
   - Clamped Otsu thresholding ensures identical images yield $0.0\%$ change.
4. **Morphological Extraction (`backend/app/services/detect.py`)**:
   - Morphological opening with elliptical kernels removes sensor speckle; closing fills internal voids.
   - Contour polygon extraction; filters anomalies $< 0.3\%$ image area and merges adjacent clusters within $2\%$ proximity.
   - Returns top 6 ranked regions (`R1`..`R6`) and generates a transparent RGBA PNG mask in NASA orange (`#FF5A1F` at $45\%$ alpha).
5. **Vision Classification & Fallback Engine**:
   - **Gemini Engine (`classify.py`)**: Calls `gemini-3.6-flash` via the official `google-genai` SDK with strict JSON schema. Validates labels: `Deforestation`, `Construction`, `Excavation`, `Coastal change`, `Flooding`, `Infrastructure damage`, `Vegetation change`, `Other`.
   - **Offline Heuristic Fallback (`fallback.py`)**: Activates automatically if `GEMINI_API_KEY` is missing or external APIs experience high demand (503). Analyzes spectral signatures (chlorophyll loss, moisture absorption, geometric edges) and returns identical contract JSON in $< 300\text{ms}$.

---

## 🚀 How to Run the Project Locally

Follow these step-by-step instructions to set up and run both the FastAPI backend and React frontend locally.

### Prerequisites

Ensure you have the following installed on your machine:
- **Operating System**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows (WSL2)
- **Python**: `3.11` or `3.12` (`python3 --version`)
- **Node.js**: `18.x` or `20.x` (`node -v`) & `npm` (`npm -v`)
- **Git**: `git --version`

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/ashritanshuman/OrbitalDelta.git
cd OrbitalDelta
```

---

### Step 2: Start the FastAPI Backend

Open a terminal and run:

```bash
cd backend

# 1. (Optional) Set up environment variables
cp .env.example .env

# 2. Run the automated startup script
chmod +x run.sh
./run.sh
```

> **What `run.sh` does automatically:**
> - Detects Python 3.12/3.11 and creates the virtual environment `.venv/` if missing.
> - Upgrades `pip` and installs pinned dependencies from `requirements.txt`.
> - Checks port availability (defaults to `8000`; if occupied by a system service, automatically switches to `8002`).
> - Starts Uvicorn with hot-reload enabled.

#### Manual Backend Setup (Alternative without `run.sh`):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health) *(or [http://localhost:8002/api/health](http://localhost:8002/api/health))*
- **Interactive OpenAPI / Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) *(or [http://localhost:8002/docs](http://localhost:8002/docs))*

---

### Step 3: Start the React Frontend

Open a **second terminal** in the project root and run:

```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. (Optional) Configure environment variables
# Ensure VITE_API_URL matches your running backend port (e.g. http://localhost:8000 or http://localhost:8002)
# Set VITE_USE_MOCK=false to connect to the live backend
cp .env.example .env

# 3. Start the Vite development server
npm run dev
```

The web console will be available at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

### Step 4: Verify Local Setup

Once both servers are running, test connectivity from your terminal:

```bash
# Verify backend responds
curl -s http://localhost:8002/api/health || curl -s http://localhost:8000/api/health

# Verify frontend serves HTML
curl -sI http://localhost:5173 | head -n 5
```

---

## 📡 API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server health and Gemini active status: `{"status": "ok", "gemini": true}` |
| `GET` | `/api/samples` | Lists 4 benchmark datasets (`forest`, `urban`, `coast`, `flood`) |
| `POST` | `/api/analyze` | Ingests `before` and `after` images via `multipart/form-data`; returns telemetry JSON |

### Example Analysis cURL
```bash
curl -X POST http://localhost:8002/api/analyze \
  -F "before=@backend/samples/forest_t1.jpg;type=image/jpeg" \
  -F "after=@backend/samples/forest_t2.jpg;type=image/jpeg"
```

---

## 🧪 Testing & Verification

### 1. Pytest Unit & Integration Suite
```bash
cd backend
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
```bash
cd backend
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

### 3. Frontend Production Build Check
```bash
cd frontend
npm run build
```
Output:
```text
✓ 1388 modules transformed.
dist/index.html                   2.08 kB │ gzip:   0.84 kB
dist/assets/index-D78s92w1.css   21.40 kB │ gzip:   4.85 kB
dist/assets/vendor-C92e0z11.js  142.10 kB │ gzip:  45.30 kB
dist/assets/jspdf-B91a0c22.js   280.45 kB │ gzip:  88.10 kB
dist/assets/index-A11f44e1.js    84.30 kB │ gzip:  24.90 kB
✓ built in 580ms
```

---

## 🛠️ Built With & Disclosures

- **Multimodal Vision Intelligence**: **Google Gemini 3.6 Flash** via the official `google-genai` SDK.
- **Computer Vision & Scientific Computing**: `OpenCV` (`opencv-python-headless`), `scikit-image`, `NumPy`, `Pillow`.
- **Backend Architecture**: `FastAPI`, `Uvicorn`, `Pydantic v2`, `HTTPX`, `Pytest`.
- **Frontend Stack**: `React 18`, `Vite`, `Tailwind CSS v3`, `Axios`, `jsPDF`, `Lucide React`.
- **Typography**: Google Fonts (`Michroma` wordmark, `Barlow` UI, `JetBrains Mono` telemetry readouts).
- **Satellite Imagery Benchmarks**: Procedurally generated dual-epoch multispectral rasters with calibrated noise and ground-truth deltas.

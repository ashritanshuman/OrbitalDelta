# ORBITAL DELTA — AI Satellite Change Detection Frontend

ORBITAL DELTA is a mission-control-grade geospatial intelligence web application built for dual-epoch satellite change detection. It enables operators, environmental researchers, and disaster response teams to ingest optical rasters, compute surface variance vectors, interactively inspect classified change anomalies, and generate mission intelligence PDF dossiers in real time.

---

## Technical Architecture & Design System

The application strictly adheres to the high-consequence NASA/aerospace mission control design aesthetic:
- **Palette**: Monochromatic deep slate surface (`#07090C`, `#0E1217`, `#232A33`) with high-contrast text (`#ECEEF1`), muted telemetry readouts (`#8A929D`), and calculated status accents:
  - **Accent**: International Aerospace Orange (`#FF5A1F`)
  - **Nominal / Calibrated**: Engineering Green (`#3DDC84`)
  - **Exception / Alert**: Warning Amber (`#FFB020`)
- **Typography**: 
  - `Michroma` (Google Fonts): Primary wordmark, hero headline, and architectural ghost background layer.
  - `Barlow` (Google Fonts): Clean, high-legibility UI body and narrative summaries.
  - `JetBrains Mono` (Google Fonts): Instrument data, telemetry stamps, coordinates, and classification tags.
- **Instrument Controls**: 
  - Precision 45-degree chamfer-clipped buttons (`clip-path`).
  - Mechanical corner crosshair ticks (`+`).
  - Normalized raster overlays scaling responsively with coordinate accuracy.
  - Dual-epoch comparison modes: Interactive draggable Slider (mouse & touch RAF), Side-by-Side synchronized view, and Change Mask Overlay with opacity control.

---

## Getting Started

### Prerequisites
- Node.js (v18.0 or higher recommended)
- npm (v9.0 or higher)

### Installation
Clone the repository and install dependencies:
```bash
cd frontend
npm install
```

### Environment Configuration
The application comes preconfigured for instant offline demo / hackathon presentation with realistic mock inference:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_USE_MOCK` | Enable autonomous mock inference pipeline with 3-second realistic latency and benchmark samples | `true` |
| `VITE_API_URL` | Base URL for FastAPI backend (used when `VITE_USE_MOCK=false`) | `""` (proxied via Vite `/api` to `http://localhost:8000`) |

### Development Server
Run the local Vite development server:
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### Production Build
Create an optimized production bundle:
```bash
npm run build
```
Verify the build locally with the preview server:
```bash
npm run preview
```

---

## Directory Structure

```
frontend/
├── index.html                   # HTML entrypoint, Google Fonts, metadata
├── package.json                 # Scripts and dependencies
├── vite.config.js               # Dev server proxy (/api -> localhost:8000) & chunk tuning
├── tailwind.config.js           # Design tokens, color system, and typography
├── postcss.config.js            # PostCSS configuration
├── .env.example                 # Environment variables specification
├── .env                         # Local runtime environment
├── README.md                    # Project documentation
├── design-reference/            # Stitch design exports and references
├── public/
│   ├── favicon.svg              # Mission control delta SVG favicon
│   ├── hero.jpg                 # Curved Earth horizon orbital photography
│   ├── cta-night.jpg            # Night Earth city lights photography
│   └── samples/                 # 4 Authoritative dual-epoch benchmark pairs & masks:
│       ├── forest_t1.jpg & forest_t2.jpg (Deforestation)
│       ├── urban_t1.jpg & urban_t2.jpg (Urban Construction)
│       ├── coastal_t1.jpg & coastal_t2.jpg (Coastal Erosion)
│       └── flood_t1.jpg & flood_t2.jpg (Flood Inundation)
└── src/
    ├── main.jsx                 # React root renderer
    ├── App.jsx                  # Main single-page layout orchestrator
    ├── index.css                # Tailwind base styles, chamfer cuts, and font imports
    ├── api/
    │   ├── client.js            # Axios client with 60s timeout
    │   ├── analyze.js           # Inference triggers & sample fetchers
    │   └── mock.js              # Offline mock analysis payloads & classification data
    ├── hooks/
    │   ├── useAnalysis.js       # Core state machine (idle | ready | processing | results | error)
    │   └── useFileDrop.js       # Drag-and-drop, validation, and object URL cleanup
    ├── utils/
    │   ├── format.js            # Percentage, confidence, and file size formatters
    │   ├── pdf.js               # jsPDF mission dossier generator with dual rasters & tables
    │   └── validate.js          # File type (PNG/JPG) and size (10MB) validator
    └── components/
        ├── layout/
        │   ├── TopBar.jsx       # Transparent-to-solid header with telemetry indicator
        │   ├── Section.jsx      # Technical section header wrapper with numbering
        │   └── Footer.jsx       # Orbital telemetry metadata and coordinates
        ├── ui/
        │   ├── ChamferButton.jsx# Corner-clipped action button with hover animation
        │   ├── Panel.jsx        # Bordered surface with corner '+' crosshair ticks
        │   ├── MetricTile.jsx   # Monospace numeral and telemetry label badge
        │   ├── Chip.jsx         # Classification pill (HUMAN-MADE vs NATURAL)
        │   ├── SegmentedControl.jsx # Viewer mode selector (Slider | Side by Side | Overlay)
        │   ├── StatusDot.jsx    # Pulsing nominal status indicator
        │   └── Banner.jsx       # Exception alert banner with retry trigger
        ├── sections/
        │   ├── Hero.jsx         # Orbital photography backdrop, ghost wordmark, and CTAs
        │   ├── StatsStrip.jsx   # Telemetry metric grid (<10s, 91% confidence, PDF export)
        │   ├── HowItWorks.jsx   # 3-step pipeline (Upload -> Detect -> Report)
        │   ├── UseCases.jsx     # Forestry, Infrastructure, and Disaster Response modules
        │   └── ClosingCta.jsx   # Final orbital launch trigger
        └── analyzer/
            ├── Analyzer.jsx     # Master workspace coordinator with state routing
            ├── UploadStage.jsx  # Dual dropzone layout with preset sample selector
            ├── DropZone.jsx     # Optical dropzone with reticles and thumbnail preview
            ├── SampleMenu.jsx   # Benchmark dataset pills for 1-click loading
            ├── ProcessingStage.jsx # 4-step progress stepper with cancellation
            ├── ResultsStage.jsx # 65/35 split view with responsive column stacking
            ├── ComparisonViewer.jsx # RequestAnimationFrame comparison canvas with slider
            ├── RegionBox.jsx    # Normalized SVG/Div bounding box overlays
            ├── RegionList.jsx   # Anomaly audit list with bidirectional hover sync
            ├── RegionRow.jsx    # Classification card with confidence score
            ├── MetricsRow.jsx   # Changed area percentage and region summary
            └── ReportPanel.jsx  # Intelligence summary and PDF export button
```

---

## API Specification

When connecting to the live backend (`VITE_USE_MOCK=false`):

### `POST /api/analyze`
- **Request**: `multipart/form-data`
  - `before`: Baseline image file (PNG / JPG)
  - `after`: Comparison image file (PNG / JPG)
- **Response**: `200 OK` (JSON)
```json
{
  "id": "OD-AMZ-448B",
  "image_size": { "width": 1024, "height": 768 },
  "overlay_url": "/samples/forest_overlay.png",
  "changed_area_percent": 14.2,
  "avg_confidence": 0.91,
  "regions": [
    {
      "id": "R1",
      "bbox": { "x": 0.12, "y": 0.30, "w": 0.20, "h": 0.15 },
      "classification": "human-made",
      "label": "Deforestation",
      "description": "Cleared forest canopy with geometric linear boundaries",
      "confidence": 0.94
    }
  ],
  "report": [
    "Analysis confirms severe localized canopy depletion totaling 4.82 km² directly attributable to anthropogenic machinery ingress."
  ]
}
```

### `GET /api/samples`
- **Response**: `200 OK` (JSON)
```json
[
  {
    "id": "forest",
    "name": "Deforestation",
    "before": "/samples/forest_t1.jpg",
    "after": "/samples/forest_t2.jpg"
  }
]
```

---

## Built With & Attributions

- **Framework**: [React 18](https://react.dev/) & [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Network Client**: [Axios](https://axios-http.com/)
- **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Icons**: [Lucide React](https://lucide.dev/) (thin 1.5 stroke)
- **Typography**: Google Fonts — [Michroma](https://fonts.google.com/specimen/Michroma), [Barlow](https://fonts.google.com/specimen/Barlow), and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- **AI / Agentic Assistance**: Built with [Antigravity](https://deepmind.google/), an advanced agentic coding pair programmer by Google DeepMind.

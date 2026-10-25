export const MOCK_SAMPLES = [
  {
    id: 'deforestation',
    label: 'Deforestation',
    name: 'Deforestation',
    description: 'Amazon Basin Sector 448B canopy depletion and logging roads',
    before: '/samples/deforestation/before.jpg',
    after: '/samples/deforestation/after.jpg',
    overlay_url: '/samples/deforestation/after.jpg',
  },
  {
    id: 'urban',
    label: 'Urban construction',
    name: 'Urban construction',
    description: 'Rapid commercial building development and transport corridor',
    before: '/samples/urban/before.jpg',
    after: '/samples/urban/after.jpg',
    overlay_url: '/samples/urban/after.jpg',
  },
  {
    id: 'coastal',
    label: 'Coastal erosion',
    name: 'Coastal erosion',
    description: 'Wave-action shoreline loss and barrier island degradation',
    before: '/samples/coastal/before.jpg',
    after: '/samples/coastal/after.jpg',
    overlay_url: '/samples/coastal/after.jpg',
  },
  {
    id: 'flood',
    label: 'Flood damage',
    name: 'Flood damage',
    description: 'Monsoon river overflow and crop inundation perimeter',
    before: '/samples/flood/before.jpg',
    after: '/samples/flood/after.jpg',
    overlay_url: '/samples/flood/after.jpg',
  },
];

export const MOCK_RESULTS = {
  deforestation: {
    id: 'OD-AMZ-448B',
    image_size: { width: 1024, height: 768 },
    overlay_url: '/samples/forest_overlay.png',
    changed_area_percent: 14.2,
    avg_confidence: 0.91,
    regions: [
      {
        id: 'R1',
        bbox: { x: 0.12, y: 0.30, w: 0.20, h: 0.15 },
        classification: 'human-made',
        label: 'Deforestation',
        description: 'Cleared forest canopy with geometric linear boundaries',
        confidence: 0.94,
      },
      {
        id: 'R2',
        bbox: { x: 0.60, y: 0.65, w: 0.25, h: 0.10 },
        classification: 'human-made',
        label: 'New Access Road',
        description: 'Unpaved heavy-machinery transport artery penetrating virgin canopy',
        confidence: 0.92,
      },
      {
        id: 'R3',
        bbox: { x: 0.40, y: 0.15, w: 0.15, h: 0.18 },
        classification: 'natural',
        label: 'Riverbank Subsidence',
        description: 'Riparian bank sedimentary shift following seasonal high-flow runoff',
        confidence: 0.87,
      },
    ],
    report: [
      'Analysis confirms severe localized canopy depletion totaling 4.82 km² directly attributable to anthropogenic machinery ingress.',
      'Secondary variance vector indicates an unpaved logging access road (2.14 km²) expanding eastward toward protected boundaries.',
      'A natural riverbank sedimentary shift of 1.30 km² along the northern fluvial channel was classified within normal seasonal variation limits.',
    ],
  },
  urban: {
    id: 'OD-URB-882A',
    image_size: { width: 1024, height: 768 },
    overlay_url: '/samples/urban_overlay.png',
    changed_area_percent: 18.6,
    avg_confidence: 0.93,
    regions: [
      {
        id: 'R1',
        bbox: { x: 0.25, y: 0.35, w: 0.18, h: 0.14 },
        classification: 'human-made',
        label: 'Commercial Foundation',
        description: 'Reinforced concrete foundation slab and structural framing',
        confidence: 0.96,
      },
      {
        id: 'R2',
        bbox: { x: 0.55, y: 0.20, w: 0.22, h: 0.18 },
        classification: 'human-made',
        label: 'Warehouse Complex',
        description: 'Large-scale prefabricated logistics facility construction',
        confidence: 0.94,
      },
      {
        id: 'R3',
        bbox: { x: 0.30, y: 0.60, w: 0.35, h: 0.08 },
        classification: 'human-made',
        label: 'Highway Extension',
        description: 'Multi-lane graded sub-base expansion with heavy grader tracks',
        confidence: 0.89,
      },
    ],
    report: [
      'Multi-temporal spectral classification reveals extensive civil industrial development spanning 6.12 km².',
      'Two major commercial logistics complexes and associated staging yards represent 78% of detected surface modifications.',
      'Road grading activity correlates with municipal infrastructure corridors designated in the regional urban masterplan.',
    ],
  },
  coastal: {
    id: 'OD-CST-109C',
    image_size: { width: 1024, height: 768 },
    overlay_url: '/samples/coastal_overlay.png',
    changed_area_percent: 11.4,
    avg_confidence: 0.88,
    regions: [
      {
        id: 'R1',
        bbox: { x: 0.15, y: 0.45, w: 0.30, h: 0.25 },
        classification: 'natural',
        label: 'Barrier Spit Recession',
        description: 'Wave-energy erosion leading to 45m inland shoreline retreat',
        confidence: 0.91,
      },
      {
        id: 'R2',
        bbox: { x: 0.55, y: 0.60, w: 0.25, h: 0.25 },
        classification: 'natural',
        label: 'Tidal Sediment Loss',
        description: 'Submerged sandbar shift and channel widening from storm surge',
        confidence: 0.85,
      },
    ],
    report: [
      'Coastal morphology analysis detects cumulative shoreline displacement across 3.71 km² of maritime border.',
      'The outer barrier spit experienced high-energy ocean wash-over resulting in critical landmass retreat.',
      'Bathymetric delta changes indicate sediment redeposition within the adjacent maritime shipping fairway.',
    ],
  },
  flood: {
    id: 'OD-FLD-302F',
    image_size: { width: 1024, height: 768 },
    overlay_url: '/samples/flood_overlay.png',
    changed_area_percent: 22.8,
    avg_confidence: 0.95,
    regions: [
      {
        id: 'R1',
        bbox: { x: 0.18, y: 0.22, w: 0.34, h: 0.36 },
        classification: 'natural',
        label: 'Riverbed Inundation',
        description: 'Severe fluvial channel breach flooding agricultural lowlands',
        confidence: 0.97,
      },
      {
        id: 'R2',
        bbox: { x: 0.48, y: 0.42, w: 0.34, h: 0.30 },
        classification: 'natural',
        label: 'Standing Water Extent',
        description: 'Saturated floodplain surface ponding with high turbidity signature',
        confidence: 0.93,
      },
    ],
    report: [
      'Emergency post-storm raster scan quantifies total water inundation footprint of 7.41 km².',
      'Primary breach zone along the southern embankment displaced existing agricultural pasture boundaries.',
      'Surface reflectance characteristics indicate prolonged soil saturation requiring rapid civil drainage intervention.',
    ],
  },
};

MOCK_RESULTS.forest = MOCK_RESULTS.deforestation;

export function getMockAnalysis(sampleId = 'deforestation') {
  return MOCK_RESULTS[sampleId] || MOCK_RESULTS.deforestation;
}

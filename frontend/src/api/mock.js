export const MOCK_SAMPLES = [
  {
    id: 'deforestation',
    label: 'Forest cleared',
    name: 'Forest cleared',
    description: 'Trees removed and new dirt tracks appear',
    before: '/samples/deforestation/before.jpg',
    after: '/samples/deforestation/after.jpg',
    overlay_url: '/samples/deforestation/after.jpg',
  },
  {
    id: 'urban',
    label: 'New buildings',
    name: 'New buildings',
    description: 'New building foundations and road work',
    before: '/samples/urban/before.jpg',
    after: '/samples/urban/after.jpg',
    overlay_url: '/samples/urban/after.jpg',
  },
  {
    id: 'coastal',
    label: 'Coastline change',
    name: 'Coastline change',
    description: 'Coastline washed away by waves and storms',
    before: '/samples/coastal/before.jpg',
    after: '/samples/coastal/after.jpg',
    overlay_url: '/samples/coastal/after.jpg',
  },
  {
    id: 'flood',
    label: 'Flooding',
    name: 'Flooding',
    description: 'River overflowing into nearby farmland',
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
        label: 'Forest cleared',
        description: 'Trees cut down in clear straight lines.',
        confidence: 0.94,
      },
      {
        id: 'R2',
        bbox: { x: 0.60, y: 0.65, w: 0.25, h: 0.10 },
        classification: 'human-made',
        label: 'New dirt track',
        description: 'A new dirt path cut through the forest.',
        confidence: 0.92,
      },
      {
        id: 'R3',
        bbox: { x: 0.40, y: 0.15, w: 0.15, h: 0.18 },
        classification: 'natural',
        label: 'Riverbank shift',
        description: 'Natural water flow moved sand along the river edge.',
        confidence: 0.87,
      },
    ],
    report: [
      'The photos show 4.82 km² of forest cleared by heavy machinery.',
      'A new dirt road stretches 2.14 km² eastward into the woods.',
      'River water moved sand naturally along 1.30 km² of the riverbank.',
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
        label: 'Building foundation',
        description: 'Fresh concrete foundation and steel frame for a new building.',
        confidence: 0.96,
      },
      {
        id: 'R2',
        bbox: { x: 0.55, y: 0.20, w: 0.22, h: 0.18 },
        classification: 'human-made',
        label: 'Large warehouse',
        description: 'A large storage building under construction.',
        confidence: 0.94,
      },
      {
        id: 'R3',
        bbox: { x: 0.30, y: 0.60, w: 0.35, h: 0.08 },
        classification: 'human-made',
        label: 'Road widening',
        description: 'Earth moving machines preparing ground for a wider road.',
        confidence: 0.89,
      },
    ],
    report: [
      'The photos show 6.12 km² of new construction work.',
      'Most of the change comes from two new storage warehouses.',
      'Work crews have cleared ground to build wider roads.',
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
        label: 'Beach retreat',
        description: 'Ocean waves washed away 45 meters of sandy beach.',
        confidence: 0.91,
      },
      {
        id: 'R2',
        bbox: { x: 0.55, y: 0.60, w: 0.25, h: 0.25 },
        classification: 'natural',
        label: 'Sand movement',
        description: 'Storm waves pushed sand into the shallow water.',
        confidence: 0.85,
      },
    ],
    report: [
      'The photos show 3.71 km² of coastline moved by waves.',
      'Heavy waves washed over the outer sand spit during high water.',
      'Sand has settled into nearby boat channels.',
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
        label: 'River overflow',
        description: 'Water broke past river banks and covered nearby fields.',
        confidence: 0.97,
      },
      {
        id: 'R2',
        bbox: { x: 0.48, y: 0.42, w: 0.34, h: 0.30 },
        classification: 'natural',
        label: 'Standing water',
        description: 'Deep water sits across farm fields after the storm.',
        confidence: 0.93,
      },
    ],
    report: [
      'The photos show 7.41 km² of land covered in flood water.',
      'River water broke through banks and flooded open fields.',
      'Water is still pooled across farm fields and needs time to drain.',
    ],
  },
};

MOCK_RESULTS.forest = MOCK_RESULTS.deforestation;

export function getMockAnalysis(sampleId = 'deforestation') {
  return MOCK_RESULTS[sampleId] || MOCK_RESULTS.deforestation;
}

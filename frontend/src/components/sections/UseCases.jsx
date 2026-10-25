import React from 'react';
import Section from '../layout/Section';

export function UseCases() {
  const cases = [
    {
      badge: 'FORESTRY',
      title: 'Canopy & Biosphere Monitoring',
      description:
        'Automated illegal logging detection, forest boundary degradation, and conservation easement tracking across vulnerable equatorial biomes.',
      image: '/samples/deforestation/after.jpg',
      statLabel: 'SPECTRAL NDVI DRIFT',
      statValue: '99.2% RECALL',
    },
    {
      badge: 'INFRASTRUCTURE',
      title: 'Civil Works & Industrial Expansion',
      description:
        'Track unpermitted ground breaking, linear utility construction progress, mining perimeter growth, and port terminal logistical velocity.',
      image: '/samples/urban/after.jpg',
      statLabel: 'SURFACE RECTIFICATION',
      statValue: 'WEEKLY AUDIT',
    },
    {
      badge: 'DISASTER RESPONSE',
      title: 'Rapid Damage Assessment',
      description:
        'Quantify flood inundation margins, catastrophic storm surge coastline loss, wildfire burn scar delineation, and critical facility compromise.',
      image: '/samples/flood/after.jpg',
      statLabel: 'FIRST RESPONDER PIPELINE',
      statValue: '<2H TURNAROUND',
    },
  ];

  return (
    <Section
      id="applications"
      number="03"
      category="APPLICATIONS"
      title="Built for observation at scale."
      rightContent="MISSION READY // DUAL-USE GEOSPATIAL"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cases.map((c, idx) => (
          <div
            key={idx}
            className="relative bg-panel border border-line overflow-hidden flex flex-col justify-between group min-h-[380px]"
          >
            {/* Corner Ticks */}
            <span className="absolute -top-[5px] -left-[5px] text-faint font-mono text-[10px] select-none z-20">+</span>
            <span className="absolute -top-[5px] -right-[5px] text-faint font-mono text-[10px] select-none z-20">+</span>

            {/* Photo Backdrop Header with bottom fade */}
            <div className="relative h-44 w-full overflow-hidden border-b border-line bg-bg">
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="w-full h-full object-cover grayscale-[25%] group-hover:scale-105 transition-transform duration-500 photo-scrim-bottom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 bg-bg/90 border border-line px-2 py-0.5 font-mono text-[10px] text-accent font-semibold uppercase tracking-wider">
                {c.badge}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base text-text uppercase tracking-wider mb-2 font-display">
                  {c.title}
                </h3>
                <p className="font-sans text-sm text-muted leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between font-mono text-[10px] md:text-[11px] text-faint tracking-wider">
                <span>{c.statLabel}</span>
                <span className="text-text font-semibold">{c.statValue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default UseCases;

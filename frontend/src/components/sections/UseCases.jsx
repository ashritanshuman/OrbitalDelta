import React from 'react';
import Section from '../layout/Section';

export function UseCases() {
  const cases = [
    {
      badge: 'FORESTS',
      title: 'Forests',
      description: 'Spot cleared or burned forest.',
      image: '/samples/deforestation/after.jpg',
      statLabel: 'EXAMPLE',
      statValue: 'Tree loss',
    },
    {
      badge: 'COASTLINES',
      title: 'Coastlines',
      description: 'See how shorelines move over time.',
      image: '/samples/coastal/after.jpg',
      statLabel: 'EXAMPLE',
      statValue: 'Erosion',
    },
    {
      badge: 'CITIES',
      title: 'Cities',
      description: 'Track new buildings and roads.',
      image: '/samples/urban/after.jpg',
      statLabel: 'EXAMPLE',
      statValue: 'Construction',
    },
    {
      badge: 'DISASTERS',
      title: 'Disasters',
      description: 'Check flood or storm damage.',
      image: '/samples/flood/after.jpg',
      statLabel: 'EXAMPLE',
      statValue: 'Storm damage',
    },
  ];

  return (
    <Section
      id="applications"
      number="03"
      category="USES"
      title="Where this can help"
      rightContent="REAL-WORLD EXAMPLES"
      className="bg-surface"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cases.map((c, idx) => (
          <div
            key={idx}
            className="relative bg-panel border border-line overflow-hidden flex flex-col justify-between group min-h-[23.75rem]"
          >
            {/* Corner Ticks */}
            <span className="absolute -top-[0.3125rem] -left-[0.3125rem] text-faint font-mono text-[0.625rem] select-none z-20">+</span>
            <span className="absolute -top-[0.3125rem] -right-[0.3125rem] text-faint font-mono text-[0.625rem] select-none z-20">+</span>

            {/* Photo Backdrop Header with bottom fade */}
            <div className="relative h-44 w-full overflow-hidden border-b border-line bg-bg">
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="w-full h-full object-cover grayscale-[25%] group-hover:scale-105 transition-transform duration-500 photo-scrim-bottom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 bg-bg/90 border border-line px-2 py-0.5 font-mono text-[0.625rem] text-accent font-semibold uppercase tracking-wider">
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

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between font-mono text-[0.625rem] md:text-[0.6875rem] text-faint tracking-wider">
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

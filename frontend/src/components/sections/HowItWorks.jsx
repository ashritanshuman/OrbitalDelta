import React from 'react';
import Section from '../layout/Section';
import { Layers, ScanLine, FileText } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Upload Imagery',
      icon: Layers,
      description:
        'Ingest multi-spectral or optical raster frames from Copernicus, Landsat, or private commercial constellations across distinct temporal coordinates.',
    },
    {
      num: '02',
      title: 'Detect Change',
      icon: ScanLine,
      description:
        'Orbital Delta aligns pixel geometry, normalizes atmospheric radiance, and isolates localized variance vectors using multi-modal convolutional networks.',
    },
    {
      num: '03',
      title: 'Read the Report',
      icon: FileText,
      description:
        'Receive classified vectors (human-made infrastructure vs natural phenomena) with exact surface area in square kilometers and confidence calibration.',
    },
  ];

  return (
    <Section
      id="method"
      number="01"
      category="METHOD"
      title="Three steps. One report."
      rightContent="PIPELINE LATENCY: DETERMINISTIC <10 SEC"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 border border-line divide-y md:divide-y-0 md:divide-x divide-line bg-panel">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="p-8 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-sm text-accent font-semibold">
                    {step.num}
                  </span>
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    className="text-muted group-hover:text-accent transition-colors duration-150"
                  />
                </div>

                <h3 className="text-base text-text tracking-wider uppercase mb-3 font-display">
                  {step.title}
                </h3>

                <p className="font-sans text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-line/60 font-mono text-[10px] text-faint tracking-widest uppercase">
                STAGE {step.num} // VERIFIED
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export default HowItWorks;

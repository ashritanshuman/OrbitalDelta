import React from 'react';
import Section from '../layout/Section';
import { Layers, ScanLine, FileText } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Add two photos',
      icon: Layers,
      description:
        'Upload a before photo and an after photo of the same place.',
    },
    {
      num: '02',
      title: 'AI finds the changes',
      icon: ScanLine,
      description:
        'We line up the photos and mark every area that looks different.',
    },
    {
      num: '03',
      title: 'Read the results',
      icon: FileText,
      description:
        'See what changed, how sure the AI is, and a short summary you can download.',
    },
  ];

  return (
    <Section
      id="method"
      number="01"
      category="HOW IT WORKS"
      title="Three steps. One report."
      rightContent="RESULTS IN ABOUT 10 SECONDS"
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
                    strokeWidth={1.5}
                    className="w-[1.375rem] h-[1.375rem] text-muted group-hover:text-accent transition-colors duration-150"
                  />
                </div>

                <h3 className="text-base text-text tracking-wider uppercase mb-3 font-display">
                  {step.title}
                </h3>

                <p className="font-sans text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-line/60 font-mono text-[0.625rem] text-faint tracking-widest uppercase">
                STEP {step.num}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export default HowItWorks;

import React from 'react';
import { Database } from 'lucide-react';

export function SampleMenu({
  samples = [],
  activeSampleId,
  onSelectSample,
  className = '',
}) {
  return (
    <div className={`w-full bg-[#07090C] border border-line p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Database size={18} strokeWidth={1.5} className="text-accent flex-shrink-0" />
        <div>
          <div className="font-mono text-xs text-text font-semibold uppercase tracking-wider">
            PRESET BENCHMARK DATASETS
          </div>
          <div className="font-mono text-[10px] text-muted tracking-wide mt-0.5">
            Select an authoritative dual-epoch Earth observation pair:
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {samples.map((sample) => {
          const isActive = sample.id === activeSampleId;
          return (
            <button
              key={sample.id}
              id={`btn-sample-${sample.id}`}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`px-3 py-1.5 font-mono text-[10px] md:text-[11px] tracking-wider uppercase border transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border-accent bg-accent/15 text-text font-semibold'
                  : 'border-line bg-panel text-muted hover:text-text hover:border-faint'
              }`}
            >
              {sample.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SampleMenu;

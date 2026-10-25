import React from 'react';
import { formatPercent, formatConfidence } from '../../utils/format';

export function MetricsRow({ result, className = '' }) {
  if (!result) return null;

  return (
    <div className={`grid grid-cols-3 divide-x divide-line border-b border-line bg-panel ${className}`}>
      <div className="p-3.5 flex flex-col">
        <span className="font-mono text-[0.625rem] text-muted uppercase tracking-wider">
          AREA CHANGED
        </span>
        <span className="font-mono text-lg md:text-xl text-accent font-semibold mt-1">
          {formatPercent(result.changed_area_percent)}
        </span>
      </div>

      <div className="p-3.5 flex flex-col">
        <span className="font-mono text-[0.625rem] text-muted uppercase tracking-wider">
          CHANGES FOUND
        </span>
        <span className="font-mono text-lg md:text-xl text-text font-semibold mt-1">
          {(result.regions && result.regions.length) || 0}
        </span>
      </div>

      <div className="p-3.5 flex flex-col">
        <span className="font-mono text-[0.625rem] text-muted uppercase tracking-wider">
          HOW SURE THE AI IS
        </span>
        <span className="font-mono text-lg md:text-xl text-ok font-semibold mt-1">
          {formatConfidence(result.avg_confidence)}
        </span>
      </div>
    </div>
  );
}

export default MetricsRow;

import React from 'react';
import RegionRow from './RegionRow';

export function RegionList({
  regions = [],
  hoveredRegionId,
  selectedRegionId,
  onHoverRegion,
  onSelectRegion,
  className = '',
}) {
  return (
    <div className={`flex flex-col space-y-2.5 ${className}`}>
      <div className="font-mono text-[0.625rem] text-muted uppercase tracking-wider flex items-center justify-between pb-1 border-b border-line">
        <span className="font-semibold text-text">TARGET REGION AUDIT</span>
        <span className="text-faint">COUNT: {regions.length}</span>
      </div>

      <div className="space-y-2 max-h-[18.75rem] overflow-y-auto pr-1">
        {regions.length === 0 ? (
          <div className="py-6 text-center font-mono text-xs text-muted">
            NO ANOMALIES RECORDED
          </div>
        ) : (
          regions.map((region) => (
            <RegionRow
              key={region.id}
              region={region}
              isHovered={hoveredRegionId === region.id}
              isSelected={selectedRegionId === region.id}
              onMouseEnter={() => onHoverRegion(region.id)}
              onMouseLeave={() => onHoverRegion(null)}
              onClick={() => onSelectRegion(region.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RegionList;

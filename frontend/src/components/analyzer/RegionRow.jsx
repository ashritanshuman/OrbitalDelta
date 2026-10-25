import React from 'react';
import Chip from '../ui/Chip';
import { formatConfidence } from '../../utils/format';

export function RegionRow({
  region,
  isHovered = false,
  isSelected = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  if (!region) return null;

  const isHuman = region.classification === 'human-made';
  const active = isHovered || isSelected;

  return (
    <div
      id={`region-row-${region.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`p-3 bg-[#07090C] border transition-all duration-150 cursor-pointer ${
        active
          ? isHuman
            ? 'border-accent bg-accent/10 shadow-[0_0_0.625rem_rgba(255,90,31,0.2)]'
            : 'border-muted bg-white/5'
          : 'border-line hover:border-line/90'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-xs font-bold ${
              isHuman ? 'text-accent' : 'text-muted'
            }`}
          >
            {region.id}
          </span>
          <Chip classification={region.classification} />
        </div>

        <span className="font-mono text-[0.625rem] text-ok font-semibold">
          {formatConfidence(region.confidence)} CONF
        </span>
      </div>

      {/* Description */}
      <div className="text-xs text-text font-medium mb-1">
        {region.label || region.description}
      </div>

      {region.label && region.description && (
        <p className="font-sans text-[0.6875rem] text-muted mb-1.5 leading-relaxed">
          {region.description}
        </p>
      )}

      {/* Bottom Telemetry Metrics */}
      <div className="font-mono text-[0.5625rem] md:text-[0.625rem] text-muted flex items-center justify-between pt-1 border-t border-line/40">
        <span>EST AREA: {((region.bbox?.w * region.bbox?.h * 32.5) || 2.4).toFixed(2)} KM²</span>
        <span className="text-faint uppercase">
          {isHuman ? 'ANTHROPIC VECTOR' : 'NATURAL SHIFT'}
        </span>
      </div>
    </div>
  );
}

export default RegionRow;

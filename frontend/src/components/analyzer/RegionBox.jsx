import React from 'react';

export function RegionBox({
  region,
  isHovered = false,
  isSelected = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  if (!region || !region.bbox) return null;

  const { x, y, w, h } = region.bbox;

  const left = `${(x * 100).toFixed(2)}%`;
  const top = `${(y * 100).toFixed(2)}%`;
  const width = `${(w * 100).toFixed(2)}%`;
  const height = `${(h * 100).toFixed(2)}%`;

  const isHuman = region.classification === 'human-made';
  const active = isHovered || isSelected;

  return (
    <div
      style={{ left, top, width, height }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`absolute transition-all duration-150 cursor-pointer pointer-events-auto border-2 ${
        active
          ? isHuman
            ? 'border-accent bg-accent/25 shadow-[0_0_12px_rgba(255,90,31,0.4)] z-30'
            : 'border-muted bg-muted/25 shadow-[0_0_12px_rgba(138,146,157,0.4)] z-30'
          : isHuman
          ? 'border-accent/80 bg-accent/10 hover:border-accent hover:bg-accent/20 z-10'
          : 'border-faint bg-white/5 hover:border-muted hover:bg-white/10 z-10'
      }`}
      title={`${region.id}: ${region.label || region.classification}`}
    >
      {/* Corner Tag */}
      <div
        className={`absolute -top-6 left-0 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase select-none whitespace-nowrap ${
          active
            ? isHuman
              ? 'bg-accent text-bg'
              : 'bg-muted text-bg'
            : isHuman
            ? 'bg-accent text-bg'
            : 'bg-[#181C21] text-text border border-line'
        }`}
      >
        [{region.id}: {region.label || region.classification.toUpperCase()}]
      </div>
    </div>
  );
}

export default RegionBox;

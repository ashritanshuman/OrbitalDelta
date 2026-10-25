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
            ? 'border-accent bg-accent/20 shadow-sm z-30'
            : 'border-text bg-surface/50 shadow-sm z-30'
          : isHuman
          ? 'border-accent bg-accent/15 hover:bg-accent/25 z-10'
          : 'border-line bg-[#858982]/15 hover:bg-[#858982]/25 z-10'
      }`}
      title={`${region.id}: ${region.label || region.classification}`}
    >
      {/* Corner Tag */}
      <div
        className={`absolute -top-6 left-0 px-1.5 py-0.5 font-mono text-[0.5625rem] font-bold tracking-wider uppercase select-none whitespace-nowrap shadow-sm ${
          active
            ? isHuman
              ? 'bg-accent text-white'
              : 'bg-text text-bg'
            : isHuman
            ? 'bg-accent text-white'
            : 'bg-panel text-text border border-line'
        }`}
      >
        [{region.id}: {region.label || (isHuman ? 'HUMAN' : 'NATURAL')}]
      </div>
    </div>
  );
}

export default RegionBox;

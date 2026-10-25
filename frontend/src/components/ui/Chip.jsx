import React from 'react';

export function Chip({ classification = 'human-made', label, className = '' }) {
  const isHuman = classification?.toLowerCase() === 'human-made';

  const styles = isHuman
    ? 'border-accent text-accent'
    : 'border-faint text-muted';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 border font-mono text-[9px] md:text-[10px] font-semibold tracking-wider uppercase select-none ${styles} ${className}`}
    >
      {label || (isHuman ? 'HUMAN-MADE' : 'NATURAL')}
    </span>
  );
}

export default Chip;

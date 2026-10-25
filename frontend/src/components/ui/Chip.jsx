import React from 'react';

export function Chip({ classification = 'human-made', label, className = '' }) {
  const isHuman = classification?.toLowerCase() === 'human-made';

  const styles = isHuman
    ? 'border-accent text-accent'
    : 'border-faint text-muted';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 border font-mono text-[0.5625rem] md:text-[0.625rem] font-semibold tracking-wider uppercase select-none ${styles} ${className}`}
    >
      {label || (isHuman ? 'Human activity' : 'Natural')}
    </span>
  );
}

export default Chip;

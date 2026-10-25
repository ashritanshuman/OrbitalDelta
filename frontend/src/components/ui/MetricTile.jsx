import React from 'react';

export function MetricTile({
  value,
  label,
  valueColor = 'text-text',
  className = '',
  size = 'md',
}) {
  const valueSizeClass = {
    sm: 'text-lg',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
  }[size] || 'text-2xl md:text-3xl';

  return (
    <div className={`flex flex-col justify-between ${className}`}>
      <span className={`font-mono font-light tracking-tight ${valueSizeClass} ${valueColor} mb-1.5`}>
        {value}
      </span>
      <span className="font-mono text-[0.625rem] md:text-[0.6875rem] tracking-widest text-muted uppercase">
        {label}
      </span>
    </div>
  );
}

export default MetricTile;

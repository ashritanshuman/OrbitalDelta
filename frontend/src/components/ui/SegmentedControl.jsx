import React from 'react';

export function SegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  size = 'md',
}) {
  return (
    <div className={`inline-flex items-center gap-1 bg-bg p-1 border border-line ${className}`}>
      {options.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-2.5 py-1 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors duration-150 ${
              isActive
                ? 'bg-accent text-white font-bold shadow-sm'
                : 'text-muted hover:text-text bg-transparent'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;

import React from 'react';

export function Panel({
  children,
  className = '',
  cornerTicks = true,
  noPadding = false,
  ...props
}) {
  return (
    <div
      className={`relative bg-panel border border-line ${noPadding ? '' : 'p-6'} ${className}`}
      {...props}
    >
      {cornerTicks && (
        <>
          <span className="absolute -top-[5px] -left-[5px] text-faint font-mono text-[10px] leading-none select-none pointer-events-none z-20">
            +
          </span>
          <span className="absolute -top-[5px] -right-[5px] text-faint font-mono text-[10px] leading-none select-none pointer-events-none z-20">
            +
          </span>
          <span className="absolute -bottom-[5px] -left-[5px] text-faint font-mono text-[10px] leading-none select-none pointer-events-none z-20">
            +
          </span>
          <span className="absolute -bottom-[5px] -right-[5px] text-faint font-mono text-[10px] leading-none select-none pointer-events-none z-20">
            +
          </span>
        </>
      )}
      {children}
    </div>
  );
}

export default Panel;

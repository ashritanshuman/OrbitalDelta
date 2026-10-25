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
          <span className="absolute -top-[0.3125rem] -left-[0.3125rem] text-faint font-mono text-[0.625rem] leading-none select-none pointer-events-none z-20">
            +
          </span>
          <span className="absolute -top-[0.3125rem] -right-[0.3125rem] text-faint font-mono text-[0.625rem] leading-none select-none pointer-events-none z-20">
            +
          </span>
          <span className="absolute -bottom-[0.3125rem] -left-[0.3125rem] text-faint font-mono text-[0.625rem] leading-none select-none pointer-events-none z-20">
            +
          </span>
          <span className="absolute -bottom-[0.3125rem] -right-[0.3125rem] text-faint font-mono text-[0.625rem] leading-none select-none pointer-events-none z-20">
            +
          </span>
        </>
      )}
      {children}
    </div>
  );
}

export default Panel;

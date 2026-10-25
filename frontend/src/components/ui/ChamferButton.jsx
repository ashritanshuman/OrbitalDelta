import React from 'react';

export function ChamferButton({
  children,
  variant = 'primary', // 'primary' | 'ghost'
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-7 py-3 text-sm',
  };

  const baseStyles = 'inline-flex items-center justify-center font-mono font-semibold uppercase tracking-widest transition-all duration-150 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg';

  const variantStyles = {
    primary: disabled
      ? 'bg-panel text-faint border border-line cursor-not-allowed opacity-60'
      : 'bg-accent border border-accent text-white hover:brightness-105 active:opacity-90 shadow-sm',
    secondary: disabled
      ? 'bg-panel text-faint border border-line cursor-not-allowed opacity-60'
      : 'bg-panel text-text border border-line hover:border-accent hover:text-accent active:bg-surface',
    ghost: disabled
      ? 'bg-transparent text-faint border border-transparent cursor-not-allowed'
      : 'bg-transparent text-muted hover:text-text border border-transparent hover:border-line hover:bg-panel',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`chamfer-cut ${baseStyles} ${sizeClasses[size] || sizeClasses.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon strokeWidth={1.5} className="w-4 h-4" />}
        {children}
      </span>
    </button>
  );
}

export default ChamferButton;

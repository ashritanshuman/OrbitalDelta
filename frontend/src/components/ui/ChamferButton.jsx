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

  const baseStyles = 'inline-flex items-center justify-center font-mono font-semibold uppercase tracking-widest transition-all duration-150 select-none cursor-pointer';

  const variantStyles = {
    primary: disabled
      ? 'bg-[#181c21] text-[#5A626D] border border-[#232A33] cursor-not-allowed opacity-60'
      : 'bg-transparent border border-accent text-text hover:bg-accent hover:text-bg active:opacity-90',
    ghost: disabled
      ? 'bg-transparent text-[#5A626D] border border-transparent cursor-not-allowed'
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
        {Icon && <Icon size={16} strokeWidth={1.5} />}
        {children}
      </span>
    </button>
  );
}

export default ChamferButton;

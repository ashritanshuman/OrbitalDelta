import React from 'react';

export function StatusDot({
  status = 'ok', // 'ok' | 'warn' | 'accent'
  pulse = true,
  className = '',
}) {
  const colorMap = {
    ok: 'bg-ok',
    warn: 'bg-warn',
    accent: 'bg-accent',
  };

  const colorClass = colorMap[status] || colorMap.ok;

  return (
    <span className={`relative flex h-2 w-2 ${className}`}>
      {pulse && (
        <span
          className={`animate-ping absolute inline-flex h-full w-full ${colorClass} opacity-75`}
        />
      )}
      <span className={`relative inline-flex h-2 w-2 ${colorClass}`} />
    </span>
  );
}

export default StatusDot;

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import ChamferButton from './ChamferButton';

export function Banner({
  message,
  onRetry,
  type = 'warn', // 'warn' | 'error'
  className = '',
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`w-full p-4 border border-warn/50 bg-[#17120A] text-warn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono ${className}`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} strokeWidth={1.5} className="text-warn flex-shrink-0" />
        <div className="text-xs tracking-wider leading-relaxed">
          <span className="font-bold uppercase mr-2">[PIPELINE EXCEPTION]:</span>
          <span>{message}</span>
        </div>
      </div>

      {onRetry && (
        <ChamferButton
          size="sm"
          variant="primary"
          onClick={onRetry}
          icon={RefreshCw}
          className="self-end sm:self-auto border-warn text-warn hover:bg-warn hover:text-bg"
        >
          RETRY
        </ChamferButton>
      )}
    </div>
  );
}

export default Banner;

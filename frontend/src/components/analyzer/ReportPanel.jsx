import React, { useState } from 'react';
import ChamferButton from '../ui/ChamferButton';
import { generateReport } from '../../utils/pdf';
import { Download, RotateCcw, Loader2 } from 'lucide-react';

export function ReportPanel({
  result,
  beforeUrl,
  afterUrl,
  onReset,
  className = '',
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    if (!result || isExporting) return;
    setIsExporting(true);
    try {
      await generateReport(result, beforeUrl, afterUrl);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`p-4 border-t border-line bg-surface flex flex-col gap-3 ${className}`}>
      {/* Report Paragraphs Summary */}
      {result?.report && result.report.length > 0 && (
        <div className="space-y-1.5 text-muted font-sans text-xs max-h-24 overflow-y-auto pr-1">
          {result.report.map((p, idx) => (
            <p key={idx} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      )}

      {/* Action Suite */}
      <ChamferButton
        id="btn-download-pdf"
        size="md"
        variant="primary"
        onClick={handleDownloadPdf}
        disabled={isExporting}
        icon={isExporting ? Loader2 : Download}
        className="w-full"
      >
        {isExporting ? 'Creating report...' : 'Download report'}
      </ChamferButton>

      <div className="flex items-center justify-between px-1 font-mono text-[0.625rem] text-muted">
        <button
          id="btn-new-analysis"
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-accent hover:underline uppercase cursor-pointer"
        >
          <RotateCcw strokeWidth={2} className="w-[0.6875rem] h-[0.6875rem]" />
          Start over
        </button>

        <span className="text-faint">
          SUMMARY READY
        </span>
      </div>
    </div>
  );
}

export default ReportPanel;

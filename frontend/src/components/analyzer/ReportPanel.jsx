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
    <div className={`p-4 border-t border-line bg-[#0A0E13] flex flex-col gap-3 ${className}`}>
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
        className="w-full bg-[#13181F] border-line hover:border-accent"
      >
        {isExporting ? 'GENERATING DOSSIER...' : 'DOWNLOAD REPORT (PDF)'}
      </ChamferButton>

      <div className="flex items-center justify-between px-1 font-mono text-[10px] text-muted">
        <button
          id="btn-new-analysis"
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-accent hover:underline uppercase cursor-pointer"
        >
          <RotateCcw size={11} strokeWidth={2} />
          NEW ANALYSIS →
        </button>

        <span className="text-faint">
          CHECKSUM: {result?.id?.slice(-8) || '9E14-BF2'}
        </span>
      </div>
    </div>
  );
}

export default ReportPanel;

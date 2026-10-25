import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { formatFileSize } from '../../utils/format';

export function DropZone({
  channelLabel = 'T1 / BEFORE (REFERENCE)',
  channelCode = '[CH-01: REF]',
  file,
  previewUrl,
  error,
  isDragging,
  dragProps,
  onFileSelect,
  onRemove,
  accept = 'image/png,image/jpeg,image/jpg',
  className = '',
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
    // Reset input so selecting the same file again works
    e.target.value = '';
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Header telemetry label */}
      <div className="flex items-center justify-between font-mono text-[0.625rem] uppercase text-muted tracking-wider">
        <div className="flex items-center gap-1.5 font-semibold text-text">
          <span className="text-accent">{channelLabel.split('/')[0]}</span>
          <span>/{channelLabel.split('/')[1] || ''}</span>
        </div>
        <span className="text-faint">{channelCode}</span>
      </div>

      {/* Main dropzone box */}
      <div
        {...dragProps}
        onClick={!previewUrl ? handleClick : undefined}
        className={`group relative border border-dashed transition-all duration-150 bg-[#07090C] rounded-[0.25rem] p-6 flex flex-col items-center justify-center text-center select-none min-h-[16.25rem] ${
          isDragging
            ? 'border-accent bg-accent/5'
            : error
            ? 'border-warn/70'
            : previewUrl
            ? 'border-line'
            : 'border-line hover:border-accent/70 cursor-pointer'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          aria-label={`Upload image for ${channelLabel}`}
        />

        {/* Corner Reticles */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-faint group-hover:border-accent/80 transition-colors pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-faint group-hover:border-accent/80 transition-colors pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-faint group-hover:border-accent/80 transition-colors pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-faint group-hover:border-accent/80 transition-colors pointer-events-none" />

        {/* Empty State */}
        {!previewUrl ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 mb-3 relative flex items-center justify-center border border-line bg-panel group-hover:border-accent/60 transition-colors">
              <Upload strokeWidth={1.5} className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
            </div>

            <span className="font-sans text-xs md:text-sm font-medium text-text group-hover:text-white transition-colors mb-1">
              Drag raster capture or browse
            </span>
            <span className="font-mono text-[0.625rem] text-muted tracking-wider mb-3">
              PNG, JPG up to 10MB
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="px-3 py-1.5 bg-panel hover:bg-panel-light border border-line hover:border-accent font-mono text-[0.625rem] text-accent uppercase tracking-widest transition-colors cursor-pointer"
            >
              [BROWSE FILE]
            </button>
          </div>
        ) : (
          /* Preview State */
          <div className="w-full flex flex-col items-center">
            <div 
              onClick={handleClick}
              title="Click to replace image"
              className="relative w-full h-36 bg-panel border border-line hover:border-accent/80 cursor-pointer transition-colors overflow-hidden mb-3 group/preview"
            >
              <img
                src={previewUrl}
                alt={file ? file.name : channelLabel}
                className="w-full h-full object-cover grayscale-[15%]"
              />
              <div className="absolute top-1.5 left-1.5 bg-[#07090C]/90 px-1.5 py-0.5 border border-line font-mono text-[0.5625rem] text-ok tracking-wider uppercase font-semibold">
                INGESTED
              </div>
              <div className="absolute inset-0 bg-[#07090C]/60 opacity-0 group-hover/preview:opacity-100 flex items-center justify-center transition-opacity">
                <span className="font-mono text-[0.625rem] text-white bg-black/80 px-2 py-1 border border-line">
                  CLICK TO REPLACE
                </span>
              </div>
              {file && (
                <div className="absolute bottom-1.5 right-1.5 bg-[#07090C]/90 px-1.5 py-0.5 font-mono text-[0.5625rem] text-muted">
                  {formatFileSize(file.size)}
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between font-mono text-[0.625rem] text-muted">
              <span className="text-text font-medium truncate max-w-[9.375rem]" title={file ? file.name : 'PRESET_SAMPLE_RASTER.JPG'}>
                {file ? file.name : 'PRESET_SAMPLE_RASTER.JPG'}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className="text-accent hover:underline font-mono text-[0.625rem] uppercase cursor-pointer"
                >
                  CHANGE
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="inline-flex items-center gap-1 text-warn hover:underline font-mono text-[0.625rem] uppercase cursor-pointer"
                >
                  <X strokeWidth={2} className="w-3 h-3" />
                  REMOVE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inline Error Message */}
        {error && (
          <div className="mt-3 px-2 py-1 bg-[#17120A] border border-warn/40 text-warn font-mono text-[0.625rem] tracking-wider uppercase text-left w-full">
            ! {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default DropZone;

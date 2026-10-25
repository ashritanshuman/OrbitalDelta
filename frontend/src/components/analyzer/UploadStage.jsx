import React from 'react';
import DropZone from './DropZone';
import PresetDatasets from './PresetDatasets';
import ChamferButton from '../ui/ChamferButton';
import { Play } from 'lucide-react';

export function UploadStage({
  t1Drop,
  t2Drop,
  presets = [],
  activePresetId = null,
  onSelectPreset,
  presetLoading = false,
  loadingPresetId = null,
  onRunAnalysis,
  canRun = false,
  disabled = false,
}) {
  return (
    <div className="w-full flex flex-col justify-between">
      {/* Telemetry Header Strip */}
      <div className="px-4 py-2 bg-surface border-b border-line flex flex-wrap items-center justify-between gap-y-2 text-muted font-mono text-[0.625rem]">
        <div className="flex items-center gap-3">
          <span className="text-accent font-semibold">STEP:</span>
          <span className="text-text">1 OF 2 // ADD PHOTOS</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-accent">FORMAT:</span>
            <span className="text-text">PNG OR JPG</span>
          </div>
          <span className="text-line">|</span>
          <div className="flex items-center gap-2">
            <span className="text-accent">LIMIT:</span>
            <span className="text-text">10 MB EACH</span>
          </div>
          <span className="text-line hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-2 text-ok">
            <span>● READY</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-8 max-w-[64rem] mx-auto w-full">
        {/* Module Title */}
        <div className="flex flex-col text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
            <span className="w-1.5 h-1.5 bg-accent" />
            <span className="font-mono text-[0.625rem] uppercase tracking-widest text-accent font-semibold">
              STEP 1: ADD YOUR PHOTOS
            </span>
          </div>
          <h3 className="text-lg md:text-xl text-text font-display uppercase tracking-wide">
            Add a before photo and an after photo
          </h3>
          <p className="font-sans text-xs md:text-sm text-muted mt-1">
            Use two satellite photos of the same place, taken at different times. The AI will compare them and mark what changed.
          </p>
        </div>

        {/* Dual Dropzones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DropZone
            channelLabel="BEFORE"
            channelCode=""
            file={t1Drop.file}
            previewUrl={t1Drop.previewUrl}
            error={t1Drop.error}
            isDragging={t1Drop.isDragging}
            dragProps={t1Drop.dragProps}
            onFileSelect={t1Drop.handleFileSelect}
            onRemove={t1Drop.removeFile}
          />

          <DropZone
            channelLabel="AFTER"
            channelCode=""
            file={t2Drop.file}
            previewUrl={t2Drop.previewUrl}
            error={t2Drop.error}
            isDragging={t2Drop.isDragging}
            dragProps={t2Drop.dragProps}
            onFileSelect={t2Drop.handleFileSelect}
            onRemove={t2Drop.removeFile}
          />
        </div>

        {/* Preset Benchmark Dataset Selector */}
        <PresetDatasets
          presets={presets}
          activePresetId={activePresetId}
          onSelectPreset={onSelectPreset}
          presetLoading={presetLoading}
          loadingPresetId={loadingPresetId}
          disabled={disabled}
        />

        {/* Run Analysis Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="font-mono text-[0.625rem] text-faint uppercase tracking-wider text-center sm:text-left">
            STATUS: {canRun ? 'BOTH PHOTOS READY TO COMPARE' : 'WAITING FOR BOTH PHOTOS'}
          </div>

          <ChamferButton
            id="btn-run-analysis"
            size="lg"
            variant="primary"
            disabled={!canRun || disabled || presetLoading}
            onClick={onRunAnalysis}
            icon={Play}
            className="w-full sm:w-auto"
          >
            Find changes
          </ChamferButton>
        </div>
      </div>

      {/* Footer Ingest Note */}
      <div className="font-mono text-[0.625rem] text-faint text-center py-4 border-t border-line bg-surface">
        Your photos stay private in your browser session.
      </div>
    </div>
  );
}

export default UploadStage;

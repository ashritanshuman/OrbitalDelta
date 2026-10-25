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
      <div className="px-4 py-2 bg-[#0A0E13] border-b border-line flex flex-wrap items-center justify-between gap-y-2 text-muted font-mono text-[10px]">
        <div className="flex items-center gap-3">
          <span className="text-accent font-semibold">GRID REF:</span>
          <span className="text-text">LAT 08°45'12.4"S / LON 063°54'02.1"W</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-accent">CRS:</span>
            <span className="text-text">EPSG:4326</span>
          </div>
          <span className="text-line">|</span>
          <div className="flex items-center gap-2">
            <span className="text-accent">GSD:</span>
            <span className="text-text">10M/PX</span>
          </div>
          <span className="text-line hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-2 text-ok">
            <span>● CALIBRATED</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
        {/* Module Title */}
        <div className="flex flex-col text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
            <span className="w-1.5 h-1.5 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold">
              INGESTION MODULE
            </span>
          </div>
          <h3 className="text-lg md:text-xl text-text font-display uppercase tracking-wide">
            Supply dual-epoch rasters
          </h3>
          <p className="font-sans text-xs md:text-sm text-muted mt-1">
            Provide baseline (T1) and comparison (T2) orbital captures for automated geometric alignment, radiometric normalization, and delta discrimination.
          </p>
        </div>

        {/* Dual Dropzones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DropZone
            channelLabel="T1 / BEFORE (REFERENCE)"
            channelCode="[CH-01: REF]"
            file={t1Drop.file}
            previewUrl={t1Drop.previewUrl}
            error={t1Drop.error}
            isDragging={t1Drop.isDragging}
            dragProps={t1Drop.dragProps}
            onFileSelect={t1Drop.handleFileSelect}
            onRemove={t1Drop.removeFile}
          />

          <DropZone
            channelLabel="T2 / AFTER (TARGET)"
            channelCode="[CH-02: EVAL]"
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
          <div className="font-mono text-[10px] text-faint uppercase tracking-wider text-center sm:text-left">
            STATUS: {canRun ? 'DUAL RASTERS READY FOR PROCESSING' : 'AWAITING BOTH EPOCH CAPTURES'}
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
            RUN ANALYSIS
          </ChamferButton>
        </div>
      </div>

      {/* Footer Ingest Note */}
      <div className="font-mono text-[10px] text-faint text-center py-4 border-t border-line bg-[#0A0E13]">
        SECURE ORBITAL INGEST ENCRYPTION: AES-256-GCM // MAX RASTER CAPACITY 10MB
      </div>
    </div>
  );
}

export default UploadStage;

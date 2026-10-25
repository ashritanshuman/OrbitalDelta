import React, { useCallback } from 'react';
import ComparisonViewer from './ComparisonViewer';
import MetricsRow from './MetricsRow';
import RegionList from './RegionList';
import ReportPanel from './ReportPanel';
import PresetDatasets from './PresetDatasets';

export function ResultsStage({
  result,
  beforeUrl,
  afterUrl,
  viewMode,
  setViewMode,
  sliderPosition,
  setSliderPosition,
  overlayOpacity,
  setOverlayOpacity,
  hoveredRegionId,
  setHoveredRegionId,
  selectedRegionId,
  setSelectedRegionId,
  presets = [],
  activePresetId = null,
  onSelectPreset,
  presetLoading = false,
  loadingPresetId = null,
  onReset,
}) {
  const handleSelectRegion = useCallback(
    (id) => {
      setSelectedRegionId((prev) => (prev === id ? null : id));
      const rowEl = document.getElementById(`region-row-${id}`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    [setSelectedRegionId]
  );

  return (
    <div className="w-full flex flex-col">
      {/* Top Controller Header Strip */}
      <div className="w-full border-b border-line bg-surface px-4 py-2 flex flex-wrap items-center justify-between gap-3 font-mono text-[0.625rem]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 uppercase tracking-wider text-text bg-panel border border-accent font-semibold">
            RESULTS
          </span>
          <span className="text-muted hidden sm:inline">
            // COMPARED SATELLITE PHOTOS
          </span>
        </div>

        <div className="text-muted tracking-widest hidden md:block">
          AI CHANGE DETECTION REPORT
        </div>
      </div>

      {/* 65 / 35 Split Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[40rem]">
        {/* Left Column: Interactive Raster Viewer (65% -> col-span-8) */}
        <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-line relative">
          <ComparisonViewer
            beforeUrl={beforeUrl}
            afterUrl={afterUrl}
            overlayUrl={result?.overlay_url}
            regions={result?.regions || []}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sliderPosition={sliderPosition}
            setSliderPosition={setSliderPosition}
            overlayOpacity={overlayOpacity}
            setOverlayOpacity={setOverlayOpacity}
            hoveredRegionId={hoveredRegionId}
            selectedRegionId={selectedRegionId}
            onHoverRegion={setHoveredRegionId}
            onSelectRegion={handleSelectRegion}
          />
        </div>

        {/* Right Column: Inspector & Classification Stream (35% -> col-span-4) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-panel">
          <div>
            <MetricsRow result={result} />
            <div className="p-4">
              <RegionList
                regions={result?.regions || []}
                hoveredRegionId={hoveredRegionId}
                selectedRegionId={selectedRegionId}
                onHoverRegion={setHoveredRegionId}
                onSelectRegion={handleSelectRegion}
              />
            </div>
          </div>

          <ReportPanel
            result={result}
            beforeUrl={beforeUrl}
            afterUrl={afterUrl}
            onReset={onReset}
          />
        </div>
      </div>

      {/* Full-width Benchmark Preset Selector in Results View */}
      {presets && presets.length > 0 && (
        <div className="p-4 bg-surface border-t border-line">
          <PresetDatasets
            presets={presets}
            activePresetId={activePresetId}
            onSelectPreset={onSelectPreset}
            presetLoading={presetLoading}
            loadingPresetId={loadingPresetId}
          />
        </div>
      )}
    </div>
  );
}

export default ResultsStage;

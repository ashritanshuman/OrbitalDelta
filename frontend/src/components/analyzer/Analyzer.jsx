import React, { useEffect } from 'react';
import Panel from '../ui/Panel';
import Banner from '../ui/Banner';
import UploadStage from './UploadStage';
import ProcessingStage from './ProcessingStage';
import ResultsStage from './ResultsStage';
import ChamferButton from '../ui/ChamferButton';
import { Play } from 'lucide-react';

export function Analyzer({ analysisHook }) {
  const {
    state,
    setState,
    result,
    error,
    presets,
    activePresetId,
    presetLoading,
    loadingPresetId,
    presetError,
    loadPreset,
    t1Drop,
    t2Drop,
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
    processingProgress,
    activeStepIndex,
    startAnalysis,
    cancelAnalysis,
    resetAnalysis,
  } = analysisHook;

  // When both dropzones have previews, state is 'ready' (unless currently processing or showing results)
  const hasBothImages = Boolean(t1Drop.previewUrl && t2Drop.previewUrl);

  useEffect(() => {
    if (state === 'idle' && hasBothImages) {
      setState('ready');
    } else if (state === 'ready' && !hasBothImages) {
      setState('idle');
    }
  }, [hasBothImages, state, setState]);

  const handleRun = () => {
    if (!hasBothImages) return;
    startAnalysis(
      t1Drop.file,
      t2Drop.file,
      activePresetId
    );
  };

  const handleReset = () => {
    resetAnalysis();
  };

  return (
    <section id="analyzer" className="w-full py-16 md:py-24 bg-bg border-b border-line">
      <div className="max-w-[76rem] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <span className="font-mono text-[0.6875rem] tracking-widest text-muted uppercase block mb-1">
              02 / TRY IT
            </span>
            <h2 className="text-xl sm:text-2xl text-text font-display uppercase tracking-wide">
              Compare two satellite photos
            </h2>
          </div>

          <div className="flex items-center gap-3 mt-3 sm:mt-0 font-mono text-[0.625rem] text-muted">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-panel border border-line">
              <span className="w-1.5 h-1.5 bg-ok" />
              <span>ONLINE</span>
            </div>
          </div>
        </div>

        {/* Preset Error Banner with Retry */}
        {presetError && (
          <div className="mb-6">
            <Banner
              message={presetError}
              onRetry={() => loadPreset(activePresetId || 'deforestation')}
            />
          </div>
        )}

        {/* Pipeline Error Banner */}
        {state === 'error' && error && !presetError && (
          <div className="mb-6">
            <Banner message={error} onRetry={handleRun} />
          </div>
        )}

        {/* Main Panel with Mechanical Corner Ticks */}
        <Panel noPadding cornerTicks className="overflow-hidden">
          {state === 'processing' ? (
            <ProcessingStage
              progress={processingProgress}
              activeStepIndex={activeStepIndex}
              onCancel={cancelAnalysis}
            />
          ) : state === 'results' && result ? (
            <ResultsStage
              result={result}
              beforeUrl={t1Drop.previewUrl}
              afterUrl={t2Drop.previewUrl}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sliderPosition={sliderPosition}
              setSliderPosition={setSliderPosition}
              overlayOpacity={overlayOpacity}
              setOverlayOpacity={setOverlayOpacity}
              hoveredRegionId={hoveredRegionId}
              setHoveredRegionId={setHoveredRegionId}
              selectedRegionId={selectedRegionId}
              setSelectedRegionId={setSelectedRegionId}
              presets={presets}
              activePresetId={activePresetId}
              onSelectPreset={loadPreset}
              presetLoading={presetLoading}
              loadingPresetId={loadingPresetId}
              onReset={handleReset}
            />
          ) : (
            <UploadStage
              t1Drop={t1Drop}
              t2Drop={t2Drop}
              presets={presets}
              activePresetId={activePresetId}
              onSelectPreset={loadPreset}
              presetLoading={presetLoading}
              loadingPresetId={loadingPresetId}
              onRunAnalysis={handleRun}
              canRun={hasBothImages}
              disabled={state === 'processing'}
            />
          )}
        </Panel>
      </div>

      {/* Sticky Bottom Action Bar for Mobile Screens */}
      {state !== 'processing' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F4F3EE]/95 border-t border-line p-3 flex items-center justify-between backdrop-blur-md">
          <div className="font-mono text-[0.625rem] text-muted">
            {state === 'results' ? (
              <span className="text-ok font-semibold">DONE</span>
            ) : hasBothImages ? (
              <span className="text-text">READY</span>
            ) : (
              <span>ADD BOTH PHOTOS</span>
            )}
          </div>

          {state === 'results' ? (
            <ChamferButton
              size="sm"
              variant="secondary"
              onClick={handleReset}
            >
              Start over
            </ChamferButton>
          ) : (
            <ChamferButton
              size="sm"
              variant="primary"
              disabled={!hasBothImages || presetLoading}
              onClick={handleRun}
              icon={Play}
            >
              Find changes
            </ChamferButton>
          )}
        </div>
      )}
    </section>
  );
}

export default Analyzer;

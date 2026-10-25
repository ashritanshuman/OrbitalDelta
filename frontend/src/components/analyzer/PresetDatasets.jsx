import React from 'react';
import { Database, Loader2 } from 'lucide-react';

const PRESET_DISPLAY_NAMES = {
  deforestation: 'Forest cleared',
  urban: 'New buildings',
  coastal: 'Coastline change',
  flood: 'Flooding',
};

export function PresetDatasets({
  presets = [],
  activePresetId = null,
  onSelectPreset,
  disabled = false,
  presetLoading = false,
  loadingPresetId = null,
  className = '',
}) {
  return (
    <div
      className={`w-full bg-surface border border-line p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Database strokeWidth={1.5} className="w-[1.125rem] h-[1.125rem] text-accent flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text font-semibold uppercase tracking-wider">
              NO PHOTOS? TRY AN EXAMPLE
            </span>
            {presetLoading && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-softAccent border border-accent/40 font-mono text-[0.5625rem] text-accent tracking-widest uppercase animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                LOADING
              </span>
            )}
          </div>
          <div className="font-mono text-[0.625rem] text-muted tracking-wide mt-0.5">
            Pick one to load example photos instantly:
          </div>
        </div>
      </div>

      {/* Preset buttons with keyboard accessibility, aria-pressed, and responsive wrapping */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {presets.map((preset) => {
          const isActive = preset.id === activePresetId;
          const isLoadingThis = presetLoading && loadingPresetId === preset.id;
          const label = PRESET_DISPLAY_NAMES[preset.id] || preset.label || preset.name;

          return (
            <button
              key={preset.id}
              id={`btn-preset-${preset.id}`}
              type="button"
              role="button"
              aria-pressed={isActive}
              disabled={disabled || presetLoading}
              onClick={() => onSelectPreset(preset.id)}
              className={`px-3 py-1.5 font-mono text-[0.625rem] md:text-[0.6875rem] tracking-wider uppercase border transition-all duration-150 rounded-[0.125rem] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                disabled || presetLoading
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer'
              } ${
                isActive
                  ? 'border-accent bg-softAccent text-accent font-semibold shadow-sm'
                  : 'border-line bg-panel text-muted hover:text-text hover:border-accent'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isLoadingThis && <Loader2 className="w-[0.6875rem] h-[0.6875rem] animate-spin text-accent" />}
                <span>{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PresetDatasets;

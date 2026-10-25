import React from 'react';
import { Database, Loader2 } from 'lucide-react';

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
      className={`w-full bg-[#07090C] border border-line p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Database size={18} strokeWidth={1.5} className="text-accent flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text font-semibold uppercase tracking-wider">
              PRESET BENCHMARK DATASETS
            </span>
            {presetLoading && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-accent/15 border border-accent/40 font-mono text-[9px] text-accent tracking-widest uppercase animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                LOADING PAIR
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] text-muted tracking-wide mt-0.5">
            Authoritative dual-epoch satellite pairs loaded from local manifest:
          </div>
        </div>
      </div>

      {/* Preset buttons with keyboard accessibility, aria-pressed, and responsive wrapping */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {presets.map((preset) => {
          const isActive = preset.id === activePresetId;
          const isLoadingThis = presetLoading && loadingPresetId === preset.id;

          return (
            <button
              key={preset.id}
              id={`btn-preset-${preset.id}`}
              type="button"
              role="button"
              aria-pressed={isActive}
              disabled={disabled || presetLoading}
              onClick={() => onSelectPreset(preset.id)}
              className={`px-3 py-1.5 font-mono text-[10px] md:text-[11px] tracking-wider uppercase border transition-all duration-150 rounded-[2px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                disabled || presetLoading
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer'
              } ${
                isActive
                  ? 'border-accent bg-accent/20 text-text font-semibold shadow-[0_0_10px_rgba(255,90,31,0.2)]'
                  : 'border-line bg-panel text-muted hover:text-text hover:border-faint'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {isLoadingThis && <Loader2 size={11} className="animate-spin text-accent" />}
                <span>{preset.label || preset.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PresetDatasets;

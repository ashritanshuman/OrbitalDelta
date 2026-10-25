import React, { useRef, useEffect, useCallback } from 'react';
import SegmentedControl from '../ui/SegmentedControl';
import RegionBox from './RegionBox';

export function ComparisonViewer({
  beforeUrl,
  afterUrl,
  overlayUrl,
  regions = [],
  viewMode = 'slider',
  setViewMode,
  sliderPosition = 52,
  setSliderPosition,
  overlayOpacity = 0.65,
  setOverlayOpacity,
  hoveredRegionId,
  selectedRegionId,
  onHoverRegion,
  onSelectRegion,
}) {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const rafIdRef = useRef(null);

  const viewOptions = [
    { id: 'slider', label: 'SLIDER' },
    { id: 'side', label: 'SIDE BY SIDE' },
    { id: 'overlay', label: 'OVERLAY' },
  ];

  // Draggable slider with RequestAnimationFrame
  const updateSliderFromClientX = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const rawPct = ((clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(5, Math.min(95, rawPct));

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        setSliderPosition(clamped);
      });
    },
    [setSliderPosition]
  );

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    updateSliderFromClientX(e.clientX);
  };

  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    if (e.touches[0]) updateSliderFromClientX(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      updateSliderFromClientX(e.clientX);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || !e.touches[0]) return;
      updateSliderFromClientX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [updateSliderFromClientX]);

  // Keyboard accessibility on slider container
  const handleKeyDown = (e) => {
    if (viewMode !== 'slider') return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(5, prev - 4));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(95, prev + 4));
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg select-none">
      {/* Top Ribbon */}
      <div className="px-4 py-2 bg-panel border-b border-line flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          options={viewOptions}
          value={viewMode}
          onChange={setViewMode}
        />

        {viewMode === 'overlay' && (
          <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
            <span>OPACITY:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-24 accent-accent cursor-pointer"
              aria-label="Change detection mask opacity"
            />
            <span className="text-text font-bold">{Math.round(overlayOpacity * 100)}%</span>
          </div>
        )}

        <div className="flex items-center gap-3 font-mono text-[10px] text-muted">
          <span className="hidden sm:inline">PROJECTION: UTM ZONE 21S</span>
          <span className="text-ok font-medium">● SYNCED</span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 min-h-[460px] bg-[#07090C] overflow-hidden flex items-center justify-center">
        {viewMode === 'side' ? (
          /* Side by side mode */
          <div className="w-full h-full grid grid-cols-2 divide-x divide-line relative">
            {/* T1 Left */}
            <div className="relative w-full h-full overflow-hidden bg-bg">
              <img
                src={beforeUrl}
                alt="T1 Baseline Reference"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-bg/90 border border-line px-2 py-0.5 font-mono text-[10px] text-text font-semibold">
                T1: REFERENCE [BASELINE]
              </div>
            </div>

            {/* T2 Right */}
            <div className="relative w-full h-full overflow-hidden bg-bg">
              <img
                src={afterUrl}
                alt="T2 Target Evaluated"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-bg/90 border border-line px-2 py-0.5 font-mono text-[10px] text-accent font-semibold">
                T2: ACQUIRED [TARGET]
              </div>

              {/* Region boxes on T2 */}
              {regions.map((r) => (
                <RegionBox
                  key={r.id}
                  region={r}
                  isHovered={hoveredRegionId === r.id}
                  isSelected={selectedRegionId === r.id}
                  onMouseEnter={() => onHoverRegion(r.id)}
                  onMouseLeave={() => onHoverRegion(null)}
                  onClick={() => onSelectRegion(r.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Slider or Overlay mode */
          <div
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseDown={viewMode === 'slider' ? handleMouseDown : undefined}
            onTouchStart={viewMode === 'slider' ? handleTouchStart : undefined}
            className={`relative w-full h-full overflow-hidden outline-none ${
              viewMode === 'slider' ? 'cursor-ew-resize' : 'cursor-default'
            }`}
            aria-label="Dual-epoch raster comparison viewer. Use left and right arrow keys to move slider."
          >
            {/* Base layer: T2 After Image */}
            <img
              src={afterUrl}
              alt="T2 Target Evaluated"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Slider Clip Layer: T1 Before Image */}
            {viewMode === 'slider' && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                }}
              >
                <img
                  src={beforeUrl}
                  alt="T1 Baseline Reference"
                  className="absolute inset-0 w-full h-full object-cover select-none max-w-none"
                />
              </div>
            )}

            {/* Overlay Mask Layer */}
            {viewMode === 'overlay' && overlayUrl && (
              <img
                src={overlayUrl}
                alt="Change Detection Mask Overlay"
                style={{ opacity: overlayOpacity }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-100"
              />
            )}

            {/* Draggable Divider Handle Line */}
            {viewMode === 'slider' && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{
                  left: `${sliderPosition}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="w-[2px] h-full bg-text shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-panel border border-accent flex items-center justify-center pointer-events-auto cursor-ew-resize shadow-md"
                  aria-hidden="true"
                >
                  <div className="flex items-center gap-0.5 text-accent font-bold text-[10px]">
                    <span>◀</span>
                    <span>▶</span>
                  </div>
                </div>
              </div>
            )}

            {/* Region Boxes (drawn on top of the image) */}
            {regions.map((r) => (
              <RegionBox
                key={r.id}
                region={r}
                isHovered={hoveredRegionId === r.id}
                isSelected={selectedRegionId === r.id}
                onMouseEnter={() => onHoverRegion(r.id)}
                onMouseLeave={() => onHoverRegion(null)}
                onClick={() => onSelectRegion(r.id)}
              />
            ))}

            {/* Epoch Badges in Canvas Corners */}
            <div className="absolute top-3 left-3 bg-bg/90 border border-line px-2 py-1 font-mono text-[10px] text-text pointer-events-none z-20">
              T1: REFERENCE [2024-03-12]
            </div>
            <div className="absolute top-3 right-3 bg-bg/90 border border-line px-2 py-1 font-mono text-[10px] text-accent pointer-events-none z-20">
              T2: ACQUIRED [2025-03-10]
            </div>
          </div>
        )}
      </div>

      {/* Viewer Footer Telemetry Bar */}
      <div className="px-4 py-2.5 bg-panel border-t border-line flex flex-wrap items-center justify-between gap-3 text-muted font-mono text-[10px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1 border-b-2 border-x border-text" />
            <span>1 KM</span>
          </div>
          <span className="hidden sm:inline">DIM: 1024 × 768 PX</span>
        </div>

        <div className="flex items-center gap-2 text-accent font-semibold">
          <span className="w-1.5 h-1.5 bg-accent" />
          <span>{regions.length} REGIONS DETECTED</span>
        </div>
      </div>
    </div>
  );
}

export default ComparisonViewer;

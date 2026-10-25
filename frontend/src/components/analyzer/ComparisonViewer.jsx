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
    { id: 'slider', label: 'Slide' },
    { id: 'side', label: 'Side by side' },
    { id: 'overlay', label: 'Highlights' },
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
          <div className="flex items-center gap-2 font-mono text-[0.625rem] text-muted">
            <span>HIGHLIGHT STRENGTH:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-24 accent-accent cursor-pointer"
              aria-label="Change highlight strength"
            />
            <span className="text-text font-bold">{Math.round(overlayOpacity * 100)}%</span>
          </div>
        )}

        <div className="flex items-center gap-3 font-mono text-[0.625rem] text-muted">
          <span className="hidden sm:inline">PHOTOS ALIGNED</span>
          <span className="text-ok font-medium">● READY</span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 min-h-[28.75rem] bg-[#07090C] overflow-hidden flex items-center justify-center">
        {viewMode === 'side' ? (
          /* Side by side mode */
          <div className="w-full h-full grid grid-cols-2 divide-x divide-line relative">
            {/* T1 Left */}
            <div className="relative w-full h-full overflow-hidden bg-bg">
              <img
                src={beforeUrl}
                alt="Before photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-bg/90 border border-line px-2 py-0.5 font-mono text-[0.625rem] text-text font-semibold">
                BEFORE
              </div>
            </div>

            {/* T2 Right */}
            <div className="relative w-full h-full overflow-hidden bg-bg">
              <img
                src={afterUrl}
                alt="After photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-bg/90 border border-line px-2 py-0.5 font-mono text-[0.625rem] text-accent font-semibold">
                AFTER
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
            aria-label="Comparison viewer. Use left and right arrow keys to move slider."
          >
            {/* Base layer: T2 After Image */}
            <img
              src={afterUrl}
              alt="After photo"
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
                  alt="Before photo"
                  className="absolute inset-0 w-full h-full object-cover select-none max-w-none"
                />
              </div>
            )}

            {/* Overlay Mask Layer */}
            {viewMode === 'overlay' && overlayUrl && (
              <img
                src={overlayUrl}
                alt="Change highlights"
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
                <div className="w-[0.125rem] h-full bg-text shadow-[0_0_0.5rem_rgba(0,0,0,0.8)]" />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-panel border border-accent flex items-center justify-center pointer-events-auto cursor-ew-resize shadow-md"
                  aria-hidden="true"
                >
                  <div className="flex items-center gap-0.5 text-accent font-bold text-[0.625rem]">
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

            {/* Badges in Canvas Corners */}
            <div className="absolute top-3 left-3 bg-bg/90 border border-line px-2 py-1 font-mono text-[0.625rem] text-text pointer-events-none z-20">
              BEFORE
            </div>
            <div className="absolute top-3 right-3 bg-bg/90 border border-line px-2 py-1 font-mono text-[0.625rem] text-accent pointer-events-none z-20">
              AFTER
            </div>
          </div>
        )}
      </div>

      {/* Viewer Footer Telemetry Bar */}
      <div className="px-4 py-2.5 bg-panel border-t border-line flex flex-wrap items-center justify-between gap-3 text-muted font-mono text-[0.625rem]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1 border-b-2 border-x border-text" />
            <span>1 KM SCALE</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-accent font-semibold">
          <span className="w-1.5 h-1.5 bg-accent" />
          <span>{regions.length} CHANGES FOUND</span>
        </div>
      </div>
    </div>
  );
}

export default ComparisonViewer;

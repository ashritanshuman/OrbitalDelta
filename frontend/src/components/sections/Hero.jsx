import React from 'react';
import ChamferButton from '../ui/ChamferButton';

export function Hero({ onLoadSampleAndScroll }) {
  const scrollToAnalyzer = (e) => {
    e.preventDefault();
    const el = document.getElementById('analyzer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full border-b border-line overflow-hidden min-h-[640px] md:min-h-[720px] flex flex-col justify-between pt-20">
      {/* Background Satellite Photography with Scrim */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Earth curved horizon from orbit"
          className="w-full h-full object-cover object-top opacity-50 brightness-90 photo-scrim-bottom"
          onError={(e) => {
            // Dark gradient fallback if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,transparent_0%,#07090C_85%)]" />
      </div>

      {/* Architectural Ghost Wordmark Layer */}
      <div className="absolute inset-0 z-0 flex items-center justify-end select-none pointer-events-none pr-6 md:pr-12 overflow-hidden">
        <span
          className="text-[140px] sm:text-[200px] lg:text-[260px] font-bold text-white opacity-[0.03] tracking-[0.18em] leading-none translate-y-12 select-none"
          style={{ fontFamily: 'Michroma, sans-serif' }}
        >
          DELTA
        </span>
      </div>

      {/* Hero Content Body */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 pt-12 md:pt-20 pb-12 flex flex-col justify-between flex-1">
        <div className="max-w-3xl flex flex-col">
          {/* Telemetry Sensor Tag */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 bg-accent" />
            <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-accent font-semibold">
              SPECTRAL SENSOR SUITE // ACTIVE DISCRIMINATION
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl text-text tracking-tight leading-[1.12] mb-6 font-display"
          >
            See what <span className="text-accent">changed</span> <br />
            on Earth.
          </h1>

          {/* Technical Subtext */}
          <p className="font-sans text-base sm:text-lg text-muted max-w-xl font-normal leading-relaxed mb-8">
            AI-powered change detection for high-cadence satellite imagery. Compare dual-epoch temporal rasters to isolate localized structural variances and biosphere shifts.
          </p>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-4">
            <ChamferButton
              size="lg"
              variant="primary"
              onClick={scrollToAnalyzer}
            >
              LAUNCH ANALYZER
            </ChamferButton>

            <button
              type="button"
              onClick={() => {
                if (onLoadSampleAndScroll) {
                  onLoadSampleAndScroll('forest');
                } else {
                  const el = document.getElementById('analyzer');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-text px-4 py-3 transition-colors cursor-pointer"
            >
              <span>VIEW SAMPLE DATASET</span>
              <span className="text-accent">→</span>
            </button>
          </div>
        </div>

        {/* Telemetry Footer Box */}
        <div className="mt-16 w-full flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
          <div className="flex items-center gap-3 font-mono text-[10px] md:text-[11px] text-faint tracking-widest uppercase">
            <span className="inline-block w-2 h-2 border border-ok" />
            <span>ORBITAL RECEPTOR 09 // READY FOR STREAM</span>
          </div>

          {/* Corner Ticked Metric Box */}
          <div className="relative bg-panel/90 border border-line px-4 py-2.5 flex items-center">
            <span className="absolute -top-[5px] -left-[5px] text-faint font-mono text-[10px] leading-none select-none">+</span>
            <span className="absolute -top-[5px] -right-[5px] text-faint font-mono text-[10px] leading-none select-none">+</span>
            <span className="absolute -bottom-[5px] -left-[5px] text-faint font-mono text-[10px] leading-none select-none">+</span>
            <span className="absolute -bottom-[5px] -right-[5px] text-faint font-mono text-[10px] leading-none select-none">+</span>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] md:text-[11px] text-text tracking-widest">
              <div><span className="text-muted">ORBIT:</span> 550 KM</div>
              <div className="hidden sm:inline text-line">/</div>
              <div><span className="text-muted">REVISIT:</span> 24 H</div>
              <div className="hidden sm:inline text-line">/</div>
              <div><span className="text-muted">RESOLUTION:</span> 10 M</div>
              <div className="hidden sm:inline text-line">/</div>
              <div><span className="text-muted">SENSOR:</span> MSI-OPTICAL</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

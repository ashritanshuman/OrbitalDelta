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
    <section className="relative w-full border-b border-line overflow-hidden min-h-[40rem] md:min-h-[45rem] flex flex-col justify-between pt-20">
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
          className="text-[8.75rem] sm:text-[12.5rem] lg:text-[16.25rem] font-bold text-white opacity-[0.03] tracking-[0.18em] leading-none translate-y-12 select-none"
          style={{ fontFamily: 'Michroma, sans-serif' }}
        >
          DELTA
        </span>
      </div>

      {/* Hero Content Body */}
      <div className="relative z-10 max-w-[76rem] mx-auto w-full px-4 md:px-8 pt-12 md:pt-20 pb-12 flex flex-col justify-between flex-1">
        <div className="max-w-3xl flex flex-col">
          {/* Telemetry Sensor Tag */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 bg-accent" />
            <span className="font-mono text-[0.625rem] md:text-[0.6875rem] uppercase tracking-widest text-accent font-semibold">
              SATELLITE CHANGE FINDER
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
            Upload two satellite photos of the same place, taken at different times. Our AI finds what changed and explains it in simple words.
          </p>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-4">
            <ChamferButton
              size="lg"
              variant="primary"
              onClick={scrollToAnalyzer}
            >
              Start
            </ChamferButton>

            <button
              type="button"
              onClick={() => {
                if (onLoadSampleAndScroll) {
                  onLoadSampleAndScroll('deforestation');
                } else {
                  const el = document.getElementById('analyzer');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted hover:text-text px-4 py-3 transition-colors cursor-pointer"
            >
              <span>See an example</span>
              <span className="text-accent">→</span>
            </button>
          </div>
        </div>

        {/* Telemetry Footer Box */}
        <div className="mt-16 w-full flex flex-col lg:flex-row items-start lg:items-end justify-end gap-4">
          {/* Corner Ticked Metric Box */}
          <div className="relative bg-panel/90 border border-line px-4 py-2.5 flex items-center">
            <span className="absolute -top-[0.3125rem] -left-[0.3125rem] text-faint font-mono text-[0.625rem] leading-none select-none">+</span>
            <span className="absolute -top-[0.3125rem] -right-[0.3125rem] text-faint font-mono text-[0.625rem] leading-none select-none">+</span>
            <span className="absolute -bottom-[0.3125rem] -left-[0.3125rem] text-faint font-mono text-[0.625rem] leading-none select-none">+</span>
            <span className="absolute -bottom-[0.3125rem] -right-[0.3125rem] text-faint font-mono text-[0.625rem] leading-none select-none">+</span>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.625rem] md:text-[0.6875rem] text-text tracking-widest">
              <div>Works with any satellite photo</div>
              <div className="hidden sm:inline text-line">/</div>
              <div>No special hardware</div>
              <div className="hidden sm:inline text-line">/</div>
              <div>Results in about 10 seconds</div>
              <div className="hidden sm:inline text-line">/</div>
              <div>Report you can download</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

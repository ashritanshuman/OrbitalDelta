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
    <section className="relative w-full border-b border-[#232A33] bg-[#07090C] text-[#ECEEF1] overflow-hidden min-h-[40rem] md:min-h-[45rem] flex flex-col justify-between pt-20">
      {/* Background Satellite Photography with Scrim */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <img
          src="/earth-sunrise.png"
          alt="Earth sunrise horizon with city lights"
          className="w-full h-full object-cover object-center opacity-85"
          onError={(e) => {
            // Dark gradient fallback if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Soft vignette scrim to ensure headline readability while keeping city lights & sunrise vivid */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090C] via-[#07090C]/50 to-[#07090C]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090C]/90 via-[#07090C]/60 to-transparent" />
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
            className="text-3xl sm:text-5xl lg:text-6xl text-[#ECEEF1] tracking-tight leading-[1.12] mb-6 font-display"
          >
            See what <span className="text-accent">changed</span> <br />
            on Earth.
          </h1>

          {/* Technical Subtext */}
          <p className="font-sans text-base sm:text-lg text-[#8A929D] max-w-xl font-normal leading-relaxed mb-8">
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
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#8A929D] hover:text-[#ECEEF1] px-4 py-3 transition-colors cursor-pointer"
            >
              <span>See an example</span>
              <span className="text-accent">→</span>
            </button>
          </div>
        </div>

        {/* Telemetry Footer Box */}
        <div className="mt-16 w-full flex flex-col lg:flex-row items-start lg:items-end justify-end gap-4">
          {/* Corner Ticked Metric Box */}
          <div className="relative bg-[#0E1217]/90 border border-[#232A33] px-4 py-2.5 flex items-center">
            <span className="absolute -top-[0.3125rem] -left-[0.3125rem] text-[#5A626D] font-mono text-[0.625rem] leading-none select-none">+</span>
            <span className="absolute -top-[0.3125rem] -right-[0.3125rem] text-[#5A626D] font-mono text-[0.625rem] leading-none select-none">+</span>
            <span className="absolute -bottom-[0.3125rem] -left-[0.3125rem] text-[#5A626D] font-mono text-[0.625rem] leading-none select-none">+</span>
            <span className="absolute -bottom-[0.3125rem] -right-[0.3125rem] text-[#5A626D] font-mono text-[0.625rem] leading-none select-none">+</span>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.625rem] md:text-[0.6875rem] text-[#ECEEF1] tracking-widest">
              <div>Works with any satellite photo</div>
              <div className="hidden sm:inline text-[#232A33]">/</div>
              <div>No special hardware</div>
              <div className="hidden sm:inline text-[#232A33]">/</div>
              <div>Results in about 10 seconds</div>
              <div className="hidden sm:inline text-[#232A33]">/</div>
              <div>Report you can download</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

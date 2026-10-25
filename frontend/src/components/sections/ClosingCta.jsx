import React from 'react';
import ChamferButton from '../ui/ChamferButton';

export function ClosingCta() {
  const scrollToAnalyzer = () => {
    const el = document.getElementById('analyzer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full border-b border-line bg-bg overflow-hidden py-24 sm:py-32 flex items-center justify-center">
      {/* Night Earth Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/cta-night.jpg"
          alt="Night Earth city lights from space"
          loading="lazy"
          className="w-full h-full object-cover opacity-25 mix-blend-multiply photo-scrim-bottom"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />
        <div className="absolute inset-0 bg-[#F4F3EE]/75" />
      </div>

      {/* Centered CTA Architecture Container */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
        <div className="font-mono text-[0.625rem] md:text-[0.6875rem] uppercase tracking-widest text-accent mb-4 font-semibold">
          TEST IT YOURSELF
        </div>

        <h2 className="text-2xl sm:text-4xl text-text tracking-wide uppercase mb-8 leading-tight font-display">
          Try it with your own photos.
        </h2>

        <ChamferButton
          size="lg"
          variant="primary"
          onClick={scrollToAnalyzer}
          className="mb-8"
        >
          Start
        </ChamferButton>

        <div className="font-mono text-[0.625rem] md:text-[0.6875rem] text-muted tracking-widest uppercase">
          FREE TO TEST IN YOUR BROWSER
        </div>
      </div>
    </section>
  );
}

export default ClosingCta;

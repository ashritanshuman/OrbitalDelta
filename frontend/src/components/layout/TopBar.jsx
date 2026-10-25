import React, { useState, useEffect } from 'react';
import StatusDot from '../ui/StatusDot';
import ChamferButton from '../ui/ChamferButton';

export function TopBar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#F4F3EE]/95 backdrop-blur-md border-b border-line shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[76rem] mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <span className="text-accent text-sm font-bold select-none">▲</span>
          <a
            href="#"
            className={`font-display text-xs md:text-sm font-semibold tracking-wider uppercase select-none hover:text-accent transition-colors ${
              isScrolled ? 'text-text' : 'text-white'
            }`}
          >
            ORBITAL DELTA
          </a>
        </div>

        {/* Anchor Nav Links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[0.6875rem] tracking-widest uppercase">
          <a
            href="#analyzer"
            onClick={scrollTo('analyzer')}
            className={`py-1 border-b border-transparent hover:border-accent transition-colors ${
              isScrolled ? 'text-muted hover:text-text' : 'text-[#8A929D] hover:text-white'
            }`}
          >
            Try it
          </a>
          <a
            href="#method"
            onClick={scrollTo('method')}
            className={`py-1 border-b border-transparent hover:border-accent transition-colors ${
              isScrolled ? 'text-muted hover:text-text' : 'text-[#8A929D] hover:text-white'
            }`}
          >
            How it works
          </a>
          <a
            href="#applications"
            onClick={scrollTo('applications')}
            className={`py-1 border-b border-transparent hover:border-accent transition-colors ${
              isScrolled ? 'text-muted hover:text-text' : 'text-[#8A929D] hover:text-white'
            }`}
          >
            Uses
          </a>
        </nav>

        {/* Telemetry Status & CTA */}
        <div className="flex items-center gap-4">
          <div
            className={`hidden lg:flex items-center gap-2 px-3 py-1 font-mono text-[0.625rem] tracking-widest uppercase ${
              isScrolled
                ? 'bg-panel border border-line text-muted'
                : 'bg-[#0E1217] border border-[#232A33] text-[#8A929D]'
            }`}
          >
            <StatusDot status="ok" pulse />
            <span>Ready</span>
          </div>

          <ChamferButton
            size="sm"
            variant="primary"
            onClick={scrollTo('analyzer')}
          >
            Start
          </ChamferButton>
        </div>
      </div>
    </header>
  );
}

export default TopBar;

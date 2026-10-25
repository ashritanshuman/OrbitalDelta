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
          ? 'bg-[#07090C]/90 backdrop-blur-md border-b border-line shadow-none'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <span className="text-accent text-sm font-bold select-none">▲</span>
          <a
            href="#"
            className="text-text font-display text-xs md:text-sm font-semibold tracking-wider uppercase select-none hover:text-white transition-colors"
          >
            ORBITAL DELTA
          </a>
          <span className="font-mono text-[10px] text-muted px-1.5 py-0.5 bg-panel border border-line hidden sm:inline-block tracking-wider">
            ORB-SYS 4.2
          </span>
        </div>

        {/* Anchor Nav Links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-widest uppercase">
          <a
            href="#analyzer"
            onClick={scrollTo('analyzer')}
            className="text-muted hover:text-text transition-colors py-1 border-b border-transparent hover:border-accent"
          >
            ANALYZER
          </a>
          <a
            href="#method"
            onClick={scrollTo('method')}
            className="text-muted hover:text-text transition-colors py-1 border-b border-transparent hover:border-text"
          >
            METHOD
          </a>
          <a
            href="#applications"
            onClick={scrollTo('applications')}
            className="text-muted hover:text-text transition-colors py-1 border-b border-transparent hover:border-text"
          >
            APPLICATIONS
          </a>
        </nav>

        {/* Telemetry Status & CTA */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-panel border border-line font-mono text-[10px] text-muted tracking-widest uppercase">
            <StatusDot status="ok" pulse />
            <span>SYSTEM NOMINAL</span>
          </div>

          <ChamferButton
            size="sm"
            variant="primary"
            onClick={scrollTo('analyzer')}
            className="border-accent hover:bg-accent"
          >
            LAUNCH ANALYZER
          </ChamferButton>
        </div>
      </div>
    </header>
  );
}

export default TopBar;

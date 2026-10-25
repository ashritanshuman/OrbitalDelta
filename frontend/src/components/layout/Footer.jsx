import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-[#07090C] border-t border-line">
      <div className="max-w-[76rem] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[0.625rem] md:text-[0.6875rem] text-muted tracking-wider">
        <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
          <span className="font-display text-text text-xs uppercase tracking-wider">
            ORBITAL DELTA
          </span>
          <span className="text-line hidden sm:inline">/</span>
          <span>A hackathon prototype. AI results should be checked by a person.</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a href="#analyzer" className="hover:text-text transition-colors">
            Try it
          </a>
          <a href="#method" className="hover:text-text transition-colors">
            How it works
          </a>
          <a href="#applications" className="hover:text-text transition-colors">
            Uses
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

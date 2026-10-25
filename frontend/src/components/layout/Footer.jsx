import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-[#07090C] border-t border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px] md:text-[11px] text-muted tracking-wider">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-display text-text text-xs uppercase tracking-wider">
            ORBITAL DELTA
          </span>
          <span className="text-line hidden sm:inline">/</span>
          <span>LAT 28.5729° N / LON 80.6490° W [KSC]</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <span className="text-faint uppercase">
            ORBITAL TRACKING: SECURE-09
          </span>
          <span>
            © 2026 ORBITAL DELTA. HACKATHON MISSION PROTOTYPE.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

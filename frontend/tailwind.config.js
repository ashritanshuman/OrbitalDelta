/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#F4F3EE",         // Primary background: warm ivory, never pure white
        surface: "#EAE8E0",    // Secondary background: muted sandstone for alternating sections
        panel: "#ECEAE3",      // Panel surface: subtle surface differentiation
        text: "#1C2228",       // Primary text: deep graphite, not absolute black
        muted: "#626A73",      // Secondary text: muted slate
        faint: "#858982",      // Tertiary text: subdued supporting labels
        line: "#B9B6AD",       // Borders: fine mineral-grey outlines
        grid: "#DCD9D0",       // Technical grid lines: extremely subtle, low-contrast lines
        accent: "#F15A24",     // Primary accent: signal orange
        softAccent: "#F8E4DA", // Soft orange surface: restrained background for selected states
        ok: "#286B49",         // Success: system status and completed steps
        warn: "#96600A",       // Warning: warnings and errors that require attention
        error: "#B9382B",      // Error: explicit failure states
      },
      fontFamily: {
        display: ["Michroma", "sans-serif"],
        sans: ["Barlow", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "4px",
        xl: "4px",
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      letterSpacing: {
        widest: '0.12em',
        'spec': '0.08em',
        'coord': '0.05em',
      },
    },
  },
  plugins: [],
};

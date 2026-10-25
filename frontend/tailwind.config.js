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
        bg: "#07090C",
        panel: "#0E1217",
        line: "#232A33",
        text: "#ECEEF1",
        muted: "#8A929D",
        faint: "#5A626D",
        accent: "#FF5A1F",
        ok: "#3DDC84",
        warn: "#FFB020",
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

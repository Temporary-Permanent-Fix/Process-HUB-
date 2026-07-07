/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#101215',
        panel: '#1a1d21',
        panelHover: '#20242a',
        border: '#2b3037',
        borderStrong: '#3a4048',
        text: '#e9e6dd',
        textDim: '#8b9199',
        textFaint: '#565c64',
        accent: '#6ec6d9',
        status: {
          online: '#49c07a',
          vyvoj: '#f0a63c',
          chyba: '#e2564d',
        },
        purpose: {
          analyza: '#5aa7d0',
          predikcia: '#a084d6',
          fakturacia: '#c99a44',
        },
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      boxShadow: {
        glowOnline: '0 0 6px 2px rgba(73, 192, 122, 0.55)',
        glowVyvoj: '0 0 6px 2px rgba(240, 166, 60, 0.5)',
        glowChyba: '0 0 6px 2px rgba(226, 86, 77, 0.5)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#000000',
        accent: '#39FF14',
        textPrimary: '#EDEDED',
        textSecondary: '#A0A0A0',
        glass: 'rgba(255,255,255,0.04)'
      },
      fontFamily: {
        display: ['"Orbitron"', 'Inter', 'sans-serif'],
        body: ['"Inter"', '"Tajawal"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        neon: '0 10px 40px rgba(57, 255, 20, 0.25)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};

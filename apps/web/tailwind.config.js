/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orbit: {
          bg: '#0E0F10',
          surface: '#181819',
          surfaceHover: '#1F1F20',
          border: '#242424',
          borderMuted: '#2E2E2E',
          accent: '#09AE5B',
          accentHover: '#078F4A',
          orange: '#F76C39',
          blue: '#358EB9',
          purple: '#7057FF',
          text: '#E5E5E5',
          textMuted: '#999999',
        }
      },
      fontFamily: {
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}

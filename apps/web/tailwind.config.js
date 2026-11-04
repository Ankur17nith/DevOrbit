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
          bg: '#0B0D12',
          surface: '#12151D',
          surfaceHover: '#181C26',
          surfaceMuted: '#202431',
          border: '#1F2430',
          borderMuted: '#2E364A',
          accent: '#8B5CF6',
          accentHover: '#A78BFA',
          accentGlow: 'rgba(139, 92, 246, 0.15)',
          text: '#F8FAFC',
          textSecondary: '#C5C8D0',
          textMuted: '#686D79',
          orange: '#F76C39',
          blue: '#358EB9',
          purple: '#8B5CF6',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#60A5FA',
        }
      },
      fontFamily: {
        display: ['Manrope', 'Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}

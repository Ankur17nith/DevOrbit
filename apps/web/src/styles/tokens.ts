/**
 * DevOrbit Official Design System Tokens
 * Strictly adhering to the Figma Application Design Specification:
 * - Canvas: #F9FAFB
 * - Cards: #FFFFFF (light), #0B0D12 / #12151D (dark shell)
 * - Accent: #8B5CF6 (Electric Violet), #EDE9FE (Violet Subtle/Light)
 * - Text Primary: #0B0D12, #0E121B
 * - Text Muted / Secondary: #686D79 (Signal Gray), #64748B
 * - Borders: border-black/7, border-black/10, #E2E8F0
 */

export const DEVORBIT_TOKENS = {
  colors: {
    canvas: '#F9FAFB',
    card: '#FFFFFF',
    shell: '#0B0D12',
    surfaceDark: '#12151D',
    accent: '#8B5CF6',
    accentLight: '#EDE9FE',
    accentHover: '#7C3AED',
    textPrimary: '#0B0D12',
    textSecondary: '#686D79',
    textMuted: '#94A3B8',
    borderLight: '#E2E8F0',
    borderSubtle: 'rgba(0, 0, 0, 0.07)',
    borderMuted: 'rgba(0, 0, 0, 0.10)',
    borderDark: 'rgba(255, 255, 255, 0.08)',
  },
  classes: {
    canvas: 'bg-[#F9FAFB] min-h-screen text-[#0B0D12]',
    card: 'bg-white rounded-xl border border-black/7 shadow-xs',
    cardInteractive: 'bg-white rounded-xl border border-black/7 shadow-xs hover:border-black/15 transition duration-150',
    primaryButton: 'px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-[0.98]',
    secondaryButton: 'px-4 py-2 bg-white hover:bg-gray-50 text-[#0B0D12] text-xs font-semibold rounded-lg border border-black/10 transition active:scale-[0.98]',
    pillViolet: 'px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EDE9FE] text-[#8B5CF6] border border-[#8B5CF6]/20',
    pillGray: 'px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-[#686D79] border border-black/5',
  }
} as const;

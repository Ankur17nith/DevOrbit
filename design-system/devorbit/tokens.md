# DevOrbit Design Tokens Specification

This document provides the canonical CSS variable declarations and Tailwind configuration tokens for DevOrbit.

---

## 1. CSS Variable Definitions (`:root`)

```css
:root {
  /* Canvas & Surfaces */
  --color-canvas: #0B0D12;
  --color-surface-dark: #12151D;
  --color-surface-elevated: #181C26;
  --color-surface-muted: #202431;

  /* Borders */
  --color-border-subtle: #1F2430;
  --color-border-hover: #2E364A;
  --color-border-accent: rgba(139, 92, 246, 0.4);

  /* Foreground & Typography */
  --color-fg-bright: #F8FAFC;
  --color-fg-muted: #C5C8D0;
  --color-fg-signal: #686D79;
  --color-fg-disabled: #434854;

  /* Primary Accent: Electric Violet */
  --color-violet-primary: #8B5CF6;
  --color-violet-hover: #A78BFA;
  --color-violet-active: #7C3AED;
  --color-violet-glow: rgba(139, 92, 246, 0.15);
  --color-violet-surface: rgba(139, 92, 246, 0.1);

  /* Status Accents */
  --color-success: #22C55E;
  --color-success-surface: rgba(34, 197, 94, 0.1);
  --color-warning: #F59E0B;
  --color-warning-surface: rgba(245, 158, 11, 0.1);
  --color-danger: #EF4444;
  --color-danger-surface: rgba(239, 68, 68, 0.1);
  --color-info: #60A5FA;
  --color-info-surface: rgba(96, 165, 250, 0.1);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Font Families */
  --font-display: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
}
```

---

## 2. Tailwind Configuration Mapping

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#0B0D12',
        surface: {
          dark: '#12151D',
          elevated: '#181C26',
          muted: '#202431',
        },
        border: {
          subtle: '#1F2430',
          hover: '#2E364A',
          accent: 'rgba(139, 92, 246, 0.4)',
        },
        fg: {
          bright: '#F8FAFC',
          muted: '#C5C8D0',
          signal: '#686D79',
          disabled: '#434854',
        },
        violet: {
          primary: '#8B5CF6',
          hover: '#A78BFA',
          active: '#7C3AED',
          glow: 'rgba(139, 92, 246, 0.15)',
          surface: 'rgba(139, 92, 246, 0.1)',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#60A5FA',
        },
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

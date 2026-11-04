# DevOrbit — Figma Reference Analysis & Design Specification

**Figma Reference URL**: [https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=xrJgFDvRrA9enOK3-1](https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=xrJgFDvRrA9enOK3-1)  
**Document Status**: Milestone M9 Master Design Single Source of Truth  
**Target Environment**: Desktop First (1440px / 1280px / 1024px) & Responsive Mobile (768px / 390px)

---

## 1. Executive Summary

This specification synthesizes the direct inspection of the official Figma Brand Identity file, the rendered vector assets in `/logo/`, and visual evidence from the Figma thumbnail render (`/tmp/figma_thumb.png`) and color swatch capture (`Screenshot From 2026-11-04 21-15-03.png`).

DevOrbit is a local-first Developer Intelligence Operating System. Its visual voice is purposeful, technical, restrained, and deeply grounded in space and celestial orbits:
- **Zero generic SaaS fluff**: No oversized neon glows, no random floating 3D shapes, and no emerald green brand bleed.
- **Electric Violet (`#8B5CF6`)**: Sole primary brand accent, representing energy, intelligence, and orbital trajectory.
- **Orbit Black (`#0B0D12`)**: Deep cosmic background canvas providing ultra-high contrast for code and developer metrics.

---

## 2. Observed Design Properties (Directly Verified from Assets & Renders)

### 2.1 Core Palette
| Swatch Name | Hex Code | Role | Verified Source |
|---|---|---|---|
| **Orbit Black** | `#0B0D12` | Canvas Background | Figma Swatch & `devorbit-primary-dark.svg` |
| **Electric Violet** | `#8B5CF6` | Primary Accent / Celestial Planet | Figma Swatch & SVG Orbit Dot |
| **Soft White** | `#F8FAFC` | Primary Text & Vector Marks | Figma Swatch & SVG Wordmark |
| **Signal Gray** | `#686D79` | Muted Secondary Text & Subdued Elements | Figma Swatch |

### 2.2 Brand Lockup & Mark
- **Vector Mark**: The monogram 'D' with a masked dynamic arc (`M15 64C31 45 57 37 82 47`) and an Electric Violet celestial satellite dot (`circle cx="77.5" cy="45.6" r="6.5"`).
- **Wordmark**: `DevOrbit` where "Dev" is rendered in Soft White (`#F8FAFC`) and "Orbit" is rendered in Subtle Silver (`#C5C8D0`) or Signal Gray (`#686D79`).
- **Aspect Proportions**: Full lockup ratio 1200:320 (3.75:1). Standalone mark ratio 1:1.

### 2.3 Typography & Copywriting
- **Hero Headline**: `"Your universe, in orbit."` with `"in orbit."` accented in Electric Violet (`#8B5CF6`).
- **Font Stack**: Manrope / Inter / Satoshi with tight tracking (`tracking-tight` / letter-spacing `-0.03em`).
- **Monospace Stack**: JetBrains Mono for commit hashes, telemetry, and code tokens.

---

## 3. Inferred Design System (Extended for Desktop OS Application)

To transform the brand identity into a full developer operating system, the following semantic tokens and structural patterns are formalized:

### 3.1 CSS Design Tokens
```css
:root {
  /* Brand Core */
  --orbit-black: #0B0D12;
  --electric-violet: #8B5CF6;
  --soft-white: #F8FAFC;
  --signal-gray: #686D79;

  /* Semantic Layers */
  --background: #0B0D12;
  --foreground: #F8FAFC;
  --surface: #12151D;
  --surface-secondary: #181C26;
  --surface-tertiary: #202431;
  --primary: #8B5CF6;
  --primary-hover: #A78BFA;
  --muted: #686D79;
  --border: rgba(248, 250, 252, 0.09);
  --border-subtle: #1F2430;
  --border-hover: #2E364A;

  /* Status Colors */
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #60A5FA;
}
```

### 3.2 Proportions & Layout Strategy
1. **Left Navigation Sidebar**:
   - Expanded width: `240px` (or `256px`).
   - Collapsed width: `64px` (icon-only with floating tooltips).
   - High-density hierarchical navigation groups with accordion toggles and active state pill badges.
2. **Top Bar**:
   - Height: `52px`.
   - Content: Breadcrumb context, global quick search (`Ctrl+K` / `Cmd+K`), notifications bell with unread badge, and user session switcher.
   - Clean separation from side navigation: No 25 horizontal links across the top!
3. **Card Architecture**:
   - Base Surface: `#12151D`.
   - Border: `1px solid #1F2430` (or `rgba(248, 250, 252, 0.09)`).
   - Border Radius: `rounded-xl` (`12px`) for cards; `rounded-lg` (`8px`) for buttons and inputs.
   - Hover Feedback: Subtle border shift to `#2E364A` and background shift to `#181C26`.

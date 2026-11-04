# DevOrbit Master Design System Specification

**Brand Tagline:** Your Skills. Your Code. Your Opportunities. One Universe.  
**Category:** Developer Intelligence Operating System  
**Aesthetic Direction:** Precise, dark cosmic-technical palette with high clarity, restrained surface elevations, purposeful contrast, and electric violet focal accents.  
**Version:** 1.0.0

---

## 1. Brand Philosophy & Identity

DevOrbit is an integrated operating system for software developers. The design reflects precision, deep focus, and algorithmic intelligence. It avoids childish illustrations, generic neon purple cyberpunk tropes, and ungrounded SaaS card templates.

### The Core Brand Transition
- **REMOVED**: Emerald green (`#09AE5B`) as the primary brand accent. Emerald green was a placeholder inherited from the Ossium research phase and is now strictly reserved for semantic success states (e.g., passing tests, merged pull requests, solved problems).
- **ENFORCED**: **Electric Violet (`#8B5CF6`)** is the sole primary accent of DevOrbit, drawn directly from the official celestial mark in `logo/`.

---

## 2. Color System

### 2.1 Core Palette

```
Canvas / Void       #0B0D12   Deepest substrate for window backgrounds
Surface Dark        #12151D   Cards, sidebars, base panels
Surface Elevated    #181C26   Dropdowns, modals, hover states, active rows
Surface Muted       #202431   Inset editors, search bars, table headers
Border Subtle       #1F2430   Standard borders (rgba(248, 250, 252, 0.08))
Border Bright       rgba(139, 92, 246, 0.35)   Focused inputs, active tab indicators
```

### 2.2 Text & Content Hierarchy

```
Foreground Bright   #F8FAFC   Headings, primary values, active tab text
Foreground Muted    #C5C8D0   Secondary text, descriptive paragraphs
Signal Gray         #686D79   Metadata, timestamps, subtle labels, placeholder text
Disabled Text       #434854   Inactive actions, disabled options
```

### 2.3 Brand & Interactive Accents

```
Electric Violet     #8B5CF6   Primary brand color, key buttons, active pills
Violet Hover        #A78BFA   Interactive hover state on primary violet
Violet Glow         rgba(139, 92, 246, 0.15)   Subtle focal glows, selection highlights
Violet Deep         #3B1F7A   Badges, active container background
```

### 2.4 Semantic Status Colors

```
Success             #22C55E   Solved problems, healthy builds, active connections
Warning             #F59E0B   Revisions due, approaching deadlines, warnings
Danger / Error      #EF4444   Hard failures, test breaks, security alerts
Info / Accent       #60A5FA   Informational tooltips, external links
```

---

## 3. Spatial System & Elevation

- **Base Grid**: 4px base unit with standard intervals:
  - `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px), `p-8` (32px).
- **Radii Hierarchy**:
  - Small pills / badges: `rounded-md` (6px).
  - Buttons / Inputs: `rounded-lg` (8px).
  - Cards / Panels: `rounded-xl` (12px).
  - Modals / Outer workspace containers: `rounded-2xl` (16px).
- **Elevation Layers**:
  - `Layer 0 (Canvas)`: `#0B0D12`
  - `Layer 1 (Card/Sidebar)`: `#12151D` with border `border-[#1F2430]`
  - `Layer 2 (Popovers/Tooltips)`: `#181C26` with subtle shadow `shadow-xl shadow-black/40`

---

## 4. Typography Matrix

| Role | Font Family | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|---|
| **Display Title** | Manrope, sans-serif | 24px (1.5rem) | 700 (Bold) | 1.2 | -0.025em |
| **Section Heading** | Manrope, sans-serif | 18px (1.125rem) | 600 (Semibold) | 1.3 | -0.015em |
| **Card / Widget Title**| Manrope, sans-serif | 15px (0.9375rem) | 600 (Semibold) | 1.4 | -0.01em |
| **Body (Default)** | Inter, sans-serif | 14px (0.875rem) | 400 (Regular) | 1.5 | normal |
| **Caption / Meta** | Inter, sans-serif | 12px (0.75rem) | 500 (Medium) | 1.4 | +0.01em |
| **Code / Data / AST** | JetBrains Mono, monospace | 13px (0.8125rem) | 400 / 500 | 1.6 | 0 |

---

## 5. Architectural Component Principles

1. **Information Density**: DevOrbit provides high information density for professional developers. Whitespace is purposeful, not bloated.
2. **Predictable Interaction**: Navigation between modules (Dashboard, OSS, DSA, Navigator, Fix, Recon, AI, Workspaces, Forum) preserves active filters and search states.
3. **Accessibility (WCAG 2.1 AA)**: All text on `#0B0D12` and `#12151D` maintains at least a 4.5:1 contrast ratio.
4. **Zero Layout Shift**: Skeleton loaders and exact metric dimensions prevent UI jumping during asynchronous data updates.

# Ossium Deep Reverse Engineering: Design Tokens

This document details the extracted color tokens, typography scales, spacing rules, and visual treatments from Ossium.

---

## 1. Color Palette

### 1.1 Base & Surfaces
- `--bg-canvas`: `#0E0F10` (Primary deep dark background)
- `--bg-surface-1`: `#181819` (Card and panel backgrounds)
- `--bg-surface-2`: `#1F1F20` (Hovered cards, sub-panels)
- `--bg-surface-3`: `#25262C` (Input fields, active pill states)
- `--bg-overlay`: `rgba(14, 15, 16, 0.8)` (Backdrop blur overlays)

### 1.2 Borders & Dividers
- `--border-subtle`: `#242424` (Standard card borders)
- `--border-muted`: `#2E2E2E` (Dividers, dropdown borders)
- `--border-dashed`: `#444444` (Dashed technical grid lines)

### 1.3 Text & Foreground
- `--text-primary`: `#E5E5E5` (High-contrast headings and body text)
- `--text-secondary`: `#D4D4D4` (Card body text)
- `--text-muted`: `#999999` / `neutral-500` (Labels, timestamps, meta counters)
- `--text-accent`: `#09AE5B` (Brand emerald highlight)

### 1.4 Accents & Semantic Colors
- `--accent-emerald`: `#09AE5B` (Brand primary, success states, verified badges)
- `--accent-orange`: `#F76C39` (Trending highlight, bounty alert)
- `--accent-blue`: `#358EB9` (Issue tags, info markers)
- `--accent-purple`: `#7057FF` (Good first issue pill)

---

## 2. Typography

- **Display & Headlines**: `Satoshi`, `system-ui, sans-serif`
  - Font weights: `600` (SemiBold), `700` (Bold)
  - Letter spacing: `-0.02em` for headlines
- **Body & Controls**: `Inter`, `system-ui, sans-serif`
  - Font weights: `400` (Regular), `500` (Medium), `600` (SemiBold)
- **Code & Numbers**: `JetBrains Mono`, `monospace`
  - Used for issue numbers `#41`, commit hashes, monetary sums `$7,000`.

---

## 3. Spacing & Radius

- **Corner Radius**:
  - Cards & Panels: `rounded-xl` (`12px`)
  - Buttons & Inputs: `rounded-lg` (`8px`)
  - Filter Pills & Badges: `rounded-full` (`9999px`)
- **Containers**:
  - Max page width: `1280px`
  - Page padding: `px-6 md:px-8 lg:px-12`

---

## 4. Visual Treatments

- **Technical Crosshair Accents**:
  - Placed on the 4 corners of mega-menus and featured cards using `+` glyphs.
  - Dashed outline borders with CSS `repeating-linear-gradient`.
- **Micro-interactions**:
  - Smooth card scaling on hover (`scale-[1.01]`).
  - Icon bounce/scale (`group-hover:scale-[1.03]`).
  - Transitions: `duration-200 ease-out` on colors, backgrounds, and box-shadows.

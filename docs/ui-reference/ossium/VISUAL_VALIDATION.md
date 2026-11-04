# Ossium Deep Reverse Engineering: Visual Validation Standards

This document establishes the visual quality floor, design system standards, and verification criteria for DevOrbit's Orbit OSS frontend.

---

## 1. Visual Standards Checklist

- [x] **Theme & Canvas**:
  - Dark-first aesthetic with deep black canvas `#0E0F10`.
  - Contrast ratios meet WCAG AA standards (`#E5E5E5` on `#0E0F10` = 16.5:1 ratio).
- [x] **Card Treatments**:
  - Unified corner radius `rounded-xl` (`12px`) with subtle border `#242424`.
  - Darker nested elements `#181819` transitioning to `#1F1F20` on interactive hover.
  - Distinctive technical corner crosshairs `+` and subtle dashed outline treatments for featured modules.
- [x] **Typography Hierarchy**:
  - Display font: `Satoshi` or high-personality geometric sans-serif for titles.
  - Body & UI: `Inter` for crisp readability at small sizes.
  - Monospace: `JetBrains Mono` for issue numbers, metrics, code pills, and bounty values.
- [x] **State Coverage**:
  - Every view must have explicit Loading skeletons, Error boundaries with retry buttons, and helpful Empty states with direct CTAs.
  - No dead buttons, placeholder `lorem ipsum`, or unstyled default HTML form elements.

---

## 2. Anti-Cliché Verification (per `frontend-design` skill)

- **No generic AI templates**: Avoid cream/clay palettes, excessive floating pills, and identical rounded cards with soft grey shadows.
- **Purposeful structural devices**: Hairline dividers and crosshairs are used only to encode technical structure.
- **Restraint**: A single orchestrated accent color (emerald `#09AE5B` or warm orange `#F76C39` for alerts) ensures the visual hierarchy remains calm and focused on code.

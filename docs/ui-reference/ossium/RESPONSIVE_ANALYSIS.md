# Ossium Deep Reverse Engineering: Responsive Analysis

This document specifies the responsive layout adaptations across mobile, tablet, desktop, and ultra-wide viewports.

---

## 1. Breakpoint Taxonomy

- **Mobile (`< 640px`)**:
  - Top navigation collapses into a hamburger trigger and mobile drawer menu.
  - Mega-menus convert to accordion lists.
  - Multi-column card grids collapse to a single column (`grid-cols-1`).
  - Search bar takes full width.
  - Filter pills scroll horizontally with momentum scrolling (`overflow-x-auto no-scrollbar`).
- **Tablet (`640px – 1023px`)**:
  - Two-column grid (`grid-cols-1 md:grid-cols-2`).
  - Metric counters compact into 2x2 grids.
  - Navigation retains mobile drawer or condensed links.
- **Desktop (`1024px – 1279px`)**:
  - Full desktop navigation with 3-column mega-menus (`w-[min(92vw,52rem)]`).
  - Card grids expand to 2-3 columns (`lg:grid-cols-3`).
  - Slide-over detail panel takes 480px width, leaving main catalog readable.
- **Ultra-Wide (`≥ 1280px`)**:
  - Content container is constrained to `max-w-[1280px]` centered in viewport with `mx-auto`.
  - Margins maintain consistent breathing room (`px-8 lg:px-12`).

---

## 2. Touch & Tap Targets

- On mobile viewports, buttons, pill chips, and card triggers maintain a minimum tap target of `44px x 44px`.
- Interactive cards provide full clickable surface area to prevent missed taps on small screens.

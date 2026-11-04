# DevOrbit Official Logo Asset Inventory & Specifications

**Date:** 2026-11-04  
**Source Directory:** `/logo/`  
**Web Distribution:** `/apps/web/public/logo/` and `/apps/web/src/assets/logo/`  
**Brand Identity:** DevOrbit — "Your Skills. Your Code. Your Opportunities. One Universe."

---

## 1. Asset Registry

| File Name | Format | Dimensions | ViewBox | File Size | Primary Target Usage |
|---|---|---|---|---|---|
| `devorbit-mark-color.svg` | SVG | 96 x 96 | `0 0 96 96` | 783 bytes | Standalone mark on dark/light surfaces, favicon, avatars, small cards. |
| `devorbit-primary-dark.svg` | SVG | 1200 x 320 | `0 0 1200 320` | 1,038 bytes | Master dark header banner, splash screen, README hero, full desktop navigation. |
| `devorbit-primary-light.svg` | SVG | 1200 x 320 | `0 0 1200 320` | 1,038 bytes | Light theme master header, white-paper presentations, documentation. |
| `devorbit-favicon-32.svg` | SVG | 32 x 32 | `0 0 32 32` | 805 bytes | Browser tab favicon (`apps/web/public/favicon.svg`), taskbar pinned icon. |
| `devorbit-app-icon.svg` | SVG | 1024 x 1024 | `0 0 1024 1024` | 846 bytes | Tauri desktop app installer icon, macOS .icns, Linux desktop .desktop entry, Windows .ico. |
| `Screenshot From 2026-11-04 21-15-03.png` | PNG | Raster reference | N/A | 12.1 kB | Visual reference verification for original lockup proportions and spacing. |

---

## 2. Extracted Color Palette & Geometry

### 2.1 Hex Codes Extracted from SVG Sources
- **`#8B5CF6` (Electric Violet)**: The core orbiting satellite planet dot (`circle cx="77.5" cy="45.6" r="6.5"`). Represents developer intelligence, planetary trajectory, and energy.
- **`#0B0D12` (Brand Black Canvas)**: Dark background canvas rect for primary dark lockup.
- **`#11141B` (Dark Substrate)**: Base stroke / dark background for favicon and app icon.
- **`#F8FAFC` (Soft White)**: Foreground stylized letter 'D' path, orbit swoop arc, and "Dev" wordmark in dark mode.
- **`#C5C8D0` (Subtle Silver Gray)**: "Orbit" secondary tspan in dark mode wordmark.
- **`#686D79` (Signal Gray)**: Secondary tspan in light mode wordmark.

### 2.2 Vector Anatomy
The DevOrbit brand mark combines two distinct semantic elements:
1. **The Monogram 'D'**: Constructed using outer curve `M21 14H47C70.5 14 86 27.2 86 48C86 68.8 70.5 82 47 82H21V14Z` and inner counter `M34 26V70H47C63.2 70 73 61.9 73 48C73 34.1 63.2 26 47 26H34Z`.
2. **The Planetary Orbit**: An arc with path `M15 64C31 45 57 37 82 47` cutting through the letter 'D' via SVG `<mask>` clipping, culminating in an orbiting celestial body in Electric Violet (`#8B5CF6`).

---

## 3. Recommended React Component Wrappers

To eliminate generic icons and ensure responsive SVG rendering, DevOrbit provides dedicated React components:

### 3.1 `DevOrbitLogo` (Full Brand Lockup)
```tsx
import React from 'react';

interface DevOrbitLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light' | 'auto';
}

export function DevOrbitLogo({ className = '', size = 'md' }: DevOrbitLogoProps) {
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-10' : 'h-8';
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <DevOrbitMark className={heightClass} />
      <span className="font-display font-semibold tracking-tight text-lg text-[#F8FAFC]">
        Dev<span className="text-[#C5C8D0]">Orbit</span>
      </span>
    </div>
  );
}
```

### 3.2 `DevOrbitMark` (Vector Icon Mark)
```tsx
export function DevOrbitMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="DevOrbit Mark">
      <defs>
        <mask id="nav-brand-cut">
          <rect width="96" height="96" fill="white" />
          <path d="M14 64C30 45 57 37 82 47" stroke="black" stroke-width="7" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M21 14H47C70.5 14 86 27.2 86 48C86 68.8 70.5 82 47 82H21V14ZM34 26V70H47C63.2 70 73 61.9 73 48C73 34.1 63.2 26 47 26H34Z"
        fill="#F8FAFC"
        fillRule="evenodd"
        clipRule="evenodd"
        mask="url(#nav-brand-cut)"
      />
      <path d="M15 64C31 45 57 37 82 47" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
      <circle cx="77.5" cy="45.6" r="6.5" fill="#8B5CF6" stroke="#0B0D12" strokeWidth="2.5" />
    </svg>
  );
}
```

---

## 4. Brand Enforcement Rule

> [!IMPORTANT]
> Generic Lucide icons (`Orbit`, `Globe`, `Activity`) must **never** be substituted for the official DevOrbit brand mark in the Top Navigation, Auth Modals, Landing pages, or Desktop application windows. Always use `<DevOrbitMark />` or `<DevOrbitLogo />`.

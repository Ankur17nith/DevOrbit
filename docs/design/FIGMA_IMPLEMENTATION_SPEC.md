# DevOrbit — Figma Implementation & UI Specification

**Figma Source URL**: [https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=LOr1bu5JKYHmVzmy-1&preview-route=%2Fdocumentation](https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=LOr1bu5JKYHmVzmy-1&preview-route=%2Fdocumentation)  
**High-Resolution Capture Reference**: [`docs/design/figma_full_reference.png`](./figma_full_reference.png) (1440 × 8000 px)  
**Specification Date**: 2026-11-05  
**Target Environment**: Public Landing Site & Authenticated Application Shell (Desktop First & Mobile Responsive)

---

## 1. Route Inventory & Architecture

The Figma reference specifies a dual-tier presentation:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        DEVORBIT ROUTE HIERARCHY                        │
├───────────────────────────────────┬────────────────────────────────────┤
│           PUBLIC PAGES            │       AUTHENTICATED WORKSPACE      │
│     (Unauthenticated Visitors)    │       (Logged-in Developers)       │
├───────────────────────────────────┼────────────────────────────────────┤
│  /              (Landing Page)    │  /dashboard    (Command Center)    │
│  /product       (Overview)        │  /navigator    (Codebase Nav)      │
│  /features      (Feature Grid)    │  /dsa          (Orbit DSA)         │
│  /how-it-works  (System Flow)     │  /oss          (Open Source Hub)   │
│  /integrations  (Public Methods)  │  /ai           (Orbit AI Studio)   │
│  /privacy       (Data Control)    │  /integrations (Connected Hub)     │
│  /documentation (DevOrbit Docs)   │  /settings     (User & Backups)    │
│  /login         (Sign In)         │  /profile      (Developer Skills)  │
│  /register      (Get Started)     │                                    │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. Design Tokens & Palette (Directly Verified from Figma)

### 2.1 Core Color Tokens
```css
:root {
  /* Public Canvas & Backgrounds */
  --bg-public: #FFFFFF;
  --bg-public-alt: #F8FAFC;
  --bg-dark-section: #0B0D12;
  --bg-app-shell: #0E1117;
  --bg-app-canvas: #F8FAFC;

  /* Typography */
  --text-primary: #0E121B;
  --text-secondary: #4B5565;
  --text-muted: #64748B;
  --text-on-dark: #F8FAFC;
  --text-on-dark-muted: #94A3B8;

  /* Brand Accents */
  --violet-primary: #8B5CF6;       /* Electric Violet - Planet Accent & Hero Highlight */
  --violet-light: #EDE9FE;         /* Soft violet pills & avatar background */
  --violet-glow: rgba(139, 92, 246, 0.15);

  /* Borders & Surfaces */
  --border-light: #E2E8F0;
  --border-dark: rgba(248, 250, 252, 0.09);
  --surface-card-light: #FFFFFF;
  --surface-card-dark: #12151D;
  --surface-card-dark-alt: #1A1E29;
}
```

### 2.2 Typography Scale
- **Headings Font**: Inter / Manrope (SemiBold 600, Bold 700).
  - Hero H1: `font-size: 72px; line-height: 1.05; letter-spacing: -0.04em;`
  - Section H2: `font-size: 44px; line-height: 1.15; letter-spacing: -0.03em;`
  - Subsection H3: `font-size: 24px; line-height: 1.25; font-weight: 600;`
- **Body Font**: Inter (Regular 400, Medium 500).
  - Body Large: `font-size: 18px; line-height: 1.6; color: #4B5565;`
  - Body Regular: `font-size: 14px; line-height: 1.5; color: #64748B;`
- **Code & Numbering**: JetBrains Mono.

---

## 3. Inspected Page Sections & Layout Specs

### 3.1 Public Top Navigation Bar (Height: 72px)
- **Container**: Max width 1280px, centered, flex items-center justify-between.
- **Left**: Square brand mark (`devorbit-mark-color.svg` or squircle D-glyph) + `DevOrbit` wordmark.
- **Center**: Navigation items (`Product`, `Features`, `How it works`, `Integrations`, `Privacy`, `Documentation`) in `#4B5565` with hover `#0E121B`.
- **Right**:
  - `Sign in`: Text link `#0E121B` (font-weight 500).
  - `Get started`: Solid black button (`#0E121B`, color `#FFFFFF`, border-radius 8px, px-4 py-2).

### 3.2 Hero Section
- **Pill Badge**: `● Local-first developer intelligence` (soft border `#E2E8F0`, rounded-full, violet dot `#8B5CF6`).
- **H1 Headline**:
  `Your entire developer journey. One universe.`
  - "Your entire developer journey." in `#0E121B`.
  - "One universe." in `#8B5CF6` with subtle purple linear-gradient text clip.
- **Subtitle**: Max width 780px, text-center, `#4B5565`.
- **Action Buttons**:
  - Primary: `Get started →` (dark `#0E121B`, rounded 8px, white text, arrow icon).
  - Secondary: `Explore features` (white background, border `#E2E8F0`, dark text).

### 3.3 Framed Application Preview Mockup
- **Outer Frame**: Dark container (`#0E1117`, border-radius 16px, padding 20px, shadow-2xl).
- **Embedded App Shell**:
  - **Left Sidebar** (Width: 240px, Dark `#0E1117`):
    - Logo + `DevOrbit`
    - Section header: `WORKSPACE` (uppercase, letter-spacing 0.05em, text-muted).
    - Items: `Command Center` (Active: `#1A1E29` rounded background), `Codebase Navigator`, `Orbit DSA`, `Open Source`, `Orbit AI`.
  - **Main Canvas** (Light `#F8FAFC`, border-radius 10px):
    - Header: `Command Center`, search input (`Search your workspace...`), purple user avatar circle (`#EDE9FE`).
    - Banner: `TUESDAY, 14 MAY` (violet `#8B5CF6`), `Good morning, Alex.`, `Your developer workspace at a glance.`
    - Top 3 Summary Cards (White background, light border):
      - `GITHUB ACTIVITY`: Connect GitHub (`OAuth required`)
      - `DSA PROGRESS`: No problems yet (`Add your first problem`)
      - `OPEN SOURCE`: No saved issues (`Discover opportunities`)
    - Lower Section:
      - Large card: `Recent activity` with centered empty state (`Connect an integration to see activity.`).
      - Right card: `Quick actions` (Dark container `#11141B`) with buttons: `Open repository`, `Track DSA problem`, `Connect integration`.

### 3.4 The Problem Section
- **Label**: `THE PROBLEM` (Violet `#8B5CF6`, uppercase, tracking-wider).
- **H2**: `Your developer journey is scattered across too many tools.`
- **Body**: `DevOrbit creates one coherent workspace without pretending every platform works the same way.`
- **Right Column Cards (Divided by subtle borders)**:
  - `01` `Activity`: GitHub work lives separately from DSA progress and learning.
  - `02` `Discovery`: Open-source programs and contribution opportunities are fragmented.
  - `03` `Understanding`: Unfamiliar repositories, errors, and change impact require disconnected tools.
  - `04` `Evidence`: Technical growth is difficult to understand objectively and transparently.

### 3.5 Product System Section
- **Label**: `PRODUCT SYSTEM` (Violet `#8B5CF6`).
- **H2**: `One workspace. Every part of your developer journey.`
- **6-Card Grid (3 columns x 2 rows, White cards, light borders)**:
  1. `01` Developer Intelligence: Evidence-backed skills, GitHub activity, and learning progress in one view.
  2. `02` Codebase Intelligence: Navigate repositories, understand architecture, and investigate changes.
  3. `03` Open Source Discovery: Find relevant organizations, issues, programs, and verified bounties.
  4. `04` DSA & Learning: Track problem solving, revision cycles, sheets, and platform activity.
  5. `05` Development Assistance: Source-grounded help for errors, patches, and local models.
  6. `06` Integrations & Automation: Connect developer tools through the right method for each platform.

### 3.6 Capabilities Section (Dark Canvas `#0B0D12`)
- **Label**: `CAPABILITIES`
- **H2**: `A serious workspace for technical work.`
- **Subtitle**: `Each module solves a distinct developer workflow. Intelligence is grounded in connected data and source context, never decorative AI output.`
- **9 Module Rows with subtle border lines**:
  - Orbit Skills, Orbit DSA, Orbit OSS, Codebase Navigator, Orbit Fix, SafeChange, Orbit Recon, Orbit AI, Orbit Pulse.

### 3.7 How It Works Section (4-Step Pipeline)
- `01 Create your account`: Start with only the profile information your workspace needs.
- `02 Connect platforms`: Authorize or import through the correct method for each service.
- `03 Build your workspace`: Choose learning, open-source, and development priorities.
- `04 Track and improve`: Use connected evidence to understand your developer journey.

### 3.8 Integrations Section
- **H2**: `Honest connections. Clear methods.`
- **Subtitle**: `OAuth where it exists. Public APIs, extensions, imports, and local services where they are the right fit.`
- **Methods Table**:
  - GitHub: `DIRECT OAUTH` | Repositories and development activity
  - Codeforces: `USERNAME + PUBLIC API` | Rating, submissions, and problem history
  - LeetCode: `BROWSER EXTENSION / IMPORT` | Solved problems and activity
  - TUF: `THIRD-PARTY DATA SOURCE` | Imported problem progress
  - Ollama: `LOCAL SERVICE` | Models running on your machine
  - DSA Sheets: `CSV / JSON IMPORT` | Striver A2Z, TLE Eliminators, and custom sheets

### 3.9 Your Data. Your Control. (Dark Card)
- Card with shield icon: `Your development data. Your control.`
- Principles: Local-first architecture, Explicit authorization, Optional local AI, Controlled imports.

### 3.10 Call to Action Banner (Electric Violet `#8B5CF6`)
- Solid Electric Violet background `#8B5CF6` with white typography.
- H2: `Bring your developer universe together.`
- Subtitle: `Create your workspace, connect what matters, and keep control of everything else.`
- Buttons:
  - `Create free account` (Solid white button, dark text).
  - `Sign in` (Ghost/semi-transparent violet button, white text).

### 3.11 Footer (Dark `#0B0D12`)
- DevOrbit logo + "Your Skills. Your Code. Your Opportunities. One Universe."
- Columns:
  - PRODUCT: Features, Integrations, Documentation
  - COMPANY: Privacy Policy, Terms of Service, Contact
  - DEVELOPERS: GitHub, Status, Changelog
- Copyright: `© 2026 DevOrbit. All rights reserved.`

> [!WARNING]
> **Historical Record — May Be Inaccurate**
> This document is a historical milestone record from earlier development phases prior to the full audit remediation. Many legacy claims (including test counts, feature completion claims, or architectural assumptions) have been superseded. For verified system status, see docs/audits/REMEDIATION_REPORT.md.

# DevOrbit — Application-Wide UI Audit & Figma Design Compliance

**Audit Date**: 2026-11-05  
**Auditor**: Senior Full-Stack Engineer & UI Architecture Specialist  
**Figma Reference**: [https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=LOr1bu5JKYHmVzmy-1&preview-route=%2Fdocumentation](https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=LOr1bu5JKYHmVzmy-1&preview-route=%2Fdocumentation)  
**High-Resolution Visual Reference**: [`docs/design/figma_full_reference.png`](./figma_full_reference.png) (1440 × 8000 px)  
**Specification Reference**: [`docs/design/FIGMA_IMPLEMENTATION_SPEC.md`](./FIGMA_IMPLEMENTATION_SPEC.md)

---

## 1. Executive Summary

This comprehensive audit inspects every route, authenticated module, public screen, dialog, and navigation component across the entire DevOrbit application. While previous milestones aligned the public landing page, login, registration, and documentation pages with the Figma visual system, multiple authenticated workspace modules still retain inconsistent legacy styles, irregular paddings, discordant color tokens (such as Tailwind slate/indigo/blue accents), unaligned container max-widths, and non-standardized button and badge primitives.

### Core Audit Findings:
1. **Color Token Fidelity**:
   - Brand tokens: Orbit Black (`#0B0D12`), App Shell (`#0E1117`), Dark Card Surface (`#12151D`), Surface Hover (`#181C26`), Borders (`#1F2430` / `rgba(248, 250, 252, 0.09)`), Electric Violet (`#8B5CF6`), Soft White (`#F8FAFC`), and Signal Gray (`#686D79`).
   - Brand Bleed Status: Zero emerald green (`#10B981`) was detected in the frontend codebase. However, multiple modules (`IssuesPage`, `DsaTrackerPage`, `TrendingPage`, `BountiesPage`, `WorkspacesPage`) still use ad-hoc Tailwind colors (`border-slate-500/30`, `text-indigo-400`, `text-blue-400`) instead of semantic tokens.
2. **Layout & Container Inconsistencies**:
   - Page container max-widths fluctuate between `max-w-[1440px]`, `max-w-5xl`, `max-w-[1000px]`, and `max-w-[1200px]`, causing jarring horizontal jumps when navigating tabs.
   - The desktop shell in `App.tsx` has a fixed padding `lg:pl-60`, which conflicts when the sidebar is collapsed to `68px`.
3. **Typography & Component Disparities**:
   - Headers across pages vary from plain `text-2xl font-bold` to `text-3xl font-extrabold font-display tracking-tight`.
   - Modals in `IntegrationCenterPage`, `DsaTrackerPage`, `IssuesPage`, `WorkspacesPage`, and `ForumPage` use differing corner radii, padding, and backdrop treatments.
   - Buttons and input fields lack a single source of truth for focus rings, hover transitions, and height scales.

---

## 2. Route & Screen Inventory Audit Table

| # | Route / Tab | Component | Current Visual State | Figma Compliance | Differences & Inconsistencies | Required Changes | Priority |
|---|-------------|-----------|----------------------|------------------|--------------------------------|------------------|----------|
| 1 | `/` (landing) | `PublicLandingPage.tsx` | Redesigned (Figma Light) | Matching (95%) | Minor mobile responsive touch targets and container alignment. | Refine mobile drawer and sticky header blur. | Low |
| 2 | `/login` | `LoginPage.tsx` | Redesigned (Figma Light) | Matching (92%) | Input focus ring and card border padding alignment. | Ensure standard input focus states (`#8B5CF6`) and typography. | Medium |
| 3 | `/register` | `RegisterPage.tsx` | Redesigned (Figma Light) | Matching (92%) | Same as login; form submission feedback. | Standardize input tokens and button hover states. | Medium |
| 4 | `/documentation` | `DocumentationPage.tsx` | Redesigned (Figma Hybrid) | Matching (90%) | Code block contrast and search filter empty state. | Unify syntax container with JetBrains Mono and copy button. | Low |
| 5 | `/dashboard` | `DashboardPage.tsx` | Redesigned (Figma Dark) | Matching (95%) | Command center greeting, summary cards, and quick actions are aligned. | Unify card sub-headers and action button primitives. | Low |
| 6 | `/navigator` | `CodebaseNavigatorPage.tsx` | Partially Matching | Partially (75%) | File tree and code viewer containers use ad-hoc borders; mermaid graph contrast. | Standardize file tree surfaces, code line numbering, and header pill badge. | High |
| 7 | `/fix` | `OrbitFixPage.tsx` | Partially Matching | Partially (72%) | Stack trace ingest box, patch diff view, and action buttons lack unified Figma tokens. | Implement unified diff view, diagnostic cards, and standard action buttons. | High |
| 8 | `/safechange` | `OrbitSafeChangePage.tsx` | Partially Matching | Partially (70%) | Tabs use inconsistent borders; blast radius and migration tables need Figma surface styling. | Standardize segmented tabs, risk severity badges, and code container. | High |
| 9 | `/recon` | `OrbitReconPage.tsx` | Partially Matching | Partially (68%) | URL input and extracted tokens container use non-standard padding and borders. | Unify input bar, token color chips, and preview switcher. | High |
| 10 | `/ai` | `OrbitAiPage.tsx` | Partially Matching | Partially (78%) | Conversation sidebar and message bubbles need refined Figma card hierarchy; model pill needs polish. | Standardize chat bubbles, model selector dropdown, and empty prompt states. | High |
| 11 | `/dsa` | `DsaTrackerPage.tsx` | Partially Matching | Partially (74%) | Analytics cards and SM-2 review queue have inconsistent paddings; solve modal is plain. | Standardize metric cards, SM-2 cards, topic filter pills, and solve modal. | High |
| 12 | `/profile` | `DeveloperProfilePage.tsx` | Partially Matching | Partially (76%) | GitHub heatmap and skills radar cards have mixed borders; repository cards need polish. | Align heatmap colors to Electric Violet tokens; unify skills badges and repo cards. | High |
| 13 | `/catalog` | `OssCatalogPage.tsx` | Partially Matching | Partially (72%) | Repository cards and right-side drawer need standard surface tokens and tag styling. | Standardize catalog card layout, bookmark button, and detail drawer. | High |
| 14 | `/trending` | `TrendingPage.tsx` | Old Design / Inconsistent | Inconsistent (50%) | Minimalist 120-line list with bare cards and inconsistent borders. | Redesign with rich Figma card metrics, language badges, and star growth indicators. | High |
| 15 | `/issues` | `IssuesPage.tsx` | Partially Matching | Partially (65%) | 6-stage Kanban columns use hardcoded Tailwind colors (`border-slate-500`, `text-indigo-400`). | Unify Kanban columns with Figma surfaces, standard stage badges, and match modal. | High |
| 16 | `/gsoc` | `GsocPage.tsx` | Partially Matching | Partially (70%) | Programs and organization grid cards use non-uniform badges and button styles. | Standardize program deadline pills, organization cards, and tech stack tags. | Medium |
| 17 | `/bounties` | `BountiesPage.tsx` | Old Design / Inconsistent | Inconsistent (55%) | Basic 90-line card grid with minimal metadata and inconsistent badge styling. | Elevate card aesthetics with verified reward badges, difficulty pills, and actions. | High |
| 18 | `/workspaces` | `WorkspacesPage.tsx` | Old Design / Inconsistent | Inconsistent (60%) | Bare cards, non-standard create/invite modals, container width `max-w-[1440px]`. | Redesign workspace cards, member list chips, role badges, and modals. | Medium |
| 19 | `/forum` | `ForumPage.tsx` | Old Design / Inconsistent | Inconsistent (60%) | Basic discussion list; non-standard modal; container width `max-w-[1200px]`. | Redesign discussion feed with author avatars, tag chips, reply stats, and modal. | Medium |
| 20 | `/selfbot` | `SelfbotPage.tsx` | Old Design / Inconsistent | Inconsistent (58%) | Narrow `max-w-[1000px]` container; form fields lack standardized input tokens. | Standardize form card, safety notice, toggle switches, and action buttons. | Medium |
| 21 | `/integrations` | `IntegrationCenterPage.tsx` | Partially Matching | Partially (80%) | Integration cards are functional but modals and OAuth status alerts need unified styling. | Refine OAuth cards, sync status chips, manual entry modals, and terminal help blocks. | High |
| 22 | `/settings` | `SettingsPage.tsx` | Partially Matching | Partially (65%) | Narrow `max-w-5xl` container; basic tabs; health metrics and backup cards need Figma styling. | Standardize layout to matching shell width, tab switcher, health cards, and backup forms. | High |
| 23 | Global: Sidebar | `Sidebar.tsx` | Partially Matching | Partially (82%) | Duplicate profile links; collapse width not synchronized with App container. | Clean up navigation hierarchy, synchronize collapse states, refine badges. | High |
| 24 | Global: TopBar | `TopBar.tsx` | Partially Matching | Partially (85%) | Notifications dropdown and user profile menu lack Figma popover treatment. | Refine breadcrumbs, user avatar menu, and notification popover. | Medium |
| 25 | Global: AppShell | `App.tsx` | Partially Matching | Partially (85%) | Fixed `lg:pl-60` margin causing sidebar collapse misalignment; telemetry footer polish. | Dynamic sidebar offset; refine telemetry bar font and status indicators. | High |
| 26 | Global: AuthModal | `AuthModal.tsx` | Partially Matching | Partially (80%) | Corner radius and button styles differ slightly from public login/register. | Unify modal container, input fields, and action buttons with Figma tokens. | Medium |
| 27 | Global: Cmd+K | `CommandPalette.tsx` | Partially Matching | Partially (85%) | Search input and list item active states need standard Figma surface hover. | Enhance item highlighting, icon alignment, and shortcut badges. | Low |

---

## 3. Discrepancy Breakdown by Domain

### 3.1 Design System & Token Discrepancies
- **Non-Standard Colors**: Several files still instantiate ad-hoc tailwind colors:
  - `IssuesPage.tsx`: uses `border-slate-500/30`, `text-slate-400`, `border-blue-500/30`, `text-blue-400`, `border-indigo-500/30`, `text-indigo-400`, `border-amber-500/30`, `text-amber-400`, `border-purple-500/30`, `text-purple-400`, `border-green-500/30`, `text-green-400`.
  - These must be mapped to semantic Orbit tokens: Electric Violet (`#8B5CF6`), Signal Gray (`#686D79`), Soft White (`#F8FAFC`), Warning Amber (`#F59E0B`), and Success Green (`#22C55E`).
- **Surface Elevation Hierarchy**:
  - Background Canvas: `#0B0D12` (Base).
  - Primary Surface Card: `#12151D` with border `#1F2430`.
  - Secondary Surface / Nested Card / Code Ingest: `#0B0D12` or `#181C26` with border `#1F2430`.
  - Active / Hover Surface: `#181C26` or `#202431` with border `#2E364A` or `#8B5CF6`/40.

### 3.2 Application Shell & Layout
- **Page Container Width**: Standardize on a uniform layout container:
  - `max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6`.
  - Eliminate narrow exceptions (`max-w-5xl` in `SettingsPage`, `max-w-[1000px]` in `SelfbotPage`, `max-w-[1200px]` in `ForumPage`).
- **Sidebar Collapse Synchronization**:
  - `App.tsx` must read the sidebar collapsed state or use responsive classes that dynamically shift from `lg:pl-60` (expanded) to `lg:pl-[68px]` (collapsed).
- **Navigation Item Consistency**:
  - Remove redundant duplicate `profile` item in Sidebar (currently appears under both "Learning" and "Account").
  - Unify group titles: `OVERVIEW`, `DEVELOPMENT`, `LEARNING`, `OPEN SOURCE`, `INTEGRATIONS`, `COLLABORATION`, `ACCOUNT`.

### 3.3 Development & AI Modules
- `CodebaseNavigatorPage.tsx`: Standardize the 3 views (Explorer, Search, Graph) with unified tab switches, crisp JetBrains Mono code rendering, and unified symbol filters.
- `OrbitFixPage.tsx`: Upgrade the error log ingestion card, root-cause diagnosis presentation, and unified git diff viewer to adhere to Figma borders and surface cards.
- `OrbitSafeChangePage.tsx`: Unify the 3 sub-modules (Impact Analysis, Migration Guardian, Quality Audit) with consistent segmented controls and danger/warning badges.
- `OrbitReconPage.tsx`: Unify the URL extraction form, color token chip grid, and code export panel.
- `OrbitAiPage.tsx`: Polish the chat interface with Figma dark card backgrounds, distinct assistant response container, model badge indicator, and quick prompt chips.

### 3.4 Learning & DSA Modules
- `DsaTrackerPage.tsx`: Align metric cards, platform badges (LeetCode, Codeforces, TUF), SM-2 spaced repetition cards, and problem solve modal.
- `DeveloperProfilePage.tsx`: Ensure contribution heatmap matches Electric Violet density scale (`#181C26` -> `#4C1D95` -> `#6D28D9` -> `#8B5CF6` -> `#A78BFA`); standardize skills radar and repo list cards.

### 3.5 Open Source & Collaboration Modules
- `OssCatalogPage.tsx`: Standardize repository cards, stars/forks counters, bookmark action, and drawer layout.
- `TrendingPage.tsx`: Elevate from basic listing to a full-fledged Figma-styled trending dashboard with growth metrics and language filters.
- `IssuesPage.tsx`: Eliminate Tailwind ad-hoc colors in 6-stage Kanban board; unify stage header badges and card drag/move actions.
- `GsocPage.tsx`: Polish program stipend badges, timeline countdowns, and organization directory grid.
- `BountiesPage.tsx`: Elevate bounty cards with prominent dollar reward badges, difficulty indicators, and direct solve links.
- `WorkspacesPage.tsx`: Align workspace cards, member invitation modals, and active workspace switcher.
- `ForumPage.tsx`: Align discussion thread cards, voting badges, and creation modal.
- `SelfbotPage.tsx`: Align repository selector, automation toggles, and safety alert cards.

### 3.6 Integrations & Settings
- `IntegrationCenterPage.tsx`: Unify connection cards (GitHub, Codeforces, LeetCode, TUF, Ollama), sync triggers, and modal dialogs.
- `SettingsPage.tsx`: Expand to full shell width, unify account profile, AI configuration, system health diagnostics, and local backup/restore actions.

---

## 4. Execution Plan (9 Atomic Commits)

1. `chore(ui): audit all application routes and design inconsistencies` (This step)
2. `refactor(ui): unify application shell and shared design tokens`
3. `feat(ui): align development and AI modules with Figma design`
4. `feat(ui): align learning and DSA modules with Figma design`
5. `feat(ui): align open source and collaboration modules with Figma design`
6. `feat(ui): align integrations and account settings with Figma design`
7. `feat(ui): align public pages and authentication with Figma design`
8. `test(ui): verify application-wide visual and responsive consistency`
9. `docs(ui): document Figma alignment and visual QA results`

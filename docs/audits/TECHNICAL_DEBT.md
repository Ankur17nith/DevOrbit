# DevOrbit Technical Debt Register

**Evaluation Date:** 2026-11-04  
**Status:** Monitored and Prioritized for Milestones M1.3 through M8.

---

## 1. Identified Technical Debt Items

### TD-01: Legacy Emerald `#09AE5B` Accent Bleed (High Priority — Slated for M1.3)
- **Problem**: The early M1 prototype used emerald green (`#09AE5B`) as the primary brand accent across badges, buttons, active navigation indicators, and borders.
- **Brand Standard**: DevOrbit's official brand identity is anchored by **Electric Violet (`#8B5CF6`)**, deep canvas `#0B0D12`, soft white `#F8FAFC`, and signal gray `#686D79`.
- **Action**: Replace emerald accent across all views (`Sidebar`, `Header`, `DashboardPage`, `OssPage`, `DsaPage`, `ReconPage`, `ForumPage`, `WorkspacesPage`) and enforce design tokens.

### TD-02: Missing Official Logo Assets in Navigation (High Priority — Slated for M1.3)
- **Problem**: The UI header currently renders a generic Lucide `Orbit` SVG icon instead of the official vector logos residing in the repository's `logo/` folder (`devorbit-mark-color.svg`, `devorbit-primary-dark.svg`, `devorbit-app-icon.svg`).
- **Action**: Inventory all assets in `logo/`, copy optimized web-ready vectors into `apps/web/public/` or `src/assets/`, and replace generic icons in the application shell.

### TD-03: System Status Indicator Mock Data (Medium Priority — Slated for M1.3)
- **Problem**: The Eco Mode and system status bar indicates static strings (`CPU 1.2% | RAM 42MB | Eco Mode`) rather than querying real process resource utilization.
- **Action**: Expose `/api/v1/system/status` backed by Node.js `process.cpuUsage()` and `process.memoryUsage()`, allowing the frontend status widget to display live, empirical system metrics.

### TD-04: Code Viewer & Editor Abstraction (Medium Priority — Slated for M5/M6)
- **Problem**: Code snippets in Orbit AI and Recon are currently rendered inside basic HTML `<pre><code>` blocks without syntax highlight tokenization or line-number guttering.
- **Action**: Introduce a lightweight, performant syntax-highlighted code block component (e.g. Prism or Shiki integration) with copy-to-clipboard functionality.

### TD-05: SQLite WAL Mode Pragma (Low Priority — Slated for M2)
- **Problem**: SQLite defaults to standard rollback journal mode, which locks the database file during write transactions.
- **Action**: Execute `PRAGMA journal_mode = WAL;` and `PRAGMA synchronous = NORMAL;` on database connection to enable non-blocking concurrent reads during background GitHub synchronization.

---

## 2. Technical Debt Resolution Schedule

| Milestone | Target Items | Expected Outcome |
|---|---|---|
| **M1.3** | TD-01, TD-02, TD-03 | Full brand alignment with Electric Violet, official logo integration, live system resource telemetry. |
| **M2** | TD-05 | Background sync engine with WAL concurrency. |
| **M5 / M6** | TD-04 | Monaco/Prism syntax highlighting for codebase navigation and patch verification. |

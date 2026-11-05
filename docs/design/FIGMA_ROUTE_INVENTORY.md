# DevOrbit — Figma Route & Application Screen Inventory

**Ground Truth Reference:** [DevOrbit Figma Make Prototype](https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=LOr1bu5JKYHmVzmy-1&preview-route=%2Fapp)  
**Inspection Date:** November 2026  
**Auditor:** Principal Software & UI Architect  
**Captured High-Resolution Screens:** 26 Screens in `docs/design/figma-screens/`  

---

## 1. Global Shell & Visual Architecture Specifications

The official Figma DevOrbit application adheres to a clear visual hierarchy:
- **Left Navigation Sidebar:**
  - Background: Dark Cosmic Shell (`#0B0D12` / `w-[244px]`)
  - Border: Subtle separation line (`border-white/8` or `#1F2430`)
  - Navigation Sections:
    1. `OVERVIEW`: Command Center
    2. `DEVELOPMENT`: Codebase Navigator, Orbit Fix, SafeChange, Orbit Recon, Orbit AI
    3. `LEARNING`: DSA Dashboard, Problem Tracker, Revision Schedule, Orbit Skills, Learning Progress
    4. `OPEN SOURCE`: Discover, Trending, Organizations, Issues, Bounties, Contributions
    5. `COLLABORATION`: Workspaces, Community
    6. `SYSTEM`: Integrations, Orbit Pulse, Documentation
  - Active Item: Elevated surface pill `bg-[#181C26]` with violet active accent
  - User footer: User profile card with initials badge, username, and settings link
- **Top Utility Header:**
  - Background: Pure White (`bg-white border-b border-black/8 h-14`)
  - Left: Uppercase tracking breadcrumbs (`text-[10px] text-[#8B8F98] uppercase tracking-wider`) + Section title (`text-sm font-semibold text-[#0B0D12]`)
  - Right: Workspace search bar with `⌘K` shortcut (`bg-[#F6F7F8] border border-black/8 text-[11px] h-8 w-56`), Notification bell button, User avatar pill (`bg-[#EEEAFB] text-[#6D3FE0]`)
- **Main Workspace Canvas:**
  - Background: **Clean Light Canvas (`bg-[#F9FAFB]` / off-white)**
  - Content Cards: Crisp white surfaces (`bg-white rounded-xl border border-black/8 shadow-none`)
  - Accent Hierarchy: Primary Electric Violet (`#8B5CF6`), Secondary Signal Gray (`#686D79`), High-contrast text (`#0B0D12`)
  - Dark Code Surfaces: Dedicated code editors and diff viewers use `#11141B` with monospace fonts.

---

## 2. Complete 26-Screen Route Inventory & Comparison Matrix

| # | Screen Name | Figma Path | DevOrbit Route | Screenshot Reference | Visual & Layout Description | UI Components & Interactions | Current Status & Delta |
|---|---|---|---|---|---|---|---|
| **1** | **Command Center** | `/app` | `/app`, `/dashboard` | [`docs/design/figma-screens/app.png`](./figma-screens/app.png) | Light canvas, Electric Violet `WORKSPACE OVERVIEW` tag, `Good morning, Developer.` heading, 4 KPI cards (Connected Platforms, Tracked Problems, Saved Opportunities, Indexed Projects), Development Overview card with GitHub status, Quick Actions stack | KPI metric cards, source provenance tags, GitHub connect CTA, Quick action navigation links | Redesign from dark to Figma light canvas with white cards |
| **2** | **Codebase Navigator** | `/app/codebase` | `/app/codebase`, `/navigator` | [`docs/design/figma-screens/app_codebase.png`](./figma-screens/app_codebase.png) | 3-column layout: Explorer tree (left), Dark Code viewer (center, `#11141B`), Context panel with AST symbol analysis and Q&A (right) | `+ Add repository` button, file search input, symbol index tree, syntax highlighter, query input | Align 3-column structure and header |
| **3** | **Orbit Fix** | `/app/fix` | `/app/fix`, `/fix` | [`docs/design/figma-screens/app_fix.png`](./figma-screens/app_fix.png) | Dual-column top: Error input with repository/runtime dropdowns + Dark terminal editor (`#11141B`); Analysis card with hypothesis pill. Bottom: Dark patch diff viewer container (`#11141B`) | Dropdowns for repo/runtime, error paste area, `Analyze error` button, patch review & apply controls | Rebuild top 2-card + bottom diff layout |
| **4** | **SafeChange** | `/app/safe-change` | `/app/safe-change`, `/safechange` | [`docs/design/figma-screens/app_safe-change.png`](./figma-screens/app_safe-change.png) | Proposed change card with repository selector and diff input; 3 evaluation cards (Affected modules, Contract & migration risks, Relevant test coverage) | Repo selector, diff textarea, `Analyze change` CTA, blast radius graph, risk score meters | Rebuild into 3-card risk analysis layout |
| **5** | **Orbit Recon** | `/app/recon` | `/app/recon`, `/recon` | [`docs/design/figma-screens/app_recon.png`](./figma-screens/app_recon.png) | URL ingest bar, design inspection viewport, extracted design token chips (Electric Violet, dark shell, surface container) | URL input, inspect button, live sandboxed preview, token export chips | Align white outer container and controls |
| **6** | **Orbit AI** | `/app/ai` | `/app/ai`, `/ai` | [`docs/design/figma-screens/app_ai.png`](./figma-screens/app_ai.png) | AI conversation canvas with code-grounded assistance, local Ollama model indicator, model probe selector, privacy badge | Model dropdown, conversation history, source context chip, code block renderer, prompt input | Match light canvas shell and clean input |
| **7** | **DSA Dashboard** | `/app/dsa` | `/app/dsa`, `/dsa` | [`docs/design/figma-screens/app_dsa.png`](./figma-screens/app_dsa.png) | 3 KPI cards (Total Solved, Revision Due, Active Platforms), Problem list card with search input, filter modal, export button | KPI cards, search bar, difficulty badges, cognitive solve mode filters, revision countdown | Match 3-metric header and light problem table |
| **8** | **Problem Tracker** | `/app/problems` | `/app/problems` | [`docs/design/figma-screens/app_problems.png`](./figma-screens/app_problems.png) | Full-width problem management table with search, category tabs (Striver SDE, Blind 75), solve status, cognitive mode indicator | `+ Add problem` button, search bar, topic filters, problem solve modal, import CSV/JSON trigger | Implement dedicated problems view |
| **9** | **Revision Schedule** | `/app/revisions` | `/app/revisions` | [`docs/design/figma-screens/app_revisions.png`](./figma-screens/app_revisions.png) | Spaced repetition timeline powered by SuperMemo SM-2 ($I = EF \times I_{prev}$), today's due queue, review history | Due problem cards, SM-2 difficulty rating buttons (0-5), review interval badges | Implement dedicated revisions schedule view |
| **10** | **Orbit Skills** | `/app/skills` | `/app/skills` | [`docs/design/figma-screens/app_skills.png`](./figma-screens/app_skills.png) | Evidence-backed skill radar and telemetry derived from verified GitHub commits, PRs, and solved algorithms | Skill category chips, confidence scores, evidence provenance drawer | Implement dedicated skills intelligence view |
| **11** | **Learning Progress** | `/app/learning` | `/app/learning` | [`docs/design/figma-screens/app_learning.png`](./figma-screens/app_learning.png) | Longitudinal learning velocity, concept mastery heatmap, platform breakdown (LeetCode, Codeforces, TUF) | Progress bars, platform breakdown chips, consistency streaks | Implement dedicated learning progress view |
| **12** | **Open Source Discover** | `/app/oss` | `/app/oss`, `/catalog` | [`docs/design/figma-screens/app_oss.png`](./figma-screens/app_oss.png) | 2-column layout: Filter panel (Language, Difficulty, Organization, Program, Last updated); Opportunity cards stream | Multi-select filters, opportunity cards, bookmark actions, pipeline launcher | Align 2-column discover layout |
| **13** | **Trending Repositories** | `/app/trending` | `/app/trending`, `/trending` | [`docs/design/figma-screens/app_trending.png`](./figma-screens/app_trending.png) | Ranked open-source repositories with real star counts, language chips, fork counts, and verified provenance badges | Language filters, star growth telemetry, GitHub links | Rebuild in Figma clean card stack |
| **14** | **Organizations** | `/app/organizations` | `/app/organizations`, `/gsoc` | [`docs/design/figma-screens/app_organizations.png`](./figma-screens/app_organizations.png) | 606 participating GSoC organizations directory with range pagination, technology pills, and program year filters | Search input, tech filter chips, range pagination (`Showing X-Y of 606`), org detail drawer | Align layout to Figma light container |
| **15** | **Issues & Pipeline** | `/app/issues` | `/app/issues`, `/issues` | [`docs/design/figma-screens/app_issues.png`](./figma-screens/app_issues.png) | Filterable issue feed with AI Match recommendation tab, difficulty badges, and "Add to Pipeline" actions | Recommendation score pill, repo badge, issue link, pipeline stage assigner | Align cards to Figma specification |
| **16** | **Bounties** | `/app/bounties` | `/app/bounties`, `/bounties` | [`docs/design/figma-screens/app_bounties.png`](./figma-screens/app_bounties.png) | Verified bounty board with currency amounts, difficulty tags, and direct solver links | Reward badges, difficulty pill, GitHub solver button | Align cards to Figma specification |
| **17** | **Contributions** | `/app/contributions` | `/app/contributions` | [`docs/design/figma-screens/app_contributions.png`](./figma-screens/app_contributions.png) | 6-stage Kanban board (`SHORTLISTED` → `EXPLORING` → `PREPARING` → `WORKING` → `PR_SUBMITTED` → `MERGED`) | Drag-and-drop / stage switcher, card status update modal | Implement dedicated Kanban pipeline view |
| **18** | **Workspaces** | `/app/workspaces` | `/app/workspaces`, `/workspaces` | [`docs/design/figma-screens/app_workspaces.png`](./figma-screens/app_workspaces.png) | Multi-tenant workspace switcher, member management list, role badges (Owner, Admin, Member), invite dialog | `Create Workspace` button, active workspace switcher, member invite modal | Align cards and modals to Figma specs |
| **19** | **Community Forum** | `/app/community` | `/app/community`, `/forum` | [`docs/design/figma-screens/app_community.png`](./figma-screens/app_community.png) | Discussion threads, upvoting counter badges, tag filters, thread modal | Upvote button, comment composer, tag selector | Align forum cards and typography |
| **20** | **Integration Center** | `/app/integrations` | `/app/integrations`, `/integrations` | [`docs/design/figma-screens/app_integrations.png`](./figma-screens/app_integrations.png) | Stack of integration cards: GitHub (OAuth), Codeforces (Username API), LeetCode (Extension / Import), TUF (Third-Party Source), Ollama (Local Service), DSA Sheets (Manual Import) | Search input, method filter dropdown, status badges (`CONNECTED` / `NOT CONNECTED`), `Setup guide` / `Connect` modals | Match Figma card stack and badges |
| **21** | **Orbit Pulse** | `/app/pulse` | `/app/pulse` | [`docs/design/figma-screens/app_pulse.png`](./figma-screens/app_pulse.png) | Live telemetry and health monitor: SQLite latency (1ms), memory usage, deadline tracking (< 72h notifications) | System status indicators, notification preferences, service latency graph | Implement dedicated Orbit Pulse telemetry screen |
| **22** | **Developer Profile** | `/app/profile` | `/app/profile`, `/profile` | [`docs/design/figma-screens/app_profile.png`](./figma-screens/app_profile.png) | User profile details, verified identity, bio, connected accounts summary, 365-day violet heatmap | Edit profile form, account linkage indicators, heatmap | Match Figma form layout and cards |
| **23** | **Settings** | `/app/settings` | `/app/settings`, `/settings` | [`docs/design/figma-screens/app_settings.png`](./figma-screens/app_settings.png) | 2-column layout: Sections menu (General, Account, Security, Privacy, Notifications, AI Settings, Data & Backups) + Section settings card | Appearance select, Language select, API keys management, Data backup & export | Align 2-column settings layout |
| **24** | **Documentation** | `/documentation` | `/documentation` | [`docs/design/figma-screens/documentation.png`](./figma-screens/documentation.png) | Comprehensive technical documentation with Getting Started, Integration Methods, Data Principles, Local AI, Privacy Controls | Section anchor navigation, syntax-highlighted code blocks, copy actions | Fully matches Figma documentation spec |
| **25** | **Login** | `/login` | `/login` | [`docs/design/figma-screens/login.png`](./figma-screens/login.png) | Clean light card with Electric Violet focus rings, email/username & password inputs, Quick Demo Sign-in buttons | Form validation, demo user selector, link to register | Fully matches Figma login spec |
| **26** | **Register** | `/register` | `/register` | [`docs/design/figma-screens/register.png`](./figma-screens/register.png) | Clean light card with username, email, and password inputs, role selector, terms link | Form validation, account creation handler, link to login | Fully matches Figma register spec |

---

## 3. Implementation Plan & Execution Trajectory

1. **Application Shell Refactor (`Sidebar.tsx`, `TopBar.tsx`, `App.tsx`):**
   - Update sidebar to include all categories (`OVERVIEW`, `DEVELOPMENT`, `LEARNING`, `OPEN SOURCE`, `COLLABORATION`, `SYSTEM`) and all 21 items.
   - Update top bar with breadcrumbs (`DEVORBIT / [SECTION]`), search workspace input, notification bell, and user avatar pill.
   - Update main content area to clean light slate (`bg-[#F9FAFB]`) with standard max width and padding.
2. **Module-by-Module Pages Alignment:**
   - Command Center (`DashboardPage.tsx` / `CommandCenterPage.tsx`): 4 KPI cards, Development overview card, Quick actions stack.
   - Development Pages: Codebase Navigator, Orbit Fix, SafeChange, Orbit Recon, Orbit AI.
   - Learning Pages: DSA Dashboard, Problems Tracker, Revisions Schedule, Skills, Learning Progress.
   - Open Source Pages: Discover, Trending, Organizations, Issues & Pipeline, Bounties, Contributions.
   - System & Settings Pages: Integration Center (6-card stack), Orbit Pulse, Settings (2-column layout), Profile.
3. **Route Aliasing:**
   - Support both `/app/...` paths and direct shortcuts (`/dashboard`, `/integrations`, etc.) to guarantee zero broken navigation.

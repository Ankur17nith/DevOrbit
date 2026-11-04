# Ossium Deep Reverse Engineering: Component Analysis

This document specifies the UI components, atomics, molecules, and layout structures observed in Ossium.

---

## 1. Component Taxonomy

### 1.1 Navigation & Chrome
- `Navbar`: 56px sticky top bar with blur backdrop (`#0E0F10/80`), brand logo, mega-menu trigger buttons, and user status indicator.
- `MegaMenuDropdown`: 3-column popover modal with custom dashed SVG borders, corner crosshair accents `+`, and grouped nav items.
- `SearchBar`: Pill-shaped input with search icon, placeholder text, and shortcut tag (`⌘K`).
- `FilterPillBar`: Horizontally scrollable row of rounded pills (`rounded-full px-3 py-1 text-xs font-medium`) for language and tag selection.

### 1.2 Data Display & Cards
- `RepoCard`:
  - Header: Owner avatar, repository name, external link, star counter with star icon.
  - Body: Repository description with line clamp (2 lines), primary language color dot, forks count, open issues count, last updated timestamp.
  - Footer: Topic tags (up to 4 visible, remaining in `+N more` pill), bookmark toggle action.
- `IssueCard`:
  - Header: Repository name badge, issue number `#123`, title (truncated), author avatar.
  - Badges: Difficulty badge (`Beginner` in green, `Intermediate` in amber), custom GitHub label pills with original GitHub hex colors.
  - Meta: Comments count, opened timestamp, unassigned indicator dot.
- `GSoCOrgCard`:
  - Logo: Centered organization square logo with rounded corners.
  - Info: Organization name, summary text.
  - Stats: Years active count badge, total GSoC projects count.
  - Tech Pills: Horizontal wrap list of tags (`c++`, `ros`, `python`, etc.).
- `BountyCard`:
  - Highlighted reward badge: E.g., `💰 $7,000 USD` or `💎 500 USDC`.
  - Issue title, repository name, difficulty indicator, expiration deadline countdown.
- `ContributorCard`:
  - Rank badge (`#1`, `#2`, etc.), avatar image, GitHub handle, total merged PRs, contribution score bar.

### 1.3 Forms & Inputs
- `TextInput`: Dark background (`#181819`), subtle border (`#242424`), focus ring with emerald glow (`#09AE5B`).
- `SelectDropdown`: Custom popover select for sort order and difficulty.
- `ToggleSwitch`: Minimalist iOS-style toggle for bot rules and notification settings.

### 1.4 Feedback & Modals
- `DetailSlideOver`: Right-side drawer sliding in from offscreen with backdrop overlay for viewing repo details without navigating away.
- `StatusBadge`: Rounded badge indicating healthy/active status.
- `EmptyState`: Clean icon, explanatory message, and action CTA (e.g. "No issues found matching your filters. Clear filters?").

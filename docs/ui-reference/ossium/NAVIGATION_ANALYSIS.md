# Ossium Deep Reverse Engineering: Navigation Analysis

---

## 1. Top Navbar Architecture

- **Fixed Navigation Bar**: Fixed at `top: 0`, height `h-14` (56px), background `#0E0F10/80` with CSS `backdrop-blur-sm`, z-index `z-50`.
- **Layout**: Centered container with max-width `1280px` (`max-w-[1280px] px-6 md:px-8 lg:px-12`).
- **Brand Element**: Left-aligned SVG/WebP logo linking to `/`.

---

## 2. Desktop Mega-Menus

The desktop header uses two primary dropdown triggers with animated chevron icons:
1. **Platform Trigger**:
   - Opens a 3-column structured mega-menu:
     - **Discover Column**: Top OSS (`/home`), Trending Repos (`/home/trending`), Find Issues (`/home/issues`), Web3 OSS (`/home/web3`), Curated Guide (`/home/curated-guide`), OSS Alternatives (`/home/oss-alternatives`), Selfhost Projects (`/home/selfhost-projects`).
     - **Programs Column**: GSoC Orgs (`/home/gsoc`), OSS Programs (`/home/oss-programs`), YC-OSS (`/home/yc-oss`), Eligibility (`/eligibility`), OSS Perks (`/oss-perks`).
     - **Product Tools Column**: Ossistant (`/chat`), GitHub Selfbot (`/home/bot`), Repo Analyzer (`/home/repo-analyzer`), Alert Rules (`/home/alerts`).
2. **Resources Trigger**:
   - Opens a 3-column structured mega-menu:
     - **Community Column**: Contributors (`/home/contributors`), Forum (`/home/forum`), Bounties (`/home/bounties`).
     - **Learn Column**: Resource Hub (`/home/resources`), Blog (`https://blog.ossium.in/`).
     - **Your Workspace Column**: Bookmarks (`/home/bookmarks`), Claim Project (`/home/claim`), Marketplace (`/home/marketplace`).

---

## 3. Visual Treatment & Corner Accents

Each mega-menu panel features distinctive architectural design treatments:
- **Dashed Borders**: Repeating linear gradient borders (`repeating-linear-gradient(90deg, #444 0 5px, transparent 5px 10px)`).
- **Corner Crosshairs**: Corner `+` glyphs placed at `top: 0, left: 0`, `top: 0, right: 0`, `bottom: 0, left: 0`, and `bottom: 0, right: 0` styled in `#0E0F10` pill with `text-neutral-400`.
- **Item Hover**: Background transitions to `hover:bg-white/[0.05]`, icon background scales slightly (`group-hover/item:scale-[1.03]`), subtitle shifts to `text-neutral-400`.

---

## 4. In-App Secondary Navigation

On dashboard pages (`/home/*`):
- Sticky sub-header filter bar containing:
  - Global Search Input with keyboard shortcut badge (`⌘K` / `Ctrl+K`).
  - Horizontal scrollable pill filters for programming languages (All, JavaScript, TypeScript, Python, Rust, Go, C++, Java, etc.).
  - Sort dropdown (Stars, Forks, Recently Updated, Best Match).
  - Time window toggles on Trending (Daily, Weekly, Monthly).

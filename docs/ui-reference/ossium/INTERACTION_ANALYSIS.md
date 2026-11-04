# Ossium Deep Reverse Engineering: Interaction Analysis

This document describes the key user interaction flows, keyboard navigation, transition states, and micro-interactions.

---

## 1. Filter & Search Interactions

- **Instant Filtering**:
  - Selecting a language or difficulty pill filters the dataset client-side when hydrated, or sends a debounced query param (`?lang=typescript&label=good-first-issue`) to the server.
  - Active pills display solid emerald/dark background (`bg-[#25262C] text-[#E5E5E5]`), while inactive pills display translucent border (`border-neutral-800 text-neutral-400 hover:text-white`).
- **Global Search (`⌘K`)**:
  - Pressing `Cmd+K` / `Ctrl+K` opens a search modal with immediate keyboard focus.
  - Arrow keys (`Up` / `Down`) navigate results; `Enter` opens the item.

---

## 2. Card Interactions

- **Hover States**:
  - Hovering on a repository or issue card activates a subtle border highlight (`border-neutral-700`) and lifts the card background (`#1F1F20`).
  - Action buttons (e.g. Bookmark, External GitHub Link) appear with crisp opacity transitions (`opacity-70 group-hover:opacity-100`).
- **Bookmark Toggle**:
  - Click on the bookmark icon immediately toggles its filled state locally (optimistic UI update) and syncs to backend.

---

## 3. Slide-Over Detail Drawer

- Clicking any repo or issue opens a slide-over panel on the right side of the screen (`w-full max-w-xl md:max-w-2xl`).
- The drawer includes tabbed views:
  1. **Overview**: Description, metrics, topics, commit chart.
  2. **README**: Rendered markdown of the repository's live README.
  3. **Contributing**: Direct excerpt of `CONTRIBUTING.md`.
  4. **Active Issues**: Top 5 beginner-friendly issues for immediate picking.
- Pressing `Escape` or clicking the backdrop dismisses the drawer without losing filter state.

---

## 4. Ossistant AI Interaction

- Accessible directly via `/chat` or floating trigger in bottom corner.
- Provides suggested quick prompts:
  - "Find beginner issues in Rust"
  - "Explain the repository architecture of X"
  - "How do I prepare a GSoC proposal for org Y?"
- Streaming response with syntax-highlighted code blocks, copy-to-clipboard buttons, and clickable file paths.

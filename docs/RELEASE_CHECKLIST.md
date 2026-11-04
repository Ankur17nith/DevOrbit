# DevOrbit — Release Gate & Verification Checklist

This checklist defines the mandatory gates that must pass before any version of DevOrbit is tagged or distributed.

---

## 1. Visual & UI/UX Conformance Gate

- [x] **Left-Side Navigation**: Primary navigation is docked vertically on the left; no crowded top horizontal bar.
- [x] **Sidebar Collapsibility**: Sidebar expands/collapses cleanly; state persists across route changes.
- [x] **Mobile Responsiveness**: On viewports ≤ 768px, navigation collapses into a slide-out drawer with zero horizontal overflow.
- [x] **Brand Color Compliance**: Strict adherence to Figma tokens (*Orbit Black* `#0B0D12`, *Electric Violet* `#8B5CF6`, *Soft White* `#F8FAFC`, *Signal Gray* `#686D79`).
- [x] **No Brand Bleed**: Zero lingering emerald green accents in buttons, badges, or card highlights.
- [x] **Zero Blank Cards**: All dashboard cards display verified live metrics or clear, actionable empty states with connect buttons.

---

## 2. Integrations Gate

- [x] **GitHub**:
  - Personal Access Token (PAT) input securely encrypts with AES-256-GCM.
  - OAuth flow initiates and exchanges code cleanly when configured.
  - Profile and 365-day commit calendar render accurately.
- [x] **Codeforces**:
  - Live query to public Codeforces REST API (`user.info`, `user.rating`, `user.status`).
  - Rating history, peak rating, and problem difficulty breakdowns display live stats without requiring secrets.
- [x] **LeetCode**:
  - GraphQL probe and JSON/CSV import normalizes problem counts across Easy, Medium, and Hard.
- [x] **Take U Forward**:
  - Tracks 455-problem Striver A2Z curriculum progress and step completion.
- [x] **Ollama Local AI**:
  - Enumerates downloaded models via `/api/tags`.
  - Transparent fallback notice when daemon is unreachable; zero simulated LLM responses.

---

## 3. Engineering & Testing Gate

- [x] **Type Safety**: `tsc` succeeds across both `apps/api` and `apps/web` with zero errors.
- [x] **Automated Tests**: 100% of integration test suites pass (`vitest run`).
  - Total tests: 69 / 69 passing.
- [x] **Production Build**: `npm run build` completes cleanly.
- [x] **Data Persistence**: SQLite database schema pushed cleanly via Prisma without data loss.
- [x] **Disaster Recovery**: JSON backup export and restore endpoints verified end-to-end.

---

## 4. Documentation Gate

- [x] **Master `README.md`**: Complete overhaul with product badges, screenshots, architecture diagram, setup commands, and security specs.
- [x] **Configuration**: `.env.example` documents every variable, purpose, and secret sensitivity.
- [x] **Guides**: All 11 companion guides in `docs/` created and reviewed.
- [x] **Final Acceptance Report**: `docs/release/M9_FINAL_ACCEPTANCE_REPORT.md` compiled with evidence and hashes.

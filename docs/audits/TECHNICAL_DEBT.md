# DevOrbit Technical Debt Register

**Evaluation Date:** 2026-11-05  
**Status:** Post-M9 Baseline Audit & Remediation Plan

---

## 1. Technical Debt Items & Remediation Status

### TD-01: Legacy Emerald `#09AE5B` Accent Bleed (Resolved in M9)
- **Problem**: Early M1 prototype used emerald green (`#09AE5B`) as primary brand accent.
- **Status**: **Resolved**. Converted to Electric Violet (`#8B5CF6`) brand tokens.

### TD-02: Missing Official Logo Assets in Navigation (Resolved in M9)
- **Problem**: UI header rendered generic Lucide icon instead of official SVG logos.
- **Status**: **Resolved**. Official vector assets in `logo/` integrated into navigation.

### TD-03: System Status Indicator Mock Data (Resolved in M9)
- **Problem**: Status bar used hardcoded CPU/RAM strings.
- **Status**: **Resolved**. `/api/v1/system/status` exposes real empirical Node.js telemetry.

### TD-04: Code Viewer & Editor Abstraction (Resolved in M9)
- **Problem**: Code snippets rendered without proper styling.
- **Status**: **Resolved**. Syntax-highlighted markdown code containers with copy action.

### TD-05: SQLite WAL Mode Pragma (Resolved in M9)
- **Problem**: Database locked during concurrent writes.
- **Status**: **Resolved**. WAL mode enabled for concurrent reads.

### TD-06: Automatic Demo Login in `AuthContext.tsx` (Critical — Slated for Phase 2)
- **Problem**: `AuthContext.tsx` silently auto-authenticates as `alex_developer` using hardcoded password `DevOrbit123!` if no token is stored, blocking unauthenticated users from seeing the public landing page.
- **Remediation**: Remove automatic login effect completely. Require explicit authentication or explicit demo mode toggle.

### TD-07: Unvalidated GitHub OAuth State & Missing CSRF Protection (Critical — Slated for Phase 6)
- **Problem**: OAuth `state` parameter is generated as a predictable timestamp string and is not validated in the callback endpoint.
- **Remediation**: Use high-entropy `crypto.randomBytes(32)` stored in memory/DB with 10-minute TTL and single-use validation.

### TD-08: LeetCode Silent Failure False Connection State (High Priority — Slated for Phase 7)
- **Problem**: `integrations.service.ts` catches GraphQL fetch failures and creates a connected credential with 0 statistics.
- **Remediation**: Return structured 400 errors when public lookup fails; only persist verified accounts or explicit CSV imports.

### TD-09: Missing Public Route Hierarchy (High Priority — Slated for Phase 3)
- **Problem**: No route separation between public website (`/`, `/documentation`, `/login`, `/register`) and authenticated app shell.
- **Remediation**: Implement client-side routing distinguishing public visitors from authenticated users.

### TD-10: Incomplete Tauri Desktop Crate (Medium Priority — Slated for Phase 10)
- **Problem**: `src-tauri/` contains only `tauri.conf.json`; `Cargo.toml` and Rust entrypoints are absent.
- **Remediation**: Complete Rust crate files or document explicit packaging requirements.

### TD-11: Missing Versioned Prisma Database Migrations (Medium Priority — Slated for Phase 10)
- **Problem**: Database schema pushed via `prisma db push` without migration tracking in `prisma/migrations`.
- **Remediation**: Generate baseline migration history using `prisma migrate dev --name init`.

### TD-12: Missing Frontend Test Coverage (Medium Priority — Slated for Phase 11)
- **Problem**: Automated tests cover only `apps/api` (69 tests). Frontend has zero unit or integration tests.
- **Remediation**: Introduce Vitest tests for React authentication, form validation, and routing.

---

## 2. Remediation Priority Schedule

| Phase | Target Items | Objective |
|---|---|---|
| **Phase 2** | TD-06 | Eliminate auto demo login, remove hardcoded passwords, harden session restoration. |
| **Phase 3** | TD-09 | Implement public website, landing page, `/login`, `/register`, `/documentation`. |
| **Phase 6** | TD-07 | Secure GitHub OAuth direct authorization with cryptographically random state. |
| **Phase 7** | TD-08 | Prevent false LeetCode connected states; enforce genuine verification. |
| **Phase 10** | TD-10, TD-11 | Versioned Prisma migrations and Tauri desktop crate completion. |
| **Phase 11** | TD-12 | Comprehensive frontend test suites for authentication and forms. |

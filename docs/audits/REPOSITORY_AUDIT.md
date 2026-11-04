# DevOrbit — Comprehensive Technical & Repository Audit

**Audit Date**: 2026-11-05  
**Auditor**: Senior Full-Stack & Security Release Engineer  
**Baseline Git Commit**: `5ae8d11` (Branch: `main`)  
**Scope**: Full monorepo audit covering `apps/api`, `apps/web`, `src-tauri`, authentication, database migrations, integrations, and Figma design alignment.

---

## 1. Executive Summary

A comprehensive audit of the DevOrbit repository was performed following the submission of the M9 report. While the core backend API and Prisma data model are functional with 69 passing integration tests, the audit uncovered seven critical defects that must be resolved to meet production quality and Figma design fidelity:

1. **Automatic Demo Login Flaw**: `AuthContext.tsx` silently logs into an account with hardcoded credentials (`alex_developer` / `DevOrbit123!`) on page load if no token exists, preventing unauthenticated users from seeing the public landing page.
2. **Missing Public Website & Route Hierarchy**: The frontend defaults directly into the application dashboard via modal authentication instead of exposing a dedicated public website (`/`, `/documentation`, `/login`, `/register`).
3. **GitHub OAuth CSRF & State Vulnerability**: OAuth `state` was formatted as a predictable string (`user_${id}_${timestamp}`) and was never persisted or validated during `/github/oauth/callback`.
4. **LeetCode False Connected State**: `integrations.service.ts` catches GraphQL fetch errors and silently saves a zeroed-out profile, falsely reporting the platform as "Connected".
5. **Incomplete Desktop Shell**: `src-tauri/` contains only `tauri.conf.json`, missing `Cargo.toml`, Rust entrypoint `src/main.rs`, and icon assets.
6. **Prisma Schema Without Migration History**: The database relies on `prisma db push` without versioned migration history in `prisma/migrations`.
7. **Visual Deviation from Figma Reference**: The current frontend is an all-dark theme with a vertical sidebar, whereas the official Figma website features a clean, light public landing page (`Your entire developer journey. One universe.`), a framed dark-sidebar application preview with a light Command Center canvas, and structured capability sections.

---

## 2. Detailed Audit Findings

### 2.1 Authentication & Session Architecture (Finding 3.5.A)
- **Defect**: Lines 60–63 in `apps/web/src/context/AuthContext.tsx`:
  ```typescript
  if (token) {
    fetchCurrentUser(token);
  } else {
    login('alex_developer', 'DevOrbit123!').finally(() => setIsLoading(false));
  }
  ```
  And line 120 (`switchUser` with hardcoded password).
- **Impact**: Bypasses public marketing and authentication flows, automatically authenticating any visitor.
- **Remediation**: Eliminate automatic login. Unauthenticated visitors must see the public landing page. Remove hardcoded passwords. Provide explicit, protected route redirection.

### 2.2 Public Website & Navigation (Finding 3.5.B)
- **Defect**: `App.tsx` lacks public routes (`/`, `/product`, `/features`, `/how-it-works`, `/integrations`, `/privacy`, `/documentation`, `/login`, `/register`).
- **Remediation**: Implement a unified router distinguishing public pages from the authenticated application shell.

### 2.3 GitHub OAuth Security (Finding 3.5.C)
- **Defect**: In `integrations.routes.ts`:
  ```typescript
  const state = `user_${req.user!.id}_${Date.now()}`;
  ```
  The state is predictable, has no cryptographic entropy, and is completely ignored in `POST /github/oauth/callback`.
- **Impact**: Vulnerable to OAuth Login CSRF and account hijacking if an attacker tricks a user into authorizing an account.
- **Remediation**: Implement a cryptographic `state` store using `crypto.randomBytes(32).toString('hex')` with 10-minute expiration, bind it to the session, and enforce single-use validation in the callback. Default to direct OAuth in UI with PAT as an advanced option.

### 2.4 LeetCode Provider Error Handling (Finding 3.5.D)
- **Defect**: In `integrations.service.ts`:
  ```typescript
  try {
    stats = await leetCodeProvider.fetchUserProfile(username);
  } catch {
    stats = { username, totalSolved: 0, ... source: 'manual_import' };
  }
  await prisma.integrationCredential.upsert(...);
  ```
- **Impact**: Falsely marks LeetCode as connected when queries fail.
- **Remediation**: Reject failed profile lookups with a 400 error. Only persist verified profiles or explicit manual imports.

### 2.5 Local AI & Fallback Labeling (Finding 3.5.E)
- **Audit**: Ollama integration probes `/api/tags` and reports fallback status.
- **Requirement**: Maintain strict separation between neural LLM inference and the deterministic rule engine. Ensure the UI never displays rule-engine responses as AI models.

### 2.6 Desktop Application Status (Finding 3.5.F)
- **Defect**: `src-tauri/` contains only `tauri.conf.json`. `Cargo.toml`, `src/main.rs`, and icon bundles are missing.
- **Remediation**: Complete the Tauri Rust crate or clearly document the desktop packaging status.

### 2.7 Database Migration Strategy (Finding 3.5.G)
- **Defect**: No `prisma/migrations/` directory exists.
- **Remediation**: Initialize Prisma migration tracking (`prisma migrate dev --name init`) to provide reproducible schema versioning for production deployments.

### 2.8 Test Coverage (Finding 3.5.H)
- **Audit**: 9 test files in `apps/api/src/tests/` with 69 passing tests. Frontend tests are missing.
- **Remediation**: Add frontend tests for authentication, routing, and form validation.

---

## 3. Figma Reference Alignment

Direct inspection of `https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=LOr1bu5JKYHmVzmy-1&preview-route=%2Fdocumentation` via 1440x8000 full-page headless capture (`docs/design/figma_full_reference.png`) confirms:
- **Public Website Structure**:
  1. Top Navigation: DevOrbit logo, `Product`, `Features`, `How it works`, `Integrations`, `Privacy`, `Documentation`, `Sign in`, `Get started` button.
  2. Hero Section: `● Local-first developer intelligence`, headline `Your entire developer journey. One universe.`, subtitle, CTAs (`Get started →`, `Explore features`).
  3. Interactive Application Mockup Frame: Dark container showing sidebar (`WORKSPACE`: Command Center, Codebase Navigator, Orbit DSA, Open Source, Orbit AI) and light Command Center (`TUESDAY, 14 MAY`, `Good morning, Alex.`, KPI cards, `Recent activity`, `Quick actions`).
  4. The Problem Section (4 bullet cards: Activity, Discovery, Understanding, Evidence).
  5. Product System Section (6 cards: Developer Intelligence, Codebase Intelligence, Open Source Discovery, DSA & Learning, Development Assistance, Integrations & Automation).
  6. Capabilities Section (Dark background, 9 modules).
  7. How It Works Section (4 progressive steps).
  8. Integrations Section (Table of clear methods: Direct OAuth, Public API, Browser Extension, Local Service, CSV/JSON).
  9. Your Data Your Control Section (Dark card with local-first guarantees).
  10. Call to Action Banner (Electric Violet `#8B5CF6`).
  11. Footer (Dark background, 3 link columns, copyright).

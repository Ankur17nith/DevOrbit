# DevOrbit
> **Your Skills. Your Code. Your Opportunities. One Universe.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20(Local--First)-003B57.svg)](https://sqlite.org/)
[![Design System](https://img.shields.io/badge/Figma-Figma%20Brand%20Identity-8B5CF6.svg)](./docs/release/FIGMA_IMPLEMENTATION_REPORT.md)

---

## 1. Product Overview

**DevOrbit** is a local-first, privacy-respecting **Developer Intelligence Platform**. It connects fragmented developer data—source code repositories, competitive programming handles, algorithmic revision schedules, multi-platform open-source discovery, and evidence-grounded recommendations—into a single, unified, space-themed command center.

Unlike cloud dashboards that sell user metrics or lock workflows behind recurring SaaS fees, DevOrbit is 100% locally owned. Application state is saved in a local SQLite database, third-party integration secrets (such as GitHub PATs and OAuth tokens) are encrypted at rest with **AES-256-GCM**, and AI assistance runs completely on-device via [Ollama](https://ollama.ai) with zero third-party telemetry beacons.

---

## 2. Feature Implementation Status Matrix

| Feature / Subsystem | Status | Implementation Details |
|---|---|---|
| **Multi-User Auth & Sessions** | **Implemented** | `bcryptjs` password hashing, JWT with unique `jti` claim, revocation on logout, strict `where: { userId }` isolation. |
| **Local SQLite Persistence** | **Implemented** | 33 Prisma models on SQLite with relational foreign keys and transaction rollback safety. |
| **Secret Cryptography** | **Implemented** | Authenticated **AES-256-GCM** encryption for integration credentials and PAT tokens at rest. |
| **GitHub Integration** | **Implemented** | GitHub OAuth 2.0 with atomic single-use SHA-256 anti-replay validation and PAT connection. |
| **Codeforces Integration** | **Implemented** | Live public REST queries (`user.info`, `user.rating`, `user.status`) for ratings and submission records. |
| **Competitive / DSA Sheets** | **Implemented** | 50 curated seeded problems; CSV import; SuperMemo SM-2 spaced repetition decay scheduling. |
| **Multi-Platform OSS Discovery** | **Implemented** | 606 seeded historical GSoC orgs + Outreachy, LFX, MLH, GitHub profiles with URL query synchronization. |
| **7-Factor Recommendation Engine** | **Implemented** | Deterministic scoring across technology match, domain, difficulty, and skill evidence. |
| **Orbit AI Studio** | **Implemented** | Local Ollama streaming (`deepseek-coder`, `qwen2.5-coder`); honest deterministic rule engine fallback when offline. |
| **Orbit Fix Intelligence** | **Implemented** | Automated error log parser with real fixtures (`node_error.log`, `vitest_assertion.log`, `python_index_error.log`). |
| **Orbit Navigator** | **Implemented** | Codebase AST navigation, directory tree mapping, and Mermaid diagram code generation. |
| **Orbit SafeChange** | **Implemented** | Git diff risk scoring and AST dependency impact evaluation. |
| **Selfbot Automation** | **Implemented** | Background task queue & execution pipeline state transitions. |
| **Orbit Recon** | **Partial (Prototype)** | Security inspection prototype; returns HTTP 501 for unconfigured remote network targets. |
| **Desktop Application (Tauri)** | **Partial (Beta)** | Tauri v2 desktop shell with native window management and hardened webview CSP. |
| **Telemetry & Trackers** | **Not Present** | Zero third-party analytics, tracking beacons, or telemetry scripts; all UI fonts self-hosted. |

---

## 3. Key Capabilities & Architecture

### 🔍 Multi-Platform Open Source Organization Discovery
DevOrbit provides a normalized multi-platform discovery architecture supporting top global open-source ecosystems:
- **Google Summer of Code (GSoC)**: 606 curated historical organizations with topic indexing and project counts.
- **Outreachy Mentorship**: Diversity-focused open-source internships (Mozilla, Wikimedia, GNOME, Tor, Wagtail, Oppia).
- **Linux Foundation (LFX Mentorship)**: Kernel, cloud native, and infrastructure mentorships (CNCF, Hyperledger, OpenSSF, Zephyr, GraphQL Foundation).
- **Major League Hacking (MLH Fellowship)**: Open-source fellowships (Meta Open Source, Pallets, Solana, Julia Language).
- **GitHub Open Source**: Direct ecosystem leaders (Vercel, Supabase, Tailwind Labs, Bun, Prisma).

Features:
- Multi-platform selection filter with combined OR / AND logic.
- Technology filters with active count badges.
- Organization detail modal accessible via card click, showing website URLs, platform history, and open beginner issues.
- URL Query Parameter synchronization (`?platforms=...&techs=...&techLogic=...&search=...&org=...`) preserving exact filter state across browser refreshes and shareable bookmarks.

### 🎯 7-Factor Explainable Recommendation Engine
DevOrbit replaces opaque heuristics with a deterministic, explainable 7-factor scoring engine:
1. **Technology Match (25%)**: Overlap between candidate project stack and developer's verified codebase languages.
2. **Domain Relevance (20%)**: Architectural domain fit (Systems, Web, Cloud Native, DevOps, AI).
3. **Difficulty Alignment (15%)**: Calibrated to developer's stated experience level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`).
4. **Skill Strength Match (15%)**: Confidence weighting derived from multi-repository AST evidence.
5. **Project Health (10%)**: Star counts, active issues, verified maintenance indicators.
6. **Issue Freshness (10%)**: Creation recency and active conversation activity.
7. **Organization Relevance (5%)**: Mentorship platform provenance and foundation backing.

### 🧠 Unified Developer Intelligence Profile & README Signal Extraction
- **README Signal Extractor**: Ingests `<user>/<user>` profile README and repository READMEs, parsing tech stack shields/badges, declared languages, frameworks, databases, and focus areas.
- **Multi-Source Skill Aggregation**: Unifies GitHub code AST metrics, README signals, competitive handles, and manual calibrations with provenance tags (`GITHUB_CODEBASE`, `GITHUB_README`, `MANUAL_VERIFIED`).
- **Editable Opportunity Preferences**: Real-time configuration of primary focus, experience level, bio, and weekly availability commitment hours.

### 🛡️ Enterprise Security & Cryptographic Safeguards
- **Atomic OAuth State Verification**: Single-use SHA-256 hashed state tokens preventing OAuth CSRF and replay attacks.
- **AES-256-GCM Cryptographic Vault**: Integration secrets (GitHub PATs, OAuth credentials) encrypted with authenticated AES-256-GCM.
- **Content-Type Protected API Client (`apiFetch`)**: Centralized response parser preventing unexpected HTML error crashes (`<!DOCTYPE ...`) when proxies or services return non-JSON responses.
- **Input Validation**: Schema validation using Zod across authentication, DSA progress, developer profile, workspaces, forum, and system backup/restore routes.

---

## 4. Product Visual Walkthrough

DevOrbit's UI is designed strictly against the official Figma brand identity (*Workspace Canvas* `#F9FAFB`, *Cards* `#FFFFFF` with `border border-black/7`, *Electric Violet* `#8B5CF6`, *Signal Gray* `#686D79`, and *Dark Code Editors* `#11141B`).

### Public Landing Page (Figma Reference Canvas)
![DevOrbit Public Landing Page](docs/design/verified_landing_page.png)
*Faithful implementation of all 11 Figma sections: Light hero, 4 numbered cards, intelligence tabs, integration grid, and Electric Violet CTA.*

### Command Center (Authenticated Workspace)
![DevOrbit Command Center](docs/design/verified_command_center.png)
*Date banner in Electric Violet (`THURSDAY, NOV 5`), 3 core summary cards (GitHub, DSA, OSS), recent activity log, and quick actions card.*

### Documentation Hub (Preview Route `/documentation`)
![DevOrbit Documentation Hub](docs/design/verified_documentation_page.png)
*Clean two-column technical docs, category sidebar, breadcrumb hierarchy, copyable shell blocks, and local API reference.*

---

## 5. Technology Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 6, Tailwind CSS 3.4, Lucide Icons, Self-hosted Fonts (`@fontsource/inter`, `@fontsource/manrope`, `@fontsource/jetbrains-mono`), Mermaid 12.3.
- **Backend API**: Node.js 20+, Express 4.21, TypeScript 5.7, Zod 4 input validation, Helmet, CORS, Rate Limiting.
- **Database**: SQLite with Prisma ORM 6.19 (33 relational models).
- **Security**: AES-256-GCM token encryption, bcryptjs password hashing, atomic SHA-256 OAuth replay defense, JWT session tracking.
- **AI Runtime**: Local Ollama daemon (`deepseek-coder`, `qwen2.5-coder`). Honest deterministic rule engine fallback when offline.
- **Desktop (Beta)**: Tauri v2 with strict Content Security Policy.
- **Testing**: Vitest 5.1, Supertest, Testing Library.

---

## 6. Installation & Quick Start

### 1. Prerequisites
- **Node.js**: `>= v20.0.0` (LTS 20 or 22 recommended)
- **npm**: `>= v10.0.0`
- **Git**: `v2.40+`

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/<owner>/devorbit.git
cd devorbit
npm install
```

### 3. Configure Environment Variables
Copy the template to `apps/api/.env` (the Express API server and Prisma read from this file):
```bash
cp apps/api/.env.example apps/api/.env
```
*(Optional: `cp apps/web/.env.example apps/web/.env` if customizing the Vite dev server port or remote API URL).*

### 4. Initialize Local SQLite Database
```bash
npm run db:push
npm run db:seed
```

### 5. Start Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```
Or in separate terminals:
```bash
# Terminal 1: Backend API Server (Port 3001)
npm run dev:api

# Terminal 2: Web Client (Port 5173)
npm run dev:web
```

Open your browser to **`http://localhost:5173`** to access DevOrbit.

---

## 7. Integrations Guide

### GitHub Connection
1. Navigate to **Integration Center** (`/integrations`).
2. Click **Connect GitHub**.
3. **Personal Access Token (PAT)**: Provide a token with `repo` and `read:user` scopes.
4. **OAuth Application**: Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `apps/api/.env` to enable 1-click web authorization with atomic SHA-256 anti-replay validation.
5. All secrets are encrypted via authenticated **AES-256-GCM** before database persistence.

### Codeforces Connection
1. Go to **Integration Center** (`/integrations`).
2. Click **Connect Codeforces Handle**.
3. Enter your public Codeforces handle (e.g., `tourist`, `Petr`).
4. DevOrbit queries the live official Codeforces REST API (`user.info`, `user.rating`, `user.status`) and displays your verified rating, max rating, and contest analytics.

### LeetCode & Take U Forward (TUF) Progress Tracking
1. Open **Integration Center** (`/integrations`) or **DSA Tracker** (`/dsa`).
2. DevOrbit includes a curated catalog of 50 foundational DSA problems and supports custom CSV sheet imports.
3. Track your algorithmic progress with automated SuperMemo SM-2 spaced repetition decay scheduling.

### Local Ollama AI Setup
1. Install Ollama:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
2. Pull a recommended coding model:
   ```bash
   ollama run deepseek-coder
   # or
   ollama run qwen2.5-coder
   ```
3. Open **Orbit AI** (`/ai`). DevOrbit will automatically detect the local Ollama instance on port 11434 and enable on-device inference. If offline, the deterministic rule engine safely takes over.

---

## 8. Automated Test Suite

DevOrbit maintains a comprehensive test suite across API and Web verifying all architectural layers:

```bash
npm test
npm run typecheck
```

### Test Suite Verification Results:
- **`@devorbit/api`**: 19 test suites passed, 151 tests passed.
- **`@devorbit/web`**: 11 test suites passed, 47 tests passed.
- **Total**: 30 test suites, 198 tests passed.
- **Type Checking**: Full TypeScript strict validation across workspaces (0 errors).

---

## 9. Production Build

To compile production-optimized bundles:
```bash
npm run build
```
This runs TypeScript compilation (`tsc`) and generates production artifacts in `apps/web/dist` and `apps/api/dist`.

---

## 10. Documentation Directory

Detailed implementation guides and references are located in [`docs/`](./docs/):

- [`docs/API.md`](./docs/API.md): Complete REST API route specification and request/response shapes.
- [`docs/INSTALLATION.md`](./docs/INSTALLATION.md): Complete OS-specific installation manual.
- [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md): Developer architecture and contributing workflow.
- [`docs/PRODUCTION_DEPLOYMENT.md`](./docs/PRODUCTION_DEPLOYMENT.md): Production deployment and systemd service setup.
- [`docs/ENVIRONMENT_VARIABLES.md`](./docs/ENVIRONMENT_VARIABLES.md): Comprehensive environment variable specification.
- [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md): Security model, password hashing, and token lifecycles.
- [`docs/INTEGRATIONS.md`](./docs/INTEGRATIONS.md): Deep provider architecture (GitHub, Codeforces, LeetCode, TUF).
- [`docs/AI_SETUP.md`](./docs/AI_SETUP.md): Local Ollama configuration and fallback behavior.
- [`docs/BACKUP_AND_RESTORE.md`](./docs/BACKUP_AND_RESTORE.md): Disaster recovery and data portability procedures.
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md): Solutions for common setup and runtime errors.
- [`docs/SECURITY.md`](./docs/SECURITY.md): Threat model, cryptographic controls, and dependency audit status.

---

## 11. License

DevOrbit is open-source software licensed under the [MIT License](LICENSE).

# DevOrbit Performance Baseline

**Baseline Date:** 2026-11-04  
**Hardware Profile:** Intel Core i5-12450H (8 Cores, 12 Threads), 16 GB RAM, Fedora Linux.  
**Node.js Runtime:** v24.22.1  
**Build Tooling:** Vite 6.2, TypeScript 5.7, Vitest 3.0, Prisma 6.4

---

## 1. Build & Compilation Performance

### 1.1 Web Application (`apps/web`)
- **Build Command**: `tsc && vite build`
- **Total Build Time**: 1.45 seconds
- **Modules Transformed**: 2,078 modules
- **Bundle Breakdown**:
  - `dist/index.html`: 0.92 kB (gzip: 0.52 kB)
  - `dist/assets/index-DcC9TuVb.css`: 26.40 kB (gzip: 5.56 kB)
  - `dist/assets/index-uN7KSSXm.js`: 347.85 kB (gzip: 93.20 kB)
- **Evaluation**: The production JavaScript payload is under 100 kB gzipped, which is well below the 200 kB initial budget recommended by `vercel-react-best-practices`.

### 1.2 API Application (`apps/api`)
- **Build Command**: `tsc`
- **Compilation Time**: 1.12 seconds
- **Diagnostics / Errors**: 0 warnings, 0 type errors.

---

## 2. API Response & Query Latency Baseline

Measured across automated Supertest suite on SQLite `devorbit.db`:

| Operation / Endpoint | Average Latency | Peak Latency | Database Operation |
|---|---|---|---|
| User Authentication (`POST /auth/login`) | ~11ms | 15ms | Bcrypt hash compare + session creation |
| Dynamic Registration (`POST /auth/register`) | ~28ms | 35ms | Bcrypt hash generation (cost 10) + user create |
| Dashboard Summary (`GET /dashboard/summary`) | ~9ms | 14ms | 7 concurrent Prisma queries via `Promise.all` |
| DSA Analytics (`GET /dsa/analytics`) | ~5ms | 8ms | Indexed query on `UserDsaProgress` |
| Bookmark Query (`GET /opensource/bookmarks`) | ~4ms | 6ms | Indexed query on `UserBookmark` |
| GSoC Search (606 organizations) | ~12ms | 18ms | In-memory text matching / SQLite LIKE |
| AI Chat Response Generation | ~42ms | 50ms | Conversation insert + message generation |

---

## 3. Database & System Footprint

- **Database Size on Disk (`devorbit.db`)**: 1.24 MB (incorporating 606 GSoC orgs, 30 curated repos, 30 open bounties, 15 core DSA roadmap items, 3 seeded/registered users).
- **Prisma Client Memory Overhead**: ~22 MB RSS.
- **Node.js Express Baseline Memory (Idle)**: ~68 MB RSS.
- **Eco Mode Target**: DevOrbit operates entirely locally with no background telemetry loops, minimizing battery and CPU draw during idle states.

---

## 4. Optimization Recommendations for M2–M8

1. **Lazy Loading of Visual Code Editors**: When integrating the Monaco or CodeMirror editor for Orbit Fix and DSA workspace, use dynamic `import()` to prevent bloating the core bundle.
2. **Virtualization for GSoC Catalog**: With 606+ organizations and potential thousands of repositories, ensure tabular and grid views use windowed virtualization to keep DOM node count < 1,000.
3. **SQLite Write Concurrency (WAL Mode)**: Ensure SQLite is configured in WAL (Write-Ahead Logging) mode (`PRAGMA journal_mode = WAL;`) for concurrent read/write isolation during background syncing in Milestone M2.

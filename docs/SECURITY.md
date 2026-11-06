# DevOrbit — Security Model & Cryptographic Specification

This document details DevOrbit's threat model, defensive controls, cryptographic algorithms, known limitations, and dependency audit status.

---

## 1. Threat Model & Security Posture

DevOrbit is designed under a **Local-First, Zero-Trust Architecture**:

- **Threat 1: Cloud Telemetry & Data Exfiltration**
  - *Mitigation*: DevOrbit contains zero third-party analytics, tracking beacons, or surveillance telemetry scripts. No developer source code, conversation prompts, or algorithmic history leaves the local environment.
  - *Scope of External Calls*: External network requests are initiated strictly when the user explicitly interacts with connected external platforms: GitHub API (OAuth/PAT synchronization), Codeforces public REST API (rating/submission queries), and local/network Ollama hosts. All application fonts are self-hosted locally without CDN calls.
- **Threat 2: Credential Theft at Rest**
  - *Mitigation*: Sensitive third-party integration credentials (e.g., GitHub Personal Access Tokens and OAuth access tokens) are encrypted before persistence in the local SQLite database using **AES-256-GCM** with authenticated checksums.
  - *Limitation*: The underlying SQLite database file itself is unencrypted standard SQLite. Developers requiring full database encryption at rest should run DevOrbit on an OS volume protected by LUKS, BitLocker, or FileVault.
- **Threat 3: Cross-Account Data Contamination (IDOR)**
  - *Mitigation*: User-owned resources (workspaces, progress tracking, personal integration credentials, developer profiles, AI conversations, bookmarks) strictly enforce ownership checks (`where: { id: resourceId, userId: req.user.id }`).
  - *Public Resources*: Public open-source catalog items, GSoC organizations, and community forum listings are globally visible and read-only to unauthenticated clients.
- **Threat 4: Session Hijacking & Replay Attacks**
  - *Mitigation*: Authentication JWTs contain unique UUIDv4 `jti` claims and are validated against active database sessions. Logging out immediately destroys the session record in SQLite, revoking the token.

---

## 2. Cryptographic Implementations

| Subsystem | Algorithm / Primitive | Library | Parameters |
|---|---|---|---|
| **Password Storage** | `bcrypt` (adaptive key stretching) | `bcryptjs` | Salt rounds: 10, per-user cryptographic salt |
| **Token Encryption** | `aes-256-gcm` (Authenticated Cipher) | Node.js `crypto` | Key: 256-bit derived, IV: 12-byte random, Tag: 16-byte GCM |
| **OAuth Anti-Replay** | `SHA-256` (Single-Use Hash) | Node.js `crypto` | 32-byte cryptographic random state, 10m TTL, atomic consumption |
| **Session Signing** | `HMAC-SHA256` | `jsonwebtoken` | Secret: high-entropy string, UUIDv4 `jti` claim |
| **Token Identifiers** | `UUIDv4` | `crypto` | RFC 4122 cryptographic random |

---

## 3. Network & Transport Security

- **HTTP Security Headers**: The API server is protected by `helmet()` middleware:
  - `X-Frame-Options: SAMEORIGIN`: Protects against clickjacking attacks.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing exploits.
  - `Strict-Transport-Security`: Enforces secure transport in production.
  - `Content-Security-Policy`: Pure REST API endpoints disable HTML CSP in Express (`contentSecurityPolicy: false`); the Tauri desktop webview enforces a strict CSP in `src-tauri/tauri.conf.json`.
- **CORS Protection**: Access is restricted strictly to the configured `CORS_ORIGIN` (default: `http://localhost:5173`). Wildcard `*` origins are blocked in authenticated routes.
- **Rate Limiting**: In-memory rate limiting shields authentication and AI inference endpoints against brute-force or flooding abuse.
- **Input Validation**: Request bodies and parameters are validated with **Zod** across authentication, DSA progress, profile updates, workspace management, and system backup/restore routes.

---

## 4. Known Limitations & Security Trade-offs

1. **Unencrypted SQLite Database**: Non-secret application data (problems solved, notes, organization bookmarks) is stored in standard plaintext SQLite format. Secrets are individually encrypted with AES-256-GCM.
2. **Access Control Model**: DevOrbit implements user-isolated multi-tenancy (`userId` ownership), not an enterprise Role-Based Access Control (RBAC) permissions matrix.
3. **Local Network AI**: When connecting to Ollama, the API communicates over local HTTP (`http://127.0.0.1:11434`). This assumes a trusted local host boundary.

---

## 5. Dependency Audit Status & Known Transitive Advisories

Dependency vulnerabilities are audited with `npm audit`. Resolved and known advisories:

- **Resolved (Commit 9):**
  - `tinypool <= 2.1.1` (GHSA-5gmw-xhrv-c9v3 / GHSA-85c8-ppgw-ccpr — Prototype Pollution / RCE): Resolved by upgrading `vitest` to `^5.1.0`.
  - `katex <= 0.18.1` (GHSA-238p-pmpm-9mq7 — Prototype Pollution): Resolved by upgrading `mermaid` to `^12.3.0`.
  - `zod < 4.6.6` (GHSA-mrhx-c7xc-m3w5 — Uncontrolled Resource Consumption): Resolved by upgrading `zod` to `^4.6.7`.

- **Known Unfixable Upstream Transitive Advisories:**
  - `deepmerge-ts < 8.0.0` (GHSA-ggr8-5vv4-36mx — Stack Exhaustion in recursive object merge):
    - Path: `prisma` (devDependencies) -> `@prisma/config` -> `deepmerge-ts`.
    - Risk Assessment: Build/dev-time tool only. Not included in production runtime bundles or exposed to untrusted external input. Prisma reads local `prisma/schema.prisma` without untrusted runtime schema merging.
    - Upstream status: Fixing requires migrating to Prisma 7.10+ / breaking architectural changes, planned for next major release cycle.

---

## 6. Reporting Security Vulnerabilities

To report a vulnerability or cryptographic defect, please open a private security advisory on the GitHub repository or contact the maintainers directly.

# DevOrbit — Security Model & Cryptographic Specification

This document details DevOrbit's threat model, defensive controls, cryptographic algorithms, and secret handling policies.

---

## 1. Threat Model & Security Posture

DevOrbit is designed under a **Local-First, Zero-Trust Architecture**:
- **Threat 1: Cloud Telemetry & Data Exfiltration**
  - *Mitigation*: DevOrbit contains zero analytics, tracking beacons, or third-party telemetry scripts. No developer source code, conversation prompt, or algorithmic history leaves the local environment.
- **Threat 2: Credential Theft at Rest**
  - *Mitigation*: Third-party integration credentials (e.g., GitHub Personal Access Tokens and OAuth access tokens) are encrypted in the local SQLite database using **AES-256-GCM** before persistence.
- **Threat 3: Cross-Account Data Contamination (IDOR)**
  - *Mitigation*: Multi-user accounts are strictly isolated by relational database ownership constraints. All mutation and query routes enforce `where: { id: resourceId, userId: req.user.id }`.
- **Threat 4: Session Hijacking & Replay Attacks**
  - *Mitigation*: Authentication JWTs contain unique UUIDv4 `jti` claims, are cryptographically verified on every request, and expire after 7 days.

---

## 2. Cryptographic Implementations

| Subsystem | Algorithm / Primitive | Library | Parameters |
|---|---|---|---|
| **Password Storage** | `bcrypt` (adaptive key stretching) | `bcryptjs` | Salt rounds: 10, per-user cryptographic salt |
| **Token Encryption** | `aes-256-gcm` (Authenticated Cipher) | Node.js `crypto` | Key: 256-bit derived, IV: 12-byte random, Tag: 16-byte GCM |
| **OAuth Anti-Replay** | `SHA-256` (Single-Use Hash) | Node.js `crypto` | 32-byte cryptographic random state, 10m TTL |
| **Session Signing** | `HMAC-SHA256` | `jsonwebtoken` | Secret: high-entropy string, UUIDv4 `jti` claim |
| **Token Identifiers** | `UUIDv4` | `uuid` | RFC 4122 cryptographic random |

---

## 3. Network & Transport Security

- **Helmet Security Headers**: The API server is shielded by `helmet()` middleware:
  - `Content-Security-Policy`: Enforces trusted script/style boundaries.
  - `X-Frame-Options: SAMEORIGIN`: Protects against clickjacking attacks.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing exploits.
- **CORS Protection**: Access is restricted strictly to the configured `CORS_ORIGIN` (default: `http://localhost:5173`). Wildcard `*` origins are blocked in authenticated routes.

---

## 4. Reporting Security Vulnerabilities

To report a vulnerability or cryptographic defect, please open a private advisory on the repository or contact the lead maintainers directly.

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


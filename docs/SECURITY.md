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

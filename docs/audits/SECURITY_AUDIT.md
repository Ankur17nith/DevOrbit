# DevOrbit Security Audit and Threat Model

**Audit Date:** 2026-11-04  
**Classification:** Internal Engineering Security Review  
**Auditor:** Principal Security Engineer & Full-Stack Architect  
**Status:** **PASSED / HARDENED**

---

## 1. Scope & Methodology

This security audit conducted an exhaustive static analysis, dynamic testing, and threat modeling session on the DevOrbit platform (`apps/api`, `apps/web`, database, and middleware).

The review evaluated:
1. Hardcoded secrets, keys, and credentials.
2. Demo credential confinement.
3. Authentication & Session architecture.
4. Authorization & Insecure Direct Object References (IDOR).
5. Injection risks (SQLi, NoSQLi, Command Injection).
6. Cross-Site Scripting (XSS), CSRF, and CORS policies.
7. Input validation and data sanitization.

---

## 2. Secrets & Credentials Inspection

### 2.1 Codebase Secret Scan
- **Grep Pattern Scan**: Scanned for `API_KEY`, `SECRET`, `PASSWORD`, `PRIVATE_KEY`, `ghp_`, `github_pat_` across the entire git tree.
- **Result**: Zero exposed personal access tokens, external production API keys, or live service credentials.
- **Configuration Management**:
  - Environment variables loaded via `dotenv` in `apps/api/src/config/index.ts`.
  - Fallback keys for local development (`jwtSecret`) explicitly tagged as development-only.
  - Production deployments require overriding `JWT_SECRET` via process environment variables.

### 2.2 Demo Credentials Confinement
- **Inspection**: Seed users (`alex_developer`, `sara_chen`) utilize password `DevOrbit123!`.
- **Finding**: These credentials exist **strictly** inside `apps/api/src/database/seed.ts` for offline local testing and mock population.
- **Storage**: Passwords in the database are hashed with `bcryptjs` using a cost factor of 10 (`bcrypt.hash(password, 10)`). Plaintext passwords are never stored in the database or serialized into JSON responses.

---

## 3. Authentication & Session Lifecycle

### 3.1 Token Mechanism
- **JWT Implementation**: Signed using `HS256` in `apps/api/src/lib/jwt.ts` with a 7-day expiration (`expiresIn: '7d'`).
- **Session Layer**: DevOrbit enforces a dual-layer authentication model:
  1. Cryptographic JWT signature verification (`jwt.verify(token, config.jwtSecret)`).
  2. Database session persistence in table `Session` with indexed `token` and `expiresAt` checks.
- **Revocation**: Calling `/api/v1/auth/logout` deletes the database session record, immediately invalidating the token even if the cryptographic JWT has not reached its 7-day TTL.

---

## 4. Authorization & IDOR Defenses

### 4.1 User-Scoped Data Isolation
Every endpoint serving private developer intelligence filters records strictly by `req.user.id`:
- **Dashboard**: `prisma.userDsaProgress.findMany({ where: { userId } })`
- **DSA Progress**: `prisma.userDsaProgress.upsert({ where: { userId_problemId: { userId, problemId } } })`
- **Bookmarks**: `prisma.userBookmark.findMany({ where: { userId } })`
- **Notifications**: `prisma.notification.updateMany({ where: { id, userId } })`

### 4.2 Identified & Fixed IDOR Vector (AUD-001)
- **Vulnerability**: In `POST /api/v1/ai/chat`, if a caller provided an existing `conversationId`, the system appended the message without verifying that the conversation belonged to `req.user.id`.
- **Fix Applied**: Added explicit ownership validation before saving:
  ```typescript
  if (convId) {
    const existingConv = await prisma.aiConversation.findFirst({
      where: { id: convId, userId },
    });
    if (!existingConv) {
      throw new ForbiddenError('Conversation not found or access denied');
    }
  }
  ```
- **Automated Verification**: Test 8 in `multi_user.test.ts` validates that cross-user conversation injection returns HTTP 403 Forbidden.

---

## 5. Injection & Input Sanitization

### 5.1 SQL Injection (SQLi)
- DevOrbit queries the SQLite database strictly through Prisma ORM 6.4.
- All Prisma methods (`findUnique`, `findMany`, `create`, `update`, `delete`) utilize parameterized queries at the driver level.
- **Zero raw SQL queries** (`$queryRaw` / `$executeRawUnsafe`) exist in the codebase.
- **Risk Rating**: **Negligible**.

### 5.2 Cross-Site Scripting (XSS) & Security Headers
- **HTTP Security Headers**: `helmet` middleware is mounted on `app.use()`, injecting:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
  - `Strict-Transport-Security`
  - `X-DNS-Prefetch-Control`
- **Frontend Escaping**: React 19 automatically escapes all dynamic expressions in JSX, preventing stored and reflected DOM XSS.

### 5.3 Cross-Origin Resource Sharing (CORS)
- Explicit CORS whitelist configured via `config.corsOrigin` (default `http://localhost:5173`).
- Wildcard `*` origin with credentials is strictly disallowed.

---

## 6. Input Validation Matrix

| Endpoint | Controller | Schema Validator | Status |
|---|---|---|---|
| `POST /api/v1/auth/register` | `auth.controller.ts` | Zod `registerSchema` (email, min 6 char pwd, username regex) | Enforced |
| `POST /api/v1/auth/login` | `auth.controller.ts` | Zod `loginSchema` (login string, password string) | Enforced |
| `POST /api/v1/workspaces` | `workspaces.routes.ts` | Explicit null & emptiness checks for `name` and `slug` | Enforced |
| `POST /api/v1/workspaces/:id/members` | `workspaces.routes.ts` | Caller role verification + target user existence check | Enforced |
| `POST /api/v1/dsa/problems/:id/progress` | `dsa.controller.ts` | Status enum check (`UNSOLVED`, `SOLVED`, `REVISE`, `ATTEMPTED`) | Enforced |

---

## 7. Security Conclusion

DevOrbit adheres to modern defensive security practices for local-first and client-server architectures. The system exhibits robust user data isolation, parameterized query execution, verified session revocability, and protected endpoint authorization.

# DevOrbit — GitHub Permissions, Security & Credential Management

**Product:** DevOrbit — Local-first Developer Intelligence Operating System  
**Category:** Security & Compliance Policy  
**Milestone:** M2  

---

## 1. Principles of Least Privilege

DevOrbit connects with GitHub exclusively to index source code artifacts and developer activity for local intelligence. It enforces a strict least-privilege security model:

| Scope | Purpose | Read / Write |
|---|---|---|
| `read:user` | Retrieves public profile username, avatar, and bio | **Read Only** |
| `repo` | Reads repository metadata, languages, and commit activities | **Read Only** |
| `read:org` | Discovers organization memberships for OSS tracking | **Read Only** |

DevOrbit **never** requests:
- `admin:*` or write access to user repositories.
- `delete_repo` or repository destruction capabilities.
- Workflow execution (`workflow`) permissions.
- Payment, billing, or marketplace privileges.

---

## 2. Local-First Key Management

### 2.1 Encryption at Rest
All integration credentials, Personal Access Tokens (PATs), and OAuth secrets are encrypted prior to being written into SQLite (`devorbit.db`):
- Cipher: **AES-256-GCM** authenticated cipher.
- Master Key: Derived locally using HMAC/scrypt key derivation.
- IV: Cryptographically secure 12-byte initialization vector generated per transaction.
- Tamper Resistance: Any bit modification in the stored ciphertext causes decipher authentication failure.

### 2.2 In-Memory Lifecycle
1. Tokens are decrypted in memory **only** for the duration of an active HTTP synchronization session with `api.github.com`.
2. Raw tokens are **never** logged to disk, console, or telemetry endpoints.
3. API responses to the frontend return masked token previews (e.g. `ghp_***cdef`) or boolean connection states (`connected: true`).
4. Tokens are **never** saved to frontend `localStorage` or `sessionStorage`.

---

## 3. Disconnection & Revocation Workflow

### Local Disconnection
Users can revoke local integration credentials at any time by clicking **Disconnect** in the Developer Profile UI or invoking:
```http
DELETE /api/v1/github/token
Authorization: Bearer <session_token>
```
This action deletes:
- `IntegrationCredential` record containing the encrypted token.
- Associated sync locks and active tokens.

### Upstream Revocation Guidance
To permanently revoke access on GitHub:
1. Navigate to **GitHub Settings** > **Developer Settings** > **Personal Access Tokens**.
2. Locate the token created for DevOrbit.
3. Click **Delete** to immediately invalidate all upstream authorization.

# DevOrbit — Integrations Architecture & Provider Guide

DevOrbit provides a modular, extensible integration subsystem enabling developers to synchronize data across coding platforms, competitive programming profiles, and local AI engines.

---

## 1. Supported Integration Providers

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        DEVORBIT INTEGRATION HUB                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌──────────────┬────────────────┼───────────────┬────────────────┐
    │              │                │               │                │
┌───▼───┐      ┌───▼───┐        ┌───▼───┐       ┌───▼───┐        ┌───▼───┐
│GitHub │      │Code-  │        │Leet-  │       │Take U │        │Ollama │
│OAuth &│      │forces │        │Code   │       │Forward│        │Local  │
│  PAT  │      │Public │        │GraphQL│       │Striver│        │Neural │
└───────┘      └───────┘        └───────┘       └───────┘        └───────┘
```

| Provider | Type | Protocol | Auth Requirement | Capabilities |
|---|---|---|---|---|
| **GitHub** | Code Host | REST / GraphQL | OAuth App or PAT (`repo`, `read:user`) | 365-day commit heatmap, repository list, PR merge rate, language analysis. |
| **Codeforces** | Competitive | REST API | None (Public handle) | Rating history graph, max rank, contest count, problem difficulty breakdown. |
| **LeetCode** | DSA | GraphQL / Import | Public username or JSON/CSV | Problem counts by difficulty (Easy/Med/Hard), submission history. |
| **Take U Forward** | Curriculum | Striver Sheet | Public username | Striver A2Z sheet progress tracking (455 problems). |
| **Ollama** | Local AI | HTTP JSON | None (127.0.0.1 daemon) | Local code generation, refactoring, and conversational debugging. |

---

## 2. Token Security: AES-256-GCM Cryptographic Storage

All sensitive secrets (GitHub Personal Access Tokens and OAuth tokens) are encrypted before being written to SQLite.

### Implementation Details:
- **Cipher**: `aes-256-gcm`
- **Key Derivation**: 256-bit symmetric key derived from `INTEGRATION_ENCRYPTION_KEY` (or SHA-256 of `JWT_SECRET`)
- **Initialization Vector (IV)**: 12-byte random cryptographic IV generated per record via `crypto.randomBytes(12)`
- **Authentication Tag**: 16-byte GCM authentication tag verifying ciphertext authenticity
- **Storage Format**: `ivHex:tagHex:cipherHex` stored in `IntegrationCredential.encryptedToken`

Tokens are decrypted strictly in-memory during sync operations and never exposed in API payloads or client-side JavaScript.

---

## 3. GitHub Integration Workflow

### Connecting with a Personal Access Token (PAT)
1. Go to **Integration Center** (`/integrations`).
2. Click **Connect GitHub**.
3. Create a token on GitHub:
   - Scopes: `repo` (for repository metadata) and `read:user` (for profile).
4. Paste the token into DevOrbit and click **Save & Sync**.
5. DevOrbit queries `https://api.github.com/user` and `https://api.github.com/user/repos` to populate your Command Center.

### Connecting with GitHub OAuth
1. Create a GitHub OAuth App at [https://github.com/settings/developers](https://github.com/settings/developers).
2. Set Authorization callback URL: `http://localhost:3001/api/v1/integrations/github/callback`.
3. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env`.
4. DevOrbit will render a 1-click **Connect GitHub OAuth** button.

---

## 4. Codeforces Integration Workflow

Codeforces statistics are fetched via their official public API (`https://codeforces.com/apiHelp`):
- `user.info`: Current rating, peak rating, rank title.
- `user.rating`: Complete contest history and delta calculations.
- `user.status`: Accepted submissions and tag/difficulty distributions.

No password or API secret is required; simply input your public handle in the Integration Center.

---

## 5. Take U Forward (Striver A2Z) Progress Tracking

DevOrbit models the complete 455-problem Striver A2Z DSA sheet:
- Tracks progress across 18 progressive steps (from Basics and Arrays to Dynamic Programming and Advanced Graphs).
- Normalizes problems to avoid duplicate solves across LeetCode and Codeforces.
- Feeds solved problems directly into the SuperMemo SM-2 spaced repetition queue.

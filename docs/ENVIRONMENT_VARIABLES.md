# DevOrbit — Environment Variables Specification

This document provides a formal specification for all configuration parameters supported by DevOrbit in `.env`.

---

## 1. Variables Reference Matrix

| Variable | Purpose | Required / Optional | Default Value | Secret? | How to Obtain / Configure |
|---|---|---|---|---|---|
| `PORT` | Listening port for the API server | Optional | `3001` | No | Any available unprivileged port (1024-65535). |
| `NODE_ENV` | Runtime execution mode | Optional | `development` | No | Set to `production` in live deployments. |
| `CORS_ORIGIN` | Whitelisted browser origin | Optional | `http://localhost:5173` | No | The frontend origin or domain. |
| `DATABASE_URL` | SQLite file connection URI | **Required** | `file:./devorbit.db` | No | SQLite file path relative to `apps/api` or absolute path. |
| `JWT_SECRET` | Signing secret for authentication tokens | **Required in Prod** | Dev default | **YES** | Generate via `openssl rand -hex 32`. |
| `INTEGRATION_ENCRYPTION_KEY` | AES-256-GCM symmetric key for tokens | Optional | Derived from JWT | **YES** | Generate via `openssl rand -hex 32` (64 hex characters). |
| `GITHUB_CLIENT_ID` | OAuth Application Client ID | Optional | `""` | No | Register at [GitHub Developer Settings](https://github.com/settings/developers). |
| `GITHUB_CLIENT_SECRET` | OAuth Application Secret | Optional | `""` | **YES** | Generated in GitHub OAuth App settings. |
| `GITHUB_REDIRECT_URI` | OAuth callback target | Optional | `http://localhost:3001/api/v1/integrations/github/callback` | No | Matches GitHub OAuth App callback URL. |
| `OLLAMA_URL` | Local Ollama daemon HTTP base | Optional | `http://127.0.0.1:11434` | No | Default port used by Ollama. |
| `CODEFORCES_API_BASE` | Codeforces public REST API | Optional | `https://codeforces.com/api` | No | Official Codeforces API endpoint. |
| `LEETCODE_GRAPHQL_ENDPOINT` | LeetCode GraphQL probe target | Optional | `https://leetcode.com/graphql` | No | Public LeetCode endpoint. |

---

## 2. Startup Validation & Failure Semantics

DevOrbit checks environment validity upon initialization:
- If `DATABASE_URL` is omitted, the Prisma client fails immediately with an actionable error.
- If `NODE_ENV=production` and `JWT_SECRET` is left as default or shorter than 32 characters, a critical security warning is emitted.
- If `GITHUB_CLIENT_ID` is defined without `GITHUB_CLIENT_SECRET`, GitHub OAuth routes gracefully disable themselves and instruct the user to use Personal Access Tokens (PATs) instead of throwing an unhandled exception.

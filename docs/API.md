# DevOrbit — REST API Specification (`v1`)

All API routes are served under prefix `/api/v1` and follow standard REST conventions.

---

## 1. Response Envelope Format

All responses conform to the standard DevOrbit envelope shape:

### Success Response (`HTTP 200 / 201`)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation message",
  "requestId": "uuid-v4-request-id"
}
```

### Error Response (`HTTP 4xx / 5xx`)
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Human-readable error description",
    "statusCode": 400,
    "details": null
  },
  "message": "Human-readable error description",
  "requestId": "uuid-v4-request-id"
}
```

---

## 2. Authentication Header

Routes marked with **Auth: Bearer** require an HTTP `Authorization` header containing a valid user JWT:
```http
Authorization: Bearer <jwt_token>
```
Unauthenticated requests to protected endpoints return `HTTP 401 Unauthorized`.

---

## 3. Endpoints Directory

### 3.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | `{ username, email, password, name? }` | `{ user, token }` |
| `POST` | `/api/v1/auth/login` | Public | `{ login, password }` | `{ user, token }` |
| `POST` | `/api/v1/auth/logout` | Bearer | None | `{ loggedOut: true }` |
| `GET` | `/api/v1/auth/me` | Bearer | None | `{ user: { id, email, username, name, role } }` |
| `GET` | `/api/v1/auth/csrf` | Public | None | `{ csrfToken: string }` |

### 3.2 System & Diagnostics (`/api/v1/system`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/system/health` | Public | None | `{ status: "ok", uptime, timestamp }` |
| `GET` | `/api/v1/system/backup` | Bearer | None | `{ backup: { version, exportedAt, user, dsaProgress, skills, bookmarks } }` |
| `POST` | `/api/v1/system/restore` | Bearer | `{ backup: { version, dsaProgress, ... } }` | `{ restored: true, counts: { dsaProgress, skills, bookmarks } }` |

### 3.3 Dashboard HUD (`/api/v1/dashboard`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Bearer | None | `{ githubStats, dsaStats, ossStats }` |
| `GET` | `/api/v1/dashboard/activity` | Bearer | None | `{ activities: Array<{ id, type, description, timestamp }> }` |

### 3.4 Open Source Discovery (`/api/v1/opensource`)

| Method | Endpoint | Auth | Query Parameters / Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/opensource/organizations` | Public | `?platforms=&techs=&search=&page=&limit=` | `{ organizations: [...], total, page, limit }` |
| `GET` | `/api/v1/opensource/organizations/:slug` | Public | None | `{ organization: { name, slug, topics, projects, websiteUrl, ... } }` |
| `GET` | `/api/v1/opensource/catalog` | Public | `?tech=&search=&difficulty=` | `{ repositories: [...], total }` |
| `GET` | `/api/v1/opensource/repositories` | Public | None | `{ repositories: [...] }` |
| `GET` | `/api/v1/opensource/issues` | Public | `?labels=&difficulty=&search=` | `{ issues: [...] }` |
| `GET` | `/api/v1/opensource/bounties` | Public | None | `{ bounties: [...] }` |
| `GET` | `/api/v1/opensource/trending` | Public | None | `{ trending: [...] }` |
| `GET` | `/api/v1/opensource/gsoc` | Public | `?year=2026&search=` | `{ organizations: [...] }` (606 seeded snapshot) |
| `GET` | `/api/v1/opensource/recommendations` | Bearer | None | `{ recommendations: Array<{ id, category, matchScore, reasons, ... }> }` |
| `POST` | `/api/v1/opensource/feedback` | Bearer | `{ recommendationId, action: "SAVE" \| "DISMISS" }` | `{ saved: boolean }` |
| `GET` | `/api/v1/opensource/bookmarks` | Bearer | None | `{ bookmarks: [...] }` |

### 3.5 DSA Practice & Spaced Repetition (`/api/v1/dsa`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/dsa/problems` | Public | `?platform=&difficulty=&topic=&search=` | `{ problems: [...], total }` |
| `GET` | `/api/v1/dsa/problems/:id` | Public | None | `{ problem: { id, title, slug, platform, difficulty, topic } }` |
| `POST` | `/api/v1/dsa/problems/:id/progress` | Bearer | `{ status, solutionMode?, cognitiveMastery?, notes? }` | `{ progress: UserDsaProgress }` |
| `POST` | `/api/v1/dsa/review/:problemId` | Bearer | `{ recallScore: 1-5, reviewDurationSeconds? }` | `{ nextReviewDate, intervalDays, easinessFactor }` |
| `GET` | `/api/v1/dsa/revision-queue` | Bearer | None | `{ dueToday: [...], upcoming: [...], totalDue }` |
| `GET` | `/api/v1/dsa/analytics` | Bearer | None | `{ totalSolved, retentionRate, topicProficiency, streakDays }` |
| `POST` | `/api/v1/dsa/import` | Bearer | `{ format: "csv", data: string }` | `{ importedCount, errors: [] }` |
| `GET` | `/api/v1/dsa/recommendations` | Bearer | None | `{ recommendedProblems: [...] }` |

### 3.6 Third-Party Integrations (`/api/v1/integrations`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/integrations/status` | Bearer | None | `{ github: { connected, username }, codeforces: { connected, handle }, leetcode: { connected, handle }, tuf: { connected, handle } }` |
| `GET` | `/api/v1/integrations/github/oauth/url` | Bearer | None | `{ authorizationUrl, state }` |
| `POST` | `/api/v1/integrations/github/oauth/callback` | Bearer | `{ code, state }` | `{ connected: true, username }` |
| `POST` | `/api/v1/integrations/github/connect` | Bearer | `{ token: string }` | `{ connected: true, username }` |
| `POST` | `/api/v1/integrations/github/sync` | Bearer | None | `{ synced: true, reposCount }` |
| `DELETE` | `/api/v1/integrations/github` | Bearer | None | `{ disconnected: true }` |
| `POST` | `/api/v1/integrations/codeforces/connect` | Bearer | `{ handle: string }` | `{ connected: true, handle, rating, rank }` |
| `POST` | `/api/v1/integrations/codeforces/sync` | Bearer | None | `{ synced: true, rating, rank }` |
| `DELETE` | `/api/v1/integrations/codeforces` | Bearer | None | `{ disconnected: true }` |
| `POST` | `/api/v1/integrations/leetcode/connect` | Bearer | `{ handle: string }` | `{ connected: true, handle }` |
| `POST` | `/api/v1/integrations/leetcode/sync` | Bearer | None | `{ synced: true }` |
| `POST` | `/api/v1/integrations/leetcode/import` | Bearer | `{ problems: [...] }` | `{ importedCount }` |
| `DELETE` | `/api/v1/integrations/leetcode` | Bearer | None | `{ disconnected: true }` |
| `POST` | `/api/v1/integrations/tuf/connect` | Bearer | `{ handle: string }` | `{ connected: true, handle }` |
| `POST` | `/api/v1/integrations/tuf/sync` | Bearer | None | `{ synced: true }` |
| `POST` | `/api/v1/integrations/tuf/import` | Bearer | `{ sheet: "striver-a2z", problems: [...] }` | `{ importedCount }` |
| `DELETE` | `/api/v1/integrations/tuf` | Bearer | None | `{ disconnected: true }` |

### 3.7 Local AI Studio (`/api/v1/ai`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/ai/status` | Bearer | None | `{ connected: boolean, engine: "ollama" \| "deterministic", host: string }` |
| `GET` | `/api/v1/ai/models` | Bearer | None | `{ models: Array<{ name, size, modified_at }> }` |
| `POST` | `/api/v1/ai/chat` | Bearer | `{ prompt: string, model?: string, conversationId?: string }` | `{ message: { role, content, provenance }, conversationId }` |
| `POST` | `/api/v1/ai/prompt` | Bearer | `{ prompt: string, model?: string }` | `{ completion: string, provenance: "ollama" \| "deterministic" }` |
| `GET` | `/api/v1/ai/conversations` | Bearer | None | `{ conversations: [...] }` |
| `GET` | `/api/v1/ai/conversations/:id` | Bearer | None | `{ conversation: { id, title, messages: [...] } }` |
| `PATCH` | `/api/v1/ai/conversations/:id` | Bearer | `{ title: string }` | `{ conversation }` |
| `DELETE` | `/api/v1/ai/conversations/:id` | Bearer | None | `{ deleted: true }` |

### 3.8 Codebase Navigator (`/api/v1/navigator`)

| Method | Endpoint | Auth | Query Parameters / Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/navigator/summary` | Bearer | None | `{ projectRoot, fileCount, languages, topDirectories }` |
| `GET` | `/api/v1/navigator/symbols` | Bearer | `?file=src/index.ts` | `{ symbols: Array<{ name, kind, line }> }` |
| `GET` | `/api/v1/navigator/graph` | Bearer | None | `{ mermaid: string, mermaidCode: string, nodesCount, edgesCount }` |
| `GET` | `/api/v1/navigator/file` | Bearer | `?path=relative/path/to/file` | `{ content: string, language: string, lineCount }` (Protected against path traversal) |

### 3.9 Orbit Fix Intelligence (`/api/v1/fix`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/fix/samples` | Bearer | None | `{ samples: Array<{ id, name, description }> }` |
| `POST` | `/api/v1/fix/analyze` | Bearer | `{ logText: string }` | `{ errorType, stackFrames, suggestedFix, rootCause }` |
| `POST` | `/api/v1/fix/propose` | Bearer | `{ analysisId: string, filePath: string }` | `{ patchDiff: string, confidence: number }` |
| `POST` | `/api/v1/fix/verify` | Bearer | `{ patchDiff: string }` | `{ passesTests: boolean, output: string }` |

### 3.10 Orbit SafeChange Intelligence (`/api/v1/safechange`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `POST` | `/api/v1/safechange/analyze` | Bearer | `{ gitDiff: string }` | `{ riskScore: 0-100, riskLevel: "LOW"\|"MEDIUM"\|"HIGH", affectedFiles: [...] }` |
| `GET` | `/api/v1/safechange/risk` | Bearer | None | `{ recentRiskScores: [...] }` |
| `GET` | `/api/v1/safechange/dependencies` | Bearer | None | `{ dependencyHealth: [...], testToCodeRatio: number }` |

### 3.11 Workspaces (`/api/v1/workspaces`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/workspaces` | Bearer | None | `{ workspaces: [...] }` |
| `POST` | `/api/v1/workspaces` | Bearer | `{ name: string, description?: string }` | `{ workspace: Workspace }` |
| `GET` | `/api/v1/workspaces/:id` | Bearer | None | `{ workspace: Workspace }` |
| `PATCH` | `/api/v1/workspaces/:id` | Bearer | `{ name?: string, description?: string }` | `{ workspace: Workspace }` |
| `DELETE` | `/api/v1/workspaces/:id` | Bearer | None | `{ deleted: true }` |

### 3.12 Developer Profile (`/api/v1/profile`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/profile/developer` | Bearer | None | `{ profile: DeveloperProfile, skills: [...], interests: [...] }` |
| `PATCH` | `/api/v1/profile/developer` | Bearer | `{ primaryFocus?, experienceLevel?, bio?, weeklyAvailabilityHours? }` | `{ profile }` |
| `POST` | `/api/v1/profile/developer/skills` | Bearer | `{ name, category, proficiencyLevel?, source? }` | `{ skill: DeveloperSkill }` |
| `POST` | `/api/v1/profile/readme` | Bearer | `{ content: string, username?: string }` | `{ signals: [...], extractedSkills: [...] }` |

### 3.13 Community Forum (`/api/v1/forum`)

| Method | Endpoint | Auth | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/v1/forum/posts` | Public | `?category=&search=&page=&limit=` | `{ posts: [...], total }` |
| `POST` | `/api/v1/forum/posts` | Bearer | `{ title, content, category }` | `{ post: ForumPost }` |
| `GET` | `/api/v1/forum/posts/:id` | Public | None | `{ post: ForumPost, replies: [...] }` |
| `POST` | `/api/v1/forum/posts/:id/upvote` | Bearer | None | `{ upvotes: number }` |
| `POST` | `/api/v1/forum/posts/:id/replies` | Bearer | `{ content: string }` | `{ reply: ForumReply }` |
| `DELETE` | `/api/v1/forum/posts/:id` | Bearer | None | `{ deleted: true }` |

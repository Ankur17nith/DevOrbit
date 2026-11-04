# DevOrbit — Troubleshooting & Diagnostic Guide

This document catalogs common operational anomalies, error messages, and their verified solutions.

---

## 1. Port Conflicts (EADDRINUSE)

### Symptom:
`Error: listen EADDRINUSE: address already in use :::3001` or `Port 5173 is in use`.

### Solution:
Check for orphaned processes from previous runs:
```bash
# Identify process on port 3001
lsof -i :3001
# Terminate the process
kill -9 $(lsof -t -i :3001)

# Identify process on port 5173
lsof -i :5173
kill -9 $(lsof -t -i :5173)
```

Alternatively, change `PORT` in `.env` to another port (e.g., `PORT=3002`).

---

## 2. Prisma Database Errors

### Symptom: `Environment variable not found: DATABASE_URL`
### Solution:
When invoking Prisma CLI directly from `apps/api/`, ensure `DATABASE_URL` is exported or present in `apps/api/.env`:
```bash
cd apps/api
DATABASE_URL="file:./devorbit.db" npx prisma db push
```

### Symptom: SQLite locked or busy
SQLite in standard mode can lock during concurrent heavy writes. DevOrbit configures WAL (Write-Ahead Logging) mode to prevent this. To manually verify:
```bash
sqlite3 apps/api/devorbit.db "PRAGMA journal_mode=WAL;"
```

---

## 3. Ollama Offline or Model Not Found

### Symptom:
Orbit AI studio shows `● Offline (Rule Engine Active)`.

### Diagnostic Steps:
1. Check if Ollama daemon is running:
   ```bash
   curl http://127.0.0.1:11434/api/tags
   ```
2. If connection refused, start the daemon:
   ```bash
   ollama serve
   ```
3. If the daemon is running but no models exist:
   ```bash
   ollama run deepseek-coder
   ```
4. Click the **Probe** button in Orbit AI or refresh the page.

---

## 4. Codeforces API Rate Limits

### Symptom:
`HTTP 429 Too Many Requests` or `Codeforces API returned error`.

### Solution:
Codeforces limits public API queries to approximately 1 request per 2 seconds. DevOrbit implements in-memory caching for handle statistics. If rate-limited, wait 30 seconds before clicking **Refresh All Status**.

---

## 5. Blank Screen or React Hydration Warning

### Diagnostic Steps:
1. Open browser DevTools (F12) -> Console.
2. If `Failed to load resource: net::ERR_CONNECTION_REFUSED`, verify backend is running on `http://localhost:3001`.
3. If localStorage has corrupted session state, clear browser site data or run `localStorage.clear()` in DevTools console and reload.

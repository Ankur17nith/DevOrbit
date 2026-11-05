# DevOrbit — Production Deployment & Self-Hosting Guide

This document describes how to build, harden, and deploy DevOrbit in a production environment (either as a locally managed systemd service or containerized self-hosted instance).

---

## 1. Production Build Pipeline

To compile the entire monorepo for production:

```bash
# 1. Clean build all workspaces
npm run build
```

This performs:
- `apps/web`: `tsc && vite build` -> outputs static assets to `apps/web/dist`
- `apps/api`: `tsc` -> outputs compiled JavaScript to `apps/api/dist`

---

## 2. Hardened Environment Configuration

In production, ensure `.env` contains secure, unique secrets:

```bash
# Production .env configuration
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:5173  # Or your custom domain

# Generate 32-byte high entropy secrets:
# openssl rand -hex 32
JWT_SECRET=c3b0f5e1d4a896e45f9a2b7c6d3e8f1a0b5c4d3e2f1a8b7c6d5e4f3a2b1c0d9e
INTEGRATION_ENCRYPTION_KEY=e8f1a0b5c4d3e2f1a8b7c6d5e4f3a2b1c0d9ec3b0f5e1d4a896e45f9a2b7c6d3

DATABASE_URL="file:/var/lib/devorbit/devorbit.db"
```

---

## 3. Running with systemd on Linux

Create a dedicated systemd service for the API server:

`/etc/systemd/system/devorbit-api.service`:
```ini
[Unit]
Description=DevOrbit API Daemon
After=network.target

[Service]
Type=simple
User=devorbit
WorkingDirectory=/opt/devorbit/apps/api
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
EnvironmentFile=/opt/devorbit/.env

# Security Hardening
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/var/lib/devorbit
PrivateTmp=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now devorbit-api
```

---

## 4. Serving the Web Frontend via Nginx

To serve the production React SPA with Nginx:

```nginx
server {
    listen 80;
    server_name devorbit.local;

    root /opt/devorbit/apps/web/dist;
    index index.html;

    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 5. Production Health & Liveness Probes

DevOrbit exposes dedicated Kubernetes-compatible liveness and readiness probe endpoints:

### Liveness Probe (`/live` / `/api/v1/live`)
Confirms Node.js event loop and HTTP server responsiveness:
```bash
curl -f http://localhost:3001/live
# {"status":"ok","uptime":128.45,"timestamp":"2026-11-05T13:45:00.000Z"}
```

### Readiness Probe (`/ready` / `/api/v1/ready`)
Verifies deep database connectivity (`SELECT 1` via Prisma):
```bash
curl -f http://localhost:3001/ready
# {"status":"ready","database":"connected","uptime":128.45,"timestamp":"2026-11-05T13:45:00.000Z"}
```
Returns HTTP 503 if the SQLite database is locked or unreachable.

---

## 6. Disaster Recovery & Backup Runbook

### Hot SQLite Database Backup
Because SQLite operates in WAL (Write-Ahead Logging) mode, create safe hot backups using the SQLite CLI without stopping the server:
```bash
# 1. Atomic hot backup
sqlite3 /var/lib/devorbit/devorbit.db ".backup /var/backups/devorbit_$(date +%Y%m%d_%H%M%S).db"

# 2. Compress backup
gzip /var/backups/devorbit_*.db
```

### In-App Disaster Recovery Export & Restore
DevOrbit provides full cryptographic workspace export via API:
- **Export Backup**:
  ```bash
  curl -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:3001/api/v1/system/export > devorbit_backup.json
  ```
- **Restore from Backup**:
  ```bash
  curl -X POST -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d @devorbit_backup.json http://localhost:3001/api/v1/system/import
  ```

### Database Restoration Procedure
In case of catastrophic corruption or hardware migration:
1. Stop the application daemon:
   ```bash
   sudo systemctl stop devorbit-api
   ```
2. Restore the database file:
   ```bash
   cp /var/backups/devorbit_latest.db /var/lib/devorbit/devorbit.db
   rm -f /var/lib/devorbit/devorbit.db-wal /var/lib/devorbit/devorbit.db-shm
   chmod 600 /var/lib/devorbit/devorbit.db
   ```
3. Restart the daemon:
   ```bash
   sudo systemctl start devorbit-api
   ```
4. Verify readiness:
   ```bash
   curl -f http://localhost:3001/ready
   ```

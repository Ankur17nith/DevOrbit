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

## 5. Production Health & Telemetry Verification

Verify service readiness:
```bash
curl -I http://localhost:3001/api/health
# HTTP/1.1 200 OK
# Content-Type: application/json
```
And inspect system status:
```bash
curl -s http://localhost:3001/api/v1/system/status | jq .
```
Expected output:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "uptimeSeconds": 1284,
  "database": {
    "engine": "SQLite",
    "connected": true,
    "userCount": 2,
    "problemCount": 16
  },
  "ollama": {
    "connected": false,
    "activeEngine": "devorbit-deterministic-fallback"
  }
}
```

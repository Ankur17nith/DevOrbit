# DevOrbit — Backup & Disaster Recovery Guide

DevOrbit is built with local data ownership at its core. This guide details how to export, backup, migrate, and restore user accounts and algorithmic progress.

---

## 1. Single-Click GUI Backup & Restore

### Exporting Backup via UI
1. Open DevOrbit and navigate to **Settings** (`/settings`).
2. Click the **Backups & Restore** tab.
3. Click **Export Backup JSON**.
4. The browser will download a file named `devorbit-backup-<username>-<timestamp>.json`.

### Restoring from Backup via UI
1. On a fresh installation or migrated machine, register or sign in to your user account.
2. Navigate to **Settings > Backups & Restore**.
3. Under **Restore Backup Archive**, click **Choose Backup File** and select your JSON export.
4. Click **Restore Data**. DevOrbit will validate the archive structure and import all solved problems, SM-2 repetition schedules, and bookmarks non-destructively.

---

## 2. API-Based Backup & Restore Workflows

DevOrbit exposes dedicated system endpoints for automated backups (e.g., via cron or custom scripts):

### Export Endpoint: `GET /api/v1/system/backup`
```bash
curl -X GET http://localhost:3001/api/v1/system/backup \
  -H "Authorization: Bearer <USER_JWT_TOKEN>" \
  -o devorbit_backup_$(date +%Y%m%d).json
```

### Restore Endpoint: `POST /api/v1/system/restore`
```bash
curl -X POST http://localhost:3001/api/v1/system/restore \
  -H "Authorization: Bearer <USER_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d @devorbit_backup.json
```

---

## 3. Physical SQLite Database Backups

Because DevOrbit uses SQLite in WAL mode (`apps/api/devorbit.db`), you can also create live, atomic binary backups of the entire database using the SQLite `.backup` command without stopping the API server:

```bash
# Atomic online backup of SQLite database
sqlite3 apps/api/devorbit.db ".backup 'apps/api/devorbit_backup.db'"
```

To restore the physical database:
1. Stop the API server: `kill <pid>`
2. Replace `apps/api/devorbit.db` with your backup copy.
3. Restart the server.

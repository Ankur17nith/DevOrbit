# DevOrbit Planned & Roadmap Database Models

This document records models and fields that were removed from the active runtime SQLite schema during the Phase 6 remediation audit to eliminate dead schema definitions and maintain a clean production database.

---

## 1. Removed Models & Rationale

### `MarketplaceListing`
- **Initial Concept**: Peer-to-peer developer marketplace for collaborative projects, hiring, and bounty sharing.
- **Removal Reason**: No backend endpoints, queries, or UI flows were implemented. Seeding only populated mock rows.
- **Future Re-introduction**: Will be added when the DevOrbit Developer Network module and workspace bounty exchange are developed.

### `AlertRule`
- **Initial Concept**: User-configured background alert rules for issue labels, repo trends, and bounty thresholds (`channel: DESKTOP | TELEGRAM`).
- **Removal Reason**: Never evaluated or scheduled by any worker or daemon.
- **Future Re-introduction**: Slated for Orbit Pulse v2 when desktop push notifications and webhooks are scheduled.

### `SelfbotLog`
- **Initial Concept**: Execution audit trail for repository automation (`SelfbotConfig`: welcome messages, slash commands).
- **Removal Reason**: No webhooks or background workers process selfbot events yet; `SelfbotConfig` currently acts in configuration mode only.
- **Future Re-introduction**: Will be restored when incoming GitHub webhook receivers are activated.

### `DsaSheet`
- **Initial Concept**: Metadata catalog for DSA problem sheets (e.g. Striver A2Z, Blind 75, NeetCode 150).
- **Removal Reason**: `DsaProblem.sheetCategory` directly categorizes problems without requiring an extra relational lookup. No routes queried `DsaSheet`.
- **Future Re-introduction**: Can be re-introduced as a user-curated custom sheet feature.

---

## 2. Removed Fields

### `UserPreference.notifyTelegram` & `UserPreference.telegramChatId`
- **Initial Concept**: Direct Telegram bot notifications for mentorship deadlines and issue alerts.
- **Removal Reason**: No Telegram bot client, credentials, or webhook integrations exist in the codebase.
- **Future Re-introduction**: Telegram integration will be packaged as a formal integration provider under `integrations/telegram`.

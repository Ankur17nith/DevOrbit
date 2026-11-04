# DevOrbit — Developer & Contributor Guide

This document outlines the architecture, code conventions, testing patterns, and local development workflows for engineers contributing to DevOrbit.

---

## 1. Monorepo Organization

DevOrbit uses npm workspaces to manage its multi-package architecture:

```text
DevOrbit/
├── apps/
│   ├── api/                     # Express REST API & Prisma backend
│   │   ├── prisma/              # schema.prisma & migrations
│   │   ├── src/
│   │   │   ├── config/          # Environment & security config
│   │   │   ├── database/        # Prisma client & seeders
│   │   │   ├── middleware/      # Auth guards, error handling
│   │   │   ├── modules/         # Domain feature modules
│   │   │   │   ├── ai/          # Ollama local inference engine
│   │   │   │   ├── auth/        # JWT & bcrypt authentication
│   │   │   │   ├── dashboard/   # Command Center metrics aggregation
│   │   │   │   ├── dsa/         # SM-2 algorithmic revision queue
│   │   │   │   ├── integrations/# GitHub, Codeforces, LeetCode, TUF
│   │   │   │   ├── oss/         # GSoC & issue discovery
│   │   │   │   ├── recon/       # Local codebase analysis
│   │   │   │   ├── safechange/  # Impact analysis
│   │   │   │   └── system/      # Health, backup & restore
│   │   │   └── tests/           # Vitest integration test suites
│   │   └── package.json
│   └── web/                     # React 19 SPA frontend
│       ├── src/
│       │   ├── components/      # Sidebar, TopBar, CommandPalette, Modals
│       │   ├── context/         # AuthContext & Session management
│       │   ├── pages/           # Command Center, Integrations, AI Studio
│       │   ├── styles/          # Tailwind globals & Figma tokens
│       │   └── App.tsx          # Application shell & routing
│       └── package.json
├── docs/                        # Architecture & release documentation
├── logo/                        # Official brand SVG assets
├── src-tauri/                   # Tauri v2 desktop shell configuration
├── package.json                 # Monorepo root scripts & devDependencies
└── .env.example                 # Environment configuration template
```

---

## 2. Development Workflow

### Starting the Monorepo
```bash
# Concurrently starts API on :3001 and Web on :5173
npm run dev
```

### Dedicated Workspace Commands
```bash
# Start backend in watch mode (tsx watch)
npm run dev:api

# Start Vite dev server with Hot Module Replacement (HMR)
npm run dev:web

# Run full test suite across workspaces
npm test

# Run build across all workspaces
npm run build
```

---

## 3. Database Workflows with Prisma

All database operations use Prisma with SQLite:

```bash
# Push schema changes to devorbit.db without resetting data
npm run db:push

# Re-generate Prisma Client TypeScript definitions
npm run db:generate

# Execute seeding script to populate initial catalog data
npm run db:seed
```

> **IMPORTANT**: Never run `prisma migrate reset` in production or during normal development unless explicitly requested, as it wipes user progress and accounts.

---

## 4. Frontend Design Guidelines

All frontend components must adhere to the official DevOrbit brand specifications:
1. **Color Tokens**: Defined in `apps/web/src/styles/globals.css`.
   - `--orbit-black`: `#0B0D12`
   - `--electric-violet`: `#8B5CF6`
   - `--soft-white`: `#F8FAFC`
   - `--signal-gray`: `#686D79`
   - `--surface`: `#12151D`
   - `--border`: `rgba(248, 250, 252, 0.09)`
2. **Typography**: Inter for UI typography, Manrope for brand titles, and JetBrains Mono for code blocks.
3. **No Emerald Green**: Emerald green `#10B981` was removed from brand styling. Electric Violet `#8B5CF6` is the primary accent.
4. **Navigation**: All primary navigation belongs in `Sidebar.tsx`. The `TopBar.tsx` contains only global actions (breadcrumbs, search `Cmd+K`, notifications, user pill).

---

## 5. Adding a New Integration Provider

To add a new platform adapter (e.g., CodeChef or HackerRank):
1. Create a provider file in `apps/api/src/modules/integrations/<name>.provider.ts`.
2. Implement profile fetching, rating extraction, and error handling.
3. Register the provider in `IntegrationsService` (`apps/api/src/modules/integrations/integrations.service.ts`).
4. Expose the route in `IntegrationsRouter` (`apps/api/src/modules/integrations/integrations.routes.ts`).
5. Add an integration card and connect modal in `apps/web/src/pages/IntegrationCenterPage.tsx`.
6. Add integration test cases in `apps/api/src/tests/integrations_intelligence.test.ts`.

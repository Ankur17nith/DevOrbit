# Contributing to DevOrbit

Thank you for your interest in contributing to **DevOrbit** ("Your Skills. Your Code. Your Opportunities. One Universe.")! DevOrbit is an open-source, local-first developer intelligence platform.

---

## 1. Code of Conduct

All contributors and participants are expected to adhere to the [Code of Conduct](CODE_OF_CONDUCT.md). Please maintain a respectful, welcoming, and inclusive environment.

---

## 2. Monorepo Architecture

DevOrbit is organized as an npm workspaces monorepo:
- `apps/api`: Node.js / Express backend with Prisma ORM (SQLite / PostgreSQL) and local AI integrations.
- `apps/web`: React 19, TypeScript, Tailwind CSS, Vite frontend conforming to the official Figma Brand Identity.
- `docs/`: System documentation, architecture references, and verification audits.

---

## 3. Getting Started Locally

### Prerequisites
- **Node.js**: v20+ or v22 LTS
- **npm**: v10+
- **SQLite**: (Default local embedded database)
- **Ollama**: (Optional for local-first Orbit AI studio)

### Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/devorbit/devorbit.git
   cd devorbit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example apps/api/.env
   ```

4. **Initialize Database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   - Web application: `http://localhost:5173`
   - Express API: `http://localhost:3001`

---

## 4. Development & Design Guidelines

### Design Fidelity (Figma Brand Identity)
- All user interfaces MUST conform to the [DevOrbit Figma Brand Identity](https://www.figma.com/make/7ZzyL2VZTiv1uIh4mVFy1B/Design-DevOrbit-Brand-Identity?t=LOr1bu5JKYHmVzmy-1&preview-route=%2Fdocumentation).
- **Core Palette**:
  - Cosmic Void Background: `#0B0D12`
  - Elevated Container / Sidebar: `#12151D`
  - Subtle Border: `#1F2430`
  - Electric Violet Accent: `#8B5CF6` / `#A78BFA`
  - Soft White Text: `#F8FAFC`
  - Signal Gray Secondary: `#686D79` / `#C5C8D0`
- Zero fabricated metrics or placeholder emerald green brand bleed.

### Data Provenance & Honest Statistics
- Every metric displayed MUST include its authentic data source tag (`source: 'live_api' | 'manual_import' | 'browser_extension' | 'local_analysis'`).
- Do not fabricate star counts, completed DSA questions, or fake velocity. Display honest unrated/empty states when disconnected.

### Security & Privacy Standards
- Personal Access Tokens and OAuth tokens MUST be encrypted with AES-256-GCM authenticated encryption before persisting to disk.
- Never log, echo, or commit sensitive tokens, secrets, or keys.
- Enforce strict user data isolation across all endpoints.

---

## 5. Testing & Verification

Before submitting a Pull Request, ensure that all automated tests pass:
```bash
# Run all tests across the monorepo
npm test

# Run API tests only
npm run test:api

# Run Web frontend tests only
npm run test:web
```

---

## 6. Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/my-new-feature
   ```
2. Commit your changes following conventional commits format (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
3. Ensure no lint errors or test regressions.
4. Push to your fork and submit a PR against `main`.

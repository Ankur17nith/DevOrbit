# DevOrbit — Installation & Setup Manual

This document provides complete, step-by-step installation instructions for DevOrbit across supported operating systems (Fedora/Linux, macOS, and Windows via WSL2).

---

## 1. System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| **CPU** | Dual-core 2.0 GHz | Quad-core 3.0+ GHz (for local AI inference) |
| **RAM** | 4 GB | 16 GB+ (if running 7B+ LLM models locally) |
| **Disk** | 1 GB free | 10 GB+ (includes local LLM weights in `~/.ollama`) |
| **Operating System** | Fedora 38+, Ubuntu 22.04+, macOS 12+, Windows 11 (WSL2) | Linux / macOS |
| **Node.js** | v20.0.0 LTS | v22.x LTS (tested on v22.23.1) |
| **npm** | v10.0.0+ | v10.8+ |

---

## 2. Linux (Fedora / Debian / Ubuntu) Installation

### Step 2.1: Install Node.js and Core Build Tools
On Fedora:
```bash
sudo dnf install -y nodejs npm git gcc-c++ make sqlite
```

On Ubuntu / Debian:
```bash
sudo apt-get update
sudo apt-get install -y nodejs npm git build-essential sqlite3
```

Verify versions:
```bash
node -v   # Expected: v20.x or v22.x
npm -v    # Expected: v10.x+
```

### Step 2.2: Clone Repository
```bash
git clone https://github.com/<owner>/devorbit.git
cd devorbit
```

### Step 2.3: Install Monorepo Dependencies
```bash
npm install
```

### Step 2.4: Environment Configuration
Copy the provided environment template:
```bash
cp .env.example .env
```
Default configuration is set for local-first single-machine operation. No cloud credentials are required.

### Step 2.5: Initialize SQLite Database
Generate the Prisma ORM client and synchronize the schema:
```bash
npm run db:push
npm run db:seed
```
This sets up `apps/api/devorbit.db` with WAL mode enabled and populates initial DSA problems and GSoC organization records.

### Step 2.6: Run the Development Server
```bash
npm run dev
```
- API starts at: `http://localhost:3001`
- Frontend starts at: `http://localhost:5173`

Open `http://localhost:5173` in your browser.

---

## 3. macOS Installation

### Step 3.1: Install Homebrew and Dependencies
```bash
brew install node@22 git
brew link node@22
```

### Step 3.2: Clone, Configure, and Seed
```bash
git clone https://github.com/<owner>/devorbit.git
cd devorbit
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

---

## 4. Optional: Local AI Setup (Ollama)

DevOrbit natively integrates with local Ollama instances for zero-cloud developer assistance.

1. Install Ollama:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
2. Start the daemon (if not started automatically by systemd):
   ```bash
   ollama serve
   ```
3. Pull a fast coding model:
   ```bash
   ollama run deepseek-coder
   ```
4. Verify reachability:
   ```bash
   curl http://127.0.0.1:11434/api/tags
   ```
When you open DevOrbit at `http://localhost:5173/#ai`, it will detect the running model and enable local streaming inference.

---

## 5. Verification Checklist

After installation, verify that:
1. `http://localhost:3001/api/health` returns `{"status":"ok","service":"devorbit-api"}`.
2. `http://localhost:5173` renders the Command Center with the left-side navigation.
3. Running `npm test` passes all 69 automated tests.

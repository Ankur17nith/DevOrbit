# Ossium Deep Reverse Engineering: Feature Analysis

This document provides technical analysis of each core feature discovered across Ossium.

---

## 1. Top OSS Catalog (`/home`) & Overview API (`/api/oss-overview`)

- **Payload Structure**:
  ```json
  {
    "repos": [...],
    "total": 1250,
    "page": 1,
    "per_page": 20,
    "total_pages": 63,
    "has_more": true,
    "updatedAt": "2026-11-04T14:00:00Z",
    "cache_ttl_seconds": 3600
  }
  ```
- **Repository Card Data**:
  - `name`, `full_name`, `owner`, `avatar_url`, `description`, `stargazers_count`, `forks_count`, `open_issues_count`, `language`, `topics`, `license`, `last_commit_date`.
- **Interactions**:
  - Click card -> opens detail slide-over modal with README preview, contribution guide summary, and recent issues.
  - Quick bookmark button (`bookmark` icon) toggling user state.

---

## 2. GitHub Trending (`/home/trending` & `/api/githubTrending`)

- **Data Ingestion**: Surfaces fastest-growing public repositories on GitHub.
- **Filters**:
  - Date range: `daily`, `weekly`, `monthly`.
  - Spoken/Programming languages: `python`, `typescript`, `rust`, etc.
  - Velocity indicator: `+N stars today / this week`.

---

## 3. Issue Explorer (`/home/issues` & `/api/githubIssues`)

- **Filtering Options**:
  - Labels: `good first issue`, `help wanted`, `documentation`, `bug`, `enhancement`.
  - Difficulty: `Beginner`, `Intermediate`, `Advanced`.
  - State: `unassigned`, `recently opened`.
  - Language: Multi-select programming languages.
- **Issue Card Fields**:
  - Repository title, issue number, author avatar, comments count, creation time, label tags with custom background colors, direct external link to GitHub.

---

## 4. GSoC Organizations Directory (`/home/gsoc` & `/api/gsoc`)

- **Dataset**: 606+ verified GSoC organizations across all participation years (2005–2026).
- **Data Model**:
  ```json
  {
    "id": "3dtk",
    "slug": "3dtk",
    "name": "3DTK",
    "description": "The 3D Toolkit provides algorithms and methods to process 3D point clouds",
    "website": "http://threedtk.de",
    "logoUrl": "https://lh3.googleusercontent.com/...",
    "technologies": ["c/c++", "ros", "opencv", "cmake", "robotics", "3d"],
    "participationYears": [2018, 2021, 2024],
    "totalProjects": 2
  }
  ```
- **Search & Filters**:
  - By technology (e.g. `Python`, `Rust`, `Kubernetes`).
  - By participation count (e.g., Veteran orgs vs Newcomer orgs).
  - By latest year participated (e.g., active in 2025/2026).

---

## 5. Bounties Explorer (`/home/bounties` & `/api/bounties`)

- **Data Model**:
  ```json
  {
    "id": "4459313709",
    "issueNumber": 41,
    "title": "Add health check endpoint with component status",
    "issueUrl": "https://github.com/...",
    "state": "open",
    "bountyAmount": "7k",
    "currency": "USD",
    "difficulty": "medium",
    "language": "Solidity",
    "tags": ["good first issue", "💎 Bounty", "$7k"]
  }
  ```
- **Monetization & Validation**:
  - Highlights verified cash rewards and crypto bounties.
  - Filters by reward size (<$100, $100-$500, $500-$2000, >$2000).

---

## 6. GitHub Selfbot (`/home/bot`)

- **Purpose**: Automate repository maintenance from the user's GitHub account without complex GitHub Actions workflows.
- **Capabilities**:
  1. **Welcome Message**: Triggered when a new user files their first issue or PR.
  2. **Goodbye Message**: Triggered when a contributor is unassigned or a PR is closed without merge.
  3. **Custom Slash Commands**: Maintains a table of commands (e.g., `/guide`, `/rules`, `/reproduce`) where the bot deletes the command comment and replies with predefined markdown templates.

---

## 7. Contributor Leaderboard (`/home/contributors` & `/api/contributors`)

- **Ranking Algorithm**:
  - Score formula based on merged PRs, open issues closed, commit count, and additions/deletions ratio.
  - Profiles include GitHub username, full name, avatar, badge status, and sync timestamp.

---

## 8. Ossistant AI Assistant (`/chat` & `/api/ossistant/chat`)

- **Role**: AI assistant specifically conditioned on open source contribution etiquette, issue analysis, and repository breakdown.
- **Inputs**: Repo URL or issue URL + user question.
- **Outputs**: Concrete file pointers, recommended PR structure, and step-by-step contribution plan.

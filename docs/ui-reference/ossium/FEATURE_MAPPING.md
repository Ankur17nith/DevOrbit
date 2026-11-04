# Ossium Deep Reverse Engineering: Feature Mapping to DevOrbit

This document maps every capability discovered on Ossium to its original DevOrbit architecture, database models, and enhanced implementation.

---

## 1. Feature Implementation Matrix

| Ossium Feature | Ossium Path | DevOrbit Module | DevOrbit Path / Route | DevOrbit Database Entities | Enhancement in DevOrbit |
|---|---|---|---|---|---|
| **Top OSS Catalog** | `/home` | Orbit OSS | `/app/oss/catalog` | `OssRepository`, `OssTopic`, `UserBookmark` | Local caching, offline search, personalized skill-match badge. |
| **Trending Repos** | `/home/trending` | Orbit OSS | `/app/oss/trending` | `OssRepository`, `TrendingSnapshot` | Local historical trend charts, custom timeframe selector. |
| **Issue Explorer** | `/home/issues` | Orbit OSS | `/app/oss/issues` | `OssIssue`, `OssLabel`, `IssueSkillMatch` | Auto-match with user's DSA/project skills, skill gap indicator. |
| **GSoC Orgs Directory**| `/home/gsoc` | Orbit OSS | `/app/oss/gsoc` | `OssOrganization`, `ProgramParticipation` | Filter by user's actual project tech stack; historical project links. |
| **OSS Programs Directory** | `/home/oss-programs` | Orbit OSS | `/app/oss/programs` | `OssProgram`, `ProgramDeadline` | Automatic countdowns, desktop notifications via Orbit Pulse. |
| **OSS Alternatives** | `/home/oss-alternatives` | Orbit OSS | `/app/oss/alternatives` | `OssAlternative`, `AlternativeComparison` | Self-host difficulty score, license compatibility checker. |
| **Self-Hosted Explorer** | `/home/selfhost-projects`| Orbit OSS | `/app/oss/selfhost` | `SelfHostProject`, `DockerConfig` | One-click docker compose generation, hardware resource estimator. |
| **Bounties Explorer** | `/home/bounties` | Orbit OSS | `/app/oss/bounties` | `OssBounty`, `UserBookmark` | Currency conversion, verified status verification, skill filter. |
| **GitHub Selfbot** | `/home/bot` | Orbit OSS | `/app/oss/selfbot` | `SelfbotConfig`, `SelfbotCommand`, `SelfbotLog` | Runs local-first or via GitHub webhook, fine-grained opt-in safety controls. |
| **Repo Analyzer** | `/home/repo-analyzer` | Orbit Recon / OSS | `/app/recon/repo` | `RepoAnalysis`, `ArchitectureNode` | Deep AST dependency analysis, local git repo inspection. |
| **Custom Timelines** | `/home/timelines` | Orbit OSS | `/app/oss/timelines` | `CustomTimeline`, `TimelineRepo` | Multi-user isolated timelines, workspace sharing. |
| **Contributor Leaderboard**| `/home/contributors` | Orbit OSS | `/app/oss/contributors` | `ContributorProfile`, `ContributionMetric` | Multi-user team leaderboards within local workspaces. |
| **Community Forum** | `/home/forum` | Orbit Community | `/app/community/forum` | `ForumPost`, `ForumReply`, `ForumTag` | Markdown editor, code snippet runner, workspace channels. |
| **Developer Marketplace** | `/home/marketplace` | Orbit Community | `/app/community/marketplace` | `MarketplaceListing`, `ListingApplication` | Local peer-to-peer developer directory, project matchmaking. |
| **Ossistant AI** | `/chat` | Orbit AI | `/app/ai/chat` | `AiConversation`, `AiMessage` | Local LLM (Ollama) support, fully private zero-cloud option. |
| **Alert Rules** | `/home/alerts` | Orbit Pulse | `/app/pulse/alerts` | `AlertRule`, `NotificationRecord` | Native desktop notifications + optional Telegram/ntfy webhooks. |

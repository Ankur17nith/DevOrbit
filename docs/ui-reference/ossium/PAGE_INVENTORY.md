# Ossium Deep Reverse Engineering: Page Inventory

This document provides a comprehensive inventory of all discovered public and authenticated routes, their URLs, functions, and key UI sections.

---

## 1. Route Inventory

| Route | Page Title / Purpose | Key UI Modules & Features | Auth Requirement |
|---|---|---|---|
| `/` | Landing Page | Hero banner, demo dashboard preview, platform features breakdown, social proof, CTA buttons. | Public |
| `/home` | Top OSS Discovery | Curated repository catalog, language selector, search bar, topic filter pills, repo cards with stars/forks/commits. | Public |
| `/home/trending` | Trending Repositories | Rising GitHub repos, daily/weekly/monthly time window, language filter, star acceleration indicators. | Public |
| `/home/issues` | Issue Explorer | Good first issues, help-wanted issues, language/label filters, unassigned issues filter, quick link to GitHub issue. | Public |
| `/home/web3` | Web3 OSS Projects | Curated crypto, DeFi, and blockchain open-source repositories. | Public |
| `/home/curated-guide` | Curated Repositories Guide | Themed lists (developer tools, AI, system utilities, web frameworks). | Public |
| `/home/oss-alternatives`| Open-Source Alternatives | SaaS-to-FOSS directory (e.g. Supabase vs Firebase, PostHog vs Mixpanel), license badges, self-host readiness. | Public |
| `/home/selfhost-projects`| Self-Hosted Software Explorer | Curated self-hostable projects with Docker support tags and complexity meters. | Public |
| `/home/gsoc` | Google Summer of Code Orgs | 606+ GSoC participating organizations, participation years timeline, tech stack tags, project counts. | Public |
| `/home/oss-programs` | OSS Mentorship Programs | Directory of programs: Season of KDE, LFX Mentorship, Outreachy, MLH Fellowship, Hacktoberfest. | Public |
| `/home/yc-oss` | Y Combinator OSS | YC-backed open source companies, funding batch, repo metrics. | Public |
| `/eligibility` | Program Eligibility Checker | Interactive criteria checker for students and developers evaluating mentorship programs. | Public |
| `/oss-perks` | OSS Contributor Perks | Free cloud credits, developer tools, licenses for open source contributors. | Public |
| `/chat` | Ossistant AI Assistant | AI chat co-pilot for explaining repos, CONTRIBUTING files, issue walkthroughs, preparation plans. | Public (session saves history) |
| `/home/bot` | GitHub Selfbot | Maintainer bot configurator: welcome message editor, goodbye message editor, custom slash command rules. | Requires GitHub Session |
| `/home/repo-analyzer` | Repo Analyzer (Repolyze) | Deep repository health inspection: commit velocity, PR merge rate, contributor diversity, license audit. | Public |
| `/home/alerts` | Alert Rules | Notification criteria for new issues matching specific labels, languages, and keywords. | Requires User Account |
| `/home/contributors` | Contributors Leaderboard | Ranked contributor leaderboard by PR score, merged PRs, open issues, lines added/deleted. | Public |
| `/home/forum` | Community Forum | Threaded discussion forum, category tags, upvoting, solution markers. | Public read / Auth write |
| `/home/bounties` | Open Source Bounties | Monetary bounty listings (USD & crypto), difficulty badges, issue links, deadlines. | Public |
| `/home/resources` | Resource Hub | Contribution guides, Git tutorials, GSoC proposal writing templates. | Public |
| `/home/bookmarks` | User Bookmarks | Saved repositories, issues, and organizations. | Requires User Account |
| `/home/claim` | Claim & Verify Project | Verification flow for repo maintainers to claim badge. | Requires Maintainer Auth |
| `/home/marketplace` | Developer Marketplace | OSS collaboration opportunities, project hiring listings. | Public |
| `/home/timelines` | Custom Issue Timelines | User-curated multi-repo issue feed. | Requires User Account |
| `/home/settings` | Account & Integrations | Profile details, linked GitHub account, alert preferences. | Requires User Account |
| `/auth` | Authentication Portal | GitHub OAuth sign-in and session initiation. | Public |
| `/about` | About Ossium | Product vision, background, team. | Public |
| `/brand` | Brand Assets | Logos, color tokens, typography. | Public |
| `/premium` | Pricing & Subscription | Pro tier features (extended alerts, unlimited timelines, advanced analytics). | Public |

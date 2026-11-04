# Agent Skills Inventory and Configuration

This document catalogues all official agent skills and reverse engineering tooling configured for **DevOrbit**, their source repositories, installation locations, verification status, and operational responsibilities.

---

## 1. Skill Registry

| Skill Name | Source Repository | Local Path | Verified Engine / Client | Role / Responsibility |
|---|---|---|---|---|
| **frontend-design** | [anthropics/skills](https://github.com/anthropics/skills) | `.agents/skills/frontend-design` | Antigravity, Universal | Guides distinctive visual design, design tokens, typography scales, layout hierarchy, and anti-cliché review. |
| **vercel-react-best-practices** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `.agents/skills/vercel-react-best-practices` | Antigravity, Universal | React and Next.js performance optimization: waterfall elimination, dynamic imports, bundle size controls, re-render avoidance. |
| **vercel-composition-patterns** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `.agents/skills/vercel-composition-patterns` | Antigravity, Universal | Scalable component composition patterns: compound components, state lifting, avoiding boolean prop proliferation. |
| **web-design-guidelines** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `.agents/skills/web-design-guidelines` | Antigravity, Universal | Web interface guidelines compliance, accessibility audits (WCAG), focus management, keyboard navigation, tap targets. |
| **rea** (REA Reverse Engineering Agent) | [morluto/rea](https://github.com/morluto/rea) | Global CLI `rea@6.8.0`, MCP config `~/.gemini/config/mcp_config.json` | Node.js v24.22.1, Antigravity MCP | Static and runtime reverse engineering, web DOM/CDP inspection, binary analysis, protocol mapping, and evidence synthesis. |

---

## 2. Installation & Verification Commands

### 2.1 Anthropic Frontend Design
- **Command**:
  ```bash
  npx skills add anthropics/skills --skill frontend-design -y
  ```
- **Verification**:
  - Location: `.agents/skills/frontend-design/SKILL.md`
  - Version: Aligned with upstream repository.
  - Test: Verified file read and rule inspection.

### 2.2 Vercel React Best Practices
- **Command**:
  ```bash
  npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices -y
  ```
- **Verification**:
  - Location: `.agents/skills/vercel-react-best-practices/SKILL.md`
  - Rules: 70 rules across 8 categories (eliminating waterfalls, bundle size, server/client data fetching).

### 2.3 Vercel Composition Patterns
- **Command**:
  ```bash
  npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns -y
  ```
- **Verification**:
  - Location: `.agents/skills/vercel-composition-patterns/SKILL.md`
  - Rules: Compound components, context decoupling, explicit variants.

### 2.4 Web Design Guidelines
- **Command**:
  ```bash
  npx skills add vercel-labs/agent-skills --skill web-design-guidelines -y
  ```
- **Verification**:
  - Location: `.agents/skills/web-design-guidelines/SKILL.md`
  - Rules: Accessibility, form usability, responsive design standards.

### 2.5 REA (Reverse Engineering Agent)
- **Node.js Environment**: Node v24.22.1 installed via NVM (`nvm use --delete-prefix v24.22.1`).
- **Global Installation**:
  ```bash
  npm install -g rea-agents@6.8.0
  ```
- **Antigravity MCP Integration**:
  ```bash
  rea setup --client antigravity -y
  ```
- **Status Check**:
  ```bash
  rea doctor
  ```
  - CLI version: `6.8.0`
  - Skill status: `installed_version: "49", installed_tool_count: 229, state: aligned`
  - Client registration: `antigravity -> /home/ankurgupta/.gemini/config/mcp_config.json -> [/home/ankurgupta/.nvm/versions/node/v24.22.1/bin/rea, mcp] (aligned)`

---

## 3. Operational Responsibilities

1. **Frontend Architecture & Theming**:
   - `frontend-design` mandates that DevOrbit's interface not settle for generic SaaS card templates.
   - Design tokens must be defined deliberately (base colors, functional accents, typography, spacing).
2. **React Engineering**:
   - `vercel-react-best-practices` prevents cascading network waterfalls in data exploration and dashboards.
   - Independent components must utilize React 19 / modern React patterns with minimal re-renders.
3. **Component Reusability**:
   - `vercel-composition-patterns` prevents monolithic multi-boolean-prop widgets; compound components are used for filters, tabs, cards, and modal dialogs.
4. **Accessibility & Usability**:
   - `web-design-guidelines` ensures WCAG 2.1 AA compliance, keyboard navigation, accessible color contrasts, and screen-reader semantics.
5. **Reverse Engineering & UI Recon**:
   - `rea` and Playwright are used to inspect external target DOMs, tokens, network contracts, and structures, providing evidence-based UI reproduction without copyright infringement.

---

## 4. Known Limitations

- REA analysis engines requiring Hopper or Ghidra are marked optional for web reconnaissance (CDP, DOM extraction, JavaScript runtime, and OpenAPI/linkset analysis are fully enabled).
- Node.js LTS (v24.22.1) is pinned via nvm to guarantee engine compatibility.

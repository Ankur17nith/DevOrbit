# REA (Reverse Engineering Agent) Setup & Verification Guide

This document records the installation, configuration, verification, and workflow protocols for **REA** inside the DevOrbit development environment.

---

## 1. Overview

**REA** is the official reverse-engineering agent framework providing 175 CLI commands and 229 MCP tools for analyzing web applications, JavaScript runtimes, binary protocols, and system boundaries.

- **Upstream Repository**: [https://github.com/morluto/rea](https://github.com/morluto/rea)
- **Official Documentation**: [https://rea.tools/](https://rea.tools/)
- **Installed Version**: `6.8.0`

---

## 2. Environment Prerequisites

- **Node.js Engine**: Requires `^22.23.4 || ^24.22.1 || >=26.12.1`.
- **System Version Configured**: Node.js `v24.22.1` via `~/.nvm`.
- **Global Path**: `rea` (available in standard PATH via NVM or global bin)

---

## 3. MCP Integration Configuration

The REA MCP server is registered directly inside Antigravity's global MCP manifest:
- **Config Path**: `~/.gemini/config/mcp_config.json`
- **Definition**:
```json
{
  "mcpServers": {
    "rea": {
      "command": "rea",
      "args": ["mcp"]
    }
  }
}
```

---

## 4. Verification Check

Running `rea doctor` confirms:
```yaml
identity:
  cli_package_version: 6.8.0
  expected_skill_version: "49"
  catalog:
    counts:
      cli_commands: 175
      mcp_tools: 229
      mcp_prompts: 6
  skill:
    installed_version: "49"
    installed_tool_count: 229
    state: aligned
  registrations:
    - client: antigravity
      config_path: ~/.gemini/config/mcp_config.json
      command: [rea, mcp]
      state: aligned
```

---

## 5. Web Reconnaissance Commands

For inspecting target websites (such as Ossium and user-specified sites in Orbit Recon):

- **Inspect Web Page via CDP**:
  ```bash
  rea inspect-web-page --url <url>
  ```
- **Observe Web Execution**:
  ```bash
  rea observe-web-execution --url <url>
  ```
- **Recover JavaScript Sources**:
  ```bash
  rea recover-javascript-sources --target <target-id>
  ```
- **Trace Web Module Imports**:
  ```bash
  rea trace-web-module-imports --script-id <id>
  ```

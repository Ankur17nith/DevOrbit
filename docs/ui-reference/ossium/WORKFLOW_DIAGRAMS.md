# Ossium Deep Reverse Engineering: Workflow Diagrams

This document illustrates the primary user and system workflows discovered in Ossium.

---

## 1. Open Source Issue Discovery & Picking Workflow

```mermaid
flowchart TD
    A["Developer Lands on Discover / Issues"] --> B["Select Language (e.g. TypeScript)"]
    B --> C["Filter by Difficulty / Label ('good first issue')"]
    C --> D["Filter Unassigned Issues Only"]
    D --> E["Browse Filtered Issue Cards"]
    E --> F["Open Issue Slide-Over Drawer"]
    F --> G["Inspect Issue Details & Repo Context"]
    G --> H{"Ask AI for Plan?"}
    H -- Yes --> I["Launch Ossistant Guidance Plan"]
    I --> J["Bookmark Issue & Navigate to GitHub"]
    H -- No --> J
```

---

## 2. GSoC Organization Exploration Workflow

```mermaid
flowchart TD
    A["User Opens GSoC Directory (/home/gsoc)"] --> B["Enter Tech Stack Query (e.g. 'Rust', 'Kubernetes')"]
    B --> C["Filter by Participation Years (e.g. Active in 2025/2026)"]
    C --> D["Review Matched Organization Cards"]
    D --> E["Inspect Participation History & Historical Projects"]
    E --> F["Link Out to Organization Tech Repositories"]
```

---

## 3. GitHub Selfbot Maintenance Workflow

```mermaid
flowchart TD
    A["Maintainer Authenticates via GitHub"] --> B["Select Target Repository"]
    B --> C["Enable Welcome Message Module"]
    C --> D["Configure Markdown Welcome Template"]
    D --> E["Enable Custom Commands (e.g. /guide)"]
    E --> F["Save Configuration & Deploy Webhook Listener"]
    F --> G["New Contributor Files First Issue"]
    G --> H["Selfbot Automatically Greets Contributor with Template"]
```

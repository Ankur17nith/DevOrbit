# DevOrbit Typography Specification

---

## 1. Type Families

- **Display & Headings**: `Manrope` (Geometric, contemporary, crisp numerals and legibility at large scale).
- **Body & UI**: `Inter` (Standard high-legibility UI sans-serif).
- **Monospace & Code**: `JetBrains Mono` (Clear ligatures, distinctive punctuation, code-optimized tabular numbers).

---

## 2. Scale & Hierarchy

| Class / Token | Font Size | Line Height | Weight | Letter Spacing | Typical Usage |
|---|---|---|---|---|---|
| `text-2xl font-display font-bold` | 24px (1.5rem) | 32px | 700 | -0.025em | Main page headers (Dashboard, OSS Catalog) |
| `text-xl font-display font-semibold` | 20px (1.25rem) | 28px | 600 | -0.02em | Section titles, modal titles |
| `text-base font-semibold text-fg-bright` | 16px (1.0rem) | 24px | 600 | -0.01em | Card headings, table column groups |
| `text-sm font-medium text-fg-muted` | 14px (0.875rem) | 20px | 500 | normal | Primary content text, list items, input fields |
| `text-xs text-fg-signal` | 12px (0.75rem) | 16px | 400 | +0.01em | Tags, badges, timestamps, table metadata |
| `font-mono text-xs text-fg-bright` | 12px (0.75rem) | 18px | 400 / 500 | 0 | Code blocks, hashes, commit SHAs, file paths |

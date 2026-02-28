# Codebase Context Generation

Generate or update `.github/copilot-instructions.md` for this repository. This file is automatically included in every GitHub Copilot interaction, so it must be accurate, dense, and token-efficient.

**TARGET SIZE: 500–800 lines max.** Every line must earn its place. If it wouldn't help an AI write correct code in this repo, cut it.

---

## Rules

- Every claim must come from actual files — do NOT guess or hallucinate.
- Use tables and lists, not paragraphs. Tables are denser.
- Use code blocks sparingly — only for patterns that are hard to describe otherwise. Max 10 lines per block.
- Omit any section that doesn't apply to this codebase.
- Do NOT reproduce full type definitions, full enum member lists, or full test files. Summarize with key fields/members only.
- Reference file paths relative to project root.
- If something is ambiguous in the code, say so rather than inventing an answer.

---

## Sections to Produce

### 1. Project Overview

Key-value table: name, purpose, repo host, languages, runtime, module system, VS Code engine compatibility.

### 2. What Is Colored Title Bar

A concise explanation of what the extension does, how it works, and who uses it. Structure as:

- **Opening paragraph** (2–3 sentences): What it is and why it exists.
- **How It Works** — Numbered list (3 steps max): brief workflow from hue selection → color generation → writing workspace settings.
- **What It Produces** — Table of VS Code `workbench.colorCustomizations` keys written by the extension.
- **Who Uses It** — One sentence on end users.

Keep to ~25 lines. Derive from README.md and actual source code.

### 3. Technology Stack

Single table — only rows that apply:

| Category | Technology | Notes |
|----------|------------|-------|

Categories: Runtime, Language, Build, Test, Lint, CI/CD, Packaging, Key Libraries.

### 4. Project Structure

Directory tree (abbreviated — max 15 lines). Then a table of source modules:

| Module | Path | Purpose |
|--------|------|---------|

### 5. Development & Configuration

Combine into one section:
- System requirements and setup steps (bullet list)
- Key config files and their purpose (table)
- Build/dev/test commands from package.json scripts (table)

### 6. Architecture & Key Patterns

**Most important section.** Identify the top patterns (aim for 3–7). For each:
- Name and one-sentence explanation
- Key method signatures (inline, not full tables)
- Where it lives (file path)

Cover: color generation pipeline (HSL → RGB → hex), WCAG contrast selection, theme-aware ranges, deterministic seeding from workspace path, inactive/border color derivation, non-destructive workspace settings management.

### 7. Key Types & Interfaces

Document only types that define the core domain model. For each:
- Name, file path, one-line purpose
- **Key fields only** — in a compact list

Cap at ~10 types.

### 8. Naming Conventions

Single table covering TypeScript conventions observed in this codebase: file naming (kebab-case), exports, constants, interfaces, enums.

### 9. Testing

Brief bullets:
- Framework and config location
- File location convention (`src/test/*.test.ts`)
- Test style (describe/it blocks, `assert` module)
- How to run tests

### 10. Domain Glossary

Table of domain-specific terms (HSL, WCAG contrast ratio, hue preset, theme kind, title bar keys, workspace seed, etc.). Derive from code, not imagination. Cap at ~12 terms.

### 11. Anti-Patterns & Gotchas

Bullet list of DO NOTs — max 5–8 items. One line each with brief wrong→right hint. Focus on:
- Not touching non-title-bar color keys
- Not using `Math.random()` for deterministic paths
- Keeping `ThemeKind` enum in sync with VS Code's `ColorThemeKind`
- Always choosing foreground via WCAG contrast, never hardcoding
- Not writing to Global settings scope (must be Workspace)

---

## Output Requirements

1. **Single file**: `.github/copilot-instructions.md`
2. **Start with heading** `# Copilot Instructions — Colored Title Bar` followed by a blockquote explaining this file is auto-included in every Copilot interaction.
3. **Overrides section first** — immediately after the header, include behavioral overrides as highest-priority rules:
   - Use CommonJS module system (`module: "commonjs"` in tsconfig) — no ES module syntax in output files.
   - Use double quotes for strings (match existing codebase style).
   - Use explicit return types on all exported functions.
   - Copyright header on every `.ts` file: `// Copyright (c) 2026 Will Stuckey. MIT License — see LICENSE for details.`
   - `strict: true` TypeScript — no `any` unless unavoidable; prefer explicit types.
   - Semicolons required (`semi: "warn"` in ESLint).
   - Always use curly braces for control flow (`curly: "warn"`).
   - Use `===` / `!==` exclusively (`eqeqeq: "warn"`).
   - All VS Code API access goes through `TitleBarManager`; color math stays in `color-generator.ts`.
   - Only write to `vscode.ConfigurationTarget.Workspace`, never Global or WorkspaceFolder.
   - Only touch `titleBar.*` keys inside `workbench.colorCustomizations`.
   - Foreground color must always be chosen via WCAG 2.0 contrast ratio (≥ 4.5 : 1).
   - File naming: kebab-case for `.ts` files.
   - Tests use Mocha + Node `assert`; no additional test framework dependencies.
4. **Then sections 1–11** as specified above (no Deployment section — this is a VS Code extension published via `vsce`).
5. **End with metadata**: "Last updated" date.
6. **500–800 lines.** If your draft exceeds 800 lines, cut the least useful content until it fits.

---

## Quality Checklist

Before finalizing:
- [ ] All referenced file paths exist
- [ ] Code examples actually match the codebase
- [ ] Build commands match package.json scripts
- [ ] No placeholder text or TODOs remain
- [ ] Override rules reflect actual `.eslintrc.json`, `tsconfig.json`, and code conventions
- [ ] VS Code extension specifics are accurately described (activation, commands, settings)

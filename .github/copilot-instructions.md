# Copilot Instructions — Colored Title Bar

> **Auto-included in every GitHub Copilot interaction.**
> This file provides repository context so Copilot can generate accurate, idiomatic code for this project.
> Keep it factual, dense, and up to date. Target: 500–800 lines.

---

## Overrides — Highest-Priority Rules

These rules take precedence over any Copilot defaults. Follow them in every response.

### Module System & Language

- **CommonJS** — `tsconfig.json` uses `"module": "commonjs"`. Use `import`/`export` syntax (TypeScript handles downlevel). Never emit raw `require()` in `.ts` files.
- **Target**: ES2020 (`"target": "ES2020"`, `"lib": ["ES2020"]`).
- **Strict mode**: `"strict": true` — no `any` unless truly unavoidable; prefer explicit types.
- Use **explicit return types** on all exported functions.

### Style & Formatting

- **Double quotes** for all strings — match existing codebase style.
- **Semicolons required** — ESLint rule `"semi": "warn"`.
- **Curly braces required** for all control flow — ESLint rule `"curly": "warn"`.
- **Strict equality only** — use `===` / `!==` exclusively (`"eqeqeq": "warn"`).

### File Conventions

- **Kebab-case** for all `.ts` filenames (e.g., `color-generator.ts`, `title-bar-manager.ts`).
- **Copyright header** on every `.ts` file:
  ```
  // Copyright (c) 2026 Will Stuckey. MIT License — see LICENSE for details.
  ```
- Source files live in `src/`. Tests in `src/test/`. Compiled output goes to `out/`.

### Architecture Boundaries

- **All VS Code API access** goes through `TitleBarManager` (`src/title-bar-manager.ts`).
- **Pure color math** stays in `color-generator.ts` — no `vscode` imports there.
- **Only write to** `vscode.ConfigurationTarget.Workspace` — never Global or WorkspaceFolder.
- **Only touch `titleBar.*` keys** inside `workbench.colorCustomizations` — never modify other color keys.
- **Foreground color** must always be chosen via WCAG 2.0 contrast ratio (≥ 4.5 : 1) using `chooseForeground()` — never hardcode white or black.

### Testing

- Tests use **Mocha** + Node.js built-in **`assert`** module — no additional test framework dependencies.
- Test files: `src/test/*.test.ts`, compiled to `out/test/*.test.js`.

---

## 1. Project Overview

| Key          | Value                                                    |
|--------------|----------------------------------------------------------|
| Name         | Colored Title Bar                                        |
| Package name | `colored-title-bar`                                      |
| Purpose      | VS Code extension that assigns unique colors to title bars for workspace identification |
| Repo         | [github.com/wstuckey/colored-title-bar](https://github.com/wstuckey/colored-title-bar) |
| Publisher    | `wstuckey` (VS Code Marketplace)                         |
| Language     | TypeScript (strict)                                      |
| Runtime      | Node.js (VS Code extension host)                         |
| Module system| CommonJS                                                 |
| VS Code engine | `^1.85.0`                                             |
| License      | MIT                                                      |
| Version      | 0.1.2                                                    |

---

## 2. What Is Colored Title Bar

Colored Title Bar is a VS Code extension that assigns a unique, visually appealing color to the title bar of each workspace window. It solves the problem of distinguishing multiple VS Code windows at a glance — each project automatically gets a distinct, deterministic color the first time it is opened.

### How It Works

1. **Hue selection** — A hue is chosen by one of three methods: random generation, user-picked preset (14 named families), or deterministic hashing of the workspace folder URI (`hashStringToHue()`).
2. **Color generation** — Saturation and lightness are tuned for the active theme (Dark, Light, High Contrast). Foreground (white/black) is selected using WCAG 2.0 contrast ratios. Inactive and border variants are derived from the active color.
3. **Application** — The five computed hex values are merged into the workspace's `workbench.colorCustomizations` setting via `TitleBarManager.applyColors()`.

### What It Produces

| `workbench.colorCustomizations` Key | Description                                |
|--------------------------------------|--------------------------------------------|
| `titleBar.activeBackground`          | Background color of the focused window     |
| `titleBar.activeForeground`          | Text/icon color of the focused window      |
| `titleBar.inactiveBackground`        | Background when window loses focus (muted) |
| `titleBar.inactiveForeground`        | Text/icon when window loses focus (80% α)  |
| `titleBar.border`                    | Subtle border below the title bar          |

### Commands

| Command ID                    | Title                                | Behavior                                                |
|-------------------------------|--------------------------------------|---------------------------------------------------------|
| `coloredTitleBar.randomize`   | Colored Title Bar: Randomize Color   | Generate random theme-appropriate color and apply        |
| `coloredTitleBar.pickHue`     | Colored Title Bar: Pick Color Family | Show quick-pick of 14 hue presets, apply selected       |
| `coloredTitleBar.reset`       | Colored Title Bar: Reset to Default  | Remove all 5 title-bar keys, clear saved state          |

### Settings

| Key                              | Type    | Default | Description                                           |
|----------------------------------|---------|---------|-------------------------------------------------------|
| `coloredTitleBar.colorOnStartup` | boolean | `false` | Apply a fresh random color each time VS Code starts   |

### Who Uses It

Any VS Code user who works with multiple workspace windows and wants instant visual differentiation.

---

## 3. Technology Stack

| Category     | Technology                          | Notes                                       |
|--------------|-------------------------------------|---------------------------------------------|
| Runtime      | Node.js (VS Code extension host)    | No standalone runtime                       |
| Language     | TypeScript 5.3+                     | `strict: true`, target ES2020               |
| Build        | `tsc` (TypeScript compiler)         | Output to `out/`                            |
| Test         | Mocha 10 + Node `assert`            | 1 test file, 19 suites, 61 test cases       |
| Lint         | ESLint 8 + `@typescript-eslint`     | Config: `.eslintrc.json`                    |
| CI/CD        | GitHub Actions                      | `ci.yml` (Node 20/22), `publish.yml` (manual) |
| Packaging    | `@vscode/vsce`                      | `npx @vscode/vsce package` / `publish`      |
| Key lib      | `vscode` (types only, `@types/vscode`) | No runtime npm dependencies              |

> **Zero runtime dependencies.** The extension has only `devDependencies`.

---

## 4. Project Structure

```
colored-title-bar/
├── .eslintrc.json              # ESLint config
├── .github/
│   ├── copilot-instructions.md # This file
│   ├── prompts/                # Copilot prompt files
│   └── workflows/
│       ├── ci.yml              # CI: lint, compile, test, package
│       └── publish.yml         # Manual publish to Marketplace
├── images/                     # Extension icon & banner
├── package.json                # Extension manifest & scripts
├── tsconfig.json               # TypeScript config
└── src/
    ├── color-generator.ts      # Pure color math (HSL/RGB/hex, WCAG, generation)
    ├── extension.ts            # Extension entry point (activate/deactivate)
    ├── title-bar-manager.ts    # VS Code API wrapper for title bar settings
    ├── types.ts                # Shared type definitions
    └── test/
        └── color-generator.test.ts  # Unit tests for color-generator
```

### Source Modules

| Module               | Path                         | Purpose                                                   |
|----------------------|------------------------------|-----------------------------------------------------------|
| `color-generator`    | `src/color-generator.ts`     | All color math: HSL↔RGB↔hex conversion, WCAG contrast, theme-aware generation, deterministic seeding, inactive/border derivation |
| `extension`          | `src/extension.ts`           | Extension lifecycle (`activate`/`deactivate`), command registration, startup auto-color logic |
| `title-bar-manager`  | `src/title-bar-manager.ts`   | Reads/writes `workbench.colorCustomizations` at workspace scope, theme detection, workspace seed retrieval |
| `types`              | `src/types.ts`               | Shared interfaces (`HSL`, `RGB`, `TitleBarColors`) and `ThemeKind` enum |

### Lines of Code

| File                           | Lines |
|--------------------------------|-------|
| `src/color-generator.ts`      | 293   |
| `src/title-bar-manager.ts`    | 146   |
| `src/extension.ts`            | 112   |
| `src/types.ts`                | 31    |
| `src/test/color-generator.test.ts` | 462 |
| **Total**                      | **1044** |

---

## 5. Development & Configuration

### System Requirements

- Node.js 20 or 22 (CI tests both)
- npm (lockfile: `package-lock.json`)
- VS Code `^1.85.0` (for extension host)

### Setup

```bash
git clone https://github.com/wstuckey/colored-title-bar.git
cd colored-title-bar
npm install
npm run compile
# Press F5 in VS Code to launch Extension Development Host
```

### Key Config Files

| File              | Purpose                                              |
|-------------------|------------------------------------------------------|
| `package.json`    | Extension manifest: commands, settings, activation, scripts |
| `tsconfig.json`   | TypeScript compiler options (CommonJS, ES2020, strict) |
| `.eslintrc.json`  | ESLint rules: semi, curly, eqeqeq + TS recommended  |

### npm Scripts

| Script             | Command                                 | Purpose                            |
|--------------------|-----------------------------------------|------------------------------------|
| `compile`          | `tsc -p ./tsconfig.json`               | One-shot build                     |
| `watch`            | `tsc -watch -p ./tsconfig.json`        | Incremental build (file watcher)   |
| `lint`             | `eslint src --ext ts`                   | Run ESLint on all `.ts` files      |
| `test:unit`        | `npm run compile && mocha 'out/test/**/*.test.js'` | Compile then run Mocha tests |
| `test`             | `npm run test:unit`                     | Alias for `test:unit`              |
| `package`          | `vsce package`                          | Build `.vsix` for local install    |
| `vscode:prepublish`| `npm run compile`                      | Auto-runs before `vsce publish`    |

### Extension Manifest Highlights

| Key                  | Value                                                       |
|----------------------|-------------------------------------------------------------|
| Activation event     | `onStartupFinished` (runs after VS Code window is ready)    |
| Main entry point     | `./out/extension.js`                                        |
| Commands (3)         | `coloredTitleBar.randomize`, `coloredTitleBar.pickHue`, `coloredTitleBar.reset` |
| Settings (1)         | `coloredTitleBar.colorOnStartup` (boolean, default `false`) |
| Categories           | Themes, Other                                               |

---

## 6. Architecture & Key Patterns

### 6.1 Color Generation Pipeline (HSL → RGB → Hex)

All color math is pure and side-effect-free, living entirely in `src/color-generator.ts`.

**Pipeline:**
- `generateAppealingHsl(theme)` → `HSL` — random hue, theme-tuned saturation & lightness
- `hslToRgb(hsl)` → `RGB` — standard HSL-to-RGB conversion
- `rgbToHex(rgb)` → `string` — 6-digit `#rrggbb` hex string
- Shorthand: `hslToHex(hsl)` → `string`

**Key signatures:**
- `generateAppealingHsl(theme: ThemeKind): HSL`
- `hslFromHue(hue: number, theme: ThemeKind): HSL`
- `hslToRgb(hsl: HSL): RGB`
- `rgbToHex(rgb: RGB): string`
- `hslToHex(hsl: HSL): string`
- `hexToRgb(hex: string): RGB`

### 6.2 Hue-Anchored Generation with Wave Variation

`hslFromHue()` generates color from a fixed hue by applying a sinusoidal wave across the hue wheel to vary saturation and lightness. This produces a wider palette — warm hues lean more saturated, cool hues lean lighter.

```typescript
const wave = Math.sin(hueNorm * Math.PI * 2); // -1..1 cycle over hue wheel
// Dark theme: s = 40 + wave * 20 (range 20–60), l = 22 + wave * 8 (range 14–30)
```

**Location:** `hslFromHue()` in `src/color-generator.ts`

### 6.3 Theme-Aware Color Ranges

Saturation and lightness ranges vary by theme to ensure generated colors look good:

| Theme          | Saturation Range | Lightness Range | Foreground |
|----------------|------------------|-----------------|------------|
| Dark           | 20 – 85%         | 12 – 40%        | Usually white |
| Light          | 25 – 85%         | 65 – 90%        | Usually black |
| High Contrast  | 40 – 90%         | 10 – 28%        | Usually white |

**Location:** `generateAppealingHsl()` and `generateTitleBarColorsFromSeed()` in `src/color-generator.ts`.

Theme detection maps VS Code's `ColorThemeKind` to the simplified `ThemeKind` enum in `TitleBarManager.getThemeKind()`.

### 6.4 WCAG 2.0 Contrast Selection

Foreground color (white or black) is chosen based on which provides better contrast against the background, using WCAG relative luminance.

**Key signatures:**
- `relativeLuminance(rgb: RGB): number` — returns 0–1
- `contrastRatio(a: RGB, b: RGB): number` — returns 1–21
- `chooseForeground(backgroundHex: string): string` — returns `"#ffffff"` or `"#000000"`

**Constraint:** All generated color sets must have a foreground contrast ratio ≥ 4.5 : 1 (WCAG AA).

**Location:** `src/color-generator.ts`

### 6.5 Deterministic Seeding from Workspace Path

Each workspace automatically gets a unique, stable color derived from its folder URI. The same workspace always produces the same color.

**Key signatures:**
- `hashStringToHue(input: string): number` — DJB2-style hash → hue in [0, 360)
- `hashStringToFloat(input: string, seed?: number): number` — independent hash → float in [0, 1) for saturation/lightness variation
- `generateTitleBarColorsFromSeed(seed: string, theme: ThemeKind): TitleBarColors`

**Workflow:**
1. `TitleBarManager.getWorkspaceSeed()` returns the first workspace folder's URI string
2. `hashStringToHue()` and `hashStringToFloat()` (with different seed offsets) produce hue, saturation factor, and lightness factor
3. These are mapped to theme-appropriate ranges and assembled into a full `TitleBarColors`

**Location:** `src/color-generator.ts` (math), `src/extension.ts` (orchestration), `src/title-bar-manager.ts` (seed retrieval)

### 6.6 Inactive & Border Color Derivation

Inactive and border colors are derived from the active color, not generated independently.

| Derived Color        | Rule                                                        |
|----------------------|-------------------------------------------------------------|
| Inactive background  | Saturation × 0.85; lightness ±1–2 depending on theme       |
| Inactive foreground  | Active foreground hex + `cc` suffix (80% opacity)           |
| Border               | Saturation × 0.6; lightness −6 (dark) or −12 (light)       |

**Key signatures:**
- `deriveInactiveHsl(hsl: HSL, theme: ThemeKind): HSL`
- `deriveInactiveForeground(activeForeground: string): string`
- `deriveBorderHsl(hsl: HSL, theme: ThemeKind): HSL`

**Location:** `src/color-generator.ts`

### 6.7 Non-Destructive Workspace Settings Management

The extension only reads and writes `titleBar.*` keys within `workbench.colorCustomizations`. All other keys are preserved via spread:

```typescript
const updated = { ...current, "titleBar.activeBackground": colors.activeBackground, ... };
```

Reset removes only the five `titleBar.*` keys and clears `workbench.colorCustomizations` entirely if no other keys remain.

**Key class:** `TitleBarManager` in `src/title-bar-manager.ts`
- `applyColors(colors: TitleBarColors): Promise<boolean>`
- `resetColors(): Promise<void>`
- `hasSavedColors(): boolean` — checks workspaceState memento
- `getSavedColors(): TitleBarColors | undefined`

**State persistence:** Colors are saved to `vscode.Memento` (workspaceState) under key `coloredTitleBar.currentColors`.

### 6.8 Startup Auto-Color Logic

In `activate()` (`src/extension.ts`), the startup behavior follows this decision tree:

1. If no workspace is open → do nothing
2. If `coloredTitleBar.colorOnStartup` is `true` → generate random color every launch
3. Else if no saved colors exist → deterministic color from workspace seed (first-time only)
4. Else → keep existing colors (no-op)

---

## 7. Key Types & Interfaces

All types are defined in `src/types.ts`.

### HSL

- **Purpose:** Represents a color in Hue-Saturation-Lightness space.
- **Fields:** `h: number` (0–360), `s: number` (0–100), `l: number` (0–100)

### RGB

- **Purpose:** Represents a color in Red-Green-Blue space.
- **Fields:** `r: number` (0–255), `g: number` (0–255), `b: number` (0–255)

### TitleBarColors

- **Purpose:** Complete set of five hex color strings written to workspace settings.
- **Fields:**
  - `activeBackground: string` — hex for focused window background
  - `activeForeground: string` — hex for focused window text
  - `inactiveBackground: string` — hex for unfocused window background
  - `inactiveForeground: string` — hex (8-digit with alpha) for unfocused window text
  - `border: string` — hex for title bar border

### ThemeKind (enum)

- **Purpose:** Simplified theme classification for color generation.
- **Members:** `Dark = "dark"`, `Light = "light"`, `HighContrast = "highContrast"`
- **Mapping from VS Code:**
  - `ColorThemeKind.Light` / `HighContrastLight` → `ThemeKind.Light`
  - `ColorThemeKind.HighContrast` → `ThemeKind.HighContrast`
  - `ColorThemeKind.Dark` (and default) → `ThemeKind.Dark`

### HuePreset (local interface in extension.ts)

- **Purpose:** Quick-pick item for the "Pick Color Family" command.
- **Fields:** Extends `vscode.QuickPickItem` with `hue: number`
- **14 presets:** Red (0°), Orange (30°), Amber (45°), Yellow (55°), Lime (80°), Green (120°), Teal (175°), Cyan (190°), Blue (220°), Indigo (245°), Purple (275°), Magenta (300°), Pink (330°), Rose (350°)

### TitleBarManager (class)

- **Purpose:** Encapsulates all VS Code API interactions for reading/writing title bar settings.
- **Location:** `src/title-bar-manager.ts`
- **Constructor:** `constructor(state: vscode.Memento)` — receives `context.workspaceState`
- **Key methods:** `getThemeKind()`, `hasWorkspace()`, `getWorkspaceSeed()`, `applyColors()`, `resetColors()`, `hasSavedColors()`, `getSavedColors()`

---

## 8. Naming Conventions

| Element            | Convention       | Example                            |
|--------------------|------------------|------------------------------------|
| `.ts` filenames    | kebab-case       | `color-generator.ts`               |
| Interfaces         | PascalCase       | `TitleBarColors`, `HSL`, `RGB`     |
| Enums              | PascalCase       | `ThemeKind`                        |
| Enum members       | PascalCase       | `ThemeKind.HighContrast`           |
| Classes            | PascalCase       | `TitleBarManager`                  |
| Functions          | camelCase        | `generateAppealingHsl`, `hslToRgb` |
| Constants (arrays) | UPPER_SNAKE_CASE | `HUE_PRESETS`, `TITLE_BAR_KEYS`    |
| Constants (simple) | UPPER_SNAKE_CASE | `STATE_KEY`                        |
| Local variables    | camelCase        | `activeForeground`, `hueNorm`      |
| Command IDs        | dotted camelCase | `coloredTitleBar.randomize`        |
| Setting keys       | dotted camelCase | `coloredTitleBar.colorOnStartup`   |

---

## 9. Testing

- **Framework:** Mocha 10 with Node.js built-in `assert` module (strict mode: `assert.strictEqual`, `assert.deepStrictEqual`)
- **Config:** Mocha invoked via npm script — `mocha 'out/test/**/*.test.js'`; types configured in `tsconfig.json` (`"types": ["node", "mocha"]`)
- **File location:** `src/test/*.test.ts` → compiled to `out/test/*.test.js`
- **Test style:** `describe`/`it` blocks with descriptive English names; utility helper `approx()` for floating-point comparisons
- **Coverage:** 1 test file, 19 `describe` suites, 61 individual test cases — covers all exported functions in `color-generator.ts`
- **Test suites:** `clamp`, `hslToRgb`, `rgbToHex`, `hexToRgb`, `hslToHex`, `relativeLuminance`, `contrastRatio`, `chooseForeground`, `generateAppealingHsl`, `hslFromHue`, `deriveInactiveHsl`, `deriveInactiveForeground`, `deriveBorderHsl`, `titleBarColorsFromHsl`, `generateTitleBarColors`, `generateTitleBarColorsFromHue`, `hashStringToHue`, `hashStringToFloat`, `generateTitleBarColorsFromSeed`
- **What is NOT tested:** `TitleBarManager` and `extension.ts` (requires VS Code extension host; no integration test setup currently)
- **Run tests:** `npm test` or `npm run test:unit` (compiles first, then runs Mocha)
- **CI:** Tests run on Node 20 and 22 via GitHub Actions (`ci.yml`)

---

## 10. Domain Glossary

| Term                  | Definition                                                                                      |
|-----------------------|-------------------------------------------------------------------------------------------------|
| HSL                   | Color space: Hue (0–360°), Saturation (0–100%), Lightness (0–100%)                              |
| RGB                   | Color space: Red, Green, Blue channels (0–255 each)                                             |
| Hex color             | `#rrggbb` string (6-digit) or `#rrggbbaa` (8-digit with alpha)                                 |
| WCAG 2.0 contrast ratio | Measure of readability between foreground and background (1:1 = identical, 21:1 = max). AA requires ≥ 4.5:1 |
| Relative luminance    | Perceived brightness of a color (0 = black, 1 = white), per WCAG formula                       |
| Hue preset            | One of 14 named color families (Red through Rose) with a fixed hue degree, shown in quick-pick  |
| ThemeKind             | Extension's simplified theme enum (`Dark`, `Light`, `HighContrast`) mapped from VS Code's `ColorThemeKind` |
| Title bar keys        | The 5 `titleBar.*` keys written to `workbench.colorCustomizations` by this extension             |
| Workspace seed        | URI string of the first workspace folder, used as input to deterministic hash functions          |
| DJB2 hash             | Simple string hash algorithm used for deterministic hue generation (`hashStringToHue`)           |
| Color customizations  | VS Code setting `workbench.colorCustomizations` — a JSON object of UI color overrides            |
| Inactive color        | Muted variant of the active color, applied when the window loses focus                          |

---

## 11. Anti-Patterns & Gotchas

- **DO NOT touch non-title-bar keys** in `workbench.colorCustomizations`. The extension must only read/write the 5 `titleBar.*` keys. Always spread existing settings: `{ ...current, "titleBar.activeBackground": ... }`.
- **DO NOT use `Math.random()` in deterministic code paths.** Seeded/deterministic colors use `hashStringToHue()` and `hashStringToFloat()` only. `Math.random()` is reserved for the explicit "randomize" command and `generateAppealingHsl()`.
- **DO NOT hardcode foreground as white or black.** Always use `chooseForeground(backgroundHex)` which computes WCAG contrast ratios against both and picks the winner.
- **DO NOT write to `ConfigurationTarget.Global`** (or `WorkspaceFolder`). Title bar colors must be scoped to `ConfigurationTarget.Workspace` so each window is independent.
- **DO NOT add `vscode` imports to `color-generator.ts`.** This module must remain pure (no side effects, no VS Code API) so it can be unit-tested without the extension host.
- **Keep `ThemeKind` in sync with VS Code's `ColorThemeKind`.** If VS Code adds new theme kinds, `TitleBarManager.getThemeKind()` must map them to one of the three simplified kinds.
- **DO NOT forget the inactive foreground alpha suffix.** `deriveInactiveForeground()` appends `"cc"` (80% opacity) to the 6-digit hex. The result is 8 characters after `#`.
- **DO NOT delete `workbench.colorCustomizations` entirely on reset.** If other (non-title-bar) keys exist, preserve them. Only set the value to `undefined` when the object is empty after removing the 5 title bar keys.

---

## Exported Functions Reference

All functions exported from `src/color-generator.ts` (the only module with unit-testable exports):

Export count: **19 functions** — all pure, no side effects.

| Function                          | Signature (simplified)                              | Returns           |
|-----------------------------------|-----------------------------------------------------|-------------------|
| `clamp`                           | `(value, min, max)`                                 | `number`          |
| `hashStringToHue`                 | `(input: string)`                                   | `number` (0–359)  |
| `hashStringToFloat`               | `(input: string, seed?: number)`                    | `number` (0–1)    |
| `hslToRgb`                        | `(hsl: HSL)`                                        | `RGB`             |
| `rgbToHex`                        | `(rgb: RGB)`                                        | `string` (#hex)   |
| `hexToRgb`                        | `(hex: string)`                                     | `RGB`             |
| `hslToHex`                        | `(hsl: HSL)`                                        | `string` (#hex)   |
| `relativeLuminance`               | `(rgb: RGB)`                                        | `number` (0–1)    |
| `contrastRatio`                   | `(a: RGB, b: RGB)`                                  | `number` (1–21)   |
| `chooseForeground`                | `(backgroundHex: string)`                           | `"#ffffff"` or `"#000000"` |
| `generateAppealingHsl`            | `(theme: ThemeKind)`                                | `HSL`             |
| `hslFromHue`                      | `(hue: number, theme: ThemeKind)`                   | `HSL`             |
| `deriveInactiveHsl`               | `(hsl: HSL, theme: ThemeKind)`                      | `HSL`             |
| `deriveInactiveForeground`        | `(activeForeground: string)`                        | `string` (#hex+cc)|
| `deriveBorderHsl`                 | `(hsl: HSL, theme: ThemeKind)`                      | `HSL`             |
| `titleBarColorsFromHsl`           | `(hsl: HSL, theme: ThemeKind)`                      | `TitleBarColors`  |
| `generateTitleBarColors`          | `(theme: ThemeKind)`                                | `TitleBarColors`  |
| `generateTitleBarColorsFromHue`   | `(hue: number, theme: ThemeKind)`                   | `TitleBarColors`  |
| `generateTitleBarColorsFromSeed`  | `(seed: string, theme: ThemeKind)`                  | `TitleBarColors`  |

---

## CI/CD

### CI Pipeline (`.github/workflows/ci.yml`)

- **Trigger:** Push to `main`, PRs against `main`
- **Matrix:** Node.js 20 and 22 on Ubuntu
- **Steps:** Checkout → npm ci → lint → compile → test:unit → vsce package → upload VSIX artifact (Node 22 only)

### Publish Pipeline (`.github/workflows/publish.yml`)

- **Trigger:** Manual `workflow_dispatch` with version bump input (`none`, `patch`, `minor`, `major`)
- **Guard:** Only runs on `main` branch
- **Node version:** 22 (single, not matrix)
- **Steps:** Checkout → npm ci → lint → compile → test → optional `npm version` bump + git push tag → `vsce publish` (uses `VSCE_PAT` secret) → upload VSIX artifact
- **Secrets:** `VSCE_PAT` — Personal Access Token for VS Code Marketplace publishing

---

*Last updated: 2026-02-28*

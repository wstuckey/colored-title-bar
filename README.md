# Colored Title Bar

> Apply a random, visually appealing colour to the VS Code title bar — perfect for telling workspaces apart at a glance.

![Colored Title Bar Banner](images/colored-title-bar-banner-askew.png)

---

## Features

- **Random colour** — one command generates a pleasing background colour that automatically adapts to your current theme (Dark, Light, or High Contrast).
- **Pick a colour family** — choose from 14 named hue presets (Red, Orange, Teal, Blue, Purple, …).
- **WCAG-aware foreground** — the extension picks white or black text based on contrast ratio, so icons and labels always stay readable.
- **Inactive window styling** — the title bar gracefully fades when the window loses focus.
- **Non-destructive** — only the five `titleBar.*` keys in `workbench.colorCustomizations` are touched; all other customisations are preserved.

## Installation

### From source

```bash
git clone https://github.com/wstuckey/colored-title-bar.git
cd colored-title-bar
npm install
npm run compile
```

Then press **F5** in VS Code to launch the Extension Development Host.

### From VSIX

1. **Build the package:**

   ```bash
   npm install
   npx @vscode/vsce package
   ```

   This produces `colored-title-bar-<version>.vsix` in the project root.

2. **Install into VS Code:**

   ```bash
   code --install-extension colored-title-bar-0.1.0.vsix
   ```

   If you use a **custom VS Code profile**, specify it with `--profile`:

   ```bash
   code --profile <profile-name> --install-extension colored-title-bar-0.1.0.vsix
   ```

   Alternatively, install from within VS Code: `Cmd+Shift+P` → **"Extensions: Install from VSIX…"** and select the `.vsix` file. This always installs into the currently active profile.

3. **Reload the window** (`Cmd+Shift+P` → "Developer: Reload Window") to activate the extension.

## Usage

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:

| Command | Description |
|---------|-------------|
| **Colored Title Bar: Randomize Color** | Apply a new random colour. |
| **Colored Title Bar: Pick Color Family** | Choose a hue family from a list. |
| **Colored Title Bar: Reset to Default** | Remove all title-bar overrides. |

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `coloredTitleBar.colorOnStartup` | `boolean` | `false` | Automatically apply a new random colour every time VS Code starts. |

## How It Works

1. A random hue is chosen uniformly from 0 – 360°.
2. Saturation and lightness are constrained to ranges that look pleasant for the detected theme kind.
3. The foreground colour (white or black) is selected using the WCAG 2.0 relative-luminance contrast ratio — whichever exceeds 4.5 : 1.
4. An inactive-background variant is derived by reducing saturation; the inactive foreground gets 60 % opacity.
5. A subtle border is generated slightly darker than the background.
6. All five values are merged into your workspace's `workbench.colorCustomizations`.

## Development

```bash
npm install          # install dependencies
npm run compile      # one-shot build
npm run watch        # incremental build
npm run lint         # ESLint
npm run test         # compile + unit tests (mocha)
```

## Contributing

Contributions are welcome! Please open an issue or pull request.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/my-feature`).
3. Commit your changes with clear messages.
4. Open a pull request against `main`.

## License

[MIT](LICENSE)

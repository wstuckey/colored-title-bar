// Copyright (c) 2026 Will Stuckey. MIT License — see LICENSE for details.

import * as vscode from "vscode";
import {
  generateTitleBarColors,
  generateTitleBarColorsFromHue,
  generateTitleBarColorsFromSeed,
} from "./color-generator";
import { TitleBarManager } from "./title-bar-manager";

// ---------------------------------------------------------------------------
// Hue presets shown in the "Pick Color Family" quick-pick
// ---------------------------------------------------------------------------

interface HuePreset extends vscode.QuickPickItem {
  hue: number;
}

const HUE_PRESETS: HuePreset[] = [
  { label: "Red",     description: "Warm, bold red",     hue: 0 },
  { label: "Orange",  description: "Warm orange",        hue: 30 },
  { label: "Amber",   description: "Gold and amber",     hue: 45 },
  { label: "Yellow",  description: "Bright yellow",      hue: 55 },
  { label: "Lime",    description: "Fresh lime",         hue: 80 },
  { label: "Green",   description: "Natural green",      hue: 120 },
  { label: "Teal",    description: "Cool teal",          hue: 175 },
  { label: "Cyan",    description: "Bright cyan",        hue: 190 },
  { label: "Blue",    description: "Classic blue",       hue: 220 },
  { label: "Indigo",  description: "Deep indigo",        hue: 245 },
  { label: "Purple",  description: "Rich purple",        hue: 275 },
  { label: "Magenta", description: "Vibrant magenta",    hue: 300 },
  { label: "Pink",    description: "Soft pink",          hue: 330 },
  { label: "Rose",    description: "Warm rose",          hue: 350 },
];

// ---------------------------------------------------------------------------
// Extension lifecycle
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
  const manager = new TitleBarManager(context.workspaceState);

  // -- Commands ----------------------------------------------------------

  context.subscriptions.push(
    vscode.commands.registerCommand("coloredTitleBar.randomize", async () => {
      const theme = manager.getThemeKind();
      const colors = generateTitleBarColors(theme);
      const applied = await manager.applyColors(colors);
      if (applied) {
        vscode.window.showInformationMessage(
          `Title bar color updated to ${colors.activeBackground}`,
        );
      }
    }),

    vscode.commands.registerCommand("coloredTitleBar.pickHue", async () => {
      const picked = await vscode.window.showQuickPick<HuePreset>(
        HUE_PRESETS,
        { placeHolder: "Choose a color family for the title bar" },
      );
      if (!picked) {
        return;
      }

      const theme = manager.getThemeKind();
      const colors = generateTitleBarColorsFromHue(picked.hue, theme);
      const applied = await manager.applyColors(colors);
      if (applied) {
        vscode.window.showInformationMessage(
          `Title bar color set to ${picked.label} (${colors.activeBackground})`,
        );
      }
    }),

    vscode.commands.registerCommand("coloredTitleBar.reset", async () => {
      await manager.resetColors();
      vscode.window.showInformationMessage("Title bar colors reset to default.");
    }),
  );

  // -- Auto-color on startup --------------------------------------------
  // If a workspace is open and no color has been applied yet, seed a
  // deterministic color from the workspace path so every project gets a
  // unique, stable title-bar color automatically.

  if (!manager.hasWorkspace()) {
    return;
  }

  const config = vscode.workspace.getConfiguration("coloredTitleBar");

  if (config.get<boolean>("colorOnStartup")) {
    // User explicitly wants a fresh random color each launch.
    const theme = manager.getThemeKind();
    const colors = generateTitleBarColors(theme);
    manager.applyColors(colors);
  } else if (!manager.hasSavedColors()) {
    // First time this workspace is opened — auto-assign a deterministic
    // color based on the folder path so each workspace is unique.
    const seed = manager.getWorkspaceSeed();
    if (seed) {
      const theme = manager.getThemeKind();
      const colors = generateTitleBarColorsFromSeed(seed, theme);
      manager.applyColors(colors);
    }
  }
}

export function deactivate(): void {
  // nothing to clean up
}

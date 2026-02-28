// Copyright (c) 2026 Will Stuckey. MIT License — see LICENSE for details.

import * as vscode from "vscode";
import { ThemeKind, TitleBarColors } from "./types";

/**
 * Keys written to `workbench.colorCustomizations` by this extension.
 * Used for both applying and cleaning up title-bar overrides.
 */
const TITLE_BAR_KEYS = [
  "titleBar.activeBackground",
  "titleBar.activeForeground",
  "titleBar.inactiveBackground",
  "titleBar.inactiveForeground",
  "titleBar.border",
] as const;

/** Key used to persist the current color set in workspaceState. */
const STATE_KEY = "coloredTitleBar.currentColors";

/**
 * Manages reading and writing VS Code title-bar color overrides via the
 * `workbench.colorCustomizations` setting.
 *
 * All writes are scoped to the **workspace** so that every open window
 * gets its own independent title-bar color.
 */
export class TitleBarManager {
  constructor(private readonly state: vscode.Memento) {}

  // ---------- Theme detection -------------------------------------------

  /** Map the current color-theme kind to a simplified `ThemeKind`. */
  getThemeKind(): ThemeKind {
    switch (vscode.window.activeColorTheme.kind) {
      case vscode.ColorThemeKind.Light:
      case vscode.ColorThemeKind.HighContrastLight:
        return ThemeKind.Light;
      case vscode.ColorThemeKind.HighContrast:
        return ThemeKind.HighContrast;
      case vscode.ColorThemeKind.Dark:
      default:
        return ThemeKind.Dark;
    }
  }

  // ---------- Workspace detection ---------------------------------------

  /** Return `true` when the window has at least one workspace folder open. */
  hasWorkspace(): boolean {
    return (
      vscode.workspace.workspaceFolders !== undefined &&
      vscode.workspace.workspaceFolders.length > 0
    );
  }

  /**
   * Return the URI string of the first workspace folder, or `undefined`
   * if no folder is open.  Used as the seed for deterministic coloring.
   */
  getWorkspaceSeed(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    return folders && folders.length > 0
      ? folders[0].uri.toString()
      : undefined;
  }

  // ---------- Color application ----------------------------------------

  /**
   * Merge the given colors into `workbench.colorCustomizations` at
   * **workspace** scope and persist them in workspaceState.
   *
   * Returns `false` (with a warning) if no workspace folder is open,
   * because workspace-scoped settings require an open folder.
   */
  async applyColors(colors: TitleBarColors): Promise<boolean> {
    if (!this.hasWorkspace()) {
      vscode.window.showWarningMessage(
        "Colored Title Bar: Open a folder first — per-window colors require a workspace.",
      );
      return false;
    }

    const config = vscode.workspace.getConfiguration();
    const current =
      config.get<Record<string, string>>("workbench.colorCustomizations") ?? {};

    const updated: Record<string, string> = {
      ...current,
      "titleBar.activeBackground": colors.activeBackground,
      "titleBar.activeForeground": colors.activeForeground,
      "titleBar.inactiveBackground": colors.inactiveBackground,
      "titleBar.inactiveForeground": colors.inactiveForeground,
      "titleBar.border": colors.border,
    };

    await config.update(
      "workbench.colorCustomizations",
      updated,
      vscode.ConfigurationTarget.Workspace,
    );

    // Persist so we can restore / check later.
    await this.state.update(STATE_KEY, colors);
    return true;
  }

  /**
   * Remove only the title-bar keys added by this extension from
   * `workbench.colorCustomizations`, leaving other entries intact.
   */
  async resetColors(): Promise<void> {
    if (!this.hasWorkspace()) {
      return;
    }

    const config = vscode.workspace.getConfiguration();
    const current =
      config.get<Record<string, string>>("workbench.colorCustomizations") ?? {};

    const updated = { ...current };
    for (const key of TITLE_BAR_KEYS) {
      delete updated[key];
    }

    const value = Object.keys(updated).length === 0 ? undefined : updated;
    await config.update(
      "workbench.colorCustomizations",
      value,
      vscode.ConfigurationTarget.Workspace,
    );

    await this.state.update(STATE_KEY, undefined);
  }

  /** Check whether we previously applied colors in this workspace. */
  hasSavedColors(): boolean {
    return this.state.get<TitleBarColors>(STATE_KEY) !== undefined;
  }

  /** Retrieve the previously saved color set, if any. */
  getSavedColors(): TitleBarColors | undefined {
    return this.state.get<TitleBarColors>(STATE_KEY);
  }
}

// Copyright (c) 2026 Will Stuckey. MIT License — see LICENSE for details.

/** HSL color with hue in [0, 360), saturation and lightness in [0, 100]. */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/** RGB color with channels in [0, 255]. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** Complete set of title bar color overrides. */
export interface TitleBarColors {
  activeBackground: string;
  activeForeground: string;
  inactiveBackground: string;
  inactiveForeground: string;
  border: string;
}

/** Simplified theme classification used for color generation. */
export enum ThemeKind {
  Dark = "dark",
  Light = "light",
  HighContrast = "highContrast",
}

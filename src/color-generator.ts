// Copyright (c) 2026 Will Stuckey. MIT License — see LICENSE for details.

import { HSL, RGB, TitleBarColors, ThemeKind } from "./types";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Clamp `value` to the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deterministically hash a string to a hue in [0, 360).
 * Uses a simple DJB2-style hash — fast and well-distributed.
 */
export function hashStringToHue(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

/**
 * Deterministically hash a string to a value in [0, 1).
 * Uses a secondary seed offset so it's independent of `hashStringToHue`.
 */
export function hashStringToFloat(input: string, seed = 0): number {
  let hash = 5381 + seed;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 10000) / 10000;
}

// ---------------------------------------------------------------------------
// Color-space conversions
// ---------------------------------------------------------------------------

/** Convert an HSL color to RGB. */
export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = ((h % 360) + 360) % 360; // normalize hue to [0, 360)
  const sn = s / 100;
  const ln = l / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let rp: number, gp: number, bp: number;

  if (hn < 60) {
    [rp, gp, bp] = [c, x, 0];
  } else if (hn < 120) {
    [rp, gp, bp] = [x, c, 0];
  } else if (hn < 180) {
    [rp, gp, bp] = [0, c, x];
  } else if (hn < 240) {
    [rp, gp, bp] = [0, x, c];
  } else if (hn < 300) {
    [rp, gp, bp] = [x, 0, c];
  } else {
    [rp, gp, bp] = [c, 0, x];
  }

  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

/** Convert an RGB color to a 6-digit hex string (e.g. `#1a2b3c`). */
export function rgbToHex({ r, g, b }: RGB): string {
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** Parse a hex color string (`#rrggbb` or `rrggbb`) into RGB. */
export function hexToRgb(hex: string): RGB {
  const h = hex.replace(/^#/, "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Shorthand: HSL → hex. */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// ---------------------------------------------------------------------------
// Contrast helpers (WCAG 2.0)
// ---------------------------------------------------------------------------

/** Calculate the relative luminance of an RGB color (0 – 1). */
export function relativeLuminance({ r, g, b }: RGB): number {
  const linearize = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Calculate the WCAG contrast ratio between two RGB colors (1 – 21). */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Choose the foreground color (white or black) that provides the best
 * contrast against the given background hex color.
 */
export function chooseForeground(backgroundHex: string): string {
  const bg = hexToRgb(backgroundHex);
  const white: RGB = { r: 255, g: 255, b: 255 };
  const black: RGB = { r: 0, g: 0, b: 0 };
  return contrastRatio(bg, white) >= contrastRatio(bg, black) ? "#ffffff" : "#000000";
}

// ---------------------------------------------------------------------------
// HSL generation
// ---------------------------------------------------------------------------

/**
 * Generate a random, visually appealing HSL color tuned for `theme`.
 *
 * | Theme         | Saturation | Lightness |
 * |---------------|------------|-----------|
 * | Dark          | 20 – 85 %  | 12 – 40 % |
 * | Light         | 25 – 85 %  | 65 – 90 % |
 * | High Contrast | 40 – 90 %  | 10 – 28 % |
 */
export function generateAppealingHsl(theme: ThemeKind): HSL {
  const h = Math.random() * 360;
  let s: number, l: number;

  switch (theme) {
    case ThemeKind.Light:
      s = 25 + Math.random() * 60;
      l = 65 + Math.random() * 25;
      break;
    case ThemeKind.HighContrast:
      s = 40 + Math.random() * 50;
      l = 10 + Math.random() * 18;
      break;
    case ThemeKind.Dark:
    default:
      s = 20 + Math.random() * 65;
      l = 12 + Math.random() * 28;
      break;
  }

  return { h, s, l };
}

/**
 * Create a pleasant HSL anchored to a specific hue for the given theme.
 * Saturation and lightness are varied based on the hue to produce a
 * wider palette — warm hues lean slightly more saturated, cool hues lean
 * slightly lighter, etc.
 */
export function hslFromHue(hue: number, theme: ThemeKind): HSL {
  const h = ((hue % 360) + 360) % 360;

  // Derive a 0-1 factor from the hue to vary S and L.
  const hueNorm = h / 360;
  const wave = Math.sin(hueNorm * Math.PI * 2); // -1..1 cycle over the hue wheel

  switch (theme) {
    case ThemeKind.Light:
      return {
        h,
        s: 35 + wave * 20,           // 15 – 55
        l: 72 + wave * 8,            // 64 – 80
      };
    case ThemeKind.HighContrast:
      return {
        h,
        s: 55 + wave * 15,           // 40 – 70
        l: 16 + wave * 5,            // 11 – 21
      };
    case ThemeKind.Dark:
    default:
      return {
        h,
        s: 40 + wave * 20,           // 20 – 60
        l: 22 + wave * 8,            // 14 – 30
      };
  }
}

// ---------------------------------------------------------------------------
// Derived colors
// ---------------------------------------------------------------------------

/** Derive a muted inactive-background HSL from the active color. */
export function deriveInactiveHsl(hsl: HSL, theme: ThemeKind): HSL {
  return {
    h: hsl.h,
    s: clamp(hsl.s * 0.65, 0, 100),
    l: clamp(
      theme === ThemeKind.Light ? hsl.l + 5 : hsl.l - 3,
      0,
      100,
    ),
  };
}

/** Derive an inactive foreground by appending 80 % alpha to the active foreground hex. */
export function deriveInactiveForeground(activeForeground: string): string {
  return activeForeground + "cc"; // 0xcc ≈ 80 % opacity
}

/** Derive a subtle border HSL from the active color. */
export function deriveBorderHsl(hsl: HSL, theme: ThemeKind): HSL {
  return {
    h: hsl.h,
    s: clamp(hsl.s * 0.6, 0, 100),
    l: clamp(
      theme === ThemeKind.Light ? hsl.l - 12 : hsl.l - 6,
      0,
      100,
    ),
  };
}

// ---------------------------------------------------------------------------
// Full title-bar color set
// ---------------------------------------------------------------------------

/** Build a complete `TitleBarColors` object from a base HSL and theme. */
export function titleBarColorsFromHsl(hsl: HSL, theme: ThemeKind): TitleBarColors {
  const activeBackground = hslToHex(hsl);
  const activeForeground = chooseForeground(activeBackground);
  const inactiveBackground = hslToHex(deriveInactiveHsl(hsl, theme));
  const inactiveForeground = deriveInactiveForeground(activeForeground);
  const border = hslToHex(deriveBorderHsl(hsl, theme));

  return { activeBackground, activeForeground, inactiveBackground, inactiveForeground, border };
}

/** Generate a random title-bar color set appropriate for `theme`. */
export function generateTitleBarColors(theme: ThemeKind): TitleBarColors {
  return titleBarColorsFromHsl(generateAppealingHsl(theme), theme);
}

/** Generate a title-bar color set anchored to a specific hue. */
export function generateTitleBarColorsFromHue(hue: number, theme: ThemeKind): TitleBarColors {
  return titleBarColorsFromHsl(hslFromHue(hue, theme), theme);
}

/**
 * Generate a deterministic title-bar color set seeded from a string
 * (typically the workspace folder path). The same input always
 * produces the same color, so every workspace gets a unique,
 * stable color automatically.
 *
 * Unlike `hslFromHue`, this also varies saturation and lightness
 * based on additional hash channels for maximum variety.
 */
export function generateTitleBarColorsFromSeed(seed: string, theme: ThemeKind): TitleBarColors {
  const hue = hashStringToHue(seed);
  const sFloat = hashStringToFloat(seed, 1);  // 0-1
  const lFloat = hashStringToFloat(seed, 2);  // 0-1

  let s: number, l: number;
  switch (theme) {
    case ThemeKind.Light:
      s = 25 + sFloat * 60;    // 25 – 85
      l = 65 + lFloat * 25;    // 65 – 90
      break;
    case ThemeKind.HighContrast:
      s = 40 + sFloat * 50;    // 40 – 90
      l = 10 + lFloat * 18;    // 10 – 28
      break;
    case ThemeKind.Dark:
    default:
      s = 20 + sFloat * 65;    // 20 – 85
      l = 12 + lFloat * 28;    // 12 – 40
      break;
  }

  return titleBarColorsFromHsl({ h: hue, s, l }, theme);
}

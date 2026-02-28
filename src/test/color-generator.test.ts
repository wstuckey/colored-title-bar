// Copyright (c) 2026 Will Stuckey. MIT License — see LICENSE for details.

import * as assert from "assert";
import {
  clamp,
  hslToRgb,
  rgbToHex,
  hexToRgb,
  hslToHex,
  relativeLuminance,
  contrastRatio,
  chooseForeground,
  generateAppealingHsl,
  hslFromHue,
  hashStringToHue,
  hashStringToFloat,
  deriveInactiveHsl,
  deriveInactiveForeground,
  deriveBorderHsl,
  titleBarColorsFromHsl,
  generateTitleBarColors,
  generateTitleBarColorsFromHue,
  generateTitleBarColorsFromSeed,
} from "../color-generator";
import { ThemeKind } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HEX6 = /^#[0-9a-f]{6}$/;
const HEX6_OR_8 = /^#[0-9a-f]{6}([0-9a-f]{2})?$/;

function approx(actual: number, expected: number, tolerance = 0.01): void {
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `expected ≈${expected}, got ${actual}`,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("clamp", () => {
  it("returns the value when within range", () => {
    assert.strictEqual(clamp(50, 0, 100), 50);
  });

  it("clamps to the minimum", () => {
    assert.strictEqual(clamp(-5, 0, 100), 0);
  });

  it("clamps to the maximum", () => {
    assert.strictEqual(clamp(150, 0, 100), 100);
  });

  it("handles min === max", () => {
    assert.strictEqual(clamp(42, 10, 10), 10);
  });
});

// ---------------------------------------------------------------------------

describe("hslToRgb", () => {
  it("converts pure red (h=0, s=100, l=50)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 0, s: 100, l: 50 }), { r: 255, g: 0, b: 0 });
  });

  it("converts pure green (h=120)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 120, s: 100, l: 50 }), { r: 0, g: 255, b: 0 });
  });

  it("converts pure blue (h=240)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 240, s: 100, l: 50 }), { r: 0, g: 0, b: 255 });
  });

  it("converts yellow (h=60)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 60, s: 100, l: 50 }), { r: 255, g: 255, b: 0 });
  });

  it("converts cyan (h=180)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 180, s: 100, l: 50 }), { r: 0, g: 255, b: 255 });
  });

  it("converts magenta (h=300)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 300, s: 100, l: 50 }), { r: 255, g: 0, b: 255 });
  });

  it("converts black (l=0)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 0, s: 0, l: 0 }), { r: 0, g: 0, b: 0 });
  });

  it("converts white (l=100)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 0, s: 0, l: 100 }), { r: 255, g: 255, b: 255 });
  });

  it("converts 50 % grey (s=0, l=50)", () => {
    assert.deepStrictEqual(hslToRgb({ h: 0, s: 0, l: 50 }), { r: 128, g: 128, b: 128 });
  });

  it("normalizes hue >= 360 to equivalent color", () => {
    assert.deepStrictEqual(
      hslToRgb({ h: 360, s: 100, l: 50 }),
      hslToRgb({ h: 0, s: 100, l: 50 }),
    );
  });

  it("normalizes negative hue", () => {
    assert.deepStrictEqual(
      hslToRgb({ h: -60, s: 100, l: 50 }),
      hslToRgb({ h: 300, s: 100, l: 50 }),
    );
  });
});

// ---------------------------------------------------------------------------

describe("rgbToHex", () => {
  it("formats black as #000000", () => {
    assert.strictEqual(rgbToHex({ r: 0, g: 0, b: 0 }), "#000000");
  });

  it("formats white as #ffffff", () => {
    assert.strictEqual(rgbToHex({ r: 255, g: 255, b: 255 }), "#ffffff");
  });

  it("formats an arbitrary color", () => {
    assert.strictEqual(rgbToHex({ r: 171, g: 205, b: 239 }), "#abcdef");
  });
});

// ---------------------------------------------------------------------------

describe("hexToRgb", () => {
  it("parses with leading #", () => {
    assert.deepStrictEqual(hexToRgb("#abcdef"), { r: 171, g: 205, b: 239 });
  });

  it("parses without leading #", () => {
    assert.deepStrictEqual(hexToRgb("abcdef"), { r: 171, g: 205, b: 239 });
  });
});

// ---------------------------------------------------------------------------

describe("hslToHex", () => {
  it("converts red to #ff0000", () => {
    assert.strictEqual(hslToHex({ h: 0, s: 100, l: 50 }), "#ff0000");
  });
});

// ---------------------------------------------------------------------------

describe("relativeLuminance", () => {
  it("returns 0 for black", () => {
    assert.strictEqual(relativeLuminance({ r: 0, g: 0, b: 0 }), 0);
  });

  it("returns ~1 for white", () => {
    approx(relativeLuminance({ r: 255, g: 255, b: 255 }), 1, 0.001);
  });

  it("returns a mid-range value for 50 % grey", () => {
    const lum = relativeLuminance({ r: 128, g: 128, b: 128 });
    assert.ok(lum > 0.1 && lum < 0.5, `luminance was ${lum}`);
  });
});

// ---------------------------------------------------------------------------

describe("contrastRatio", () => {
  it("returns 21 for black vs white", () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    approx(ratio, 21, 0.1);
  });

  it("returns 1 for identical colors", () => {
    const c = { r: 128, g: 128, b: 128 };
    assert.strictEqual(contrastRatio(c, c), 1);
  });

  it("is commutative", () => {
    const a = { r: 30, g: 60, b: 90 };
    const b = { r: 200, g: 220, b: 240 };
    assert.strictEqual(contrastRatio(a, b), contrastRatio(b, a));
  });
});

// ---------------------------------------------------------------------------

describe("chooseForeground", () => {
  it("returns white for a dark background", () => {
    assert.strictEqual(chooseForeground("#1a1a2e"), "#ffffff");
  });

  it("returns black for a light background", () => {
    assert.strictEqual(chooseForeground("#f0f0f0"), "#000000");
  });
});

// ---------------------------------------------------------------------------

describe("generateAppealingHsl", () => {
  const themes = [ThemeKind.Dark, ThemeKind.Light, ThemeKind.HighContrast];

  for (const theme of themes) {
    it(`produces valid HSL for the ${theme} theme (50 samples)`, () => {
      for (let i = 0; i < 50; i++) {
        const { h, s, l } = generateAppealingHsl(theme);
        assert.ok(h >= 0 && h < 360, `h=${h}`);
        assert.ok(s >= 0 && s <= 100, `s=${s}`);
        assert.ok(l >= 0 && l <= 100, `l=${l}`);
      }
    });
  }

  it("averages below 50 % lightness for dark theme", () => {
    const n = 200;
    let total = 0;
    for (let i = 0; i < n; i++) {
      total += generateAppealingHsl(ThemeKind.Dark).l;
    }
    assert.ok(total / n < 50, `average lightness was ${total / n}`);
  });

  it("averages above 50 % lightness for light theme", () => {
    const n = 200;
    let total = 0;
    for (let i = 0; i < n; i++) {
      total += generateAppealingHsl(ThemeKind.Light).l;
    }
    assert.ok(total / n > 50, `average lightness was ${total / n}`);
  });
});

// ---------------------------------------------------------------------------

describe("hslFromHue", () => {
  it("uses the provided hue", () => {
    assert.strictEqual(hslFromHue(220, ThemeKind.Dark).h, 220);
  });

  it("normalizes hue > 360", () => {
    assert.strictEqual(hslFromHue(400, ThemeKind.Dark).h, 40);
  });

  it("normalizes negative hue", () => {
    assert.strictEqual(hslFromHue(-30, ThemeKind.Dark).h, 330);
  });

  it("varies saturation across different hues", () => {
    const sValues = [0, 60, 120, 180, 240, 300].map(
      (h) => hslFromHue(h, ThemeKind.Dark).s,
    );
    const unique = new Set(sValues.map((v) => Math.round(v)));
    assert.ok(unique.size > 1, `all saturation values were the same: ${[...unique]}`);
  });

  it("varies lightness across different hues", () => {
    const lValues = [0, 60, 120, 180, 240, 300].map(
      (h) => hslFromHue(h, ThemeKind.Dark).l,
    );
    const unique = new Set(lValues.map((v) => Math.round(v)));
    assert.ok(unique.size > 1, `all lightness values were the same: ${[...unique]}`);
  });
});

// ---------------------------------------------------------------------------

describe("deriveInactiveHsl", () => {
  it("reduces saturation", () => {
    const active = { h: 220, s: 60, l: 30 };
    const inactive = deriveInactiveHsl(active, ThemeKind.Dark);
    assert.ok(inactive.s < active.s, `inactive s=${inactive.s}, active s=${active.s}`);
  });

  it("keeps hue unchanged", () => {
    const active = { h: 100, s: 50, l: 25 };
    assert.strictEqual(deriveInactiveHsl(active, ThemeKind.Dark).h, 100);
  });
});

// ---------------------------------------------------------------------------

describe("deriveInactiveForeground", () => {
  it("appends 99 alpha to white", () => {
    assert.strictEqual(deriveInactiveForeground("#ffffff"), "#ffffff99");
  });

  it("appends 99 alpha to black", () => {
    assert.strictEqual(deriveInactiveForeground("#000000"), "#00000099");
  });
});

// ---------------------------------------------------------------------------

describe("deriveBorderHsl", () => {
  it("produces a darker border for dark themes", () => {
    const active = { h: 220, s: 60, l: 30 };
    const border = deriveBorderHsl(active, ThemeKind.Dark);
    assert.ok(border.l < active.l, `border l=${border.l}, active l=${active.l}`);
  });

  it("produces a darker border for light themes", () => {
    const active = { h: 220, s: 60, l: 78 };
    const border = deriveBorderHsl(active, ThemeKind.Light);
    assert.ok(border.l < active.l, `border l=${border.l}, active l=${active.l}`);
  });
});

// ---------------------------------------------------------------------------

describe("titleBarColorsFromHsl", () => {
  it("returns all required keys", () => {
    const colors = titleBarColorsFromHsl({ h: 200, s: 50, l: 25 }, ThemeKind.Dark);
    assert.ok("activeBackground" in colors);
    assert.ok("activeForeground" in colors);
    assert.ok("inactiveBackground" in colors);
    assert.ok("inactiveForeground" in colors);
    assert.ok("border" in colors);
  });

  it("returns valid hex values", () => {
    const colors = titleBarColorsFromHsl({ h: 200, s: 50, l: 25 }, ThemeKind.Dark);
    assert.ok(HEX6.test(colors.activeBackground), colors.activeBackground);
    assert.ok(HEX6.test(colors.activeForeground), colors.activeForeground);
    assert.ok(HEX6.test(colors.inactiveBackground), colors.inactiveBackground);
    assert.ok(HEX6_OR_8.test(colors.inactiveForeground), colors.inactiveForeground);
    assert.ok(HEX6.test(colors.border), colors.border);
  });
});

// ---------------------------------------------------------------------------

describe("generateTitleBarColors", () => {
  const themes = [ThemeKind.Dark, ThemeKind.Light, ThemeKind.HighContrast];

  for (const theme of themes) {
    it(`returns valid hex colors for the ${theme} theme`, () => {
      const colors = generateTitleBarColors(theme);
      assert.ok(HEX6.test(colors.activeBackground), colors.activeBackground);
      assert.ok(HEX6.test(colors.activeForeground), colors.activeForeground);
      assert.ok(HEX6.test(colors.inactiveBackground), colors.inactiveBackground);
      assert.ok(HEX6_OR_8.test(colors.inactiveForeground), colors.inactiveForeground);
      assert.ok(HEX6.test(colors.border), colors.border);
    });

    it(`maintains ≥ 4.5 foreground contrast for the ${theme} theme (50 samples)`, () => {
      for (let i = 0; i < 50; i++) {
        const colors = generateTitleBarColors(theme);
        const bg = hexToRgb(colors.activeBackground);
        const fg = hexToRgb(colors.activeForeground);
        const ratio = contrastRatio(bg, fg);
        assert.ok(
          ratio >= 4.5,
          `contrast ${ratio.toFixed(2)} < 4.5 for bg=${colors.activeBackground}`,
        );
      }
    });
  }
});

// ---------------------------------------------------------------------------

describe("generateTitleBarColorsFromHue", () => {
  it("produces valid hex colors", () => {
    const colors = generateTitleBarColorsFromHue(220, ThemeKind.Dark);
    assert.ok(HEX6.test(colors.activeBackground), colors.activeBackground);
  });

  it("produces different colors for different hues", () => {
    const a = generateTitleBarColorsFromHue(0, ThemeKind.Dark);
    const b = generateTitleBarColorsFromHue(180, ThemeKind.Dark);
    assert.notStrictEqual(a.activeBackground, b.activeBackground);
  });
});

// ---------------------------------------------------------------------------

describe("hashStringToHue", () => {
  it("returns a value in [0, 360)", () => {
    const hue = hashStringToHue("/Users/dev/my-project");
    assert.ok(hue >= 0 && hue < 360, `hue was ${hue}`);
  });

  it("is deterministic — same input always yields the same hue", () => {
    const a = hashStringToHue("file:///Users/dev/project-a");
    const b = hashStringToHue("file:///Users/dev/project-a");
    assert.strictEqual(a, b);
  });

  it("produces different hues for different inputs", () => {
    const a = hashStringToHue("file:///Users/dev/project-a");
    const b = hashStringToHue("file:///Users/dev/project-b");
    assert.notStrictEqual(a, b);
  });

  it("handles empty string without throwing", () => {
    const hue = hashStringToHue("");
    assert.ok(hue >= 0 && hue < 360, `hue was ${hue}`);
  });
});

// ---------------------------------------------------------------------------

describe("hashStringToFloat", () => {
  it("returns a value in [0, 1)", () => {
    const v = hashStringToFloat("/Users/dev/my-project");
    assert.ok(v >= 0 && v < 1, `value was ${v}`);
  });

  it("is deterministic", () => {
    const a = hashStringToFloat("test", 1);
    const b = hashStringToFloat("test", 1);
    assert.strictEqual(a, b);
  });

  it("produces different values for different seeds", () => {
    const a = hashStringToFloat("test", 1);
    const b = hashStringToFloat("test", 2);
    assert.notStrictEqual(a, b);
  });

  it("produces different values for different inputs", () => {
    const a = hashStringToFloat("project-a", 0);
    const b = hashStringToFloat("project-b", 0);
    assert.notStrictEqual(a, b);
  });
});

// ---------------------------------------------------------------------------

describe("generateTitleBarColorsFromSeed", () => {
  it("produces valid hex colors", () => {
    const colors = generateTitleBarColorsFromSeed("/Users/dev/project", ThemeKind.Dark);
    assert.ok(HEX6.test(colors.activeBackground), colors.activeBackground);
  });

  it("is deterministic for the same seed", () => {
    const a = generateTitleBarColorsFromSeed("my-workspace", ThemeKind.Dark);
    const b = generateTitleBarColorsFromSeed("my-workspace", ThemeKind.Dark);
    assert.deepStrictEqual(a, b);
  });

  it("produces different colors for different seeds", () => {
    const a = generateTitleBarColorsFromSeed("project-alpha", ThemeKind.Dark);
    const b = generateTitleBarColorsFromSeed("project-beta", ThemeKind.Dark);
    assert.notStrictEqual(a.activeBackground, b.activeBackground);
  });

  it("produces visually distinct colors across 20 workspace paths", () => {
    const paths = Array.from({ length: 20 }, (_, i) => `/Users/dev/project-${i}`);
    const backgrounds = new Set(
      paths.map((p) => generateTitleBarColorsFromSeed(p, ThemeKind.Dark).activeBackground),
    );
    assert.ok(
      backgrounds.size >= 15,
      `only ${backgrounds.size} unique colors out of 20 seeds`,
    );
  });
});

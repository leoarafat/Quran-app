import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

type Rgba = [number, number, number, number];

function colour(value: string): Rgba {
  if (value.startsWith("#")) return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)).concat(1) as Rgba;
  return /rgba\(([^)]+)\)/.exec(value)![1].split(",").map(Number) as Rgba;
}

function tokens(selector: string): Record<string, Rgba> {
  const start = css.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6}|rgba\([^)]+\))/g)].map((m) => [m[1], colour(m[2])]));
}

/** What the eye sees when a see-through colour lies on a solid one. */
const over = ([r, g, b, a]: Rgba, base: Rgba): Rgba => [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a), 1];

function luminance([r, g, b]: Rgba): number {
  const [x, y, z] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * x + 0.7152 * y + 0.0722 * z;
}

function ratio(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = [
  ["ink", "bg"], ["ink", "sf"], ["ink2", "bg"], ["ink2", "sf"], ["ink2", "rail"], ["gt", "bg"], ["gt", "sf"], ["ac", "bg"], ["ac", "sf"],
  ["on-ac", "ac"], ["on-tint", "tint"], ["on-gold-soft", "gold-soft"], ["on-hero", "hero"], ["hero-accent", "hero"], ["hero-muted", "hero"], ["on-gold", "gold"],
] as const;

describe.each(["paper", "sepia", "night", "amoled"])("%s theme contrast", (theme) => {
  const t = { ...tokens("\n:root"), ...tokens(`:root[data-theme="${theme}"]`) };
  const shared = css.slice(css.indexOf("/* Names used by the pages"));
  for (const m of shared.slice(0, shared.indexOf("\n}")).matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/g)) t[m[1]] = colour(m[2]);

  it.each(PAIRS)("%s on %s meets WCAG AA", (fg, bg) => {
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the Quran text at AAA, also on the highlight", () => {
    for (const base of [t.bg, t.sf, over(t.gs, t.bg)]) expect(ratio(t.ink, base)).toBeGreaterThanOrEqual(7);
  });

  it("raises contrast when asked", () => {
    const strong = { ...t, ...tokens(`:root[data-theme="${theme}"][data-contrast="true"]`) };
    for (const fg of ["ink2", "gt"] as const) {
      expect(ratio(strong[fg], strong.bg)).toBeGreaterThanOrEqual(7);
      expect(ratio(strong[fg], strong.bg)).toBeGreaterThan(ratio(t[fg], t.bg));
    }
  });

  it.each(["ink2", "gt"] as const)("%s stays readable on the highlight", (fg) => {
    expect(ratio(t[fg], over(t.gs, t.bg))).toBeGreaterThanOrEqual(4.5);
  });
});

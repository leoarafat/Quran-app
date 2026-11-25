import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/g)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = [
  ["text", "bg"], ["text", "surface"], ["muted", "bg"], ["muted", "surface"], ["brand", "surface"],
  ["brand", "surface-2"], ["accent", "accent-soft"], ["on-brand", "brand"], ["on-hero", "hero"],
  ["soft", "bg"], ["accent", "bg"], ["accent", "active"], ["soft", "active"], ["muted", "raised"], ["on-gold", "gold"], ["hero-accent", "hero"], ["hero-muted", "hero"],
];

describe.each([':root[data-theme="dark"]', ':root[data-theme="light"]', ':root[data-theme="sepia"]'])("%s contrast", (selector) => {
  const t = { ...tokens("\n:root"), ...tokens(selector) };
  it.each(PAIRS)("%s on %s meets WCAG AA", (fg, bg) => {
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});

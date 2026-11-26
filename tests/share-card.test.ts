import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARD_COLORS, CARD_WIDTH, cardBlocks, layoutCard, toWords, wrapText, type CardContent } from "@/lib/share/card";

const surah = (n: number) => JSON.parse(readFileSync(new URL(`../public/data/quran/${n}.json`, import.meta.url), "utf8")) as { ayahs: { a: number; ar: string; tr: string; bn: string }[] };
const allAyahs = Array.from({ length: 114 }, (_, i) => surah(i + 1).ayahs).flat();
const squash = (s: string) => s.replace(/\s+/g, "");
const measure = (s: string) => s.length * 20;

const content = (s: number, a: number, withPronunciation = false): CardContent => {
  const x = surah(s).ayahs[a - 1];
  return { surah: s, ayah: a, surahName: "নাম", arabic: x.ar, translation: x.bn, pronunciation: withPronunciation ? x.tr : null, credit: "উৎস" };
};
/** A stand-in for the canvas: every character is half the font size wide. */
const fakeCanvas = () => {
  const ctx = { font: "", measureText: (t: string) => ({ width: t.length * Number(/(\d+)px/.exec(ctx.font)![1]) * 0.5 }) as TextMetrics };
  return ctx;
};

describe("ayah picture", () => {
  it("never loses or reorders a character of any ayah when wrapping", () => {
    for (const x of allAyahs) {
      for (const text of [x.ar, x.tr, x.bn]) expect(squash(wrapText(text, 600, measure).join(" "))).toBe(squash(text));
    }
  });

  it("never starts an Arabic line with a lone pause sign", () => {
    for (const x of allAyahs) {
      for (const word of toWords(x.ar).slice(1)) expect(/^[ۖ-ۜ]/.test(word), x.ar).toBe(false);
    }
  });

  it("draws every pause sign on a no-break space, so the canvas keeps it where the reader shows it", () => {
    let signs = 0;
    for (const x of allAyahs) {
      const drawn = wrapText(x.ar, 600, measure).join("\n");
      expect(/[ \n][\u06D6-\u06DC]/.test(drawn), x.ar).toBe(false);
      signs += drawn.match(/\u00A0[\u06D6-\u06DC]/g)?.length ?? 0;
      // apart from the kind of space and the line breaks, the text is exactly the source
      expect(drawn.replace(/[\u00A0\n]/g, " ")).toBe(x.ar);
    }
    expect(signs).toBeGreaterThan(4000);
  });

  it("respects line breaks and keeps an over-long word whole", () => {
    expect(wrapText("ab cd\nef", 1000, measure)).toEqual(["ab cd", "ef"]);
    expect(wrapText("a abcdefghijkl b", 60, measure)).toEqual(["a", "abcdefghijkl", "b"]);
  });

  it("carries the reference and the source, and the warning whenever pronunciation is shown", () => {
    const plain = cardBlocks(content(2, 255));
    expect(plain.map((b) => b.role)).toEqual(["brand", "reference", "arabic", "translation", "credit"]);
    expect(plain[1].text).toBe("সূরা নাম · ২:২৫৫");
    expect(cardBlocks(content(2, 255, true)).map((b) => b.role)).toContain("note");
  });

  it("is square for a short ayah", () => {
    const layout = layoutCard(fakeCanvas(), content(112, 1));
    expect([layout.height, layout.scale]).toEqual([CARD_WIDTH, 1]);
  });

  it("shrinks letters and then grows taller for the longest ayah, with nothing outside the picture", () => {
    const layout = layoutCard(fakeCanvas(), content(2, 282, true));
    expect(layout.scale).toBeLessThan(1);
    expect(layout.height).toBeGreaterThan(CARD_WIDTH);
    for (const [i, block] of layout.blocks.entries()) {
      const end = block.top + block.lines.length * block.lineHeight;
      expect(end).toBeLessThan(layout.height);
      if (layout.blocks[i + 1]) expect(layout.blocks[i + 1].top).toBeGreaterThanOrEqual(end);
    }
  });

  it("uses the same colours as the app themes", () => {
    const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
    for (const [theme, colors] of Object.entries(CARD_COLORS)) {
      const start = css.indexOf(`:root[data-theme="${theme}"]`);
      const block = css.slice(start, css.indexOf("}", start));
      const names = { bg: "bg", surface: "sf", text: "ink", soft: "ink", muted: "ink2", accent: "gt", line: "card-line" };
      for (const [key, variable] of Object.entries(names)) expect(block, `${theme} ${key}`).toContain(`--${variable}: ${colors[key as keyof typeof colors]};`);
    }
  });
});

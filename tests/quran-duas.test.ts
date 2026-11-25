import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { QURAN_DUAS } from "../src/lib/quran/duas";

const surah = (n: number): { ayahs: { a: number; bn: string }[] } =>
  JSON.parse(readFileSync(new URL(`../public/data/quran/${n}.json`, import.meta.url), "utf8"));

describe("Quran duas", () => {
  it("points only at ayahs that exist", () => {
    for (const [s, from, to] of QURAN_DUAS) {
      expect(from).toBeLessThanOrEqual(to);
      const { ayahs } = surah(s);
      expect(ayahs[from - 1]?.a, `${s}:${from}`).toBe(from);
      expect(ayahs[to - 1]?.a, `${s}:${to}`).toBe(to);
    }
  });

  it("is in mushaf order with no passage repeating another", () => {
    for (let i = 1; i < QURAN_DUAS.length; i++) {
      const [ps, , pt] = QURAN_DUAS[i - 1];
      const [s, from] = QURAN_DUAS[i];
      expect(s > ps || (s === ps && from > pt), `${s}:${from}`).toBe(true);
    }
  });

  it("keeps out the two passages that must not be offered as duas", () => {
    const has = (s: number, a: number) => QURAN_DUAS.some(([x, from, to]) => x === s && a >= from && a <= to);
    expect(has(44, 12)).toBe(false);
    expect(has(26, 86)).toBe(false);
  });
});

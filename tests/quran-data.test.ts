import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { divisionFinder, parseTanzil, sha256, splitBasmalah } from "../scripts/lib/quran.mjs";

const root = new URL("../", import.meta.url);
const text = (p: string) => readFileSync(new URL(p, root), "utf8");
const json = (p: string) => JSON.parse(text(p));

const manifest = json("data/raw/MANIFEST.json") as Record<string, { sha256: string }>;
const original = parseTanzil(text("data/raw/tanzil/quran-uthmani.txt")).verses;
const index = json("public/data/quran/index.json");
type Ayah = { a: number; ar: string; bn: string; fn?: string; juz: number };
const surahs: { n: number; basmalah: string | null; ayahs: Ayah[] }[] = index.surahs.map((s: { n: number }) => json(`public/data/quran/${s.n}.json`));

describe("source files", () => {
  it("are byte-for-byte what was downloaded", () => {
    expect(Object.keys(manifest)).toHaveLength(117);
    for (const [path, info] of Object.entries(manifest)) {
      expect(sha256(readFileSync(new URL(`data/raw/${path}`, root))), path).toBe(info.sha256);
    }
  });
});

describe("built Quran data", () => {
  it("has 114 surahs and 6236 ayahs numbered without gaps", () => {
    expect(surahs).toHaveLength(114);
    expect(surahs.reduce((n, s) => n + s.ayahs.length, 0)).toBe(6236);
    for (const [i, s] of surahs.entries()) {
      expect(s.n).toBe(i + 1);
      expect(s.ayahs).toHaveLength(index.surahs[i].ayahs);
      expect(s.ayahs.every((x, j) => x.a === j + 1)).toBe(true);
    }
  });

  it("keeps every Arabic character of the Tanzil text", () => {
    let cursor = 0;
    for (const s of surahs) {
      for (const x of s.ayahs) {
        const shown = x.a === 1 && s.basmalah ? `${s.basmalah} ${x.ar}` : x.ar;
        expect(shown).toBe(original[cursor++].text);
      }
    }
    expect(cursor).toBe(6236);
  });

  it("keeps the translation and footnotes unmodified", () => {
    for (const s of surahs) {
      const rows = json(`data/raw/quranenc/bengali_rwwad/${s.n}.json`).result;
      s.ayahs.forEach((x, i) => {
        expect(x.bn).toBe(rows[i].translation);
        expect(x.fn ?? "").toBe(rows[i].footnotes || "");
      });
    }
  });

  it("shows the Basmalah line on exactly 112 surahs", () => {
    expect(surahs.filter((s) => s.basmalah)).toHaveLength(112);
    expect(surahs[0].basmalah).toBeNull();
    expect(surahs[8].basmalah).toBeNull();
    expect(surahs[94].basmalah).toBe(original.find((v) => v.s === 95 && v.a === 1)!.text.split(" ").slice(0, 4).join(" "));
    // The Basmalah inside 27:30 is part of the ayah and must stay.
    expect(surahs[26].ayahs[29].ar).toBe(original.find((v) => v.s === 27 && v.a === 30)!.text);
  });

  it("assigns juz boundaries correctly", () => {
    const juz = (s: number, a: number) => surahs[s - 1].ayahs[a - 1].juz;
    expect([juz(1, 1), juz(2, 141), juz(2, 142), juz(77, 50), juz(78, 1), juz(114, 6)]).toEqual([1, 1, 2, 29, 30, 30]);
  });

  it("ships the required copyright notice and attribution", () => {
    expect(text("public/data/quran/TANZIL-NOTICE.txt")).toContain("CHANGING IT IS NOT ALLOWED");
    expect(index.sources.translation.version).toBe("1.1.4");
  });
});

describe("helpers", () => {
  it("rejects a surah whose first ayah lacks the Basmalah", () => {
    expect(() => splitBasmalah(2, 1, "الٓمٓ")).toThrow();
  });
  it("finds divisions", () => {
    const find = divisionFinder([{ s: 1, a: 1 }, { s: 2, a: 10 }]);
    expect([find(1, 7), find(2, 9), find(2, 10), find(3, 1)]).toEqual([1, 1, 2, 2]);
  });
});

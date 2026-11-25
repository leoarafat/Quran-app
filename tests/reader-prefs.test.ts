import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { byPage, DEFAULT_READER, modeOf, parseReaderPrefs, READING_MODES, toggleLayer } from "@/lib/reader/prefs";

const index = JSON.parse(readFileSync(new URL("../public/data/quran/index.json", import.meta.url), "utf8"));

describe("reading preferences", () => {
  it("falls back safely on bad data and never hides every layer", () => {
    for (const raw of [null, "", "no", "null", "5"]) expect(parseReaderPrefs(raw)).toEqual(DEFAULT_READER);
    expect(parseReaderPrefs('{"arabic":false,"pronunciation":false,"translation":false}')).toEqual(DEFAULT_READER);
    const one = { arabic: false, pronunciation: false, translation: true, mushaf: false };
    expect(toggleLayer(one, "translation")).toEqual(one);
    expect(toggleLayer(one, "arabic").arabic).toBe(true);
  });

  it("recognises each ready-made mode", () => {
    for (const mode of READING_MODES) expect(modeOf(parseReaderPrefs(JSON.stringify(mode.prefs)))).toBe(mode.id);
    expect(modeOf({ arabic: true, pronunciation: true, translation: false, mushaf: false })).toBeNull();
  });

  it("groups a surah by mushaf page in order", () => {
    expect(byPage([{ page: 2 }, { page: 2 }, { page: 3 }]).map((g) => [g.page, g.ayahs.length])).toEqual([[2, 2], [3, 1]]);
  });
});

describe("Quran divisions from the Tanzil metadata", () => {
  it("has the expected counts, starting at 1:1 and always moving forward", () => {
    for (const [name, count] of [["pages", 604], ["rukus", 556], ["hizbs", 60], ["manzils", 7], ["juzs", 30]] as const) {
      const places: { s: number; a: number }[] = index[name];
      expect(places, name).toHaveLength(count);
      expect(places[0]).toEqual({ s: 1, a: 1 });
      const keys = places.map((p) => p.s * 1000 + p.a);
      expect(keys.every((k, i) => i === 0 || k > keys[i - 1]), name).toBe(true);
      for (const p of places) expect(p.a).toBeLessThanOrEqual(index.surahs[p.s - 1].ayahs);
    }
  });

  it("starts every second hizb where a juz starts", () => {
    expect(index.hizbs.filter((_: unknown, i: number) => i % 2 === 0)).toEqual(index.juzs);
  });
});

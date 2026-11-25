import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { QuranIndex } from "@/lib/quran/types";
import { DEFAULT_FILTERS } from "@/lib/search/engine";
import { addToHistory, parseHistory } from "@/lib/search/history";
import { directMatches, fromParams, scopeOf, toParams } from "@/lib/search/query";

const { surahs } = JSON.parse(readFileSync(new URL("../public/data/quran/index.json", import.meta.url), "utf8")) as QuranIndex;

describe("direct matches", () => {
  it.each(["আয়াতুল কুরসি", "ayatul kursi", "আয়াতুল কুরছি"])("knows %s", (q) => {
    expect(directMatches(q, surahs).named).toMatchObject({ surah: 2, ayah: 255 });
  });
  it("understands the word surah in front", () => {
    expect(directMatches("সূরা ইয়াসিন", surahs).surahs.map((s) => s.n)).toEqual([36]);
    expect(directMatches("sura yasin", surahs).surahs.map((s) => s.n)).toEqual([36]);
  });
  it("offers a jump for references", () => expect(directMatches("২:২৫৫", surahs).reference).toEqual({ surah: 2, ayah: 255 }));
  it("does not guess from one letter", () => expect(directMatches("ক", surahs).surahs).toEqual([]));
  it("has nothing for an empty box", () => expect(directMatches("", surahs).surahs).toEqual([]));
});

describe("search address", () => {
  it("round-trips", () => {
    const filters = { field: "bn", mode: "word", surah: 2, juz: 3, revelation: "medinan" } as const;
    expect(fromParams(toParams("ধৈর্য", filters))).toEqual({ query: "ধৈর্য", filters });
    expect(toParams("", DEFAULT_FILTERS)).toBe("");
  });
  it("ignores nonsense in a shared link", () => {
    expect(fromParams("?field=x&mode=y&surah=999&juz=-1&revelation=z")).toEqual({ query: "", filters: DEFAULT_FILTERS });
  });
});

describe("recent searches", () => {
  it("keeps eight, newest first, without repeats", () => {
    const list = "abcdefghij".split("").reduce(addToHistory, [] as string[]);
    expect(list).toHaveLength(8);
    expect(list[0]).toBe("j");
    expect(addToHistory(list, "g")[0]).toBe("g");
    expect(new Set(addToHistory(list, "g")).size).toBe(8);
  });
  it("survives corrupt storage", () => {
    for (const raw of [null, "x", "{}", "[1,2]"]) expect(parseHistory(raw)).toEqual([]);
  });
});

describe("search tabs", () => {
  it("opens the side the address asks for, and both when it asks for neither", () => {
    expect(["", "?q=x", "?scope=quran&q=x", "?scope=hadith", "?scope=other"].map(scopeOf)).toEqual(["all", "all", "quran", "hadith", "all"]);
  });
  it("treats an older link with Quran filters as a Quran search", () => expect(scopeOf("?q=x&surah=2")).toBe("quran"));
});

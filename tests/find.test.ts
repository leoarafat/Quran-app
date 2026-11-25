import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { filterSurahs, parseReference } from "@/lib/quran/find";
import type { QuranIndex } from "@/lib/quran/types";

const { surahs } = JSON.parse(readFileSync(new URL("../public/data/quran/index.json", import.meta.url), "utf8")) as QuranIndex;
const ids = (q: string) => filterSurahs(surahs, q).map((s) => s.n);

describe("surah search", () => {
  it("finds by number in either digit style", () => {
    expect(ids("36")).toEqual([36]);
    expect(ids("৩৬")).toEqual([36]);
  });
  it("finds by Bangla name, with or without hyphen and article", () => {
    expect(ids("ইয়াসিন")).toEqual([36]);
    expect(ids("ইয়াসীন")).toEqual([36]);
    expect(ids("ইয়়াসিন".normalize("NFD"))).toEqual([36]);
    expect(ids("বাকারা")).toEqual([2]);
    expect(ids("আল বাকারা")).toEqual([2]);
    expect(ids("নাস")).toEqual([114]);
  });
  it("finds by English and Arabic name", () => {
    expect(ids("yaseen")).toEqual([36]);
    expect(ids("yasin")).toEqual([36]);
    expect(ids("الفاتحة")).toEqual([1]);
  });
  it("returns everything for an empty query and nothing for nonsense", () => {
    expect(ids("  ")).toHaveLength(114);
    expect(ids("xqxq")).toEqual([]);
  });
});

describe("ayah references", () => {
  it.each([["2:255", 2, 255], ["২:২৫৫", 2, 255], ["2.255", 2, 255], ["বাকারা ২৫৫", 2, 255], ["yasin 5", 36, 5], ["নাস ৬", 114, 6]])("%s", (q, surah, ayah) => {
    expect(parseReference(q, surahs)).toEqual({ surah, ayah });
  });
  it.each(["2:287", "115:1", "0:1", "2:0", "বাকারা", "আল ৫", ""])("rejects %j", (q) => {
    expect(parseReference(q, surahs)).toBeNull();
  });
});

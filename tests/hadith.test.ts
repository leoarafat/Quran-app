import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { arabicSkeleton, bestMatch, booksNamed, gradeClass, indexBook, matnOf } from "../scripts/lib/hadith.mjs";
import { readHadithSource } from "../scripts/lib/hadith-source.mjs";
import { createHadithIndex, DEFAULT_HADITH_FILTERS, type HadithFilters } from "@/lib/hadith/search";
import type { Hadith, HadithIndex } from "@/lib/hadith/types";
import { hadithFromParams, hadithToParams } from "@/lib/search/query";

const json = (p: string) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const index = json("public/data/hadith/index.json") as HadithIndex;
const item = (id: number | string) => json(`public/data/hadith/item/${id}.json`) as Hadith;
type SourceRow = { id: number; title: string; hadeeth: string; hadeeth_ar: string; grade: string; attribution: string; explanation: string; hints: string | null };
const source = readHadithSource() as unknown as { hadiths: SourceRow[] };
const ids = Object.keys(index.titles).map(Number);

describe("published hadith data", () => {
  it("keeps every published text exactly as the publisher wrote it", () => {
    const rows = new Map(source.hadiths.map((r) => [r.id, r]));
    for (const id of ids) {
      const h = item(id);
      const r = rows.get(id)!;
      expect([h.title, h.hadeeth, h.arabic, h.grade, h.attribution, h.explanation]).toEqual([r.title, r.hadeeth, r.hadeeth_ar, r.grade, r.attribution, r.explanation]);
      expect(h.hints).toEqual(JSON.parse(r.hints || "[]"));
    }
  });
  it("publishes no weak or unclear grade", () => {
    expect(ids).toHaveLength(1922);
    expect(ids).not.toContain(65065);
    expect(ids).not.toContain(3412);
    const weak = source.hadiths.filter((r) => r.grade.trim() === "দুর্বল");
    expect(weak.map((r) => r.id)).toEqual([65065]);
    for (const id of ids) expect(["sahih", "hasan"]).toContain(item(id).gradeClass);
  });
  it("states where it came from and never invents a version", () => {
    expect(index.meta).toMatchObject({ publisher: "HadeethEnc.com", fileDate: "2026-11-20", version: null });
    expect(index.meta.sha256).toHaveLength(64);
  });
  it("has consistent topics", () => {
    const byId = new Map(index.categories.map((c) => [c.id, c]));
    for (const c of index.categories) {
      expect(c.count).toBeGreaterThan(0);
      for (const child of c.children) expect(byId.get(child)?.parent).toBe(c.id);
      for (const h of c.hadiths) expect(index.titles[h]).toBeTruthy();
    }
    for (const id of [301, 293, 465, 303, 306, 307, 308, 313, 302, 5]) expect(byId.has(id), `topic ${id}`).toBe(true);
  });
  it("shows a Bukhari number only after a strong machine match", () => {
    expect(item(5503).bukhari).toContain(6306);
    for (const id of ids) {
      const h = item(id);
      if (!h.bukhari) continue;
      expect(booksNamed(h.attribution), `${id}`).toContain("bukhari");
      expect(h.match).toBe("strong");
      expect(h.bukhari.every((n) => Number.isInteger(n) && n >= 1 && n <= 7563)).toBe(true);
    }
  });
});

describe("hadith rules", () => {
  it("stops on a grade nobody classified", () => expect(() => gradeClass("নতুন কোনো মান")).toThrow());
  it("reads which books are named", () => {
    expect(booksNamed("মুত্তাফাকুন ‘আলাইহি (বুখারী ও মুসলিম)।").sort()).toEqual(["bukhari", "muslim"]);
    expect(booksNamed("এটি আবূ দাঊদ বর্ণনা করেছেন। - এটি নাসাঈ বর্ণনা করেছেন। - এটি ইবনু মাজাহ বর্ণনা করেছেন।")).toEqual(["abudawud", "nasai", "ibnmajah"]);
    expect(booksNamed("এটি আহমাদ বর্ণনা করেছেন।")).toEqual([]);
  });
  it("compares Arabic without vowel marks", () => expect(arabicSkeleton("إِنَّمَا الْأَعْمَالُ")).toBe("انما الاعمال"));
  it("matches the right hadith and rejects an unrelated one", () => {
    const book = indexBook([{ hadithnumber: 1, text: "قال رسول الله انما الاعمال بالنيات وانما لكل امرئ ما نوى" }, { hadithnumber: 2, text: "من حسن اسلام المرء تركه ما لا يعنيه ابدا" }]);
    expect(bestMatch(book, "انما الاعمال بالنيات وانما لكل امرئ ما نوى")).toMatchObject({ score: 1, numbers: [1] });
    expect(bestMatch(book, "الحمد لله رب العالمين الرحمن الرحيم مالك").score).toBe(0);
    expect(matnOf("قال «نعم»").quoted).toBe(false);
  });
});

describe("hadith search", () => {
  const search = createHadithIndex(json("public/data/hadith/search.json").rows);
  const run = (q: string, f: Partial<HadithFilters> = {}) => search(q, { ...DEFAULT_HADITH_FILTERS, ...f }, 5000);

  it("covers every published hadith", () => expect(json("public/data/hadith/search.json").rows).toHaveLength(1922));
  it("finds by Bangla words with synonyms", () => {
    const result = run("নামাজ");
    expect(result.total).toBeGreaterThan(100);
    expect(result.synonyms).toContain("সালাত");
  });
  it("finds by Arabic without vowel marks", () => expect(run("سيد الاستغفار").results.map((r) => r.id)).toContain(5503));
  it("filters by grade and book", () => {
    expect(run("সালাত", { grade: "hasan" }).results.every((r) => r.gradeClass === "hasan")).toBe(true);
    const all = run("সালাত").total;
    expect(run("সালাত", { grade: "hasan" }).total + run("সালাত", { grade: "sahih" }).total).toBe(all);
    const bukhari = run("সালাত", { book: "bukhari" });
    expect(bukhari.total).toBeGreaterThan(0);
    expect(bukhari.results.every((r) => /বুখার|মুত্তাফাক/.test(r.attribution.normalize("NFC")))).toBe(true);
  });
  it("highlights words inside the excerpt", () => {
    const hit = run("প্রতিবেশী").results.find((r) => r.marks.length)!;
    for (const i of hit.marks) expect(hit.snippet.split(" ")[i]).toContain("প্রতিবেশ");
  });
  it.each(["", "ক", "hello", "!!", "ফফফফফফফ"])("is empty and safe for %j", (q) => expect(run(q).total).toBe(0));
  it("keeps its filters in the address", () => {
    const filters = { grade: "hasan", book: "muslim", mode: "word" } as const;
    expect(hadithFromParams(hadithToParams("ক্ষমা", filters))).toEqual({ query: "ক্ষমা", filters });
    expect(hadithFromParams("?grade=x&book=y&mode=z").filters).toEqual(DEFAULT_HADITH_FILTERS);
  });
});

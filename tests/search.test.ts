import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createIndex, DEFAULT_FILTERS, type Filters } from "@/lib/search/engine";
import { fold } from "@/lib/search/normalize";

const data = JSON.parse(readFileSync(new URL("../public/data/quran/search.json", import.meta.url), "utf8"));
const search = createIndex(data.rows, data.revelation);
const run = (q: string, f: Partial<Filters> = {}, limit = 10000) => search(q, { ...DEFAULT_FILTERS, ...f }, limit);
const keys = (q: string, f: Partial<Filters> = {}) => run(q, f).results.map((r) => `${r.s}:${r.a}`);

describe("search data", () => {
  it("covers every ayah and carries the notices", () => {
    expect(data.rows).toHaveLength(6236);
    expect(data.notice).toContain("Tanzil Project");
    expect(data.translation).toContain("1.1.4");
  });
});

describe("pronunciation, typed the way people type", () => {
  it.each(["আলহামদু লিল্লাহি রাব্বিল আলামীন", "আলহামদুলিল্লাহি রাব্বিল আলআমিন", "আলহামদুলিল্লাহ"])("%s finds 1:2", (q) => {
    expect(keys(q, { field: "tr" })).toContain("1:2");
  });
  it("finds the user's own spelling of 1:4", () => expect(keys("মালিকি ইয়াউমিদ্দিন")).toContain("1:4"));
  it("highlights the matching words only", () => {
    const hit = run("রাব্বিল আলামিন", { field: "tr" }).results.find((r) => r.s === 1 && r.a === 2)!;
    expect(hit.marks.tr.map((i) => hit.tr.split(" ")[i])).toEqual(["রাব্বিল", "আলামীন"]);
  });
});

describe("meaning", () => {
  it("maps everyday words to the translation's words", () => {
    const prayer = run("নামাজ");
    expect(prayer.total).toBeGreaterThan(50);
    expect(prayer.synonyms).toContain("সালাত");
    expect(run("রোজা").total).toBeGreaterThan(0);
    expect(run("বেহেশত").total).toBeGreaterThan(50);
  });
  it("is tolerant of Bangla spelling", () => {
    expect(run("ধৈর্য").total).toBe(run("ধৈর্য".normalize("NFD")).total);
    expect(keys("জমিন")).toEqual(keys("যমীন"));
  });
  it("needs every word to be present", () => {
    for (const r of run("ধৈর্য সালাত", { field: "bn" }).results) {
      const text = fold(r.bn, "bangla");
      expect(text).toContain(fold("ধৈর্য", "bangla"));
      expect(text).toContain(fold("সালাত", "bangla"));
    }
    expect(keys("ধৈর্য সালাত")).toContain("2:153");
  });
  it("narrows from any part to word start to whole word", () => {
    const [any, start, word] = (["any", "start", "word"] as const).map((mode) => run("সালাত", { mode, field: "bn" }).total);
    expect(any).toBeGreaterThanOrEqual(start);
    expect(start).toBeGreaterThan(word);
    expect(word).toBeGreaterThan(0);
  });
  it("highlights what matched", () => {
    const hit = run("ধৈর্য", { field: "bn" }).results[0];
    expect(hit.marks.bn.length).toBeGreaterThan(0);
    for (const i of hit.marks.bn) expect(fold(hit.bn.split(" ")[i], "bangla")).toContain(fold("ধৈর্য", "bangla"));
  });
});

describe("Arabic", () => {
  it("works without harakat, with prefixes", () => {
    expect(keys("الرحمن الرحيم")).toContain("1:3");
    expect(keys("رحمن")).toContain("1:3");
    expect(keys("الله الصمد")).toEqual(["112:2"]);
  });
  it("works with text copied in Uthmani spelling", () => {
    const ayah = data.rows.find((r: [number, number]) => r[0] === 1 && r[1] === 2)[3];
    expect(keys(ayah)).toContain("1:2");
  });
  it("highlights a whole Arabic word", () => {
    const hit = run("الصمد").results[0];
    expect(hit.marks.ar).toHaveLength(1);
  });
});

describe("filters and limits", () => {
  it("filters by surah, juz and revelation", () => {
    expect(run("আল্লাহ", { surah: 112 }).results.every((r) => r.s === 112)).toBe(true);
    const juz30 = run("আল্লাহ", { juz: 30 }).results;
    expect(juz30.length).toBeGreaterThan(0);
    expect(juz30.every((r) => r.s >= 78)).toBe(true);
    const all = run("আল্লাহ").total;
    expect(run("আল্লাহ", { revelation: "meccan" }).total + run("আল্লাহ", { revelation: "medinan" }).total).toBe(all);
  });
  it("pages results but reports the full total", () => {
    const page = run("আল্লাহ", {}, 30);
    expect(page.results).toHaveLength(30);
    expect(page.total).toBeGreaterThan(1000);
  });
  it.each(["", " ", "ক", "ا", "zzz", "123", "।।", "(*.[", "ফফফফফফফ"])("is safe and empty for %j", (q) => {
    expect(run(q).total).toBe(0);
  });
  it("answers quickly", () => {
    const started = performance.now();
    for (const q of ["আল্লাহ", "আলহামদুলিল্লাহ", "الله", "ধৈর্য সালাত"]) run(q, {}, 30);
    expect((performance.now() - started) / 4).toBeLessThan(250);
  });
});

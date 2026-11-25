import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dua, type DuaKey } from "@/lib/namaz/dua-text";
import cuts from "@/lib/namaz/duas.json";
import { LESSONS } from "@/lib/namaz";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const blocks = LESSONS.flatMap((l) => l.sections.flatMap((s) => s.blocks));

describe("prayer lessons", () => {
  it("has unique lesson and section addresses, all kept for offline use", () => {
    expect(new Set(LESSONS.map((l) => l.slug)).size).toBe(LESSONS.length);
    const sw = read("scripts/build-sw.mjs");
    for (const lesson of LESSONS) {
      expect(sw).toContain(`"/namaz/${lesson.slug}/"`);
      expect(new Set(lesson.sections.map((s) => s.id)).size).toBe(lesson.sections.length);
    }
  });
  it("points only at ayahs that exist", () => {
    for (const block of blocks) {
      if (block.kind !== "ayat") continue;
      for (const [s, from, to] of block.passages) {
        const { ayahs } = JSON.parse(read(`public/data/quran/${s}.json`));
        expect([ayahs[from - 1]?.a, ayahs[to - 1]?.a], `${s}:${from}-${to}`).toEqual([from, to]);
      }
    }
  });
  it("teaches every dua it has", () => {
    const used = new Set(blocks.flatMap((b) => (b.kind === "duas" ? b.keys : b.kind === "step" ? (b.say ?? []) : [])));
    expect([...used].sort()).toEqual(Object.keys(cuts).sort());
    for (const key of used) expect(dua(key as DuaKey).pron).toBeTruthy();
  });
  it("keeps the Arabic exactly as cut from the source file", () => {
    const before = read("src/lib/namaz/duas.json");
    execFileSync("python3", [new URL("../scripts/extract-namaz-duas.py", import.meta.url).pathname]);
    expect(read("src/lib/namaz/duas.json")).toBe(before);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findExamples, firstLetter, LETTERS, letterForms, makeQuestion, MARKS } from "@/lib/arabic/letters";

const ayahs = Array.from({ length: 114 }, (_, i) => i + 1).flatMap((s) =>
  (JSON.parse(readFileSync(new URL(`../public/data/quran/${s}.json`, import.meta.url), "utf8")).ayahs as { a: number; ar: string }[]).map((x) => ({ s, a: x.a, ar: x.ar })),
);

describe("arabic letters", () => {
  it("has the 28 letters in order, each a single different character with its own name", () => {
    expect(LETTERS).toHaveLength(28);
    expect(new Set(LETTERS.map((l) => l.ch)).size).toBe(28);
    expect(new Set(LETTERS.map((l) => l.name)).size).toBe(28);
    for (const l of LETTERS) expect([...l.ch]).toHaveLength(1);
    // alphabetical order of the standard 28 (Unicode keeps them in it, with ta marbuta and others between)
    const codes = LETTERS.slice(0, 26).map((l) => l.ch.codePointAt(0)!);
    expect([...codes].sort((a, b) => a - b)).toEqual(codes);
    expect(LETTERS.slice(26).map((l) => l.ch.codePointAt(0))).toEqual([0x0647, 0x064a]);
  });
  it("marks exactly the six letters that do not join forward", () => {
    expect(LETTERS.filter((l) => l.breaks).map((l) => l.ch).join("")).toBe("ادذرزو");
    const dal = LETTERS.find((l) => l.ch === "د")!;
    expect(letterForms(dal).map((f) => f.text)).toEqual(["د", "د", "‍د", "‍د"]);
    expect(letterForms(LETTERS[1]).map((f) => f.text)).toEqual(["ب", "ب‍", "‍ب‍", "‍ب"]);
  });
  it("shows eight different vowel signs", () => expect(new Set(MARKS.map((m) => m.mark)).size).toBe(8));
  it("takes example words for every letter exactly as they stand in the Quran", () => {
    const found = findExamples(ayahs);
    const text = new Map(ayahs.map((x) => [`${x.s}:${x.a}`, x.ar]));
    for (const l of LETTERS) {
      expect(found[l.ch].length, l.name).toBeGreaterThan(0);
      for (const e of found[l.ch]) {
        expect(text.get(`${e.s}:${e.a}`)!.split(" ")).toContain(e.word);
        expect(firstLetter(e.word)).toBe(l.ch);
      }
    }
  });
  it("asks fair questions, whatever the random numbers are", () => {
    for (const random of [() => 0, () => 0.999999, Math.random]) {
      let previous: number | null = null;
      for (let i = 0; i < 200; i++) {
        const q = makeQuestion(random, previous);
        expect(new Set(q.choices).size).toBe(4);
        expect(q.choices).toContain(q.answer);
        expect(q.answer).not.toBe(previous);
        for (const c of q.choices) expect(c >= 0 && c < 28).toBe(true);
        previous = q.answer;
      }
    }
  });
});

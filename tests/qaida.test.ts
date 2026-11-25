import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findRuleExamples, QAIDA } from "@/lib/arabic/qaida";

const ayahs = [1, ...Array.from({ length: 113 }, (_, i) => 114 - i)].flatMap((s) =>
  (JSON.parse(readFileSync(new URL(`../public/data/quran/${s}.json`, import.meta.url), "utf8")).ayahs as { a: number; ar: string }[]).map((x) => ({ s, a: x.a, ar: x.ar })),
);

describe("qaida course", () => {
  it("has unique lessons, all kept for offline use", () => {
    expect(new Set(QAIDA.map((l) => l.slug)).size).toBe(QAIDA.length);
    const sw = readFileSync(new URL("../scripts/build-sw.mjs", import.meta.url), "utf8");
    for (const l of QAIDA) expect(sw).toContain(`"/arabic/${l.slug}/"`);
  });
  it("finds Quran words for every rule, exactly as they stand there", () => {
    const text = new Map(ayahs.map((x) => [`${x.s}:${x.a}`, x.ar.split(" ").filter((w) => /\p{L}/u.test(w)).join(" ")]));
    for (const lesson of QAIDA) {
      const rules = lesson.examples ?? [];
      findRuleExamples(ayahs, rules).forEach((list, i) => {
        expect(list.length, `${lesson.slug}: ${rules[i].label}`).toBeGreaterThan(0);
        for (const e of list) {
          expect(` ${text.get(`${e.s}:${e.a}`)} `).toContain(` ${e.text} `);
          expect(e.text).toMatch(rules[i].pattern);
        }
      });
    }
  });
});

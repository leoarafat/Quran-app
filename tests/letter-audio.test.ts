import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LETTERS } from "@/lib/arabic/letters";

const json = (p: string) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));

describe("letter audio", () => {
  it("publishes exactly the recordings a person has chosen, each with its source", () => {
    const chosen = Object.keys(json("content/letter-audio.json").letters).sort();
    const built = json("src/lib/arabic/letter-audio.json") as Record<string, { src: string; from: string }>;
    expect(Object.keys(built).sort()).toEqual(chosen);
    for (const [letter, a] of Object.entries(built)) {
      expect(LETTERS.some((l) => l.ch === letter)).toBe(true);
      expect(a.from).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      expect(existsSync(new URL(`../public${a.src}`, import.meta.url))).toBe(true);
    }
  });
});

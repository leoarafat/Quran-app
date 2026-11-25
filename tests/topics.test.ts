import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PROPHET_SURAHS, TOPICS } from "@/lib/topics";

const json = (path: string) => JSON.parse(readFileSync(new URL(`../public/data/${path}`, import.meta.url), "utf8"));
const categories = new Map((json("hadith/index.json").categories as { id: number; count: number }[]).map((c) => [c.id, c]));

describe("topic pages", () => {
  it.each(Object.entries(TOPICS))("%s points only at hadith groups and ayahs that exist", (_, topic) => {
    const ids = topic.groups.flatMap((g) => g.categories);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(categories.get(id)?.count ?? 0, `group ${id}`).toBeGreaterThan(0);
    for (const [s, from, to] of topic.passages) {
      expect(from).toBeLessThanOrEqual(to);
      const { ayahs } = json(`quran/${s}.json`);
      expect([ayahs[from - 1]?.a, ayahs[to - 1]?.a], `${s}:${from}-${to}`).toEqual([from, to]);
    }
  });
  it("lists the surahs named after prophets by their real names", () => {
    const { surahs } = json("quran/index.json");
    expect(PROPHET_SURAHS.map((n) => surahs[n - 1].latin)).toEqual(["Yunus", "Hud", "Yusuf", "Ibrahim", "Muhammad", "Nooh"]);
  });
});

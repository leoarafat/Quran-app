import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dateOfDay, daysBehind, EMPTY_PLANS, isComplete, juzOf, nextDay, ordinal, pageOf, percent, readPlans, refAt, reschedule, splitRange, toggleDay, type Layout, type ReadingPlan } from "@/lib/tools/planner";
import { TEMPLATE_GROUPS } from "@/lib/tools/planTemplates";
import { BACKUP_KEYS } from "@/lib/tools/backup";

const index = JSON.parse(readFileSync(new URL("../public/data/quran/index.json", import.meta.url), "utf8"));
const layout: Layout = { counts: index.surahs.map((s: { ayahs: number }) => s.ayahs), pages: index.pages, juzs: index.juzs };
const templates = TEMPLATE_GROUPS.flatMap((g) => g.items);
const plan: ReadingPlan = { id: "a", name: "পরীক্ষা", days: 3, from: { s: 1, a: 1 }, to: { s: 1, a: 7 }, start: "2026-11-28", done: {} };

describe("reading plans", () => {
  it("places ayahs in the Quran", () => {
    expect(ordinal(layout, { s: 114, a: 6 })).toBe(6235);
    expect(refAt(layout, 7)).toEqual({ s: 2, a: 1 });
    expect(pageOf(layout, { s: 114, a: 6 })).toBe(604);
    expect(juzOf(layout, { s: 78, a: 1 })).toBe(30);
  });

  it.each(templates)("$id covers its whole range with no gap or overlap", (t) => {
    const parts = splitRange(layout, t.from, t.to, t.days);
    expect(parts).toHaveLength(t.days);
    let next = ordinal(layout, t.from);
    for (const p of parts) {
      expect(ordinal(layout, p.from)).toBe(next);
      expect(ordinal(layout, p.to)).toBeGreaterThanOrEqual(next);
      next = ordinal(layout, p.to) + 1;
    }
    expect(next - 1).toBe(ordinal(layout, t.to));
  });

  it("gives each day of a month's reading about twenty pages", () => {
    for (const part of splitRange(layout, { s: 1, a: 1 }, { s: 114, a: 6 }, 30)) {
      const pages = pageOf(layout, part.to) - pageOf(layout, part.from) + 1;
      expect(pages).toBeGreaterThanOrEqual(19);
      expect(pages).toBeLessThanOrEqual(23);
    }
  });

  it("never makes more days than ayahs and rejects a backward range", () => {
    expect(splitRange(layout, plan.from, plan.to, 50)).toHaveLength(7);
    expect(splitRange(layout, plan.to, plan.from, 3)).toEqual([]);
  });

  it("tracks reading, lateness and new dates", () => {
    expect(dateOfDay(plan, 2)).toBe("2026-11-30");
    expect(daysBehind(plan, "2026-11-28")).toBe(0);
    expect(daysBehind(plan, "2026-11-30")).toBe(2);
    const one = toggleDay(plan, 0, "2026-11-30");
    expect([percent(one), nextDay(one), daysBehind(one, "2026-11-30")]).toEqual([33, 1, 1]);
    const moved = reschedule(one, "2026-11-30");
    expect([dateOfDay(moved, 1), daysBehind(moved, "2026-11-30"), moved.done[0]]).toEqual(["2026-11-30", 0, "2026-11-30"]);
    expect(toggleDay(one, 0, "2026-11-30").done).toEqual({});
    expect(isComplete(toggleDay(toggleDay(one, 1, "2026-11-30"), 2, "2026-11-30"))).toBe(true);
  });

  it("reads saved plans carefully and keeps them in the backup", () => {
    expect(readPlans(JSON.stringify({ version: 1, plans: [plan, { id: "bad" }] }))?.plans).toEqual([plan]);
    expect(readPlans("{")).toBeNull();
    expect(readPlans(JSON.stringify(EMPTY_PLANS))).toEqual(EMPTY_PLANS);
    expect(BACKUP_KEYS["noor.plans.v1"]).toBeTruthy();
  });
});

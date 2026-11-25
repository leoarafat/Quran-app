import { describe, expect, it } from "vitest";
import { addItem, DAYS_KEPT, dayKey, EMPTY_ROUTINE, lastDays, progress, readRoutine, removeItem, restoreItem, toggle } from "@/lib/tools/routine";

const base = () => addItem(addItem(EMPTY_ROUTINE, "a", "  পড়া "), "b", "দান");

describe("daily checklist", () => {
  it("ticks per day and unticks", () => {
    const r = toggle(toggle(base(), "2026-11-25", "fajr"), "2026-11-25", "a");
    expect(progress(r, "2026-11-25")).toEqual({ done: 2, total: 7, prayers: 1 });
    expect(progress(r, "2026-11-26").done).toBe(0);
    expect(progress(toggle(r, "2026-11-25", "a"), "2026-11-25").done).toBe(1);
  });
  it("adds trimmed, refuses empty and duplicate ids", () => {
    const r = base();
    expect(r.items[0].name).toBe("পড়া");
    expect(addItem(r, "c", "   ")).toBe(r);
    expect(addItem(r, "a", "আবার")).toBe(r);
  });
  it("removing and restoring brings back the place and the history", () => {
    const r = toggle(base(), "2026-11-25", "a");
    const back = restoreItem(removeItem(r, "a"), r.items[0], 0);
    expect(back).toEqual(r);
  });
  it("keeps only the latest days", () => {
    let r = EMPTY_ROUTINE;
    for (const key of lastDays(new Date(2026, 11, 31), DAYS_KEPT + 5)) r = toggle(r, key, "fajr");
    expect(Object.keys(r.days)).toHaveLength(DAYS_KEPT);
    expect(r.days["2026-12-31"]).toEqual(["fajr"]);
  });
  it("counts calendar days across a month and year", () => {
    expect(lastDays(new Date(2027, 0, 2, 0, 5), 4)).toEqual(["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"]);
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
  it("reads saved data and drops only what is broken", () => {
    expect(readRoutine(JSON.stringify(base()))).toEqual(base());
    for (const bad of ["{", "null", "[]", '{"version":2,"items":[],"days":{}}']) expect(readRoutine(bad), bad).toBeNull();
    const r = readRoutine(JSON.stringify({ version: 1, items: [null, { id: "x", name: " " }, { id: "y", name: "ঠিক" }], days: { nope: [], "2026-11-25": ["fajr", "fajr", 5] } }))!;
    expect(r).toEqual({ version: 1, items: [{ id: "y", name: "ঠিক" }], days: { "2026-11-25": ["fajr"] } });
  });
});

import { describe, expect, it } from "vitest";
import { addPages, daysLeft, EMPTY_KHATM, finish, goalFor, PAGES, readKhatm, setGoal, setPage } from "@/lib/tools/khatm";
import { streak } from "@/lib/tools/streak";

const day = "2026-11-25";

describe("khatm log", () => {
  it("counts pages and takes a mistake back", () => {
    const two = addPages(addPages(EMPTY_KHATM, day, 1), day, 1);
    expect(two).toMatchObject({ page: 2, log: { [day]: 2 } });
    expect(addPages(two, day, -2)).toMatchObject({ page: 0, log: {} });
    expect(addPages(EMPTY_KHATM, day, -1)).toBe(EMPTY_KHATM);
  });

  it("never passes the last page and finishes only a complete reading", () => {
    const near = setPage(EMPTY_KHATM, PAGES - 1);
    expect(near.log).toEqual({});
    const full = addPages(near, day, 10);
    expect(full).toMatchObject({ page: PAGES, log: { [day]: 1 } });
    expect(finish(full, day)).toMatchObject({ page: 0, completed: [day], log: { [day]: 1 } });
    expect(finish(near, day)).toBe(near);
  });

  it("works out days and goals", () => {
    expect(daysLeft(setGoal(EMPTY_KHATM, 20))).toBe(31);
    expect(goalFor(EMPTY_KHATM, 30)).toBe(21);
    expect(goalFor(setPage(EMPTY_KHATM, PAGES - 1), 365)).toBe(1);
    expect(setGoal(EMPTY_KHATM, 9999).goal).toBe(60);
  });

  it("keeps what is valid in stored data and rejects the rest", () => {
    expect(readKhatm("junk")).toBeNull();
    expect(readKhatm('{"version":2}')).toBeNull();
    expect(readKhatm('{"version":1,"page":9999,"goal":"x","log":{"2026-11-25":3,"bad":2,"2026-11-24":-1},"completed":["x","2026-01-01"]}'))
      .toEqual({ version: 1, page: PAGES, goal: 4, log: { "2026-11-25": 3 }, completed: ["2026-01-01"] });
  });
});

describe("streak", () => {
  const today = new Date(2026, 10, 25, 9);
  const on = (...days: string[]) => (d: string) => days.includes(d);
  it("counts back from today, and an empty today does not break it yet", () => {
    expect(streak(today, on("2026-11-25", "2026-11-24", "2026-11-22"))).toBe(2);
    expect(streak(today, on("2026-11-24", "2026-11-23"))).toBe(2);
    expect(streak(today, on("2026-11-23"))).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { addPages, daysLeft, EMPTY_KHATM, finish, goalFor, PAGES, parasDone, planStatus, readKhatm, setGoal, setPage, startPlan } from "@/lib/tools/khatm";
import { dailyDue, parseDailyReminder } from "@/lib/tools/reminders";
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

describe("khatm plan", () => {
  const plan = startPlan(EMPTY_KHATM, 30, day);

  it("sets the daily goal and survives a save and load", () => {
    expect(plan.goal).toBe(21);
    expect(readKhatm(JSON.stringify(plan))).toEqual(plan);
    expect(readKhatm(JSON.stringify({ ...plan, plan: { days: 0, start: day } }))?.plan).toBeUndefined();
  });

  it("counts the day and says when a full day's share is missing", () => {
    expect(planStatus(plan, day)).toEqual({ day: 1, behind: 0, over: false });
    // Day 2 with nothing read is exactly one share short.
    expect(planStatus(plan, "2026-11-26")).toEqual({ day: 2, behind: 20, over: false });
    expect(planStatus(setPage(plan, 20), "2026-11-26")?.behind).toBe(0);
    expect(planStatus(plan, "2027-01-30")).toMatchObject({ day: 30, over: true });
    expect(planStatus(EMPTY_KHATM, day)).toBeNull();
  });

  it("is dropped by a goal set by hand and by finishing", () => {
    expect(setGoal(plan, 5).plan).toBeUndefined();
    expect(finish(setPage(plan, PAGES), day).plan).toBeUndefined();
  });

  it("counts finished paras from the pages they begin on", () => {
    const firstPages = [1, 22, 42];
    expect([0, 20, 21, 41, PAGES].map((p) => parasDone(p, firstPages))).toEqual([0, 0, 1, 2, 3]);
  });

  it("fires the daily reading reminder only near its time", () => {
    const at = (h: number, m: number, s = 0) => new Date(2026, 10, 25, h, m, s);
    expect(dailyDue("06:00", at(5, 59, 59))).toBe(false);
    expect(dailyDue("06:00", at(6, 1))).toBe(true);
    expect(dailyDue("06:00", at(6, 2))).toBe(false);
    expect(parseDailyReminder('{"on":true,"time":"25:00"}')).toEqual({ on: true, time: "06:00" });
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

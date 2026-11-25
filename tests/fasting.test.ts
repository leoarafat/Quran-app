import { describe, expect, it } from "vitest";
import { calendarDay, CITIES, timesFor } from "@/lib/prayer";
import { fastingTimes, nextFastingMoment, ramadanDays } from "@/lib/tools/fasting";
import { hijriOf, noon } from "@/lib/tools/hijri";

const dhaka = CITIES[0];
const day = calendarDay(new Date("2026-11-25T06:00:00+06:00"), dhaka.timeZone);

describe("fasting times", () => {
  it("are exactly the Fajr and Maghrib shown on the home page", () => {
    const t = timesFor(dhaka, day);
    expect(fastingTimes(dhaka, day)).toEqual({ sehriEnds: t.fajr, iftar: t.maghrib });
  });
  it("counts down to sehri, then iftar, then the next day's sehri", () => {
    const { sehriEnds, iftar } = fastingTimes(dhaka, day);
    const at = (d: Date, ms: number) => nextFastingMoment(dhaka, new Date(d.getTime() + ms));
    expect(at(sehriEnds, -1000)).toEqual({ kind: "sehri", at: sehriEnds });
    expect(at(sehriEnds, 0)).toEqual({ kind: "iftar", at: iftar });
    const after = at(iftar, 1000);
    expect(after.kind).toBe("sehri");
    expect(after.at.getTime() - sehriEnds.getTime()).toBeGreaterThan(23.9 * 3_600_000);
  });
  it.each([-2, -1, 0, 1, 2])("finds the whole coming Ramadan with moon correction %i", (adjust) => {
    const month = ramadanDays(noon(new Date(2026, 10, 25)), adjust);
    expect([29, 30]).toContain(month.length);
    expect(month.map((d) => d.hijri.day)).toEqual(month.map((_, i) => i + 1));
    for (const d of month) expect(hijriOf(d.date, adjust).month).toBe(9);
    expect(month[0].date.getFullYear()).toBe(2027);
  });
  it("gives the running month from any day inside it", () => {
    const month = ramadanDays(noon(new Date(2026, 10, 25)), -1);
    expect(ramadanDays(month[14].date, -1)).toEqual(month);
    expect(ramadanDays(month.at(-1)!.date, -1)).toEqual(month);
  });
});

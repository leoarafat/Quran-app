import { describe, expect, it } from "vitest";
import { CITIES, nextPrayer, timesFor } from "@/lib/prayer";
import { DEFAULT_PRAYER_PREFS, parsePrayerPrefs } from "@/lib/prayerPrefs";
import { dueReminder, parseReminder } from "@/lib/tools/reminders";
import { COLUMNS, monthDays, toCsv } from "@/lib/tools/timetable";

const dhaka = CITIES[0];
const day = new Date(2026, 10, 25, 12);

describe("prayer calculation choices", () => {
  it("defaults are safe for bad data and limit the adjustment", () => {
    for (const raw of [null, "x", "null", '{"method":"moon"}']) expect(parsePrayerPrefs(raw)).toEqual(DEFAULT_PRAYER_PREFS);
    expect(parsePrayerPrefs('{"asr":"shafi","adjust":{"fajr":999,"isha":-2,"asr":1.5}}')).toMatchObject({ asr: "shafi", adjust: { fajr: 30, isha: -2, asr: 0 } });
  });

  it("keeps the old times by default", () => {
    expect(timesFor(dhaka, day, parsePrayerPrefs(null)).asr).toEqual(timesFor(dhaka, day).asr);
  });

  it("Shafi Asr comes earlier, and adjustments move only their own prayer", () => {
    const base = timesFor(dhaka, day);
    const shafi = timesFor(dhaka, day, { ...DEFAULT_PRAYER_PREFS, asr: "shafi" });
    expect(shafi.asr.getTime()).toBeLessThan(base.asr.getTime());
    const moved = timesFor(dhaka, day, { ...DEFAULT_PRAYER_PREFS, adjust: { ...DEFAULT_PRAYER_PREFS.adjust, maghrib: 3 } });
    expect(moved.maghrib.getTime() - base.maghrib.getTime()).toBe(180_000);
    expect(moved.fajr).toEqual(base.fajr);
  });
});

describe("monthly timetable", () => {
  it("covers whole months, leap years included", () => {
    expect(monthDays(2026, 10)).toHaveLength(30);
    expect(monthDays(2028, 1)).toHaveLength(29);
  });

  it("writes one row a day with every column", () => {
    const lines = toCsv(dhaka, monthDays(2026, 10), DEFAULT_PRAYER_PREFS).trim().split("\r\n");
    expect(lines).toHaveLength(32);
    expect(lines[1].startsWith('"2026-11-01"')).toBe(true);
    expect(lines[1].split(",")).toHaveLength(COLUMNS.length + 1);
  });
});

describe("prayer reminders", () => {
  const { next } = nextPrayer(dhaka, new Date(Date.UTC(2026, 10, 25, 3)));
  const at = (ms: number) => new Date(next.at.getTime() + ms);

  it("falls due once its lead time arrives, not before and not much later", () => {
    for (const before of [0, 10]) {
      const lead = -before * 60_000;
      expect(dueReminder(dhaka, DEFAULT_PRAYER_PREFS, before, at(lead - 1000))).toBeNull();
      expect(dueReminder(dhaka, DEFAULT_PRAYER_PREFS, before, at(lead))?.id).toBe(next.id);
      expect(dueReminder(dhaka, DEFAULT_PRAYER_PREFS, before, at(lead + 60_000))?.id).toBe(next.id);
      expect(dueReminder(dhaka, DEFAULT_PRAYER_PREFS, before, at(lead + 91_000))).toBeNull();
    }
  });

  it("is off unless switched on", () => {
    expect(parseReminder(null)).toEqual({ on: false, before: 10 });
    expect(parseReminder('{"on":"yes","before":7}')).toEqual({ on: false, before: 10 });
  });
});

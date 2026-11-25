import { describe, expect, it } from "vitest";
import { calendarDay, CITIES, clockTime, countdown, nextPrayer, PRAYERS, timesFor } from "@/lib/prayer";
import { parsePlace } from "@/lib/usePlace";

const dhaka = CITIES[0];
const at = (iso: string) => new Date(`${iso}+06:00`);

describe("prayer times", () => {
  // Reference values from api.aladhan.com (method 1, Hanafi), checked 2026-11-25. One minute of rounding is allowed.
  it.each([
    ["2026-11-25", ["05:00", "11:45", "15:35", "17:11", "18:30"]],
    ["2027-03-15", ["04:53", "12:07", "16:26", "18:07", "19:22"]],
    ["2027-06-21", ["03:44", "12:00", "16:41", "18:48", "20:16"]],
  ])("matches an independent source for Dhaka on %s", (date, expected) => {
    const times = timesFor(dhaka, calendarDay(at(`${date}T12:00:00`), dhaka.timeZone));
    PRAYERS.forEach(([id], i) => {
      const difference = Math.abs(times[id].getTime() - at(`${date}T${expected[i]}:00`).getTime());
      expect(difference, `${date} ${id}`).toBeLessThanOrEqual(60_000);
    });
  });

  it.each([
    ["2026-11-25T00:10:00", "fajr", "isha"],
    ["2026-11-25T05:30:00", "dhuhr", "fajr"],
    ["2026-11-25T12:30:00", "asr", "dhuhr"],
    ["2026-11-25T16:00:00", "maghrib", "asr"],
    ["2026-11-25T17:30:00", "isha", "maghrib"],
    ["2026-11-25T23:50:00", "fajr", "isha"],
  ])("at %s the next prayer is %s", (now, next, previous) => {
    const result = nextPrayer(dhaka, at(now));
    expect([result.next.id, result.previous.id]).toEqual([next, previous]);
    expect(result.next.at.getTime()).toBeGreaterThan(at(now).getTime());
    expect(result.previous.at.getTime()).toBeLessThanOrEqual(at(now).getTime());
  });

  it("formats clock and countdown in Bangla", () => {
    expect(clockTime(at("2026-11-25T17:05:00"), "Asia/Dhaka")).toBe("৫:০৫");
    expect(countdown(4_360_000)).toBe("১:১২:৪০");
    expect(countdown(-5)).toBe("০:০০:০০");
  });

  it("never trusts a stored place blindly", () => {
    for (const raw of [null, "x", "{}", '{"id":"here","lat":999,"lng":0,"timeZone":"Asia/Dhaka"}', '{"id":"here","lat":1,"lng":1,"timeZone":"No/Where"}']) {
      expect(parsePlace(raw).id).toBe("dhaka");
    }
    expect(parsePlace('{"id":"sylhet","lat":0}')).toEqual(CITIES.find((c) => c.id === "sylhet"));
  });
});

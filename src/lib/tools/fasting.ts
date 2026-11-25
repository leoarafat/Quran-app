// Fasting times for a place. The fast begins at Fajr (the end of sehri) and ends at Maghrib (iftar);
// both come from the same calculation as the prayer times on the home page.
import { calendarDay, timesFor, type Place } from "@/lib/prayer";
import { DEFAULT_PRAYER_PREFS, type PrayerPrefs } from "@/lib/prayerPrefs";
import { addDays, hijriMonthDays, hijriOf, noon, type HijriDate } from "./hijri";

const RAMADAN = 9;

export function fastingTimes(place: Place, day: Date, prefs: PrayerPrefs = DEFAULT_PRAYER_PREFS): { sehriEnds: Date; iftar: Date } {
  const times = timesFor(place, day, prefs);
  return { sehriEnds: times.fajr, iftar: times.maghrib };
}

/** The next fasting moment to count down to, going by the clock of the place. */
export function nextFastingMoment(place: Place, now: Date, prefs: PrayerPrefs = DEFAULT_PRAYER_PREFS): { kind: "sehri" | "iftar"; at: Date } {
  for (const offset of [0, 1]) {
    const { sehriEnds, iftar } = fastingTimes(place, calendarDay(now, place.timeZone, offset), prefs);
    if (sehriEnds > now) return { kind: "sehri", at: sehriEnds };
    if (iftar > now) return { kind: "iftar", at: iftar };
  }
  throw new Error("No fasting time within two days");
}

export type RamadanDay = { date: Date; hijri: HijriDate };

/** This Ramadan if `today` is in it, otherwise the coming one. Follows the visitor's moon correction. */
export function ramadanDays(today: Date, adjust: number): RamadanDay[] {
  for (let i = 0; i < 400; i++) {
    const date = addDays(noon(today), i);
    if (hijriOf(date, adjust).month === RAMADAN) return hijriMonthDays(date, adjust);
  }
  throw new Error("No Ramadan within a year");
}

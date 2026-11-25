import { clockTime, timesFor, type Place } from "@/lib/prayer";
import { METHODS, type PrayerPrefs } from "@/lib/prayerPrefs";

export const COLUMNS = [["fajr", "ফজর"], ["sunrise", "সূর্যোদয়"], ["dhuhr", "যোহর"], ["asr", "আসর"], ["maghrib", "মাগরিব"], ["isha", "এশা"]] as const;

/** Every day of a calendar month (month 0..11), as local-noon dates. */
export function monthDays(year: number, month: number): Date[] {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1, 12));
}

export const dayRow = (place: Place, day: Date, prefs: PrayerPrefs) => {
  const times = timesFor(place, day, prefs);
  return COLUMNS.map(([id]) => clockTime(times[id], place.timeZone));
};

export const describePrefs = (prefs: PrayerPrefs) => `${METHODS.find(([id]) => id === prefs.method)![1]} পদ্ধতি, ${prefs.asr === "hanafi" ? "হানাফি" : "শাফেয়ি"} আসর`;

/** A spreadsheet file of one month. The leading mark makes Excel read Bangla correctly. */
export function toCsv(place: Place, days: Date[], prefs: PrayerPrefs): string {
  const two = (n: number) => String(n).padStart(2, "0");
  const rows = [
    ["তারিখ", ...COLUMNS.map(([, name]) => name)],
    ...days.map((d) => [`${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`, ...dayRow(place, d, prefs)]),
    [`${place.name} · ${describePrefs(prefs)} · সময় ১২ ঘণ্টার ঘড়িতে`],
  ];
  return "﻿" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\r\n") + "\r\n";
}

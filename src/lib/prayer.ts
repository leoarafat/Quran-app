import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import { toBnDigits } from "./bn";

export type Place = { id: string; name: string; lat: number; lng: number; timeZone: string };

const city = (id: string, name: string, lat: number, lng: number): Place => ({ id, name, lat, lng, timeZone: "Asia/Dhaka" });

/** City-centre coordinates of the eight divisional headquarters. */
export const CITIES: Place[] = [
  city("dhaka", "ঢাকা", 23.8103, 90.4125),
  city("chattogram", "চট্টগ্রাম", 22.3569, 91.7832),
  city("rajshahi", "রাজশাহী", 24.3745, 88.6042),
  city("khulna", "খুলনা", 22.8456, 89.5403),
  city("barishal", "বরিশাল", 22.701, 90.3535),
  city("sylhet", "সিলেট", 24.8949, 91.8687),
  city("rangpur", "রংপুর", 25.7439, 89.2752),
  city("mymensingh", "ময়মনসিংহ", 24.7471, 90.4203),
];

export const PRAYERS = [
  ["fajr", "ফজর"], ["dhuhr", "যোহর"], ["asr", "আসর"], ["maghrib", "মাগরিব"], ["isha", "এশা"],
] as const;

export type PrayerId = (typeof PRAYERS)[number][0];
export type Moment = { id: PrayerId; name: string; at: Date };

/** The calendar day it currently is in the given time zone, as a local-noon Date for the library. */
export function calendarDay(now: Date, timeZone: string, offset = 0): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const [y, m, d] = parts.split("-").map(Number);
  return new Date(y, m - 1, d + offset, 12);
}

/** University of Islamic Sciences (Karachi) angles with the Hanafi Asr, as commonly used in Bangladesh. */
export function timesFor(place: Place, day: Date): PrayerTimes {
  const method = CalculationMethod.Karachi();
  method.madhab = Madhab.Hanafi;
  return new PrayerTimes(new Coordinates(place.lat, place.lng), day, method);
}

export function nextPrayer(place: Place, now: Date): { previous: Moment; next: Moment } {
  const moments: Moment[] = [-1, 0, 1].flatMap((offset) => {
    const times = timesFor(place, calendarDay(now, place.timeZone, offset));
    return PRAYERS.map(([id, name]) => ({ id, name, at: times[id] }));
  });
  const index = moments.findIndex((m) => m.at.getTime() > now.getTime());
  return { previous: moments[index - 1], next: moments[index] };
}

/** "৪:৫৮" (12-hour clock, without AM/PM, as printed Bangla timetables do). */
export function clockTime(at: Date, timeZone: string): string {
  const text = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(at);
  return toBnDigits(text.replace(/\s?[AP]M$/i, ""));
}

export function countdown(milliseconds: number): string {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return toBnDigits(`${Math.floor(total / 3600)}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`);
}

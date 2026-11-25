// Which days the visitor says they fasted. Their data; never lose it.
import { hijriOf } from "./hijri";

export const FASTS_KEY = "noor.fasts.v1";
export type Fasts = { version: 1; days: string[] };
export const EMPTY_FASTS: Fasts = { version: 1, days: [] };

export const isDay = (x: unknown): x is string => {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const date = new Date(`${x}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(x);
};

export function readFasts(raw: string): Fasts | null {
  try {
    const d = JSON.parse(raw);
    return d?.version === 1 && Array.isArray(d.days) ? { version: 1, days: [...new Set<string>(d.days.filter(isDay))].sort() } : null;
  } catch {
    return null;
  }
}

export const toggleFast = (f: Fasts, day: string): Fasts =>
  !isDay(day) ? f : { version: 1, days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day].sort() };

const asDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};

/** Split by the Hijri calendar, with the visitor's moon-sighting correction. */
export function summary(f: Fasts, today: Date, adjust: number) {
  const now = hijriOf(today, adjust);
  const dated = f.days.map((d) => hijriOf(asDate(d), adjust));
  // Before Ramadan the one that matters is last year's.
  const ramadanYear = now.month >= 9 ? now.year : now.year - 1;
  return {
    total: f.days.length,
    ramadanYear,
    ramadan: dated.filter((h) => h.month === 9 && h.year === ramadanYear).length,
    thisMonth: dated.filter((h) => h.month === now.month && h.year === now.year).length,
    outsideRamadan: dated.filter((h) => h.month !== 9).length,
  };
}

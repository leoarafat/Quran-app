import { addDays, hijriOf, noon, type HijriDate } from "./hijri";

const index = (h: HijriDate) => h.year * 12 + h.month - 1;

/** The civil date of a Hijri date, or null if that month has no such day. */
export function gregorianOf(target: HijriDate, adjust: number, near: Date): Date | null {
  const { year, month, day } = target;
  if (![year, month, day].every(Number.isInteger) || month < 1 || month > 12 || day < 1 || day > 30) return null;
  // Jump close using the average month length, then walk day by day.
  let date = noon(near);
  for (let i = 0; i < 4; i++) {
    const here = hijriOf(date, adjust);
    date = addDays(date, Math.round((index(target) - index(here)) * 29.530589 + day - here.day));
  }
  for (let offset = -40; offset <= 40; offset++) {
    const candidate = addDays(date, offset);
    const found = hijriOf(candidate, adjust);
    if (found.year === year && found.month === month && found.day === day) return candidate;
  }
  return null;
}

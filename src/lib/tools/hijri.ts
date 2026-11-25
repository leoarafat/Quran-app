/** Dates are handled as local noon so that adding days never slips across midnight. */
export const noon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);

export const HIJRI_MONTHS = ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাল আখিরাহ", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"];

export type HijriDate = { year: number; month: number; day: number };

const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { year: "numeric", month: "numeric", day: "numeric" });

/**
 * Umm al-Qura date, moved by the visitor's moon-sighting correction.
 * An adjustment of -1 means the local calendar is one day behind.
 */
export function hijriOf(date: Date, adjust: number): HijriDate {
  const parts = Object.fromEntries(formatter.formatToParts(addDays(date, adjust)).map((p) => [p.type, p.value]));
  return { year: Number.parseInt(parts.year, 10), month: Number(parts.month), day: Number(parts.day) };
}

/** Every civil day of the Hijri month that contains `date`. */
export function hijriMonthDays(date: Date, adjust: number): { date: Date; hijri: HijriDate }[] {
  const start = addDays(date, 1 - hijriOf(date, adjust).day);
  const { month } = hijriOf(start, adjust);
  const days = [];
  for (let d = noon(start); hijriOf(d, adjust).month === month && days.length < 31; d = addDays(d, 1)) {
    days.push({ date: d, hijri: hijriOf(d, adjust) });
  }
  return days;
}

/** Only days fixed by the calendar and widely agreed. No rulings are attached. */
const SPECIAL = [
  [1, 1, "হিজরি নববর্ষ"], [1, 10, "আশুরা"], [9, 1, "রমজান শুরু"], [10, 1, "ঈদুল ফিতর"],
  [12, 9, "আরাফার দিন"], [12, 10, "ঈদুল আযহা"], [12, 11, "আইয়ামে তাশরিক"], [12, 12, "আইয়ামে তাশরিক"], [12, 13, "আইয়ামে তাশরিক"],
] as const;

export const specialDay = ({ month, day }: HijriDate) => SPECIAL.find(([m, d]) => m === month && d === day)?.[2] ?? null;

export function upcomingSpecialDays(from: Date, adjust: number, count: number) {
  const out: { date: Date; name: string; inDays: number }[] = [];
  let last = "";
  for (let i = 0; i < 400 && out.length < count; i++) {
    const date = addDays(from, i);
    const name = specialDay(hijriOf(date, adjust));
    if (name && name !== last) out.push({ date, name, inDays: i });
    last = name ?? "";
  }
  return out;
}

export const ADJUST_CHOICES = [-2, -1, 0, 1, 2] as const;
/** Moon sighting in Bangladesh is commonly a day after the Umm al-Qura date; the visitor can change it. */
export const DEFAULT_ADJUST = -1;
export const parseAdjust = (raw: string | null) => (raw !== null && (ADJUST_CHOICES as readonly number[]).includes(Number(raw)) && raw !== "" ? Number(raw) : DEFAULT_ADJUST);

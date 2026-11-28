// Quran reading plans: a range of ayahs shared out over days. The visitor's own data; never lose it.

/** What is needed to place any ayah: ayah counts of the 114 surahs and where mushaf pages and paras begin. */
export type Layout = { counts: number[]; pages: { s: number; a: number }[]; juzs: { s: number; a: number }[] };
export type Ref = { s: number; a: number };

export type ReadingPlan = {
  id: string;
  name: string;
  days: number;
  from: Ref;
  to: Ref;
  /** the date of day one, "2026-11-28" */
  start: string;
  /** day number (from 0) -> the date it was marked as read */
  done: Record<string, string>;
};
export type Plans = { version: 1; plans: ReadingPlan[] };

export const EMPTY_PLANS: Plans = { version: 1, plans: [] };
export const PLANS_KEY = "noor.plans.v1";
export const MAX_DAYS = 1000;

const isDay = (x: unknown): x is string => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x);
const isRef = (x: unknown): x is Ref => {
  const r = x as Ref;
  return !!r && Number.isInteger(r.s) && r.s >= 1 && r.s <= 114 && Number.isInteger(r.a) && r.a >= 1 && r.a <= 286;
};

export function readPlans(raw: string): Plans | null {
  try {
    const d = JSON.parse(raw);
    if (d?.version !== 1 || !Array.isArray(d.plans)) return null;
    const plans: ReadingPlan[] = [];
    for (const p of d.plans) {
      if (!p || typeof p.id !== "string" || typeof p.name !== "string" || !p.name.trim() || !isDay(p.start) || !isRef(p.from) || !isRef(p.to)) continue;
      if (!Number.isInteger(p.days) || p.days < 1 || p.days > MAX_DAYS) continue;
      const done: Record<string, string> = {};
      for (const [k, v] of Object.entries(p.done ?? {})) if (/^\d+$/.test(k) && Number(k) < p.days && isDay(v)) done[k] = v;
      plans.push({ id: p.id, name: p.name.slice(0, 60), days: p.days, from: { s: p.from.s, a: p.from.a }, to: { s: p.to.s, a: p.to.a }, start: p.start, done });
    }
    return { version: 1, plans };
  } catch {
    return null;
  }
}

/** The ayah's place in the whole Quran, from 0. */
export const ordinal = (l: Layout, r: Ref) => l.counts.slice(0, r.s - 1).reduce((n, c) => n + c, 0) + r.a - 1;

export function refAt(l: Layout, n: number): Ref {
  let s = 0;
  while (n >= l.counts[s]) n -= l.counts[s++];
  return { s: s + 1, a: n + 1 };
}

/** 1-based number of the last start that is not after this ayah. */
function sectionOf(starts: Ref[], r: Ref): number {
  let lo = 0, hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    const at = starts[mid];
    if (at.s < r.s || (at.s === r.s && at.a <= r.a)) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}
export const pageOf = (l: Layout, r: Ref) => sectionOf(l.pages, r);
export const juzOf = (l: Layout, r: Ref) => sectionOf(l.juzs, r);

export const validRef = (l: Layout, r: Ref) => isRef(r) && r.a <= l.counts[r.s - 1];

/** A plan cannot have more days than it has ayahs. */
export const maxDays = (l: Layout, from: Ref, to: Ref) => Math.min(MAX_DAYS, ordinal(l, to) - ordinal(l, from) + 1);

/**
 * Shares the range over the days so that each day is about the same length of mushaf:
 * an ayah weighs its share of the page it starts on. Every day gets whole ayahs, at least one.
 */
export function splitRange(l: Layout, from: Ref, to: Ref, days: number): { from: Ref; to: Ref }[] {
  const first = ordinal(l, from);
  const last = ordinal(l, to);
  const count = last - first + 1;
  if (count < 1) return [];
  const parts = Math.max(1, Math.min(days, count));
  const startsAt = l.pages.map((p) => ordinal(l, p));
  const end = l.counts.reduce((n, c) => n + c, 0);
  const upTo: number[] = [];
  let page = 0, total = 0;
  for (let n = first; n <= last; n++) {
    while (page + 1 < startsAt.length && startsAt[page + 1] <= n) page++;
    total += 1 / ((startsAt[page + 1] ?? end) - startsAt[page]);
    upTo.push(total);
  }
  const out: { from: Ref; to: Ref }[] = [];
  let begin = 0;
  for (let i = 0; i < parts; i++) {
    const target = (total * (i + 1)) / parts;
    const latest = count - (parts - i); // leaves one ayah for every later day
    let stop = begin;
    while (stop < latest && upTo[stop] < target - 1e-9) stop++;
    // end on whichever ayah boundary is nearer the target
    if (stop > begin && upTo[stop] - target > target - upTo[stop - 1]) stop--;
    if (i === parts - 1) stop = count - 1;
    out.push({ from: refAt(l, first + begin), to: refAt(l, first + stop) });
    begin = stop + 1;
  }
  return out;
}

const dayNumber = (day: string) => Date.parse(`${day}T00:00:00Z`) / 86_400_000;
const dayString = (n: number) => new Date(n * 86_400_000).toISOString().slice(0, 10);

export const dateOfDay = (p: ReadingPlan, i: number) => dayString(dayNumber(p.start) + i);
export const doneCount = (p: ReadingPlan) => Object.keys(p.done).length;
export const isComplete = (p: ReadingPlan) => doneCount(p) >= p.days;
export const percent = (p: ReadingPlan) => Math.floor((doneCount(p) * 100) / p.days);

/** The first day not yet read, or the last day when everything is read. */
export function nextDay(p: ReadingPlan): number {
  for (let i = 0; i < p.days; i++) if (!p.done[i]) return i;
  return p.days - 1;
}

/** Unread days whose date is before today. */
export function daysBehind(p: ReadingPlan, today: string): number {
  const passed = Math.min(p.days, Math.max(0, dayNumber(today) - dayNumber(p.start)));
  let n = 0;
  for (let i = 0; i < passed; i++) if (!p.done[i]) n++;
  return n;
}

/** Moves the dates so the first unread day falls today. What was read stays read. */
export const reschedule = (p: ReadingPlan, today: string): ReadingPlan => ({ ...p, start: dayString(dayNumber(today) - nextDay(p)) });

export function toggleDay(p: ReadingPlan, i: number, today: string): ReadingPlan {
  if (i < 0 || i >= p.days) return p;
  const done = { ...p.done };
  if (done[i]) delete done[i];
  else done[i] = today;
  return { ...p, done };
}

export const updatePlan = (all: Plans, plan: ReadingPlan): Plans => ({ ...all, plans: all.plans.map((p) => (p.id === plan.id ? plan : p)) });
export const removePlan = (all: Plans, id: string): Plans => ({ ...all, plans: all.plans.filter((p) => p.id !== id) });

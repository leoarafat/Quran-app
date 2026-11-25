// The visitor's own reading log, counted in pages of the Madani mushaf. Their data; never lose it.
export const PAGES = 604;
export const GOAL_MAX = 60;
export const LOG_KEPT = 400;

export type Khatm = {
  version: 1;
  /** pages finished in the current reading, 0..604 */
  page: number;
  /** pages the visitor wants to read each day */
  goal: number;
  /** "2026-11-25" -> pages read that day */
  log: Record<string, number>;
  /** days on which a full reading was completed */
  completed: string[];
};

export const EMPTY_KHATM: Khatm = { version: 1, page: 0, goal: 4, log: {}, completed: [] };

const isDay = (x: unknown): x is string => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x);
const between = (n: unknown, low: number, high: number, other: number) => (typeof n === "number" && Number.isInteger(n) ? Math.min(high, Math.max(low, n)) : other);

export function readKhatm(raw: string): Khatm | null {
  let d: Record<string, unknown>;
  try {
    d = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!d || typeof d !== "object" || d.version !== 1) return null;
  const log: Khatm["log"] = {};
  for (const [day, pages] of Object.entries((d.log ?? {}) as Record<string, unknown>)) {
    if (isDay(day) && typeof pages === "number" && Number.isInteger(pages) && pages > 0) log[day] = pages;
  }
  return {
    version: 1,
    page: between(d.page, 0, PAGES, 0),
    goal: between(d.goal, 1, GOAL_MAX, EMPTY_KHATM.goal),
    log,
    completed: Array.isArray(d.completed) ? d.completed.filter(isDay) : [],
  };
}

const trimmed = (log: Khatm["log"]) => Object.fromEntries(Object.keys(log).sort().slice(-LOG_KEPT).map((k) => [k, log[k]]));

/** Records pages read today; a negative number takes back a mistake. */
export function addPages(k: Khatm, day: string, count: number): Khatm {
  const page = Math.min(PAGES, Math.max(0, k.page + count));
  const moved = page - k.page;
  if (!moved) return k;
  const log = { ...k.log, [day]: Math.max(0, (k.log[day] ?? 0) + moved) };
  if (!log[day]) delete log[day];
  return { ...k, page, log: trimmed(log) };
}

/** Moves the bookmark without counting it as reading, e.g. when joining part-way through. */
export const setPage = (k: Khatm, page: number): Khatm => ({ ...k, page: between(page, 0, PAGES, k.page) });
export const setGoal = (k: Khatm, goal: number): Khatm => ({ ...k, goal: between(goal, 1, GOAL_MAX, k.goal) });

/** Closes a finished reading and begins the next one. */
export const finish = (k: Khatm, day: string): Khatm => (k.page < PAGES ? k : { ...k, page: 0, completed: [...k.completed, day] });

export const daysLeft = (k: Khatm) => Math.ceil((PAGES - k.page) / k.goal);

/** Pages a day needed to finish what is left within `days`. */
export const goalFor = (k: Khatm, days: number) => Math.min(GOAL_MAX, Math.max(1, Math.ceil((PAGES - k.page) / days)));

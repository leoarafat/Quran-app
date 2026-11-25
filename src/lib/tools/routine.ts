// The visitor's own daily checklist. We suggest nothing beyond the five daily prayers:
// everything else on the list is typed by the visitor. This is their data; never lose it.
export const PRAYERS = [
  { id: "fajr", name: "ফজর" },
  { id: "dhuhr", name: "যোহর" },
  { id: "asr", name: "আসর" },
  { id: "maghrib", name: "মাগরিব" },
  { id: "isha", name: "এশা" },
] as const;

export type Item = { id: string; name: string };
export type Routine = { version: 1; items: Item[]; /** "2026-11-25" -> ids ticked that day */ days: Record<string, string[]> };

export const EMPTY_ROUTINE: Routine = { version: 1, items: [], days: {} };
export const ITEM_MAX = 80;
export const ITEMS_LIMIT = 40;
/** Older days are dropped so that the storage cannot grow for ever. */
export const DAYS_KEPT = 90;

/** The visitor's own calendar day. */
export function dayKey(date: Date): string {
  const two = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
}

/** The last `count` days ending today, oldest first. Calendar arithmetic, so clock changes cannot skip a day. */
export function lastDays(today: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) => dayKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (count - 1 - i), 12)));
}

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Keeps only what is valid; null if this is not a routine at all. */
export function readRoutine(raw: string): Routine | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObject(data) || data.version !== 1 || !Array.isArray(data.items) || !isObject(data.days)) return null;
  const items: Item[] = [];
  for (const x of data.items) {
    if (!isObject(x) || typeof x.id !== "string" || typeof x.name !== "string" || !x.id) continue;
    const name = x.name.trim().slice(0, ITEM_MAX);
    if (name && items.length < ITEMS_LIMIT && !items.some((i) => i.id === x.id)) items.push({ id: x.id, name });
  }
  const days: Routine["days"] = {};
  for (const [key, ids] of Object.entries(data.days)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(ids)) days[key] = [...new Set(ids.filter((i): i is string => typeof i === "string"))];
  }
  return { version: 1, items, days };
}

export function toggle(routine: Routine, day: string, id: string): Routine {
  const done = routine.days[day] ?? [];
  const days = { ...routine.days, [day]: done.includes(id) ? done.filter((x) => x !== id) : [...done, id] };
  const kept = Object.keys(days).sort().slice(-DAYS_KEPT);
  return { ...routine, days: Object.fromEntries(kept.map((k) => [k, days[k]])) };
}

export function addItem(routine: Routine, id: string, name: string): Routine {
  const clean = name.trim().slice(0, ITEM_MAX);
  if (!clean || routine.items.length >= ITEMS_LIMIT || routine.items.some((i) => i.id === id)) return routine;
  return { ...routine, items: [...routine.items, { id, name: clean }] };
}

/** Past ticks are left alone, so putting the item back brings its history with it. */
export const removeItem = (routine: Routine, id: string): Routine => ({ ...routine, items: routine.items.filter((i) => i.id !== id) });

export function restoreItem(routine: Routine, item: Item, index: number): Routine {
  if (routine.items.some((i) => i.id === item.id)) return routine;
  const items = [...routine.items];
  items.splice(index, 0, item);
  return { ...routine, items };
}

/** How much of today's list was ticked on a given day; removed items are not counted. */
export function progress(routine: Routine, day: string): { done: number; total: number; prayers: number } {
  const ticked = new Set(routine.days[day] ?? []);
  const prayers = PRAYERS.filter((p) => ticked.has(p.id)).length;
  return { done: prayers + routine.items.filter((i) => ticked.has(i.id)).length, total: PRAYERS.length + routine.items.length, prayers };
}

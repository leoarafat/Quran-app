export const PHRASES = ["সুবহানাল্লাহ", "আলহামদু লিল্লাহ", "আল্লাহু আকবার", "লা ইলাহা ইল্লাল্লাহ", "আস্তাগফিরুল্লাহ", "অন্য জিকির"] as const;
/** 0 means count without a target. These are counting aids, not rulings. */
export const TARGETS = [33, 34, 99, 100, 0] as const;
/** a target of the visitor's own may be anything up to this */
export const TARGET_MAX = 10_000;
/** days of history kept */
export const HISTORY_KEPT = 90;

export type Tasbih = {
  phrase: number;
  target: number;
  count: number;
  /** completed rounds of the target */
  rounds: number;
  /** everything counted today */
  today: number;
  day: string;
  vibrate: boolean;
  /** everything ever counted, and each day's count; added later, so older data starts from today's */
  total: number;
  history: Record<string, number>;
};

export const fresh = (day: string): Tasbih => ({ phrase: 0, target: 33, count: 0, rounds: 0, today: 0, day, vibrate: true, total: 0, history: {} });

const whole = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 1e9 ? v : 0);

export function parseTasbih(raw: string | null, day: string): Tasbih {
  try {
    const d = JSON.parse(raw ?? "null");
    if (!d || typeof d !== "object") return fresh(day);
    const history: Tasbih["history"] = {};
    for (const [key, n] of Object.entries((d.history ?? {}) as Record<string, unknown>)) if (/^\d{4}-\d{2}-\d{2}$/.test(key) && whole(n) > 0) history[key] = whole(n);
    // Saved before there was a history: today's count is all that is known.
    // The saved day has no leading zeros ("2026-11-5"); the history's keys do.
    const saved = typeof d.day === "string" ? /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(d.day) : null;
    if (!d.history && saved && whole(d.today) > 0) history[`${saved[1]}-${saved[2].padStart(2, "0")}-${saved[3].padStart(2, "0")}`] = whole(d.today);
    return {
      phrase: whole(d.phrase) < PHRASES.length ? whole(d.phrase) : 0,
      target: Number.isInteger(d.target) && d.target >= 0 && d.target <= TARGET_MAX ? d.target : 33,
      count: whole(d.count),
      rounds: whole(d.rounds),
      today: d.day === day ? whole(d.today) : 0,
      day,
      vibrate: d.vibrate !== false,
      total: d.total === undefined ? whole(d.today) : whole(d.total),
      history,
    };
  } catch {
    return fresh(day);
  }
}

/** One tap. Reaching the target completes a round; the next tap starts again from one. */
export function tap(s: Tasbih, day: string): { next: Tasbih; completed: boolean } {
  const base = s.target > 0 && s.count >= s.target ? 0 : s.count;
  const count = base + 1;
  const completed = s.target > 0 && count === s.target;
  const history = { ...s.history, [day]: (s.history[day] ?? 0) + 1 };
  const kept = Object.fromEntries(Object.keys(history).sort().slice(-HISTORY_KEPT).map((k) => [k, history[k]]));
  return { next: { ...s, count, rounds: s.rounds + (completed ? 1 : 0), today: (s.day === day ? s.today : 0) + 1, day, total: s.total + 1, history: kept }, completed };
}

export const resetCount = (s: Tasbih): Tasbih => ({ ...s, count: 0, rounds: 0 });

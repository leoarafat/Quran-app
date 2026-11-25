export const PHRASES = ["সুবহানাল্লাহ", "আলহামদু লিল্লাহ", "আল্লাহু আকবার", "লা ইলাহা ইল্লাল্লাহ", "আস্তাগফিরুল্লাহ", "অন্য জিকির"] as const;
/** 0 means count without a target. These are counting aids, not rulings. */
export const TARGETS = [33, 34, 100, 0] as const;

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
};

export const fresh = (day: string): Tasbih => ({ phrase: 0, target: 33, count: 0, rounds: 0, today: 0, day, vibrate: true });

const whole = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 1e9 ? v : 0);

export function parseTasbih(raw: string | null, day: string): Tasbih {
  try {
    const d = JSON.parse(raw ?? "null");
    if (!d || typeof d !== "object") return fresh(day);
    const state: Tasbih = {
      phrase: whole(d.phrase) < PHRASES.length ? whole(d.phrase) : 0,
      target: (TARGETS as readonly number[]).includes(d.target) ? d.target : 33,
      count: whole(d.count),
      rounds: whole(d.rounds),
      today: d.day === day ? whole(d.today) : 0,
      day,
      vibrate: d.vibrate !== false,
    };
    return state;
  } catch {
    return fresh(day);
  }
}

/** One tap. Reaching the target completes a round; the next tap starts again from one. */
export function tap(s: Tasbih, day: string): { next: Tasbih; completed: boolean } {
  const base = s.target > 0 && s.count >= s.target ? 0 : s.count;
  const count = base + 1;
  const completed = s.target > 0 && count === s.target;
  return { next: { ...s, count, rounds: s.rounds + (completed ? 1 : 0), today: (s.day === day ? s.today : 0) + 1, day }, completed };
}

export const resetCount = (s: Tasbih): Tasbih => ({ ...s, count: 0, rounds: 0 });

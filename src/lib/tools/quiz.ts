// Quiz questions made by the program from the verified surah list. No question or answer is typed by hand.
import { toBnDigits } from "@/lib/bn";

export type QuizSurah = { n: number; bangla: string; ayahs: number; revelation: "meccan" | "medinan" };
export type Question = { text: string; options: string[]; answer: number };

export const LEVELS = [
  { id: "easy", name: "সহজ", hint: "সূরা ১ ও ৭৮ থেকে ১১৪" },
  { id: "medium", name: "মাঝারি", hint: "সব সূরার নাম ও ক্রম" },
  { id: "hard", name: "কঠিন", hint: "আয়াত সংখ্যাসহ" },
] as const;
export type Level = (typeof LEVELS)[number]["id"];
export const QUESTIONS = 10;

/** A small repeatable random source, so a day's quiz is the same all day. */
export function seeded(seed: string): () => number {
  let a = 2166136261;
  for (const c of seed) a = Math.imul(a ^ c.charCodeAt(0), 16777619);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Kind = "name" | "number" | "revelation" | "next" | "ayahs" | "longer";
const KINDS_BY_LEVEL: Record<Level, readonly Kind[]> = {
  easy: ["name", "next", "revelation"],
  medium: ["name", "number", "revelation", "next"],
  hard: ["number", "ayahs", "longer", "next"],
};

/** Four choices: the right one and three different wrong ones, shuffled. */
function choices(right: string, wrong: string[], text: string, random: () => number): Question {
  const others = [...new Set(wrong.filter((w) => w !== right))].slice(0, 3);
  const options = shuffle([right, ...others], random);
  return { text, options, answer: options.indexOf(right) };
}

function build(kind: Kind, s: QuizSurah, all: QuizSurah[], pool: QuizSurah[], random: () => number): Question | null {
  const others = shuffle(pool.filter((x) => x.n !== s.n), random);
  const near = (value: number, max: number) => shuffle(Array.from({ length: 17 }, (_, i) => value + i - 8).filter((v) => v >= 1 && v <= max && v !== value), random).map(toBnDigits);
  switch (kind) {
    case "name":
      return choices(s.bangla, others.map((x) => x.bangla), `কুরআনের ${toBnDigits(s.n)} নম্বর সূরা কোনটি?`, random);
    case "number":
      return choices(toBnDigits(s.n), near(s.n, all.length), `সূরা ${s.bangla} কুরআনের কত নম্বর সূরা?`, random);
    case "revelation": {
      const options = ["মাক্কি", "মাদানি"];
      return { text: `প্রচলিত শ্রেণিবিভাগে সূরা ${s.bangla} মাক্কি, না মাদানি?`, options, answer: s.revelation === "meccan" ? 0 : 1 };
    }
    case "next": {
      const after = all[s.n];
      return after ? choices(after.bangla, others.map((x) => x.bangla), `সূরা ${s.bangla}-এর ঠিক পরের সূরা কোনটি?`, random) : null;
    }
    case "ayahs":
      return choices(toBnDigits(s.ayahs), near(s.ayahs, 286), `সূরা ${s.bangla}-এ কতটি আয়াত?`, random);
    case "longer": {
      const four = [s, ...others].filter((x, i, list) => list.findIndex((y) => y.ayahs === x.ayahs) === i).slice(0, 4);
      const longest = four.reduce((a, b) => (b.ayahs > a.ayahs ? b : a));
      return four.length < 4 ? null : choices(longest.bangla, four.map((x) => x.bangla), "এগুলোর মধ্যে কোন সূরায় আয়াত সবচেয়ে বেশি?", random);
    }
  }
}

export function makeQuiz(all: QuizSurah[], level: Level, random: () => number, count = QUESTIONS): Question[] {
  const pool = level === "easy" ? all.filter((s) => s.n === 1 || s.n >= 78) : all;
  const out: Question[] = [];
  const kinds = KINDS_BY_LEVEL[level];
  for (const s of shuffle(pool, random)) {
    if (out.length === count) break;
    const question = build(kinds[out.length % kinds.length], s, all, pool, random);
    if (question) out.push(question);
  }
  return out;
}

export type Scores = { version: 1; best: Partial<Record<Level, number>>; /** days on which the daily quiz was finished -> score */ daily: Record<string, number>; played: number };
export const EMPTY_SCORES: Scores = { version: 1, best: {}, daily: {}, played: 0 };

export function parseScores(raw: string | null): Scores {
  try {
    const d = JSON.parse(raw ?? "null");
    if (d?.version !== 1) return EMPTY_SCORES;
    const valid = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= QUESTIONS;
    return {
      version: 1,
      best: Object.fromEntries(LEVELS.filter((l) => valid(d.best?.[l.id])).map((l) => [l.id, d.best[l.id]])),
      daily: Object.fromEntries(Object.entries(d.daily ?? {}).filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && valid(v))) as Scores["daily"],
      played: Number.isInteger(d.played) && d.played > 0 ? d.played : 0,
    };
  } catch {
    return EMPTY_SCORES;
  }
}

export function record(scores: Scores, score: number, game: { level: Level } | { day: string }): Scores {
  const next = { ...scores, played: scores.played + 1 };
  // Only the first finished try of a day counts for the daily quiz.
  if ("day" in game) return { ...next, daily: scores.daily[game.day] === undefined ? { ...scores.daily, [game.day]: score } : scores.daily };
  return { ...next, best: { ...scores.best, [game.level]: Math.max(score, scores.best[game.level] ?? 0) } };
}

export const badges = (scores: Scores, dailyRun: number) => [
  { name: "প্রথম কুইজ", earned: scores.played > 0 },
  { name: "সহজে পূর্ণ নম্বর", earned: scores.best.easy === QUESTIONS },
  { name: "মাঝারিতে পূর্ণ নম্বর", earned: scores.best.medium === QUESTIONS },
  { name: "কঠিনে পূর্ণ নম্বর", earned: scores.best.hard === QUESTIONS },
  { name: "টানা ৭ দিন দৈনিক কুইজ", earned: dailyRun >= 7 },
];

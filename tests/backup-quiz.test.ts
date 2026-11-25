import { readdirSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { add, EMPTY } from "@/lib/bookmarks/model";
import { addRecent, parseRecent } from "@/lib/quran/recent";
import { BACKUP_KEYS, BOOKMARKS_KEY, eraseAll, makeBackup, readBackup, restoreBackup } from "@/lib/tools/backup";
import { badges, EMPTY_SCORES, LEVELS, makeQuiz, parseScores, QUESTIONS, record, seeded, type QuizSurah } from "@/lib/tools/quiz";

function memory(start: Record<string, string> = {}) {
  const data = new Map(Object.entries(start));
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
}

describe("full backup", () => {
  const mine = JSON.stringify(add(EMPTY, 1, 1, 5));
  const theirs = JSON.stringify(add(EMPTY, 2, 255, 6));

  it("covers every key the app saves", () => {
    const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(`${dir}/${f}`).isDirectory() ? files(`${dir}/${f}`) : [`${dir}/${f}`]));
    const used = new Set(files("src").flatMap((f) => [...readFileSync(f, "utf8").matchAll(/"(noor\.[\w.]+)"/g)].map((m) => m[1])));
    // downloaded-audio bookkeeping belongs to this device's cache
    used.delete("noor.audio.saved.v1");
    const store = memory(Object.fromEntries([...used].map((k) => [k, "1"])));
    eraseAll(store);
    expect([...store.data.keys()]).toEqual([]);
  });

  it("round-trips, merging bookmarks and replacing the rest", () => {
    const backup = readBackup(JSON.stringify(makeBackup(memory({ [BOOKMARKS_KEY]: theirs, "noor.khatm.v1": "new", other: "x" }), new Date(0))))!;
    expect(Object.keys(backup.data).sort()).toEqual([BOOKMARKS_KEY, "noor.khatm.v1"]);
    const here = memory({ [BOOKMARKS_KEY]: mine, "noor.khatm.v1": "old", "noor.tasbih.v1": "keep" });
    restoreBackup(here, backup);
    expect(JSON.parse(here.getItem(BOOKMARKS_KEY)!).items).toHaveLength(2);
    expect(here.getItem("noor.khatm.v1")).toBe("new");
    expect(here.getItem("noor.tasbih.v1")).toBe("keep");
  });

  it("sets unreadable bookmarks aside instead of writing over them", () => {
    const here = memory({ [BOOKMARKS_KEY]: "damaged" });
    restoreBackup(here, { app: "noor-quran", kind: "full", version: 1, made: "", data: { [BOOKMARKS_KEY]: theirs } });
    expect(here.getItem("noor.bookmarks.unreadable")).toBe("damaged");
  });

  it("rejects other files and ignores unknown keys", () => {
    for (const text of ["x", "null", "{}", '{"app":"noor-quran","version":1,"items":[]}', '{"app":"noor-quran","kind":"full","version":1,"data":{"evil":"1"}}']) expect(readBackup(text)).toBeNull();
    expect(Object.keys(BACKUP_KEYS)).toContain(BOOKMARKS_KEY);
  });
});

describe("Quran quiz", () => {
  const surahs: QuizSurah[] = JSON.parse(readFileSync("public/data/quran/index.json", "utf8")).surahs;
  const digits = (s: string) => Number(s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))));
  const named = (name: string) => surahs.find((s) => s.bangla === name)!;

  it("has ten distinct questions whose marked answers are true to the data", () => {
    for (const { id } of LEVELS) {
      for (let seed = 0; seed < 150; seed++) {
        const quiz = makeQuiz(surahs, id, seeded(`${id}${seed}`));
        expect(quiz).toHaveLength(QUESTIONS);
        for (const q of quiz) {
          expect(new Set(q.options).size).toBe(q.options.length);
          const right = q.options[q.answer];
          let m;
          if ((m = /^কুরআনের (.+) নম্বর সূরা/.exec(q.text))) expect(named(right).n).toBe(digits(m[1]));
          else if ((m = /^সূরা (.+) কুরআনের কত/.exec(q.text))) expect(named(m[1]).n).toBe(digits(right));
          else if ((m = /সূরা (.+) মাক্কি, না/.exec(q.text))) expect(named(m[1]).revelation).toBe(right === "মাক্কি" ? "meccan" : "medinan");
          else if ((m = /^সূরা (.+)-এর ঠিক পরের/.exec(q.text))) expect(named(right).n).toBe(named(m[1]).n + 1);
          else if ((m = /^সূরা (.+)-এ কতটি/.exec(q.text))) expect(named(m[1]).ayahs).toBe(digits(right));
          else expect(named(right).ayahs).toBe(Math.max(...q.options.map((o) => named(o).ayahs)));
          expect(q.options.length).toBe(q.text.includes("মাক্কি, না") ? 2 : 4);
        }
      }
    }
  });

  it("gives the same daily quiz all day", () => {
    expect(makeQuiz(surahs, "medium", seeded("2026-11-25"))).toEqual(makeQuiz(surahs, "medium", seeded("2026-11-25")));
  });

  it("keeps the best score and only the first daily try", () => {
    const scores = record(record(EMPTY_SCORES, 8, { level: "easy" }), 5, { level: "easy" });
    expect(scores.best.easy).toBe(8);
    expect(record(record(scores, 4, { day: "2026-11-25" }), 10, { day: "2026-11-25" }).daily).toEqual({ "2026-11-25": 4 });
    expect(parseScores('{"version":1,"best":{"easy":99},"daily":{"x":1}}')).toEqual(EMPTY_SCORES);
    expect(badges(scores, 7).filter((b) => b.earned).map((b) => b.name)).toEqual(["প্রথম কুইজ", "টানা ৭ দিন দৈনিক কুইজ"]);
  });
});

describe("recent surahs", () => {
  it("keeps the newest first without repeats", () => {
    expect(addRecent([2, 3, 4, 5, 6, 7], 4)).toEqual([4, 2, 3, 5, 6, 7]);
    expect(parseRecent('[1,1,200,"2",36]')).toEqual([1, 36]);
  });
});

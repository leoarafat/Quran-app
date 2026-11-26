import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseFavourites, toggleFavourite } from "@/lib/quran/favourites";
import { findPages } from "@/lib/search/features";
import { gregorianOf } from "@/lib/tools/convert";
import { EMPTY_FASTS, readFasts, summary, toggleFast } from "@/lib/tools/fastlog";
import { addDays, hijriOf } from "@/lib/tools/hijri";
import { toIcs } from "@/lib/tools/ics";

const today = new Date(2026, 10, 25, 12);

describe("date conversion", () => {
  it("is the exact reverse of the calendar, years either side", () => {
    for (let offset = -3000; offset <= 3000; offset += 37) {
      const date = addDays(today, offset);
      for (const adjust of [-1, 0, 2]) expect(gregorianOf(hijriOf(date, adjust), adjust, today)?.toDateString()).toBe(date.toDateString());
    }
  });

  it("refuses dates that do not exist", () => {
    expect(gregorianOf({ year: 1448, month: 13, day: 1 }, 0, today)).toBeNull();
    expect(gregorianOf({ year: 1448, month: 9, day: 31 }, 0, today)).toBeNull();
    expect(gregorianOf({ year: 1448, month: 9, day: NaN }, 0, today)).toBeNull();
  });
});

describe("calendar file", () => {
  it("makes one all-day event per day with a reminder", () => {
    const text = toIcs([{ date: new Date(2026, 11, 31, 12), name: "ক, খ; গ" }], new Date(Date.UTC(2026, 10, 25, 1, 2, 3)));
    expect(text).toContain("DTSTART;VALUE=DATE:20261231\r\n");
    expect(text).toContain("DTEND;VALUE=DATE:20270101\r\n");
    expect(text).toContain("DTSTAMP:20261125T010203Z\r\n");
    expect(text).toContain("SUMMARY:ক\\, খ\\; গ\r\n");
    expect(text.match(/BEGIN:VALARM/g)).toHaveLength(1);
    expect(text.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});

describe("fasting log", () => {
  it("toggles days and ignores impossible dates", () => {
    const one = toggleFast(EMPTY_FASTS, "2026-11-25");
    expect(one.days).toEqual(["2026-11-25"]);
    expect(toggleFast(one, "2026-11-25").days).toEqual([]);
    expect(toggleFast(one, "2026-02-30")).toBe(one);
    expect(readFasts('{"version":1,"days":["2026-13-01","2026-11-02","2026-11-02",5]}')?.days).toEqual(["2026-11-02"]);
    expect(readFasts("x")).toBeNull();
  });

  it("counts last Ramadan until the next one begins", () => {
    const inRamadan = gregorianOf({ year: 1447, month: 9, day: 5 }, 0, today)!;
    const key = `${inRamadan.getFullYear()}-${String(inRamadan.getMonth() + 1).padStart(2, "0")}-${String(inRamadan.getDate()).padStart(2, "0")}`;
    const counts = summary({ version: 1, days: [key, "2026-11-25"] }, today, 0);
    expect(counts).toMatchObject({ total: 2, ramadanYear: 1447, ramadan: 1, outsideRamadan: 1, thisMonth: 1 });
  });
});

describe("favourites and page search", () => {
  it("keeps favourites in surah order", () => {
    expect(toggleFavourite(toggleFavourite([36], 2), 67)).toEqual([2, 36, 67]);
    expect(parseFavourites('[67,2,2,999]')).toEqual([2, 67]);
  });

  it("finds pages by name or by what people type", () => {
    for (const word of ["অজু", "ওযু", "ওজু"]) expect(findPages(word).map((p) => p.href)).toContain("/namaz/oju/");
    expect(findPages("কিবলা").map((p) => p.href)).toContain("/qibla/");
    expect(findPages("qibla").map((p) => p.href)).toContain("/qibla/");
    expect(findPages("যাকাত").map((p) => p.href)).toContain("/zakat/");
    expect(findPages("রোজার খাতা").map((p) => p.href)).toEqual(["/amal/fasting/"]);
    expect(findPages("ক")).toEqual([]);
    expect(findPages("zzzz")).toEqual([]);
  });

  it("only points at pages that exist", () => {
    const shell = readFileSync("scripts/build-sw.mjs", "utf8");
    for (const q of ["কুরআন", "রোজা", "qibla", "dua", "backup", "hajj", "settings", "offline"]) {
      for (const page of findPages(q, 20)) expect(shell, page.href).toContain(`"${page.href}"`);
    }
  });
});

describe("publisher categories shown on the dua page", () => {
  it("all exist in the data", () => {
    const ids = new Set(JSON.parse(readFileSync("public/data/hadith/index.json", "utf8")).categories.map((c: { id: number }) => c.id));
    const list = /const MANNERS = \[([\d, ]+)\]/.exec(readFileSync("src/app/amal/page.tsx", "utf8"))![1].split(",").map(Number);
    for (const id of list) expect(ids.has(id), String(id)).toBe(true);
  });
});

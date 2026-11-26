import { describe, expect, it } from "vitest";
import { addDays, DEFAULT_ADJUST, HIJRI_MONTHS, hijriMonthDays, hijriOf, noon, parseAdjust, specialDay, upcomingSpecialDays } from "@/lib/tools/hijri";
import { headingFrom, qiblaBearing, turnNeeded } from "@/lib/tools/qibla";
import { fresh, parseTasbih, resetCount, tap, type Tasbih } from "@/lib/tools/tasbih";

describe("qibla", () => {
  // Reference values from api.aladhan.com/v1/qibla, read 2026-11-25.
  it.each([["Dhaka", 23.8103, 90.4125, 277.567], ["Sylhet", 24.8949, 91.8687, 277.012], ["London", 51.5074, -0.1278, 118.987]])("matches an independent source for %s", (_, lat, lng, expected) => {
    expect(Math.abs(qiblaBearing(lat as number, lng as number) - (expected as number))).toBeLessThan(0.3);
  });
  it("says which way to turn by the short side", () => {
    expect(turnNeeded(270, 277)).toBe(7);
    expect(turnNeeded(300, 277)).toBe(-23);
    expect(turnNeeded(350, 10)).toBe(20);
    expect(turnNeeded(10, 350)).toBe(-20);
  });
  it("reads a heading only when north is known", () => {
    expect(headingFrom({ alpha: 90, absolute: true }, 0)).toBe(270);
    expect(headingFrom({ alpha: 90, absolute: false }, 0)).toBeNull();
    expect(headingFrom({ alpha: null, absolute: true }, 0)).toBeNull();
    expect(headingFrom({ alpha: 10, webkitCompassHeading: 100 }, 0)).toBe(100);
    expect(headingFrom({ alpha: 90, absolute: true }, 90)).toBe(0);
  });
});

describe("hijri calendar", () => {
  const date = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

  it("uses the Umm al-Qura calendar", () => {
    // 1 Ramadan 1447 in Umm al-Qura was 18 February 2026.
    expect(hijriOf(date(2026, 2, 18), 0)).toEqual({ year: 1447, month: 9, day: 1 });
    expect(hijriOf(date(2026, 2, 18), -1)).toMatchObject({ month: 8 });
    expect(hijriOf(date(2026, 2, 19), -1)).toEqual({ year: 1447, month: 9, day: 1 });
  });
  it.each([-2, -1, 0, 1, 2])("builds whole months with adjustment %i", (adjust) => {
    let cursor = date(2026, 1, 15);
    for (let i = 0; i < 30; i++) {
      const days = hijriMonthDays(cursor, adjust);
      expect(days.length === 29 || days.length === 30, `${days.length}`).toBe(true);
      expect(days.map((d) => d.hijri.day)).toEqual(days.map((_, k) => k + 1));
      expect(new Set(days.map((d) => d.hijri.month)).size).toBe(1);
      cursor = addDays(days.at(-1)!.date, 1);
      expect(hijriOf(cursor, adjust).day).toBe(1);
    }
  });
  it("names only the fixed days", () => {
    expect(specialDay({ year: 1, month: 10, day: 1 })).toBe("ঈদুল ফিতর");
    expect(specialDay({ year: 1, month: 3, day: 12 })).toBeNull();
    expect(HIJRI_MONTHS).toHaveLength(12);
  });
  it("lists coming days in order without repeating a stretch", () => {
    const list = upcomingSpecialDays(noon(new Date(2026, 10, 25)), -1, 7);
    expect(list).toHaveLength(7);
    expect(list.map((x) => x.inDays)).toEqual([...list.map((x) => x.inDays)].sort((a, b) => a - b));
    expect(list.filter((x) => x.name === "আইয়ামে তাশরিক").length).toBeLessThanOrEqual(1);
  });
  it("never trusts a stored correction blindly", () => {
    for (const raw of [null, "", "9", "x", "0.5"]) expect(parseAdjust(raw)).toBe(DEFAULT_ADJUST);
    expect([parseAdjust("0"), parseAdjust("-2"), parseAdjust("2")]).toEqual([0, -2, 2]);
  });
});

describe("tasbih history", () => {
  it("keeps what an older save knew and counts on from there", () => {
    const old = parseTasbih('{"count":5,"today":12,"day":"2026-11-25","target":33}', "2026-11-25");
    expect(old).toMatchObject({ total: 12, history: { "2026-11-25": 12 } });
    expect(tap(old, "2026-11-25").next).toMatchObject({ total: 13, history: { "2026-11-25": 13 } });
    expect(tap(old, "2026-11-26").next.history).toEqual({ "2026-11-25": 12, "2026-11-26": 1 });
  });

  it("reads an older save whose day has no leading zeros", () => {
    expect(parseTasbih('{"today":3,"day":"2026-11-5"}', "2026-11-5").history).toEqual({ "2026-11-05": 3 });
  });

  it("accepts a target of the visitor's own, within limits", () => {
    expect(parseTasbih('{"target":7}', "d").target).toBe(7);
    for (const bad of ["-1", "10001", "2.5", '"9"']) expect(parseTasbih(`{"target":${bad}}`, "d").target).toBe(33);
  });
});

describe("tasbih", () => {
  const many = (s: Tasbih, n: number) => Array.from({ length: n }).reduce<Tasbih>((x) => tap(x, "d1").next, s);

  it("counts rounds and starts again after the target", () => {
    const at33 = many(fresh("d1"), 33);
    expect([at33.count, at33.rounds]).toEqual([33, 1]);
    const after = tap(at33, "d1").next;
    expect([after.count, after.rounds, after.today]).toEqual([1, 1, 34]);
    expect(tap(many(fresh("d1"), 32), "d1").completed).toBe(true);
  });
  it("counts freely without a target", () => expect(many({ ...fresh("d1"), target: 0 }, 250)).toMatchObject({ count: 250, rounds: 0 }));
  it("keeps today's total across a reset and starts anew on a new day", () => {
    const s = resetCount(many(fresh("d1"), 5));
    expect([s.count, s.today]).toEqual([0, 5]);
    expect(tap(s, "d2").next.today).toBe(1);
    expect(parseTasbih(JSON.stringify(s), "d2").today).toBe(0);
  });
  it("survives corrupt storage", () => {
    for (const raw of [null, "x", "[]", '{"count":-4,"phrase":99,"target":-7}']) {
      expect(parseTasbih(raw, "d")).toMatchObject({ count: 0, phrase: 0, target: 33 });
    }
  });
});

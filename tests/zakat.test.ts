import { describe, expect, it } from "vitest";
import { computeZakat, GRAMS_PER_VORI, readAmount, toGrams, type ZakatInput } from "@/lib/tools/zakat";

const input = (over: Partial<ZakatInput> = {}): ZakatInput => ({ unit: "vori", nisabBy: "silver", gold: 0, silver: 0, goldPrice: 0, silverPrice: 1000, cash: 0, business: 0, receivable: 0, debt: 0, ...over });

describe("zakat arithmetic", () => {
  it("asks for the price instead of guessing it", () => {
    expect(computeZakat(input({ silverPrice: 0, cash: 100000 }))).toEqual({ ready: false, needs: ["silver"] });
    expect(computeZakat(input({ gold: 2 }))).toEqual({ ready: false, needs: ["gold"] });
    expect(computeZakat(input({ nisabBy: "gold", silverPrice: 0, silver: 1 }))).toEqual({ ready: false, needs: ["gold", "silver"] });
  });
  it("takes 2.5% of everything once the net reaches the nisab", () => {
    const r = computeZakat(input({ gold: 2, goldPrice: 100000, cash: 50000, business: 30000, receivable: 20000, debt: 100000 }));
    expect(r).toMatchObject({ ready: true, assets: 300000, net: 200000, due: true, zakat: 5000 });
  });
  it("uses 52.5 vori of silver or 7.5 vori of gold as the line, exactly", () => {
    const silver = computeZakat(input({ cash: 52500 }));
    expect(silver).toMatchObject({ due: true });
    expect((silver as { nisab: number }).nisab).toBeCloseTo(52500, 6);
    expect(computeZakat(input({ cash: 52499.99 }))).toMatchObject({ due: false, zakat: 0 });
    const gold = computeZakat(input({ nisabBy: "gold", goldPrice: 100000, cash: 750000 }));
    expect(gold).toMatchObject({ due: true });
  });
  it("gives the same answer in grams", () => {
    const grams = computeZakat(input({ unit: "gram", silverPrice: 1000 / GRAMS_PER_VORI, silver: toGrams(60, "vori") }));
    expect((grams as { zakat: number }).zakat).toBeCloseTo((computeZakat(input({ silver: 60 })) as { zakat: number }).zakat, 6);
  });
  it("never goes below zero when debts are larger", () => {
    expect(computeZakat(input({ cash: 10, debt: 500 }))).toMatchObject({ net: 0, due: false, zakat: 0 });
  });
});

describe("typed amounts", () => {
  it.each([["", 0], ["  ", 0], ["১,২৫,০০০", 125000], ["1250.50", 1250.5], ["২.৫", 2.5], [".5", 0.5]])("reads %j", (text, value) => expect(readAmount(text)).toBe(value));
  it.each(["-5", "abc", "1e9", "1.2.3", "৫ভরি", "9".repeat(20)])("refuses %j", (text) => expect(readAmount(text)).toBeNull());
});

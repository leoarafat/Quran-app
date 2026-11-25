// Zakat arithmetic only. The rule figures below are the commonly used ones and still await a
// scholar's review; the page says so. No price is ever built in: the visitor enters today's.
import { toAsciiDigits } from "@/lib/bn";

export const GRAMS_PER_VORI = 11.664;
export const NISAB_GRAMS = { silver: 612.36, gold: 87.48 } as const;
export const ZAKAT_RATE = 0.025;

export type Metal = keyof typeof NISAB_GRAMS;
export type Unit = "vori" | "gram";

export const toGrams = (amount: number, unit: Unit) => (unit === "vori" ? amount * GRAMS_PER_VORI : amount);

/** Empty is zero. Bangla digits and thousands commas are fine; anything else, or a negative, is null. */
export function readAmount(text: string): number | null {
  const clean = toAsciiDigits(text).replace(/[,\s]/g, "");
  if (clean === "") return 0;
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(clean)) return null;
  const value = Number(clean);
  return value <= 1e15 ? value : null;
}

export type ZakatInput = {
  unit: Unit;
  nisabBy: Metal;
  gold: number;
  silver: number;
  /** price of one unit (vori or gram) as chosen above */
  goldPrice: number;
  silverPrice: number;
  cash: number;
  business: number;
  receivable: number;
  debt: number;
};

export type ZakatResult =
  /** without these prices the sum cannot be worked out, and a guess would be wrong */
  | { ready: false; needs: Metal[] }
  | { ready: true; assets: number; net: number; nisab: number; due: boolean; zakat: number };

export function computeZakat(input: ZakatInput): ZakatResult {
  const needs = (["gold", "silver"] as const).filter((metal) => !(input[`${metal}Price`] > 0) && (input[metal] > 0 || input.nisabBy === metal));
  if (needs.length) return { ready: false, needs };
  const assets = input.gold * input.goldPrice + input.silver * input.silverPrice + input.cash + input.business + input.receivable;
  const net = Math.max(0, assets - input.debt);
  const nisabUnits = input.unit === "vori" ? NISAB_GRAMS[input.nisabBy] / GRAMS_PER_VORI : NISAB_GRAMS[input.nisabBy];
  const nisab = nisabUnits * input[`${input.nisabBy}Price`];
  // compared in whole paisa so that rounding noise cannot decide it
  const due = net > 0 && Math.round(net * 100) >= Math.round(nisab * 100);
  return { ready: true, assets, net, nisab, due, zakat: due ? net * ZAKAT_RATE : 0 };
}

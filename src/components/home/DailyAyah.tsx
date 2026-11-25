"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { toBnDigits } from "@/lib/bn";
import { dailyIndex } from "@/lib/quran/daily";

export type DailyItem = { s: number; a: number; surah: string; ar: string; tr: string; bn: string };

const subscribe = () => () => {};

export function DailyAyah({ items }: { items: DailyItem[] }) {
  const index = useSyncExternalStore(subscribe, () => dailyIndex(new Date(), items.length), () => -1);
  const item = items[index];
  if (!item) return <div className="min-h-44 rounded-[1.375rem] border border-line bg-surface" />;
  return (
    <Link href={`/quran/${item.s}/#a${item.a}`} className="block rounded-[1.375rem] border border-line bg-surface px-[1.125rem] py-3">
      <span className="block text-[0.8125rem] text-accent">আজকের আয়াত · সূরা {item.surah} {toBnDigits(item.s)}:{toBnDigits(item.a)}</span>
      <span lang="ar" dir="rtl" className="block font-arabic text-[1.5625rem] leading-[2]">{item.ar}</span>
      <span className="block text-[0.9375rem] text-accent">{item.tr}</span>
      <span className="mt-0.5 block text-[0.9375rem] leading-relaxed">{item.bn}</span>
    </Link>
  );
}

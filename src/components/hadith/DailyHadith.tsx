"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { dailyIndex } from "@/lib/quran/daily";

const subscribe = () => () => {};

export function DailyHadith({ items }: { items: { id: number; title: string }[] }) {
  const index = useSyncExternalStore(subscribe, () => dailyIndex(new Date(), items.length), () => -1);
  const item = items[index];
  if (!item) return <div className="min-h-32 rounded-[1.375rem] bg-gold/70" />;
  return (
    <Link href={`/hadith/${item.id}/`} className="block rounded-[1.375rem] bg-gold p-5 text-on-gold">
      <span className="block text-[0.8125rem]">আজকের হাদিস</span>
      <span className="mt-1 block font-display text-lg font-semibold leading-relaxed">{item.title}</span>
      <span className="mt-2 block text-sm underline">পুরো হাদিস পড়ুন</span>
    </Link>
  );
}

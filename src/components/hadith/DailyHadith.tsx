"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { dailyIndex } from "@/lib/quran/daily";

const subscribe = () => () => {};

export function DailyHadith({ items }: { items: { id: number; title: string }[] }) {
  const index = useSyncExternalStore(subscribe, () => dailyIndex(new Date(), items.length), () => -1);
  const item = items[index];
  if (!item) return <Skeleton className="h-32 !rounded-2xl" />;
  return (
    <Link href={`/hadith/${item.id}/`} className="block rounded-md bg-gold-soft p-5 text-on-gold-soft">
      <span className="block text-[0.8125rem]">আজকের হাদিস</span>
      <span className="mt-1 block font-display text-lg font-semibold leading-relaxed">{item.title}</span>
      <span className="mt-2 block text-sm font-semibold underline">পুরো হাদিস পড়ুন</span>
    </Link>
  );
}

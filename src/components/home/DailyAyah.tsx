"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ShareSheet } from "@/components/quran/ShareSheet";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { shareAyahText, toggleAyahBookmark } from "@/lib/ayahActions";
import { toBnDigits } from "@/lib/bn";
import { useIsBookmarked } from "@/lib/bookmarks/store";
import { dailyIndex } from "@/lib/quran/daily";

export type DailyItem = { s: number; a: number; surah: string; ar: string; tr: string; bn: string };

const subscribe = () => () => {};
const card = "rounded-3xl bg-gold-soft p-5 max-md:text-ink md:border md:border-ln md:bg-sf md:p-6";

function Card({ item, credit }: { item: DailyItem; credit: string }) {
  const [sharing, setSharing] = useState(false);
  const bookmarked = useIsBookmarked(item.s, item.a);
  const button = "flex min-h-11.5 flex-1 items-center justify-center gap-2 rounded-[0.875rem] bg-sf text-[0.9375rem] font-semibold text-ac md:rounded-xl md:bg-tint md:text-on-tint";
  return (
    <section aria-label="আজকের আয়াত" className={`${card} flex flex-col gap-3`}>
      <Link href={`/quran/${item.s}/#a${item.a}`} className="flex flex-col gap-3 rounded-sm">
        <span className="flex items-center justify-between gap-3">
          <span className="text-[0.8125rem] font-semibold text-gt">আজকের আয়াত</span>
          <span className="text-right text-[0.8125rem] text-ink2">সূরা {item.surah} {toBnDigits(item.s)}:{toBnDigits(item.a)}</span>
        </span>
        <span lang="ar" dir="rtl" className="block pt-1.5 font-arabic text-[1.875rem] leading-[2.3]">{item.ar}</span>
        <span className="block text-[0.9375rem] leading-[1.7] text-gt">{item.tr}</span>
        <span className="block leading-[1.8] md:border-t md:border-ln md:pt-3.5">{item.bn}</span>
      </Link>
      <div className="flex gap-2">
        <button type="button" aria-haspopup="dialog" onClick={() => setSharing(true)} className={button}><Icon name="share" className="size-5" /> শেয়ার</button>
        <button type="button" aria-pressed={bookmarked} onClick={() => toggleAyahBookmark(item.s, item.a)} className={`${button} ${bookmarked ? "ring-2 ring-ac" : ""}`}><Icon name="bookmark" className="size-5" filled={bookmarked} /> বুকমার্ক</button>
      </div>
      {sharing && (
        <ShareSheet
          content={{ surah: item.s, ayah: item.a, surahName: item.surah, arabic: item.ar, translation: item.bn, credit }}
          pronunciation={item.tr}
          onShareText={async () => {
            setSharing(false);
            const message = await shareAyahText({ surah: item.s, surahName: item.surah }, { a: item.a, ar: item.ar, tr: item.tr, bn: item.bn }, credit);
            if (message) showToast(message);
          }}
          onClose={() => setSharing(false)}
        />
      )}
    </section>
  );
}

export function DailyAyah({ items, credit }: { items: DailyItem[]; credit: string }) {
  const index = useSyncExternalStore(subscribe, () => dailyIndex(new Date(), items.length), () => -1);
  const item = items[index];
  if (!item) return <div className={`${card} space-y-4`}><Skeleton className="h-4 w-1/3" /><Skeleton className="h-16" /><Skeleton /><Skeleton className="h-4 w-2/3" /></div>;
  return <Card item={item} credit={credit} />;
}

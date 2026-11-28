"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AyahOrnament } from "@/components/ui/AyahOrnament";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import { filterSurahs } from "@/lib/quran/find";
import type { SurahInfo } from "@/lib/quran/types";

/** Every surah, searchable, with the open one marked and scrolled into view. */
export function SurahList({ surahs, current, onPick }: { surahs: SurahInfo[]; current: number; onPick?: () => void }) {
  const [query, setQuery] = useState("");
  const box = useRef<HTMLUListElement>(null);
  const found = filterSurahs(surahs, query);

  useEffect(() => {
    // Only the list scrolls; the page stays where it is.
    const list = box.current;
    const row = list?.querySelector<HTMLElement>("[aria-current]");
    if (list && row) list.scrollTop = row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2;
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <label className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-ln2 bg-sf px-3 text-ink2 focus-within:border-ac">
        <Icon name="search" className="size-[1.125rem]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="সূরা খুঁজুন" placeholder="সূরা খুঁজুন" className="quiet-focus min-w-0 flex-1 bg-transparent text-sm text-ink" />
      </label>
      <ul ref={box} className="relative min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain">
        {found.map((s) => (
          <li key={s.n}>
            <Link href={`/quran/${s.n}/`} prefetch={false} onClick={onPick} aria-current={s.n === current ? "page" : undefined} className={`flex min-h-13 items-center gap-2.5 rounded-xl px-2.5 ${s.n === current ? "bg-ac text-on-ac shadow-card [&_*]:!text-on-ac" : "hover:bg-tint"}`}>
              <AyahOrnament label={toBnDigits(s.n)} text="text-[0.6875rem]" />
              <span className="min-w-0 flex-1 leading-snug">
                <span className={`block truncate text-[0.9375rem] ${s.n === current ? "font-semibold" : "font-medium"}`}>{s.bangla}</span>
                <span className="block text-xs text-ink2">{s.revelation === "meccan" ? "মাক্কি" : "মাদানি"} · {toBnDigits(s.ayahs)}</span>
              </span>
              <span lang="ar" dir="rtl" className="shrink-0 font-arabic text-lg leading-relaxed md:max-reading:hidden">{s.arabic}</span>
            </Link>
          </li>
        ))}
        {found.length === 0 && <li><EmptyState icon="search" title="এই নামে সূরা পাওয়া যায়নি">নম্বর বা অন্য বানানে চেষ্টা করুন।</EmptyState></li>}
      </ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { toBnDigits } from "@/lib/bn";
import type { SurahInfo } from "@/lib/quran/types";

const SHOWN = 12;
/** Fewer on a phone, so the rest of the page is not far below. */
const PHONE_SHOWN = 7;
const FILTERS = [["all", "সব"], ["meccan", "মাক্কি"], ["medinan", "মাদানি"]] as const;

export type HomeSurah = Pick<SurahInfo, "n" | "bangla" | "arabic" | "ayahs" | "revelation">;

/** The Quran starts on the home page: the first surahs, and the way to the rest. */
export function HomeSurahs({ surahs }: { surahs: HomeSurah[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const list = surahs.filter((s) => filter === "all" || s.revelation === filter).slice(0, SHOWN);
  return (
    <section aria-labelledby="home-surahs" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="home-surahs" className="font-display text-xl font-bold md:text-2xl">সূরা</h2>
        <Link href="/quran/" className="flex min-h-11 items-center text-sm font-semibold text-ac md:hidden">সব {toBnDigits(114)}টি সূরা</Link>
        <div role="group" aria-label="সূরার ধরন" className="hidden gap-1.5 rounded-xl bg-ln p-1 md:flex">
          {FILTERS.map(([key, label]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`min-h-11 rounded-[0.5625rem] px-4.5 text-sm font-semibold ${filter === key ? "bg-ac font-semibold text-on-ac shadow-card" : "text-ink2 hover:bg-sf hover:text-ink"}`}>{label}</button>)}
        </div>
      </div>
      <ul className="max-md:rounded-[1.375rem] max-md:border max-md:border-ln max-md:bg-sf max-md:px-4 max-md:py-1 md:grid md:grid-cols-[repeat(auto-fill,minmax(15.5rem,1fr))] md:gap-3">
        {list.map((s, i) => (
          <li key={s.n} className={`max-md:border-t max-md:border-ln max-md:first:border-0 ${i >= PHONE_SHOWN ? "max-md:hidden" : ""}`}>
            <Link href={`/quran/${s.n}/`} prefetch={false} className="flex h-full items-center gap-3.5 py-3 md:rounded-2xl md:border md:border-ln md:bg-sf md:p-3.5 md:hover:border-ac">
              <span className="grid size-10 shrink-0 place-items-center rounded-[0.8125rem] bg-tint font-semibold text-on-tint">{toBnDigits(s.n)}</span>
              <span className="min-w-0 flex-1 leading-snug">
                <span className="block truncate text-base font-semibold">{s.bangla}</span>
                <span className="block text-xs text-ink2">{s.revelation === "meccan" ? "মাক্কি" : "মাদানি"} · {toBnDigits(s.ayahs)} আয়াত</span>
              </span>
              <span lang="ar" dir="rtl" className="shrink-0 font-arabic text-[1.3125rem] leading-[2]">{s.arabic}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/quran/" className="hidden min-h-12.5 items-center justify-center rounded-[0.875rem] border border-ac text-[0.9375rem] font-semibold text-ac md:flex">সব {toBnDigits(114)}টি সূরা দেখুন</Link>
    </section>
  );
}

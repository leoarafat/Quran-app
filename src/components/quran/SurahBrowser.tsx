"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search, Star } from "lucide-react";
import { FAVOURITES_KEY, parseFavourites, toggleFavourite } from "@/lib/quran/favourites";
import { useStored, writeStored } from "@/lib/useStored";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { filterSurahs, parseReference } from "@/lib/quran/find";
import type { Place, SurahInfo } from "@/lib/quran/types";

const TABS = { surah: "সূরা", juz: "পারা", page: "পৃষ্ঠা", ruku: "রুকু", hizb: "হিজব", manzil: "মানযিল", sajdah: "সিজদা" } as const;
const TYPES = { all: "সব", meccan: "মাক্কি", medinan: "মাদানি" } as const;
const FILTERS = { ...TYPES, favourite: "প্রিয়" } as const;

function PlaceList({ places, surahs, label }: { places: Place[]; surahs: SurahInfo[]; label: (i: number) => string }) {
  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {places.map((p, i) => (
        <li key={`${p.s}:${p.a}`}>
          <Link href={`/quran/${p.s}/#a${p.a}`} className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 hover:border-brand">
            <span className="font-semibold">{label(i)}</span>
            <span className="text-right text-sm text-muted">{surahs[p.s - 1].bangla} : {toBnDigits(p.a)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Many numbered divisions: a compact grid, with a box to jump straight to a number. */
function NumberGrid({ places, surahs, name }: { places: Place[]; surahs: SurahInfo[]; name: string }) {
  const [text, setText] = useState("");
  const n = Number(toAsciiDigits(text.trim()));
  const found = Number.isInteger(n) && n >= 1 && n <= places.length ? places[n - 1] : null;
  return (
    <div className="space-y-3">
      <input inputMode="numeric" value={text} onChange={(e) => setText(e.target.value)} aria-label={`${name} নম্বর`} placeholder={`${name} নম্বর (১-${toBnDigits(places.length)})`} className="min-h-13 w-full rounded-full border border-line-strong bg-surface px-4" />
      {found && (
        <Link href={`/quran/${found.s}/#a${found.a}`} className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-brand px-4 font-semibold text-on-brand">
          {name} {toBnDigits(n)}: সূরা {surahs[found.s - 1].bangla}, আয়াত {toBnDigits(found.a)}
          <ArrowRight aria-hidden className="size-5 shrink-0" />
        </Link>
      )}
      {text.trim() && !found && <p role="alert" className="text-sm text-accent">১ থেকে {toBnDigits(places.length)}-এর মধ্যে লিখুন</p>}
      <ul className="grid grid-cols-3 gap-2 text-center md:grid-cols-6">
        {places.map((p, i) => (
          <li key={i} className="[content-visibility:auto] [contain-intrinsic-size:auto_4rem]">
            <Link href={`/quran/${p.s}/#a${p.a}`} prefetch={false} className="flex min-h-16 flex-col items-center justify-center rounded-2xl border border-line bg-surface px-1 hover:border-brand">
              <span className="font-semibold text-accent"><span className="sr-only">{name} </span>{toBnDigits(i + 1)}</span>
              <span className="block max-w-full truncate text-xs text-muted">{surahs[p.s - 1].bangla}:{toBnDigits(p.a)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = { surahs: SurahInfo[]; juzs: Place[]; sajdas: Place[]; pages: Place[]; rukus: Place[]; hizbs: Place[]; manzils: Place[] };

export function SurahBrowser({ surahs, juzs, sajdas, pages, rukus, hizbs, manzils }: Props) {
  const [tab, setTab] = useState<keyof typeof TABS>("surah");
  const [type, setType] = useState<keyof typeof FILTERS>("all");
  const [query, setQuery] = useState("");
  const reference = parseReference(query, surahs);
  const favourites = useStored(FAVOURITES_KEY, parseFavourites);
  const list = filterSurahs(surahs, query).filter((s) => type === "all" || (type === "favourite" ? favourites.includes(s.n) : s.revelation === type));

  const chip = (active: boolean) => `min-h-11 rounded-full border px-4 ${active ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;

  return (
    <div className="space-y-4">
      <div role="group" aria-label="তালিকার ধরন" className="flex flex-wrap gap-2">
        {(Object.keys(TABS) as (keyof typeof TABS)[]).map((k) => (
          <button key={k} type="button" aria-pressed={tab === k} className={chip(tab === k)} onClick={() => setTab(k)}>{TABS[k]}</button>
        ))}
      </div>

      {tab === "surah" && (
        <>
          <label className="relative block">
            <span className="sr-only">সূরা খুঁজুন</span>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="সূরার নাম, নম্বর বা ২:২৫৫" className="min-h-13 w-full rounded-full border border-line-strong bg-surface pl-12 pr-4" />
          </label>
          <div role="group" aria-label="সূরা বাছাই" className="flex flex-wrap gap-2">
            {(Object.keys(FILTERS) as (keyof typeof FILTERS)[]).map((k) => (
              <button key={k} type="button" aria-pressed={type === k} className={chip(type === k)} onClick={() => setType(k)}>{FILTERS[k]}</button>
            ))}
          </div>
          {reference && (
            <Link href={`/quran/${reference.surah}/#a${reference.ayah}`} className="flex min-h-14 items-center justify-between rounded-2xl bg-brand px-4 font-semibold text-on-brand">
              সূরা {surahs[reference.surah - 1].bangla}, আয়াত {toBnDigits(reference.ayah)}-এ যান
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          )}
          <p role="status" className="sr-only">{toBnDigits(list.length)}টি সূরা</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {list.map((s) => (
              <li key={s.n} className="flex min-w-0 items-center gap-1">
                <Link href={`/quran/${s.n}/`} prefetch={false} className="flex min-w-0 flex-1 min-h-18 items-center gap-3.5 rounded-[1.375rem] border border-line bg-surface px-3 py-2 hover:border-brand">
                  <span className="grid size-12 shrink-0 place-items-center rounded-t-[1.5rem] rounded-b-xl border border-line-strong font-semibold text-accent">{toBnDigits(s.n)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display font-semibold">{s.bangla}</span>
                    <span className="block truncate text-sm text-muted">{TYPES[s.revelation]} · {toBnDigits(s.ayahs)} আয়াত</span>
                  </span>
                  <span lang="ar" dir="rtl" className="font-arabic text-2xl text-accent">{s.arabic}</span>
                </Link>
                <button type="button" aria-pressed={favourites.includes(s.n)} aria-label={`সূরা ${s.bangla} প্রিয় তালিকায় রাখুন`} onClick={() => writeStored(FAVOURITES_KEY, JSON.stringify(toggleFavourite(favourites, s.n)))} className={`grid size-11 shrink-0 place-items-center rounded-full ${favourites.includes(s.n) ? "text-accent" : "text-muted"}`}>
                  <Star aria-hidden className="size-5" fill={favourites.includes(s.n) ? "currentColor" : "none"} />
                </button>
              </li>
            ))}
          </ul>
          {list.length === 0 && !reference && <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{type === "favourite" && !query ? "এখনো কোনো প্রিয় সূরা নেই। সূরার পাশের তারকা চাপুন।" : "কোনো সূরা পাওয়া যায়নি। বানান বা নম্বর বদলে দেখুন।"}</p>}
        </>
      )}

      {tab === "juz" && <PlaceList places={juzs} surahs={surahs} label={(i) => `পারা ${toBnDigits(i + 1)}`} />}
      {tab === "page" && <NumberGrid key="page" places={pages} surahs={surahs} name="পৃষ্ঠা" />}
      {tab === "ruku" && <NumberGrid key="ruku" places={rukus} surahs={surahs} name="রুকু" />}
      {tab === "hizb" && <NumberGrid key="hizb" places={hizbs} surahs={surahs} name="হিজব" />}
      {tab === "manzil" && <PlaceList places={manzils} surahs={surahs} label={(i) => `মানযিল ${toBnDigits(i + 1)}`} />}
      {tab === "sajdah" && <PlaceList places={sajdas} surahs={surahs} label={(i) => `সিজদা ${toBnDigits(i + 1)}`} />}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState, ViewTransition } from "react";
import { AyahOrnament } from "@/components/ui/AyahOrnament";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { FAVOURITES_KEY, parseFavourites, toggleFavourite } from "@/lib/quran/favourites";
import { filterSurahs, parseReference } from "@/lib/quran/find";
import { useLastRead } from "@/lib/quran/lastRead";
import { parseRecent, RECENT_KEY } from "@/lib/quran/recent";
import type { Place, SurahInfo } from "@/lib/quran/types";
import { useStored, writeStored } from "@/lib/useStored";
import { SurahPreview } from "./SurahPreview";

const VIEWS = { surah: "সূরা", juz: "পারা", page: "পৃষ্ঠা", ruku: "রুকু", hizb: "হিজব", manzil: "মানযিল", sajdah: "সিজদা" } as const;
type View = keyof typeof VIEWS;
const FILTERS = { all: "সব", meccan: "মাক্কি", medinan: "মাদানি", favourite: "প্রিয়", recent: "সম্প্রতি খোলা" } as const;
type Filter = keyof typeof FILTERS;
const REVELATION = { meccan: "মাক্কি", medinan: "মাদানি" } as const;
/** The numbers beside the long list on phones. */
const QUICK = [1, 10, 30, 50, 70, 90, 114];

const listCard = "rounded-md border border-ln bg-sf px-4 py-1 shadow-card";
const jumpCard = "flex min-h-14 items-center justify-between gap-3 rounded-md bg-ac px-4 py-2 font-semibold text-on-ac";

function LastRead({ surahs }: { surahs: SurahInfo[] }) {
  const place = useLastRead();
  const surah = surahs[(place?.s ?? 1) - 1];
  return (
    <Link href={place ? `/quran/${place.s}/#a${place.a}` : "/quran/1/"} className="on-deep flex min-h-[4.25rem] items-center gap-3 rounded-md bg-hero px-4 py-2.5 text-on-hero shadow-card">
      <Icon name="mushaf" className="size-6 text-hero-accent" />
      <span className="min-w-0 flex-1 leading-snug">
        <span className="block text-[0.8125rem] text-hero-muted">{place ? "শেষ পড়া" : "কুরআন পড়া শুরু করুন"}</span>
        <span className="block truncate font-semibold">{surah.bangla}{place && ` · আয়াত ${toBnDigits(place.a)}`}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-hero-accent">{place ? "চালিয়ে যান" : "শুরু করুন"}</span>
    </Link>
  );
}

function PlaceList({ places, surahs, label }: { places: Place[]; surahs: SurahInfo[]; label: (i: number) => string }) {
  return (
    <ul className={listCard}>
      {places.map((p, i) => (
        <li key={`${p.s}:${p.a}`} className="border-b border-ln last:border-0">
          <Link href={`/quran/${p.s}/#a${p.a}`} prefetch={false} className="flex min-h-15 items-center justify-between gap-3 py-1.5">
            <span className="flex items-center gap-3 font-semibold"><AyahOrnament label={toBnDigits(i + 1)} className="size-10" />{label(i)}</span>
            <span className="text-right text-[0.8125rem] text-ink2">{surahs[p.s - 1].bangla} : {toBnDigits(p.a)}</span>
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
      <input inputMode="numeric" value={text} onChange={(e) => setText(e.target.value)} aria-label={`${name} নম্বর`} placeholder={`${name} নম্বর (১-${toBnDigits(places.length)})`} className="min-h-13 w-full rounded-md border border-ln2 bg-sf px-4" />
      {found && (
        <Link href={`/quran/${found.s}/#a${found.a}`} className={jumpCard}>
          {name} {toBnDigits(n)}: সূরা {surahs[found.s - 1].bangla}, আয়াত {toBnDigits(found.a)}
          <Icon name="chev" />
        </Link>
      )}
      {text.trim() && !found && <p role="alert" className="text-sm text-gt">১ থেকে {toBnDigits(places.length)}-এর মধ্যে লিখুন</p>}
      <ul className="grid grid-cols-3 gap-2 text-center md:grid-cols-6 xl:grid-cols-5">
        {places.map((p, i) => (
          <li key={i} className="[content-visibility:auto] [contain-intrinsic-size:auto_4rem]">
            <Link href={`/quran/${p.s}/#a${p.a}`} prefetch={false} className="flex min-h-16 flex-col items-center justify-center rounded-md border border-ln bg-sf px-1 hover:border-ac">
              <span className="font-semibold text-gt"><span className="sr-only">{name} </span>{toBnDigits(i + 1)}</span>
              <span className="block max-w-full truncate text-xs text-ink2">{surahs[p.s - 1].bangla}:{toBnDigits(p.a)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = { surahs: SurahInfo[]; juzs: Place[]; sajdas: Place[]; pages: Place[]; rukus: Place[]; hizbs: Place[]; manzils: Place[] };

export function QuranIndex({ surahs, juzs, sajdas, pages, rukus, hizbs, manzils }: Props) {
  const [view, setView] = useState<View>("surah");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  /** the surah shown beside the list on wide screens */
  const [preview, setPreview] = useState(1);
  const reference = parseReference(query, surahs);
  const favourites = useStored(FAVOURITES_KEY, parseFavourites);
  const recent = useStored(RECENT_KEY, parseRecent);
  const list = useMemo(() => {
    const found = filterSurahs(surahs, query);
    if (filter === "all") return found;
    if (filter === "favourite") return found.filter((s) => favourites.includes(s.n));
    // Newest first, as they were opened.
    if (filter === "recent") return recent.flatMap((n) => found.filter((s) => s.n === n));
    return found.filter((s) => s.revelation === filter);
  }, [surahs, query, filter, favourites, recent]);
  const quick = view === "surah" && filter === "all" && !query;

  const tab = (on: boolean) => `flex min-h-11 shrink-0 grow items-center justify-center rounded-[0.625rem] px-4 text-sm ${on ? "bg-sf font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.18),inset_0_0_0_1px_var(--ln2)]" : "text-ink2"}`;
  const empty = filter === "favourite" && !query ? "সূরার পাশের তারকা চাপলে এখানে আসবে।" : filter === "recent" && !query ? "কোনো সূরা খুললে এখানে আসবে।" : "বানান বা নম্বর বদলে দেখুন।";

  const buttons = (
    <div role="group" aria-label="তালিকার ধরন" className="rail flex gap-0.5 overflow-x-auto rounded-xl bg-ln p-[3px]">
      {(Object.keys(VIEWS) as View[]).flatMap((k) => [
        <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)} className={tab(view === k)}>{VIEWS[k]}</button>,
        // The design puts bookmarks fourth; it is a page of its own.
        k === "page" ? <Link key="bookmarks" href="/bookmarks/" className={tab(false)}>বুকমার্ক</Link> : null,
      ])}
    </div>
  );

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,31rem)_minmax(0,1fr)] xl:items-start xl:gap-10">
      <div className="min-w-0 space-y-4">
        {buttons}
        <LastRead surahs={surahs} />

        {view === "surah" && (
          <>
            <label className="flex min-h-13 items-center gap-3 rounded-md border border-ln2 bg-sf px-4 text-ink2 focus-within:border-ac">
              <Icon name="search" className="size-5" />
              <input type="search" aria-label="সূরা খুঁজুন" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="সূরার নাম, নম্বর বা ২:২৫৫" className="quiet-focus min-w-0 flex-1 bg-transparent text-ink" />
            </label>
            <div role="group" aria-label="সূরা বাছাই" className="rail -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
              {(Object.keys(FILTERS) as Filter[]).map((k) => <Chip key={k} aria-pressed={filter === k} selected={filter === k} onClick={() => setFilter(k)}>{FILTERS[k]}</Chip>)}
            </div>
            {reference && (
              <Link href={`/quran/${reference.surah}/#a${reference.ayah}`} className={jumpCard}>
                সূরা {surahs[reference.surah - 1].bangla}, আয়াত {toBnDigits(reference.ayah)}-এ যান
                <Icon name="chev" />
              </Link>
            )}
            <p role="status" className="sr-only">{toBnDigits(list.length)}টি সূরা</p>
            <div className="flex items-start gap-1">
              {list.length > 0 && (
                <ol className={`min-w-0 flex-1 ${listCard} !px-2`}>
                  {list.map((s) => {
                    const favourite = favourites.includes(s.n);
                    return (
                      <li key={s.n} id={`surah-${s.n}`} className={`flex scroll-mt-24 items-center border-b border-ln last:border-0 ${preview === s.n ? "xl:rounded-xl xl:bg-gs" : ""}`}>
                        <Link href={`/quran/${s.n}/`} prefetch={false} onMouseEnter={() => setPreview(s.n)} onFocus={() => setPreview(s.n)} className="flex min-h-[4.25rem] min-w-0 flex-1 items-center gap-3 py-1.5 pl-1">
                          <AyahOrnament label={toBnDigits(s.n)} className="size-10" />
                          <span className="min-w-0 flex-1 leading-snug">
                            <ViewTransition name={`surah-${s.n}`} share="surah-morph" default="none">
                              <span className="block w-fit max-w-full truncate font-semibold">{s.bangla}</span>
                            </ViewTransition>
                            <span className="block truncate text-[0.8125rem] text-ink2">{REVELATION[s.revelation]} · {toBnDigits(s.ayahs)} আয়াত</span>
                          </span>
                          <span lang="ar" dir="rtl" className="shrink-0 font-arabic text-[1.375rem] leading-[1.9] max-xs:text-base">{s.arabic}</span>
                        </Link>
                        <button type="button" aria-pressed={favourite} aria-label={`সূরা ${s.bangla} প্রিয় তালিকায় রাখুন`} onClick={() => writeStored(FAVOURITES_KEY, JSON.stringify(toggleFavourite(favourites, s.n)))} className={`grid size-11 shrink-0 place-items-center rounded-xl ${favourite ? "text-gd" : "text-ink2/70"}`}>
                          <Icon name="star" className="size-5" filled={favourite} />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
              {quick && (
                <nav aria-label="দ্রুত স্ক্রল" className="sticky top-4 -mr-4 hidden flex-col xs:flex md:hidden">
                  {QUICK.map((n) => (
                    <button key={n} type="button" aria-label={`সূরা ${toBnDigits(n)}-এ যান`} onClick={() => document.getElementById(`surah-${n}`)?.scrollIntoView({ block: "start" })} className="grid size-11 place-items-center text-xs tabular-nums text-ink2">
                      {toBnDigits(n)}
                    </button>
                  ))}
                </nav>
              )}
            </div>
            {list.length === 0 && !reference && <EmptyState icon={filter === "favourite" ? "star" : "search"} title={filter === "favourite" && !query ? "এখনো কোনো প্রিয় সূরা নেই" : "কোনো সূরা পাওয়া যায়নি"}>{empty}</EmptyState>}
          </>
        )}

        {view === "juz" && <PlaceList places={juzs} surahs={surahs} label={(i) => `পারা ${toBnDigits(i + 1)}`} />}
        {view === "page" && <NumberGrid key="page" places={pages} surahs={surahs} name="পৃষ্ঠা" />}
        {view === "ruku" && <NumberGrid key="ruku" places={rukus} surahs={surahs} name="রুকু" />}
        {view === "hizb" && <NumberGrid key="hizb" places={hizbs} surahs={surahs} name="হিজব" />}
        {view === "manzil" && <PlaceList places={manzils} surahs={surahs} label={(i) => `মানযিল ${toBnDigits(i + 1)}`} />}
        {view === "sajdah" && <PlaceList places={sajdas} surahs={surahs} label={(i) => `সিজদা ${toBnDigits(i + 1)}`} />}
      </div>

      <div className="sticky top-[calc(var(--header-h)+var(--safe-top)+1.5rem)] hidden xl:block">
        <SurahPreview surah={surahs[preview - 1]} />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { GradeBadge } from "@/components/hadith/GradeBadge";
import { toBnDigits } from "@/lib/bn";
import { BOOKS, DEFAULT_HADITH_FILTERS, type HadithFilters } from "@/lib/hadith/search";
import { clearHistory, remember, useHistory } from "@/lib/search/history";
import { hadithFromParams, hadithToParams } from "@/lib/search/query";
import { useHadithSearch } from "@/lib/search/useSearch";
import { Highlight } from "./Highlight";

const PAGE = 20;
const EXAMPLES = ["নিয়ত", "সালাত", "পিতা-মাতা", "ক্ষমা", "ঘুমানোর", "প্রতিবেশী"];
const GRADES = [["all", "সব"], ["sahih", "সহিহ"], ["hasan", "হাসান"]] as const;
const MODES = [["start", "শব্দের শুরু"], ["word", "পুরো শব্দ"], ["any", "যেকোনো অংশ"]] as const;
const chip = (on: boolean) => `min-h-11 rounded-full border px-4 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;

export function HadithSearch() {
  const [initial] = useState(() => hadithFromParams(window.location.search));
  const [text, setText] = useState(initial.query);
  const [query, setQuery] = useState(initial.query.trim());
  const [filters, setFilters] = useState<HadithFilters>(initial.filters);
  const [panel, setPanel] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const history = useHistory();
  const { status, found, retry } = useHadithSearch(query, filters, limit);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 250);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${hadithToParams(query, filters)}`);
  }, [query, filters]);

  const change = (patch: Partial<HadithFilters>) => { setFilters((f) => ({ ...f, ...patch })); setLimit(PAGE); };
  const choose = (value: string) => { setText(value); setQuery(value); setLimit(PAGE); };
  const active = (Object.keys(DEFAULT_HADITH_FILTERS) as (keyof HadithFilters)[]).filter((k) => filters[k] !== DEFAULT_HADITH_FILTERS[k]).length;
  const total = found?.total ?? 0;

  return (
    <div className="space-y-4">
      <form role="search" onSubmit={(e) => { e.preventDefault(); const value = text.trim(); setQuery(value); remember(value); (document.activeElement as HTMLElement | null)?.blur(); }} className="flex gap-2">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">হাদিসে খুঁজুন</span>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input type="text" enterKeyHint="search" autoComplete="off" maxLength={200} value={text} onChange={(e) => { setText(e.target.value); setLimit(PAGE); }} placeholder="বাংলা বা আরবি শব্দ" className="min-h-13 w-full rounded-full border border-line-strong bg-surface pl-12 pr-12" />
          {text && <button type="button" aria-label="লেখা মুছুন" onClick={() => choose("")} className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted"><X aria-hidden className="size-5" /></button>}
        </label>
        <button type="button" aria-expanded={panel} aria-label={`ফিল্টার${active ? `, ${toBnDigits(active)}টি চালু` : ""}`} onClick={() => setPanel((v) => !v)} className={`relative grid size-13 shrink-0 place-items-center rounded-full border text-accent ${panel ? "border-gold bg-active" : "border-line-strong bg-surface"}`}>
          <SlidersHorizontal aria-hidden className="size-5" />
          {active > 0 && <span aria-hidden className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-gold text-xs font-bold text-on-gold">{toBnDigits(active)}</span>}
        </button>
      </form>

      {panel && (
        <div className="space-y-3 rounded-[1.375rem] border border-line bg-surface p-4">
          <div role="group" aria-label="হাদিসের মান" className="flex flex-wrap gap-2">{GRADES.map(([k, label]) => <button key={k} type="button" aria-pressed={filters.grade === k} className={chip(filters.grade === k)} onClick={() => change({ grade: k })}>{label}</button>)}</div>
          <div role="group" aria-label="কীভাবে মিলবে" className="flex flex-wrap gap-2">{MODES.map(([k, label]) => <button key={k} type="button" aria-pressed={filters.mode === k} className={chip(filters.mode === k)} onClick={() => change({ mode: k })}>{label}</button>)}</div>
          <label className="block text-sm text-muted">গ্রন্থ
            <select value={filters.book} onChange={(e) => change({ book: e.target.value as HadithFilters["book"] })} className="min-h-11 w-full rounded-2xl border border-line-strong bg-surface px-2 text-base text-text">
              <option value="all">সব গ্রন্থ</option>
              {BOOKS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          {active > 0 && <button type="button" className={chip(false)} onClick={() => { setFilters(DEFAULT_HADITH_FILTERS); setLimit(PAGE); }}>সব ফিল্টার মুছুন</button>}
        </div>
      )}

      {!query && (
        <div className="space-y-5">
          {history.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between"><h2 className="font-display font-semibold">সাম্প্রতিক সার্চ</h2><button type="button" className="min-h-11 px-2 text-sm text-accent underline" onClick={clearHistory}>মুছে ফেলুন</button></div>
              <div className="flex flex-wrap gap-2">{history.map((h) => <button key={h} type="button" className={chip(false)} onClick={() => choose(h)}>{h}</button>)}</div>
            </section>
          )}
          <section>
            <h2 className="mb-2 font-display font-semibold">এভাবে খুঁজে দেখুন</h2>
            <div className="flex flex-wrap gap-2">{EXAMPLES.map((x) => <button key={x} type="button" className={chip(false)} onClick={() => choose(x)}>{x}</button>)}</div>
          </section>
          <p className="text-sm text-muted">প্রথমবার হাদিস খোঁজার সময় প্রায় ১ MB ডেটা নামবে।</p>
        </div>
      )}

      {query && (
        <section aria-label="হাদিসের ফলাফল" aria-busy={status === "searching"}>
          <p role="status" className="mb-2 flex min-h-7 items-center gap-2 text-sm text-muted">
            {status === "searching" && <><LoaderCircle aria-hidden className="size-4 animate-spin" /> খোঁজা হচ্ছে…</>}
            {status === "done" && total > 0 && `${toBnDigits(total)}টি হাদিস পাওয়া গেছে`}
          </p>
          {status === "done" && found!.synonyms.length > 0 && <p className="mb-2 text-sm text-accent">সমার্থক শব্দসহ খোঁজা হয়েছে: {found!.synonyms.join(", ")}</p>}
          {status === "error" && (
            <div role="alert" className="rounded-[1.375rem] border border-line bg-surface p-5 text-center"><p className="mb-3">সার্চের ডেটা আনা যায়নি। ইন্টারনেট সংযোগ দেখুন।</p><button type="button" className={chip(true)} onClick={retry}>আবার চেষ্টা করুন</button></div>
          )}
          {status === "done" && total === 0 && <p className="rounded-[1.375rem] border border-dashed border-line-strong p-5 text-center text-muted">কিছু পাওয়া যায়নি। অন্তত দুটি অক্ষর লিখুন, বানান বা ফিল্টার বদলান।</p>}
          {found && found.results.length > 0 && (
            <ul className="space-y-3">
              {found.results.map((r) => (
                <li key={r.id}>
                  <Link href={`/hadith/${r.id}/`} prefetch={false} onClick={() => remember(query)} className="block rounded-[1.375rem] border border-line bg-surface p-4 hover:border-brand">
                    <span className="mb-2 flex items-start gap-3"><span className="line-clamp-2 min-w-0 flex-1 font-display font-semibold leading-relaxed">{r.title}</span><GradeBadge cls={r.gradeClass} /></span>
                    <span dir="auto" className="block leading-relaxed text-soft"><Highlight text={r.snippet} words={r.marks} /></span>
                    <span className="mt-2 block text-[0.8125rem] text-muted">{r.attribution}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {found && found.results.length < total && <button type="button" disabled={status === "searching"} className={`${chip(false)} mx-auto mt-4 block`} onClick={() => setLimit((n) => n + PAGE)}>আরও দেখুন (বাকি {toBnDigits(total - found.results.length)}টি)</button>}
        </section>
      )}
    </div>
  );
}

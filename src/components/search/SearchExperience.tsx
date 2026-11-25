"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import type { Place, SurahInfo } from "@/lib/quran/types";
import { DEFAULT_FILTERS, type Filters, type Result } from "@/lib/search/engine";
import { clearHistory, remember, useHistory } from "@/lib/search/history";
import { directMatches, fromParams, toParams } from "@/lib/search/query";
import { useSearch } from "@/lib/search/useSearch";
import { findPages } from "@/lib/search/features";
import { HadithSearch } from "./HadithSearch";
import { Highlight } from "./Highlight";
import { VoiceButton } from "./VoiceButton";

const PAGE = 30;
const EXAMPLES = ["ধৈর্য", "নামাজ", "ইয়াসিন", "২:২৫৫", "আয়াতুল কুরসি", "রাব্বিল আলামিন"];
const FIELDS = [["all", "সব"], ["bn", "অর্থ"], ["tr", "উচ্চারণ"], ["ar", "আরবি"]] as const;
const MODES = [["start", "শব্দের শুরু"], ["word", "পুরো শব্দ"], ["any", "যেকোনো অংশ"]] as const;
const TYPES = [["all", "সব"], ["meccan", "মাক্কি"], ["medinan", "মাদানি"]] as const;

const chip = (active: boolean) => `min-h-11 rounded-full border px-4 ${active ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;
const select = "min-h-11 w-full rounded-2xl border border-line-strong bg-surface px-2 text-text";
const rowLink = "flex min-h-14 items-center justify-between gap-3 rounded-[1.375rem] border border-line bg-surface px-4 py-2 hover:border-brand";

function Chips<T extends string>({ label, value, choices, onChange }: { label: string; value: T; choices: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label}>
      <p aria-hidden className="mb-1.5 text-sm text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map(([key, text]) => <button key={key} type="button" aria-pressed={value === key} className={chip(value === key)} onClick={() => onChange(key)}>{text}</button>)}
      </div>
    </div>
  );
}

function AyahResult({ result, surahName, onOpen }: { result: Result; surahName: string; onOpen: () => void }) {
  return (
    <li>
      <Link href={`/quran/${result.s}/#a${result.a}`} prefetch={false} onClick={onOpen} className="block rounded-[1.375rem] border border-line bg-surface p-4 hover:border-brand">
        <span className="block text-sm font-semibold text-accent">সূরা {surahName} · {toBnDigits(result.s)}:{toBnDigits(result.a)}</span>
        <span lang="ar" dir="rtl" className="block font-arabic text-2xl leading-[2.2]"><Highlight text={result.ar} words={result.marks.ar} /></span>
        <span className="block font-display text-[0.9375rem] leading-[1.8] text-accent"><Highlight text={result.tr} words={result.marks.tr} /></span>
        <span className="mt-1 block leading-relaxed text-soft"><Highlight text={result.bn} words={result.marks.bn} /></span>
      </Link>
    </li>
  );
}

type Props = { surahs: SurahInfo[]; juzs: Place[] };

function SearchBox({ surahs, juzs }: Props) {
  const [initial] = useState(() => fromParams(window.location.search));
  const [text, setText] = useState(initial.query);
  const [query, setQuery] = useState(initial.query.trim());
  const [filters, setFilters] = useState<Filters>(initial.filters);
  const [panel, setPanel] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const history = useHistory();
  const { status, found, retry } = useSearch(query, filters, limit);

  // Wait for a pause in typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 250);
    return () => clearTimeout(timer);
  }, [text]);

  // Keep the search in the address, so "back" from an ayah returns to the same results.
  useEffect(() => {
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${toParams(query, filters)}`);
  }, [query, filters]);

  const change = (patch: Partial<Filters>) => { setFilters((f) => ({ ...f, ...patch })); setLimit(PAGE); };
  const type = (value: string) => { setText(value); setLimit(PAGE); };
  const choose = (value: string) => { setText(value); setQuery(value); setLimit(PAGE); };
  const open = () => remember(query);
  const activeFilters = (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).filter((k) => filters[k] !== DEFAULT_FILTERS[k]).length;
  const direct = directMatches(query, surahs);
  const hasDirect = Boolean(direct.named || direct.reference || direct.surahs.length);
  const total = found?.total ?? 0;
  const pages = findPages(query);

  return (
    <div className="space-y-4">
      <form role="search" onSubmit={(e) => { e.preventDefault(); const value = text.trim(); setQuery(value); remember(value); (document.activeElement as HTMLElement | null)?.blur(); }} className="flex flex-wrap gap-2">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">কুরআনে খুঁজুন</span>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input type="text" enterKeyHint="search" autoComplete="off" maxLength={200} value={text} onChange={(e) => type(e.target.value)} placeholder="খুঁজুন" className="min-h-13 w-full rounded-full border border-line-strong bg-surface pl-12 pr-12" />
          {text && (
            <button type="button" aria-label="লেখা মুছুন" onClick={() => choose("")} className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted">
              <X aria-hidden className="size-5" />
            </button>
          )}
        </label>
        <VoiceButton onText={(heard) => { choose(heard); remember(heard); }} />
        <button type="button" aria-expanded={panel} aria-label={`ফিল্টার${activeFilters ? `, ${toBnDigits(activeFilters)}টি চালু` : ""}`} onClick={() => setPanel((v) => !v)} className={`relative grid size-13 shrink-0 place-items-center rounded-full border text-accent ${panel ? "border-gold bg-active" : "border-line-strong bg-surface"}`}>
          <SlidersHorizontal aria-hidden className="size-5" />
          {activeFilters > 0 && <span aria-hidden className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-gold text-xs font-bold text-on-gold">{toBnDigits(activeFilters)}</span>}
        </button>
      </form>

      {panel && (
        <div className="space-y-3 rounded-[1.375rem] border border-line bg-surface p-4">
          <Chips label="কোথায় খুঁজবে" value={filters.field} choices={FIELDS} onChange={(field) => change({ field })} />
          <Chips label="কীভাবে মিলবে" value={filters.mode} choices={MODES} onChange={(mode) => change({ mode })} />
          <Chips label="নাজিলের স্থান" value={filters.revelation} choices={TYPES} onChange={(revelation) => change({ revelation })} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm text-muted">সূরা
              <select className={select} value={filters.surah} onChange={(e) => change({ surah: Number(e.target.value) })}>
                <option value={0}>সব সূরা</option>
                {surahs.map((s) => <option key={s.n} value={s.n}>{toBnDigits(s.n)}. {s.bangla}</option>)}
              </select>
            </label>
            <label className="text-sm text-muted">পারা
              <select className={select} value={filters.juz} onChange={(e) => change({ juz: Number(e.target.value) })}>
                <option value={0}>সব পারা</option>
                {juzs.map((_, i) => <option key={i} value={i + 1}>পারা {toBnDigits(i + 1)}</option>)}
              </select>
            </label>
          </div>
          {activeFilters > 0 && <button type="button" className={chip(false)} onClick={() => { setFilters(DEFAULT_FILTERS); setLimit(PAGE); }}>সব ফিল্টার মুছুন</button>}
        </div>
      )}

      {!query && (
        <div className="space-y-5">
          {history.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display font-semibold">সাম্প্রতিক সার্চ</h2>
                <button type="button" className="min-h-11 px-2 text-sm text-accent underline" onClick={clearHistory}>মুছে ফেলুন</button>
              </div>
              <div className="flex flex-wrap gap-2">{history.map((h) => <button key={h} type="button" className={chip(false)} onClick={() => choose(h)}>{h}</button>)}</div>
            </section>
          )}
          <section>
            <h2 className="mb-2 font-display font-semibold">এভাবে খুঁজে দেখুন</h2>
            <div className="flex flex-wrap gap-2">{EXAMPLES.map((x) => <button key={x} type="button" className={chip(false)} onClick={() => choose(x)}>{x}</button>)}</div>
          </section>
          <p className="text-sm text-muted">প্রথমবার আয়াত খোঁজার সময় প্রায় ১.৫ MB ডেটা নামবে।</p>
        </div>
      )}

      {query && hasDirect && (
        <ul className="space-y-2">
          {direct.named && (
            <li><Link href={`/quran/${direct.named.surah}/#a${direct.named.ayah}`} onClick={open} className={`${rowLink} !border-gold`}><span className="font-display font-semibold">{direct.named.title}</span><span className="text-sm text-muted">{toBnDigits(direct.named.surah)}:{toBnDigits(direct.named.ayah)}</span></Link></li>
          )}
          {direct.reference && (
            <li><Link href={`/quran/${direct.reference.surah}/#a${direct.reference.ayah}`} onClick={open} className="flex min-h-14 items-center justify-between gap-3 rounded-[1.375rem] bg-gold px-4 py-2 font-semibold text-on-gold">সূরা {surahs[direct.reference.surah - 1].bangla}, আয়াত {toBnDigits(direct.reference.ayah)}-এ যান<ArrowRight aria-hidden className="size-5 shrink-0" /></Link></li>
          )}
          {direct.surahs.map((s) => (
            <li key={s.n}><Link href={`/quran/${s.n}/`} onClick={open} className={rowLink}><span className="font-display font-semibold">সূরা {s.bangla}<span className="block font-sans text-sm font-normal text-muted">{toBnDigits(s.n)} · {toBnDigits(s.ayahs)} আয়াত</span></span><span lang="ar" dir="rtl" className="font-arabic text-2xl text-accent">{s.arabic}</span></Link></li>
          ))}
        </ul>
      )}

      {pages.length > 0 && (
        <section aria-label="অ্যাপের পাতা">
          <h2 className="mb-2 text-sm text-muted">অ্যাপের পাতা</h2>
          <ul className="flex flex-wrap gap-2">
            {pages.map((p) => <li key={p.href}><Link href={p.href} onClick={open} className="flex min-h-11 items-center rounded-full border border-gold bg-surface px-4 font-semibold text-accent">{p.title}</Link></li>)}
          </ul>
        </section>
      )}

      {query && (
        <section aria-label="আয়াতের ফলাফল" aria-busy={status === "searching"}>
          <p role="status" className="mb-2 flex min-h-7 items-center gap-2 text-sm text-muted">
            {status === "searching" && <><LoaderCircle aria-hidden className="size-4 animate-spin" /> খোঁজা হচ্ছে…</>}
            {status === "done" && total > 0 && `${toBnDigits(total)}টি আয়াত পাওয়া গেছে`}
          </p>
          {status === "done" && found!.synonyms.length > 0 && <p className="mb-2 text-sm text-accent">সমার্থক শব্দসহ খোঁজা হয়েছে: {found!.synonyms.join(", ")}</p>}
          {status === "error" && (
            <div role="alert" className="rounded-[1.375rem] border border-line bg-surface p-5 text-center">
              <p className="mb-3">সার্চের ডেটা আনা যায়নি। ইন্টারনেট সংযোগ দেখুন।</p>
              <button type="button" className={chip(true)} onClick={retry}>আবার চেষ্টা করুন</button>
            </div>
          )}
          {status === "done" && total === 0 && !hasDirect && (
            <div className="rounded-[1.375rem] border border-dashed border-line-strong p-5 text-center text-muted">
              <p>কিছু পাওয়া যায়নি। অন্তত দুটি অক্ষর লিখুন, বানান বদলান বা অন্য শব্দ দিন।</p>
              {activeFilters > 0 && <button type="button" className={`${chip(false)} mt-3`} onClick={() => { setFilters(DEFAULT_FILTERS); setLimit(PAGE); }}>ফিল্টার ছাড়া খুঁজুন</button>}
            </div>
          )}
          {found && found.results.length > 0 && (
            <ul className="space-y-3">
              {found.results.map((r) => <AyahResult key={`${r.s}:${r.a}`} result={r} surahName={surahs[r.s - 1].bangla} onOpen={open} />)}
            </ul>
          )}
          {found && found.results.length < total && (
            <button type="button" disabled={status === "searching"} className={`${chip(false)} mx-auto mt-4 block`} onClick={() => setLimit((n) => n + PAGE)}>
              আরও দেখুন (বাকি {toBnDigits(total - found.results.length)}টি)
            </button>
          )}
        </section>
      )}
    </div>
  );
}

const never = () => () => {};

const SCOPES = [["quran", "কুরআন"], ["hadith", "হাদিস"]] as const;

function Scoped(props: Props) {
  const [scope, setScope] = useState<(typeof SCOPES)[number][0]>(() => (new URLSearchParams(window.location.search).get("scope") === "hadith" ? "hadith" : "quran"));
  const switchTo = (next: typeof scope) => {
    if (next === scope) return;
    // Carry the typed words across, but not the other side's filters.
    const q = new URLSearchParams(window.location.search).get("q");
    const params = new URLSearchParams();
    if (next === "hadith") params.set("scope", "hadith");
    if (q) params.set("q", q);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    setScope(next);
  };
  return (
    <div className="space-y-4">
      <div role="group" aria-label="কোথায় খুঁজবেন" className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1">
        {SCOPES.map(([key, label]) => (
          <button key={key} type="button" aria-pressed={scope === key} onClick={() => switchTo(key)} className={`min-h-11 rounded-full ${scope === key ? "bg-brand font-semibold text-on-brand" : "text-muted"}`}>{label}</button>
        ))}
      </div>
      {scope === "quran" ? <SearchBox {...props} /> : <HadithSearch />}
    </div>
  );
}

/** The address is only known in the browser, so the box mounts there. */
export function SearchExperience(props: Props) {
  const ready = useSyncExternalStore(never, () => true, () => false);
  return ready ? <Scoped {...props} /> : <div className="min-h-13 rounded-full border border-line bg-surface" />;
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Seg } from "@/components/ui/Seg";
import { Skeleton } from "@/components/ui/Skeleton";
import { toBnDigits } from "@/lib/bn";
import type { Place, SurahInfo } from "@/lib/quran/types";
import { DEFAULT_FILTERS, type Filters } from "@/lib/search/engine";
import { findPages } from "@/lib/search/features";
import { remember } from "@/lib/search/history";
import { directMatches, fromParams, scopeOf, toParams, type Scope } from "@/lib/search/query";
import { useSearch } from "@/lib/search/useSearch";
import { AllSearch } from "./AllSearch";
import { HadithSearch } from "./HadithSearch";
import { AyahResult, DirectResults, More, SearchError, SearchField, SearchStatus, Suggestions } from "./parts";
import { useQueryText } from "./useQueryText";

const PAGE = 30;
const EXAMPLES = ["ধৈর্য", "নামাজ", "ইয়াসিন", "২:২৫৫", "আয়াতুল কুরসি", "রাব্বিল আলামিন"];
const FIELDS = [["all", "সব"], ["bn", "অর্থ"], ["tr", "উচ্চারণ"], ["ar", "আরবি"]] as const;
const MODES = [["start", "শব্দের শুরু"], ["word", "পুরো শব্দ"], ["any", "যেকোনো অংশ"]] as const;
const TYPES = [["all", "সব"], ["meccan", "মাক্কি"], ["medinan", "মাদানি"]] as const;
const SCOPES = [{ value: "all", text: "সব" }, { value: "quran", text: "কুরআন" }, { value: "hadith", text: "হাদিস" }] as const;

const select = "min-h-12 w-full rounded-md border border-ln2 bg-bg px-2 text-base text-ink";

function Chips<T extends string>({ label, value, choices, onChange }: { label: string; value: T; choices: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label}>
      <p aria-hidden className="mb-1.5 text-sm text-ink2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map(([key, text]) => <Chip key={key} aria-pressed={value === key} selected={value === key} onClick={() => onChange(key)}>{text}</Chip>)}
      </div>
    </div>
  );
}

type Props = { surahs: SurahInfo[]; juzs: Place[] };

function QuranSearch({ surahs, juzs, tabs }: Props & { tabs: React.ReactNode }) {
  const [initial] = useState(() => fromParams(window.location.search));
  const { text, query, type, choose, submit } = useQueryText(initial.query);
  const [filters, setFilters] = useState<Filters>(initial.filters);
  const [panel, setPanel] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const { status, found, retry } = useSearch(query, filters, limit);

  // Keep the search in the address, so "back" from an ayah returns to the same results.
  useEffect(() => {
    const params = new URLSearchParams(toParams(query, filters));
    params.set("scope", "quran");
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?${params}`);
  }, [query, filters]);

  const change = (patch: Partial<Filters>) => { setFilters((f) => ({ ...f, ...patch })); setLimit(PAGE); };
  const reset = () => { setFilters(DEFAULT_FILTERS); setLimit(PAGE); };
  const pick = (value: string) => { choose(value); setLimit(PAGE); };
  const open = () => remember(query);
  const activeFilters = (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).filter((k) => filters[k] !== DEFAULT_FILTERS[k]).length;
  const direct = directMatches(query, surahs);
  const hasDirect = Boolean(direct.named || direct.reference || direct.surahs.length);
  const total = found?.total ?? 0;

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <SearchField
          label="কুরআনে খুঁজুন"
          value={text}
          onChange={(value) => { type(value); setLimit(PAGE); }}
          onChoose={(value, heard) => { pick(value); if (heard) remember(value); }}
          onSubmit={() => { submit(); remember(text.trim()); }}
          filters={{ count: activeFilters, open: panel, toggle: () => setPanel(true) }}
        />
        {tabs}
      </div>

      {panel && (
        <BottomSheet title="কুরআন খোঁজার ফিল্টার" onClose={() => setPanel(false)}>
          <Chips label="কোথায় খুঁজবে" value={filters.field} choices={FIELDS} onChange={(field) => change({ field })} />
          <Chips label="কীভাবে মিলবে" value={filters.mode} choices={MODES} onChange={(mode) => change({ mode })} />
          <Chips label="নাজিলের স্থান" value={filters.revelation} choices={TYPES} onChange={(revelation) => change({ revelation })} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm text-ink2">সূরা
              <select className={select} value={filters.surah} onChange={(e) => change({ surah: Number(e.target.value) })}>
                <option value={0}>সব সূরা</option>
                {surahs.map((s) => <option key={s.n} value={s.n}>{toBnDigits(s.n)}. {s.bangla}</option>)}
              </select>
            </label>
            <label className="text-sm text-ink2">পারা
              <select className={select} value={filters.juz} onChange={(e) => change({ juz: Number(e.target.value) })}>
                <option value={0}>সব পারা</option>
                {juzs.map((_, i) => <option key={i} value={i + 1}>পারা {toBnDigits(i + 1)}</option>)}
              </select>
            </label>
          </div>
          {activeFilters > 0 && <Chip onClick={reset}>সব ফিল্টার মুছুন</Chip>}
        </BottomSheet>
      )}

      {!query && <Suggestions examples={EXAMPLES} onPick={pick} note="প্রথমবার আয়াত খোঁজার সময় প্রায় ১.৫ MB ডেটা নামবে।" />}

      {query && <DirectResults direct={direct} pages={findPages(query)} surahs={surahs} onOpen={open} />}

      {query && (
        <section aria-label="আয়াতের ফলাফল" aria-busy={status === "searching"}>
          <SearchStatus searching={status === "searching"} text={status === "done" && total > 0 ? `${toBnDigits(total)}টি আয়াত পাওয়া গেছে` : ""} synonyms={status === "done" ? found!.synonyms : []} />
          {status === "error" && <SearchError retry={retry} />}
          {status === "done" && total === 0 && !hasDirect && (
            <EmptyState icon="search" title="কিছু পাওয়া যায়নি" action={activeFilters > 0 ? <Chip onClick={reset}>ফিল্টার ছাড়া খুঁজুন</Chip> : undefined}>অন্তত দুটি অক্ষর লিখুন, বানান বদলান বা অন্য শব্দ দিন।</EmptyState>
          )}
          {found && found.results.length > 0 && (
            <ul className="space-y-3">
              {found.results.map((r) => <AyahResult key={`${r.s}:${r.a}`} result={r} surahName={surahs[r.s - 1].bangla} onOpen={open} />)}
            </ul>
          )}
          {found && <More shown={found.results.length} total={total} disabled={status === "searching"} onMore={() => setLimit((n) => n + PAGE)} />}
        </section>
      )}
    </div>
  );
}

const never = () => () => {};

function Scoped(props: Props) {
  const [scope, setScope] = useState<Scope>(() => scopeOf(window.location.search));
  const switchTo = (next: Scope) => {
    if (next === scope) return;
    // Carry the typed words across, but not the other side's filters.
    const q = new URLSearchParams(window.location.search).get("q");
    const params = new URLSearchParams();
    if (next !== "all") params.set("scope", next);
    if (q) params.set("q", q);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
    setScope(next);
  };
  const tabs = <Seg label="কোথায় খুঁজবেন" options={SCOPES} value={scope} onChange={switchTo} />;
  if (scope === "quran") return <QuranSearch {...props} tabs={tabs} />;
  if (scope === "hadith") return <HadithSearch tabs={tabs} />;
  return <AllSearch surahs={props.surahs} tabs={tabs} onScope={switchTo} />;
}

/** The address is only known in the browser, so the box mounts there. */
export function SearchExperience(props: Props) {
  const ready = useSyncExternalStore(never, () => true, () => false);
  return ready ? <Scoped {...props} /> : <div className="space-y-4"><Skeleton className="h-14" /><Skeleton className="h-12" /></div>;
}

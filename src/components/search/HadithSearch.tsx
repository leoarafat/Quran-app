"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { toBnDigits } from "@/lib/bn";
import { BOOKS, DEFAULT_HADITH_FILTERS, type HadithFilters } from "@/lib/hadith/search";
import { remember } from "@/lib/search/history";
import { hadithFromParams, hadithToParams } from "@/lib/search/query";
import { useHadithSearch } from "@/lib/search/useSearch";
import { HadithResultCard, More, SearchError, SearchField, SearchStatus, Suggestions } from "./parts";
import { useQueryText } from "./useQueryText";

const PAGE = 20;
const EXAMPLES = ["নিয়ত", "সালাত", "পিতা-মাতা", "ক্ষমা", "ঘুমানোর", "প্রতিবেশী"];
const GRADES = [["all", "সব"], ["sahih", "সহিহ"], ["hasan", "হাসান"]] as const;
const MODES = [["start", "শব্দের শুরু"], ["word", "পুরো শব্দ"], ["any", "যেকোনো অংশ"]] as const;

export function HadithSearch({ tabs }: { tabs: React.ReactNode }) {
  const [initial] = useState(() => hadithFromParams(window.location.search));
  const { text, query, type, choose, submit } = useQueryText(initial.query);
  const [filters, setFilters] = useState<HadithFilters>(initial.filters);
  const [panel, setPanel] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const { status, found, retry } = useHadithSearch(query, filters, limit);

  useEffect(() => {
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${hadithToParams(query, filters)}`);
  }, [query, filters]);

  const change = (patch: Partial<HadithFilters>) => { setFilters((f) => ({ ...f, ...patch })); setLimit(PAGE); };
  const pick = (value: string) => { choose(value); setLimit(PAGE); };
  const active = (Object.keys(DEFAULT_HADITH_FILTERS) as (keyof HadithFilters)[]).filter((k) => filters[k] !== DEFAULT_HADITH_FILTERS[k]).length;
  const total = found?.total ?? 0;

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <SearchField
          label="হাদিসে খুঁজুন"
          value={text}
          onChange={(value) => { type(value); setLimit(PAGE); }}
          onChoose={(value, heard) => { pick(value); if (heard) remember(value); }}
          onSubmit={() => { submit(); remember(text.trim()); }}
          filters={{ count: active, open: panel, toggle: () => setPanel(true) }}
        />
        {tabs}
      </div>

      {panel && (
        <BottomSheet title="হাদিস খোঁজার ফিল্টার" onClose={() => setPanel(false)}>
          <div role="group" aria-label="হাদিসের মান" className="flex flex-wrap gap-2">{GRADES.map(([k, label]) => <Chip key={k} aria-pressed={filters.grade === k} selected={filters.grade === k} onClick={() => change({ grade: k })}>{label}</Chip>)}</div>
          <div role="group" aria-label="কীভাবে মিলবে" className="flex flex-wrap gap-2">{MODES.map(([k, label]) => <Chip key={k} aria-pressed={filters.mode === k} selected={filters.mode === k} onClick={() => change({ mode: k })}>{label}</Chip>)}</div>
          <label className="block text-sm text-ink2">গ্রন্থ
            <select value={filters.book} onChange={(e) => change({ book: e.target.value as HadithFilters["book"] })} className="min-h-12 w-full rounded-md border border-ln2 bg-bg px-2 text-base text-ink">
              <option value="all">সব গ্রন্থ</option>
              {BOOKS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          {active > 0 && <Chip onClick={() => { setFilters(DEFAULT_HADITH_FILTERS); setLimit(PAGE); }}>সব ফিল্টার মুছুন</Chip>}
        </BottomSheet>
      )}

      {!query && <Suggestions examples={EXAMPLES} onPick={pick} note="প্রথমবার হাদিস খোঁজার সময় প্রায় ১ MB ডেটা নামবে।" />}

      {query && (
        <section aria-label="হাদিসের ফলাফল" aria-busy={status === "searching"}>
          <SearchStatus searching={status === "searching"} text={status === "done" && total > 0 ? `${toBnDigits(total)}টি হাদিস পাওয়া গেছে` : ""} synonyms={status === "done" ? found!.synonyms : []} />
          {status === "error" && <SearchError retry={retry} />}
          {status === "done" && total === 0 && <EmptyState icon="search" title="কিছু পাওয়া যায়নি">অন্তত দুটি অক্ষর লিখুন, বানান বা ফিল্টার বদলান।</EmptyState>}
          {found && found.results.length > 0 && <ul className="space-y-3">{found.results.map((r) => <HadithResultCard key={r.id} result={r} onOpen={() => remember(query)} />)}</ul>}
          {found && <More shown={found.results.length} total={total} disabled={status === "searching"} onMore={() => setLimit((n) => n + PAGE)} />}
        </section>
      )}
    </div>
  );
}

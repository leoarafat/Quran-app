"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { toBnDigits } from "@/lib/bn";
import { DEFAULT_HADITH_FILTERS } from "@/lib/hadith/search";
import type { SurahInfo } from "@/lib/quran/types";
import { DEFAULT_FILTERS } from "@/lib/search/engine";
import { findPages } from "@/lib/search/features";
import { remember } from "@/lib/search/history";
import { directMatches, fromParams, type Scope } from "@/lib/search/query";
import { useHadithSearch, useSearch } from "@/lib/search/useSearch";
import { AyahResult, DirectResults, HadithResultCard, SearchError, SearchField, SearchStatus, Suggestions } from "./parts";
import { useQueryText } from "./useQueryText";

const TOP = 3;
const EXAMPLES = ["ধৈর্য", "নামাজ", "ইয়াসিন", "২:২৫৫", "আয়াতুল কুরসি"];

function Group({ title, total, unit, searching, onAll, children }: { title: string; total: number; unit: string; searching: boolean; onAll: () => void; children: React.ReactNode }) {
  return (
    <section aria-label={`${title}-এর ফলাফল`} aria-busy={searching} className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        <span role="status" className="text-[0.8125rem] text-ink2">{searching ? "খোঁজা হচ্ছে…" : `${toBnDigits(total)}টি ফলাফল`}</span>
      </div>
      <ul className="space-y-2">{children}</ul>
      {total > TOP && <button type="button" onClick={onAll} className="flex min-h-11 w-full items-center justify-center rounded-full border border-ln2 text-sm font-semibold text-ac">{title}-এর সব {toBnDigits(total)}টি {unit} দেখুন</button>}
    </section>
  );
}

/** Both books at once: the best few of each, with the way to the full list. */
export function AllSearch({ surahs, tabs, onScope }: { surahs: SurahInfo[]; tabs: React.ReactNode; onScope: (scope: Scope) => void }) {
  const [initial] = useState(() => fromParams(window.location.search).query);
  const { text, query, type, choose, submit } = useQueryText(initial);
  const quran = useSearch(query, DEFAULT_FILTERS, TOP);
  const hadith = useHadithSearch(query, DEFAULT_HADITH_FILTERS, TOP);

  useEffect(() => {
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${new URLSearchParams({ q: query })}` : ""}`);
  }, [query]);

  const direct = directMatches(query, surahs);
  const pages = findPages(query);
  const open = () => remember(query);
  const nothing = query && quran.status === "done" && hadith.status === "done" && !quran.found!.total && !hadith.found!.total && !direct.named && !direct.reference && !direct.surahs.length;

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <SearchField label="কুরআন ও হাদিসে খুঁজুন" value={text} onChange={type} onChoose={(value, heard) => { choose(value); if (heard) remember(value); }} onSubmit={() => { submit(); remember(text.trim()); }} />
        {tabs}
      </div>
      {!query && <Suggestions examples={EXAMPLES} onPick={choose} note="প্রথমবার খোঁজার সময় প্রায় ২.৫ MB ডেটা নামবে।" />}
      {query && (
        <>
          <DirectResults direct={direct} pages={pages} surahs={surahs} onOpen={open} />
          {nothing && <EmptyState icon="search" title="কিছু পাওয়া যায়নি">অন্তত দুটি অক্ষর লিখুন, বানান বদলান বা অন্য শব্দ দিন।</EmptyState>}
          {(quran.status === "error" || hadith.status === "error") && <SearchError retry={() => { quran.retry(); hadith.retry(); }} />}
          {!nothing && quran.found && quran.found.total > 0 && (
            <Group title="কুরআন" unit="আয়াত" total={quran.found.total} searching={quran.status === "searching"} onAll={() => onScope("quran")}>
              {quran.found.results.map((r) => <AyahResult key={`${r.s}:${r.a}`} result={r} surahName={surahs[r.s - 1].bangla} onOpen={open} />)}
            </Group>
          )}
          {!nothing && hadith.found && hadith.found.total > 0 && (
            <Group title="হাদিস" unit="হাদিস" total={hadith.found.total} searching={hadith.status === "searching"} onAll={() => onScope("hadith")}>
              {hadith.found.results.map((r) => <HadithResultCard key={r.id} result={r} onOpen={open} />)}
            </Group>
          )}
          {(quran.status === "searching" || hadith.status === "searching") && !quran.found && !hadith.found && <SearchStatus searching text="" synonyms={[]} />}
        </>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { GradeBadge } from "@/components/hadith/GradeBadge";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import type { HadithResult } from "@/lib/hadith/search";
import type { SurahInfo } from "@/lib/quran/types";
import type { Result } from "@/lib/search/engine";
import { clearHistory, useHistory } from "@/lib/search/history";
import type { directMatches } from "@/lib/search/query";
import { Highlight } from "./Highlight";
import { VoiceButton } from "./VoiceButton";

export const resultCard = "block rounded-md border border-ln bg-sf px-4 py-3.5 shadow-card hover:border-ac";
const rowLink = "flex min-h-14 items-center justify-between gap-3 rounded-md border border-ln bg-sf px-4 py-2 hover:border-ac";

/** The large search field with its voice button and, where there are filters, the filter button. */
export function SearchField({ label, value, onChange, onChoose, onSubmit, filters }: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  /** a value that is searched at once: cleared, or heard */
  onChoose: (text: string, heard?: boolean) => void;
  onSubmit: () => void;
  filters?: { count: number; open: boolean; toggle: () => void };
}) {
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); onSubmit(); (document.activeElement as HTMLElement | null)?.blur(); }} className="flex flex-wrap gap-2">
      <div className="flex min-h-14 min-w-0 flex-1 items-center gap-2.5 rounded-[1.125rem] border-[1.5px] border-ln2 bg-sf pl-4 pr-1.5 focus-within:border-ac">
        <Icon name="search" className="size-6 text-ac" />
        <input type="text" aria-label={label} enterKeyHint="search" autoComplete="off" maxLength={200} value={value} onChange={(e) => onChange(e.target.value)} placeholder="খুঁজুন" className="quiet-focus min-w-0 flex-1 self-stretch bg-transparent font-display text-lg" />
        {value && <button type="button" aria-label="লেখা মুছুন" onClick={() => onChoose("")} className="grid size-11 shrink-0 place-items-center rounded-xl text-ink2"><Icon name="close" className="size-[1.375rem]" /></button>}
      </div>
      <VoiceButton onText={(heard) => onChoose(heard, true)} />
      {filters && (
        <button type="button" aria-haspopup="dialog" aria-expanded={filters.open} aria-label={`ফিল্টার${filters.count ? `, ${toBnDigits(filters.count)}টি চালু` : ""}`} onClick={filters.toggle} className="relative grid size-14 shrink-0 place-items-center rounded-[1.125rem] border border-ln2 bg-sf text-ac">
          <Icon name="filter" />
          {filters.count > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-gold text-xs font-bold text-on-gold">{toBnDigits(filters.count)}</span>}
        </button>
      )}
    </form>
  );
}

/** Shown while the box is empty: what was searched before, and words to try. */
export function Suggestions({ examples, onPick, note }: { examples: readonly string[]; onPick: (text: string) => void; note: string }) {
  const history = useHistory();
  return (
    <div className="space-y-5">
      {history.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold">সাম্প্রতিক খোঁজ</h2>
            <button type="button" className="-mr-2 min-h-11 px-2 text-sm text-ac underline" onClick={clearHistory}>মুছে ফেলুন</button>
          </div>
          <div className="flex flex-wrap gap-2">{history.map((h) => <Chip key={h} onClick={() => onPick(h)}>{h}</Chip>)}</div>
        </section>
      )}
      <section>
        <h2 className="mb-2 font-display text-base font-semibold">এভাবে খুঁজে দেখুন</h2>
        <ul className="rounded-md border border-ln bg-sf px-4 py-1 shadow-card">
          {examples.map((x) => (
            <li key={x} className="border-b border-ln last:border-0">
              <button type="button" onClick={() => onPick(x)} className="flex min-h-12 w-full items-center gap-3 text-left"><Icon name="search" className="size-5 text-ink2" />{x}</button>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-[0.8125rem] text-ink2">{note}</p>
    </div>
  );
}

/** Surahs, ayah references and app pages that the words name directly. */
export function DirectResults({ direct, pages, surahs, onOpen }: { direct: ReturnType<typeof directMatches>; pages: { href: string; title: string }[]; surahs: SurahInfo[]; onOpen: () => void }) {
  const any = Boolean(direct.named || direct.reference || direct.surahs.length);
  return (
    <>
      {any && (
        <ul className="space-y-2">
          {direct.named && (
            <li><Link href={`/quran/${direct.named.surah}/#a${direct.named.ayah}`} onClick={onOpen} className={`${rowLink} !border-gd`}><span className="font-display font-semibold">{direct.named.title}</span><span className="text-sm text-ink2">{toBnDigits(direct.named.surah)}:{toBnDigits(direct.named.ayah)}</span></Link></li>
          )}
          {direct.reference && (
            <li><Link href={`/quran/${direct.reference.surah}/#a${direct.reference.ayah}`} onClick={onOpen} className="flex min-h-14 items-center justify-between gap-3 rounded-md bg-ac px-4 py-2 font-semibold text-on-ac">সূরা {surahs[direct.reference.surah - 1].bangla}, আয়াত {toBnDigits(direct.reference.ayah)}-এ যান<Icon name="chev" /></Link></li>
          )}
          {direct.surahs.map((s) => (
            <li key={s.n}><Link href={`/quran/${s.n}/`} onClick={onOpen} className={rowLink}><span className="font-display font-semibold">সূরা {s.bangla}<span className="block font-sans text-sm font-normal text-ink2">{toBnDigits(s.n)} · {toBnDigits(s.ayahs)} আয়াত</span></span><span lang="ar" dir="rtl" className="font-arabic text-2xl">{s.arabic}</span></Link></li>
          ))}
        </ul>
      )}
      {pages.length > 0 && (
        <section aria-label="অ্যাপের পাতা">
          <h2 className="mb-2 text-[0.8125rem] text-ink2">অ্যাপের পাতা</h2>
          <ul className="flex flex-wrap gap-2">{pages.map((p) => <li key={p.href}><Chip href={p.href}>{p.title}</Chip></li>)}</ul>
        </section>
      )}
    </>
  );
}

export function AyahResult({ result, surahName, onOpen }: { result: Result; surahName: string; onOpen: () => void }) {
  return (
    <li>
      <Link href={`/quran/${result.s}/#a${result.a}`} prefetch={false} onClick={onOpen} className={resultCard}>
        <span className="block text-[0.8125rem] text-ink2">সূরা {surahName} {toBnDigits(result.s)}:{toBnDigits(result.a)}</span>
        <span lang="ar" dir="rtl" className="block pt-1 font-arabic text-2xl leading-[2.25]"><Highlight text={result.ar} words={result.marks.ar} /></span>
        <span className="block text-[0.9375rem] leading-[1.75] text-gt"><Highlight text={result.tr} words={result.marks.tr} /></span>
        <span className="mt-1 block leading-[1.75]"><Highlight text={result.bn} words={result.marks.bn} /></span>
      </Link>
    </li>
  );
}

export function HadithResultCard({ result, onOpen }: { result: HadithResult; onOpen: () => void }) {
  return (
    <li>
      <Link href={`/hadith/${result.id}/`} prefetch={false} onClick={onOpen} className={resultCard}>
        <span className="block text-[0.8125rem] text-ink2">{result.attribution}</span>
        <span className="my-1 flex items-start gap-3"><span className="line-clamp-2 min-w-0 flex-1 font-display font-semibold leading-relaxed">{result.title}</span><GradeBadge cls={result.gradeClass} /></span>
        <span dir="auto" className="block leading-[1.75]"><Highlight text={result.snippet} words={result.marks} /></span>
      </Link>
    </li>
  );
}

export function SearchStatus({ searching, text, synonyms }: { searching: boolean; text: string; synonyms: string[] }) {
  return (
    <>
      <p role="status" className="mb-2 flex min-h-7 items-center gap-2 text-[0.8125rem] text-ink2">
        {searching ? <><Icon name="timer" className="size-4 animate-spin" /> খোঁজা হচ্ছে…</> : text}
      </p>
      {!searching && synonyms.length > 0 && <p className="mb-2 text-sm text-gt">সমার্থক শব্দসহ খোঁজা হয়েছে: {synonyms.join(", ")}</p>}
    </>
  );
}

export function SearchError({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="rounded-md border border-ln bg-sf p-5 text-center">
      <p className="mb-3">সার্চের ডেটা আনা যায়নি। ইন্টারনেট সংযোগ দেখুন।</p>
      <Chip selected onClick={retry}>আবার চেষ্টা করুন</Chip>
    </div>
  );
}

export function More({ shown, total, disabled, onMore }: { shown: number; total: number; disabled: boolean; onMore: () => void }) {
  return shown < total ? <Chip className="mx-auto mt-4 !flex w-fit" disabled={disabled} onClick={onMore}>আরও দেখুন (বাকি {toBnDigits(total - shown)}টি)</Chip> : null;
}

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { useLibrary } from "@/lib/bookmarks/store";
import { parseRecent, RECENT_KEY } from "@/lib/quran/recent";
import { EMPTY_KHATM, PAGES, readKhatm } from "@/lib/tools/khatm";
import { parseScores, QUESTIONS } from "@/lib/tools/quiz";
import { dayKey, EMPTY_ROUTINE, lastDays, progress, readRoutine } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { parseTasbih } from "@/lib/tools/tasbih";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored } from "@/lib/useStored";

const raw = (value: string | null) => value;

function Row({ href, title, detail, percent }: { href: string; title: string; detail: string; percent?: number }) {
  return (
    <li>
      <Link href={href} className="flex min-h-16 items-center gap-3 rounded-[1.375rem] border border-line bg-surface px-4 py-3 hover:border-brand">
        <span className="min-w-0 flex-1">
          <span className="block font-display font-semibold">{title}</span>
          <span className="block text-sm text-muted">{detail}</span>
          {percent !== undefined && <span aria-hidden className="mt-1.5 block h-1.5 rounded bg-line-strong"><span className="block h-1.5 rounded bg-accent" style={{ width: `${Math.min(100, percent)}%` }} /></span>}
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-accent" />
      </Link>
    </li>
  );
}

function Inner({ now, names }: { now: number; names: string[] }) {
  const today = new Date(now);
  const day = dayKey(today);
  const khatmRaw = useStored("noor.khatm.v1", raw);
  const routineRaw = useStored("noor.routine.v1", raw);
  const tasbihRaw = useStored("noor.tasbih.v1", raw);
  const scores = useStored("noor.quiz.v1", parseScores);
  const recent = useStored(RECENT_KEY, parseRecent);
  const library = useLibrary();
  const khatm = (khatmRaw && readKhatm(khatmRaw)) || EMPTY_KHATM;
  const routine = (routineRaw && readRoutine(routineRaw)) || EMPTY_ROUTINE;
  const amal = progress(routine, day);
  const tasbih = parseTasbih(tasbihRaw, day);
  const week = lastDays(today, 7);
  const weekPages = week.reduce((n, d) => n + (khatm.log[d] ?? 0), 0);
  const weekTicks = week.reduce((n, d) => n + progress(routine, d).done, 0);
  const notes = [...library.items, ...library.hadiths].filter((b) => b.note).length;
  const marked = [...library.items].sort((a, b) => b.updated - a.updated).slice(0, 3);
  const pill = "flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-4 hover:border-brand";

  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">আজ</h2>
        <ul className="space-y-2">
          <Row href="/amal/daily/" title="নামাজ ও আমল" detail={`${toBnDigits(amal.done)}/${toBnDigits(amal.total)} টিক · ওয়াক্ত ${toBnDigits(amal.prayers)}/৫`} percent={(amal.done / amal.total) * 100} />
          <Row href="/amal/khatm/" title="তিলাওয়াতের লক্ষ্য" detail={`${toBnDigits(khatm.log[day] ?? 0)}/${toBnDigits(khatm.goal)} পৃষ্ঠা`} percent={((khatm.log[day] ?? 0) / khatm.goal) * 100} />
          <Row href="/tasbih/" title="তাসবিহ" detail={`আজ ${toBnDigits(tasbih.today)} বার`} />
          <Row href="/quiz/" title="দৈনিক কুইজ" detail={scores.daily[day] === undefined ? "আজ এখনো খেলা হয়নি" : `আজ ${toBnDigits(scores.daily[day])}/${toBnDigits(QUESTIONS)}`} />
        </ul>
      </section>
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">গত ৭ দিন ও অগ্রগতি</h2>
        <ul className="space-y-2">
          <Row href="/amal/khatm/" title="চলতি খতম" detail={`${toBnDigits(khatm.page)}/${toBnDigits(PAGES)} পৃষ্ঠা · সম্পন্ন ${toBnDigits(khatm.completed.length)}`} percent={(khatm.page / PAGES) * 100} />
          <Row href="/amal/khatm/" title="সাপ্তাহিক তিলাওয়াত" detail={`${toBnDigits(weekPages)} পৃষ্ঠা · টানা ${toBnDigits(streak(today, (d) => (khatm.log[d] ?? 0) > 0))} দিন`} />
          <Row href="/amal/daily/" title="সাপ্তাহিক আমল" detail={`${toBnDigits(weekTicks)}টি টিক · পাঁচ ওয়াক্ত পূর্ণ টানা ${toBnDigits(streak(today, (d) => progress(routine, d).prayers === 5))} দিন`} />
          <Row href="/bookmarks/" title="বুকমার্ক ও নোট" detail={`আয়াত ${toBnDigits(library.items.length)} · হাদিস ${toBnDigits(library.hadiths.length)} · নোট ${toBnDigits(notes)}`} />
        </ul>
      </section>
      {recent.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">সম্প্রতি পড়া সূরা</h2>
          <ul className="flex flex-wrap gap-2">{recent.map((n) => <li key={n}><Link href={`/quran/${n}/`} className={pill}>{names[n - 1]}</Link></li>)}</ul>
        </section>
      )}
      {marked.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">সাম্প্রতিক বুকমার্ক</h2>
          <ul className="flex flex-wrap gap-2">{marked.map((b) => <li key={`${b.s}:${b.a}`}><Link href={`/quran/${b.s}/#a${b.a}`} className={pill}>{names[b.s - 1]} {toBnDigits(b.s)}:{toBnDigits(b.a)}</Link></li>)}</ul>
        </section>
      )}
    </div>
  );
}

export function MyPage({ names }: { names: string[] }) {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} names={names} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

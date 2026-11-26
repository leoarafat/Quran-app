"use client";

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { LinkList } from "@/components/ui/LinkList";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { weekFromSaturday } from "@/lib/tools/week";
import { toBnDigits } from "@/lib/bn";
import { useLibrary } from "@/lib/bookmarks/store";
import { parseRecent, RECENT_KEY } from "@/lib/quran/recent";
import { EMPTY_KHATM, PAGES, readKhatm } from "@/lib/tools/khatm";
import { badges, parseScores, QUESTIONS } from "@/lib/tools/quiz";
import { dayKey, EMPTY_ROUTINE, lastDays, progress, readRoutine } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { parseTasbih } from "@/lib/tools/tasbih";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored } from "@/lib/useStored";

const raw = (value: string | null) => value;

const card = "rounded-md border border-ln bg-sf p-4 shadow-card";
const LETTERS = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র"];

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
  const prayerRun = streak(today, (d) => progress(routine, d).prayers === 5);
  const share = khatm.page / PAGES;
  const days = weekFromSaturday(today);
  const most = Math.max(1, ...days.map((d) => khatm.log[d] ?? 0));
  const quizRun = streak(today, (d) => scores.daily[d] !== undefined);

  const shareProgress = async () => {
    const text = `নূর কুরআন-এ আমার অগ্রগতি\nখতম: ${toBnDigits(khatm.page)}/${toBnDigits(PAGES)} পৃষ্ঠা\nপাঁচ ওয়াক্তের ধারা: ${toBnDigits(prayerRun)} দিন`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        showToast("কপি হয়েছে");
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") showToast("শেয়ার করা যায়নি");
    }
  };

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/amal/daily/" className={`${card} flex flex-col items-center`}>
            <ProgressRing value={amal.done / amal.total} size={96} label={`আজকের আমল ${toBnDigits(amal.total)}-এর মধ্যে ${toBnDigits(amal.done)}`}><b className="text-2xl tabular-nums">{toBnDigits(amal.done)}/{toBnDigits(amal.total)}</b><span className="text-[0.6875rem] text-ink2">আজকের আমল</span></ProgressRing>
          </Link>
          <Link href="/amal/khatm/" className={`${card} flex flex-col items-center`}>
            <ProgressRing value={share} size={96} label={`খতমের ${toBnDigits(Math.floor(share * 100))} শতাংশ`}><b className="text-2xl tabular-nums">{toBnDigits(Math.floor(share * 100))}%</b><span className="text-[0.6875rem] text-ink2">খতম</span></ProgressRing>
          </Link>
        </div>

        <section aria-label="ধারা" className={`${card} flex items-center gap-3.5`}>
          <Icon name="flame" className="size-7 shrink-0 text-gd" />
          <p className="min-w-0 flex-1 leading-snug"><b className="block font-display text-lg">পাঁচ ওয়াক্তের ধারা {toBnDigits(prayerRun)} দিন</b><span className="block text-[0.8125rem] text-ink2">তিলাওয়াতে টানা {toBnDigits(streak(today, (d) => (khatm.log[d] ?? 0) > 0))} দিন</span></p>
          <Chip className="!bg-gs !text-gt" onClick={() => void shareProgress()}>শেয়ার</Chip>
        </section>

        <section aria-labelledby="week" className={card}>
          <div className="mb-3 flex items-baseline justify-between gap-3"><h2 id="week" className="font-display font-semibold">সাপ্তাহিক রিপোর্ট</h2><span className="text-[0.8125rem] text-ink2">পড়া পৃষ্ঠা</span></div>
          <ul className="grid grid-cols-7 items-end gap-2 text-center">
            {days.map((d, i) => {
              const pages = khatm.log[d] ?? 0;
              return (
                <li key={d}>
                  <span aria-hidden="true" className="flex h-20 items-end"><span className={`block w-full rounded-md ${pages ? "bg-gd" : "bg-ln"}`} style={{ height: pages ? `${(pages / most) * 100}%` : "4px" }} /></span>
                  <span aria-hidden="true" className={`mt-1 block text-[0.6875rem] ${d === day ? "font-bold text-ac" : "text-ink2"}`}>{LETTERS[i]}</span>
                  <span className="sr-only">{LETTERS[i]}: {toBnDigits(pages)} পৃষ্ঠা</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[0.8125rem] text-ink2">গত ৭ দিনে {toBnDigits(weekPages)} পৃষ্ঠা ও আমলে {toBnDigits(weekTicks)}টি টিক · সম্পন্ন খতম {toBnDigits(khatm.completed.length)}</p>
        </section>

        <section aria-labelledby="badges">
          <h2 id="badges" className="mb-2 font-display text-lg font-semibold">কুইজের ব্যাজ</h2>
          <ul className="grid grid-cols-3 gap-x-2 gap-y-4 text-center xs:grid-cols-4">
            {badges(scores, quizRun).map((b) => (
              <li key={b.name} className="flex flex-col items-center gap-1.5">
                <span aria-hidden="true" className={`grid size-14 place-items-center rounded-full border-[1.5px] ${b.earned ? "border-gd bg-gs text-gt" : "border-ln2 text-ink2"}`}><Icon name={b.earned ? "star" : "lock"} /></span>
                <span className="text-xs leading-snug">{b.name}<span className="sr-only">{b.earned ? " (পেয়েছেন)" : " (বাকি)"}</span></span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="space-y-5">
        <LinkList
          items={[
            { href: "/amal/daily/", title: "নামাজ ও আমল", hint: `আজ ${toBnDigits(amal.done)}/${toBnDigits(amal.total)} টিক · ওয়াক্ত ${toBnDigits(amal.prayers)}/৫`, icon: "deeds" },
            { href: "/amal/khatm/", title: "তিলাওয়াতের লক্ষ্য", hint: `আজ ${toBnDigits(khatm.log[day] ?? 0)}/${toBnDigits(khatm.goal)} পৃষ্ঠা`, icon: "mushaf" },
            { href: "/tasbih/", title: "তাসবিহ", hint: `আজ ${toBnDigits(tasbih.today)} বার`, icon: "tasbih" },
            { href: "/quiz/", title: "দৈনিক কুইজ", hint: scores.daily[day] === undefined ? "আজ এখনো খেলা হয়নি" : `আজ ${toBnDigits(scores.daily[day])}/${toBnDigits(QUESTIONS)}`, icon: "trophy" },
            { href: "/bookmarks/", title: "বুকমার্ক ও নোট", hint: `আয়াত ${toBnDigits(library.items.length)} · হাদিস ${toBnDigits(library.hadiths.length)} · নোট ${toBnDigits(notes)}`, icon: "bookmark" },
            { href: "/data/", title: "আমার ডেটা", hint: "ব্যাকআপ ও রিস্টোর", icon: "download" },
          ]}
        />
        {recent.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">সম্প্রতি পড়া সূরা</h2>
            <ul className="flex flex-wrap gap-2">{recent.map((n) => <li key={n}><Chip href={`/quran/${n}/`}>{names[n - 1]}</Chip></li>)}</ul>
          </section>
        )}
        {marked.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold">সাম্প্রতিক বুকমার্ক</h2>
            <ul className="flex flex-wrap gap-2">{marked.map((b) => <li key={`${b.s}:${b.a}`}><Chip href={`/quran/${b.s}/#a${b.a}`}>{names[b.s - 1]} {toBnDigits(b.s)}:{toBnDigits(b.a)}</Chip></li>)}</ul>
          </section>
        )}
      </div>
    </div>
  );
}

export function MyPage({ names }: { names: string[] }) {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} names={names} /> : <Skeleton className="h-52 !rounded-2xl" />;
}

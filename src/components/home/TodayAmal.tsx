"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { toBnDigits } from "@/lib/bn";
import { EMPTY_KHATM, PAGES, readKhatm } from "@/lib/tools/khatm";
import { dayKey, progress, PRAYERS, toggle } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { useRoutine } from "@/lib/tools/useRoutine";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored } from "@/lib/useStored";

const raw = (value: string | null) => value;

/** The reading of the whole Quran and the five-prayer streak, from this device. */
function useMine() {
  const ready = useInBrowser();
  const now = useNow();
  const { routine, save } = useRoutine();
  const khatmRaw = useStored("noor.khatm.v1", raw);
  if (!ready || now === null) return null;
  const today = new Date(now);
  return {
    routine, save, day: dayKey(today),
    khatm: (khatmRaw && readKhatm(khatmRaw)) || EMPTY_KHATM,
    days: streak(today, (d) => progress(routine, d).prayers === PRAYERS.length),
  };
}

/** Today's five prayers: a list on wide screens, five squares on a phone. */
export function TodayAmal() {
  const mine = useMine();
  if (!mine) return <Skeleton className="h-40 !rounded-3xl" />;
  const ticked = new Set(mine.routine.days[mine.day] ?? []);
  const done = PRAYERS.filter((p) => ticked.has(p.id)).length;
  return (
    <section aria-labelledby="today-amal" className="space-y-2.5 md:space-y-2 md:rounded-3xl md:border md:border-ln md:bg-sf md:p-5.5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="today-amal" className="font-display text-xl font-bold">আজকের আমল</h2>
        <span className="font-semibold text-ac">{toBnDigits(done)}/{toBnDigits(PRAYERS.length)}</span>
      </div>
      <ul className="grid grid-cols-5 gap-1.5 md:grid-cols-1 md:gap-2">
        {PRAYERS.map((p) => {
          const on = ticked.has(p.id);
          return (
            <li key={p.id}>
              <button type="button" role="checkbox" aria-checked={on} onClick={() => mine.save(toggle(mine.routine, mine.day, p.id))}
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-0.5 rounded-2xl border md:min-h-12 md:flex-row md:justify-start md:gap-3 md:rounded-xl md:px-3 md:text-left ${on ? "border-ac bg-ac text-on-ac md:border-ln md:bg-tint md:text-ink" : "border-ln bg-sf"}`}>
                <span aria-hidden className={`grid size-5 place-items-center rounded-full md:size-6 md:border-2 ${on ? "md:border-ac md:bg-ac md:text-on-ac" : "border-[1.5px] border-ink2"}`}>{on && <Icon name="check" className="size-3.5" />}</span>
                <span className="text-xs md:text-[0.9375rem]">{p.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[0.8125rem] text-ink2 md:hidden">খতম {toBnDigits(mine.khatm.page)}/{toBnDigits(PAGES)} পৃষ্ঠা · পাঁচ ওয়াক্তের ধারা {toBnDigits(mine.days)} দিন</p>
      <Link href="/amal/daily/" className="flex min-h-11 items-center font-semibold text-ac max-md:hidden">তালিকা সাজান</Link>
    </section>
  );
}

/** Wide screens only; a phone shows the same numbers under today's prayers. */
export function KhatmCard() {
  const mine = useMine();
  if (!mine) return <Skeleton className="h-full min-h-40 !rounded-3xl" />;
  return (
    <Link href="/amal/khatm/" className="flex h-full flex-col justify-between gap-3 rounded-[1.375rem] border border-ln bg-sf p-5.5 hover:border-ac">
      <span className="text-[0.8125rem] text-ink2">খতম অগ্রগতি</span>
      <span className="font-display text-4xl font-bold">{toBnDigits(mine.khatm.page)}<span className="text-lg font-medium text-ink2"> / {toBnDigits(PAGES)} পৃষ্ঠা</span></span>
      <ProgressBar value={mine.khatm.page / PAGES} className="!h-2" />
      <span className="text-[0.8125rem] text-ink2">পাঁচ ওয়াক্তের ধারা {toBnDigits(mine.days)} দিন</span>
    </Link>
  );
}

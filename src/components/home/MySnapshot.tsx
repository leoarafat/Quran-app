"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar, ProgressRing } from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { toBnDigits } from "@/lib/bn";
import { EMPTY_KHATM, PAGES, readKhatm } from "@/lib/tools/khatm";
import { dayKey, progress, PRAYERS, toggle } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { useRoutine } from "@/lib/tools/useRoutine";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored } from "@/lib/useStored";

const raw = (value: string | null) => value;
const card = "rounded-md border border-ln bg-sf p-4 shadow-card";

/** Today's checklist, the current reading of the whole Quran and the five-prayer streak. */
export function MySnapshot() {
  const ready = useInBrowser();
  const now = useNow();
  const { routine } = useRoutine();
  const khatmRaw = useStored("noor.khatm.v1", raw);
  const heading = (
    <div className="flex items-center justify-between gap-3 md:hidden">
      <h2 className="font-display text-xl font-semibold">আমার পাতা</h2>
      <Link href="/me/" className="-mr-2 flex min-h-11 items-center px-2 text-sm font-semibold text-ac">সব দেখুন</Link>
    </div>
  );
  let body = <div className={`${card} flex items-center gap-4`}><Skeleton className="size-[5.25rem] !rounded-full" /><div className="flex-1 space-y-3"><Skeleton /><Skeleton className="h-4 w-2/3" /></div></div>;
  if (ready && now !== null) {
    const today = new Date(now);
    const amal = progress(routine, dayKey(today));
    const khatm = (khatmRaw && readKhatm(khatmRaw)) || EMPTY_KHATM;
    const days = streak(today, (d) => progress(routine, d).prayers === PRAYERS.length);
    body = (
      <div className={`${card} flex items-center gap-4`}>
        <ProgressRing value={amal.done / amal.total} label={`আজকের আমল ${toBnDigits(amal.total)}-এর মধ্যে ${toBnDigits(amal.done)}`}>
          <b className="text-xl tabular-nums">{toBnDigits(amal.done)}/{toBnDigits(amal.total)}</b>
          <span className="text-[0.6875rem] text-ink2">আমল</span>
        </ProgressRing>
        <div className="min-w-0 flex-1 space-y-2.5">
          <div>
            <p className="flex justify-between gap-2 text-[0.8125rem]"><span>খতম · পৃষ্ঠা {toBnDigits(khatm.page)}/{toBnDigits(PAGES)}</span><b className="tabular-nums text-gt">{toBnDigits(Math.floor((khatm.page / PAGES) * 100))}%</b></p>
            <ProgressBar value={khatm.page / PAGES} className="mt-1" />
          </div>
          <p className="flex items-center gap-2 text-sm"><Icon name="flame" className="size-5 text-gd" /><b>পাঁচ ওয়াক্তের ধারা {toBnDigits(days)} দিন</b></p>
        </div>
      </div>
    );
  }
  return <section aria-label="আমার পাতা" className="flex h-full flex-col gap-2">{heading}<div className="flex-1 [&>div]:h-full">{body}</div></section>;
}

/** The same checklist as the daily page, for wide screens. */
export function TodayDeeds() {
  const ready = useInBrowser();
  const now = useNow();
  const { routine, save } = useRoutine();
  if (!ready || now === null) return null;
  const day = dayKey(new Date(now));
  const ticked = new Set(routine.days[day] ?? []);
  const items = [...PRAYERS, ...routine.items];
  return (
    <section aria-label="আজকের আমল" className={card}>
      <h2 className="mb-1 font-display text-base font-semibold">আজকের আমল</h2>
      <ul className="max-h-80 overflow-y-auto">
        {items.map((item) => {
          const done = ticked.has(item.id);
          return (
            <li key={item.id} className="border-t border-ln">
              <button type="button" role="checkbox" aria-checked={done} onClick={() => save(toggle(routine, day, item.id))} className="flex min-h-12 w-full items-center gap-3 text-left text-[0.9375rem]">
                <span aria-hidden="true" className={`grid size-[1.375rem] shrink-0 place-items-center rounded-full ${done ? "bg-ac text-on-ac" : "border-[1.5px] border-ink2"}`}>{done && <Icon name="check" className="size-3.5" />}</span>
                <span className="min-w-0 break-words">{item.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Link href="/amal/daily/" className="flex min-h-11 items-center text-sm font-semibold text-ac">তালিকা সাজান</Link>
    </section>
  );
}

/** "আজ ৩টি বাকি" on the daily deeds card. */
export function DeedsLeft() {
  const ready = useInBrowser();
  const now = useNow();
  const { routine } = useRoutine();
  if (!ready || now === null) return <>আজকের তালিকা</>;
  const { done, total } = progress(routine, dayKey(new Date(now)));
  return <>{done === total ? "আজ সব টিক দেওয়া হয়েছে" : `আজ ${toBnDigits(total - done)}টি বাকি`}</>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CheckRow } from "@/components/ui/CheckRow";
import { Icon } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { toBnDigits } from "@/lib/bn";
import { addItem, dayKey, ITEM_MAX, ITEMS_LIMIT, lastDays, PRAYERS, progress, removeItem, restoreItem, toggle, type Item } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { useRoutine } from "@/lib/tools/useRoutine";
import { weekFromSaturday } from "@/lib/tools/week";
import { useNow } from "@/lib/useNow";
import { useInBrowser } from "@/lib/useStored";

const LETTERS = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র"];
const card = "rounded-md border border-ln bg-sf shadow-card";
const heading = "mb-2 font-display text-lg font-semibold";

function Inner({ now }: { now: number }) {
  const { routine, save } = useRoutine();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  /** the list as it is after the latest change, for an undo pressed later */
  const latest = useRef(routine);
  useEffect(() => { latest.current = routine; }, [routine]);
  const today = new Date(now);
  const day = dayKey(today);
  const ticked = new Set(routine.days[day] ?? []);
  const todays = progress(routine, day);
  const month = lastDays(today, 30);
  const prayerRun = streak(today, (d) => progress(routine, d).prayers === PRAYERS.length);

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    const next = addItem(routine, `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name);
    if (next === routine) return;
    save(next);
    setName("");
  };
  const drop = (item: Item, index: number) => {
    save(removeItem(routine, item.id));
    showToast(`“${item.name}” সরানো হয়েছে`, { label: "ফেরান", run: () => save(restoreItem(latest.current, item, index)) }, 10_000);
  };

  return (
    <div className="space-y-5">
      <section aria-label="আজকের অগ্রগতি" className={`${card} flex items-center gap-4 p-4`}>
        <ProgressRing value={todays.done / todays.total} size={96} label={`আজকের আমল ${toBnDigits(todays.total)}-এর মধ্যে ${toBnDigits(todays.done)}`}>
          <b className="text-2xl tabular-nums">{toBnDigits(todays.done)}/{toBnDigits(todays.total)}</b>
          <span className="text-[0.6875rem] text-ink2">আজকের আমল</span>
        </ProgressRing>
        <div className="min-w-0 space-y-1">
          <p role="status" className="font-display font-semibold leading-snug">{todays.done === todays.total ? "আজ সব টিক দেওয়া হয়েছে।" : "ধীরে ধীরে, নিয়মিত।"}</p>
          <p className="flex items-center gap-2 text-sm"><Icon name="flame" className="size-5 shrink-0 text-gd" /><b>পাঁচ ওয়াক্তের ধারা {toBnDigits(prayerRun)} দিন</b></p>
        </div>
      </section>

      <section aria-labelledby="week">
        <h2 id="week" className={heading}>এই সপ্তাহ</h2>
        <ul className="grid grid-cols-7 gap-1.5 text-center">
          {weekFromSaturday(today).map((key, i) => {
            const { done, total } = progress(routine, key);
            return (
              <li key={key}>
                <span aria-hidden="true" className={`relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-ln text-sm font-semibold tabular-nums ${key === day ? "ring-[1.5px] ring-ac" : ""} ${key > day ? "opacity-45" : ""}`}>
                  <span className="absolute inset-0 bg-gd" style={{ opacity: (done / total) * 0.55 }} />
                  <span className="relative">{key > day ? "" : toBnDigits(done)}</span>
                </span>
                <span aria-hidden="true" className="mt-1 block text-[0.6875rem] text-ink2">{LETTERS[i]}</span>
                <span className="sr-only">{LETTERS[i]}: {key > day ? "এখনো আসেনি" : `${toBnDigits(total)}টির মধ্যে ${toBnDigits(done)}টি টিক`}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="five">
        <h2 id="five" className={heading}>আজ পাঁচ ওয়াক্ত</h2>
        <ul className={`${card} px-4`}>{PRAYERS.map((p) => <CheckRow key={p.id} strike title={`${p.name}ের নামাজ`} done={ticked.has(p.id)} onToggle={() => save(toggle(routine, day, p.id))} />)}</ul>
      </section>

      <section aria-labelledby="mine" className="space-y-3">
        <h2 id="mine" className="font-display text-lg font-semibold">আমার আমল</h2>
        {routine.items.length === 0 && <p className="text-sm text-ink2">যে আমল প্রতিদিন করতে চান, নিজে লিখে যোগ করুন।</p>}
        {routine.items.length > 0 && (
          <ul className={`${card} pl-4 pr-1`}>
            {routine.items.map((item, index) => (
              <CheckRow
                key={item.id}
                strike
                title={item.name}
                done={ticked.has(item.id)}
                onToggle={() => save(toggle(routine, day, item.id))}
                trailing={<button type="button" aria-label={`“${item.name}” তালিকা থেকে সরান`} onClick={() => drop(item, index)} className="grid size-11 shrink-0 place-items-center rounded-xl text-ink2"><Icon name="trash" className="size-5" /></button>}
              />
            ))}
          </ul>
        )}
        {routine.items.length < ITEMS_LIMIT && (adding ? (
          <form onSubmit={add} className="flex gap-2">
            <input aria-label="নতুন আমলের নাম" autoFocus maxLength={ITEM_MAX} value={name} onChange={(e) => setName(e.target.value)} placeholder="আমলের নাম লিখুন" className="min-h-12 min-w-0 flex-1 rounded-md border border-ln2 bg-sf px-3" />
            <button type="submit" disabled={!name.trim()} className="min-h-12 shrink-0 rounded-full bg-ac px-5 font-semibold text-on-ac disabled:opacity-40">যোগ</button>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-ac/40 font-semibold text-ac"><Icon name="plus" className="size-5" /> নিজের আমল যোগ করুন</button>
        ))}
      </section>

      <section aria-labelledby="month">
        <h2 id="month" className={heading}>৩০ দিনের রিপোর্ট</h2>
        <dl className="grid grid-cols-2 gap-3 text-center">
          {([
            ["টানা পাঁচ ওয়াক্ত পূর্ণ", `${toBnDigits(prayerRun)} দিন`],
            ["টানা অন্তত একটি টিক", `${toBnDigits(streak(today, (d) => progress(routine, d).done > 0))} দিন`],
            ["পাঁচ ওয়াক্ত পূর্ণ দিন", `${toBnDigits(month.filter((d) => progress(routine, d).prayers === PRAYERS.length).length)}/৩০`],
            ["মোট টিক দেওয়া ওয়াক্ত", `${toBnDigits(month.reduce((n, d) => n + progress(routine, d).prayers, 0))}/১৫০`],
          ] as const).map(([label, value]) => <div key={label} className={`${card} px-2 py-3`}><dt className="text-[0.8125rem] text-ink2">{label}</dt><dd className="font-display text-lg font-semibold text-gt">{value}</dd></div>)}
        </dl>
        <p className="mt-3 text-[0.8125rem] text-ink2">খাতা শুধু এই ফোনের এই ব্রাউজারেই থাকে। ব্রাউজারের ডেটা মুছলে হারিয়ে যাবে। দিন বদলায় রাত ১২টায়।</p>
      </section>
    </div>
  );
}

export function DailyRoutine() {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} /> : <Skeleton className="h-52 !rounded-2xl" />;
}

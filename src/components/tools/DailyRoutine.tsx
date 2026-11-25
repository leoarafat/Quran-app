"use client";

import { useState } from "react";
import { Check, Plus, Trash2, Undo2 } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { addItem, dayKey, ITEM_MAX, ITEMS_LIMIT, lastDays, PRAYERS, progress, removeItem, restoreItem, toggle, type Item } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { useRoutine } from "@/lib/tools/useRoutine";
import { useNow } from "@/lib/useNow";
import { useInBrowser } from "@/lib/useStored";

const WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const card = "rounded-[1.375rem] border border-line bg-surface p-4";

function Row({ name, done, onToggle, onRemove }: { name: string; done: boolean; onToggle: () => void; onRemove?: () => void }) {
  return (
    <li className="flex items-center gap-2">
      <button type="button" role="checkbox" aria-checked={done} onClick={onToggle} className={`flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border px-3 py-2 text-left ${done ? "border-gold bg-active" : "border-line-strong"}`}>
        <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full border ${done ? "border-gold bg-gold text-on-gold" : "border-line-strong"}`}>{done && <Check className="size-4" strokeWidth={3} />}</span>
        <span className="min-w-0 break-words">{name}</span>
      </button>
      {onRemove && <button type="button" aria-label={`“${name}” তালিকা থেকে সরান`} onClick={onRemove} className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-accent"><Trash2 aria-hidden className="size-4" /></button>}
    </li>
  );
}

function Inner({ now }: { now: number }) {
  const { routine, save } = useRoutine();
  const [name, setName] = useState("");
  const [removed, setRemoved] = useState<{ item: Item; index: number } | null>(null);
  const today = new Date(now);
  const day = dayKey(today);
  const ticked = new Set(routine.days[day] ?? []);
  const todays = progress(routine, day);
  const month = lastDays(today, 30);

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    const next = addItem(routine, `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name);
    if (next === routine) return;
    save(next);
    setName("");
  };

  return (
    <div className="space-y-4">
      <section className={card}>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold">আজ পাঁচ ওয়াক্ত</h2>
          <p role="status" className="text-sm text-muted">{toBnDigits(todays.done)}/{toBnDigits(todays.total)} টিক</p>
        </div>
        <ul className="space-y-2">{PRAYERS.map((p) => <Row key={p.id} name={p.name} done={ticked.has(p.id)} onToggle={() => save(toggle(routine, day, p.id))} />)}</ul>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-display font-semibold">আমার আমল</h2>
        {routine.items.length === 0 && <p className="mb-2 text-sm text-muted">যে আমল প্রতিদিন করতে চান, নিজে লিখে যোগ করুন।</p>}
        <ul className="space-y-2">
          {routine.items.map((item, index) => (
            <Row key={item.id} name={item.name} done={ticked.has(item.id)} onToggle={() => save(toggle(routine, day, item.id))} onRemove={() => { setRemoved({ item, index }); save(removeItem(routine, item.id)); }} />
          ))}
        </ul>
        {removed && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-full border border-gold bg-active px-4">
            <span role="status" className="truncate">“{removed.item.name}” সরানো হয়েছে</span>
            <button type="button" className="flex min-h-11 shrink-0 items-center gap-1 font-semibold text-accent" onClick={() => { save(restoreItem(routine, removed.item, removed.index)); setRemoved(null); }}><Undo2 aria-hidden className="size-4" /> ফেরান</button>
          </div>
        )}
        {routine.items.length < ITEMS_LIMIT && (
          <form onSubmit={add} className="mt-3 flex gap-2">
            <input aria-label="নতুন আমলের নাম" maxLength={ITEM_MAX} value={name} onChange={(e) => setName(e.target.value)} placeholder="আমলের নাম লিখুন" className="min-h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-bg px-4" />
            <button type="submit" disabled={!name.trim()} className="flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-brand bg-brand px-4 font-semibold text-on-brand disabled:opacity-40"><Plus aria-hidden className="size-4" /> যোগ</button>
          </form>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-2 font-display font-semibold">৩০ দিনের রিপোর্ট</h2>
        <dl className="grid grid-cols-2 gap-2 text-center">
          {([
            ["টানা পাঁচ ওয়াক্ত পূর্ণ", `${toBnDigits(streak(today, (d) => progress(routine, d).prayers === PRAYERS.length))} দিন`],
            ["টানা অন্তত একটি টিক", `${toBnDigits(streak(today, (d) => progress(routine, d).done > 0))} দিন`],
            ["পাঁচ ওয়াক্ত পূর্ণ দিন", `${toBnDigits(month.filter((d) => progress(routine, d).prayers === PRAYERS.length).length)}/৩০`],
            ["মোট টিক দেওয়া ওয়াক্ত", `${toBnDigits(month.reduce((n, d) => n + progress(routine, d).prayers, 0))}/১৫০`],
          ] as const).map(([label, value]) => <div key={label} className="rounded-2xl bg-active px-2 py-2"><dt className="text-[0.8125rem] text-muted">{label}</dt><dd className="font-display text-lg font-semibold text-accent">{value}</dd></div>)}
        </dl>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-display font-semibold">গত ৭ দিন</h2>
        <ul className="grid grid-cols-7 gap-1 text-center">
          {lastDays(today, 7).map((key) => {
            const { done, total } = progress(routine, key);
            const [y, m, d] = key.split("-").map(Number);
            return (
              <li key={key} className={`rounded-xl border py-1 ${key === day ? "border-gold" : "border-line"}`}>
                <span className="block text-[0.6875rem] text-muted">{WEEKDAYS[new Date(y, m - 1, d, 12).getDay()]}</span>
                <span className="block font-semibold">{toBnDigits(done)}</span>
                <span className="sr-only">টিক, মোট {toBnDigits(total)}টির মধ্যে</span>
                <span aria-hidden className="mx-1.5 mt-0.5 block h-1 rounded bg-line-strong"><span className="block h-1 rounded bg-accent" style={{ width: `${(done / total) * 100}%` }} /></span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[0.8125rem] text-muted">খাতা শুধু এই ফোনের এই ব্রাউজারেই থাকে। ব্রাউজারের ডেটা মুছলে হারিয়ে যাবে। দিন বদলায় রাত ১২টায়।</p>
      </section>
    </div>
  );
}

export function DailyRoutine() {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

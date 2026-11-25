"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Minus, Plus } from "lucide-react";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import type { Place } from "@/lib/quran/types";
import { addPages, daysLeft, EMPTY_KHATM, finish, GOAL_MAX, goalFor, PAGES, readKhatm, setGoal, setPage, type Khatm } from "@/lib/tools/khatm";
import { dayKey, lastDays } from "@/lib/tools/routine";
import { streak } from "@/lib/tools/streak";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";

export const KHATM_KEY = "noor.khatm.v1";
const RESCUE_KEY = "noor.khatm.unreadable";
const parse = (raw: string | null) => {
  const khatm = raw === null ? EMPTY_KHATM : readKhatm(raw);
  return khatm ? { khatm, unreadable: null } : { khatm: EMPTY_KHATM, unreadable: raw };
};
const card = "rounded-[1.375rem] border border-line bg-surface p-4";
const round = "grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-accent disabled:opacity-35";
const solid = "flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand bg-brand px-4 font-semibold text-on-brand disabled:opacity-40";
const longDate = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" });
const WINDOWS = [30, 60, 120, 365] as const;

function NumberForm({ label, max, button, onValue }: { label: string; max: number; button: string; onValue: (n: number) => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-1"
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(toAsciiDigits(text.trim()));
        if (!text.trim() || !Number.isInteger(n) || n < 0 || n > max) return setError(`০ থেকে ${toBnDigits(max)}-এর মধ্যে লিখুন`);
        setError("");
        setText("");
        onValue(n);
      }}
    >
      <div className="flex gap-2">
        <input inputMode="numeric" aria-label={label} placeholder={label} value={text} onChange={(e) => setText(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-bg px-4" />
        <button type="submit" className="min-h-11 shrink-0 rounded-full border border-line-strong px-4 font-semibold text-accent">{button}</button>
      </div>
      {error && <p role="alert" className="text-sm text-accent">{error}</p>}
    </form>
  );
}

function Inner({ now, starts }: { now: number; starts: Place[] }) {
  const { khatm, unreadable } = useStored(KHATM_KEY, parse);
  const today = new Date(now);
  const day = dayKey(today);
  const read = khatm.log[day] ?? 0;
  const run = streak(today, (d) => (khatm.log[d] ?? 0) > 0);
  const done = khatm.page >= PAGES;
  const next = starts[Math.min(PAGES - 1, khatm.page)];
  const week = lastDays(today, 7);
  const most = Math.max(khatm.goal, ...week.map((d) => khatm.log[d] ?? 0));

  const save = (value: Khatm) => {
    // Data we could not read is set aside first, so saving can never destroy it.
    if (unreadable !== null) writeStored(RESCUE_KEY, unreadable);
    writeStored(KHATM_KEY, JSON.stringify(value));
  };

  return (
    <div className="space-y-4">
      <section className={card} aria-label="আজকের লক্ষ্য">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold">আজ পড়েছেন</h2>
          <p className="text-sm text-muted">টানা {toBnDigits(run)} দিন</p>
        </div>
        <p role="status" className="mt-1 text-center font-display text-4xl font-bold text-accent">{toBnDigits(read)}<span className="text-lg text-muted"> / {toBnDigits(khatm.goal)} পৃষ্ঠা</span></p>
        <div aria-hidden className="my-3 h-2 rounded bg-line-strong"><div className="h-2 rounded bg-gold" style={{ width: `${Math.min(100, (read / khatm.goal) * 100)}%` }} /></div>
        <div className="flex items-center gap-2">
          <button type="button" className={round} aria-label="আজকের হিসাব থেকে ১ পৃষ্ঠা কমান" disabled={!read} onClick={() => save(addPages(khatm, day, -1))}><Minus aria-hidden className="size-5" /></button>
          <button type="button" className={`${solid} flex-1`} disabled={done} onClick={() => save(addPages(khatm, day, 1))}><Plus aria-hidden className="size-5" /> ১ পৃষ্ঠা পড়েছি</button>
        </div>
        {read >= khatm.goal && <p className="mt-2 text-center font-semibold text-accent">আজকের লক্ষ্য পূরণ হয়েছে, আলহামদু লিল্লাহ।</p>}
      </section>

      <section className={card} aria-label="খতম">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display font-semibold">চলতি খতম</h2>
          <p className="text-sm text-muted">সম্পন্ন খতম: {toBnDigits(khatm.completed.length)}</p>
        </div>
        <p className="mt-1">{toBnDigits(khatm.page)} / {toBnDigits(PAGES)} পৃষ্ঠা ({toBnDigits(Math.floor((khatm.page / PAGES) * 100))}%)</p>
        <div aria-hidden className="my-2 h-2 rounded bg-line-strong"><div className="h-2 rounded bg-accent" style={{ width: `${(khatm.page / PAGES) * 100}%` }} /></div>
        {done ? (
          <button type="button" className={`${solid} w-full`} onClick={() => save(finish(khatm, day))}>খতম সম্পন্ন, নতুন খতম শুরু করুন</button>
        ) : (
          <>
            <Link href={`/quran/${next.s}/#a${next.a}`} className={`${solid} w-full`}><BookOpen aria-hidden className="size-5" /> পৃষ্ঠা {toBnDigits(khatm.page + 1)} থেকে পড়ুন</Link>
            <p className="mt-2 text-center text-sm text-muted">দিনে {toBnDigits(khatm.goal)} পৃষ্ঠা পড়লে আর {toBnDigits(daysLeft(khatm))} দিন, আনুমানিক {longDate.format(new Date(now + (daysLeft(khatm) - 1) * 86_400_000))}</p>
          </>
        )}
      </section>

      <section className={`${card} space-y-3`} aria-label="লক্ষ্য ঠিক করুন">
        <h2 className="font-display font-semibold">দৈনিক লক্ষ্য</h2>
        <div className="flex items-center justify-center gap-4">
          <button type="button" className={round} aria-label="দৈনিক লক্ষ্য কমান" disabled={khatm.goal <= 1} onClick={() => save(setGoal(khatm, khatm.goal - 1))}><Minus aria-hidden className="size-5" /></button>
          <span className="min-w-28 text-center text-lg font-semibold">{toBnDigits(khatm.goal)} পৃষ্ঠা</span>
          <button type="button" className={round} aria-label="দৈনিক লক্ষ্য বাড়ান" disabled={khatm.goal >= GOAL_MAX} onClick={() => save(setGoal(khatm, khatm.goal + 1))}><Plus aria-hidden className="size-5" /></button>
        </div>
        <p className="text-sm text-muted">অথবা বাকিটা কত দিনে শেষ করতে চান:</p>
        <div className="grid grid-cols-4 gap-2">
          {WINDOWS.map((days) => <button key={days} type="button" disabled={done} onClick={() => save(setGoal(khatm, goalFor(khatm, days)))} className="min-h-11 rounded-full border border-line-strong text-sm disabled:opacity-35">{toBnDigits(days)} দিন</button>)}
        </div>
        <p className="text-sm text-muted">অন্য জায়গা থেকে শুরু করলে, কত পৃষ্ঠা আগেই পড়া হয়েছে লিখুন। এটি আজকের পড়ায় ধরা হবে না।</p>
        <NumberForm label="পড়া শেষ পৃষ্ঠা" max={PAGES} button="বসান" onValue={(n) => save(setPage(khatm, n))} />
      </section>

      <section className={card}>
        <h2 className="mb-2 font-display font-semibold">গত ৭ দিন (পৃষ্ঠা)</h2>
        <ul className="grid grid-cols-7 items-end gap-1 text-center">
          {week.map((d) => (
            <li key={d}>
              <span className="block text-sm font-semibold">{toBnDigits(khatm.log[d] ?? 0)}</span>
              <span aria-hidden className="mx-auto flex h-16 w-4 items-end rounded bg-line"><span className="block w-4 rounded bg-accent" style={{ height: `${((khatm.log[d] ?? 0) / most) * 100}%` }} /></span>
              <span className={`block text-xs ${d === day ? "font-bold text-accent" : "text-muted"}`}>{toBnDigits(Number(d.slice(8)))}<span className="sr-only"> তারিখ</span></span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[0.8125rem] text-muted">পৃষ্ঠা আপনি নিজে গোনেন; অ্যাপ নিজে থেকে হিসাব করে না। হিসাব শুধু এই ফোনে থাকে।</p>
      </section>
    </div>
  );
}

export function KhatmTracker({ starts }: { starts: Place[] }) {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} starts={starts} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { HeroCard } from "@/components/ui/HeroCard";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { Switch } from "@/components/ui/Toggle";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import type { Place } from "@/lib/quran/types";
import { hijriMonthDays, hijriOf, noon, parseAdjust } from "@/lib/tools/hijri";
import { addPages, daysLeft, EMPTY_KHATM, finish, GOAL_MAX, PAGES, parasDone, planStatus, readKhatm, setGoal, setPage, startPlan, type Khatm } from "@/lib/tools/khatm";
import { KHATM_REMINDER_KEY, parseDailyReminder, type DailyReminder } from "@/lib/tools/reminders";
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
const card = "rounded-md border border-ln bg-sf p-4 shadow-card";
const round = "grid size-11 shrink-0 place-items-center rounded-full border border-ln2 text-ac disabled:opacity-35";
const solid = "flex min-h-13 items-center justify-center gap-2 rounded-full bg-ac px-4 font-semibold text-on-ac disabled:opacity-40";
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
        <input inputMode="numeric" aria-label={label} placeholder={label} value={text} onChange={(e) => setText(e.target.value)} className="min-h-12 min-w-0 flex-1 rounded-md border border-ln2 bg-bg px-3" />
        <button type="submit" className="min-h-12 shrink-0 rounded-full border border-ln2 px-4 font-semibold text-ac">{button}</button>
      </div>
      {error && <p role="alert" className="text-sm text-gt">{error}</p>}
    </form>
  );
}

/** How many days of Ramadan are left including today, or null outside Ramadan. */
function ramadanLeft(today: Date, adjust: number): number | null {
  if (hijriOf(today, adjust).month !== 9) return null;
  const days = hijriMonthDays(noon(today), adjust);
  const key = dayKey(today);
  return days.filter((d) => dayKey(d.date) >= key).length;
}

function PlanSheet({ khatm, today, ramadan, save, onClose }: { khatm: Khatm; today: string; ramadan: number | null; save: (k: Khatm) => void; onClose: () => void }) {
  const done = khatm.page >= PAGES;
  const choose = (next: Khatm, message: string) => { save(next); onClose(); showToast(message); };
  return (
    <BottomSheet title="পরিকল্পনা" onClose={onClose}>
      <p className="text-sm text-ink2">বাকি পৃষ্ঠা কত দিনে শেষ করতে চান? দৈনিক লক্ষ্য নিজে থেকে ঠিক হবে।</p>
      <div className="grid grid-cols-4 gap-2">
        {WINDOWS.map((days) => <Chip key={days} disabled={done} selected={khatm.plan?.days === days && !khatm.plan.ramadan} className="!px-1 disabled:opacity-35" onClick={() => choose(startPlan(khatm, days, today), `${toBnDigits(days)} দিনের পরিকল্পনা শুরু হলো`)}>{toBnDigits(days)} দিন</Chip>)}
      </div>
      {ramadan === null
        ? <p className="text-sm text-ink2">রমজান প্ল্যান রমজান শুরু হলে বেছে নেওয়া যাবে।</p>
        : <Chip disabled={done} className="w-full" selected={khatm.plan?.ramadan === true} onClick={() => choose(startPlan(khatm, ramadan, today, true), "রমজান প্ল্যান শুরু হলো")}>রমজান প্ল্যান · বাকি {toBnDigits(ramadan)} দিন</Chip>}
      <div className="border-t border-ln pt-3">
        <p className="mb-2 font-semibold">নিজে দৈনিক লক্ষ্য দিন</p>
        <div className="flex items-center justify-center gap-4">
          <button type="button" className={round} aria-label="দৈনিক লক্ষ্য কমান" disabled={khatm.goal <= 1} onClick={() => save(setGoal(khatm, khatm.goal - 1))}><Icon name="minus" className="size-5" /></button>
          <span className="min-w-28 text-center text-lg font-semibold">{toBnDigits(khatm.goal)} পৃষ্ঠা</span>
          <button type="button" className={round} aria-label="দৈনিক লক্ষ্য বাড়ান" disabled={khatm.goal >= GOAL_MAX} onClick={() => save(setGoal(khatm, khatm.goal + 1))}><Icon name="plus" className="size-5" /></button>
        </div>
      </div>
      <div className="space-y-2 border-t border-ln pt-3">
        <p className="text-sm text-ink2">অন্য জায়গা থেকে শুরু করলে, কত পৃষ্ঠা আগেই পড়া হয়েছে লিখুন। এটি আজকের পড়ায় ধরা হবে না।</p>
        <NumberForm label="পড়া শেষ পৃষ্ঠা" max={PAGES} button="বসান" onValue={(n) => save(setPage(khatm, n))} />
      </div>
    </BottomSheet>
  );
}

function ReminderRow() {
  const reminder = useStored(KHATM_REMINDER_KEY, parseDailyReminder);
  const [message, setMessage] = useState("");
  const save = (next: DailyReminder) => writeStored(KHATM_REMINDER_KEY, JSON.stringify(next));
  const toggle = async (on: boolean) => {
    setMessage("");
    if (on) {
      if (typeof Notification === "undefined") return setMessage("এই ব্রাউজারে নোটিফিকেশন নেই। iPhone-এ আগে হোম স্ক্রিনে ইনস্টল করতে হয়।");
      const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") return setMessage("নোটিফিকেশনের অনুমতি পাওয়া যায়নি। ব্রাউজারের সাইট-সেটিংস থেকে অনুমতি দিন।");
      showToast("রিমাইন্ডার চালু হলো। অ্যাপ খোলা থাকলে আসবে।");
    }
    save({ ...reminder, on });
  };
  return (
    <li className="border-b border-ln py-2">
      <div className="flex min-h-11 items-center gap-3.5">
        <Icon name="bell" className="size-6 shrink-0 text-ac" />
        <span className="min-w-0 flex-1 leading-snug"><span className="block font-semibold">রিমাইন্ডার</span><span className="block text-[0.8125rem] text-ink2">অ্যাপ খোলা থাকলেই আসবে</span></span>
        <input type="time" aria-label="রিমাইন্ডারের সময়" value={reminder.time} onChange={(e) => e.target.value && save({ ...reminder, time: e.target.value })} className="min-h-11 rounded-xl border border-ln2 bg-bg px-2 text-sm text-ink" />
        <Switch label="তিলাওয়াতের রিমাইন্ডার" checked={reminder.on} onChange={(on) => void toggle(on)} />
      </div>
      <p role="alert" className="text-sm text-gt empty:hidden">{message}</p>
    </li>
  );
}

type Para = Place & { page: number };

function Inner({ now, starts, paras }: { now: number; starts: Place[]; paras: Para[] }) {
  const { khatm, unreadable } = useStored(KHATM_KEY, parse);
  const adjust = useStored("noor.hijri.adjust.v1", parseAdjust);
  const [sheet, setSheet] = useState<"plan" | "history" | null>(null);
  const today = new Date(now);
  const day = dayKey(today);
  const read = khatm.log[day] ?? 0;
  const run = streak(today, (d) => (khatm.log[d] ?? 0) > 0);
  const done = khatm.page >= PAGES;
  const next = starts[Math.min(PAGES - 1, khatm.page)];
  const week = lastDays(today, 7);
  const most = Math.max(khatm.goal, ...week.map((d) => khatm.log[d] ?? 0));
  const status = planStatus(khatm, day);
  const share = khatm.page / PAGES;
  const finishedParas = parasDone(khatm.page, paras.map((p) => p.page));

  const save = (value: Khatm) => {
    // Data we could not read is set aside first, so saving can never destroy it.
    if (unreadable !== null) writeStored(RESCUE_KEY, unreadable);
    writeStored(KHATM_KEY, JSON.stringify(value));
  };

  return (
    <div className="space-y-5">
      <HeroCard label="চলতি খতম" className="!p-5">
        <div className="flex items-center gap-5">
          <span role="img" aria-label={`খতমের ${toBnDigits(Math.floor(share * 100))} শতাংশ পড়া হয়েছে`} className="relative grid size-26 shrink-0 place-items-center">
            <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="7" />
              {share > 0 && <circle cx="50" cy="50" r="45" fill="none" stroke="var(--hero-accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${share * 282.7} 282.7`} className="transition-[stroke-dasharray] duration-[600ms]" />}
            </svg>
            <span aria-hidden="true" className="text-center leading-tight"><b className="block text-2xl tabular-nums">{toBnDigits(Math.floor(share * 100))}%</b><span className="text-xs text-hero-muted">খতম</span></span>
          </span>
          <div className="min-w-0">
            <p className="text-[0.8125rem] text-hero-muted">{khatm.plan ? (khatm.plan.ramadan ? "রমজান প্ল্যান" : `${toBnDigits(khatm.plan.days)} দিনের পরিকল্পনা`) : "দৈনিক লক্ষ্য"}</p>
            <p className="font-display text-2xl font-bold leading-snug">{status && khatm.plan ? `দিন ${toBnDigits(status.day)} / ${toBnDigits(khatm.plan.days)}` : `${toBnDigits(khatm.goal)} পৃষ্ঠা`}</p>
            <p className="text-sm">{toBnDigits(khatm.page)} / {toBnDigits(PAGES)} পৃষ্ঠা পড়া</p>
          </div>
        </div>
      </HeroCard>

      {status && (status.behind > 0 || status.over) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 rounded-md bg-gs px-4 py-2 text-sm">
          <p>{status.over ? "পরিকল্পনার দিন শেষ হয়েছে।" : `পরিকল্পনা থেকে ${toBnDigits(status.behind)} পৃষ্ঠা পিছিয়ে আছেন।`} কোনো অসুবিধা নেই, নতুন করে সাজিয়ে নিন।</p>
          <button type="button" aria-haspopup="dialog" onClick={() => setSheet("plan")} className="min-h-11 font-semibold text-ac">পরিকল্পনা বদলান</button>
        </div>
      )}

      <section aria-label="আজকের লক্ষ্য" className={`${card} space-y-3`}>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">আজকের লক্ষ্য</h2>
          <p role="status" className="font-semibold tabular-nums text-gt">{toBnDigits(read)} / {toBnDigits(khatm.goal)} পৃষ্ঠা</p>
        </div>
        <ProgressBar value={read / khatm.goal} />
        {read >= khatm.goal && <p className="text-center font-semibold text-gt">আজকের লক্ষ্য পূরণ হয়েছে, আলহামদু লিল্লাহ।</p>}
        {done ? (
          <button type="button" className={`${solid} w-full`} onClick={() => save(finish(khatm, day))}>খতম সম্পন্ন, নতুন খতম শুরু করুন</button>
        ) : (
          <>
            <Link href={`/quran/${next.s}/#a${next.a}`} className={`${solid} w-full`}><Icon name="quran" className="size-5" /> পৃষ্ঠা {toBnDigits(khatm.page + 1)} থেকে পড়ুন</Link>
            <div className="flex items-center gap-2">
              <button type="button" className={round} aria-label="আজকের হিসাব থেকে ১ পৃষ্ঠা কমান" disabled={!read} onClick={() => save(addPages(khatm, day, -1))}><Icon name="minus" className="size-5" /></button>
              <Chip className="flex-1" onClick={() => save(addPages(khatm, day, 1))}><Icon name="plus" className="size-5" /> ১ পৃষ্ঠা পড়েছি</Chip>
            </div>
            <p className="text-center text-[0.8125rem] text-ink2">দিনে {toBnDigits(khatm.goal)} পৃষ্ঠা পড়লে আর {toBnDigits(daysLeft(khatm))} দিন, আনুমানিক {longDate.format(new Date(now + (daysLeft(khatm) - 1) * 86_400_000))}</p>
          </>
        )}
      </section>

      <section aria-labelledby="paras">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="paras" className="font-display text-lg font-semibold">পারা মানচিত্র</h2>
          <p className="text-[0.8125rem] text-ink2">{toBnDigits(finishedParas)} পারা সম্পন্ন</p>
        </div>
        <ul className="grid grid-cols-6 gap-1.5 md:grid-cols-10">
          {paras.map((p, i) => {
            const complete = i < finishedParas;
            const current = !complete && khatm.page >= p.page - 1 && khatm.page > 0 && i === finishedParas;
            return (
              <li key={i}>
                <Link href={`/quran/${p.s}/#a${p.a}`} prefetch={false} aria-label={`পারা ${toBnDigits(i + 1)}${complete ? ", পড়া শেষ" : current ? ", এখন পড়ছেন" : ""}`} className={`grid aspect-square min-h-11 place-items-center rounded-lg text-[0.8125rem] font-semibold tabular-nums ${complete ? "bg-gold text-on-gold" : current ? "border-[1.5px] border-gd bg-gs" : "bg-ln text-ink2"}`}>{toBnDigits(i + 1)}</Link>
              </li>
            );
          })}
        </ul>
      </section>

      <ul className={`${card} !py-1`}>
        <li className="flex min-h-15 items-center gap-3.5 border-b border-ln">
          <Icon name="flame" className="size-6 shrink-0 text-gd" />
          <span className="leading-snug"><span className="block font-semibold">ধারা</span><span className="block text-[0.8125rem] text-ink2">টানা {toBnDigits(run)} দিন</span></span>
        </li>
        <ReminderRow />
        <li>
          <button type="button" aria-haspopup="dialog" onClick={() => setSheet("history")} className="flex min-h-15 w-full items-center gap-3.5 text-left">
            <Icon name="clock" className="size-6 shrink-0 text-ac" />
            <span className="min-w-0 flex-1 leading-snug"><span className="block font-semibold">ইতিহাস</span><span className="block text-[0.8125rem] text-ink2">সম্পন্ন খতম: {toBnDigits(khatm.completed.length)}</span></span>
            <Icon name="chev" className="size-5 shrink-0 text-ink2" />
          </button>
        </li>
      </ul>

      <Chip className="w-full" aria-haspopup="dialog" onClick={() => setSheet("plan")}>{khatm.plan ? "পরিকল্পনা বদলান" : "পরিকল্পনা ঠিক করুন"}</Chip>

      <section aria-labelledby="week" className={card}>
        <h2 id="week" className="mb-2 font-display text-lg font-semibold">গত ৭ দিন (পৃষ্ঠা)</h2>
        <ul className="grid grid-cols-7 items-end gap-1 text-center">
          {week.map((d) => (
            <li key={d}>
              <span className="block text-sm font-semibold">{toBnDigits(khatm.log[d] ?? 0)}</span>
              <span aria-hidden="true" className="mx-auto flex h-16 w-4 items-end rounded bg-ln"><span className="block w-4 rounded bg-gd" style={{ height: `${((khatm.log[d] ?? 0) / most) * 100}%` }} /></span>
              <span className={`block text-xs ${d === day ? "font-bold text-ac" : "text-ink2"}`}>{toBnDigits(Number(d.slice(8)))}<span className="sr-only"> তারিখ</span></span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[0.8125rem] text-ink2">পৃষ্ঠা আপনি নিজে গোনেন; অ্যাপ নিজে থেকে হিসাব করে না। হিসাব শুধু এই ফোনে থাকে।</p>
      </section>

      {sheet === "plan" && <PlanSheet khatm={khatm} today={day} ramadan={ramadanLeft(today, adjust)} save={save} onClose={() => setSheet(null)} />}
      {sheet === "history" && (
        <BottomSheet title="খতমের ইতিহাস" onClose={() => setSheet(null)}>
          {khatm.completed.length === 0 ? <p className="text-ink2">এখনো কোনো খতম সম্পন্ন হয়নি।</p> : (
            <ol className="rounded-md border border-ln px-4">
              {[...khatm.completed].reverse().map((d, i) => <li key={`${d}-${i}`} className="flex min-h-12 items-center justify-between gap-3 border-b border-ln last:border-0"><span>খতম {toBnDigits(khatm.completed.length - i)}</span><span className="text-sm text-ink2">{longDate.format(new Date(`${d}T12:00:00`))}</span></li>)}
            </ol>
          )}
        </BottomSheet>
      )}
    </div>
  );
}

export function KhatmTracker({ starts, paras }: { starts: Place[]; paras: Para[] }) {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} starts={starts} paras={paras} /> : <Skeleton className="h-36 !rounded-3xl" />;
}

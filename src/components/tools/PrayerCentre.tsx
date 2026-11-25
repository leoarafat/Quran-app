"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Minus, Plus, Printer } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { calendarDay, clockTime, timesFor } from "@/lib/prayer";
import { ADJUST_LIMIT, DEFAULT_PRAYER_PREFS, METHODS, PRAYER_PREFS_KEY, type PrayerPrefs } from "@/lib/prayerPrefs";
import { BEFORE_CHOICES, parseReminder, REMINDER_KEY } from "@/lib/tools/reminders";
import { COLUMNS, dayRow, describePrefs, monthDays, toCsv } from "@/lib/tools/timetable";

import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { usePlace } from "@/lib/usePlace";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";
import { PlaceSelect } from "./PlaceSelect";

const monthName = new Intl.DateTimeFormat("bn-BD", { month: "long", year: "numeric" });
const card = "rounded-[1.375rem] border border-line bg-surface p-4";
const round = "grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-accent disabled:opacity-35";
const chip = (on: boolean) => `min-h-11 rounded-full border px-3 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong"}`;
const select = "min-h-11 w-full rounded-2xl border border-line-strong bg-bg px-2 text-text";

function ReminderSettings() {
  const reminder = useStored(REMINDER_KEY, parseReminder);
  const [message, setMessage] = useState("");
  const save = (next: typeof reminder) => writeStored(REMINDER_KEY, JSON.stringify(next));
  const toggle = async () => {
    setMessage("");
    if (reminder.on) return save({ ...reminder, on: false });
    if (typeof Notification === "undefined") return setMessage("এই ব্রাউজারে নোটিফিকেশন নেই। iPhone-এ আগে হোম স্ক্রিনে ইনস্টল করতে হয়।");
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (permission !== "granted") return setMessage("নোটিফিকেশনের অনুমতি পাওয়া যায়নি। ব্রাউজারের সাইট-সেটিংস থেকে অনুমতি দিন।");
    save({ ...reminder, on: true });
  };
  return (
    <section className={`${card} space-y-3 print:hidden`} aria-label="রিমাইন্ডার">
      <h2 className="font-display font-semibold">নামাজের রিমাইন্ডার</h2>
      <button type="button" aria-pressed={reminder.on} onClick={toggle} className={`${chip(reminder.on)} w-full`}>{reminder.on ? "রিমাইন্ডার চালু আছে (বন্ধ করতে চাপুন)" : "রিমাইন্ডার চালু করুন"}</button>
      <label className="block text-sm text-muted">কতক্ষণ আগে
        <select className={select} value={reminder.before} onChange={(e) => save({ ...reminder, before: Number(e.target.value) })}>
          {BEFORE_CHOICES.map((m) => <option key={m} value={m}>{m === 0 ? "ঠিক ওয়াক্ত শুরুতে" : `${toBnDigits(m)} মিনিট আগে`}</option>)}
        </select>
      </label>
      <p role="alert" className="text-sm text-accent empty:hidden">{message}</p>
      <p className="text-sm text-muted">সীমাবদ্ধতা: অ্যাপ খোলা বা পেছনে চালু থাকলেই রিমাইন্ডার আসবে। অ্যাপ বন্ধ থাকলে বা ফোন ঘুমিয়ে গেলে আসবে না। এটি আজান বা অ্যালার্মের বিকল্প নয়।</p>
    </section>
  );
}

function Inner({ now }: { now: number }) {
  const place = usePlace();
  const prefs = usePrayerPrefs();
  const [offset, setOffset] = useState(0);
  const today = calendarDay(new Date(now), place.timeZone);
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1, 12);
  const days = monthDays(first.getFullYear(), first.getMonth());
  const times = timesFor(place, today, prefs);
  const save = (next: PrayerPrefs) => writeStored(PRAYER_PREFS_KEY, JSON.stringify(next));

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(place, days, prefs)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `namaz-${place.id}-${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="print:hidden"><PlaceSelect /></div>

      <section className={`${card} print:hidden`} aria-label="আজকের সময়">
        <h2 className="mb-2 font-display font-semibold">আজ</h2>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {COLUMNS.map(([id, name]) => <div key={id} className="rounded-2xl bg-active py-2"><dt className="text-sm text-muted">{name}</dt><dd className="font-semibold">{clockTime(times[id], place.timeZone)}</dd></div>)}
        </dl>
      </section>

      <section className={`${card} space-y-3 print:hidden`} aria-label="হিসাবের নিয়ম">
        <h2 className="font-display font-semibold">হিসাবের নিয়ম</h2>
        <label className="block text-sm text-muted">পদ্ধতি
          <select className={select} value={prefs.method} onChange={(e) => save({ ...prefs, method: METHODS.find(([id]) => id === e.target.value)![0] })}>
            {METHODS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <div role="group" aria-label="আসরের সময়" className="grid grid-cols-2 gap-2">
          {([["hanafi", "হানাফি আসর"], ["shafi", "শাফেয়ি আসর"]] as const).map(([id, name]) => <button key={id} type="button" aria-pressed={prefs.asr === id} className={chip(prefs.asr === id)} onClick={() => save({ ...prefs, asr: id })}>{name}</button>)}
        </div>
        <details>
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-accent">স্থানীয় সূচির সাথে মিলাতে মিনিট সমন্বয়</summary>
          <ul className="space-y-2">
            {COLUMNS.map(([id, name]) => (
              <li key={id} className="flex items-center gap-2">
                <span className="flex-1">{name}</span>
                <button type="button" className={round} aria-label={`${name} ১ মিনিট কমান`} disabled={prefs.adjust[id] <= -ADJUST_LIMIT} onClick={() => save({ ...prefs, adjust: { ...prefs.adjust, [id]: prefs.adjust[id] - 1 } })}><Minus aria-hidden className="size-4" /></button>
                <span className="w-16 text-center tabular-nums">{prefs.adjust[id] > 0 ? "+" : prefs.adjust[id] < 0 ? "−" : ""}{toBnDigits(Math.abs(prefs.adjust[id]))} মি.</span>
                <button type="button" className={round} aria-label={`${name} ১ মিনিট বাড়ান`} disabled={prefs.adjust[id] >= ADJUST_LIMIT} onClick={() => save({ ...prefs, adjust: { ...prefs.adjust, [id]: prefs.adjust[id] + 1 } })}><Plus aria-hidden className="size-4" /></button>
              </li>
            ))}
          </ul>
        </details>
        <button type="button" className={`${chip(false)} w-full`} onClick={() => save(DEFAULT_PRAYER_PREFS)}>আগের (ডিফল্ট) নিয়মে ফিরুন</button>
      </section>

      <ReminderSettings />

      <section className={`${card} px-2 print:border-0 print:bg-transparent print:p-0`} aria-label="মাসিক সূচি">
        <div className="mb-2 flex items-center justify-between gap-2">
          <button type="button" className={`${round} print:hidden`} aria-label="আগের মাস" onClick={() => setOffset((v) => v - 1)}><ChevronLeft aria-hidden className="size-5" /></button>
          <h2 aria-live="polite" className="text-center font-display text-lg font-semibold">{monthName.format(first)}</h2>
          <button type="button" className={`${round} print:hidden`} aria-label="পরের মাস" onClick={() => setOffset((v) => v + 1)}><ChevronRight aria-hidden className="size-5" /></button>
        </div>
        <p className="mb-2 hidden text-center print:block">{place.name} · {describePrefs(prefs)}</p>
        <table className="w-full text-center text-[0.8125rem] tabular-nums">
          <thead className="text-xs text-muted">
            <tr><th scope="col" className="py-1">তারিখ</th>{COLUMNS.map(([id, name]) => <th key={id} scope="col" className="font-semibold">{name}</th>)}</tr>
          </thead>
          <tbody>
            {days.map((d) => {
              const isToday = d.toDateString() === today.toDateString();
              return (
                <tr key={d.getDate()} aria-current={isToday ? "date" : undefined} className={`border-t border-line ${isToday ? "bg-active font-bold" : ""}`}>
                  <th scope="row" className="py-1.5">{toBnDigits(d.getDate())}</th>
                  {dayRow(place, d, prefs).map((value, i) => <td key={i}>{value}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 grid grid-cols-2 gap-2 print:hidden">
          <button type="button" className={`${chip(false)} flex items-center justify-center gap-2 text-accent`} onClick={download}><Download aria-hidden className="size-4" /> CSV ডাউনলোড</button>
          <button type="button" className={`${chip(false)} flex items-center justify-center gap-2 text-accent`} onClick={() => window.print()}><Printer aria-hidden className="size-4" /> প্রিন্ট / PDF</button>
        </div>
      </section>
      <p className="text-sm text-muted print:hidden">সময় ফোনেই হিসাব করা। আমলের আগে স্থানীয় মসজিদ বা ইসলামিক ফাউন্ডেশনের সূচির সাথে মিলিয়ে নিন।</p>
    </div>
  );
}

export function PrayerCentre() {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

"use client";

import { useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { toIcs } from "@/lib/tools/ics";
import { DateConverter } from "./DateConverter";
import { toBnDigits } from "@/lib/bn";
import { addDays, ADJUST_CHOICES, HIJRI_MONTHS, hijriMonthDays, hijriOf, noon, parseAdjust, specialDay, upcomingSpecialDays } from "@/lib/tools/hijri";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";

const KEY = "noor.hijri.adjust.v1";
const WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const gregorian = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" });
const weekday = new Intl.DateTimeFormat("bn-BD", { weekday: "long" });
const year = (y: number) => toBnDigits(y);

function Calendar() {
  const adjust = useStored(KEY, parseAdjust);
  const [today] = useState(() => noon(new Date()));
  // A day inside the month being looked at; null follows today.
  const [anchor, setAnchor] = useState<Date | null>(null);
  const days = hijriMonthDays(anchor ?? today, adjust);
  const now = hijriOf(today, adjust);
  const shown = days[0].hijri;
  const upcoming = upcomingSpecialDays(today, adjust, 5);
  const exportDays = () => {
    const url = URL.createObjectURL(new Blob([toIcs(upcomingSpecialDays(today, adjust, 12), new Date())], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "islamic-days.ics";
    link.click();
    URL.revokeObjectURL(url);
  };
  const nav = "grid size-11 place-items-center rounded-full border border-line-strong text-accent";

  return (
    <div className="space-y-4">
      <div className="rounded-[1.375rem] bg-gold p-5 text-center text-on-gold">
        <p className="text-sm">আজ {weekday.format(today)}</p>
        <p className="font-display text-2xl font-bold leading-relaxed">{toBnDigits(now.day)} {HIJRI_MONTHS[now.month - 1]} {year(now.year)} হিজরি</p>
        <p className="text-sm">{gregorian.format(today)}</p>
      </div>

      <section aria-label="মাসের ক্যালেন্ডার" className="rounded-[1.375rem] border border-line bg-surface p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <button type="button" className={nav} aria-label="আগের মাস" onClick={() => setAnchor(addDays(days[0].date, -1))}><ChevronLeft aria-hidden className="size-5" /></button>
          <h2 aria-live="polite" className="text-center font-display text-lg font-semibold">{HIJRI_MONTHS[shown.month - 1]} {year(shown.year)}</h2>
          <button type="button" className={nav} aria-label="পরের মাস" onClick={() => setAnchor(addDays(days.at(-1)!.date, 1))}><ChevronRight aria-hidden className="size-5" /></button>
        </div>
        <div aria-hidden className="grid grid-cols-7 text-center text-xs text-muted">{WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}</div>
        <ol className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: days[0].date.getDay() }, (_, i) => <li key={`blank${i}`} aria-hidden />)}
          {days.map(({ date, hijri }) => {
            const isToday = date.toDateString() === today.toDateString();
            const special = specialDay(hijri);
            return (
              <li key={date.getTime()} aria-current={isToday ? "date" : undefined} className={`rounded-xl py-1.5 leading-tight ${isToday ? "bg-gold font-bold text-on-gold" : special ? "border border-gold" : date.getDay() === 5 ? "bg-active" : ""}`}>
                <span className="block text-base">{toBnDigits(hijri.day)}</span>
                <span className={`block text-[0.6875rem] ${isToday ? "" : "text-muted"}`}>{toBnDigits(date.getDate())}</span>
                <span className="sr-only">{gregorian.format(date)}{special ? `, ${special}` : ""}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-center text-xs text-muted">বড় সংখ্যা হিজরি, ছোটটি ইংরেজি তারিখ · {gregorian.format(days[0].date)} থেকে {gregorian.format(days.at(-1)!.date)}</p>
        {anchor && <button type="button" className="mx-auto mt-2 block min-h-11 rounded-full border border-line-strong px-4 text-accent" onClick={() => setAnchor(null)}>চলতি মাসে ফিরুন</button>}
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">সামনের বিশেষ দিন</h2>
        <ul className="space-y-2">
          {upcoming.map((u) => (
            <li key={u.date.getTime()} className="flex items-center justify-between gap-3 rounded-[1.375rem] border border-line bg-surface px-4 py-3">
              <span><span className="block font-display font-semibold">{u.name}</span><span className="block text-sm text-muted">{gregorian.format(u.date)}</span></span>
              <span className="shrink-0 text-sm text-accent">{u.inDays === 0 ? "আজ" : `${toBnDigits(u.inDays)} দিন পর`}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={exportDays} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-line-strong bg-surface font-semibold text-accent"><CalendarPlus aria-hidden className="size-5" /> ফোনের ক্যালেন্ডারে যোগ করুন</button>
        <p className="mt-1 text-sm text-muted">সামনের বিশেষ দিনগুলোর ফাইল (.ics) নামবে; আগের সন্ধ্যায় ফোনের ক্যালেন্ডার মনে করিয়ে দেবে। তারিখ আনুমানিক, চাঁদ দেখা অনুযায়ী মিলিয়ে নিন।</p>
      </section>

      <DateConverter today={today} adjust={adjust} />

      <section className="rounded-[1.375rem] border border-dashed border-line-strong p-4">
        <h2 className="font-display font-semibold">চাঁদ দেখা অনুযায়ী সমন্বয়</h2>
        <p className="mb-2 text-sm leading-relaxed text-muted">এটি সৌদি আরবের উম্মুল কুরা হিসাব। বাংলাদেশে চাঁদ দেখা সাধারণত পরে হয়, তাই শুরুতে −১ দেওয়া আছে। প্রতি মাসে এটি বদলাতে হতে পারে। রোজা, ঈদ ও অন্য ইবাদতের তারিখে জাতীয় চাঁদ দেখা কমিটির ঘোষণাই চূড়ান্ত।</p>
        <div role="group" aria-label="দিন সমন্বয়" className="flex justify-center gap-2">
          {ADJUST_CHOICES.map((a) => <button key={a} type="button" aria-pressed={adjust === a} onClick={() => writeStored(KEY, String(a))} className={`min-h-11 min-w-12 rounded-full border px-3 ${adjust === a ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`}>{a > 0 ? "+" : a < 0 ? "−" : ""}{toBnDigits(Math.abs(a))}</button>)}
        </div>
      </section>
    </div>
  );
}

export function HijriCalendar() {
  return useInBrowser() ? <Calendar /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

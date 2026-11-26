"use client";

import { useState } from "react";
import { headerButton, ScreenHeader } from "@/components/shell/ScreenHeader";
import { Icon } from "@/components/ui/Icon";
import { Seg } from "@/components/ui/Seg";
import { Skeleton } from "@/components/ui/Skeleton";
import { toBnDigits } from "@/lib/bn";
import { ADJUST_CHOICES, HIJRI_MONTHS, hijriOf, noon, parseAdjust, specialDay, upcomingSpecialDays } from "@/lib/tools/hijri";
import { toIcs } from "@/lib/tools/ics";
import { monthDays } from "@/lib/tools/timetable";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";
import { DateConverter } from "./DateConverter";

const KEY = "noor.hijri.adjust.v1";
const WEEKDAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const gregorian = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" });
const weekday = new Intl.DateTimeFormat("bn-BD", { weekday: "long" });
const monthTitle = new Intl.DateTimeFormat("bn-BD", { month: "long", year: "numeric" });
const card = "rounded-md border border-ln bg-sf shadow-card";
const nav = "grid size-11 shrink-0 place-items-center rounded-xl";
const signed = (a: number) => `${a > 0 ? "+" : a < 0 ? "−" : ""}${toBnDigits(Math.abs(a))}`;

/** "জুমাদাল উলা – জুমাদাল আখিরাহ ১৪৪৮": the Hijri months a civil month touches. */
function hijriSpan(first: Date, last: Date, adjust: number): string {
  const a = hijriOf(first, adjust);
  const b = hijriOf(last, adjust);
  if (a.month === b.month) return `${HIJRI_MONTHS[a.month - 1]} ${toBnDigits(a.year)}`;
  return `${HIJRI_MONTHS[a.month - 1]}${a.year === b.year ? "" : ` ${toBnDigits(a.year)}`} – ${HIJRI_MONTHS[b.month - 1]} ${toBnDigits(b.year)}`;
}

function Calendar() {
  const adjust = useStored(KEY, parseAdjust);
  const [today] = useState(() => noon(new Date()));
  /** months away from the current one */
  const [offset, setOffset] = useState(0);
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1, 12);
  const days = monthDays(first.getFullYear(), first.getMonth());
  const now = hijriOf(today, adjust);
  const upcoming = upcomingSpecialDays(today, adjust, 5);

  const exportDays = () => {
    const url = URL.createObjectURL(new Blob([toIcs(upcomingSpecialDays(today, adjust, 12), new Date())], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "islamic-days.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <ScreenHeader title="হিজরি ক্যালেন্ডার" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }}>
        <button type="button" aria-label="বিশেষ দিনগুলো ফোনের ক্যালেন্ডারে যোগ করুন" onClick={exportDays} className={headerButton}><Icon name="download" /></button>
      </ScreenHeader>
      <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-4">
          <p className="text-center text-[0.9375rem]">আজ {weekday.format(today)}, <b>{toBnDigits(now.day)} {HIJRI_MONTHS[now.month - 1]} {toBnDigits(now.year)} হিজরি</b><span className="block text-sm text-ink2">{gregorian.format(today)}</span></p>

          <section aria-label="মাসের ক্যালেন্ডার" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button type="button" className={nav} aria-label="আগের মাস" onClick={() => setOffset((v) => v - 1)}><Icon name="back" /></button>
              <h2 aria-live="polite" className="text-center leading-snug"><span className="block font-display text-xl font-semibold">{monthTitle.format(first)}</span><span className="block text-[0.8125rem] font-normal text-ink2">{hijriSpan(days[0], days.at(-1)!, adjust)}</span></h2>
              <button type="button" className={nav} aria-label="পরের মাস" onClick={() => setOffset((v) => v + 1)}><Icon name="chev" /></button>
            </div>
            <div className={`${card} p-2`}>
              <div aria-hidden="true" className="grid grid-cols-7 text-center text-xs text-ink2">{WEEKDAYS.map((w) => <span key={w} className="py-1.5">{w}</span>)}</div>
              <ol className="grid grid-cols-7 gap-1 text-center tabular-nums">
                {Array.from({ length: days[0].getDay() }, (_, i) => <li key={`blank${i}`} aria-hidden="true" />)}
                {days.map((date) => {
                  const hijri = hijriOf(date, adjust);
                  const isToday = date.toDateString() === today.toDateString();
                  const special = specialDay(hijri);
                  return (
                    <li key={date.getDate()} aria-current={isToday ? "date" : undefined} className={`flex min-h-13 flex-col items-center justify-center rounded-xl leading-tight ${isToday ? "bg-ac text-on-ac" : special ? "bg-gs" : date.getDay() === 5 ? "bg-ln" : ""}`}>
                      <b aria-hidden="true" className="block text-base">{toBnDigits(date.getDate())}</b>
                      <span aria-hidden="true" className={`block text-[0.6875rem] ${isToday ? "" : "text-gt"}`}>{toBnDigits(hijri.day)}</span>
                      <span className="sr-only">{gregorian.format(date)}, {toBnDigits(hijri.day)} {HIJRI_MONTHS[hijri.month - 1]}{special ? `, ${special}` : ""}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink2">
              <span className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded bg-ac" /> আজ</span>
              <span className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded bg-gs ring-1 ring-gd" /> বিশেষ দিন</span>
              <span>বড় সংখ্যা ইংরেজি, ছোটটি হিজরি তারিখ</span>
            </p>
          </section>

          <section aria-labelledby="coming">
            <h2 id="coming" className="mb-2 font-display text-lg font-semibold">আসন্ন দিন</h2>
            <ul className={`${card} px-4 py-1`}>
              {upcoming.map((u) => (
                <li key={u.date.getTime()} className="flex min-h-15 items-center gap-3.5 border-b border-ln py-1.5 last:border-0">
                  <Icon name="moon" className="size-6 shrink-0 text-gd" />
                  <span className="min-w-0 flex-1 leading-snug"><span className="block font-semibold">{u.name}</span><span className="block text-[0.8125rem] text-ink2">আনুমানিক {gregorian.format(u.date)} · চাঁদ দেখা সাপেক্ষে</span></span>
                  <span className="shrink-0 text-[0.8125rem] text-gt">{u.inDays === 0 ? "আজ" : `${toBnDigits(u.inDays)} দিন পর`}</span>
                </li>
              ))}
            </ul>
          </section>
          {offset !== 0 && <button type="button" onClick={() => setOffset(0)} className="flex min-h-13 w-full items-center justify-center rounded-full bg-gs font-semibold text-gt">আজকের তারিখে যান</button>}
          <button type="button" onClick={exportDays} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-ln2 bg-sf font-semibold text-ac"><Icon name="cal" className="size-5" /> ফোনের ক্যালেন্ডারে যোগ করুন</button>
          <p className="text-sm text-ink2">সামনের বিশেষ দিনগুলোর ফাইল (.ics) নামবে; আগের সন্ধ্যায় ফোনের ক্যালেন্ডার মনে করিয়ে দেবে। তারিখ আনুমানিক, চাঁদ দেখা অনুযায়ী মিলিয়ে নিন।</p>
        </div>

        <div className="space-y-4">
          <DateConverter today={today} adjust={adjust} />
          <section aria-labelledby="adjust" className={`${card} space-y-2 p-4`}>
            <h2 id="adjust" className="font-display font-semibold">চাঁদ দেখা অনুযায়ী সমন্বয়</h2>
            <p className="text-sm leading-relaxed text-ink2">এটি সৌদি আরবের উম্মুল কুরা হিসাব। বাংলাদেশে চাঁদ দেখা সাধারণত পরে হয়, তাই শুরুতে −১ দেওয়া আছে। প্রতি মাসে এটি বদলাতে হতে পারে। রোজা, ঈদ ও অন্য ইবাদতের তারিখে জাতীয় চাঁদ দেখা কমিটির ঘোষণাই চূড়ান্ত।</p>
            <Seg label="দিন সমন্বয়" options={ADJUST_CHOICES.map((a) => ({ value: String(a), text: signed(a) }))} value={String(adjust)} onChange={(a) => writeStored(KEY, a)} />
          </section>
        </div>
      </div>
    </>
  );
}

export function HijriCalendar() {
  return useInBrowser() ? <Calendar /> : <Skeleton className="h-96 !rounded-2xl" />;
}

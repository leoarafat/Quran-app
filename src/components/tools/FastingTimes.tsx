"use client";

import { useState } from "react";
import { toBnDigits } from "@/lib/bn";
import { calendarDay, clockTime, countdown } from "@/lib/prayer";
import { fastingTimes, nextFastingMoment, ramadanDays } from "@/lib/tools/fasting";
import { parseAdjust } from "@/lib/tools/hijri";
import { describePrefs } from "@/lib/tools/timetable";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { useNow } from "@/lib/useNow";
import { usePlace } from "@/lib/usePlace";
import { useInBrowser, useStored } from "@/lib/useStored";
import { PlaceSelect } from "./PlaceSelect";

/** the same setting as the Hijri calendar page */
const ADJUST_KEY = "noor.hijri.adjust.v1";
const shortDate = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short" });
const weekday = new Intl.DateTimeFormat("bn-BD", { weekday: "short" });
const longDate = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" });

function Inner({ now }: { now: number }) {
  const place = usePlace();
  const prefs = usePrayerPrefs();
  const adjust = useStored(ADJUST_KEY, parseAdjust);
  const [open, setOpen] = useState(false);
  const today = calendarDay(new Date(now), place.timeZone);
  const times = fastingTimes(place, today, prefs);
  const next = nextFastingMoment(place, new Date(now), prefs);
  const month = ramadanDays(today, adjust);
  const todayIndex = month.findIndex((d) => d.date.toDateString() === today.toDateString());

  return (
    <section aria-label="সেহরি ও ইফতার" className="space-y-3 rounded-[1.375rem] border border-line bg-surface p-4">
      <h2 className="font-display text-lg font-semibold">সেহরি ও ইফতার</h2>
      <PlaceSelect />
      <div className="grid grid-cols-2 gap-2 text-center">
        {([["সেহরির শেষ সময়", times.sehriEnds], ["ইফতার", times.iftar]] as const).map(([label, at]) => (
          <div key={label} className="rounded-2xl border border-line-strong py-3">
            <p className="text-sm text-muted">আজ {label}</p>
            <p className="font-display text-3xl font-bold text-accent">{clockTime(at, place.timeZone)}</p>
          </div>
        ))}
      </div>
      <p className="rounded-full bg-gold px-3 py-2 text-center font-semibold text-on-gold">
        {next.kind === "sehri" ? "সেহরি শেষ হতে" : "ইফতারের"} বাকি <span className="tabular-nums">{countdown(next.at.getTime() - now)}</span>
      </p>
      <p className="text-[0.8125rem] leading-relaxed text-muted">
        সেহরির শেষ সময় = ফজর শুরু, ইফতার = মাগরিব (সূর্যাস্ত)। {describePrefs(prefs)} অনুযায়ী হিসাব করা। সতর্কতার জন্য কয়েক মিনিট আগে সেহরি শেষ করুন, আর স্থানীয় মসজিদ বা ইসলামিক ফাউন্ডেশনের সূচির সাথে মিলিয়ে নিন।
      </p>

      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="min-h-12 w-full rounded-full border border-line-strong font-semibold text-accent">
        {todayIndex >= 0 ? "এই" : "আসন্ন"} রমজান {toBnDigits(month[0].hijri.year)}-এর সময়সূচি
      </button>
      {open && (
        <>
          <p className="text-sm text-muted">আনুমানিক শুরু {longDate.format(month[0].date)}। চাঁদ দেখার ওপর তারিখ বদলাতে পারে; তারিখ সমন্বয় করা যায় হিজরি ক্যালেন্ডার পাতায়।</p>
          <table className="w-full text-center">
            <thead className="text-sm text-muted">
              <tr><th scope="col" className="py-1 font-semibold">রোজা</th><th scope="col" className="font-semibold">তারিখ</th><th scope="col" className="font-semibold">সেহরি শেষ</th><th scope="col" className="font-semibold">ইফতার</th></tr>
            </thead>
            <tbody>
              {month.map(({ date, hijri }, i) => {
                const day = fastingTimes(place, date, prefs);
                return (
                  <tr key={date.getTime()} aria-current={i === todayIndex ? "date" : undefined} className={`border-t border-line ${i === todayIndex ? "bg-active font-semibold" : ""}`}>
                    <th scope="row" className="py-2 font-semibold">{toBnDigits(hijri.day)}</th>
                    <td className="text-sm leading-tight">{shortDate.format(date)}<span className="block text-muted">{weekday.format(date)}</span></td>
                    <td>{clockTime(day.sehriEnds, place.timeZone)}</td>
                    <td>{clockTime(day.iftar, place.timeZone)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

export function FastingTimes() {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

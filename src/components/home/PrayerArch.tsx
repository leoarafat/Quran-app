"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LocateFixed, X } from "lucide-react";
import { CITIES, clockTime, countdown, nextPrayer, PRAYERS, timesFor, calendarDay, type Place } from "@/lib/prayer";
import { describePrefs } from "@/lib/tools/timetable";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { useNow } from "@/lib/useNow";
import { savePlace, usePlace } from "@/lib/usePlace";

/** Point on the countdown arc (centre 173,190, radius 123) for a progress of 0..1. */
export function arcPoint(progress: number): { x: number; y: number } {
  const angle = Math.PI * (1 - Math.min(1, Math.max(0, progress)));
  const round = (n: number) => Math.round(n * 100) / 100;
  return { x: round(173 + 123 * Math.cos(angle)), y: round(190 - 123 * Math.sin(angle)) };
}

function PlacePicker({ place, now, onClose }: { place: Place; now: number; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const prefs = usePrayerPrefs();
  const times = timesFor(place, calendarDay(new Date(now), place.timeZone), prefs);

  const locate = () => {
    if (!navigator.geolocation) return setMessage("এই ব্রাউজারে অবস্থান পাওয়া যায় না।");
    setMessage("অবস্থান খোঁজা হচ্ছে…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        savePlace({ id: "here", name: "আমার অবস্থান", lat: coords.latitude, lng: coords.longitude, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        setMessage("আপনার অবস্থান নেওয়া হয়েছে।");
      },
      () => setMessage("অবস্থান পাওয়া যায়নি। অনুমতি দিন অথবা শহর বেছে নিন।"),
      { timeout: 15000 },
    );
  };

  const chip = (on: boolean) => `min-h-11 rounded-full border px-3 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong"}`;

  return (
    <div className="mt-3 rounded-3xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-semibold">আজকের নামাজের সময়</h2>
        <button type="button" aria-label="বন্ধ করুন" onClick={onClose} className="grid size-11 place-items-center rounded-full"><X aria-hidden className="size-5" /></button>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {PRAYERS.map(([id, name]) => (
          <div key={id} className="rounded-2xl bg-active py-2"><dt className="text-sm text-muted">{name}</dt><dd className="font-semibold">{clockTime(times[id], place.timeZone)}</dd></div>
        ))}
        <div className="rounded-2xl bg-active py-2"><dt className="text-sm text-muted">সূর্যোদয়</dt><dd className="font-semibold">{clockTime(times.sunrise, place.timeZone)}</dd></div>
      </dl>
      <p className="mb-2 mt-4 font-semibold">জায়গা বেছে নিন</p>
      <div className="grid grid-cols-3 gap-2 text-[0.9375rem]">
        {CITIES.map((c) => <button key={c.id} type="button" aria-pressed={place.id === c.id} className={chip(place.id === c.id)} onClick={() => { savePlace(c); setMessage(""); }}>{c.name}</button>)}
      </div>
      <button type="button" onClick={locate} className={`${chip(place.id === "here")} mt-2 flex w-full items-center justify-center gap-2`}>
        <LocateFixed aria-hidden className="size-5" /> আমার অবস্থান ব্যবহার করুন
      </button>
      <p role="status" className="mt-2 min-h-6 text-sm text-accent">{message}</p>
      <p className="text-sm text-muted">ফোনেই হিসাব করা ({describePrefs(prefs)})। সেহরি-ইফতারসহ আমলের আগে স্থানীয় মসজিদ বা ইসলামিক ফাউন্ডেশনের সময়ের সাথে মিলিয়ে নিন। আপনার অবস্থান এই ফোনের বাইরে যায় না।</p>
      <Link href="/prayer-times/" className="mt-3 flex min-h-11 items-center justify-center rounded-full border border-line-strong font-semibold text-accent">মাসিক সূচি, হিসাবের নিয়ম ও রিমাইন্ডার</Link>
    </div>
  );
}

export function PrayerArch() {
  const now = useNow();
  const place = usePlace();
  const prefs = usePrayerPrefs();
  const [open, setOpen] = useState(false);
  const state = now === null ? null : nextPrayer(place, new Date(now), prefs);
  const progress = state ? (now! - state.previous.at.getTime()) / (state.next.at.getTime() - state.previous.at.getTime()) : 0;
  const dot = arcPoint(progress);

  return (
    <section aria-label="পরের নামাজ">
      <div className="relative h-[15.25rem] text-on-hero">
        <svg aria-hidden="true" viewBox="0 0 346 258" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d="M1 236V130C1 82 70 56 173 2C276 56 345 82 345 130V236Q345 257 324 257H22Q1 257 1 236Z" fill="var(--hero)" stroke="var(--gold)" strokeOpacity=".55" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 346 258" className="absolute inset-0 size-full">
          <path d="M50 190A123 123 0 0 1 296 190" fill="none" stroke="#2c493d" strokeWidth="3" strokeLinecap="round" />
          {state && <path d={`M50 190A123 123 0 0 1 ${dot.x} ${dot.y}`} fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />}
          {state && <circle cx={dot.x} cy={dot.y} r="7" fill="var(--hero-accent)" />}
        </svg>
        <div className="absolute inset-x-0 top-[5.5rem] flex flex-col items-center leading-snug">
          <span className="text-sm text-hero-muted">পরের নামাজ</span>
          <span className="min-h-[2.625rem] font-display text-3xl font-bold leading-[1.4] text-hero-accent">{state?.next.name}</span>
          <span className="min-h-8 text-[1.375rem] font-semibold tabular-nums">{state && `${countdown(state.next.at.getTime() - now!)} বাকি`}</span>
        </div>
        <div className="absolute inset-x-3 bottom-1.5 flex items-center justify-between text-[0.8125rem] text-hero-muted">
          <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex min-h-11 items-center gap-1 px-2">
            {place.name} <ChevronDown aria-hidden className="size-4" /><span className="sr-only">জায়গা বদলান ও আজকের সময় দেখুন</span>
          </button>
          <span className="px-2">{state && `শুরু ${clockTime(state.next.at, place.timeZone)}`}</span>
        </div>
      </div>
      {open && now !== null && <PlacePicker place={place} now={now} onClose={() => setOpen(false)} />}
    </section>
  );
}

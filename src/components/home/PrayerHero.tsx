"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { toBnDigits } from "@/lib/bn";
import { CITIES, clockTime, countdown, nextPrayer, PRAYERS, timesFor, calendarDay, type Place } from "@/lib/prayer";
import { dayArc } from "@/lib/dayArc";
import { describePrefs } from "@/lib/tools/timetable";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { useNow } from "@/lib/useNow";
import { savePlace, usePlace } from "@/lib/usePlace";

function PlaceSheet({ place, now, onClose }: { place: Place; now: number; onClose: () => void }) {
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

  return (
    <BottomSheet title="আজকের নামাজের সময়" onClose={onClose}>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[...PRAYERS, ["sunrise", "সূর্যোদয়"] as const].map(([id, name]) => (
          <div key={id} className="rounded-md bg-gs py-2"><dt className="text-sm text-ink2">{name}</dt><dd className="font-semibold tabular-nums">{clockTime(times[id], place.timeZone)}</dd></div>
        ))}
      </dl>
      <p className="font-semibold">জায়গা বেছে নিন</p>
      <div className="grid grid-cols-3 gap-2">
        {CITIES.map((c) => <Chip key={c.id} aria-pressed={place.id === c.id} selected={place.id === c.id} onClick={() => { savePlace(c); setMessage(""); }}>{c.name}</Chip>)}
      </div>
      <Chip className="w-full" aria-pressed={place.id === "here"} selected={place.id === "here"} onClick={locate}>
        <Icon name="pin" className="size-5" /> আমার অবস্থান ব্যবহার করুন
      </Chip>
      <p role="status" className="min-h-6 text-sm text-gt">{message}</p>
      <p className="text-sm text-ink2">ফোনেই হিসাব করা ({describePrefs(prefs)})। সেহরি-ইফতারসহ আমলের আগে স্থানীয় মসজিদ বা ইসলামিক ফাউন্ডেশনের সময়ের সাথে মিলিয়ে নিন। আপনার অবস্থান এই ফোনের বাইরে যায় না।</p>
      <Link href="/prayer-times/" className="flex min-h-12 items-center justify-center rounded-full border border-ln2 font-semibold text-ac">মাসিক সূচি, হিসাবের নিয়ম ও রিমাইন্ডার</Link>
    </BottomSheet>
  );
}

/** "০০:২৮:১৪" */
const clockLeft = (ms: number) => countdown(ms).padStart(8, "০");

export function PrayerHero() {
  const now = useNow();
  const place = usePlace();
  const prefs = usePrayerPrefs();
  const [open, setOpen] = useState(false);
  const state = now === null ? null : nextPrayer(place, new Date(now), prefs);
  const left = state ? state.next.at.getTime() - now! : 0;
  const progress = state ? (now! - state.previous.at.getTime()) / (state.next.at.getTime() - state.previous.at.getTime()) : 0;
  const arc = dayArc(progress);
  // The day the next prayer belongs to: after Esha the row shows tomorrow's times.
  const day = state ? timesFor(place, calendarDay(state.next.at, place.timeZone), prefs) : null;
  const strip = [PRAYERS[0], ["sunrise", "সূর্যোদয়"] as const, ...PRAYERS.slice(1)];
  const minutes = Math.ceil(left / 60_000);

  return (
    <section aria-label="পরের নামাজ" className="on-deep relative overflow-hidden rounded-lg bg-hero px-5 pb-4 pt-3 text-on-hero shadow-[0_20px_40px_-20px_rgba(6,19,14,0.6)] md:px-7 md:pt-5">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full opacity-5">
        <defs>
          <pattern id="hero-pattern" width="44" height="44" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#fff"><rect x="10" y="10" width="24" height="24" /><rect x="10" y="10" width="24" height="24" transform="rotate(45 22 22)" /><circle cx="22" cy="22" r="5" /></g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-pattern)" />
      </svg>

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-hero-muted">পরের নামাজ</span>
          <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className="-mr-2 flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[0.8125rem] font-medium">
            <Icon name="pin" className="size-[1.125rem]" /> {place.name} · বদলান
          </button>
        </div>

        <div className="md:flex md:items-center md:gap-10">
          <div className="md:min-w-0 md:flex-1">
            <div className="flex items-baseline justify-between gap-3 md:justify-start md:gap-4">
              <span className="min-h-[3.375rem] font-display text-[2.5rem] font-bold leading-[1.35] md:text-5xl md:leading-[1.4]">{state?.next.name ?? <Skeleton className="mt-2 h-9 w-24 !bg-white/15" />}</span>
              <span className="text-xl font-semibold tabular-nums text-hero-accent">{state && clockTime(state.next.at, place.timeZone)}</span>
            </div>
            <p className="text-[0.9375rem] text-hero-muted">শুরু হতে বাকি</p>
            <p aria-hidden="true" className="min-h-[3.3rem] text-[2.75rem] font-semibold leading-[1.2] tabular-nums md:text-[3.5rem]">{state && clockLeft(left)}</p>
            {/* Spoken once a minute, not every second. */}
            <p aria-live="polite" className="sr-only">{state && `${state.next.name} শুরু হতে ${toBnDigits(Math.floor(minutes / 60))} ঘণ্টা ${toBnDigits(minutes % 60)} মিনিট বাকি`}</p>
          </div>

          <div className="mt-1.5 md:w-[26rem] md:max-w-[48%]">
            <svg viewBox="0 0 326 78" className="block w-full" role="img" aria-label={state ? `${state.previous.name} থেকে ${state.next.name}-এর পথে অগ্রগতি` : "নামাজের মাঝের অগ্রগতি"}>
              <path d={arc.whole} fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
              {state && <path d={arc.done} fill="none" stroke="var(--hero-accent)" strokeWidth="2.5" strokeLinecap="round" />}
              {state && <circle cx={arc.x} cy={arc.y} r="7" fill="var(--hero-accent)" />}
              {state && <circle cx={arc.x} cy={arc.y} r="11.5" fill="none" stroke="var(--hero-accent)" strokeOpacity=".35" />}
            </svg>
            <div className="flex justify-between text-[0.6875rem] text-hero-muted">
              <span>{state && `${state.previous.name} ${clockTime(state.previous.at, place.timeZone)}`}</span>
              <span>{state && `${state.next.name} ${clockTime(state.next.at, place.timeZone)}`}</span>
            </div>
          </div>
        </div>

        <ul className="mt-3 flex justify-between border-t border-white/15 pt-3 text-center md:grid md:grid-cols-6">
          {strip.map(([id, name]) => {
            const isNext = state?.next.id === id;
            return (
              <li key={id} aria-current={isNext ? "time" : undefined} className={`text-xs leading-normal md:text-[0.8125rem] ${isNext ? "text-hero-accent" : "text-hero-muted"} ${id === "sunrise" ? "hidden md:block" : ""}`}>
                {name}
                <b className={`block min-h-5 text-sm tabular-nums md:text-[1.0625rem] ${isNext ? "font-bold" : "font-semibold text-on-hero"}`}>{day && clockTime(day[id], place.timeZone)}</b>
              </li>
            );
          })}
        </ul>
      </div>
      {open && now !== null && <PlaceSheet place={place} now={now} onClose={() => setOpen(false)} />}
    </section>
  );
}

"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { DateLine } from "@/components/home/Greeting";
import { toBnDigits } from "@/lib/bn";
import { clockTime, countdown, nextPrayer, PRAYERS, timesFor, calendarDay } from "@/lib/prayer";
import { dayArc } from "@/lib/dayArc";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { useNow } from "@/lib/useNow";
import { usePlace } from "@/lib/usePlace";
import { PlaceSheet } from "@/components/tools/PlaceSheet";

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

  const arcLine = state ? arc : null;
  const placeButton = (className: string) => (
    <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className={`flex min-h-11 items-center gap-1.5 ${className}`}>
      <Icon name="pin" className="size-4" /> {place.name} · বদলান
    </button>
  );

  return (
    <section aria-label="পরের নামাজ" className="on-deep text-on-hero md:rounded-[1.75rem] md:bg-hero md:px-7 md:pb-5 md:pt-6">
      {/* Spoken once a minute, not every second. */}
      <p aria-live="polite" className="sr-only">{state && `${state.next.name} শুরু হতে ${toBnDigits(Math.floor(minutes / 60))} ঘণ্টা ${toBnDigits(minutes % 60)} মিনিট বাকি`}</p>

      {/* Phones: everything centred under the title bar. */}
      <div className="flex flex-col items-center text-center md:hidden">
        {placeButton("text-[0.8125rem] text-hero-muted")}
        <p className="min-h-6 text-hero-muted">পরের নামাজ <strong className="text-hero-accent">{state && `${state.next.name} · ${clockTime(state.next.at, place.timeZone)}`}</strong></p>
        <p aria-hidden="true" className="min-h-[4.7rem] font-display text-[3.75rem] font-semibold leading-tight tabular-nums">{state ? clockLeft(left) : <Skeleton className="mt-4 h-11 w-56 !bg-white/15" />}</p>
        <p className="min-h-5 text-[0.8125rem] text-hero-muted"><DateLine hijriFirst /></p>
      </div>

      <div className="hidden flex-wrap items-end justify-between gap-6 md:flex">
        <div>
          <p className="text-hero-muted">পরের নামাজ</p>
          <div className="flex min-h-[3.4rem] items-baseline gap-3.5">
            <span className="font-display text-[2.75rem] font-bold leading-tight">{state?.next.name ?? <Skeleton className="h-9 w-24 !bg-white/15" />}</span>
            <span className="text-2xl font-semibold text-hero-accent">{state && clockTime(state.next.at, place.timeZone)}</span>
          </div>
          <p aria-hidden="true" className="min-h-[5rem] font-display text-[4.5rem] font-semibold leading-[1.1] tabular-nums">{state && clockLeft(left)}</p>
          <p className="text-hero-muted">শুরু হতে বাকি</p>
        </div>
        <div className="flex max-w-[23.75rem] flex-[1_1_15rem] flex-col items-end gap-3">
          {placeButton("rounded-full border border-white/25 px-4 text-sm")}
          <svg viewBox="0 0 326 78" className="block w-full" role="img" aria-label={state ? `${state.previous.name} থেকে ${state.next.name}-এর পথে অগ্রগতি` : "নামাজের মাঝের অগ্রগতি"}>
            <path d={arc.whole} fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="2" strokeDasharray="3 7" />
            {arcLine && <path d={arcLine.done} fill="none" stroke="var(--hero-accent)" strokeWidth="3" strokeLinecap="round" />}
            {arcLine && <circle cx={arcLine.x} cy={arcLine.y} r="13" fill="var(--hero-accent)" opacity=".2" />}
            {arcLine && <circle cx={arcLine.x} cy={arcLine.y} r="6.5" fill="var(--hero-accent)" />}
          </svg>
          <div className="flex w-full justify-between text-[0.8125rem] text-hero-muted">
            <span>{state && `${state.previous.name} ${clockTime(state.previous.at, place.timeZone)}`}</span>
            <span>{state && `${state.next.name} ${clockTime(state.next.at, place.timeZone)}`}</span>
          </div>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-5 gap-1.5 text-center md:mt-6 md:grid-cols-6 md:gap-2">
        {strip.map(([id, name]) => {
          const isNext = state?.next.id === id;
          return (
            <li key={id} aria-current={isNext ? "time" : undefined} className={`rounded-2xl py-2.5 leading-normal md:rounded-[0.875rem] ${isNext ? "bg-gold text-on-gold" : "bg-hero-tile"} ${id === "sunrise" ? "hidden md:block" : ""}`}>
              <span className="block text-xs md:text-[0.8125rem]">{name}</span>
              <b className="block min-h-6 text-base font-semibold tabular-nums md:text-[1.1875rem]">{day && clockTime(day[id], place.timeZone)}</b>
            </li>
          );
        })}
      </ul>
      {open && <PlaceSheet onClose={() => setOpen(false)} />}
    </section>
  );
}

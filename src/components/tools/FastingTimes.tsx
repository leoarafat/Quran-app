"use client";

import { useState } from "react";
import { HeroCard } from "@/components/ui/HeroCard";
import { LinkList } from "@/components/ui/LinkList";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import { toBnDigits } from "@/lib/bn";
import { calendarDay, clockTime, countdown } from "@/lib/prayer";
import { fastingTimes, nextFastingMoment, ramadanDays } from "@/lib/tools/fasting";
import { EMPTY_FASTS, FASTS_KEY, readFasts } from "@/lib/tools/fastlog";
import { parseAdjust } from "@/lib/tools/hijri";
import { dayKey } from "@/lib/tools/routine";
import { describePrefs } from "@/lib/tools/timetable";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { useNow } from "@/lib/useNow";
import { usePlace } from "@/lib/usePlace";
import { useInBrowser, useStored } from "@/lib/useStored";
import { useSaveFast } from "./useSaveFast";
import { PlaceButton } from "./PlaceSheet";

/** the same setting as the Hijri calendar page */
const ADJUST_KEY = "noor.hijri.adjust.v1";
const shortDate = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short" });
const weekday = new Intl.DateTimeFormat("bn-BD", { weekday: "short" });
const longDate = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric" });
const parseFasts = (raw: string | null) => (raw === null ? EMPTY_FASTS : (readFasts(raw) ?? EMPTY_FASTS));
const card = "rounded-md border border-ln bg-sf shadow-card";

function Inner({ now }: { now: number }) {
  const place = usePlace();
  const prefs = usePrayerPrefs();
  const adjust = useStored(ADJUST_KEY, parseAdjust);
  const fasts = useStored(FASTS_KEY, parseFasts);
  const toggle = useSaveFast();
  const [open, setOpen] = useState(false);
  const today = calendarDay(new Date(now), place.timeZone);
  const times = fastingTimes(place, today, prefs);
  const next = nextFastingMoment(place, new Date(now), prefs);
  const month = ramadanDays(today, adjust);
  const todayIndex = month.findIndex((d) => d.date.toDateString() === today.toDateString());
  const year = toBnDigits(month[0].hijri.year);
  const todayKey = dayKey(today);

  return (
    <div className="space-y-4">
      <OfflineBanner>সেহরি ও ইফতারের সময় ফোনেই হিসাব হয়, তাই ঠিক থাকে।</OfflineBanner>
      <PlaceButton />
      <HeroCard label="সেহরি ও ইফতার">
        <p className="text-[0.8125rem] text-hero-muted">{todayIndex >= 0 ? `রমজান ${year} · দিন ${toBnDigits(month[todayIndex].hijri.day)}` : `আসন্ন রমজান ${year} · আনুমানিক ${longDate.format(month[0].date)}`}</p>
        <dl className="mt-2 grid grid-cols-2 gap-3">
          <div><dt className="text-[0.8125rem] text-hero-muted">আজ সেহরির শেষ সময়</dt><dd className="text-2xl font-semibold tabular-nums">{clockTime(times.sehriEnds, place.timeZone)}</dd></div>
          <div><dt className="text-[0.8125rem] text-hero-accent">আজ ইফতার</dt><dd className="text-2xl font-semibold tabular-nums text-hero-accent">{clockTime(times.iftar, place.timeZone)}</dd></div>
        </dl>
        <p aria-hidden="true" className="mt-2 text-[2.75rem] font-semibold leading-tight tabular-nums">{countdown(next.at.getTime() - now).padStart(8, "০")}</p>
        <p className="text-[0.8125rem] text-hero-muted">{next.kind === "sehri" ? "সেহরি শেষ হতে বাকি" : "ইফতারের বাকি"}</p>
      </HeroCard>
      <p className="text-[0.8125rem] leading-relaxed text-ink2">
        সেহরির শেষ সময় = ফজর শুরু, ইফতার = মাগরিব (সূর্যাস্ত)। {describePrefs(prefs)} অনুযায়ী হিসাব করা। সতর্কতার জন্য কয়েক মিনিট আগে সেহরি শেষ করুন, আর স্থানীয় মসজিদ বা ইসলামিক ফাউন্ডেশনের সূচির সাথে মিলিয়ে নিন।
      </p>

      {/* The circles fill only once Ramadan has days to tick. */}
      {todayIndex >= 0 && (
        <section aria-labelledby="tracker">
          <h2 id="tracker" className="mb-2 font-display text-lg font-semibold">রোজার হিসাব</h2>
          <ul className="grid grid-cols-6 gap-1 min-[26rem]:grid-cols-10">
            {month.map(({ date, hijri }) => {
              const key = dayKey(date);
              const done = fasts.days.includes(key);
              return (
                <li key={key} className="grid place-items-center">
                  <button type="button" role="checkbox" aria-checked={done} aria-label={`রোজা ${toBnDigits(hijri.day)}`} disabled={key > todayKey} onClick={() => toggle(key)} className="grid size-11 place-items-center rounded-full disabled:opacity-45">
                    <span className={`grid size-8 place-items-center rounded-full text-xs tabular-nums ${done ? "bg-gold font-bold text-on-gold" : key === todayKey ? "border-[1.5px] border-ac bg-sf" : "bg-ln"}`}>{toBnDigits(hijri.day)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <LinkList
        items={[
          { href: "/amal/fasting/", title: "রোজার খাতা", hint: "কোন দিন রোজা রাখলেন", icon: "note" },
          { href: "/amal/khatm/", title: "রমজানের খতম", hint: "দৈনিক পৃষ্ঠার লক্ষ্য ও অগ্রগতি", icon: "mushaf" },
          { href: "/calendar/", title: "হিজরি ক্যালেন্ডার", hint: "রমজান ও ঈদের তারিখ (আনুমানিক)", icon: "cal" },
        ]}
      />

      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="min-h-12 w-full rounded-full border border-ln2 bg-sf font-semibold text-ac">
        {todayIndex >= 0 ? "এই" : "আসন্ন"} রমজান {year}-এর সময়সূচি
      </button>
      {open && (
        <>
          <p className="text-sm text-ink2">আনুমানিক শুরু {longDate.format(month[0].date)}। চাঁদ দেখার ওপর তারিখ বদলাতে পারে; তারিখ সমন্বয় করা যায় হিজরি ক্যালেন্ডার পাতায়।</p>
          <div className={`${card} overflow-clip`}>
            <table className="w-full text-center tabular-nums">
              <thead className="bg-rail text-sm">
                <tr><th scope="col" className="py-2 font-semibold">রোজা</th><th scope="col" className="font-semibold">তারিখ</th><th scope="col" className="font-semibold">সেহরি শেষ</th><th scope="col" className="font-semibold">ইফতার</th></tr>
              </thead>
              <tbody>
                {month.map(({ date, hijri }, i) => {
                  const day = fastingTimes(place, date, prefs);
                  return (
                    <tr key={date.getTime()} aria-current={i === todayIndex ? "date" : undefined} className={`border-t border-ln ${i === todayIndex ? "bg-gs font-semibold" : ""}`}>
                      <th scope="row" className="py-2 font-semibold">{toBnDigits(hijri.day)}</th>
                      <td className="text-sm leading-tight">{shortDate.format(date)}<span className="block text-ink2">{weekday.format(date)}</span></td>
                      <td>{clockTime(day.sehriEnds, place.timeZone)}</td>
                      <td>{clockTime(day.iftar, place.timeZone)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function FastingTimes() {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} /> : <Skeleton className="h-52 !rounded-3xl" />;
}

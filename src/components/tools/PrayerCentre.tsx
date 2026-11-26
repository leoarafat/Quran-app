"use client";

import { useState } from "react";
import { headerButton, ScreenHeader } from "@/components/shell/ScreenHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { HeroCard } from "@/components/ui/HeroCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { Seg } from "@/components/ui/Seg";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { Switch } from "@/components/ui/Toggle";
import { toBnDigits } from "@/lib/bn";
import { calendarDay, clockTime, countdown, nextPrayer, PRAYERS, timesFor, type PrayerId } from "@/lib/prayer";
import { ADJUST_LIMIT, DEFAULT_PRAYER_PREFS, METHODS, PRAYER_PREFS_KEY, type PrayerPrefs } from "@/lib/prayerPrefs";
import { HIJRI_MONTHS, hijriOf, parseAdjust } from "@/lib/tools/hijri";
import { BEFORE_CHOICES, parseReminder, REMINDER_KEY, reminds, setPrayerReminder, type Reminder } from "@/lib/tools/reminders";
import { COLUMNS, dayRow, monthDays, toCsv } from "@/lib/tools/timetable";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { usePlace } from "@/lib/usePlace";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";
import { PlaceButton, PlaceSheet } from "./PlaceSheet";

const monthName = new Intl.DateTimeFormat("bn-BD", { month: "long", year: "numeric" });
const dayName = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long" });
const card = "rounded-md border border-ln bg-sf shadow-card";
const select = "min-h-11 rounded-xl border border-ln2 bg-bg px-2 text-ink";
const round = "grid size-11 shrink-0 place-items-center rounded-full border border-ln2 text-ac disabled:opacity-35";

const saveReminder = (next: Reminder) => writeStored(REMINDER_KEY, JSON.stringify(next));
const savePrefs = (next: PrayerPrefs) => writeStored(PRAYER_PREFS_KEY, JSON.stringify(next));

const ROWS = [PRAYERS[0], ["sunrise", "সূর্যোদয়"] as const, ...PRAYERS.slice(1)];

function MethodSheet({ prefs, onClose }: { prefs: PrayerPrefs; onClose: () => void }) {
  const shift = (id: keyof PrayerPrefs["adjust"], by: number) => savePrefs({ ...prefs, adjust: { ...prefs.adjust, [id]: prefs.adjust[id] + by } });
  return (
    <BottomSheet title="হিসাবের নিয়ম" onClose={onClose}>
      <label className="flex flex-col gap-1 text-sm text-ink2">পদ্ধতি
        <select className={`${select} min-h-12 text-base`} value={prefs.method} onChange={(e) => savePrefs({ ...prefs, method: METHODS.find(([id]) => id === e.target.value)![0] })}>
          {METHODS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      <Seg label="আসরের সময়" options={[{ value: "hanafi", text: "হানাফি আসর" }, { value: "shafi", text: "শাফেয়ি আসর" }]} value={prefs.asr} onChange={(asr) => savePrefs({ ...prefs, asr })} />
      <div>
        <p className="font-semibold">মিনিট সমন্বয়</p>
        <p className="text-sm text-ink2">স্থানীয় সূচির সাথে মিলাতে</p>
        <ul>
          {COLUMNS.map(([id, name]) => (
            <li key={id} className="flex min-h-13 items-center gap-2 border-b border-ln last:border-0">
              <span className="flex-1">{name}</span>
              <button type="button" className={round} aria-label={`${name} ১ মিনিট কমান`} disabled={prefs.adjust[id] <= -ADJUST_LIMIT} onClick={() => shift(id, -1)}><Icon name="minus" className="size-4" /></button>
              <span className="w-16 text-center tabular-nums">{prefs.adjust[id] > 0 ? "+" : prefs.adjust[id] < 0 ? "−" : ""}{toBnDigits(Math.abs(prefs.adjust[id]))} মি.</span>
              <button type="button" className={round} aria-label={`${name} ১ মিনিট বাড়ান`} disabled={prefs.adjust[id] >= ADJUST_LIMIT} onClick={() => shift(id, 1)}><Icon name="plus" className="size-4" /></button>
            </li>
          ))}
        </ul>
      </div>
      <Chip className="w-full" onClick={() => savePrefs(DEFAULT_PRAYER_PREFS)}>আগের (ডিফল্ট) নিয়মে ফিরুন</Chip>
    </BottomSheet>
  );
}

function RowButton({ icon, title, value, onClick }: { icon: IconName; title: string; value: string; onClick: () => void }) {
  return (
    <button type="button" aria-haspopup="dialog" onClick={onClick} className="flex min-h-15 w-full items-center gap-3.5 border-b border-ln py-1.5 text-left last:border-0">
      <Icon name={icon} className="size-6 shrink-0 text-ac" />
      <span className="min-w-0 flex-1 leading-snug"><span className="block font-semibold">{title}</span><span className="block text-[0.8125rem] text-ink2">{value}</span></span>
      <Icon name="chev" className="size-5 shrink-0 text-ink2" />
    </button>
  );
}

function Inner({ now }: { now: number }) {
  const place = usePlace();
  const prefs = usePrayerPrefs();
  const reminder = useStored(REMINDER_KEY, parseReminder);
  const adjustHijri = useStored("noor.hijri.adjust.v1", parseAdjust);
  const [offset, setOffset] = useState(0);
  const [sheet, setSheet] = useState<"method" | "place" | null>(null);
  const [message, setMessage] = useState("");
  const today = calendarDay(new Date(now), place.timeZone);
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1, 12);
  const days = monthDays(first.getFullYear(), first.getMonth());
  const times = timesFor(place, today, prefs);
  const state = nextPrayer(place, new Date(now), prefs);
  // Fajr's time ends at sunrise, so nothing is "running" between sunrise and Dhuhr.
  const running = state.previous.id === "fajr" && now >= times.sunrise.getTime() ? null : state.previous;
  const hijri = hijriOf(today, adjustHijri);
  const method = METHODS.find(([id]) => id === prefs.method)![1];
  const asr = prefs.asr === "hanafi" ? "হানাফি" : "শাফেয়ি";

  const toggle = async (id: PrayerId, name: string, on: boolean) => {
    setMessage("");
    if (on) {
      if (typeof Notification === "undefined") return setMessage("এই ব্রাউজারে নোটিফিকেশন নেই। iPhone-এ আগে হোম স্ক্রিনে ইনস্টল করতে হয়।");
      const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") return setMessage("নোটিফিকেশনের অনুমতি পাওয়া যায়নি। ব্রাউজারের সাইট-সেটিংস থেকে অনুমতি দিন।");
    }
    saveReminder(setPrayerReminder(reminder, id, on));
    showToast(on ? `${name}ের রিমাইন্ডার চালু হলো। অ্যাপ খোলা থাকলে আসবে।` : `${name}ের রিমাইন্ডার বন্ধ হলো`);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(place, days, prefs)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `namaz-${place.id}-${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <ScreenHeader title="নামাজের সময়" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }}>
        <button type="button" aria-label="হিসাবের নিয়ম" aria-haspopup="dialog" onClick={() => setSheet("method")} className={headerButton}><Icon name="settings" /></button>
      </ScreenHeader>

      <div className="space-y-4 md:space-y-5">
        <OfflineBanner>সময় ফোনেই হিসাব হয়, তাই ইন্টারনেট ছাড়াও ঠিক থাকে।</OfflineBanner>
        <div className="flex items-center justify-between gap-3 print:hidden">
          <PlaceButton />
          <p className="text-right text-[0.8125rem] leading-snug text-ink2">{dayName.format(today)} · {toBnDigits(hijri.day)} {HIJRI_MONTHS[hijri.month - 1]}</p>
        </div>

        <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:items-start lg:gap-5 lg:space-y-0">
          <div className="space-y-4 print:hidden">
            <HeroCard label="পরের নামাজ">
              <p className="min-h-6 text-[0.8125rem] text-hero-muted">{running ? `এখন চলছে: ${running.name}` : place.name}</p>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-display text-[1.75rem] font-bold leading-snug">পরের: {state.next.name}</p>
                <p aria-hidden="true" className="text-[2rem] font-semibold leading-snug tabular-nums text-hero-accent">{countdown(state.next.at.getTime() - now).padStart(8, "০")}</p>
              </div>
              <p className="sr-only">{state.next.name} শুরু {clockTime(state.next.at, place.timeZone)}</p>
            </HeroCard>

            <section aria-label="আজকের সময়" className={`${card} overflow-hidden`}>
              <ul>
                {ROWS.map(([id, name]) => {
                  const next = state.next.id === id;
                  const current = running?.id === id;
                  return (
                    <li key={id} aria-current={next ? "time" : undefined} className={`flex min-h-15 items-center gap-3 border-b border-ln px-4 last:border-0 ${next ? "bg-gs" : ""}`}>
                      <span className={`flex-1 font-semibold ${next ? "text-gt" : ""}`}>
                        {name}
                        {current && <span className="ml-2 rounded-full bg-ac px-2.5 py-0.5 text-xs font-semibold text-on-ac">এখন</span>}
                        {next && <span className="ml-2 rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-on-gold">পরে</span>}
                      </span>
                      <b className="text-lg tabular-nums">{clockTime(times[id], place.timeZone)}</b>
                      {id === "sunrise" ? <span aria-hidden="true" className="w-[3.25rem]" /> : <Switch label={`${name}ের রিমাইন্ডার`} checked={reminds(reminder, id)} onChange={(on) => void toggle(id, name, on)} />}
                    </li>
                  );
                })}
              </ul>
            </section>
            <p role="alert" className="text-sm text-gt empty:hidden">{message}</p>

            <section aria-label="নিয়ম ও রিমাইন্ডার" className={`${card} px-4`}>
              <RowButton icon="settings" title="গণনা পদ্ধতি" value={`${method} · আসর: ${asr}`} onClick={() => setSheet("method")} />
              <RowButton icon="pin" title="লোকেশন" value={place.name} onClick={() => setSheet("place")} />
              <label className="flex min-h-15 items-center gap-3.5 py-1.5">
                <Icon name="bell" className="size-6 shrink-0 text-ac" />
                <span className="min-w-0 flex-1 font-semibold leading-snug">রিমাইন্ডার কখন</span>
                <select className={`${select} max-w-[55%] text-sm`} value={reminder.before} onChange={(e) => saveReminder({ ...reminder, before: Number(e.target.value) })}>
                  {BEFORE_CHOICES.map((m) => <option key={m} value={m}>{m === 0 ? "ওয়াক্ত শুরুতে" : `${toBnDigits(m)} মিনিট আগে`}</option>)}
                </select>
              </label>
            </section>
            <p className="text-[0.8125rem] leading-relaxed text-ink2">রিমাইন্ডার আসবে শুধু অ্যাপ খোলা বা পেছনে চালু থাকলে। অ্যাপ বন্ধ থাকলে বা ফোন ঘুমিয়ে গেলে আসবে না। এটি আজান বা অ্যালার্মের বিকল্প নয়।</p>
          </div>

          <section aria-label="মাসিক সূচি" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <button type="button" className={`${round} print:hidden`} aria-label="আগের মাস" onClick={() => setOffset((v) => v - 1)}><Icon name="back" className="size-5" /></button>
              <h2 aria-live="polite" className="text-center font-display text-lg font-semibold">মাসিক সময়সূচি · {monthName.format(first)}</h2>
              <button type="button" className={`${round} print:hidden`} aria-label="পরের মাস" onClick={() => setOffset((v) => v + 1)}><Icon name="chev" className="size-5" /></button>
            </div>
            <p className="hidden text-center print:block">{place.name} · {method} · {asr} আসর</p>
            <div className={`${card} overflow-clip print:border-0 print:shadow-none`}>
              <table className="w-full text-center text-[0.8125rem] tabular-nums">
                <thead className="sticky top-[calc(var(--header-h)+var(--safe-top))] z-10 bg-rail text-xs md:text-[0.8125rem]">
                  <tr><th scope="col" className="py-2.5">তারিখ</th>{COLUMNS.map(([id, name]) => <th key={id} scope="col" className="font-semibold">{name}</th>)}</tr>
                </thead>
                <tbody>
                  {days.map((d) => {
                    const isToday = d.toDateString() === today.toDateString();
                    return (
                      <tr key={d.getDate()} aria-current={isToday ? "date" : undefined} className={`border-t border-ln ${isToday ? "bg-gs font-bold" : ""}`}>
                        <th scope="row" className="py-2">{toBnDigits(d.getDate())}</th>
                        {dayRow(place, d, prefs).map((value, i) => <td key={i}>{value}</td>)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-2 gap-2 print:hidden">
              <Chip className="text-ac" onClick={download}><Icon name="download" className="size-4" /> CSV ডাউনলোড</Chip>
              <Chip className="text-ac" onClick={() => window.print()}>প্রিন্ট / PDF</Chip>
            </div>
          </section>
        </div>
        <p className="text-sm text-ink2 print:hidden">সময় ফোনেই হিসাব করা। আমলের আগে স্থানীয় মসজিদ বা ইসলামিক ফাউন্ডেশনের সূচির সাথে মিলিয়ে নিন।</p>
      </div>
      {sheet === "method" && <MethodSheet prefs={prefs} onClose={() => setSheet(null)} />}
      {sheet === "place" && <PlaceSheet onClose={() => setSheet(null)} />}
    </>
  );
}

export function PrayerCentre() {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} /> : (
    <>
      <ScreenHeader title="নামাজের সময়" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <div className="space-y-4"><Skeleton className="h-28 !rounded-3xl" /><Skeleton className="h-96 !rounded-2xl" /></div>
    </>
  );
}

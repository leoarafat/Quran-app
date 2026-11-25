"use client";

import { useState } from "react";
import { ButtonRow, LinkRow, rowCard, SelectRow, StaticRow } from "@/components/settings/rows";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Seg } from "@/components/ui/Seg";
import { Toggle } from "@/components/ui/Toggle";
import { setOptions, setReciter, usePlayer } from "@/lib/audio/player";
import { RECITERS } from "@/lib/audio/reciters";
import { RATE_CHOICES } from "@/lib/audio/sequence";
import { toBnDigits } from "@/lib/bn";
import { CITIES } from "@/lib/prayer";
import { METHODS, PRAYER_PREFS_KEY, type PrayerPrefs } from "@/lib/prayerPrefs";
import { BN_FONT_LABELS, LINE_GAPS, LINE_HEIGHTS, parseReaderPrefs, READER_KEY, toggleLayer, type LineGap, type ReaderPrefs } from "@/lib/reader/prefs";
import type { Ayah } from "@/lib/quran/types";
import { BN_FONTS, SCALE_MAX, SCALE_MIN, THEME_CHOICES, THEME_LABELS, type ThemeChoice } from "@/lib/settings";
import { parseReminder, REMINDER_KEY } from "@/lib/tools/reminders";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { savePlace, usePlace } from "@/lib/usePlace";
import { updateSettings, useSettings } from "@/lib/useSettings";
import { useStored, writeStored } from "@/lib/useStored";

const GAP_LABELS: Record<LineGap, string> = { tight: "কম", normal: "মাঝারি", wide: "বেশি" };
const CHOICE_LABELS: Record<ThemeChoice, string> = { system: "সিস্টেম", ...THEME_LABELS };

const SECTIONS = [
  ["theme", "থিম"], ["reading", "কুরআন পঠন"], ["audio", "অডিও"], ["prayer", "নামাজ ও আযান"], ["app", "অ্যাপ"],
] as const;
type SectionId = (typeof SECTIONS)[number][0];

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm"><span>{label}</span><b className="tabular-nums">{toBnDigits(Math.round(value * 100))}%</b></span>
      <input type="range" aria-label={label} min={SCALE_MIN} max={SCALE_MAX} step={0.1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="slider h-11 w-full" style={{ "--filled": `${((value - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100}%` } as React.CSSProperties} />
    </label>
  );
}

function Typography() {
  const settings = useSettings();
  return (
    <div className="space-y-4">
      <Slider label="আরবি লেখার সাইজ" value={settings.arScale} onChange={(arScale) => updateSettings({ arScale })} />
      <Slider label="কুরআনের বাংলা লেখার সাইজ" value={settings.bnScale} onChange={(bnScale) => updateSettings({ bnScale })} />
      <div className="space-y-2">
        <p className="text-sm">কুরআনের বাংলা ফন্ট</p>
        <Seg label="কুরআনের বাংলা ফন্ট" options={BN_FONTS.map((f) => ({ value: f, text: BN_FONT_LABELS[f] }))} value={settings.bnFont} onChange={(bnFont) => updateSettings({ bnFont })} />
      </div>
    </div>
  );
}

/** `sample` is the ayah shown while choosing; it comes from the Quran data. */
export function SettingsForm({ sample }: { sample: Ayah }) {
  const settings = useSettings();
  const reader = useStored(READER_KEY, parseReaderPrefs);
  const saveReader = (next: ReaderPrefs) => writeStored(READER_KEY, JSON.stringify(next));
  const player = usePlayer();
  const prayer = usePrayerPrefs();
  const savePrayer = (next: PrayerPrefs) => writeStored(PRAYER_PREFS_KEY, JSON.stringify(next));
  const place = usePlace();
  const reminder = useStored(REMINDER_KEY, parseReminder);
  const [typography, setTypography] = useState(false);
  const [located, setLocated] = useState("");
  const [open, setOpen] = useState<SectionId>("theme");

  const places = [...CITIES.map((c) => c.id), "here"];
  const placeName = (id: string) => (id === "here" ? "আমার অবস্থান" : CITIES.find((c) => c.id === id)!.name);
  const choosePlace = (id: string) => {
    setLocated("");
    if (id !== "here") return savePlace(CITIES.find((c) => c.id === id)!);
    if (!navigator.geolocation) return setLocated("এই ব্রাউজারে অবস্থান পাওয়া যায় না।");
    setLocated("অবস্থান খোঁজা হচ্ছে…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        savePlace({ id: "here", name: "আমার অবস্থান", lat: coords.latitude, lng: coords.longitude, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        setLocated("আপনার অবস্থান নেওয়া হয়েছে। অবস্থান এই ফোনের বাইরে যায় না।");
      },
      () => setLocated("অবস্থান পাওয়া যায়নি। অনুমতি দিন অথবা শহর বেছে নিন।"),
      { timeout: 15000 },
    );
  };

  /** Phones show every section; wide screens show the one chosen in the side list. */
  const section = (id: SectionId, title: string, children: React.ReactNode) => (
    <section id={`set-${id}`} aria-labelledby={`set-${id}-title`} className={`space-y-2.5 ${open === id ? "" : "lg:hidden"}`}>
      <h2 id={`set-${id}-title`} className="font-display text-base font-semibold text-ink2 lg:text-2xl lg:text-ink">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      <nav aria-label="সেটিংসের বিভাগ" className="hidden self-start border-r border-ln pr-4 lg:sticky lg:top-[calc(var(--header-h)+var(--safe-top)+1.5rem)] lg:block">
        <ul className="space-y-1">
          {SECTIONS.map(([id, title]) => (
            <li key={id}><button type="button" aria-current={open === id ? "true" : undefined} onClick={() => setOpen(id)} className={`flex min-h-11 w-full items-center rounded-xl px-3 text-left text-[0.9375rem] ${open === id ? "bg-ac/10 font-semibold" : "text-ink2 hover:bg-ln"}`}>{title}</button></li>
          ))}
        </ul>
      </nav>

      <div className="max-w-2xl space-y-6">
        {section("theme", "থিম", (
          <>
            <Seg label="থিম" options={THEME_CHOICES.map((t) => ({ value: t, text: CHOICE_LABELS[t] }))} value={settings.theme} onChange={(theme) => updateSettings({ theme })} />
            <p className="text-[0.8125rem] text-ink2">“সিস্টেম” রাখলে ফোনের হালকা বা গাঢ় থিম অনুযায়ী কাগজ বা রাত চলবে।</p>
          </>
        ))}

        {section("reading", "কুরআন পঠন", (
          <>
            <div className="rounded-md border border-ln bg-sf px-4 py-3 shadow-card" style={{ "--ar-lh": LINE_HEIGHTS[reader.lineGap] } as React.CSSProperties}>
              <p lang="ar" dir="rtl" className="font-arabic text-[calc(1.9375rem*var(--ar-scale))] leading-[var(--ar-lh)]">{sample.ar}</p>
              {reader.pronunciation && <p className="reading text-[calc(0.9375rem*var(--bn-scale))] text-gt">{sample.tr}</p>}
              {reader.translation && <p className="reading text-[calc(1.0625rem*var(--bn-scale))]">{sample.bn}</p>}
            </div>
            <div className={rowCard}>
              {/* Phones open these in a sheet; wide screens have room to show them. */}
              <div className="lg:hidden"><ButtonRow title="ফন্ট ও সাইজ" value={`আমিরি · ${toBnDigits(Math.round(settings.arScale * 100))}% · ${BN_FONT_LABELS[settings.bnFont]}`} onClick={() => setTypography(true)} /></div>
              <div className="hidden py-3 lg:block"><Typography /></div>
              <SelectRow title="লাইনের ফাঁক" value={reader.lineGap} options={LINE_GAPS} text={(g) => GAP_LABELS[g]} onChange={(lineGap) => saveReader({ ...reader, lineGap })} />
              <Toggle label="উচ্চারণ দেখান" checked={reader.pronunciation} onChange={() => saveReader({ ...reader, ...toggleLayer(reader, "pronunciation") })} />
              <Toggle label="অনুবাদ দেখান" checked={reader.translation} onChange={() => saveReader({ ...reader, ...toggleLayer(reader, "translation") })} />
              <Toggle label="আয়াত নম্বর" checked={reader.numbers} onChange={(numbers) => saveReader({ ...reader, numbers })} />
              <StaticRow title="অনুবাদ" value="বাংলা · রুওয়্যাদ অনুবাদ কেন্দ্র" />
            </div>
            {reader.mushaf && <p className="text-[0.8125rem] text-ink2">এখন মুসহাফ ভঙ্গিতে পড়ছেন, সেখানে শুধু আরবি দেখা যায়।</p>}
          </>
        ))}

        {section("audio", "অডিও", (
          <div className={rowCard}>
            <SelectRow title="ক্বারী" value={player.reciter} options={RECITERS.map((r) => r.id)} text={(id) => RECITERS.find((r) => r.id === id)!.name} onChange={setReciter} />
            <SelectRow title="গতি" value={player.options.rate} options={RATE_CHOICES} text={(r) => `${toBnDigits(r)}×`} onChange={(rate) => setOptions({ rate })} />
            <Toggle label="পরের আয়াত নিজে চলবে" checked={player.options.mode === "continue"} onChange={(on) => setOptions({ mode: on ? "continue" : "single" })} />
            <Toggle label="তিলাওয়াতের সাথে পাতা চলবে" checked={reader.follow} onChange={(follow) => saveReader({ ...reader, follow })} />
          </div>
        ))}

        {section("prayer", "নামাজ ও আযান", (
          <>
            <div className={rowCard}>
              <SelectRow title="গণনা পদ্ধতি" value={prayer.method} options={METHODS.map(([id]) => id)} text={(id) => METHODS.find((m) => m[0] === id)![1]} onChange={(method) => savePrayer({ ...prayer, method })} />
              <SelectRow title="আসর" value={prayer.asr} options={["hanafi", "shafi"] as const} text={(a) => (a === "hanafi" ? "হানাফি" : "শাফেয়ি")} onChange={(asr) => savePrayer({ ...prayer, asr })} />
              <SelectRow title="জায়গা" value={place.id} options={places} text={placeName} onChange={choosePlace} />
              <LinkRow title="রিমাইন্ডার, মিনিট সমন্বয় ও মাসিক সূচি" value={reminder.on ? (reminder.before ? `রিমাইন্ডার চালু · ${toBnDigits(reminder.before)} মিনিট আগে` : "রিমাইন্ডার চালু · ওয়াক্ত শুরুতে") : "রিমাইন্ডার বন্ধ"} href="/prayer-times/" />
            </div>
            <p role="status" className="text-[0.8125rem] text-ink2 empty:hidden">{located}</p>
          </>
        ))}

        {section("app", "অ্যাপ", (
          <div className={rowCard}>
            <StaticRow title="ভাষা" value="বাংলা" />
            <Toggle label="হাই-কনট্রাস্ট" hint="লেখা ও রেখা আরও স্পষ্ট" checked={settings.contrast} onChange={(contrast) => updateSettings({ contrast })} />
            <Toggle label="সহজ মোড" hint="সব লেখা ও বাটন বড় হবে" checked={settings.easyMode} onChange={(easyMode) => updateSettings({ easyMode })} />
            <LinkRow title="ব্যাকআপ ও রিস্টোর" value="আমার ডেটা" href="/data/" />
            <LinkRow title="অ্যাপ ইনস্টল ও অফলাইন" href="/offline/" />
            <LinkRow title="সম্পর্কে" value="উৎস ও শর্ত" href="/about/" />
          </div>
        ))}
        <p className="text-[0.8125rem] text-ink2">আপনার পছন্দ এই ফোনেই সংরক্ষিত থাকে।</p>
      </div>

      {typography && (
        <BottomSheet title="ফন্ট ও সাইজ" onClose={() => setTypography(false)}>
          <p lang="ar" dir="rtl" className="rounded-md border border-ln bg-bg px-3 font-arabic text-[calc(1.75rem*var(--ar-scale))] leading-[2.2]">{sample.ar}</p>
          <Typography />
          <p className="text-[0.8125rem] text-ink2">আরবি ফন্ট আমিরি কুরআন। সাইজ ও বাংলা ফন্ট কুরআন রিডারে কাজ করবে।</p>
        </BottomSheet>
      )}
    </div>
  );
}

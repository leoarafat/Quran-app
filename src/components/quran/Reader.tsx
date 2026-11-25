"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, Copy, Pause, Play, Share2 } from "lucide-react";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { playAyah, toggle, usePlayerValue, type Track } from "@/lib/audio/player";
import { saveLastRead } from "@/lib/quran/lastRead";
import type { Ayah, SurahData } from "@/lib/quran/types";
import { SCALE_MAX, SCALE_MIN } from "@/lib/settings";
import { updateSettings, useSettings } from "@/lib/useSettings";

type Layers = { arabic: boolean; pronunciation: boolean; translation: boolean };

function shareText(track: Track, ayah: Ayah, credit: string) {
  return `${ayah.ar}\n\nউচ্চারণ: ${ayah.tr}\n\nঅর্থ: ${ayah.bn}\n\nসূরা ${track.surahName} ${toBnDigits(track.surah)}:${toBnDigits(ayah.a)}\n${credit}`;
}

function AyahCard({ ayah, track, layers, credit }: { ayah: Ayah; track: Track; layers: Layers; credit: string }) {
  const here = usePlayerValue((s) => s.track?.surah === track.surah && s.position.ayah === ayah.a);
  const sounding = usePlayerValue((s) => s.track?.surah === track.surah && s.position.ayah === ayah.a && (s.status === "playing" || s.status === "loading" || s.status === "waiting"));
  const [notice, setNotice] = useState("");

  const say = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText(track, ayah, credit));
      say("কপি হয়েছে");
    } catch {
      say("কপি করা যায়নি");
    }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ text: shareText(track, ayah, credit), url: `${location.origin}${location.pathname}#a${ayah.a}` });
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") say("শেয়ার করা যায়নি");
    }
  };

  const action = "grid size-11 shrink-0 place-items-center rounded-full text-muted hover:text-accent";
  const line = <span aria-hidden className="h-px min-w-2 flex-1 bg-line-strong" />;

  return (
    <li
      id={`a${ayah.a}`}
      data-ayah={ayah.a}
      className="scroll-mt-24 [content-visibility:auto] [contain-intrinsic-size:auto_18rem]"
    >
      <div className="flex items-center gap-1 py-1">
        {line}
        <button
          type="button"
          className={`grid size-11 shrink-0 place-items-center rounded-full border ${sounding ? "border-gold bg-gold text-on-gold" : "border-line-strong text-accent"}`}
          onClick={() => (here ? toggle() : playAyah(track, ayah.a))}
          aria-label={`আয়াত ${toBnDigits(ayah.a)} ${sounding ? "থামান" : "শুনুন"}`}
        >
          {sounding ? <Pause aria-hidden className="size-5" fill="currentColor" strokeWidth={0} /> : <Play aria-hidden className="size-[1.125rem]" fill="currentColor" />}
        </button>
        {line}
        <span className="grid size-[2.125rem] shrink-0 place-items-center rounded-full border border-gold text-sm text-accent">
          <span className="sr-only">আয়াত </span>{toBnDigits(ayah.a)}
        </span>
        {line}
        <button type="button" className={action} onClick={copy} aria-label={`আয়াত ${toBnDigits(ayah.a)} কপি করুন`}>
          {notice === "কপি হয়েছে" ? <Check aria-hidden className="size-5" /> : <Copy aria-hidden className="size-[1.125rem]" />}
        </button>
        <button type="button" className={action} onClick={share} aria-label={`আয়াত ${toBnDigits(ayah.a)} শেয়ার করুন`}><Share2 aria-hidden className="size-[1.125rem]" /></button>
        {line}
      </div>
      <p role="status" className="text-center text-sm text-muted empty:hidden">{notice}</p>

      <div className={`-mx-3 rounded-3xl px-3 pb-3.5 pt-1 text-center ${here ? "bg-active" : ""}`}>
        {ayah.sajdah && <p className="mx-auto mt-1 w-fit rounded-full bg-accent-soft px-3 text-sm font-semibold text-accent">সিজদার আয়াত</p>}
        {layers.arabic && (
          <p lang="ar" dir="rtl" className="font-arabic text-[calc(2.0625rem*var(--ar-scale))] leading-[2.15]">{ayah.ar}</p>
        )}
        {layers.pronunciation && (
          <p className="font-display text-[calc(1.1875rem*var(--bn-scale))] font-medium leading-[1.75] text-accent">
            <span className="sr-only">উচ্চারণ: </span>{ayah.tr}
          </p>
        )}
        {layers.translation && (
          <>
            <p className="mt-1.5 text-[calc(1.0625rem*var(--bn-scale))] leading-[1.7] text-soft">{ayah.bn}</p>
            {ayah.fn && (
              <details className="mt-1 text-muted">
                <summary className="mx-auto min-h-11 w-fit cursor-pointer py-2 text-sm font-semibold text-accent">টীকা দেখুন</summary>
                <p className="whitespace-pre-line text-left text-[calc(0.9375rem*var(--bn-scale))]">{ayah.fn}</p>
              </details>
            )}
          </>
        )}
      </div>
    </li>
  );
}

export function Reader({ data, surahName, meta, credit }: { data: SurahData; surahName: string; /** "মাক্কি · ৭ আয়াত" */ meta: string; credit: string }) {
  const track: Track = { surah: data.n, surahName, total: data.ayahs.length };
  const [layers, setLayers] = useState<Layers>({ arabic: true, pronunciation: true, translation: true });
  const [panel, setPanel] = useState(false);
  const [jump, setJump] = useState("");
  const [jumpError, setJumpError] = useState("");
  const settings = useSettings();
  const listRef = useRef<HTMLOListElement>(null);
  const playing = usePlayerValue((s) => (s.track?.surah === data.n && s.status !== "idle" ? s.position.ayah : null));

  // Follow the recitation.
  useEffect(() => {
    if (playing) document.getElementById(`a${playing}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [playing]);

  // Remember the ayah at the reading line, once the visitor has actually scrolled or opened it.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => Number((e.target as HTMLElement).dataset.ayah));
        if (visible.length && (window.scrollY > 0 || location.hash)) saveLastRead({ s: data.n, a: Math.min(...visible) });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    list.querySelectorAll("[data-ayah]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [data.n]);

  const goTo = (event: React.FormEvent) => {
    event.preventDefault();
    const n = Number(toAsciiDigits(jump.trim()));
    if (!Number.isInteger(n) || n < 1 || n > data.ayahs.length) {
      setJumpError(`১ থেকে ${toBnDigits(data.ayahs.length)}-এর মধ্যে লিখুন`);
      return;
    }
    setJumpError("");
    history.replaceState(null, "", `#a${n}`);
    document.getElementById(`a${n}`)?.scrollIntoView({ block: "start" });
  };

  const toggleLayer = (key: keyof Layers) => {
    setLayers((current) => {
      const next = { ...current, [key]: !current[key] };
      // At least one layer always stays visible.
      return next.arabic || next.pronunciation || next.translation ? next : current;
    });
  };

  const chip = (active: boolean) => `min-h-11 rounded-full border px-4 ${active ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong"}`;

  return (
    <>
      <header className="sticky top-0 z-20 -mx-[1.375rem] -mt-6 border-b border-line bg-bg px-4 pb-2.5 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <Link href="/quran/" aria-label="সূরা তালিকায় ফিরে যান" className="grid size-11 shrink-0 place-items-center rounded-full text-accent">
            <ChevronLeft aria-hidden className="size-6" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate font-display text-xl font-semibold leading-snug">{surahName}</h1>
            <p className="truncate text-[0.8125rem] text-muted">{meta}</p>
          </div>
          <button type="button" aria-expanded={panel} aria-label="লেখার সাইজ ও অপশন" className={`grid size-11 shrink-0 place-items-center rounded-full border font-display text-[1.0625rem] text-accent ${panel ? "border-gold bg-active" : "border-line-strong"}`} onClick={() => setPanel((v) => !v)}>
            অ
          </button>
        </div>
        {panel && (
          <div className="max-h-[70dvh] space-y-3 overflow-y-auto pt-3">
            <div role="group" aria-label="কী কী দেখাবে" className="grid grid-cols-3 gap-2">
              <button type="button" aria-pressed={layers.arabic} className={chip(layers.arabic)} onClick={() => toggleLayer("arabic")}>আরবি</button>
              <button type="button" aria-pressed={layers.pronunciation} className={chip(layers.pronunciation)} onClick={() => toggleLayer("pronunciation")}>উচ্চারণ</button>
              <button type="button" aria-pressed={layers.translation} className={chip(layers.translation)} onClick={() => toggleLayer("translation")}>অর্থ</button>
            </div>
            <div role="group" aria-label="থিম" className="grid grid-cols-3 gap-2">
              {([["dark", "রাত"], ["light", "দিন"], ["sepia", "সেপিয়া"]] as const).map(([theme, label]) => (
                <button key={theme} type="button" aria-pressed={settings.theme === theme} className={chip(settings.theme === theme)} onClick={() => updateSettings({ theme })}>{label}</button>
              ))}
            </div>
            {([["arScale", "আরবি সাইজ"], ["bnScale", "বাংলা সাইজ"]] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm">{label}</span>
                <input type="range" min={SCALE_MIN} max={SCALE_MAX} step={0.1} value={settings[key]} onChange={(e) => updateSettings({ [key]: Number(e.target.value) })} className="h-11 min-w-0 flex-1 accent-[var(--brand)]" />
              </label>
            ))}
            <form onSubmit={goTo} className="flex gap-2">
              <label className="sr-only" htmlFor="jump">আয়াত নম্বর</label>
              <input id="jump" inputMode="numeric" value={jump} onChange={(e) => setJump(e.target.value)} placeholder={`আয়াত নম্বর (১-${toBnDigits(data.ayahs.length)})`} className="min-h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-4" />
              <button type="submit" className={chip(false)}>যান</button>
            </form>
            {jumpError && <p role="alert" className="text-sm text-accent">{jumpError}</p>}
          </div>
        )}
      </header>

      {data.basmalah && (
        <div className="pt-3 text-center">
          {layers.arabic && <p lang="ar" dir="rtl" className="font-arabic text-[calc(1.5625rem*var(--ar-scale))] leading-[2.1] text-accent">{data.basmalah}</p>}
          {layers.pronunciation && <p className="text-[calc(0.9375rem*var(--bn-scale))] text-muted">{data.basmalahTr}</p>}
        </div>
      )}

      <div className="my-3 flex justify-center">
        <button type="button" className="flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-5 font-semibold text-accent" onClick={() => playAyah(track, 1)}>
          <Play aria-hidden className="size-4" fill="currentColor" /> পুরো সূরা শুনুন
        </button>
      </div>

      {layers.pronunciation && (
        <p className="mb-2 text-center text-[0.8125rem] leading-relaxed text-muted">
          বাংলা উচ্চারণ স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি। তিলাওয়াত শুনে মিলিয়ে পড়ুন। <Link href="/about/" className="text-accent underline">বিস্তারিত</Link>
        </p>
      )}

      <ol ref={listRef} className="space-y-1">
        {data.ayahs.map((ayah) => <AyahCard key={ayah.a} ayah={ayah} track={track} layers={layers} credit={credit} />)}
      </ol>
    </>
  );
}

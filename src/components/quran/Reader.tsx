"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Pause, Play, Share2, Type } from "lucide-react";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { playAyah, toggle, usePlayerValue, type Track } from "@/lib/audio/player";
import { saveLastRead } from "@/lib/quran/lastRead";
import type { Ayah, SurahData } from "@/lib/quran/types";
import { SCALE_MAX, SCALE_MIN } from "@/lib/settings";
import { updateSettings, useSettings } from "@/lib/useSettings";

type Layers = { arabic: boolean; translation: boolean };

function shareText(track: Track, ayah: Ayah, credit: string) {
  return `${ayah.ar}\n\n${ayah.bn}\n\nসূরা ${track.surahName} ${toBnDigits(track.surah)}:${toBnDigits(ayah.a)}\n${credit}`;
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

  const action = "grid size-11 place-items-center rounded-full text-brand hover:bg-surface-2";

  return (
    <li
      id={`a${ayah.a}`}
      data-ayah={ayah.a}
      className={`scroll-mt-20 rounded-2xl border p-4 [content-visibility:auto] [contain-intrinsic-size:auto_18rem] ${here ? "border-brand bg-accent-soft/40" : "border-line bg-surface"}`}
    >
      <div className="mb-2 flex items-center gap-1">
        <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold text-brand">{toBnDigits(track.surah)}:{toBnDigits(ayah.a)}</span>
        {ayah.sajdah && <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">সিজদার আয়াত</span>}
        <span role="status" className="flex-1 truncate text-right text-sm text-muted">{notice}</span>
        <button type="button" className={action} onClick={copy} aria-label={`আয়াত ${toBnDigits(ayah.a)} কপি করুন`}>
          {notice === "কপি হয়েছে" ? <Check aria-hidden className="size-5" /> : <Copy aria-hidden className="size-5" />}
        </button>
        <button type="button" className={action} onClick={share} aria-label={`আয়াত ${toBnDigits(ayah.a)} শেয়ার করুন`}><Share2 aria-hidden className="size-5" /></button>
        <button
          type="button"
          className="grid size-12 place-items-center rounded-full bg-brand text-on-brand"
          onClick={() => (here ? toggle() : playAyah(track, ayah.a))}
          aria-label={`আয়াত ${toBnDigits(ayah.a)} ${sounding ? "থামান" : "শুনুন"}`}
        >
          {sounding ? <Pause aria-hidden className="size-6" /> : <Play aria-hidden className="size-6" />}
        </button>
      </div>
      {layers.arabic && (
        <p lang="ar" dir="rtl" className="mb-3 text-right font-arabic text-[calc(1.875rem*var(--ar-scale))] leading-[2.3]">{ayah.ar}</p>
      )}
      {layers.translation && (
        <>
          <p className="text-[calc(1.0625rem*var(--bn-scale))] leading-relaxed">{ayah.bn}</p>
          {ayah.fn && (
            <details className="mt-2 text-muted">
              <summary className="min-h-11 cursor-pointer py-2 font-semibold text-brand">টীকা দেখুন</summary>
              <p className="whitespace-pre-line text-[calc(0.9375rem*var(--bn-scale))]">{ayah.fn}</p>
            </details>
          )}
        </>
      )}
    </li>
  );
}

export function Reader({ data, surahName, credit }: { data: SurahData; surahName: string; credit: string }) {
  const track: Track = { surah: data.n, surahName, total: data.ayahs.length };
  const [layers, setLayers] = useState<Layers>({ arabic: true, translation: true });
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
      // At least one of the two always stays visible.
      return next.arabic || next.translation ? next : current;
    });
  };

  const chip = (active: boolean) => `min-h-11 rounded-full border px-4 ${active ? "border-brand bg-brand font-semibold text-on-brand" : "border-line bg-surface"}`;

  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 mb-3 border-b border-line bg-bg px-4 py-2">
        <div className="flex items-center gap-2">
          <button type="button" className={chip(false) + " flex-1 !border-brand font-semibold text-brand"} onClick={() => playAyah(track, 1)}>পুরো সূরা শুনুন</button>
          <form onSubmit={goTo} className="flex gap-1">
            <label className="sr-only" htmlFor="jump">আয়াত নম্বর</label>
            <input id="jump" inputMode="numeric" value={jump} onChange={(e) => setJump(e.target.value)} placeholder="আয়াত" className="min-h-11 w-20 rounded-full border border-line bg-surface px-3 text-center" />
            <button type="submit" className={chip(false)}>যান</button>
          </form>
          <button type="button" aria-expanded={panel} aria-label="লেখার অপশন" className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface" onClick={() => setPanel((v) => !v)}>
            <Type aria-hidden className="size-5" />
          </button>
        </div>
        {jumpError && <p role="alert" className="pt-1 text-sm text-accent">{jumpError}</p>}
        {panel && (
          <div className="space-y-2 pt-3">
            <div className="flex gap-2">
              <button type="button" aria-pressed={layers.arabic} className={chip(layers.arabic)} onClick={() => toggleLayer("arabic")}>আরবি</button>
              <button type="button" aria-pressed={layers.translation} className={chip(layers.translation)} onClick={() => toggleLayer("translation")}>অনুবাদ</button>
            </div>
            {([["arScale", "আরবি সাইজ"], ["bnScale", "বাংলা সাইজ"]] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm">{label}</span>
                <input type="range" min={SCALE_MIN} max={SCALE_MAX} step={0.1} value={settings[key]} onChange={(e) => updateSettings({ [key]: Number(e.target.value) })} className="h-11 flex-1 accent-[var(--brand)]" />
              </label>
            ))}
          </div>
        )}
      </div>

      {data.basmalah && layers.arabic && (
        <p lang="ar" dir="rtl" className="mb-4 text-center font-arabic text-[calc(1.75rem*var(--ar-scale))] leading-[2.2] text-brand">{data.basmalah}</p>
      )}

      <ol ref={listRef} className="space-y-3">
        {data.ayahs.map((ayah) => <AyahCard key={ayah.a} ayah={ayah} track={track} layers={layers} credit={credit} />)}
      </ol>
    </>
  );
}

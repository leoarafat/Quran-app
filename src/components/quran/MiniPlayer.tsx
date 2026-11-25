"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, Pause, Play, RotateCcw, SkipBack, SkipForward, SlidersHorizontal, X } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { setOptions, setReciter, skip, stop, toggle, usePlayer } from "@/lib/audio/player";
import { RECITERS } from "@/lib/audio/reciters";
import { GAP_CHOICES, RATE_CHOICES, REPEAT_CHOICES } from "@/lib/audio/sequence";

/** Keeps the screen awake while reciting, where the browser allows it. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const next = await navigator.wakeLock.request("screen");
        if (cancelled) await next.release();
        else lock = next;
      } catch {
        // Low battery or unsupported: recitation still works.
      }
    };
    void request();
    document.addEventListener("visibilitychange", request);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}

function Choice<T extends string | number>({ label, value, options, text, onChange }: {
  label: string; value: T; options: readonly T[]; text: (v: T) => string; onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(options.find((o) => String(o) === e.target.value)!)}
        className="min-h-11 rounded-xl border border-line bg-surface px-2 text-base text-text"
      >
        {options.map((o) => <option key={o} value={o}>{text(o)}</option>)}
      </select>
    </label>
  );
}

export function MiniPlayer() {
  const { track, position, status, reciter, options } = usePlayer();
  const [open, setOpen] = useState(false);
  const busy = status === "playing" || status === "loading" || status === "waiting";
  useWakeLock(busy);
  if (!track) return null;

  const button = "grid size-11 shrink-0 place-items-center rounded-full disabled:opacity-40";
  const times = (n: number) => (n === 0 ? "বারবার" : `${toBnDigits(n)} বার`);

  return (
    <>
      {/* Reserves room so the fixed player never hides the end of a page. */}
      <div aria-hidden className={open ? "h-96" : "h-24"} />
      <section aria-label="তিলাওয়াত প্লেয়ার" className="fixed inset-x-0 bottom-[calc(4rem+1px+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface shadow-[0_-6px_20px_rgba(0,0,0,0.12)] lg:bottom-0 lg:left-56">
        <div className="mx-auto max-w-3xl px-3 py-2">
          {open && (
            <div className="mb-3 grid max-h-[45dvh] grid-cols-2 gap-3 overflow-y-auto border-b border-line pb-3">
              <div className="col-span-2">
                <Choice label="ক্বারী" value={reciter} options={RECITERS.map((r) => r.id)} text={(id) => RECITERS.find((r) => r.id === id)!.name} onChange={setReciter} />
              </div>
              <Choice label="চালানোর ধরন" value={options.mode} options={["continue", "single"] as const} text={(m) => (m === "continue" ? "পরপর সব আয়াত" : "শুধু এই আয়াত")} onChange={(mode) => setOptions({ mode })} />
              <Choice label="প্রতি আয়াত" value={options.repeatEach} options={REPEAT_CHOICES} text={times} onChange={(repeatEach) => setOptions({ repeatEach })} />
              <Choice label="মাঝে বিরতি" value={options.gap} options={GAP_CHOICES} text={(g) => (g === 0 ? "নেই" : `${toBnDigits(g)} সেকেন্ড`)} onChange={(gap) => setOptions({ gap })} />
              <Choice label="গতি" value={options.rate} options={RATE_CHOICES} text={(r) => `${toBnDigits(r)}×`} onChange={(rate) => setOptions({ rate })} />
            </div>
          )}
          <p role="status" className="sr-only">{status === "error" ? "অডিও চালানো যায়নি" : ""}</p>
          {status === "error" && <p className="mb-1 text-sm font-semibold text-accent">অডিও আনা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন, অথবা অন্য ক্বারী নিন।</p>}
          <div className="flex items-center gap-1">
            <Link href={`/quran/${track.surah}/#a${position.ayah}`} className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-semibold">{track.surahName} : {toBnDigits(position.ayah)}</span>
              <span className="block truncate text-sm text-muted">{RECITERS.find((r) => r.id === reciter)!.name}</span>
            </Link>
            <button type="button" className={button} onClick={() => skip(-1)} disabled={position.ayah <= 1} aria-label="আগের আয়াত"><SkipBack aria-hidden className="size-5" /></button>
            <button type="button" className={`${button} bg-brand text-on-brand`} onClick={toggle} aria-label={busy ? "থামান" : status === "error" ? "আবার চেষ্টা করুন" : "চালান"}>
              {status === "loading" ? <LoaderCircle aria-hidden className="size-6 animate-spin" /> : status === "error" ? <RotateCcw aria-hidden className="size-6" /> : busy ? <Pause aria-hidden className="size-6" /> : <Play aria-hidden className="size-6" />}
            </button>
            <button type="button" className={button} onClick={() => skip(1)} disabled={position.ayah >= track.total} aria-label="পরের আয়াত"><SkipForward aria-hidden className="size-5" /></button>
            <button type="button" className={button} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="অডিও অপশন"><SlidersHorizontal aria-hidden className="size-5" /></button>
            <button type="button" className={button} onClick={() => { setOpen(false); stop(); }} aria-label="প্লেয়ার বন্ধ করুন"><X aria-hidden className="size-5" /></button>
          </div>
        </div>
      </section>
    </>
  );
}

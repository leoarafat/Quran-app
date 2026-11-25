"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronUp, LoaderCircle, Pause, Play, Repeat, RotateCcw, SkipBack, SkipForward, X } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { setOptions, setReciter, setSleep, skip, stop, toggle, usePlayer, useProgress, type PlayerState } from "@/lib/audio/player";
import { RECITERS } from "@/lib/audio/reciters";
import { GAP_CHOICES, RATE_CHOICES, REPEAT_CHOICES, SLEEP_CHOICES } from "@/lib/audio/sequence";
import { isReaderPath } from "@/lib/nav";

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
        className="min-h-11 rounded-2xl border border-line-strong bg-surface px-2 text-base text-text"
      >
        {options.map((o) => <option key={o} value={o}>{text(o)}</option>)}
      </select>
    </label>
  );
}

function ProgressLine() {
  const progress = useProgress();
  return (
    <div aria-hidden="true" className="mx-2 mb-2.5 h-[3px] rounded-sm bg-line-strong">
      <div className="h-full rounded-sm bg-accent" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}

const STATUS_TEXT: Record<PlayerState["status"], string> = {
  idle: "", loading: "আনা হচ্ছে", playing: "চলছে", paused: "থেমে আছে", waiting: "বিরতি", error: "চালানো যায়নি",
};

export function MiniPlayer() {
  const { track, position, status, reciter, options, sleep } = usePlayer();
  const [open, setOpen] = useState(false);
  const reading = isReaderPath(usePathname());
  const busy = status === "playing" || status === "loading" || status === "waiting";
  useWakeLock(busy);
  if (!track) return null;

  const button = "grid size-11 shrink-0 place-items-center rounded-full text-accent disabled:opacity-35";
  const times = (n: number) => (n === 0 ? "বারবার" : `${toBnDigits(n)} বার`);
  const reciterName = RECITERS.find((r) => r.id === reciter)!.name;
  const looping = options.repeatEach !== 1;
  const round = toBnDigits(position.round ?? 1);
  const passage = track.loop === undefined ? "" : `আয়াত ${toBnDigits(track.first ?? 1)}-${toBnDigits(track.total)} · ${track.loop === 0 ? `${round} বার` : `${round}/${toBnDigits(track.loop)} বার`}`;

  return (
    <>
      {/* Reserves room so the floating player never hides the end of a page. */}
      <div aria-hidden className={open ? "h-[28rem]" : "h-28"} />
      <section
        aria-label="তিলাওয়াত প্লেয়ার"
        className={`fixed inset-x-3.5 z-30 mx-auto max-w-lg rounded-[1.875rem] border border-line-strong bg-raised px-3 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] lg:bottom-5 ${reading ? "bottom-[calc(1rem+env(safe-area-inset-bottom))]" : "bottom-[calc(6rem+env(safe-area-inset-bottom))]"}`}
      >
        {open && (
          <div className="mb-3 max-h-[48dvh] overflow-y-auto border-b border-line-strong pb-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Choice label="ক্বারী" value={reciter} options={RECITERS.map((r) => r.id)} text={(id) => RECITERS.find((r) => r.id === id)!.name} onChange={setReciter} />
              </div>
              {passage
                ? <p className="flex flex-col gap-1 text-sm text-muted">বাছাই করা অংশ<span className="flex min-h-11 items-center text-base leading-snug text-text">{passage}</span></p>
                : <Choice label="চালানোর ধরন" value={options.mode} options={["continue", "single"] as const} text={(m) => (m === "continue" ? "পরপর সব আয়াত" : "শুধু এই আয়াত")} onChange={(mode) => setOptions({ mode })} />}
              <Choice label="প্রতি আয়াত" value={options.repeatEach} options={REPEAT_CHOICES} text={times} onChange={(repeatEach) => setOptions({ repeatEach })} />
              <Choice label="মাঝে বিরতি" value={options.gap} options={GAP_CHOICES} text={(g) => (g === 0 ? "নেই" : `${toBnDigits(g)} সেকেন্ড`)} onChange={(gap) => setOptions({ gap })} />
              <Choice label="গতি" value={options.rate} options={RATE_CHOICES} text={(r) => `${toBnDigits(r)}×`} onChange={(rate) => setOptions({ rate })} />
              <div className="col-span-2">
                <Choice label="ঘুমের টাইমার (নিজে থেকে থামবে)" value={sleep?.minutes ?? 0} options={SLEEP_CHOICES} text={(m) => (m === 0 ? "বন্ধ" : `${toBnDigits(m)} মিনিট পর`)} onChange={setSleep} />
              </div>
              <button type="button" className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-line-strong disabled:opacity-35" onClick={() => skip(-1)} disabled={position.ayah <= (track.first ?? 1)}>
                <SkipBack aria-hidden className="size-5" fill="currentColor" /> আগের আয়াত
              </button>
              <Link href={`/quran/${track.surah}/#a${position.ayah}`} onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-center rounded-2xl border border-line-strong">চলমান আয়াতে যান</Link>
              <button type="button" className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-line-strong" onClick={() => { setOpen(false); stop(); }}>
                <X aria-hidden className="size-5" /> বন্ধ করুন
              </button>
            </div>
          </div>
        )}
        <p role="status" className="sr-only">{status === "error" ? "অডিও চালানো যায়নি" : ""}</p>
        {status === "error" && <p className="mb-2 px-2 text-sm font-semibold text-accent">অডিও আনা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন, অথবা অন্য ক্বারী নিন।</p>}
        <ProgressLine />
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="অডিও অপশন" className="flex min-h-11 min-w-0 flex-1 items-center gap-1 pl-1 text-left leading-snug">
            <span className="min-w-0">
              <span className="block truncate text-[0.9375rem] font-semibold">আয়াত {toBnDigits(position.ayah)} {STATUS_TEXT[status]}</span>
              <span className="block truncate text-[0.8125rem] text-muted">{passage || (reading ? reciterName : `${track.surahName} · ${reciterName}`)}</span>
            </span>
            <ChevronUp aria-hidden className={`size-4 shrink-0 text-muted ${open ? "rotate-180" : ""}`} />
          </button>
          <button type="button" className={`${button} relative max-[22.4rem]:hidden ${looping ? "bg-active" : ""}`} aria-pressed={looping} aria-label="এই আয়াত বারবার শুনুন" onClick={() => setOptions({ repeatEach: looping ? 1 : 0 })}>
            <Repeat aria-hidden className="size-[1.375rem]" strokeWidth={1.8} />
            {looping && <span aria-hidden className="absolute right-0.5 top-0.5 text-[0.6875rem] font-bold">{options.repeatEach === 0 ? "∞" : toBnDigits(options.repeatEach)}</span>}
          </button>
          <button type="button" className="grid size-[3.625rem] shrink-0 place-items-center rounded-full bg-gold text-on-gold" onClick={toggle} aria-label={busy ? "থামান" : status === "error" ? "আবার চেষ্টা করুন" : "চালান"}>
            {status === "loading" ? <LoaderCircle aria-hidden className="size-6 animate-spin" /> : status === "error" ? <RotateCcw aria-hidden className="size-6" /> : busy ? <Pause aria-hidden className="size-6" fill="currentColor" strokeWidth={0} /> : <Play aria-hidden className="size-6" fill="currentColor" />}
          </button>
          <button type="button" className={button} onClick={() => skip(1)} disabled={position.ayah >= track.total} aria-label="পরের আয়াত"><SkipForward aria-hidden className="size-[1.375rem]" fill="currentColor" /></button>
        </div>
      </section>
    </>
  );
}

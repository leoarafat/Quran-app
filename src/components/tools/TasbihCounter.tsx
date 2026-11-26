"use client";

import { useEffect, useState } from "react";
import { headerButton, ScreenHeader } from "@/components/shell/ScreenHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { HeroCard } from "@/components/ui/HeroCard";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { dayKey } from "@/lib/tools/routine";
import { dayKey as welcomeDay } from "@/lib/welcome";
import { PHRASES, parseTasbih, resetCount, tap, TARGET_MAX, TARGETS, type Tasbih } from "@/lib/tools/tasbih";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";

const KEY = "noor.tasbih.v1";
const parse = (raw: string | null) => parseTasbih(raw, welcomeDay(new Date()));
const save = (next: Tasbih) => writeStored(KEY, JSON.stringify(next));
const pill = (on: boolean) => `min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium ${on ? "border-hero-accent bg-hero-accent font-semibold text-[#0b1511]" : "border-white/25"}`;
const shownDay = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long" });

/** Keeps the screen from sleeping while this page is in front, on phones that allow it. */
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let left = false;
    const ask = async () => {
      if (document.visibilityState !== "visible" || !("wakeLock" in navigator)) return;
      try {
        const got = await navigator.wakeLock.request("screen");
        if (left) return void got.release();
        lock = got;
      } catch {
        // Low battery or not allowed: the screen sleeps as usual.
      }
    };
    void ask();
    document.addEventListener("visibilitychange", ask);
    return () => {
      left = true;
      document.removeEventListener("visibilitychange", ask);
      void lock?.release();
    };
  }, []);
}

/** The saved day is written with the welcome screen's spelling; the history uses the sortable one. */
const historyDay = () => dayKey(new Date());

function TargetSheet({ target, onChoose, onClose }: { target: number; onChoose: (n: number) => void; onClose: () => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  return (
    <BottomSheet title="নিজের লক্ষ্য" onClose={onClose}>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(toAsciiDigits(text.trim()));
          if (!Number.isInteger(n) || n < 1 || n > TARGET_MAX) return setError(`১ থেকে ${toBnDigits(TARGET_MAX)}-এর মধ্যে লিখুন`);
          onChoose(n);
        }}
      >
        <div className="flex gap-2">
          <input inputMode="numeric" data-autofocus aria-label="লক্ষ্যের সংখ্যা" value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder={target ? toBnDigits(target) : "সংখ্যা"} className="min-h-12 min-w-0 flex-1 rounded-md border border-ln2 bg-bg px-3 text-base" />
          <button type="submit" className="min-h-12 shrink-0 rounded-full bg-ac px-5 font-semibold text-on-ac">ঠিক আছে</button>
        </div>
        {error && <p role="alert" className="text-sm text-gt">{error}</p>}
      </form>
    </BottomSheet>
  );
}

function Counter() {
  const state = useStored(KEY, parse);
  const [before, setBefore] = useState<Tasbih | null>(null);
  const [announce, setAnnounce] = useState("");
  const [sheet, setSheet] = useState<"history" | "target" | null>(null);
  useWakeLock();
  const progress = state.target ? Math.min(1, state.count / state.target) : 0;
  const custom = !(TARGETS as readonly number[]).includes(state.target);
  const days = Object.keys(state.history).sort().reverse();

  const press = () => {
    // The history is kept by sortable day; "today" keeps the spelling it has always been saved with.
    const { next, completed } = tap({ ...state, day: historyDay() }, historyDay());
    save({ ...next, day: welcomeDay(new Date()) });
    setBefore(null);
    setAnnounce(completed ? `${toBnDigits(next.target)} পূর্ণ হয়েছে` : "");
    if (next.vibrate && "vibrate" in navigator) navigator.vibrate(completed ? [120, 60, 120] : 25);
  };
  const change = (next: Tasbih) => {
    setBefore(state);
    setAnnounce("");
    save(next);
  };
  const aim = (target: number) => {
    if (target !== state.target) change({ ...resetCount(state), target });
  };

  return (
    <>
      <ScreenHeader title="তাসবিহ" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }}>
        <button type="button" aria-label="আগের গণনা ফিরিয়ে আনুন" disabled={!before} onClick={() => { if (before) { save(before); setBefore(null); setAnnounce(""); } }} className={`${headerButton} disabled:opacity-35`}><Icon name="undo" /></button>
        <button type="button" aria-label="ইতিহাস" aria-haspopup="dialog" onClick={() => setSheet("history")} className={headerButton}><Icon name="clock" /></button>
      </ScreenHeader>

      <HeroCard label="তাসবিহ গণনা" className="!bg-[#0b1511] !p-4">
        <div role="group" aria-label="জিকির" className="rail -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {PHRASES.map((p, i) => <button key={p} type="button" aria-pressed={state.phrase === i} className={pill(state.phrase === i)} onClick={() => { if (i !== state.phrase) change({ ...resetCount(state), phrase: i }); }}>{p}</button>)}
        </div>

        <p className="mt-4 text-center font-display text-xl text-hero-accent">{PHRASES[state.phrase]}</p>
        <div className="relative mx-auto mt-2 grid aspect-square w-full max-w-60 place-items-center">
          <svg aria-hidden="true" viewBox="0 0 240 240" className="absolute inset-0 size-full -rotate-90">
            <circle cx="120" cy="120" r="112" fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth="8" />
            {progress > 0 && <circle cx="120" cy="120" r="112" fill="none" stroke="var(--hero-accent)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${progress * 703.7} 703.7`} className="transition-[stroke-dasharray] duration-200" />}
          </svg>
          <p className="relative text-center">
            <span className="block text-7xl font-bold leading-tight tabular-nums">{toBnDigits(state.count)}</span>
            <span className="block text-sm text-hero-muted">{state.target ? `লক্ষ্য ${toBnDigits(state.target)}` : "লক্ষ্য ছাড়া"}</span>
          </p>
        </div>
        <p role="status" className="mt-1 min-h-6 text-center font-semibold text-hero-accent">{announce}</p>

        <div role="group" aria-label="লক্ষ্য" className="flex flex-wrap justify-center gap-1.5">
          {TARGETS.map((t) => <button key={t} type="button" aria-pressed={state.target === t} aria-label={t === 0 ? "লক্ষ্য ছাড়া" : undefined} className={`${pill(state.target === t)} min-w-11 !px-2`} onClick={() => aim(t)}>{t === 0 ? "∞" : toBnDigits(t)}</button>)}
          <button type="button" aria-pressed={custom} aria-haspopup="dialog" className={`${pill(custom)} !px-3`} onClick={() => setSheet("target")}>{custom ? `কাস্টম ${toBnDigits(state.target)}` : "কাস্টম"}</button>
        </div>

        <button type="button" onClick={press} aria-label={`গুনুন। এখন ${toBnDigits(state.count)}`} className="mt-4 flex min-h-44 w-full touch-manipulation select-none flex-col items-center justify-center gap-2 rounded-3xl border border-hero-accent/40 bg-white/5 active:bg-white/10">
          <Icon name="tasbih" className="size-9 text-hero-accent" />
          <span className="font-display text-lg font-semibold text-hero-accent">এখানে ট্যাপ করুন</span>
        </button>
        <p className="mt-3 text-center text-[0.8125rem] text-hero-muted">আজ মোট {toBnDigits(state.today)} · সব মিলিয়ে {toBnDigits(state.total)} · পূর্ণ চক্র {toBnDigits(state.rounds)}</p>
      </HeroCard>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" className="min-h-11 rounded-full border border-ln2 bg-sf px-4 text-sm font-medium disabled:opacity-40" disabled={state.count === 0 && state.rounds === 0} onClick={() => change(resetCount(state))}>শূন্য করুন</button>
        <button type="button" aria-pressed={state.vibrate} className="min-h-11 rounded-full border border-ln2 bg-sf px-4 text-sm font-medium" onClick={() => save({ ...state, vibrate: !state.vibrate })}>ভাইব্রেশন {state.vibrate ? "চালু" : "বন্ধ"}</button>
      </div>
      <p className="mt-2 text-center text-[0.8125rem] text-ink2">গণনা শুধু এই ফোনে থাকে।</p>

      {sheet === "target" && <TargetSheet target={state.target} onClose={() => setSheet(null)} onChoose={(n) => { aim(n); setSheet(null); }} />}
      {sheet === "history" && (
        <BottomSheet title="ইতিহাস" onClose={() => setSheet(null)}>
          <p className="text-sm text-ink2">সব মিলিয়ে {toBnDigits(state.total)}। শেষ {toBnDigits(90)} দিনের হিসাব রাখা হয়।</p>
          {days.length === 0 ? <p className="text-ink2">এখনো কিছু গোনা হয়নি।</p> : (
            <ol className="rounded-md border border-ln px-4">
              {days.map((d) => <li key={d} className="flex min-h-12 items-center justify-between gap-3 border-b border-ln last:border-0"><span>{shownDay.format(new Date(`${d}T12:00:00`))}</span><b className="tabular-nums">{toBnDigits(state.history[d])}</b></li>)}
            </ol>
          )}
        </BottomSheet>
      )}
    </>
  );
}

export function TasbihCounter() {
  return useInBrowser() ? <Counter /> : <Skeleton className="h-[32rem] !rounded-3xl" />;
}

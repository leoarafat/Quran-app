"use client";

import { useState } from "react";
import { RotateCcw, Undo2, Vibrate, VibrateOff } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { dayKey } from "@/lib/welcome";
import { PHRASES, parseTasbih, resetCount, tap, TARGETS, type Tasbih } from "@/lib/tools/tasbih";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";

const KEY = "noor.tasbih.v1";
const parse = (raw: string | null) => parseTasbih(raw, dayKey(new Date()));
const save = (next: Tasbih) => writeStored(KEY, JSON.stringify(next));
const chip = (on: boolean) => `min-h-11 rounded-full border px-4 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;

function Counter() {
  const state = useStored(KEY, parse);
  const [before, setBefore] = useState<Tasbih | null>(null);
  const [announce, setAnnounce] = useState("");
  const progress = state.target ? Math.min(1, state.count / state.target) : 0;

  const press = () => {
    const { next, completed } = tap(state, dayKey(new Date()));
    save(next);
    setBefore(null);
    setAnnounce(completed ? `${toBnDigits(next.target)} পূর্ণ হয়েছে` : "");
    if (next.vibrate && "vibrate" in navigator) navigator.vibrate(completed ? [120, 60, 120] : 25);
  };

  return (
    <div className="space-y-4">
      <div role="group" aria-label="জিকির" className="flex flex-wrap justify-center gap-2">
        {PHRASES.map((p, i) => <button key={p} type="button" aria-pressed={state.phrase === i} className={chip(state.phrase === i)} onClick={() => { if (i !== state.phrase) { setBefore(state); save({ ...resetCount(state), phrase: i }); } }}>{p}</button>)}
      </div>
      <div role="group" aria-label="লক্ষ্য" className="flex justify-center gap-2">
        {TARGETS.map((t) => <button key={t} type="button" aria-pressed={state.target === t} className={chip(state.target === t)} onClick={() => { if (t !== state.target) { setBefore(state); save({ ...resetCount(state), target: t }); } }}>{t === 0 ? "∞" : toBnDigits(t)}</button>)}
      </div>

      <button type="button" onClick={press} aria-label={`গুনুন। এখন ${toBnDigits(state.count)}`} className="relative mx-auto grid aspect-square w-full max-w-72 touch-manipulation select-none place-items-center rounded-full active:scale-[0.98]">
        <svg aria-hidden="true" viewBox="0 0 280 280" className="absolute inset-0 size-full -rotate-90">
          <circle cx="140" cy="140" r="128" fill="var(--hero)" stroke="#2c493d" strokeWidth="10" />
          {progress > 0 && <circle cx="140" cy="140" r="128" fill="none" stroke="var(--gold)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${progress * 804.25} 804.25`} />}
        </svg>
        <span className="relative text-center text-on-hero">
          <span className="block px-6 font-display text-lg text-hero-accent">{PHRASES[state.phrase]}</span>
          <span className="block font-display text-7xl font-bold tabular-nums leading-tight">{toBnDigits(state.count)}</span>
          <span className="block text-sm text-hero-muted">{state.target ? `লক্ষ্য ${toBnDigits(state.target)}` : "লক্ষ্য ছাড়া"} · চাপ দিয়ে গুনুন</span>
        </span>
      </button>
      <p role="status" className="min-h-6 text-center font-semibold text-accent">{announce}</p>

      <dl className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-[1.375rem] border border-line bg-surface p-3"><dt className="text-sm text-muted">পূর্ণ চক্র</dt><dd className="font-display text-2xl font-semibold">{toBnDigits(state.rounds)}</dd></div>
        <div className="rounded-[1.375rem] border border-line bg-surface p-3"><dt className="text-sm text-muted">আজ মোট</dt><dd className="font-display text-2xl font-semibold">{toBnDigits(state.today)}</dd></div>
      </dl>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={`${chip(false)} flex items-center gap-2 disabled:opacity-40`} disabled={state.count === 0 && state.rounds === 0} onClick={() => { setBefore(state); save(resetCount(state)); setAnnounce(""); }}><RotateCcw aria-hidden className="size-4" /> শূন্য করুন</button>
        {before && <button type="button" className={`${chip(false)} flex items-center gap-2 text-accent`} onClick={() => { save(before); setBefore(null); }}><Undo2 aria-hidden className="size-4" /> আগের গণনা ফিরিয়ে আনুন</button>}
        <button type="button" aria-pressed={state.vibrate} className={`${chip(false)} flex items-center gap-2`} onClick={() => save({ ...state, vibrate: !state.vibrate })}>
          {state.vibrate ? <Vibrate aria-hidden className="size-4" /> : <VibrateOff aria-hidden className="size-4" />} ভাইব্রেশন {state.vibrate ? "চালু" : "বন্ধ"}
        </button>
      </div>
    </div>
  );
}

export function TasbihCounter() {
  return useInBrowser() ? <Counter /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { playAyah, setOptions, usePlayer, type Track } from "@/lib/audio/player";
import { readRange, REPEAT_CHOICES } from "@/lib/audio/sequence";

const times = (n: number) => (n === 0 ? "থামানো পর্যন্ত" : `${toBnDigits(n)} বার`);
const field = "min-h-11 w-full min-w-0 rounded-2xl border border-line-strong bg-bg px-3 text-base text-text";
const label = "flex min-w-0 flex-col gap-1 text-sm text-muted";

/** Choose a passage of this surah and hear it again and again, for memorising. */
export function RangeRepeat({ id, track, startAt, onStart }: { id: string; track: Track; /** suggested first ayah */ startAt: number; onStart: () => void }) {
  const { options } = usePlayer();
  const [from, setFrom] = useState(toBnDigits(startAt));
  const [to, setTo] = useState(toBnDigits(Math.min(startAt + 4, track.total)));
  const [rounds, setRounds] = useState(3);
  const [error, setError] = useState("");

  const start = (event: React.FormEvent) => {
    event.preventDefault();
    const range = readRange(toAsciiDigits(from), toAsciiDigits(to), track.total);
    if (!range) return setError(`১ থেকে ${toBnDigits(track.total)}-এর মধ্যে লিখুন। শেষের আয়াত শুরুর আয়াতের আগে হতে পারবে না।`);
    setError("");
    playAyah({ ...track, first: range.from, total: range.to, loop: rounds }, range.from);
    onStart();
  };

  const select = (value: number, onChange: (n: number) => void) => (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} className={field}>
      {REPEAT_CHOICES.map((n) => <option key={n} value={n}>{times(n)}</option>)}
    </select>
  );

  return (
    <form id={id} onSubmit={start} aria-label="অংশ বারবার শুনুন" className="mb-3 space-y-3 rounded-[1.375rem] border border-line-strong bg-surface p-4">
      <div className="grid grid-cols-2 gap-3">
        <label className={label}>শুরুর আয়াত<input inputMode="numeric" value={from} onChange={(e) => { setFrom(e.target.value); setError(""); }} className={field} /></label>
        <label className={label}>শেষের আয়াত<input inputMode="numeric" value={to} onChange={(e) => { setTo(e.target.value); setError(""); }} className={field} /></label>
        <label className={label}>পুরো অংশ{select(rounds, setRounds)}</label>
        <label className={label}>প্রতি আয়াত{select(options.repeatEach, (n) => setOptions({ repeatEach: n }))}</label>
      </div>
      {error && <p role="alert" className="text-sm text-accent">{error}</p>}
      <button type="submit" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gold font-semibold text-on-gold">
        <Play aria-hidden className="size-4" fill="currentColor" /> শুরু করুন
      </button>
    </form>
  );
}

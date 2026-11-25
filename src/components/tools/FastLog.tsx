"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toBnDigits } from "@/lib/bn";
import { EMPTY_FASTS, FASTS_KEY, readFasts, summary, toggleFast, type Fasts } from "@/lib/tools/fastlog";
import { HIJRI_MONTHS, hijriOf, parseAdjust } from "@/lib/tools/hijri";
import { dayKey, lastDays } from "@/lib/tools/routine";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";

const RESCUE_KEY = "noor.fasts.unreadable";
const parse = (raw: string | null) => {
  const fasts = raw === null ? EMPTY_FASTS : readFasts(raw);
  return fasts ? { fasts, unreadable: null } : { fasts: EMPTY_FASTS, unreadable: raw };
};
const card = "rounded-[1.375rem] border border-line bg-surface p-4";
const shown = new Intl.DateTimeFormat("bn-BD", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const asDate = (day: string) => new Date(`${day}T12:00:00`);

function Inner({ now }: { now: number }) {
  const { fasts, unreadable } = useStored(FASTS_KEY, parse);
  const adjust = useStored("noor.hijri.adjust.v1", parseAdjust);
  const [other, setOther] = useState("");
  const today = new Date(now);
  const day = dayKey(today);
  const counts = summary(fasts, today, adjust);
  const save = (next: Fasts) => {
    if (unreadable !== null) writeStored(RESCUE_KEY, unreadable);
    writeStored(FASTS_KEY, JSON.stringify(next));
  };

  const row = (key: string) => {
    const done = fasts.days.includes(key);
    const hijri = hijriOf(asDate(key), adjust);
    return (
      <li key={key}>
        <button type="button" role="checkbox" aria-checked={done} onClick={() => save(toggleFast(fasts, key))} className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left ${done ? "border-gold bg-active" : "border-line-strong"}`}>
          <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full border ${done ? "border-gold bg-gold text-on-gold" : "border-line-strong"}`}>{done && <Check className="size-4" strokeWidth={3} />}</span>
          <span className="min-w-0">
            <span className="block">{key === day ? "আজ · " : ""}{shown.format(asDate(key))}</span>
            <span className="block text-sm text-muted">{toBnDigits(hijri.day)} {HIJRI_MONTHS[hijri.month - 1]}</span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-2 text-center">
        {([[`রমজান ${toBnDigits(counts.ramadanYear)}-এ`, counts.ramadan], ["চলতি হিজরি মাসে", counts.thisMonth], ["রমজানের বাইরে মোট", counts.outsideRamadan], ["সব মিলিয়ে", counts.total]] as const).map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface px-2 py-3"><dt className="text-sm text-muted">{label}</dt><dd className="font-display text-2xl font-bold text-accent">{toBnDigits(n)}</dd></div>
        ))}
      </dl>
      <section className={card}>
        <h2 className="mb-2 font-display font-semibold">যেদিন রোজা রেখেছেন, টিক দিন</h2>
        <ul className="space-y-2">{lastDays(today, 7).reverse().map(row)}</ul>
      </section>
      <section className={card}>
        <h2 className="mb-2 font-display font-semibold">আগের কোনো দিন</h2>
        <input type="date" aria-label="তারিখ বাছুন" max={day} value={other} onChange={(e) => setOther(e.target.value)} className="mb-2 min-h-11 w-full rounded-2xl border border-line-strong bg-bg px-3 text-text" />
        {other && other <= day && <ul>{row(other)}</ul>}
      </section>
      <p className="text-sm text-muted">এটি শুধু আপনার নিজের হিসাবের খাতা; কোন রোজা ফরজ, নফল বা কাযা তা অ্যাপ ঠিক করে না। হিসাব শুধু এই ফোনে থাকে। হিজরি তারিখ ক্যালেন্ডার পাতার সমন্বয় অনুযায়ী।</p>
    </div>
  );
}

export function FastLog() {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

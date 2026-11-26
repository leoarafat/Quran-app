"use client";

import { useState } from "react";
import { CheckRow } from "@/components/ui/CheckRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { toBnDigits } from "@/lib/bn";
import { EMPTY_FASTS, FASTS_KEY, readFasts, summary } from "@/lib/tools/fastlog";
import { HIJRI_MONTHS, hijriOf, parseAdjust } from "@/lib/tools/hijri";
import { dayKey, lastDays } from "@/lib/tools/routine";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored } from "@/lib/useStored";
import { useSaveFast } from "./useSaveFast";

const parse = (raw: string | null) => (raw === null ? EMPTY_FASTS : (readFasts(raw) ?? EMPTY_FASTS));
const card = "rounded-md border border-ln bg-sf shadow-card";
const shown = new Intl.DateTimeFormat("bn-BD", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const asDate = (day: string) => new Date(`${day}T12:00:00`);

function Inner({ now }: { now: number }) {
  const fasts = useStored(FASTS_KEY, parse);
  const adjust = useStored("noor.hijri.adjust.v1", parseAdjust);
  const toggle = useSaveFast();
  const [other, setOther] = useState("");
  const today = new Date(now);
  const day = dayKey(today);
  const counts = summary(fasts, today, adjust);

  const row = (key: string) => {
    const hijri = hijriOf(asDate(key), adjust);
    return <CheckRow key={key} done={fasts.days.includes(key)} title={`${key === day ? "আজ · " : ""}${shown.format(asDate(key))}`} hint={`${toBnDigits(hijri.day)} ${HIJRI_MONTHS[hijri.month - 1]}`} onToggle={() => toggle(key)} />;
  };

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 text-center">
        {([[`রমজান ${toBnDigits(counts.ramadanYear)}-এ`, counts.ramadan], ["চলতি হিজরি মাসে", counts.thisMonth], ["রমজানের বাইরে মোট", counts.outsideRamadan], ["সব মিলিয়ে", counts.total]] as const).map(([label, n]) => (
          <div key={label} className={`${card} px-2 py-3`}><dt className="text-sm text-ink2">{label}</dt><dd className="font-display text-2xl font-bold text-gt">{toBnDigits(n)}</dd></div>
        ))}
      </dl>
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">যেদিন রোজা রেখেছেন, টিক দিন</h2>
        <ul className={`${card} px-4`}>{lastDays(today, 7).reverse().map(row)}</ul>
      </section>
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">আগের কোনো দিন</h2>
        <input type="date" aria-label="তারিখ বাছুন" max={day} value={other} onChange={(e) => setOther(e.target.value)} className="min-h-12 w-full rounded-md border border-ln2 bg-sf px-3 text-ink" />
        {other && other <= day && <ul className={`${card} mt-2 px-4`}>{row(other)}</ul>}
      </section>
      <p className="text-sm text-ink2">এটি শুধু আপনার নিজের হিসাবের খাতা; কোন রোজা ফরজ, নফল বা কাযা তা অ্যাপ ঠিক করে না। হিসাব শুধু এই ফোনে থাকে। হিজরি তারিখ ক্যালেন্ডার পাতার সমন্বয় অনুযায়ী।</p>
    </div>
  );
}

export function FastLog() {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} /> : <Skeleton className="h-52 !rounded-2xl" />;
}

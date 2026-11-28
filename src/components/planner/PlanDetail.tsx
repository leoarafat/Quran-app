"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressRing";
import { toBnDigits } from "@/lib/bn";
import { dateOfDay, daysBehind, doneCount, isComplete, juzOf, nextDay, pageOf, percent, reschedule, splitRange, toggleDay, type Layout, type ReadingPlan } from "@/lib/tools/planner";
import { outline, refText, shortDate, solid } from "./shared";

export function PlanDetail({ plan, layout, names, today, onChange, onDelete }: { plan: ReadingPlan; layout: Layout; names: string[]; today: string; onChange: (p: ReadingPlan) => void; onDelete: () => void }) {
  const parts = useMemo(() => splitRange(layout, plan.from, plan.to, plan.days), [layout, plan.from, plan.to, plan.days]);
  const [picked, setPicked] = useState(() => nextDay(plan));
  const [confirm, setConfirm] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const part = parts[picked];
  const read = Boolean(plan.done[picked]);
  const late = daysBehind(plan, today);

  // Only the strip scrolls, so the chosen day is in view and the page stays where it is.
  useEffect(() => {
    const box = strip.current;
    const chip = box?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (box && chip) box.scrollLeft = chip.offsetLeft - box.clientWidth / 2 + chip.offsetWidth / 2;
  }, [picked]);

  const point = (label: string, r: { s: number; a: number }) => (
    <li className="relative pl-8">
      <span aria-hidden className={`absolute left-0 top-1.5 size-4 rounded-full border-2 ${read ? "border-ac bg-ac" : "border-ln2 bg-sf"}`} />
      <p className="text-[0.8125rem] text-ink2">{label}</p>
      <p className="font-semibold">{refText(names, r)}</p>
      <p className="text-[0.8125rem] text-ink2">পৃষ্ঠা {toBnDigits(pageOf(layout, r))} · পারা {toBnDigits(juzOf(layout, r))}</p>
    </li>
  );

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => { window.location.hash = ""; }} className="flex min-h-11 items-center gap-1 font-semibold text-ac"><Icon name="back" className="size-5" /> সব প্ল্যান</button>

      <section className="rounded-md border border-ln bg-sf p-4">
        <h2 className="font-display text-xl font-semibold">{plan.name}</h2>
        <p className="text-sm text-ink2">{refText(names, plan.from)} থেকে {refText(names, plan.to)}</p>
        <div className="mt-3 flex items-center gap-3"><ProgressBar value={percent(plan) / 100} className="flex-1 !h-2 [&>span]:!bg-ac" /><b className="text-ac">{toBnDigits(percent(plan))}%</b></div>
        <p className="mt-1 text-[0.8125rem] text-ink2">{toBnDigits(plan.days)} দিনের মধ্যে {toBnDigits(doneCount(plan))} দিন পড়া হয়েছে</p>
      </section>

      {isComplete(plan) && <p role="status" className="rounded-md bg-tint px-4 py-3 text-center font-semibold text-on-tint">আলহামদু লিল্লাহ, প্ল্যানটি সম্পন্ন হয়েছে।</p>}

      {late > 0 && !isComplete(plan) && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 rounded-md bg-gold-soft px-4 py-2 text-sm text-on-gold-soft">
          <p>{toBnDigits(late)} দিনের পড়া বাকি পড়েছে। কোনো অসুবিধা নেই।</p>
          <button type="button" onClick={() => onChange(reschedule(plan, today))} className="min-h-11 font-semibold underline">আজ থেকে তারিখ সাজান</button>
        </div>
      )}

      <div ref={strip} role="group" aria-label="দিন বাছুন" className="rail relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {parts.map((_, i) => (
          <button key={i} type="button" aria-pressed={i === picked} onClick={() => setPicked(i)} aria-label={`দিন ${toBnDigits(i + 1)}, ${shortDate(dateOfDay(plan, i))}${plan.done[i] ? ", পড়া হয়েছে" : ""}`}
            className={`flex min-h-16 w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-md border-2 ${i === picked ? "border-ac bg-ac text-on-ac shadow-card" : "border-ln bg-sf"}`}>
            <span className={`flex items-center gap-1 text-lg font-bold ${plan.done[i] && i !== picked ? "text-ac" : ""}`}>{toBnDigits(i + 1)}{plan.done[i] && <Icon name="check" className="size-4" />}</span>
            <span className={`text-xs ${i === picked ? "font-semibold" : dateOfDay(plan, i) === today ? "font-bold text-ac" : "text-ink2"}`}>{dateOfDay(plan, i) === today ? "আজ" : shortDate(dateOfDay(plan, i))}</span>
          </button>
        ))}
      </div>

      <section aria-label="এই দিনের পড়া" className="rounded-md border border-ln bg-sf p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">দিন {toBnDigits(picked + 1)} <span className="font-normal text-ink2">/ {toBnDigits(plan.days)}</span></h3>
          <span role="status" className={`rounded-full px-3 py-1 text-sm font-semibold ${read ? "bg-tint text-on-tint" : "bg-ln text-ink2"}`}>{read ? "পড়া হয়েছে" : "বাকি আছে"}</span>
        </div>
        <ul className="relative space-y-5 before:absolute before:bottom-6 before:left-[7px] before:top-6 before:w-0.5 before:bg-ln">
          {point("শুরু", part.from)}
          {point("শেষ", part.to)}
        </ul>
      </section>

      <div className="space-y-2">
        <Link href={`/quran/${part.from.s}/#a${part.from.a}`} className={solid}><Icon name="quran" className="size-5" /> পড়া শুরু করুন</Link>
        <button type="button" className={outline} onClick={() => { onChange(toggleDay(plan, picked, today)); }}>{read ? "চিহ্ন তুলে নিন" : <><Icon name="check" className="size-5" /> এই দিনের পড়া শেষ</>}</button>
        {!read ? null : picked + 1 < plan.days && <button type="button" className="min-h-11 w-full font-semibold text-ac" onClick={() => setPicked(picked + 1)}>পরের দিন দেখুন</button>}
      </div>

      <button type="button" aria-haspopup="dialog" onClick={() => setConfirm(true)} className="min-h-11 w-full text-sm text-ink2 underline">এই প্ল্যান মুছুন</button>
      {confirm && (
        <BottomSheet title="প্ল্যান মুছবেন?" onClose={() => setConfirm(false)}>
          <p>“{plan.name}” ও এর অগ্রগতি মুছে যাবে। এটি ফিরিয়ে আনা যাবে না।</p>
          <button type="button" className={outline} onClick={onDelete}>হ্যাঁ, মুছুন</button>
        </BottomSheet>
      )}
    </div>
  );
}

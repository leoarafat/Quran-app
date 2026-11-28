"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressRing";
import { Seg } from "@/components/ui/Seg";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { toBnDigits } from "@/lib/bn";
import { TEMPLATE_GROUPS, type Template } from "@/lib/tools/planTemplates";
import { daysBehind, EMPTY_PLANS, isComplete, nextDay, percent, PLANS_KEY, readPlans, removePlan, splitRange, updatePlan, type Layout, type Plans, type ReadingPlan } from "@/lib/tools/planner";
import { dayKey } from "@/lib/tools/routine";
import { useNow } from "@/lib/useNow";
import { useInBrowser, useStored, writeStored } from "@/lib/useStored";
import { PlanDetail } from "./PlanDetail";
import { CustomSheet, TemplateSheet } from "./PlanSheets";
import { refText } from "./shared";

const RESCUE_KEY = "noor.plans.unreadable";
const parse = (raw: string | null) => {
  const plans = raw === null ? EMPTY_PLANS : readPlans(raw);
  return plans ? { all: plans, unreadable: null } : { all: EMPTY_PLANS, unreadable: raw };
};

/** The open plan lives in the address (#plan-…), so the phone's back button closes it. */
const onHash = (listener: () => void) => { window.addEventListener("hashchange", listener); return () => window.removeEventListener("hashchange", listener); };
const useHash = () => useSyncExternalStore(onHash, () => window.location.hash.slice(1), () => "");

type Tab = "mine" | "find" | "done";

/** A square showing how long a plan is, in place of a picture. */
function Tile({ days }: { days: number }) {
  return (
    <span aria-hidden className="grid size-16 shrink-0 place-content-center rounded-md bg-hero text-center text-on-hero">
      <b className="text-2xl leading-tight">{toBnDigits(days)}</b>
      <span className="text-xs leading-tight text-hero-muted">দিন</span>
    </span>
  );
}

function Inner({ now, layout, names }: { now: number; layout: Layout; names: string[] }) {
  const { all, unreadable } = useStored(PLANS_KEY, parse);
  const today = dayKey(new Date(now));
  const hash = useHash();
  const open = all.plans.find((p) => `plan-${p.id}` === hash);
  const active = all.plans.filter((p) => !isComplete(p));
  const finished = all.plans.filter(isComplete);
  const [tab, setTab] = useState<Tab | null>(null);
  const shown: Tab = tab ?? (active.length ? "mine" : "find");
  const [sheet, setSheet] = useState<Template | "custom" | null>(null);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [open?.id]);

  const save = (next: Plans) => {
    // Data we could not read is set aside first, so saving can never destroy it.
    if (unreadable !== null) writeStored(RESCUE_KEY, unreadable);
    writeStored(PLANS_KEY, JSON.stringify(next));
  };
  const create = (plan: Omit<ReadingPlan, "id" | "start" | "done">) => {
    const made: ReadingPlan = { ...plan, id: `${now.toString(36)}${all.plans.length}`, start: today, done: {} };
    save({ ...all, plans: [made, ...all.plans] });
    setSheet(null);
    setTab("mine");
    showToast("প্ল্যান শুরু হলো");
  };

  if (open) {
    return (
      <PlanDetail
        key={open.id}
        plan={open}
        layout={layout}
        names={names}
        today={today}
        onChange={(p) => save(updatePlan(all, p))}
        onDelete={() => { save(removePlan(all, open.id)); window.location.hash = ""; showToast("প্ল্যান মোছা হলো"); }}
      />
    );
  }

  const row = (p: ReadingPlan) => {
    const part = splitRange(layout, p.from, p.to, p.days)[nextDay(p)];
    const late = daysBehind(p, today);
    return (
      <li key={p.id} className="border-b border-ln last:border-0">
        <a href={`#plan-${p.id}`} className="flex gap-3.5 py-3.5">
          <Tile days={p.days} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{p.name}</span>
            <span className="my-1 flex items-center gap-2.5"><ProgressBar value={percent(p) / 100} className="flex-1 [&>span]:!bg-ac" /><span className="text-sm font-semibold text-ac">{toBnDigits(percent(p))}%</span></span>
            <span className="block truncate text-[0.8125rem] text-ink2">
              {isComplete(p) ? "সম্পন্ন, আলহামদু লিল্লাহ" : `দিন ${toBnDigits(nextDay(p) + 1)}: ${refText(names, part.from)} থেকে`}
            </span>
            {!isComplete(p) && late > 0 && <span className="block text-[0.8125rem] font-semibold text-gt">{toBnDigits(late)} দিনের পড়া বাকি পড়েছে</span>}
          </span>
          <Icon name="chev" className="size-5 shrink-0 self-center text-ink2" />
        </a>
      </li>
    );
  };
  const list = "rounded-md border border-ln bg-sf px-4";
  const createRow = (
    <button type="button" aria-haspopup="dialog" onClick={() => setSheet("custom")} className="flex w-full items-center gap-3.5 rounded-md border border-dashed border-ln2 bg-sf p-4 text-left">
      <span className="grid size-16 shrink-0 place-items-center rounded-md bg-tint text-on-tint"><Icon name="plus" className="size-7" /></span>
      <span><span className="block font-semibold">নিজের প্ল্যান তৈরি করুন</span><span className="block text-[0.8125rem] text-ink2">কোন আয়াত থেকে কোনটি, কত দিনে</span></span>
    </button>
  );

  return (
    <div className="space-y-4">
      <Seg label="প্ল্যানের ভাগ" value={shown} onChange={setTab} options={[{ value: "mine", text: "আমার প্ল্যান" }, { value: "find", text: "প্ল্যান খুঁজুন" }, { value: "done", text: "সম্পন্ন" }]} />

      {shown === "find" && (
        <>
          {TEMPLATE_GROUPS.map((group) => (
            <section key={group.title} aria-label={group.title}>
              <h2 className="mb-2 font-semibold text-ac">{group.title}</h2>
              <ul className={list}>
                {group.items.map((t) => (
                  <li key={t.id} className="border-b border-ln last:border-0">
                    <button type="button" aria-haspopup="dialog" onClick={() => setSheet(t)} className="flex w-full items-center gap-3.5 py-3.5 text-left">
                      <Tile days={t.days} />
                      <span className="min-w-0 flex-1"><span className="block font-semibold leading-snug">{t.name}</span><span className="block text-[0.8125rem] text-ink2">{toBnDigits(t.days)} দিন</span></span>
                      <span className="shrink-0 rounded-full bg-tint px-3.5 py-1.5 text-sm font-semibold text-on-tint">শুরু করুন</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {createRow}
        </>
      )}

      {shown === "mine" && (
        <>
          {active.length ? <ul className={list}>{active.map(row)}</ul> : <EmptyState icon="cal" title="এখনো কোনো প্ল্যান চালু নেই">“প্ল্যান খুঁজুন” থেকে একটি বেছে নিন, অথবা নিজের প্ল্যান বানান।</EmptyState>}
          {createRow}
        </>
      )}

      {shown === "done" && (finished.length ? <ul className={list}>{finished.map(row)}</ul> : <EmptyState icon="trophy" title="এখনো কোনো প্ল্যান শেষ হয়নি">সব দিনের পড়া শেষ হলে প্ল্যানটি এখানে আসবে।</EmptyState>)}

      <p className="text-center text-[0.8125rem] leading-relaxed text-ink2">পড়া শেষ হলে আপনি নিজে চিহ্ন দেন। হিসাব শুধু এই ফোনে থাকে।</p>

      {sheet === "custom" && <CustomSheet layout={layout} names={names} onCreate={create} onClose={() => setSheet(null)} />}
      {sheet && sheet !== "custom" && <TemplateSheet template={sheet} layout={layout} names={names} onCreate={create} onClose={() => setSheet(null)} />}
    </div>
  );
}

export function Planner(props: { layout: Layout; names: string[] }) {
  const ready = useInBrowser();
  const now = useNow();
  return ready && now !== null ? <Inner now={now} {...props} /> : <Skeleton className="h-40 !rounded-2xl" />;
}

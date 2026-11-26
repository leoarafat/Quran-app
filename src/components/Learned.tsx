"use client";

import { Icon } from "@/components/ui/Icon";
import { LEARNED_KEY, parseLearned, toggleLearned } from "@/lib/tools/learned";
import { useStored, writeStored } from "@/lib/useStored";

/** At the end of a lesson: the visitor's own mark that it is learned. */
export function LearnedToggle({ href }: { href: string }) {
  const list = useStored(LEARNED_KEY, parseLearned);
  const done = list.includes(href);
  return (
    <button type="button" aria-pressed={done} onClick={() => writeStored(LEARNED_KEY, JSON.stringify(toggleLearned(list, href)))} className={`flex min-h-13 w-full items-center justify-center gap-2 rounded-full font-semibold ${done ? "bg-ac text-on-ac" : "bg-gold-soft text-on-gold-soft"}`}>
      <Icon name="check" className="size-5" /> {done ? "শেখা হয়েছে" : "শেখা হয়েছে চিহ্নিত করুন"}
    </button>
  );
}

/** Beside a lesson's name in the list. */
export function LearnedMark({ href }: { href: string }) {
  const done = useStored(LEARNED_KEY, parseLearned).includes(href);
  if (!done) return null;
  return <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ac text-on-ac"><Icon name="check" className="size-3.5" /><span className="sr-only">শেখা হয়েছে</span></span>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { toBnDigits } from "@/lib/bn";
import type { GradeClass } from "@/lib/hadith/types";
import { GradeBadge } from "./GradeBadge";

const PAGE = 40;
const FILTERS = [["all", "সব"], ["sahih", "সহিহ"], ["hasan", "হাসান"]] as const;

export function HadithList({ items }: { items: { id: number; title: string; grade: GradeClass }[] }) {
  const [grade, setGrade] = useState<"all" | GradeClass>("all");
  const [limit, setLimit] = useState(PAGE);
  const list = items.filter((i) => grade === "all" || i.grade === grade);
  const chip = (on: boolean) => `min-h-11 rounded-full border px-4 ${on ? "border-brand bg-brand font-semibold text-on-brand" : "border-line-strong bg-surface"}`;

  return (
    <div className="space-y-3">
      <div role="group" aria-label="হাদিসের মান" className="flex gap-2">
        {FILTERS.map(([key, label]) => <button key={key} type="button" aria-pressed={grade === key} className={chip(grade === key)} onClick={() => { setGrade(key); setLimit(PAGE); }}>{label}</button>)}
      </div>
      <p role="status" className="text-sm text-muted">{toBnDigits(list.length)}টি হাদিস</p>
      <ul className="space-y-2">
        {list.slice(0, limit).map((h) => (
          <li key={h.id}>
            <Link href={`/hadith/${h.id}/`} prefetch={false} className="flex items-start gap-3 rounded-[1.375rem] border border-line bg-surface p-4 hover:border-brand">
              <span className="line-clamp-3 min-w-0 flex-1 leading-relaxed">{h.title}</span>
              <GradeBadge cls={h.grade} />
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="rounded-[1.375rem] border border-dashed border-line-strong p-5 text-center text-muted">এই মানের কোনো হাদিস এখানে নেই।</p>}
      {list.length > limit && <button type="button" className={`${chip(false)} mx-auto block`} onClick={() => setLimit((n) => n + PAGE)}>আরও দেখুন (বাকি {toBnDigits(list.length - limit)}টি)</button>}
    </div>
  );
}

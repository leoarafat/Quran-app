"use client";

import Link from "next/link";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { toBnDigits } from "@/lib/bn";
import type { GradeClass } from "@/lib/hadith/types";
import { GradeBadge } from "./GradeBadge";

const PAGE = 40;
const FILTERS = [["all", "সব"], ["sahih", "সহিহ"], ["hasan", "হাসান"]] as const;

export function HadithList({ items }: { items: { id: number; title: string; grade: GradeClass; note?: string }[] }) {
  const [grade, setGrade] = useState<"all" | GradeClass>("all");
  const [limit, setLimit] = useState(PAGE);
  const list = items.filter((i) => grade === "all" || i.grade === grade);

  return (
    <div className="space-y-3">
      <div role="group" aria-label="হাদিসের মান" className="flex gap-2">
        {FILTERS.map(([key, label]) => <Chip key={key} aria-pressed={grade === key} selected={grade === key} onClick={() => { setGrade(key); setLimit(PAGE); }}>{label}</Chip>)}
      </div>
      <p role="status" className="text-sm text-ink2">{toBnDigits(list.length)}টি হাদিস</p>
      <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {list.slice(0, limit).map((h) => (
          <li key={h.id}>
            <Link href={`/hadith/${h.id}/`} prefetch={false} className="flex h-full items-start gap-3 rounded-md border border-ln bg-sf p-4 shadow-card">
              <span className="min-w-0 flex-1">
                <span className="line-clamp-3 leading-relaxed">{h.title}</span>
                {h.note && <span className="mt-1 block text-[0.8125rem] text-ink2">{h.note}</span>}
              </span>
              <GradeBadge cls={h.grade} />
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <EmptyState icon="hadith" title="এই মানের কোনো হাদিস এখানে নেই">অন্য মান বেছে দেখুন।</EmptyState>}
      {list.length > limit && <Chip className="w-full" onClick={() => setLimit((n) => n + PAGE)}>আরও দেখুন (বাকি {toBnDigits(list.length - limit)}টি)</Chip>}
    </div>
  );
}

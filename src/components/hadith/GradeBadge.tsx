import type { GradeClass } from "@/lib/hadith/types";

export const GRADE_LABEL: Record<GradeClass, string> = { sahih: "সহিহ", hasan: "হাসান" };

export function GradeBadge({ cls }: { cls: GradeClass }) {
  return <span className={`shrink-0 rounded-full px-3 py-0.5 text-[0.8125rem] font-semibold ${cls === "sahih" ? "bg-gold text-on-gold" : "border border-gold text-accent"}`}>{GRADE_LABEL[cls]}</span>;
}

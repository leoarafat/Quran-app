import { LessonIndex, type IndexItem, type IndexPart } from "@/components/LessonIndex";

/**
 * A lesson of a course. On large screens a sidebar keeps the whole course, and the open
 * lesson's parts, in view; on phones the sidebar is not shown and the page reads top to bottom.
 */
export function LessonShell({ course, lessons, current, parts = [], children }: { course: IndexItem; lessons: IndexItem[]; current: string; parts?: IndexPart[]; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl lg:grid lg:max-w-none lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      <LessonIndex course={course} lessons={lessons} current={current} parts={parts.map(({ id, title, isNew }) => ({ id, title, isNew }))} />
      <div className="min-w-0 space-y-4 lg:max-w-[52rem]">{children}</div>
    </div>
  );
}

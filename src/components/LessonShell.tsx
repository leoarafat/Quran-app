import Link from "next/link";

type Item = { href: string; title: string };

/**
 * A lesson of a course. On large screens a sidebar keeps the whole course, and the open
 * lesson's parts, in view; on phones the sidebar is not shown and the page reads top to bottom.
 */
export function LessonShell({ course, lessons, current, parts = [], children }: { course: Item; lessons: Item[]; current: string; parts?: { id: string; title: string }[]; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl lg:grid lg:max-w-none lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      <aside aria-label={`${course.title}: পাঠের সূচি`} className="sticky top-[calc(var(--header-h)+1rem)] hidden max-h-[calc(100dvh-var(--header-h)-2rem)] overflow-y-auto rounded-[1.375rem] border border-line bg-surface p-3 lg:block">
        <Link href={course.href} className="block px-3 py-2 font-display text-lg font-semibold text-accent">{course.title}</Link>
        <ol className="space-y-0.5">
          {lessons.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={l.href === current ? "page" : undefined} className={`block rounded-xl px-3 py-2 text-[0.9375rem] leading-snug ${l.href === current ? "bg-active font-semibold text-accent" : "text-muted hover:text-text"}`}>{l.title}</Link>
              {l.href === current && parts.length > 0 && (
                <ul className="mb-2 ml-4 mt-1 border-l border-line-strong">
                  {parts.map((p) => <li key={p.id}><a href={`#${p.id}`} className="block py-1.5 pl-3 text-sm leading-snug text-soft hover:text-accent">{p.title}</a></li>)}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </aside>
      <div className="min-w-0 space-y-4 lg:max-w-[52rem]">{children}</div>
    </div>
  );
}

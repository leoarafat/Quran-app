"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type IndexItem = { href: string; title: string; badge?: string };
export type IndexPart = { id: string; title: string; isNew?: boolean };

/** How far below the top of the window a part's heading counts as "being read". */
const LINE = 160;

function Badge({ label, onAccent = false }: { label: string; onAccent?: boolean }) {
  return <span className={`ml-1.5 inline-block whitespace-nowrap rounded-full px-1.5 align-middle text-[0.6875rem] font-semibold leading-5 ${onAccent ? "bg-on-ac text-ac" : "bg-gold-soft text-on-gold-soft"}`}>{label}</span>;
}

/**
 * The course in a lesson's side column. The open lesson is filled with the accent colour, and
 * under it the part being read is marked as the page scrolls.
 */
export function LessonIndex({ course, lessons, current, parts }: { course: IndexItem; lessons: IndexItem[]; current: string; parts: IndexPart[] }) {
  const box = useRef<HTMLElement>(null);
  const [reading, setReading] = useState(parts[0]?.id ?? "");

  useEffect(() => {
    if (!parts.length) return;
    let frame = 0;
    const mark = () => {
      frame = 0;
      let found = parts[0].id;
      for (const p of parts) {
        const top = document.getElementById(p.id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= LINE) found = p.id;
      }
      // The last part may be too short ever to reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) found = parts[parts.length - 1].id;
      setReading(found);
    };
    const later = () => { frame ||= requestAnimationFrame(mark); };
    later();
    window.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later);
    return () => { window.removeEventListener("scroll", later); window.removeEventListener("resize", later); cancelAnimationFrame(frame); };
  }, [parts]);

  // Only this column scrolls, so the marked line is always in sight and the page stays put.
  useEffect(() => {
    const column = box.current;
    const row = column?.querySelector<HTMLElement>("[aria-current=location]") ?? column?.querySelector<HTMLElement>("[aria-current=page]");
    if (!column || !row) return;
    const at = row.getBoundingClientRect().top - column.getBoundingClientRect().top;
    if (at < 56 || at > column.clientHeight - 72) column.scrollTop += at - column.clientHeight / 3;
  }, [reading, current]);

  return (
    <aside ref={box} aria-label={`${course.title}: পাঠের সূচি`} className="sticky top-4 hidden max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-md border border-ln bg-sf p-3 lg:block">
      <Link href={course.href} className="block rounded-xl px-3 py-2 font-display text-lg font-semibold text-ac hover:bg-tint">{course.title}</Link>
      <ol className="space-y-0.5">
        {lessons.map((l) => {
          const open = l.href === current;
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={open ? "page" : undefined} className={`block rounded-xl px-3 py-2 text-[0.9375rem] leading-snug ${open ? "bg-ac font-semibold text-on-ac shadow-card" : "text-ink2 hover:bg-tint hover:text-ink"}`}>
                {l.title}{l.badge && <Badge label={l.badge} onAccent={open} />}
              </Link>
              {open && parts.length > 0 && (
                <ul className="mb-2 ml-3 mt-1.5 space-y-0.5 border-l-2 border-ln2">
                  {parts.map((p) => {
                    const here = p.id === reading;
                    return (
                      <li key={p.id} className="-ml-0.5">
                        <a href={`#${p.id}`} onClick={() => setReading(p.id)} aria-current={here ? "location" : undefined} className={`block rounded-r-lg border-l-4 py-2 pl-2.5 pr-2 text-sm leading-snug ${here ? "border-ac bg-tint font-semibold text-on-tint" : "border-transparent text-ink hover:bg-ln"}`}>
                          {p.title}{p.isNew && <Badge label="নতুন" />}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

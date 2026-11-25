import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LessonBlock } from "@/components/namaz/LessonBlocks";
import { LessonShell } from "@/components/LessonShell";
import { PageHeader } from "@/components/PageHeader";
import { LESSONS, lessonPath, REVIEW_NOTICE } from "@/lib/namaz";

export const dynamicParams = false;

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lesson: l.slug }));
}

const find = (slug: string) => LESSONS.findIndex((l) => l.slug === slug);

export async function generateMetadata({ params }: PageProps<"/namaz/[lesson]">): Promise<Metadata> {
  const lesson = LESSONS[find((await params).lesson)];
  return lesson ? { title: lesson.title } : {};
}

export default async function LessonPage({ params }: PageProps<"/namaz/[lesson]">) {
  const at = find((await params).lesson);
  const lesson = LESSONS[at];
  if (!lesson) notFound();
  const previous = LESSONS[at - 1];
  const next = LESSONS[at + 1];
  const step = "flex min-h-14 flex-1 items-center gap-2 rounded-[1.375rem] border border-line-strong bg-surface px-3 py-2 text-sm font-semibold hover:border-brand";

  return (
    <LessonShell course={{ href: "/namaz/", title: "নামাজ শিক্ষা" }} lessons={LESSONS.map((l) => ({ href: lessonPath(l.slug), title: l.title }))} current={lessonPath(lesson.slug)} parts={lesson.sections}>
      <nav aria-label="বিষয়ের পথ" className="lg:hidden"><Link href="/namaz/" className="inline-flex min-h-11 items-center text-sm text-accent underline">‹ নামাজ শিক্ষার সব পাঠ</Link></nav>
      <PageHeader title={lesson.title} subtitle={lesson.hint} />
      <p className="reading leading-relaxed">{lesson.intro}</p>
      <p className="rounded-2xl border border-dashed border-line-strong px-3 py-2 text-sm leading-relaxed text-muted">{REVIEW_NOTICE}</p>
      <nav aria-label="এই পাঠের অংশ" className="lg:hidden">
        <ul className="flex flex-wrap gap-2">
          {lesson.sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-3 py-1 text-sm font-semibold text-accent">{s.title}</a></li>
          ))}
        </ul>
      </nav>
      {lesson.sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-2 space-y-3 pt-2">
          <h2 className="font-display text-xl font-semibold leading-snug">{s.title}</h2>
          {s.blocks.map((block, i) => <LessonBlock key={i} block={block} anchor={`${s.id}-${i}-`} />)}
        </section>
      ))}
      <nav aria-label="আগের ও পরের পাঠ" className="flex flex-col gap-2 sm:flex-row">
        {previous && <Link href={lessonPath(previous.slug)} className={step}><ChevronLeft aria-hidden className="size-5 shrink-0 text-accent" /><span className="min-w-0"><span className="block text-muted">আগের পাঠ</span>{previous.title}</span></Link>}
        {next && <Link href={lessonPath(next.slug)} className={`${step} justify-between text-right`}><span className="min-w-0 flex-1"><span className="block text-muted">পরের পাঠ</span>{next.title}</span><ChevronRight aria-hidden className="size-5 shrink-0 text-accent" /></Link>}
      </nav>
    </LessonShell>
  );
}

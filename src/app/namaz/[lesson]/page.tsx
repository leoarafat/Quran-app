import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonBlock } from "@/components/namaz/LessonBlocks";
import { LessonShell } from "@/components/LessonShell";
import { LearnedToggle } from "@/components/Learned";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { LESSONS, lessonPath, REVIEW_NOTICE } from "@/lib/namaz";
import { Icon } from "@/components/ui/Icon";

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
  const step = "flex min-h-14 flex-1 items-center gap-2 rounded-md border border-ln2 bg-sf px-3 py-2 text-sm font-semibold hover:border-ac";

  return (
    <LessonShell course={{ href: "/namaz/", title: "নামাজ শিক্ষা" }} lessons={LESSONS.map((l) => ({ href: lessonPath(l.slug), title: l.title }))} current={lessonPath(lesson.slug)} parts={lesson.sections}>
      <nav aria-label="বিষয়ের পথ" className="max-md:hidden lg:hidden"><Link href="/namaz/" className="inline-flex min-h-11 items-center text-sm text-gt underline">‹ নামাজ শিক্ষার সব পাঠ</Link></nav>
      <ScreenHeader title={lesson.title} back={{ href: "/namaz/", label: "নামাজ শিক্ষায় ফিরে যান" }} />
      <p className="text-[0.9375rem] text-ink2">{lesson.hint}</p>
      <p className="reading leading-relaxed">{lesson.intro}</p>
      <p className="rounded-2xl border border-dashed border-ln2 px-3 py-2 text-sm leading-relaxed text-ink2">{REVIEW_NOTICE}</p>
      <nav aria-label="এই পাঠের অংশ" className="lg:hidden">
        <ul className="flex flex-wrap gap-2">
          {lesson.sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="flex min-h-11 items-center rounded-full border border-ln2 bg-sf px-3 py-1 text-sm font-semibold text-gt">{s.title}</a></li>
          ))}
        </ul>
      </nav>
      {lesson.sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-2 space-y-3 pt-2">
          <h2 className="font-display text-xl font-semibold leading-snug">{s.title}</h2>
          {s.blocks.map((block, i) => <LessonBlock key={i} block={block} anchor={`${s.id}-${i}-`} />)}
        </section>
      ))}
      <LearnedToggle href={lessonPath(lesson.slug)} />
      <nav aria-label="আগের ও পরের পাঠ" className="flex flex-col gap-2 sm:flex-row">
        {previous && <Link href={lessonPath(previous.slug)} className={step}><Icon name="back" className="size-5 shrink-0 text-gt" /><span className="min-w-0"><span className="block text-ink2">আগের পাঠ</span>{previous.title}</span></Link>}
        {next && <Link href={lessonPath(next.slug)} className={`${step} justify-between text-right`}><span className="min-w-0 flex-1"><span className="block text-ink2">পরের পাঠ</span>{next.title}</span><Icon name="chev" className="size-5 shrink-0 text-gt" /></Link>}
      </nav>
    </LessonShell>
  );
}

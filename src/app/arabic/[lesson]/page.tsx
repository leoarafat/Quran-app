import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LessonShell } from "@/components/LessonShell";
import { PageHeader } from "@/components/PageHeader";
import { findRuleExamples, QAIDA, qaidaPath } from "@/lib/arabic/qaida";
import { exampleAyahs } from "@/lib/arabic/server";
import { toBnDigits } from "@/lib/bn";
import { getIndex } from "@/lib/quran/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return QAIDA.map((l) => ({ lesson: l.slug }));
}

const find = (slug: string) => QAIDA.findIndex((l) => l.slug === slug);

export async function generateMetadata({ params }: PageProps<"/arabic/[lesson]">): Promise<Metadata> {
  const lesson = QAIDA[find((await params).lesson)];
  return lesson ? { title: lesson.title } : {};
}

const card = "rounded-[1.375rem] border border-line bg-surface p-4";

export default async function QaidaPage({ params }: PageProps<"/arabic/[lesson]">) {
  const at = find((await params).lesson);
  const lesson = QAIDA[at];
  if (!lesson) notFound();
  const { surahs } = getIndex();
  const rules = lesson.examples ?? [];
  const examples = findRuleExamples(exampleAyahs(), rules);
  const previous = QAIDA[at - 1];
  const next = QAIDA[at + 1];
  const step = "flex min-h-14 flex-1 items-center gap-2 rounded-[1.375rem] border border-line-strong bg-surface px-3 py-2 text-sm font-semibold hover:border-brand";

  return (
    <LessonShell course={{ href: "/arabic/", title: "আরবি শিখুন" }} lessons={QAIDA.map((l) => ({ href: qaidaPath(l.slug), title: l.title }))} current={qaidaPath(lesson.slug)}>
      <nav aria-label="বিষয়ের পথ" className="lg:hidden"><Link href="/arabic/" className="inline-flex min-h-11 items-center text-sm text-accent underline">‹ আরবি শিখুন: সব পাঠ</Link></nav>
      <PageHeader title={lesson.title} subtitle={`পাঠ ${toBnDigits(at + 1)}/${toBnDigits(QAIDA.length)}`} />
      <p className="reading leading-relaxed">{lesson.intro}</p>
      <p className="rounded-2xl border border-dashed border-line-strong px-3 py-2 text-sm leading-relaxed text-muted">নিয়মের বর্ণনা আমাদের লেখা, ক্বারীর যাচাই বাকি। অনুশীলনের ঘরগুলো শুধু উচ্চারণ চর্চার জন্য, সব ঘর অর্থবোধক শব্দ নয়। উচ্চারণ অবশ্যই শিক্ষককে শুনিয়ে ঠিক করুন।</p>
      {lesson.points && (
        <ul className={`${card} list-disc space-y-1.5 pl-9 leading-relaxed marker:text-accent`}>{lesson.points.map((p) => <li key={p} className="reading">{p}</li>)}</ul>
      )}
      {lesson.tables?.map((table) => (
        <section key={table.title} className={card}>
          <h2 className="font-display text-lg font-semibold">{table.title}</h2>
          <dl className="mt-1 divide-y divide-line">
            {table.rows.map(([sign, meaning]) => (
              <div key={sign + meaning} className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 py-1">
                {/^\p{M}$/u.test(sign)
                  // a pause sign alone is tiny and floats high: draw it large on a short baseline stroke
                  ? <dt lang="ar" dir="rtl" className="pt-6 text-center font-arabic text-5xl leading-[1.6]">{`\u0640${sign}`}</dt>
                  : <dt lang="ar" dir="rtl" className="text-center font-arabic text-2xl leading-[2.6]">{sign}</dt>}
                <dd className="reading leading-relaxed">{meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {lesson.drills?.map((drill) => (
        <section key={drill.title} className="space-y-2">
          <h2 className="font-display text-lg font-semibold">{drill.title}</h2>
          <ul dir="rtl" className="grid grid-cols-4 gap-2 min-[30rem]:grid-cols-6 sm:grid-cols-7">
            {drill.cells.map((cell, i) => <li key={i} lang="ar" className="rounded-2xl border border-line bg-surface pb-4 pt-1 text-center font-arabic text-3xl leading-[2]">{cell}</li>)}
          </ul>
        </section>
      ))}
      {rules.map((rule, i) => examples[i].length > 0 && (
        <section key={rule.label} className="space-y-2">
          <h2 className="font-display text-lg font-semibold">{rule.label}</h2>
          <ul dir="rtl" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {examples[i].map((e) => (
              <li key={`${e.s}:${e.a}:${e.text}`}>
                <Link href={`/quran/${e.s}/#a${e.a}`} prefetch={false} className="flex h-full flex-col items-center justify-center rounded-2xl border border-line bg-surface px-2 pb-2 text-center hover:border-brand">
                  <span lang="ar" className="pb-3 font-arabic text-3xl leading-[2.2]">{e.text}</span>
                  <span dir="ltr" className="text-sm text-muted">{surahs[e.s - 1].bangla} {toBnDigits(e.s)}:{toBnDigits(e.a)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {rules.length > 0 && <p className="text-sm leading-relaxed text-muted">শব্দগুলো কুরআনের লেখা (Tanzil.net) থেকে যন্ত্রে বাছাই করা। কোনো শব্দে চাপলে পুরো আয়াত খুলবে, সেখানে তিলাওয়াত শুনতে পারবেন।</p>}
      <nav aria-label="আগের ও পরের পাঠ" className="flex flex-col gap-2 sm:flex-row">
        {previous && <Link href={qaidaPath(previous.slug)} className={step}><ChevronLeft aria-hidden className="size-5 shrink-0 text-accent" /><span className="min-w-0"><span className="block text-muted">আগের পাঠ</span>{previous.title}</span></Link>}
        {next && <Link href={qaidaPath(next.slug)} className={`${step} justify-between text-right`}><span className="min-w-0 flex-1"><span className="block text-muted">পরের পাঠ</span>{next.title}</span><ChevronRight aria-hidden className="size-5 shrink-0 text-accent" /></Link>}
      </nav>
    </LessonShell>
  );
}

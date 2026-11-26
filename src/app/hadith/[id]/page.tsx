import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { GradeBadge } from "@/components/hadith/GradeBadge";
import { HadithActions } from "@/components/hadith/HadithActions";
import { SourceNote } from "@/components/hadith/SourceNote";
import { Icon } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import { getHadith, getHadithIndex } from "@/lib/hadith/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(getHadithIndex().index.titles).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/hadith/[id]">): Promise<Metadata> {
  const { id } = await params;
  const entry = getHadithIndex().index.titles[id];
  return entry ? { title: entry[0].slice(0, 70), description: entry[0] } : {};
}

export default async function HadithDetailPage({ params }: PageProps<"/hadith/[id]">) {
  const { id } = await params;
  const { index, categories } = getHadithIndex();
  if (!index.titles[id]) notFound();
  const h = getHadith(Number(id));
  const bukhari = h.bukhari?.map((n) => toBnDigits(n)).join(", ");
  const share = `${h.hadeeth}\n\nমান: ${h.grade}\nবর্ণনা: ${h.attribution}\nউৎস: ${index.meta.publisher} (ফাইলের তারিখ ${index.meta.fileDate})`;
  const card = "rounded-md border border-ln bg-sf p-4 shadow-card";
  const group = h.categories[0] ? categories.get(h.categories[0]) : undefined;
  // Neighbours in the publisher's own group.
  const at = group?.hadiths.indexOf(h.id) ?? -1;
  const previous = at > 0 ? group!.hadiths[at - 1] : undefined;
  const next = at >= 0 ? group!.hadiths[at + 1] : undefined;
  const around = "flex min-h-11 items-center gap-1 font-semibold text-ac";

  return (
    <article className="mx-auto max-w-2xl lg:max-w-3xl">
      <ScreenHeader title="হাদিস" back={{ href: group ? `/hadith/c/${group.id}/` : "/hadith/", label: "হাদিসের তালিকায় ফিরে যান" }} />
      <div className="space-y-4">
        {group && <Link href={`/hadith/c/${group.id}/`} className="inline-flex min-h-11 items-center text-[0.8125rem] text-ink2">{group.title}{at >= 0 && ` · হাদিস ${toBnDigits(at + 1)} / ${toBnDigits(group.hadiths.length)}`}</Link>}
        <h2 className="font-display text-xl font-semibold leading-relaxed">{h.title}</h2>

        <div className={`${card} space-y-3`}>
          <GradeBadge cls={h.gradeClass} />
          <p lang="ar" dir="rtl" className="whitespace-pre-line font-arabic text-[calc(1.5rem*var(--ar-scale))] leading-[2.3]">{h.arabic}</p>
          <p className="reading whitespace-pre-line text-[calc(1.0625rem*var(--bn-scale))] leading-[1.9]">{h.hadeeth}</p>
          <dl className="space-y-1 border-t border-ln pt-3 text-sm">
            {!["সহীহ", "হাসান"].includes(h.grade.trim()) && <div className="flex gap-2"><dt className="shrink-0 text-ink2">মান:</dt><dd>{h.grade}</dd></div>}
            <div className="flex gap-2"><dt className="shrink-0 text-ink2">বর্ণনা:</dt><dd className="min-w-0 whitespace-pre-line">{h.attribution}</dd></div>
            {bukhari && <div className="flex gap-2"><dt className="shrink-0 text-ink2">নম্বর:</dt><dd>বুখারী {bukhari} <span className="block text-[0.8125rem] text-ink2">যন্ত্রে মিলিয়ে পাওয়া; ছাপা কিতাবে মিলিয়ে নিন।</span></dd></div>}
          </dl>
        </div>

        <HadithActions id={h.id} text={share} />

        <section>
          <h2 className="mb-1 font-display text-lg font-semibold">ব্যাখ্যা</h2>
          <p className="reading whitespace-pre-line leading-[1.9]">{h.explanation}</p>
        </section>

        {h.hints.length > 0 && (
          <section className={card}>
            <h2 className="mb-2 font-display font-semibold">এ হাদিস থেকে শিক্ষা</h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed">{h.hints.map((hint, i) => <li key={i}>{hint}</li>)}</ul>
          </section>
        )}

        {(previous || next) && (
          <nav aria-label="আগের ও পরের হাদিস" className="flex justify-between gap-3">
            {previous ? <Link href={`/hadith/${previous}/`} prefetch={false} className={around}><Icon name="back" className="size-5" /> আগের হাদিস</Link> : <span />}
            {next ? <Link href={`/hadith/${next}/`} prefetch={false} className={around}>পরের হাদিস <Icon name="chev" className="size-5" /></Link> : <span />}
          </nav>
        )}

        <nav aria-label="সম্পর্কিত বিষয়" className="flex flex-wrap gap-2">
          {h.categories.map((c) => <Link key={c} href={`/hadith/c/${c}/`} prefetch={false} className="flex min-h-11 items-center rounded-full border border-ln2 bg-sf px-4 text-sm">{categories.get(c)!.title}</Link>)}
        </nav>
        <SourceNote meta={index.meta} />
      </div>
    </article>
  );
}

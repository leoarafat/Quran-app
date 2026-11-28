import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayFrom } from "@/components/amalSurah/PlayButton";
import { Reading } from "@/components/amalSurah/Reading";
import { GradeBadge } from "@/components/hadith/GradeBadge";
import { SourceNote } from "@/components/hadith/SourceNote";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { Icon } from "@/components/ui/Icon";
import { AMAL_SURAHS, amalSurahPath } from "@/lib/amalSurahs";
import { toBnDigits } from "@/lib/bn";
import { getHadith, getHadithIndex } from "@/lib/hadith/server";
import { getIndex, getSurah } from "@/lib/quran/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return AMAL_SURAHS.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: PageProps<"/amal/surah/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: AMAL_SURAHS.find((x) => x.slug === slug)?.title };
}

export default async function AmalSurahDetail({ params }: PageProps<"/amal/surah/[slug]">) {
  const { slug } = await params;
  const place = AMAL_SURAHS.findIndex((x) => x.slug === slug);
  const item = AMAL_SURAHS[place];
  if (!item) notFound();
  const { surahs, sources } = getIndex();
  const data = getSurah(item.s);
  const lines = data.ayahs.slice(item.from - 1, item.to).map(({ a, ar, tr, bn }) => ({ a, ar, tr, bn }));
  const previous = AMAL_SURAHS[place - 1];
  const next = AMAL_SURAHS[place + 1];
  const step = "flex min-h-14 flex-1 items-center gap-2 rounded-md border border-ln2 bg-sf px-3 py-2 text-sm font-semibold hover:border-ac";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <ScreenHeader title={item.title} back={{ href: "/amal/surah/", label: "আমলের সূরার তালিকায় ফিরে যান" }} />
      <h2 className="font-display text-xl font-bold max-md:hidden">{item.title}</h2>
      <p className="text-sm text-ink2">সূরা {surahs[item.s - 1].bangla} · আয়াত {toBnDigits(item.from)}{item.to > item.from && `-${toBnDigits(item.to)}`} · তালিকার {toBnDigits(place + 1)}/{toBnDigits(AMAL_SURAHS.length)}</p>
      <PlayFrom place={place} counts={surahs.map((s) => s.ayahs)} wide />

      <section aria-labelledby="virtue" className="space-y-2.5">
        <h2 id="virtue" className="font-display text-lg font-bold">ফজিলত ও আমল: হাদিস থেকে</h2>
        {item.note && <p className="rounded-md bg-gold-soft px-4 py-2.5 text-sm leading-relaxed text-on-gold-soft">{item.note}</p>}
        {item.hadiths.length === 0 && (
          <p className="rounded-md border border-dashed border-ln2 px-4 py-3 text-sm leading-relaxed text-ink2">
            আমাদের হাদিস সংকলনে এই অংশের ফজিলত নিয়ে সহিহ বা হাসান হাদিস পাওয়া যায়নি। তাই এখানে কোনো ফজিলত লেখা হয়নি। এ বিষয়ে নির্ভরযোগ্য আলেমের কাছে জেনে নিন।
          </p>
        )}
        {item.hadiths.map((id) => {
          const h = getHadith(id);
          return (
            <article key={id} className="space-y-2 rounded-md border border-ln bg-sf p-4 shadow-card">
              <div className="flex items-start justify-between gap-3"><p className="text-[0.8125rem] text-ink2">{h.attribution}</p><GradeBadge cls={h.gradeClass} /></div>
              <p className="reading leading-relaxed">{h.hadeeth}</p>
              <p className="text-[0.8125rem] text-ink2">মান: {h.grade}</p>
              <Link href={`/hadith/${id}/`} prefetch={false} className="inline-flex min-h-11 items-center text-sm font-semibold text-ac underline">আরবি ও ব্যাখ্যা দেখুন</Link>
            </article>
          );
        })}
        {item.hadiths.length > 0 && <SourceNote meta={getHadithIndex().index.meta} />}
      </section>

      <section aria-labelledby="text" className="space-y-2.5">
        <h2 id="text" className="font-display text-lg font-bold">পড়ুন</h2>
        {item.from === 1 && data.basmalah && <p lang="ar" dir="rtl" className="text-center font-arabic text-3xl leading-[2.2]">{data.basmalah}</p>}
        <Reading place={place} lines={lines} />
        <p className="text-[0.8125rem] leading-relaxed text-ink2">অনুবাদ: রুওয়্যাদ অনুবাদ কেন্দ্র (QuranEnc.com v{sources.translation.version}) · আরবি: Tanzil.net · বাংলা উচ্চারণ স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি।</p>
      </section>

      <nav aria-label="আগের ও পরের" className="flex flex-col gap-2 sm:flex-row">
        {previous && <Link href={amalSurahPath(previous.slug)} className={step}><Icon name="back" className="size-5 shrink-0 text-ac" /><span>{previous.title}</span></Link>}
        {next && <Link href={amalSurahPath(next.slug)} className={`${step} justify-between text-right`}><span className="flex-1">{next.title}</span><Icon name="chev" className="size-5 shrink-0 text-ac" /></Link>}
      </nav>
    </div>
  );
}

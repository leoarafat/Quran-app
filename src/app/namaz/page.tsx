import type { Metadata } from "next";
import Link from "next/link";
import { SourceNote } from "@/components/hadith/SourceNote";
import { NamazHub } from "@/components/namaz/NamazHub";
import { QuranPassages } from "@/components/quran/QuranPassages";
import { Icon, type IconName } from "@/components/ui/Icon";
import { toBnDigits } from "@/lib/bn";
import { getHadithIndex } from "@/lib/hadith/server";
import { lessonBadge, LESSONS, lessonPath, REVIEW_NOTICE } from "@/lib/namaz";
import { getPassages } from "@/lib/quran/passages";
import { TOPICS } from "@/lib/topics";
import { VIDEOS } from "@/lib/videos";

export const metadata: Metadata = { title: TOPICS.namaz.title };

const LINKS: { href: string; title: string; hint: string; icon: IconName }[] = [
  ...VIDEOS.map((v) => ({ href: `/hadith/c/${v.category}/`, title: v.title, hint: "বাংলা ভিডিও, সাবটাইটেলসহ", icon: "play" as const })),
  { href: "/prayer-times/", title: "নামাজের সময়", hint: "আপনার শহরের আজকের সময়", icon: "clock" },
  { href: "/qibla/", title: "কিবলা", hint: "দিক নির্ণয়", icon: "qibla" },
  { href: "/amal/after-salah/", title: "নামাজের পরের আমল", hint: "হাদিস ও আয়াত", icon: "repeat" },
];

export default function NamazPage() {
  const topic = TOPICS.namaz;
  const { index, categories } = getHadithIndex();
  const { passages, credit } = getPassages(topic.passages);
  const groups = topic.groups.map((g) => ({
    title: g.title,
    // A missing group means the data changed: stop the build rather than silently show less.
    categories: g.categories.map((id) => {
      const category = categories.get(id);
      if (!category || category.count === 0) throw new Error(`Hadith group ${id} of "${topic.title}" is missing or empty`);
      return category;
    }),
  }));

  return (
    <NamazHub
      notice={REVIEW_NOTICE}
      lessons={LESSONS.map((l) => ({ href: lessonPath(l.slug), title: l.title, hint: l.hint, badge: lessonBadge(l) }))}
      hadith={
        <div className="space-y-5 md:space-y-6">
          {groups.map((group) => (
            <section key={group.title} className="space-y-2.5">
              <h2 className="font-display text-[1.1875rem] font-bold md:text-xl">{group.title}</h2>
              <ul className="max-md:rounded-[1.25rem] max-md:border max-md:border-ln max-md:bg-sf max-md:px-4 max-md:py-0.5 md:grid md:grid-cols-[repeat(auto-fill,minmax(18.75rem,1fr))] md:gap-2.5">
                {group.categories.map((c) => (
                  <li key={c.id} className="max-md:border-t max-md:border-ln max-md:first:border-0">
                    <Link href={`/hadith/c/${c.id}/`} prefetch={false} className="flex h-full min-h-13.5 items-center justify-between gap-3 py-1.5 font-semibold md:min-h-15 md:rounded-2xl md:border md:border-ln md:bg-sf md:px-4 md:py-3 md:hover:border-ac">
                      <span>{c.title}</span>
                      <span className="shrink-0 rounded-full bg-tint px-2.5 py-0.5 text-[0.8125rem] font-normal text-on-tint">{toBnDigits(c.count)}টি</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-[0.8125rem] leading-relaxed text-ink2">ভেতরের ভাগগুলোর নাম হাদিস প্রকাশকের; কয়েকটির বাংলা নাম প্রকাশকের ফাইলে নেই।</p>
          <SourceNote meta={index.meta} />
        </div>
      }
      ayat={
        <div className="space-y-4">
          <p className="text-[0.8125rem] leading-relaxed text-ink2 md:text-[0.9375rem]">এই বিষয়ের বাছাই করা কিছু আয়াত, সব আয়াত নয়। বাছাই আমাদের করা, আলেমের যাচাই বাকি। বাংলা উচ্চারণ স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি।</p>
          <QuranPassages passages={passages} credit={credit} />
          <p className="text-center text-sm text-ink2">{credit}</p>
        </div>
      }
      aside={
        <>
          <nav aria-label="দরকারি লিংক" className="rounded-[1.375rem] border border-ln bg-sf px-4 py-1 md:px-4.5 md:py-2">
            <ul>
              {LINKS.map((l) => (
                <li key={l.href} className="border-t border-ln first:border-0">
                  <Link href={l.href} className="flex min-h-11 items-center gap-3.5 py-3">
                    <span className="grid size-10.5 shrink-0 place-items-center rounded-[0.8125rem] bg-tint text-on-tint"><Icon name={l.icon} className="size-5" /></span>
                    <span className="min-w-0 leading-snug"><span className="block font-semibold">{l.title}</span><span className="block text-[0.8125rem] text-ink2">{l.hint}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <section aria-labelledby="pending" className="rounded-[1.375rem] bg-gold-soft p-4.5 text-on-gold-soft md:p-5">
            <h2 id="pending" className="font-display text-lg font-bold text-gt">যা এখনো নেই</h2>
            <ul className="mt-1.5 list-disc space-y-1.5 pl-5 text-[0.8125rem] leading-relaxed md:text-sm">
              {topic.pending.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </section>
        </>
      }
    />
  );
}

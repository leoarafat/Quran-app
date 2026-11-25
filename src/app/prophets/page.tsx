import type { Metadata } from "next";
import Link from "next/link";
import { TopicPage } from "@/components/topic/TopicPage";
import { toBnDigits } from "@/lib/bn";
import { getIndex } from "@/lib/quran/server";
import { PROPHET_SURAHS, TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: TOPICS.prophets.title };

export default function ProphetsPage() {
  const { surahs } = getIndex();
  return (
    <TopicPage topic={TOPICS.prophets}>
      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">নবীদের নামে সূরা</h2>
        <ul className="grid grid-cols-2 gap-2 min-[26rem]:grid-cols-3">
          {PROPHET_SURAHS.map((n) => (
            <li key={n}>
              <Link href={`/quran/${n}/`} prefetch={false} className="flex min-h-16 flex-col items-center justify-center rounded-[1.375rem] border border-line bg-surface p-2 text-center hover:border-brand">
                <span className="font-display font-semibold leading-snug">সূরা {surahs[n - 1].bangla}</span>
                <span className="text-sm text-muted">{toBnDigits(surahs[n - 1].ayahs)} আয়াত</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </TopicPage>
  );
}

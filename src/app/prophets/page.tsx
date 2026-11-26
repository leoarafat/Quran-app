import type { Metadata } from "next";
import Link from "next/link";
import { TopicPage } from "@/components/topic/TopicPage";
import { toBnDigits } from "@/lib/bn";
import { getIndex } from "@/lib/quran/server";
import { PROPHET_SURAHS, TOPICS } from "@/lib/topics";

export const metadata: Metadata = { title: TOPICS.prophets.title };

/** The four cover colours of the design, in turn. */
const COVERS = ["bg-tint text-on-tint", "on-deep bg-hero text-on-hero", "bg-gold-soft text-on-gold-soft", "border border-ln bg-sf"];

export default function ProphetsPage() {
  const { surahs } = getIndex();
  return (
    <TopicPage
      topic={TOPICS.prophets}
      lead={
        <section aria-labelledby="named">
          <h2 id="named" className="mb-2 font-display text-lg font-semibold">নবীদের নামে সূরা</h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {PROPHET_SURAHS.map((n, i) => (
              <li key={n}>
                <Link href={`/quran/${n}/`} prefetch={false} className={`flex h-32 flex-col justify-between rounded-md p-3.5 ${COVERS[i % COVERS.length]}`}>
                  {/* The Arabic name comes from the Quran data, never typed. */}
                  <span lang="ar" dir="rtl" className="font-arabic text-[1.75rem] leading-[1.9]">{surahs[n - 1].arabic}</span>
                  <span className="leading-snug"><span className="block font-display font-semibold">সূরা {surahs[n - 1].bangla}</span><span className="block text-[0.8125rem] opacity-90">{toBnDigits(surahs[n - 1].ayahs)} আয়াত</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      }
    />
  );
}

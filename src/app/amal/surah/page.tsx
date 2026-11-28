import type { Metadata } from "next";
import Link from "next/link";
import { PlayFrom } from "@/components/amalSurah/PlayButton";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { NewBadge } from "@/components/NewBadge";
import { AMAL_SURAHS, amalSurahPath } from "@/lib/amalSurahs";
import { toBnDigits } from "@/lib/bn";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "আমলের সূরা", description: "নিয়মিত পড়ার সূরা ও আয়াত, ফজিলতের হাদিস ও তিলাওয়াতসহ" };

export default function AmalSurahPage() {
  const counts = getIndex().surahs.map((s) => s.ayahs);
  return (
    <div className="mx-auto max-w-2xl space-y-4 lg:max-w-5xl">
      <ScreenHeader title="আমলের সূরা" back={{ href: "/", label: "হোমে ফিরে যান" }} />
      <p className="reading leading-relaxed">নিয়মিত পড়ার {toBnDigits(AMAL_SURAHS.length)}টি সূরা ও আয়াত।<NewBadge /> একটি শেষ হলে পরেরটি নিজে থেকে চলবে।</p>
      <PlayFrom place={0} counts={counts} wide label="সব একটানা শুনুন" />
      <ol className="grid gap-2.5 lg:grid-cols-2">
        {AMAL_SURAHS.map((x, i) => (
          <li key={x.slug} className="flex items-center gap-2 rounded-md border border-ln bg-sf py-2 pl-3.5 pr-3 shadow-card">
            <Link href={amalSurahPath(x.slug)} className="flex min-h-14 min-w-0 flex-1 items-center gap-3">
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-tint font-bold text-on-tint">{toBnDigits(i + 1)}</span>
              <span className="min-w-0 leading-snug">
                <span className="block font-semibold">{x.title}</span>
                <span className="block text-[0.8125rem] text-ink2">{toBnDigits(x.s)}:{toBnDigits(x.from)}{x.to > x.from && `-${toBnDigits(x.to)}`} · {toBnDigits(x.to - x.from + 1)} আয়াত{x.hadiths.length > 0 && " · ফজিলতের হাদিস"}</span>
              </span>
            </Link>
            <PlayFrom place={i} counts={counts} />
          </li>
        ))}
      </ol>
      <p className="text-center text-[0.8125rem] leading-relaxed text-ink2">সূরা বাছাই ও কোন হাদিস কোথায় বসেছে, তা আলেমের যাচাইয়ের অপেক্ষায়।</p>
    </div>
  );
}

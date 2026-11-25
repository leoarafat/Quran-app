import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DuaList } from "@/components/quran/DuaList";
import { toBnDigits } from "@/lib/bn";
import { QURAN_DUAS } from "@/lib/quran/duas";
import { getPassages } from "@/lib/quran/passages";
import { skeleton } from "../../../../scripts/lib/quran.mjs";

export const metadata: Metadata = { title: "কুরআনের দোয়া", description: "কুরআনের দোয়া: আরবি, বাংলা উচ্চারণ, অনুবাদ ও তিলাওয়াত" };

export default function QuranDuasPage() {
  const { passages, credit } = getPassages(QURAN_DUAS);
  // Found in the Arabic itself, not picked by hand.
  const rabbana = passages.flatMap((p, i) => (p.ayahs.some((a) => skeleton(a.ar).split(" ").some((w: string) => /^[وف]?ربنا$/.test(w))) ? [i] : []));

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <header className="mb-4 flex items-center gap-2.5">
        <Link href="/amal/" aria-label="দোয়া ও যিকিরে ফিরে যান" className="-ml-2 grid size-11 shrink-0 place-items-center rounded-full text-accent">
          <ChevronLeft aria-hidden className="size-6" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate font-display text-[1.625rem] font-semibold leading-snug">কুরআনের দোয়া</h1>
          <p className="text-sm text-muted">{toBnDigits(passages.length)}টি দোয়া, মুসহাফের ক্রমে</p>
        </div>
      </header>
      <div className="mb-4 space-y-2 rounded-[1.375rem] border border-dashed border-line-strong p-4 text-sm leading-relaxed text-muted">
        <p>পুরো আয়াত দেখানো হয়েছে, তাই কোনো কোনোটিতে দোয়ার আগে বা পরে প্রসঙ্গও আছে। দোয়াগুলোর বাছাই আমাদের করা, আলেমের যাচাই বাকি।</p>
        <p>বাংলা উচ্চারণ স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি। তিলাওয়াত শুনে মিলিয়ে পড়ুন। <Link href="/about/" className="text-accent underline">বিস্তারিত</Link></p>
      </div>
      <DuaList passages={passages} rabbana={rabbana} credit={credit} />
      <p className="mt-4 text-center text-sm text-muted">{credit} · <Link href="/about/" className="underline">উৎস ও শর্ত</Link></p>
    </div>
  );
}

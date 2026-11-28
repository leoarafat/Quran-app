import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { PRACTICE, practiceWords } from "@/lib/arabic/qaida";
import { exampleAyahs } from "@/lib/arabic/server";
import { toBnDigits } from "@/lib/bn";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "মিশিয়ে পড়ার অনুশীলন" };

export default function PracticePage() {
  const { surahs } = getIndex();
  const ayahs = [...exampleAyahs()];

  return (
    <div className="mx-auto max-w-2xl space-y-4 lg:max-w-5xl">
      <ScreenHeader title="পড়ার অনুশীলন" back={{ href: "/arabic/", label: "আরবি শিখুন পাতায় ফিরে যান" }} />
      <p className="reading leading-relaxed">আগে নিজে পড়ুন, তারপর শিক্ষককে শোনান। কোনো শব্দে চাপলে পুরো আয়াত খুলবে, সেখানে আয়াতের তিলাওয়াত শুনতে পারবেন।</p>
      <nav aria-label="অনুশীলনের ধাপ" className="flex flex-wrap gap-2">
        {PRACTICE.map((set, i) => <a key={set.title} href={`#set-${i}`} className="inline-flex min-h-11 items-center rounded-full border border-ln2 bg-sf px-4 text-sm font-semibold">{set.title}</a>)}
      </nav>
      {PRACTICE.map((set, i) => {
        const words = practiceWords(ayahs, set.lessons);
        return (
          <section key={set.title} id={`set-${i}`} aria-labelledby={`set-${i}-title`} className="scroll-mt-20 space-y-2">
            <h2 id={`set-${i}-title`} className="font-display text-xl font-semibold">{set.title}</h2>
            <p className="text-sm text-ink2">{set.hint} · {toBnDigits(words.length)}টি শব্দ</p>
            <ul dir="rtl" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {words.map((w) => (
                <li key={w.text}>
                  <Link href={`/quran/${w.s}/#a${w.a}`} prefetch={false} className="flex h-full flex-col items-center justify-center rounded-2xl border border-ln bg-sf px-2 pb-2 text-center hover:border-ac">
                    <span lang="ar" className="pb-3 font-arabic text-3xl leading-[2.2]">{w.text}</span>
                    <span dir="ltr" className="text-sm text-ink2">{surahs[w.s - 1].bangla} {toBnDigits(w.s)}:{toBnDigits(w.a)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="text-sm leading-relaxed text-ink2">শব্দগুলো কুরআনের লেখা (Tanzil.net) থেকে যন্ত্রে বাছাই করা। ক্বারীর যাচাই বাকি।</p>
    </div>
  );
}

import { CategoryLinks } from "@/components/hadith/CategoryLinks";
import { SourceNote } from "@/components/hadith/SourceNote";
import { QuranPassages } from "@/components/quran/QuranPassages";
import { toBnDigits } from "@/lib/bn";
import { getHadithIndex } from "@/lib/hadith/server";
import { getPassages } from "@/lib/quran/passages";
import type { Topic } from "@/lib/topics";

/** The hadith groups and Quran passages of one topic. */
export function TopicSources({ topic }: { topic: Topic }) {
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
    <div className="space-y-4">
      <nav aria-label="এই পাতার অংশ" className="grid grid-cols-2 gap-2">
        <a href="#hadith" className="flex min-h-11 items-center justify-center rounded-full border border-line-strong bg-surface px-3 font-semibold text-accent">হাদিস</a>
        <a href="#ayat" className="flex min-h-11 items-center justify-center rounded-full border border-line-strong bg-surface px-3 font-semibold text-accent">কুরআনের আয়াত</a>
      </nav>

      <section id="hadith" className="scroll-mt-4 space-y-3">
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="mb-2 font-display text-lg font-semibold">{group.title}</h2>
            <CategoryLinks categories={group.categories} />
          </div>
        ))}
        <p className="text-sm leading-relaxed text-muted">ভেতরের ভাগগুলোর নাম হাদিস প্রকাশকের; কয়েকটির বাংলা নাম প্রকাশকের ফাইলে নেই।</p>
        <SourceNote meta={index.meta} />
      </section>

      <section id="ayat" className="scroll-mt-4 space-y-3">
        <h2 className="font-display text-lg font-semibold">কুরআনের আয়াত ({toBnDigits(passages.length)}টি অংশ)</h2>
        <p className="text-sm leading-relaxed text-muted">এই বিষয়ের বাছাই করা কিছু আয়াত, সব আয়াত নয়। বাছাই আমাদের করা, আলেমের যাচাই বাকি। বাংলা উচ্চারণ স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি।</p>
        <QuranPassages passages={passages} credit={credit} />
        <p className="text-center text-sm text-muted">{credit}</p>
      </section>
    </div>
  );
}

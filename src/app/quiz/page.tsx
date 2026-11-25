import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Quiz } from "@/components/tools/Quiz";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "কুরআন কুইজ" };

export default function QuizPage() {
  const surahs = getIndex().surahs.map(({ n, bangla, ayahs, revelation }) => ({ n, bangla, ayahs, revelation }));
  return (
    <div className="mx-auto max-w-md lg:max-w-2xl space-y-4">
      <PageHeader title="কুরআন কুইজ" subtitle="সূরা পরিচিতি যাচাই করুন" />
      <Quiz surahs={surahs} />
    </div>
  );
}

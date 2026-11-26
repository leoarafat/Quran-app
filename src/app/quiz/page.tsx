import type { Metadata } from "next";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { Quiz } from "@/components/tools/Quiz";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "কুরআন কুইজ" };

export default function QuizPage() {
  const surahs = getIndex().surahs.map(({ n, bangla, ayahs, revelation }) => ({ n, bangla, ayahs, revelation }));
  return (
    <div className="mx-auto max-w-md md:max-w-xl">
      <ScreenHeader title="কুরআন কুইজ" back={{ href: "/more/", label: "আরও পাতায় ফিরে যান" }} />
      <Quiz surahs={surahs} />
    </div>
  );
}

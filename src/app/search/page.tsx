import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SurahBrowser } from "@/components/quran/SurahBrowser";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "সার্চ" };

export default function SearchPage() {
  const { surahs, juzs, sajdas } = getIndex();
  return (
    <>
      <PageHeader title="সার্চ" subtitle="এখন সূরার নাম, নম্বর ও আয়াত নম্বর দিয়ে খোঁজা যায়। আয়াতের শব্দ, হাদিস ও দোয়া খোঁজা পরে যোগ হবে।" />
      <SurahBrowser surahs={surahs} juzs={juzs} sajdas={sajdas} />
    </>
  );
}

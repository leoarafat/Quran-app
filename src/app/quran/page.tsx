import type { Metadata } from "next";
import Link from "next/link";
import { QuranIndex } from "@/components/quran/QuranIndex";
import { headerButton, ScreenHeader, SettingsLink } from "@/components/shell/ScreenHeader";
import { Icon } from "@/components/ui/Icon";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "কুরআন" };

export default function QuranPage() {
  const { surahs, juzs, sajdas, pages, rukus, hizbs, manzils } = getIndex();
  return (
    <>
      <ScreenHeader title="কুরআন">
        <Link href="/search/" aria-label="খুঁজুন" className={headerButton}><Icon name="search" /></Link>
        <SettingsLink />
      </ScreenHeader>
      <QuranIndex surahs={surahs} juzs={juzs} sajdas={sajdas} pages={pages} rukus={rukus} hizbs={hizbs} manzils={manzils} />
    </>
  );
}

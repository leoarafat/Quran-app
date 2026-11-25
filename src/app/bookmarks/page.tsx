import type { Metadata } from "next";
import { Bookmarks } from "@/components/bookmarks/Bookmarks";
import { PageHeader } from "@/components/PageHeader";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "বুকমার্ক" };

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <PageHeader title="বুকমার্ক" subtitle="সংরক্ষিত আয়াত, হাদিস ও আপনার নোট" />
      <Bookmarks surahs={getIndex().surahs} />
    </div>
  );
}

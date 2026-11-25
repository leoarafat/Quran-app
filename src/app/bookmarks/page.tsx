import type { Metadata } from "next";
import { Bookmarks } from "@/components/bookmarks/Bookmarks";
import { getIndex } from "@/lib/quran/server";

export const metadata: Metadata = { title: "বুকমার্ক" };

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <Bookmarks surahs={getIndex().surahs} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SourceNote } from "@/components/hadith/SourceNote";
import { PendingNote } from "@/components/PendingNote";
import { headerButton, ScreenHeader } from "@/components/shell/ScreenHeader";
import { AmalHub } from "@/components/tools/AmalHub";
import { Icon } from "@/components/ui/Icon";
import { getHadithIndex } from "@/lib/hadith/server";
import { QURAN_DUAS } from "@/lib/quran/duas";

export const metadata: Metadata = { title: "দোয়া ও যিকির" };

/** Topics exactly as the publisher groups them. */
const TOPICS = [301, 293, 465, 303, 306, 307, 308, 313, 302] as const;

/** Everyday manners, again under the publisher's own names. The choice awaits a scholar's review. */
const MANNERS = [290, 286, 295, 297, 296, 292, 298, 435, 443, 450, 291, 321, 311] as const;

export default function AmalPage() {
  const { index, categories } = getHadithIndex();
  const pick = (ids: readonly number[]) => ids.flatMap((id) => {
    const c = categories.get(id);
    return c ? [{ id, title: c.title, count: c.count }] : [];
  });

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <ScreenHeader title="দোয়া ও আমল">
        <Link href="/bookmarks/" aria-label="বুকমার্ক" className={headerButton}><Icon name="bookmark" /></Link>
      </ScreenHeader>
      <AmalHub
        shortcuts={[
          { href: "/amal/daily/", title: "দৈনিক আমল", icon: "deeds" },
          { href: "/amal/after-salah/", title: "নামাজের পর", icon: "clock" },
          { href: "/amal/khatm/", title: "খতম ও লক্ষ্য", icon: "mushaf" },
          { href: "/amal/fasting/", title: "রোজার খাতা", icon: "moon" },
        ]}
        quranDuas={QURAN_DUAS.length}
        topics={pick(TOPICS)}
        manners={pick(MANNERS)}
      >
        <PendingNote title="যা এখনো নেই" items={["এই ভাগগুলো উৎস প্রকাশকের; এতে দোয়ার পাশাপাশি আদব ও বিধানের হাদিসও আছে।", "সকাল-সন্ধ্যা বা ঘুমের মতো সাজানো দোয়ার তালিকা, গণনা ও দোয়ার বাংলা উচ্চারণ আলেমের যাচাইয়ের পর যোগ হবে।"]} />
        <SourceNote meta={index.meta} />
      </AmalHub>
    </div>
  );
}

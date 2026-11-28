import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { SurahInfo } from "@/lib/quran/types";

const TOOLS: [string, string, IconName][] = [
  ["/quran/", "কুরআন", "quran"], ["/hadith/", "হাদিস", "hadith"], ["/amal/", "দোয়া ও আমল", "deeds"], ["/namaz/", "নামাজ শিক্ষা", "mosque"],
  ["/planner/", "প্ল্যানার", "cal"], ["/arabic/", "আরবি শিখুন", "book"], ["/qibla/", "কিবলা", "qibla"], ["/amal/surah/", "আমলের সূরা", "note"],
];

/** Eight quick tools: rounded squares on a phone, small cards on wider screens. */
export function FeatureTiles() {
  return (
    <nav aria-label="দ্রুত টুল">
      <ul className="grid grid-cols-4 gap-x-2 gap-y-4 md:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] md:gap-3">
        {TOOLS.map(([href, label, icon]) => (
          <li key={href}>
            <Link href={href} className="flex h-full min-h-11 flex-col items-center gap-2 text-center text-[0.8125rem] font-medium leading-snug md:flex-row md:gap-3 md:rounded-2xl md:border md:border-ln md:bg-sf md:p-3 md:text-left md:text-[0.9375rem] md:font-semibold md:hover:border-ac">
              <span className="grid size-[3.625rem] shrink-0 place-items-center rounded-[1.25rem] border border-ln bg-sf text-ac md:size-10 md:rounded-xl md:border-0 md:bg-tint md:text-on-tint"><Icon name={icon} className="size-6 md:size-5" /></span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Surahs many people read often, one tap away. */
const OFTEN: [number, string?][] = [[36], [67], [18], [55], [56], [32], [2, "#a255"]];

export function QuickSurahs({ surahs }: { surahs: SurahInfo[] }) {
  return (
    <nav aria-label="বেশি পড়া সূরা" className="flex flex-wrap items-center gap-2">
      <span className="text-[0.8125rem] text-ink2">বেশি পড়া হয়:</span>
      {OFTEN.map(([n, hash]) => (
        <Link key={n} href={`/quran/${n}/${hash ?? ""}`} prefetch={false} className="flex min-h-11 items-center rounded-full border border-ln2 bg-sf px-4 text-sm font-medium hover:border-ac">
          {hash ? "আয়াতুল কুরসি" : surahs[n - 1].bangla}
        </Link>
      ))}
    </nav>
  );
}

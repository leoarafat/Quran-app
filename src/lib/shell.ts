// What the side bar, the top bar and the tab bar show.
import type { IconName } from "@/components/ui/Icon";
import { FEATURE_GROUPS } from "./features";

export type NavItem = { href: string; label: string; icon: IconName };

export const TABS: NavItem[] = [
  { href: "/", label: "হোম", icon: "home" },
  { href: "/quran/", label: "কুরআন", icon: "quran" },
  { href: "/amal/", label: "আমল", icon: "deeds" },
  { href: "/search/", label: "খুঁজুন", icon: "search" },
  { href: "/more/", label: "আরও", icon: "more" },
];

export const SIDE_LINKS: NavItem[] = [
  { href: "/", label: "হোম", icon: "home" },
  { href: "/quran/", label: "কুরআন", icon: "quran" },
  { href: "/hadith/", label: "হাদিস", icon: "hadith" },
  { href: "/amal/", label: "আমল ও দোয়া", icon: "deeds" },
  { href: "/namaz/", label: "নামাজ শিক্ষা", icon: "mosque" },
  { href: "/arabic/", label: "আরবি শিখুন", icon: "book" },
  { href: "/prayer-times/", label: "নামাজের সময়", icon: "clock" },
  { href: "/bookmarks/", label: "বুকমার্ক", icon: "bookmark" },
  { href: "/me/", label: "আমার পাতা", icon: "user" },
  { href: "/more/", label: "সব টুল", icon: "more" },
  { href: "/settings/", label: "সেটিংস", icon: "settings" },
];

const EXTRA_TITLES: [string, string][] = [["/search/", "খুঁজুন"], ["/more/", "আরও"], ["/settings/", "সেটিংস"], ["/about/", "উৎস ও শর্ত"], ["/offline/", "অ্যাপ ইনস্টল"]];

/** The top bar's title. The page's own heading stays the h1. */
export function sectionTitle(pathname: string, surahNames: string[]): string {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const surah = /^\/quran\/(\d+)\/$/.exec(path);
  if (surah) return `কুরআন · ${surahNames[Number(surah[1]) - 1] ?? ""}`;
  if (path === "/") return "হোম";
  const known: [string, string][] = [...EXTRA_TITLES, ...FEATURE_GROUPS.flatMap((g) => g.items.flatMap((f): [string, string][] => (f.href ? [[f.href, f.title]] : [])))];
  // The longest matching address wins, so /amal/khatm/ is not shown as /amal/.
  return known.filter(([href]) => path.startsWith(href)).sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "নূর কুরআন";
}

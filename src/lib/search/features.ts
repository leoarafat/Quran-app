// Finding the app's own pages from the search box.
import { FEATURE_GROUPS } from "@/lib/features";
import { foldName } from "@/lib/quran/find";
import { QAIDA, qaidaPath } from "@/lib/arabic/qaida";
import { LESSONS, lessonPath } from "@/lib/namaz";

type Page = { title: string; href: string; words: string };

const LESSON_WORDS: Record<string, string> = {
  waqt: "ওয়াক্ত রাকাত ফজর যোহর আসর মাগরিব এশা জুমা", oju: "অজু ওযু ওজু গোসল তায়াম্মুম oju wudu", niyom: "রুকু সিজদা বৈঠক তাশাহহুদ niyom", rakat: "বিতর রাকাত rakat", surah: "ফাতিহা সূরা", doa: "সানা দরুদ তাসবিহ", masala: "সাহু কাজা কসর মাসবুক সফর",
};

const EXTRA: Page[] = [
  ...LESSONS.map((l) => ({ title: l.title, href: lessonPath(l.slug), words: `${l.hint} নামাজ ${LESSON_WORDS[l.slug] ?? ""}` })),
  ...QAIDA.map((l) => ({ title: l.title, href: qaidaPath(l.slug), words: `${l.hint} আরবি কায়দা তাজবিদ qaida` })),
  { title: "রোজার খাতা", href: "/amal/fasting/", words: "রোজা সিয়াম ফাস্টিং roza" },
  { title: "কুরআনের দোয়া", href: "/amal/quran/", words: "রব্বানা rabbana dua" },
  { title: "অ্যাপ ইনস্টল ও অফলাইন", href: "/offline/", words: "ডাউনলোড offline install" },
  { title: "সেটিংস", href: "/settings/", words: "থিম ফন্ট সাইজ ডার্ক settings" },
];

/** Words people type that are not on a tile, by page address. */
const ALSO: Record<string, string> = {
  "/quran/": "quran মুসহাফ পারা সূরা", "/prayer-times/": "namaz salat সালাত ওয়াক্ত সেহরি", "/tasbih/": "tasbih যিকির", "/qibla/": "qibla কাবা",
  "/calendar/": "hijri তারিখ আশুরা ঈদ", "/zakat/": "zakat", "/hadith/": "hadith", "/amal/": "dua amal", "/quiz/": "quiz প্রশ্ন",
  "/amal/khatm/": "khatam তিলাওয়াত লক্ষ্য", "/data/": "backup ব্যাকআপ", "/hajj/": "hajj umrah ওমরাহ", "/ramadan/": "ramadan রোজা",
};

const PAGES: Page[] = [
  ...FEATURE_GROUPS.flatMap((g) => g.items).flatMap((f) => (f.href ? [{ title: f.title, href: f.href, words: `${f.hint} ${ALSO[f.href] ?? ""}` }] : [])),
  ...EXTRA,
];

/** Pages whose name or keywords start a word the same way as the query. */
export function findPages(query: string, limit = 4): { title: string; href: string }[] {
  const q = foldName(query);
  if (q.length < 3) return [];
  return PAGES.filter((p) => foldName(p.title).includes(q) || p.words.split(" ").some((w) => w && foldName(w).startsWith(q)))
    .slice(0, limit)
    .map(({ title, href }) => ({ title, href }));
}

import type { IconName } from "@/components/ui/Icon";

export type Feature = {
  title: string;
  hint: string;
  icon: IconName;
  /** Set only when the page really exists. Without it the tile shows "শীঘ্রই". */
  href?: string;
  /** shown on a page that works but is still missing something it will need */
  badge?: "আংশিক" | "যাচাই বাকি";
};

export type FeatureGroup = { title: string; items: Feature[] };

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "কুরআন ও হাদিস",
    items: [
      { title: "কুরআন", hint: "আরবি, উচ্চারণ, অর্থ", icon: "quran", href: "/quran/" },
      { title: "বুকমার্ক", hint: "আয়াত, হাদিস, নোট", icon: "bookmark", href: "/bookmarks/" },
      { title: "হাদিস", hint: "ব্যাখ্যাসহ", icon: "hadith", href: "/hadith/" },
      { title: "আমলের সূরা", hint: "ফজিলত ও তিলাওয়াত", icon: "note", href: "/amal/surah/" },
      { title: "কুরআন প্ল্যানার", hint: "দিন ভাগ করে পড়া", icon: "cal", href: "/planner/" },
      { title: "খতম ও লক্ষ্য", hint: "দৈনিক তিলাওয়াত", icon: "mushaf", href: "/amal/khatm/" },
      { title: "আরবি শিখুন", hint: "হরফ ও হরকত", icon: "book", href: "/arabic/", badge: "আংশিক" },
    ],
  },
  {
    title: "আমল ও নামাজ",
    items: [
      { title: "সারাদিনের আমল", hint: "আমলের খাতা", icon: "deeds", href: "/amal/daily/", badge: "আংশিক" },
      { title: "নামাজের পরের আমল", hint: "যিকির ও আয়াত", icon: "clock", href: "/amal/after-salah/", badge: "আংশিক" },
      { title: "নামাজ শিক্ষা", hint: "ধাপে ধাপে, ছবিসহ", icon: "mosque", href: "/namaz/", badge: "যাচাই বাকি" },
      { title: "দোয়া", hint: "কুরআন ও হাদিস", icon: "note", href: "/amal/" },
      { title: "রমজান", hint: "আয়াত ও হাদিস", icon: "moon", href: "/ramadan/", badge: "আংশিক" },
      { title: "নবী ও সাহাবি", hint: "আয়াত ও হাদিস", icon: "users", href: "/prophets/", badge: "আংশিক" },
    ],
  },
  {
    title: "দরকারি টুল",
    items: [
      { title: "আমার পাতা", hint: "অগ্রগতি ও রিপোর্ট", icon: "user", href: "/me/" },
      { title: "কুরআন কুইজ", hint: "লেভেল ও ব্যাজ", icon: "trophy", href: "/quiz/" },
      { title: "আমার ডেটা", hint: "ব্যাকআপ ও রিস্টোর", icon: "download", href: "/data/" },
      { title: "নামাজের সময়", hint: "মাসিক সূচি", icon: "clock", href: "/prayer-times/" },
      { title: "কিবলা", hint: "দিক নির্ণয়", icon: "qibla", href: "/qibla/" },
      { title: "তাসবিহ", hint: "জিকির গণনা", icon: "tasbih", href: "/tasbih/" },
      { title: "হিজরি ক্যালেন্ডার", hint: "বিশেষ দিন", icon: "cal", href: "/calendar/" },
      { title: "যাকাত হিসাব", hint: "ক্যালকুলেটর", icon: "calc", href: "/zakat/", badge: "যাচাই বাকি" },
      { title: "হজ ও উমরাহ", hint: "আয়াত ও হাদিস", icon: "kaaba", href: "/hajj/", badge: "আংশিক" },
    ],
  },
];

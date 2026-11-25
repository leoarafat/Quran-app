import {
  BookCheck, Brain, DatabaseBackup, LayoutDashboard, BookOpen, BookMarked, CalendarDays, Clock, Compass, GraduationCap, HandCoins, Heart,
  Moon, Repeat, ScrollText, Sunrise, Users, CircleDot, PersonStanding, Landmark,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  title: string;
  hint: string;
  icon: LucideIcon;
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
      { title: "কুরআন", hint: "আরবি, উচ্চারণ, অর্থ", icon: BookOpen, href: "/quran/" },
      { title: "বুকমার্ক", hint: "আয়াত, হাদিস, নোট", icon: BookMarked, href: "/bookmarks/" },
      { title: "হাদিস", hint: "ব্যাখ্যাসহ", icon: ScrollText, href: "/hadith/" },
      { title: "খতম ও লক্ষ্য", hint: "দৈনিক তিলাওয়াত", icon: BookCheck, href: "/amal/khatm/" },
      { title: "আরবি শিখুন", hint: "হরফ ও হরকত", icon: GraduationCap, href: "/arabic/", badge: "আংশিক" },
    ],
  },
  {
    title: "আমল ও নামাজ",
    items: [
      { title: "সারাদিনের আমল", hint: "আমলের খাতা", icon: Sunrise, href: "/amal/daily/", badge: "আংশিক" },
      { title: "নামাজের পরের আমল", hint: "যিকির ও আয়াত", icon: Repeat, href: "/amal/after-salah/", badge: "আংশিক" },
      { title: "নামাজ শিক্ষা", hint: "হাদিস ও আয়াত", icon: PersonStanding, href: "/namaz/", badge: "আংশিক" },
      { title: "দোয়া", hint: "কুরআন ও হাদিস", icon: Heart, href: "/amal/" },
      { title: "রমজান", hint: "আয়াত ও হাদিস", icon: Moon, href: "/ramadan/", badge: "আংশিক" },
      { title: "নবী ও সাহাবি", hint: "আয়াত ও হাদিস", icon: Users, href: "/prophets/", badge: "আংশিক" },
    ],
  },
  {
    title: "দরকারি টুল",
    items: [
      { title: "আমার পাতা", hint: "অগ্রগতি ও রিপোর্ট", icon: LayoutDashboard, href: "/me/" },
      { title: "কুরআন কুইজ", hint: "লেভেল ও ব্যাজ", icon: Brain, href: "/quiz/" },
      { title: "আমার ডেটা", hint: "ব্যাকআপ ও রিস্টোর", icon: DatabaseBackup, href: "/data/" },
      { title: "নামাজের সময়", hint: "মাসিক সূচি", icon: Clock, href: "/prayer-times/" },
      { title: "কিবলা", hint: "দিক নির্ণয়", icon: Compass, href: "/qibla/" },
      { title: "তাসবিহ", hint: "জিকির গণনা", icon: CircleDot, href: "/tasbih/" },
      { title: "হিজরি ক্যালেন্ডার", hint: "বিশেষ দিন", icon: CalendarDays, href: "/calendar/" },
      { title: "যাকাত হিসাব", hint: "ক্যালকুলেটর", icon: HandCoins, href: "/zakat/", badge: "যাচাই বাকি" },
      { title: "হজ ও উমরাহ", hint: "আয়াত ও হাদিস", icon: Landmark, href: "/hajj/", badge: "আংশিক" },
    ],
  },
];

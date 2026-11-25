import {
  BookOpen, BookMarked, CalendarDays, Clock, Compass, GraduationCap, HandCoins, Heart,
  Moon, Repeat, ScrollText, Sunrise, Users, CircleDot, PersonStanding, Landmark,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  title: string;
  hint: string;
  icon: LucideIcon;
  /** Set only when the page really exists. Without it the tile shows "শীঘ্রই". */
  href?: string;
};

export type FeatureGroup = { title: string; items: Feature[] };

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "কুরআন ও হাদিস",
    items: [
      { title: "কুরআন", hint: "আরবি, উচ্চারণ, অনুবাদ", icon: BookOpen },
      { title: "বুকমার্ক", hint: "সংরক্ষিত আয়াত", icon: BookMarked },
      { title: "হাদিস", hint: "রেফারেন্সসহ", icon: ScrollText },
      { title: "আরবি শিখুন", hint: "হরফ থেকে তাজবিদ", icon: GraduationCap },
    ],
  },
  {
    title: "আমল ও নামাজ",
    items: [
      { title: "সারাদিনের আমল", hint: "সকাল থেকে রাত", icon: Sunrise },
      { title: "নামাজের পরের আমল", hint: "পাঁচ ওয়াক্ত", icon: Repeat },
      { title: "নামাজ শিক্ষা", hint: "অজু থেকে জানাজা", icon: PersonStanding },
      { title: "দোয়া", hint: "প্রয়োজন অনুযায়ী", icon: Heart },
      { title: "রমজান", hint: "গুরুত্ব ও আমল", icon: Moon },
      { title: "নবী ও সাহাবি", hint: "জীবনের ঘটনা", icon: Users },
    ],
  },
  {
    title: "দরকারি টুল",
    items: [
      { title: "নামাজের সময়", hint: "আপনার জেলা", icon: Clock },
      { title: "কিবলা", hint: "দিক নির্ণয়", icon: Compass },
      { title: "তাসবিহ", hint: "জিকির গণনা", icon: CircleDot },
      { title: "হিজরি ক্যালেন্ডার", hint: "বিশেষ দিন", icon: CalendarDays },
      { title: "যাকাত হিসাব", hint: "ক্যালকুলেটর", icon: HandCoins },
      { title: "হজ ও উমরাহ", hint: "ধাপে ধাপে", icon: Landmark },
    ],
  },
];

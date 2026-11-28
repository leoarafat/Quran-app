// Surahs and ayahs many people recite regularly, in the order of the Quran.
// Virtues are never written by us: each is a hadith of our published collection (sahih or hasan),
// shown word for word with its grade. Where the collection has none, the page says so.
// The choice of passages and of which hadith belongs to which still awaits a scholar's review.

export type AmalSurah = {
  slug: string;
  title: string;
  s: number;
  from: number;
  to: number;
  /** ids in the published hadith collection */
  hadiths: number[];
  /** plain facts a reader needs about what the hadith does and does not cover */
  note?: string;
};

export const AMAL_SURAHS: readonly AmalSurah[] = [
  { slug: "fatiha", title: "সূরা আল-ফাতিহা", s: 1, from: 1, to: 7, hadiths: [10112, 5378] },
  { slug: "ayatul-kursi", title: "আয়াতুল কুরসী", s: 2, from: 255, to: 255, hadiths: [10950] },
  { slug: "baqarah-end", title: "সূরা বাকারার শেষ ৩ আয়াত", s: 2, from: 284, to: 286, hadiths: [6274, 5775], note: "প্রথম হাদিসে শেষ দুই আয়াতের (২৮৫ ও ২৮৬) কথা বলা হয়েছে। দ্বিতীয় হাদিসে বলা হয়েছে সূরার শেষাংশ।" },
  { slug: "kahf", title: "সূরা আল-কাহফ", s: 18, from: 1, to: 110, hadiths: [6265, 6178], note: "প্রথম হাদিসে সূরার প্রথম ১০ আয়াত মুখস্থ করার কথা বলা হয়েছে।" },
  { slug: "sajdah", title: "সূরা আস-সাজদা", s: 32, from: 1, to: 30, hadiths: [5320], note: "এই হাদিসে জুমার দিন ফজরের নামাজে নবীজি ﷺ-এর এ সূরা পড়ার কথা আছে।" },
  { slug: "yasin", title: "সূরা ইয়াসিন", s: 36, from: 1, to: 83, hadiths: [] },
  { slug: "rahman", title: "সূরা আর-রাহমান", s: 55, from: 1, to: 78, hadiths: [] },
  { slug: "waqiah", title: "সূরা আল-ওয়াকিআ", s: 56, from: 1, to: 96, hadiths: [] },
  { slug: "hashr-end", title: "সূরা হাশরের শেষ ৩ আয়াত", s: 59, from: 22, to: 24, hadiths: [] },
  { slug: "mulk", title: "সূরা আল-মুলক", s: 67, from: 1, to: 30, hadiths: [] },
  { slug: "insan", title: "সূরা আদ-দাহর (আল-ইনসান)", s: 76, from: 1, to: 31, hadiths: [5320], note: "এই হাদিসে জুমার দিন ফজরের নামাজে নবীজি ﷺ-এর এ সূরা পড়ার কথা আছে।" },
  { slug: "kafirun", title: "সূরা আল-কাফিরুন", s: 109, from: 1, to: 6, hadiths: [] },
  { slug: "ikhlas", title: "সূরা আল-ইখলাস", s: 112, from: 1, to: 4, hadiths: [65261, 5213, 6082] },
  { slug: "falaq", title: "সূরা আল-ফালাক", s: 113, from: 1, to: 5, hadiths: [65448, 65060, 6082] },
  { slug: "nas", title: "সূরা আন-নাস", s: 114, from: 1, to: 6, hadiths: [65448, 65060, 6082] },
];

export const amalSurahPath = (slug: string) => `/amal/surah/${slug}/`;

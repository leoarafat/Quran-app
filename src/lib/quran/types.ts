export type SurahInfo = {
  n: number;
  ayahs: number;
  arabic: string;
  latin: string;
  meaningEn: string;
  bangla: string;
  revelation: "meccan" | "medinan";
};

export type Place = { s: number; a: number };

export type QuranIndex = {
  surahs: SurahInfo[];
  juzs: Place[];
  sajdas: Place[];
  /** where each Madani mushaf page, ruku, hizb and manzil begins */
  pages: Place[];
  rukus: Place[];
  hizbs: Place[];
  manzils: Place[];
  sources: {
    arabic: { name: string; url: string; license: string };
    translation: { name: string; publisher: string; url: string; version: string; fetched: string };
  };
};

export type Ayah = { a: number; ar: string; /** Bangla pronunciation, machine generated */ tr: string; bn: string; fn?: string; juz: number; page: number; sajdah?: boolean };

export type SurahData = { n: number; basmalah: string | null; basmalahTr: string | null; ayahs: Ayah[] };

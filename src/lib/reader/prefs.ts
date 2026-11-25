// How the visitor likes to read: which layers are shown, or the continuous Arabic "mushaf" view.
import type { BnFont } from "@/lib/settings";

export const READER_KEY = "noor.reader.v1";

export const BN_FONT_LABELS: Record<BnFont, string> = { hind: "হিন্দ শিলিগুড়ি", noto: "নোটো সেরিফ", tiro: "তিরো বাংলা" };

export type Layers = { arabic: boolean; pronunciation: boolean; translation: boolean };
export const LINE_GAPS = ["tight", "normal", "wide"] as const;
export type LineGap = (typeof LINE_GAPS)[number];
/** Arabic line height for each choice; the mushaf view adds a little to it. */
export const LINE_HEIGHTS: Record<LineGap, number> = { tight: 2, normal: 2.25, wide: 2.65 };

/** What a reading mode decides. */
export type ModePrefs = Layers & { mushaf: boolean };
export type ReaderPrefs = ModePrefs & {
  lineGap: LineGap;
  /** show the ayah numbers */
  numbers: boolean;
  /** scroll along with the recitation */
  follow: boolean;
};

const FULL: ModePrefs = { arabic: true, pronunciation: true, translation: true, mushaf: false };
export const DEFAULT_READER: ReaderPrefs = { ...FULL, lineGap: "normal", numbers: true, follow: true };

export function parseReaderPrefs(raw: string | null): ReaderPrefs {
  try {
    const d = JSON.parse(raw ?? "null");
    if (!d || typeof d !== "object") return DEFAULT_READER;
    const prefs = {
      arabic: d.arabic !== false,
      pronunciation: d.pronunciation !== false,
      translation: d.translation !== false,
      mushaf: d.mushaf === true,
      lineGap: LINE_GAPS.includes(d.lineGap) ? (d.lineGap as LineGap) : DEFAULT_READER.lineGap,
      numbers: d.numbers !== false,
      follow: d.follow !== false,
    };
    return prefs.arabic || prefs.pronunciation || prefs.translation ? prefs : { ...prefs, ...FULL, mushaf: prefs.mushaf };
  } catch {
    return DEFAULT_READER;
  }
}

/** At least one layer always stays visible. */
export function toggleLayer(prefs: ReaderPrefs, key: keyof Layers): ReaderPrefs {
  const next = { ...prefs, [key]: !prefs[key] };
  return next.arabic || next.pronunciation || next.translation ? next : prefs;
}

export const READING_MODES = [
  { id: "full", label: "সব একসাথে", prefs: FULL },
  { id: "arabic-bangla", label: "আরবি ও অর্থ", prefs: { arabic: true, pronunciation: false, translation: true, mushaf: false } },
  { id: "translation", label: "শুধু অর্থ", prefs: { arabic: false, pronunciation: false, translation: true, mushaf: false } },
  { id: "mushaf", label: "মুসহাফ", prefs: { arabic: true, pronunciation: false, translation: false, mushaf: true } },
] as const satisfies readonly { id: string; label: string; prefs: ModePrefs }[];

/** The mode the current choices amount to, or null for a mix of the visitor's own. */
export function modeOf(prefs: ModePrefs): (typeof READING_MODES)[number]["id"] | null {
  if (prefs.mushaf) return "mushaf";
  return READING_MODES.find((m) => !m.prefs.mushaf && m.prefs.arabic === prefs.arabic && m.prefs.pronunciation === prefs.pronunciation && m.prefs.translation === prefs.translation)?.id ?? null;
}

/** Consecutive ayahs that sit on the same mushaf page. */
export function byPage<T extends { page: number }>(ayahs: T[]): { page: number; ayahs: T[] }[] {
  const groups: { page: number; ayahs: T[] }[] = [];
  for (const ayah of ayahs) {
    const last = groups.at(-1);
    if (last?.page === ayah.page) last.ayahs.push(ayah);
    else groups.push({ page: ayah.page, ayahs: [ayah] });
  }
  return groups;
}

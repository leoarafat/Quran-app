export const THEMES = ["paper", "sepia", "night", "amoled"] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_LABELS: Record<Theme, string> = { paper: "কাগজ", sepia: "সেপিয়া", night: "রাত", amoled: "কালো" };
/** A visitor may also let the phone decide between paper and night. */
export const THEME_CHOICES = ["system", ...THEMES] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];
export const resolveTheme = (choice: ThemeChoice, phoneIsDark: boolean): Theme => (choice === "system" ? (phoneIsDark ? "night" : "paper") : choice);
export const DARK_QUERY = "(prefers-color-scheme: dark)";
export const phoneIsDark = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(DARK_QUERY).matches;

/** Names saved by the earlier design. A visitor's choice must survive the redesign. */
export const OLD_THEMES: Record<string, Theme> = { light: "paper", dark: "night" };

/** Bangla typefaces bundled with the app, for the Quran's pronunciation and translation. */
export const BN_FONTS = ["hind", "noto", "tiro"] as const;
export type BnFont = (typeof BN_FONTS)[number];

export type Settings = {
  theme: ThemeChoice;
  easyMode: boolean;
  /** darker secondary text and stronger lines */
  contrast: boolean;
  arScale: number;
  bnScale: number;
  bnFont: BnFont;
};

export const SETTINGS_KEY = "noor.settings.v1";
export const SCALE_MIN = 0.8;
export const SCALE_MAX = 2;

export const DEFAULT_SETTINGS: Settings = {
  theme: "paper",
  easyMode: false,
  contrast: false,
  arScale: 1,
  bnScale: 1,
  bnFont: "hind",
};

function clampScale(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
}

/** Parse stored settings. Corrupt or foreign data must never break the app. */
export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return DEFAULT_SETTINGS;
    const d = data as Record<string, unknown>;
    const theme = typeof d.theme === "string" ? (Object.hasOwn(OLD_THEMES, d.theme) ? OLD_THEMES[d.theme] : (d.theme as ThemeChoice)) : DEFAULT_SETTINGS.theme;
    return {
      theme: THEME_CHOICES.includes(theme) ? theme : DEFAULT_SETTINGS.theme,
      easyMode: d.easyMode === true,
      contrast: d.contrast === true,
      arScale: clampScale(d.arScale),
      bnScale: clampScale(d.bnScale),
      bnFont: BN_FONTS.includes(d.bnFont as BnFont) ? (d.bnFont as BnFont) : DEFAULT_SETTINGS.bnFont,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function applySettings(s: Settings, root: HTMLElement, dark: boolean = phoneIsDark()): void {
  root.dataset.theme = resolveTheme(s.theme, dark);
  root.dataset.easy = String(s.easyMode);
  root.dataset.contrast = String(s.contrast);
  root.dataset.bnfont = s.bnFont;
  root.style.setProperty("--ar-scale", String(s.arScale));
  root.style.setProperty("--bn-scale", String(s.bnScale));
}

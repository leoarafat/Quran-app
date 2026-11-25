export const THEMES = ["light", "sepia", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/** Bangla typefaces bundled with the app, for the Quran's pronunciation and translation. */
export const BN_FONTS = ["hind", "noto", "tiro"] as const;
export type BnFont = (typeof BN_FONTS)[number];

export type Settings = {
  theme: Theme;
  easyMode: boolean;
  arScale: number;
  bnScale: number;
  bnFont: BnFont;
};

export const SETTINGS_KEY = "noor.settings.v1";
export const SCALE_MIN = 0.8;
export const SCALE_MAX = 2;

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  easyMode: false,
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
    return {
      theme: THEMES.includes(d.theme as Theme) ? (d.theme as Theme) : DEFAULT_SETTINGS.theme,
      easyMode: d.easyMode === true,
      arScale: clampScale(d.arScale),
      bnScale: clampScale(d.bnScale),
      bnFont: BN_FONTS.includes(d.bnFont as BnFont) ? (d.bnFont as BnFont) : DEFAULT_SETTINGS.bnFont,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function applySettings(s: Settings, root: HTMLElement): void {
  root.dataset.theme = s.theme;
  root.dataset.easy = String(s.easyMode);
  root.dataset.bnfont = s.bnFont;
  root.style.setProperty("--ar-scale", String(s.arScale));
  root.style.setProperty("--bn-scale", String(s.bnScale));
}

export const THEMES = ["light", "sepia", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export type Settings = {
  theme: Theme;
  easyMode: boolean;
  arScale: number;
  bnScale: number;
};

export const SETTINGS_KEY = "noor.settings.v1";
export const SCALE_MIN = 0.8;
export const SCALE_MAX = 2;

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  easyMode: false,
  arScale: 1,
  bnScale: 1,
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
      theme: THEMES.includes(d.theme as Theme) ? (d.theme as Theme) : "light",
      easyMode: d.easyMode === true,
      arScale: clampScale(d.arScale),
      bnScale: clampScale(d.bnScale),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function applySettings(s: Settings, root: HTMLElement): void {
  root.dataset.theme = s.theme;
  root.dataset.easy = String(s.easyMode);
  root.style.setProperty("--ar-scale", String(s.arScale));
  root.style.setProperty("--bn-scale", String(s.bnScale));
}

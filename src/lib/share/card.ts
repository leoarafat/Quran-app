// Draws one ayah as a picture, on the device. Nothing of the text is ever cut off:
// a long ayah makes smaller letters and then a taller picture.
import { toBnDigits } from "@/lib/bn";
import type { Theme } from "@/lib/settings";

export const CARD_WIDTH = 1080;
const MARGIN = 96;
const TEXT_WIDTH = CARD_WIDTH - MARGIN * 2;
/** Letters shrink step by step while the picture would be taller than a phone story. */
const SCALES = [1, 0.9, 0.8, 0.72, 0.64] as const;
const TALL = 1920;

/** The app's own theme colours (see globals.css; a test keeps them equal). */
export const CARD_COLORS: Record<Theme, { bg: string; surface: string; text: string; soft: string; muted: string; accent: string; line: string }> = {
  paper: { bg: "#f6f1e6", surface: "#fffdf8", text: "#12201a", soft: "#12201a", muted: "#4a5a52", accent: "#7a5c14", line: "#d9d5cc" },
  sepia: { bg: "#eaddbf", surface: "#f3e8ce", text: "#33281a", soft: "#33281a", muted: "#5e4e36", accent: "#6b4e0e", line: "#cfbd97" },
  night: { bg: "#0a1511", surface: "#111f19", text: "#e7efe8", soft: "#e7efe8", muted: "#9db1a5", accent: "#d9bc77", line: "#2c3a33" },
  amoled: { bg: "#000000", surface: "#0b0f0d", text: "#edede8", soft: "#edede8", muted: "#a3b0a8", accent: "#d9bc77", line: "#2b302d" },
};

export type CardContent = {
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
  /** left out when null */
  pronunciation: string | null;
  translation: string;
  credit: string;
};

/**
 * Words for wrapping. A pause sign standing alone in the Arabic stays with the word before it,
 * joined by a no-break space. That matters for drawing too: after an ordinary space a canvas
 * shapes the sign with nothing to sit on and puts it far above its place, unlike the reader page.
 * No letter or sign is changed.
 */
export function toWords(text: string): string[] {
  const words: string[] = [];
  for (const part of text.split(/[ \t]+/).filter(Boolean)) {
    if (words.length && !/\p{L}/u.test(part) && /^[\p{M}ۖ-ۭ]+$/u.test(part)) words[words.length - 1] += `\u00A0${part}`;
    else words.push(part);
  }
  return words;
}

/** Greedy wrapping that keeps every character; line breaks in the text are respected. */
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    let line = "";
    for (const word of toWords(paragraph)) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(next) > maxWidth) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
  }
  return lines;
}

type Role = "brand" | "reference" | "arabic" | "pronunciation" | "translation" | "note" | "credit";
type Style = { family: string; weight: number; size: number; height: number; color: keyof (typeof CARD_COLORS)["paper"]; scales: boolean; rtl?: boolean };

const BANGLA = '"Hind Siliguri", sans-serif';
const DISPLAY = '"Noto Serif Bengali", "Hind Siliguri", serif';
const ARABIC = '"Amiri Quran", serif';
const STYLES: Record<Role, Style> = {
  brand: { family: DISPLAY, weight: 700, size: 40, height: 1.5, color: "accent", scales: false },
  reference: { family: DISPLAY, weight: 600, size: 34, height: 1.6, color: "muted", scales: false },
  arabic: { family: ARABIC, weight: 400, size: 64, height: 2.15, color: "text", scales: true, rtl: true },
  pronunciation: { family: DISPLAY, weight: 500, size: 38, height: 1.75, color: "accent", scales: true },
  translation: { family: BANGLA, weight: 400, size: 40, height: 1.7, color: "soft", scales: true },
  note: { family: BANGLA, weight: 400, size: 24, height: 1.6, color: "muted", scales: false },
  credit: { family: BANGLA, weight: 400, size: 24, height: 1.6, color: "muted", scales: false },
};

type Block = { role: Role; text: string; gap: number };

export function cardBlocks(c: CardContent): Block[] {
  return [
    { role: "brand", text: "নূর কুরআন", gap: 0 },
    { role: "reference", text: `সূরা ${c.surahName} · ${toBnDigits(c.surah)}:${toBnDigits(c.ayah)}`, gap: 4 },
    { role: "arabic", text: c.arabic, gap: 56 },
    ...(c.pronunciation
      ? [
          { role: "pronunciation" as const, text: c.pronunciation, gap: 28 },
          { role: "note" as const, text: "উচ্চারণ স্বয়ংক্রিয়, ক্বারীর যাচাই বাকি", gap: 4 },
        ]
      : []),
    { role: "translation", text: c.translation, gap: 36 },
    { role: "credit", text: c.credit, gap: 64 },
  ];
}

/** next/font gives the families generated names, so a canvas has to be told what the page uses. */
const PAGE_FONTS: Record<string, string> = { [BANGLA]: "--ff-sans", [DISPLAY]: "--ff-display", [ARABIC]: "--ff-arabic" };
function familyOf(family: string): string {
  if (typeof document === "undefined" || !document.documentElement) return family;
  return getComputedStyle(document.documentElement).getPropertyValue(PAGE_FONTS[family]).trim() || family;
}

const font = (s: Style, scale: number) => `${s.weight} ${Math.round(s.size * (s.scales ? scale : 1))}px ${familyOf(s.family)}`;

/** Waits for the app's own fonts, so a picture is never made with a stand-in for the Quran script. */
export async function loadCardFonts(content: CardContent): Promise<void> {
  const loaded = await Promise.all(cardBlocks(content).map(({ role, text }) => document.fonts.load(font(STYLES[role], 1), text)));
  if (loaded.some((faces) => faces.length === 0)) throw new Error("A font did not load");
}

type Ctx = Pick<CanvasRenderingContext2D, "font" | "measureText">;

export function layoutCard(ctx: Ctx, content: CardContent) {
  const at = (scale: number) => {
    let y = MARGIN;
    const blocks = cardBlocks(content).map((block) => {
      const style = STYLES[block.role];
      ctx.font = font(style, scale);
      const lines = wrapText(block.text, TEXT_WIDTH, (s) => ctx.measureText(s).width);
      const lineHeight = Math.round(style.size * (style.scales ? scale : 1) * style.height);
      y += block.gap;
      const top = y;
      y += lines.length * lineHeight;
      return { role: block.role, lines, lineHeight, top };
    });
    return { blocks, scale, contentHeight: y + MARGIN };
  };
  let layout = at(SCALES[0]);
  for (const scale of SCALES.slice(1)) {
    if (layout.contentHeight <= TALL) break;
    layout = at(scale);
  }
  return { ...layout, height: Math.max(CARD_WIDTH, layout.contentHeight) };
}

export function drawCard(canvas: HTMLCanvasElement, content: CardContent, theme: Theme): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  canvas.width = CARD_WIDTH;
  const layout = layoutCard(ctx, content);
  canvas.height = layout.height; // resizing clears the context state, so styles are set below

  const colors = CARD_COLORS[theme];
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, CARD_WIDTH, layout.height);
  ctx.beginPath();
  ctx.roundRect(32, 32, CARD_WIDTH - 64, layout.height - 64, 48);
  ctx.fillStyle = colors.surface;
  ctx.fill();
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 3;
  ctx.stroke();

  // A short picture is centred in the square.
  const offset = Math.floor((layout.height - layout.contentHeight) / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const block of layout.blocks) {
    const style = STYLES[block.role];
    ctx.font = font(style, layout.scale);
    ctx.fillStyle = colors[style.color];
    ctx.direction = style.rtl ? "rtl" : "ltr";
    block.lines.forEach((line, i) => ctx.fillText(line, CARD_WIDTH / 2, offset + block.top + block.lineHeight * (i + 0.5)));
    if (block.role === "reference") {
      ctx.fillStyle = colors.accent;
      ctx.fillRect(CARD_WIDTH / 2 - 48, offset + block.top + block.lines.length * block.lineHeight + 24, 96, 3);
    }
  }
}

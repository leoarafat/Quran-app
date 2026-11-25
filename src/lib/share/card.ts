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
  dark: { bg: "#06130e", surface: "#0e211a", text: "#f4eedf", soft: "#c8d6cd", muted: "#a9bdb2", accent: "#ebcb88", line: "#3a5647" },
  light: { bg: "#f6f3e9", surface: "#fffdf6", text: "#13261e", soft: "#2e433a", muted: "#4f645a", accent: "#7c570c", line: "#c9bb93" },
  sepia: { bg: "#f1e4ca", surface: "#f8eed9", text: "#33271a", soft: "#46372a", muted: "#66543d", accent: "#74440d", line: "#c3a974" },
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
type Style = { family: string; weight: number; size: number; height: number; color: keyof (typeof CARD_COLORS)["dark"]; scales: boolean; rtl?: boolean };

const BANGLA = '"Hind Siliguri", sans-serif';
const DISPLAY = '"Noto Serif Bengali", "Hind Siliguri", serif';
const STYLES: Record<Role, Style> = {
  brand: { family: DISPLAY, weight: 700, size: 40, height: 1.5, color: "accent", scales: false },
  reference: { family: DISPLAY, weight: 600, size: 34, height: 1.6, color: "muted", scales: false },
  arabic: { family: '"Amiri Quran", serif', weight: 400, size: 64, height: 2.15, color: "text", scales: true, rtl: true },
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

const font = (s: Style, scale: number) => `${s.weight} ${Math.round(s.size * (s.scales ? scale : 1))}px ${s.family}`;

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

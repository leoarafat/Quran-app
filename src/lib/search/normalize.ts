// Spelling-tolerant folding, used ONLY for matching. Shown text is never changed.

export type Script = "bangla" | "pronunciation" | "arabic";

const BANGLA_FOLD: Record<string, string> = {
  "়": "", // nukta: য়/য, ড়/ড
  "ঁ": "", // chandrabindu
  "‌": "", "‍": "", "­": "",
  "’": "", "‘": "", "'": "", "ʼ": "", "`": "", "-": "",
  "ী": "ি", "ূ": "ু", "ঈ": "ই", "ঊ": "উ",
  "ণ": "ন", "শ": "স", "ষ": "স", "জ": "য", "ৎ": "ত",
};

// People type the sound in many ways: "আলআমিন" = "আলামীন", "ইয়াউমিদ্দিন" = "ইয়াওমিদ দীন".
const PRONUNCIATION_FOLD: Record<string, string> = {
  "্": "", "ছ": "স", "ও": "ু", "আ": "া", "ই": "ি", "ঈ": "ি", "উ": "ু", "ঊ": "ু", "এ": "ে",
};

const ARABIC_FOLD: Record<string, string> = { "ٱ": "ا", "ى": "ي", "ة": "ه", "ء": "", "ـ": "" };
const ARABIC_MARKS = /[ً-ٰٟۖ-ۭ࣓-ࣿ]/;

const caches: Record<Script, Map<string, string>> = { bangla: new Map(), pronunciation: new Map(), arabic: new Map() };

function foldChar(char: string, script: Script): string {
  const digit = "০১২৩৪৫৬৭৮৯".indexOf(char);
  if (digit >= 0) return String(digit);
  if (script === "pronunciation" && char in PRONUNCIATION_FOLD) return PRONUNCIATION_FOLD[char];
  let out = "";
  for (const part of char.normalize("NFD")) {
    if (script === "arabic") {
      if (ARABIC_MARKS.test(part)) continue;
      if (part in ARABIC_FOLD) {
        out += ARABIC_FOLD[part];
        continue;
      }
    } else {
      if (script === "pronunciation" && part in PRONUNCIATION_FOLD) {
        out += PRONUNCIATION_FOLD[part];
        continue;
      }
      if (part in BANGLA_FOLD) {
        out += BANGLA_FOLD[part];
        continue;
      }
    }
    out += /[\p{L}\p{M}\p{N}]/u.test(part) ? part.toLowerCase() : " ";
  }
  return out;
}

/** Folded text with single spaces between words. */
export function fold(text: string, script: Script): string {
  const cache = caches[script];
  let out = "";
  for (const char of text) {
    let folded = cache.get(char);
    if (folded === undefined) {
      folded = foldChar(char, script);
      cache.set(char, folded);
    }
    out += folded;
  }
  return out.replace(/ +/g, " ").trim();
}

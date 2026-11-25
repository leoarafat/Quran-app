// The Arabic alphabet. Letter shapes are made by the font: a zero width joiner asks it for the
// joined form. The Bangla names are the common ones and still await a qari's review.
// How each letter sounds (makhraj, tajweed) is deliberately not described here.

export type Letter = { ch: string; name: string; /** these never join to the letter after them */ breaks?: true };

export const LETTERS: readonly Letter[] = [
  { ch: "ا", name: "আলিফ", breaks: true }, { ch: "ب", name: "বা" }, { ch: "ت", name: "তা" }, { ch: "ث", name: "ছা" },
  { ch: "ج", name: "জীম" }, { ch: "ح", name: "হা" }, { ch: "خ", name: "খ" }, { ch: "د", name: "দাল", breaks: true },
  { ch: "ذ", name: "যাল", breaks: true }, { ch: "ر", name: "র", breaks: true }, { ch: "ز", name: "যা", breaks: true }, { ch: "س", name: "সীন" },
  { ch: "ش", name: "শীন" }, { ch: "ص", name: "সোয়াদ" }, { ch: "ض", name: "দোয়াদ" }, { ch: "ط", name: "ত্ব" },
  { ch: "ظ", name: "য" }, { ch: "ع", name: "আইন" }, { ch: "غ", name: "গইন" }, { ch: "ف", name: "ফা" },
  { ch: "ق", name: "ক্বফ" }, { ch: "ك", name: "কাফ" }, { ch: "ل", name: "লাম" }, { ch: "م", name: "মীম" },
  { ch: "ن", name: "নূন" }, { ch: "و", name: "ওয়াও", breaks: true }, { ch: "ه", name: "হা (গোল)" }, { ch: "ي", name: "ইয়া" },
];

const JOIN = "‍";

export function letterForms(letter: Letter): { label: string; text: string }[] {
  const { ch, breaks } = letter;
  return [
    { label: "আলাদা", text: ch },
    { label: "শব্দের শুরুতে", text: breaks ? ch : ch + JOIN },
    { label: "শব্দের মাঝে", text: breaks ? JOIN + ch : JOIN + ch + JOIN },
    { label: "শব্দের শেষে", text: JOIN + ch },
  ];
}

/** The vowel signs, each shown sitting on the letter ba. */
export const MARKS = [
  { mark: "َ", name: "যবর (ফাতহা)" },
  { mark: "ِ", name: "যের (কাসরা)" },
  { mark: "ُ", name: "পেশ (দম্মা)" },
  { mark: "ً", name: "দুই যবর" },
  { mark: "ٍ", name: "দুই যের" },
  { mark: "ٌ", name: "দুই পেশ" },
  { mark: "ْ", name: "জযম (সুকূন)" },
  { mark: "ّ", name: "তাশদীদ" },
] as const;
export const MARK_CARRIER = "ب";

/** The plain letter a Quran word begins with, or null (for example a word led by a special hamza form). */
export function firstLetter(word: string): string | null {
  const first = /\p{L}/u.exec(word)?.[0];
  if (!first) return null;
  // alif written with a hamza above or below is still met first as alif
  const plain = first === "أ" || first === "إ" ? "ا" : first;
  return LETTERS.some((l) => l.ch === plain) ? plain : null;
}

export type Example = { word: string; s: number; a: number };

/**
 * Real words for each letter, taken from the given ayahs in order: different words, not too long.
 * Words are cut from the data at spaces and never altered.
 */
export function findExamples(ayahs: Iterable<{ s: number; a: number; ar: string }>, perLetter = 3): Record<string, Example[]> {
  const found: Record<string, Example[]> = Object.fromEntries(LETTERS.map((l) => [l.ch, []]));
  let missing = LETTERS.length * perLetter;
  for (const { s, a, ar } of ayahs) {
    for (const word of ar.split(" ")) {
      const letter = firstLetter(word);
      const length = word.match(/\p{L}/gu)?.length ?? 0;
      if (!letter || length < 2 || length > 5) continue;
      const list = found[letter];
      if (list.length >= perLetter || list.some((e) => e.word === word)) continue;
      list.push({ word, s, a });
      missing--;
    }
    if (!missing) break;
  }
  return found;
}

/** Four different letters to choose from, one of them right. `random` is passed in so tests can fix it. */
export function makeQuestion(random: () => number, previous: number | null): { answer: number; choices: number[] } {
  const pick = () => Math.floor(random() * LETTERS.length);
  let answer = pick();
  if (answer === previous) answer = (answer + 1) % LETTERS.length;
  const choices = [answer];
  while (choices.length < 4) {
    let next = pick();
    // walk on from a taken one, so even a poor random source cannot loop for ever
    while (choices.includes(next) || LETTERS[next].name === LETTERS[answer].name) next = (next + 1) % LETTERS.length;
    choices.splice(Math.floor(random() * (choices.length + 1)), 0, next);
  }
  return { answer, choices };
}

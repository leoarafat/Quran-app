// Pure rules for the hadith data. Texts are never altered; folding is only for comparing.

/** Which printed collections the Bangla attribution line names. */
const BOOK_NAMES = [
  ["bukhari", /বুখার/], ["muslim", /মুসলিম/], ["abudawud", /আবূ\s*দা[উঊ]দ|আবু\s*দা[উঊ]দ/], ["tirmidhi", /তির(ি)?মিয/],
  ["nasai", /নাসা(ঈ|য়ী|ই)/], ["ibnmajah", /ইবন[েু]?\s*মাজাহ/],
];

export const BOOK_TITLES = {
  bukhari: "সহিহ বুখারী", muslim: "সহিহ মুসলিম", abudawud: "সুনানে আবূ দাউদ",
  tirmidhi: "জামে তিরমিযী", nasai: "সুনানে নাসাঈ", ibnmajah: "সুনানে ইবনে মাজাহ",
};

export function booksNamed(attribution) {
  const text = attribution.normalize("NFC");
  const books = BOOK_NAMES.filter(([, pattern]) => pattern.test(text)).map(([book]) => book);
  if (/মুত্তাফাক/.test(text)) for (const book of ["bukhari", "muslim"]) if (!books.includes(book)) books.push(book);
  return books;
}

/**
 * Every grade wording in the source, sorted by hand. The wording itself is shown unchanged;
 * the class is only for the badge colour and filtering. An unknown wording stops the build.
 */
const GRADES = {
  sahih: [
    "সহীহ", "উভয় বর্ণনাসহ সহীহ", "হাদিসটি এর শাওয়াহেদ (বিভিন্ন সমার্থক হাদিস) থাকার কারণে সহীহ", "হাদিসটি এর বিভিন্ন সূত্রের সমন্বয়ে সহীহ।",
    "হাদীসটির সনদ সহীহ।", "সহীহ লি-গাইরিহী", "সহীহ লিগাইরিহী", "একাধিক সনদ ও শাওয়াহেদ (সমঅর্থে আরও) হাদীস থাকার কারণে সহীহ",
    "হাসান সহীহ", "শাওয়াহেদ (সমঅর্থে আরও) হাদীস থাকার কারণে সহীহ", "সকল বর্ণনাতে সহীহ", "ইমাম নববী বলেছেন: হাদীসটি সহীহ।",
  ],
  hasan: [
    "হাসান", "হাসান লিগাইরিহী", "হাসান লি-গাইরিহী", "ইমাম নববী বলেছেন: হাদীসটি হাসান।",
    "হাদিসটি এর শাওয়াহেদ (বিভিন্ন সমার্থক হাদিস) থাকার কারণে হাসান", "হাদীসটির সনদ হাসান।", "হাদীসটির সনদ হাসান", "হাসান, গরীব",
    "তিরমিযী বলেছেন: হাদীসটি হাসান।", "হাদিসটি এর বিভিন্ন সূত্রের সমন্বয়ে হাসান।",
  ],
  // Never published.
  weak: ["দুর্বল"],
  // Wording that does not state a grade plainly: held back until a scholar decides.
  review: ["আলবানী ইবনু তাইমিয়াহ কর্তৃক হাদীসটিকে সহীহ বলার হুকুম বর্ণনা করেছেন, কিন্তু তিনি তার ত্রুটি ধরেননি।"],
};

const tidy = (s) => s.normalize("NFC").replace(/\s+/g, " ").trim();
const GRADE_CLASS = new Map(Object.entries(GRADES).flatMap(([cls, list]) => list.map((g) => [tidy(g), cls])));

export function gradeClass(grade) {
  const found = GRADE_CLASS.get(tidy(grade));
  if (!found) throw new Error(`Unknown hadith grade, classify it by hand: ${grade}`);
  return found;
}

export function arabicSkeleton(text) {
  return text.normalize("NFD")
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
    .replace(/ٱ/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ء/g, "")
    .replace(/[^ء-ي]+/g, " ").trim();
}

/** The Prophet's words (the quoted parts) identify a hadith better than the narrator line. */
export function matnOf(arabic) {
  const quoted = [...arabic.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
  const text = quoted.join(" ");
  return arabicSkeleton(text).split(" ").length >= 6 ? { text, quoted: true } : { text: arabic, quoted: false };
}

const N = 4;
const grams = (words) => {
  const out = new Set();
  for (let i = 0; i + N <= words.length; i++) out.add(words.slice(i, i + N).join(" "));
  return out;
};

export function indexBook(hadiths) {
  const index = new Map();
  hadiths.forEach((h, i) => {
    for (const g of grams(arabicSkeleton(h.text).split(" "))) {
      const list = index.get(g);
      if (list) list.push(i);
      else index.set(g, [i]);
    }
  });
  return { index, hadiths };
}

/** Share of the text's 4-word runs found in the closest hadith of a book, and which numbers reach it. */
export function bestMatch(book, arabic) {
  const wanted = grams(arabicSkeleton(arabic).split(" "));
  if (wanted.size < 3) return { score: 0, numbers: [], grams: wanted.size };
  const hits = new Map();
  for (const g of wanted) for (const i of new Set(book.index.get(g) ?? [])) hits.set(i, (hits.get(i) ?? 0) + 1);
  let top = 0;
  for (const n of hits.values()) top = Math.max(top, n);
  const numbers = [...hits].filter(([, n]) => n === top).map(([i]) => book.hadiths[i].hadithnumber).sort((a, b) => a - b);
  return { score: top / wanted.size, numbers, grams: wanted.size };
}

/**
 * Our own step-by-step reading course, in the order qaida teaching commonly follows. No printed
 * book's text, tables or layout is copied. Drill cells are built from the alphabet; every example
 * word is found by pattern in the Quran data and shown exactly as it stands there.
 * The rule wording still awaits a qari's review (docs/ALEM-REVIEW.md, part গ).
 */
import { LETTERS } from "./letters";

const FATHA = "َ", DAMMA = "ُ", KASRA = "ِ", SUKUN = "ْ", SHADDA = "ّ";
const FATHATAN = "ً", DAMMATAN = "ٌ", KASRATAN = "ٍ";

/** `pattern` is searched in a single word, or in two neighbouring words when `pair` is set. */
export type ExampleRule = { label: string; pattern: RegExp; pair?: true; limit?: number };
export type Drill = { title: string; cells: string[] };
export type QaidaLesson = {
  slug: string;
  title: string;
  hint: string;
  intro: string;
  points?: string[];
  tables?: { title: string; rows: [string, string][] }[];
  drills?: Drill[];
  examples?: ExampleRule[];
};

/** Every letter with one sign. A bare alif cannot carry a vowel, so hamza stands in for it. */
const each = (mark: string) => LETTERS.map((l) => (l.ch === "ا" ? (mark === KASRA || mark === KASRATAN ? "إ" : "أ") : l.ch) + mark);
const consonants = LETTERS.filter((l) => !"اوي".includes(l.ch)).map((l) => l.ch);

/** Any letter that can follow, including the hamza forms. */
const THROAT = "ءأإؤئآهعحغخ";
const IKHFA = "تثجدذزسشصضطظفقك";
const MARK = "[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]";
/** noon with sukun or with no vowel at all, then the next letter */
const noonBefore = (letters: string) => new RegExp(`ن${SUKUN}?\\u06E2?[${letters}]`, "u");
/** tanween closing a word (perhaps with its carrying alif), then the next word's first letter */
const tanweenBefore = (letters: string) => new RegExp(`[${FATHATAN}${DAMMATAN}${KASRATAN}]${MARK}*[اى]?${MARK}* [${letters}]`, "u");
const noonAcross = (letters: string) => new RegExp(`ن${SUKUN}?\\u06E2? [${letters}]`, "u");

export const QAIDA: readonly QaidaLesson[] = [
  {
    slug: "makhraj", title: "মাখরাজ: হরফ কোথা থেকে বের হয়", hint: "মুখের কোন জায়গা থেকে কোন হরফ",
    intro: "যে জায়গা থেকে হরফ উচ্চারিত হয় তাকে মাখরাজ বলে। কোনো হরফের মাখরাজ চিনতে সেটিকে সাকিন করে আগে একটি যবরওয়ালা হামযা লাগিয়ে বলুন (যেমন আব্, আত্); আওয়াজ যেখানে থামে সেটিই মাখরাজ।",
    points: ["পড়ে মাখরাজ চেনা যায়, কিন্তু শুদ্ধ হয় শিক্ষকের মুখ থেকে শুনে ও তাঁকে শুনিয়ে।"],
    tables: [
      { title: "কণ্ঠনালি (হলক)", rows: [["ء ه", "কণ্ঠনালির শুরু (বুকের দিক)"], ["ع ح", "কণ্ঠনালির মাঝখান"], ["غ خ", "কণ্ঠনালির শেষ (মুখের দিক)"]] },
      { title: "জিহ্বা", rows: [["ق", "জিহ্বার গোড়া ও তার ওপরের তালু"], ["ك", "গোড়ার একটু সামনে ও ওপরের তালু"], ["ج ش ي", "জিহ্বার মাঝখান ও ওপরের তালু"], ["ض", "জিহ্বার কিনারা ও ওপরের মাড়ির দাঁতের গোড়া"], ["ل", "জিহ্বার আগার দিকের কিনারা ও সামনের মাড়ি"], ["ن", "জিহ্বার আগা ও তালু, লামের একটু নিচে"], ["ر", "জিহ্বার আগার পিঠ ও তালু"], ["ت د ط", "জিহ্বার আগা ও ওপরের সামনের দুই দাঁতের গোড়া"], ["ث ذ ظ", "জিহ্বার আগা ও ওপরের সামনের দাঁতের আগা"], ["ز س ص", "জিহ্বার আগা ও সামনের নিচের দাঁতের আগা"]] },
      { title: "ঠোঁট, মুখের খালি জায়গা ও নাক", rows: [["ف", "নিচের ঠোঁটের পেট ও ওপরের সামনের দাঁতের আগা"], ["ب م و", "দুই ঠোঁট (ওয়াও বলতে ঠোঁট গোল হয়)"], ["ا و ي", "মদের হরফ: মুখের খালি জায়গা থেকে"], ["ن م", "গুন্নাহ: নাকের বাঁশি থেকে"]] },
    ],
    drills: [{ title: "মাখরাজ অনুশীলন: আগে হামযা, পরে সাকিন হরফ", cells: LETTERS.filter((l) => l.ch !== "ا").map((l) => `أَ${l.ch}${SUKUN}`) }],
  },
  {
    slug: "joda", title: "যুক্ত হরফ চেনা", hint: "শব্দে হরফের চেহারা বদলায়",
    intro: "আরবি ডান থেকে বামে লেখা হয়। শব্দের ভেতরে হরফ জোড়া লেগে চেহারা বদলায়, তবে নুকতা একই থাকে। ছয়টি হরফ (ا د ذ ر ز و) পরের হরফের সাথে জোড়া লাগে না।",
    points: ["প্রতিটি যুক্ত শব্দে আঙুল রেখে ডান থেকে হরফের নাম একটি একটি করে বলুন।"],
    drills: [
      { title: "দুই হরফ", cells: ["با", "تب", "ثم", "جد", "حر", "خل", "سن", "شك", "صف", "ضم", "طه", "ظل", "عن", "غو", "فى", "قد", "كل", "لا", "من", "هو", "يد"] },
      { title: "তিন হরফ", cells: ["بسم", "كتب", "خلق", "علم", "نصر", "جعل", "سجد", "ذكر", "فتح", "قلب", "صبر", "ملك"] },
    ],
  },
  {
    slug: "horkot", title: "হরকত: যবর, যের, পেশ", hint: "ছোট তিনটি স্বরচিহ্ন",
    intro: "যবর, যের ও পেশকে হরকত বলে। হরকতওয়ালা হরফ তাড়াতাড়ি পড়তে হয়, টানা যাবে না।",
    points: ["যবর হরফের ওপরে: “আ” কারের মতো, যেমন بَ = বা (না টেনে)।", "যের হরফের নিচে: “ই” কারের মতো, যেমন بِ = বি।", "পেশ হরফের ওপরে ছোট ওয়াওয়ের মতো: “উ” কারের মতো, যেমন بُ = বু।", "মোটা হরফ (خ ص ض ط ظ غ ق) যবর দিলেও মুখ ভরে মোটা উচ্চারণ হয়।"],
    drills: [{ title: "যবর", cells: each(FATHA) }, { title: "যের", cells: each(KASRA) }, { title: "পেশ", cells: each(DAMMA) }, { title: "মিশিয়ে পড়ুন", cells: ["كَتَبَ", "خَلَقَ", "جَعَلَ", "سَمِعَ", "عَلِمَ", "خُلِقَ", "كُتِبَ", "نَصَرَ"] }],
  },
  {
    slug: "tanween", title: "তানবীন: দুই যবর, দুই যের, দুই পেশ", hint: "শেষে নূনের আওয়াজ",
    intro: "দুই যবর, দুই যের ও দুই পেশকে তানবীন বলে। তানবীনে হরকতের সাথে শেষে একটি নূন সাকিনের আওয়াজ হয়।",
    points: ["بً = বান, بٍ = বিন, بٌ = বুন।", "দুই যবরের পরে সাধারণত একটি অতিরিক্ত আলিফ লেখা থাকে; মিলিয়ে পড়লে সেটি টানা হয় না।", "ওই শব্দে থামলে দুই যবরে এক আলিফ টান হয়; দুই যের ও দুই পেশে হরফ সাকিন হয়।"],
    drills: [{ title: "দুই যবর", cells: each(FATHATAN) }, { title: "দুই যের", cells: each(KASRATAN) }, { title: "দুই পেশ", cells: each(DAMMATAN) }],
    examples: [{ label: "কুরআনের তানবীনওয়ালা শব্দ", pattern: new RegExp(`[${FATHATAN}${DAMMATAN}${KASRATAN}]`, "u"), limit: 8 }],
  },
  {
    slug: "sakin", title: "জযম বা সাকিন", hint: "আগের হরফের সাথে মিলিয়ে পড়া",
    intro: "যে হরফে জযম থাকে তাকে সাকিন হরফ বলে। সাকিন হরফ একা পড়া যায় না; আগের হরকতওয়ালা হরফের সাথে মিলিয়ে একবার পড়তে হয়।",
    points: ["مِنْ = মিন, قُلْ = কুল, هَبْ = হাব।"],
    drills: [{ title: "হামযা যবরের সাথে সাকিন", cells: consonants.map((c) => `أَ${c}${SUKUN}`) }, { title: "বা যেরের সাথে সাকিন", cells: consonants.map((c) => `بِ${c}${SUKUN}`) }],
    examples: [{ label: "কুরআনের সাকিনওয়ালা শব্দ", pattern: new RegExp(SUKUN, "u"), limit: 10 }],
  },
  {
    slug: "tashdid", title: "তাশদীদ", hint: "এক হরফ দুইবার",
    intro: "তাশদীদওয়ালা হরফ দুইবার পড়তে হয়: প্রথমে আগের হরফের সাথে সাকিন হিসেবে, তারপর নিজের হরকত দিয়ে।",
    points: ["رَبِّ = রব + বি = রব্বি।"],
    drills: [{ title: "হামযা যবরের সাথে তাশদীদ", cells: consonants.map((c) => `أَ${c}${SHADDA}${FATHA}`) }],
    examples: [{ label: "কুরআনের তাশদীদওয়ালা শব্দ", pattern: new RegExp(SHADDA, "u"), limit: 10 }],
  },
  {
    slug: "madd", title: "মদ: টেনে পড়া", hint: "মদের তিন হরফ, খাড়া যবর, মদ চিহ্ন",
    intro: "মদের হরফ তিনটি: যবরের পরে খালি আলিফ, পেশের পরে সাকিন ওয়াও, আর যেরের পরে সাকিন ইয়া। এগুলো এক আলিফ (প্রায় দুই হরকত সময়) টানতে হয়।",
    points: ["খাড়া যবর, খাড়া যের ও উল্টা পেশও এক আলিফ টান।", "হরফের ওপর ঢেউয়ের মতো মদ চিহ্ন (ٓ) থাকলে আরও লম্বা টান: সাধারণত তিন থেকে চার আলিফ। কতটা টানবেন তা মদের প্রকার অনুযায়ী শিক্ষকের কাছে শিখুন।", "আয়াতের শেষে থামার সময় শেষ হরফের আগে মদের হরফ থাকলে এক থেকে তিন আলিফ টানা যায়।"],
    drills: [{ title: "আলিফ মদ", cells: consonants.map((c) => `${c}${FATHA}ا`) }, { title: "ওয়াও মদ", cells: consonants.map((c) => `${c}${DAMMA}و`) }, { title: "ইয়া মদ", cells: consonants.map((c) => `${c}${KASRA}ي`) }],
    examples: [{ label: "খাড়া যবরওয়ালা শব্দ", pattern: /ٰ/u }, { label: "মদ চিহ্নওয়ালা শব্দ", pattern: /ٓ/u }],
  },
  {
    slug: "leen", title: "লীন", hint: "যবরের পরে সাকিন ওয়াও বা ইয়া",
    intro: "যবরের পরে সাকিন ওয়াও বা সাকিন ইয়া হলে তাকে লীনের হরফ বলে। এগুলো নরম করে, না টেনে তাড়াতাড়ি পড়তে হয়। তবে ওই শব্দে থামলে একটু টানা যায়।",
    drills: [{ title: "ওয়াও লীন", cells: consonants.map((c) => `${c}${FATHA}و${SUKUN}`) }, { title: "ইয়া লীন", cells: consonants.map((c) => `${c}${FATHA}ي${SUKUN}`) }],
    examples: [{ label: "কুরআনের লীনওয়ালা শব্দ", pattern: new RegExp(`${FATHA}[وي]${SUKUN}`, "u"), limit: 8 }],
  },
  {
    slug: "qalqalah", title: "ক্বলক্বলা", hint: "পাঁচ হরফে প্রতিধ্বনি",
    intro: "ক্বলক্বলার হরফ পাঁচটি: ق ط ب ج د। এগুলো সাকিন হলে উচ্চারণের শেষে একটু ধাক্কা বা প্রতিধ্বনি হয়। থামার কারণে সাকিন হলে ধাক্কা আরও স্পষ্ট হয়।",
    drills: [{ title: "অনুশীলন", cells: [..."قطبجد"].flatMap((c) => [`أَ${c}${SUKUN}`, `إِ${c}${SUKUN}`, `أُ${c}${SUKUN}`]) }],
    examples: [{ label: "কুরআনের ক্বলক্বলার শব্দ", pattern: new RegExp(`[قطبجد]${SUKUN}`, "u"), limit: 8 }],
  },
  {
    slug: "gunnah", title: "ওয়াজিব গুন্নাহ", hint: "তাশদীদওয়ালা নূন ও মীম",
    intro: "নূন বা মীমে তাশদীদ থাকলে অবশ্যই গুন্নাহ করতে হয়: আওয়াজ নাকে নিয়ে এক আলিফ পরিমাণ ধরে রাখুন।",
    examples: [{ label: "তাশদীদওয়ালা নূন", pattern: new RegExp(`ن[${FATHA}${DAMMA}${KASRA}]?${SHADDA}`, "u") }, { label: "তাশদীদওয়ালা মীম", pattern: new RegExp(`م[${FATHA}${DAMMA}${KASRA}]?${SHADDA}`, "u") }],
  },
  {
    slug: "noon", title: "নূন সাকিন ও তানবীনের ৪ নিয়ম", hint: "ইযহার, ইদগাম, ইক্বলাব, ইখফা",
    intro: "নূন সাকিন বা তানবীনের পরের হরফ দেখে চারটি নিয়মের একটি হয়।",
    tables: [{ title: "কোন হরফে কোন নিয়ম", rows: [["ء ه ع ح غ خ", "ইযহার: গুন্নাহ ছাড়া স্পষ্ট করে নূন পড়ুন"], ["ي ن م و", "গুন্নাহসহ ইদগাম: নূন পরের হরফে মিলিয়ে নাকে ধরে পড়ুন (দুই শব্দে হলে)"], ["ل ر", "গুন্নাহ ছাড়া ইদগাম: নূন পুরোপুরি পরের হরফে মিলে যায়"], ["ب", "ইক্বলাব: নূনকে মীম বানিয়ে গুন্নাহসহ পড়ুন"], [[...IKHFA].join(" "), "ইখফা: নূন লুকিয়ে, নাকে হালকা আওয়াজ রেখে পড়ুন"]] }],
    points: ["একই শব্দের ভেতরে নূন সাকিনের পরে ওয়াও বা ইয়া হলে ইদগাম হয় না, স্পষ্ট পড়তে হয় (যেমন دنيا)।"],
    examples: [
      { label: "ইযহার: নূন সাকিনের পরে", pattern: new RegExp(`ن${SUKUN}[${THROAT}]`, "u"), limit: 4 },
      { label: "ইযহার: তানবীনের পরে", pattern: tanweenBefore(THROAT), pair: true, limit: 4 },
      { label: "গুন্নাহসহ ইদগাম", pattern: noonAcross("ينمو"), pair: true, limit: 4 },
      { label: "গুন্নাহ ছাড়া ইদগাম", pattern: noonAcross("لر"), pair: true, limit: 4 },
      { label: "ইক্বলাব: এক শব্দে", pattern: noonBefore("ب"), limit: 3 },
      { label: "ইক্বলাব: দুই শব্দে", pattern: noonAcross("ب"), pair: true, limit: 3 },
      { label: "ইখফা: এক শব্দে", pattern: noonBefore(IKHFA), limit: 6 },
      { label: "ইখফা: তানবীনের পরে", pattern: tanweenBefore(IKHFA), pair: true, limit: 4 },
    ],
  },
  {
    slug: "meem", title: "মীম সাকিনের ৩ নিয়ম", hint: "ইখফা, ইদগাম, ইযহার",
    intro: "মীম সাকিনের পরের হরফ দেখে তিনটি নিয়মের একটি হয়।",
    tables: [{ title: "নিয়ম", rows: [["ب", "ইখফা: ঠোঁট হালকা মিলিয়ে গুন্নাহসহ পড়ুন"], ["م", "ইদগাম: দুই মীম মিলিয়ে গুন্নাহসহ পড়ুন"], ["বাকি হরফ", "ইযহার: গুন্নাহ ছাড়া স্পষ্ট মীম পড়ুন"]] }],
    examples: [
      { label: "মীম সাকিনের পরে বা", pattern: new RegExp(`م${SUKUN}? ب`, "u"), pair: true, limit: 4 },
      { label: "মীম সাকিনের পরে মীম", pattern: new RegExp(`م${SUKUN}? م`, "u"), pair: true, limit: 4 },
      { label: "স্পষ্ট মীম সাকিন", pattern: new RegExp(`م${SUKUN}[^بم ]`, "u"), limit: 6 },
    ],
  },
  {
    slug: "mota", title: "আল-এর লাম, রা ও মোটা হরফ", hint: "লাম কখন পড়বেন, রা কখন মোটা",
    intro: "শব্দের শুরুর “আল” (ال)-এর লাম কখনো পড়া হয়, কখনো পরের হরফে মিলে যায়। কিছু হরফ সবসময় মোটা, আর রা ও আল্লাহ শব্দের লাম অবস্থা অনুযায়ী মোটা বা পাতলা।",
    points: ["লামে জযম থাকলে লাম পড়ুন (কামারি)।", "পরের হরফে তাশদীদ থাকলে লাম না পড়ে সোজা সেই হরফে যান (শামসি)।", "خ ص ض غ ط ق ظ সবসময় মোটা।", "রা-তে যবর বা পেশ হলে সাধারণত মোটা, যের হলে পাতলা। সাকিন রা-র হুকুম আগের হরকত দেখে হয়; কিছু ব্যতিক্রম শিক্ষকের কাছে শিখুন।", "আল্লাহ শব্দের আগে যবর বা পেশ থাকলে লাম মোটা, যের থাকলে পাতলা।"],
    examples: [{ label: "লাম পড়া হয় (কামারি)", pattern: new RegExp(`^ٱلْ`, "u") }, { label: "লাম মিলে যায় (শামসি)", pattern: new RegExp(`^ٱل(?!ل)\\p{L}[${FATHA}${DAMMA}${KASRA}]?${SHADDA}`, "u") }],
  },
  {
    slug: "waqf", title: "থামার নিয়ম ও চিহ্ন", hint: "ওয়াকফ: কোথায় থামবেন",
    intro: "থামাকে ওয়াকফ বলে। থামলে সাধারণত শেষ হরফ সাকিন হয়ে যায়। কুরআনের ছোট চিহ্নগুলো বলে দেয় কোথায় থামা ভালো।",
    points: ["দুই যবরে থামলে এক আলিফ টান দিয়ে থামুন।", "গোল তা (ة)-তে থামলে সেটি “হ্” উচ্চারণ হয়।"],
    tables: [{ title: "প্রচলিত চিহ্ন (মুসহাফভেদে ভিন্ন হতে পারে)", rows: [["ۘ", "থামা জরুরি"], ["ۙ", "থামবেন না"], ["ۚ", "থামা ও না থামা দুটোই চলে"], ["ۖ", "না থেমে পড়া ভালো"], ["ۗ", "থামা ভালো"], ["ۛ", "জোড়া তিন নুকতা: দুই জায়গার যেকোনো এক জায়গায় থামুন"], ["ۜ", "ছোট সীন: নিঃশ্বাস না ছেড়ে সামান্য বিরতি বা সীন উচ্চারণ; জায়গাভেদে শিক্ষকের কাছে শিখুন"]] }],
  },
];

export const qaidaPath = (slug: string) => `/arabic/${slug}/`;

export type WordExample = { text: string; s: number; a: number };

/** The first different words (or word pairs) in the given ayahs that match each rule. */
export function findRuleExamples(ayahs: Iterable<{ s: number; a: number; ar: string }>, rules: readonly ExampleRule[]): WordExample[][] {
  const found: WordExample[][] = rules.map(() => []);
  const full = (i: number) => found[i].length >= (rules[i].limit ?? 6);
  for (const { s, a, ar } of ayahs) {
    // pause signs stand alone between words; they are not words
    const words = ar.split(" ").filter((w) => /\p{L}/u.test(w));
    rules.forEach((rule, i) => {
      for (let w = 0; w < words.length && !full(i); w++) {
        if (rule.pair && w === words.length - 1) break;
        const text = rule.pair ? `${words[w]} ${words[w + 1]}` : words[w];
        // for a pair, the match has to cross the space, and neither word may be long
        if (!rule.pattern.test(text) || (text.match(/\p{L}/gu)?.length ?? 0) > (rule.pair ? 11 : 7)) continue;
        if (!found[i].some((e) => e.text === text)) found[i].push({ text, s, a });
      }
    });
    if (rules.every((_, i) => full(i))) break;
  }
  return found;
}

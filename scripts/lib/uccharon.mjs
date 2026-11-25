// Rule-based Bangla pronunciation of the Tanzil Uthmani text, written the way Bangla
// readers know it. It is machine generated and still needs review by a qari.
// Anything the rules do not understand throws, so nothing is silently dropped.

const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
const FATHATAN = "ً";
const DAMMATAN = "ٌ";
const KASRATAN = "ٍ";
const SHADDA = "ّ";
const SUKUN = "ْ";
const MADDAH = "ٓ";
const HAMZA_ABOVE = "ٔ";
const DAGGER = "ٰ";
const SMALL_WAW = "ۥ";
const SMALL_YEH = "ۦ";
const SMALL_HIGH_YEH = "ۧ";
const SMALL_HIGH_NOON = "ۨ";
const SILENT = "۟";
const SILENT_UNLESS_STOPPING = "۠";
const MEEM_HIGH = "ۢ";
const MEEM_LOW = "ۭ";
const IMALA = "۪";

const TATWEEL = "ـ";
const ALEF = "ا";
const WASLA = "ٱ";
const WAW = "و";
const YEH = "ي";
const MAKSURA = "ى";
const TEH_MARBUTA = "ة";

const KNOWN_MARKS = new Set([
  FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN, SHADDA, SUKUN, MADDAH, HAMZA_ABOVE, DAGGER,
  SMALL_WAW, SMALL_YEH, SMALL_HIGH_YEH, SMALL_HIGH_NOON, SILENT, SILENT_UNLESS_STOPPING,
  MEEM_HIGH, MEEM_LOW, IMALA,
  "ۜ", // small high seen
  "ۣ", // small low seen
  "۫", // ishmam sign
  "۬", // tashil sign
]);

// Stop and section signs. They carry no sound.
const SIGNS = /[ۖ-ۛ۞۩]/g;
const COMMA_SIGNS = /[ۘۚ]/;

const LETTERS = {
  "ء": "hamza", "أ": "hamza", "ؤ": "hamza", "إ": "hamza", "ئ": "hamza",
  "ب": "b", "ت": "t", [TEH_MARBUTA]: "t", "ث": "th", "ج": "j", "ح": "hh",
  "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s",
  "ش": "sh", "ص": "ss", "ض": "dd", "ط": "tt", "ظ": "zz", "ع": "ain",
  "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m",
  "ن": "n", "ه": "h", [WAW]: "w", [YEH]: "y", [MAKSURA]: "y",
};

const BANGLA = {
  b: "ব", t: "ত", th: "ছ", j: "জ", hh: "হ", kh: "খ", d: "দ", dh: "য", r: "র", z: "য", s: "স",
  sh: "শ", ss: "স", dd: "দ", tt: "ত", zz: "য", gh: "গ", f: "ফ", q: "ক", k: "ক", l: "ল",
  m: "ম", n: "ন", h: "হ", w: "ও", y: "ই",
};

// Doubling these as a plain conjunct changes the shape (ya-phala, reph) or reads badly.
const SPLIT_DOUBLE = new Set(["র", "য", "হ", "খ", "ছ", "ফ"]);

const SIGN = { a: "া", i: "ি", u: "ু", e: "ে" };
const LONG_SIGN = { a: "া", i: "ী", u: "ূ", e: "ে" };
const ALONE = { a: "আ", i: "ই", u: "উ", e: "এ" };
const LONG_ALONE = { a: "আ", i: "ঈ", u: "ঊ", e: "এ" };
const HAMZA_MARK = "’";

// Disjointed letters are read by their names, so they are listed rather than derived.
const ALM = "আলিফ লাম মীম";
const ALR = "আলিফ লাম রা";
const HM = "হা মীম";
export const MUQATTAAT = {
  "2:1": ALM, "3:1": ALM, "7:1": "আলিফ লাম মীম সোয়াদ", "10:1": ALR, "11:1": ALR, "12:1": ALR,
  "13:1": "আলিফ লাম মীম রা", "14:1": ALR, "15:1": ALR, "19:1": "কাফ হা ইয়া আইন সোয়াদ",
  "20:1": "ত্বা হা", "26:1": "ত্বা সীন মীম", "27:1": "ত্বা সীন", "28:1": "ত্বা সীন মীম",
  "29:1": ALM, "30:1": ALM, "31:1": ALM, "32:1": ALM, "36:1": "ইয়া সীন", "38:1": "সোয়াদ",
  "40:1": HM, "41:1": HM, "42:1": HM, "42:2": "আইন সীন ক্বাফ", "43:1": HM, "44:1": HM,
  "45:1": HM, "46:1": HM, "50:1": "ক্বাফ", "68:1": "নূন",
};

// At the start of a recitation these begin with "i" although their third letter has a damma.
const WASL_I = ["امشوا", "ابنوا", "ائتوا", "اقضوا", "امضوا", "اتقوا", "اسم", "ابن", "امر", "اثن"];

const unit = (c, extra = {}) => ({ c, v: "", long: false, gem: false, tan: false, bare: false, ...extra });

function clusters(word) {
  const out = [];
  for (const ch of word) {
    if (ch === TATWEEL) out.push({ letter: ch, marks: [] });
    else if (LETTERS[ch] || ch === ALEF || ch === WASLA) out.push({ letter: ch, marks: [] });
    else if (KNOWN_MARKS.has(ch)) {
      if (!out.length) throw new Error(`Mark without a letter in "${word}"`);
      const marks = out[out.length - 1].marks;
      const small = marks.at(-1);
      // A vowel written on a small ya / waw turns it into a spoken consonant: "ataniya".
      if ((ch === FATHA || ch === DAMMA || ch === KASRA) && (small === SMALL_YEH || small === SMALL_WAW)) {
        marks.pop();
        out.push({ letter: small === SMALL_YEH ? YEH : WAW, marks: [ch] });
      } else marks.push(ch);
    } else throw new Error(`Unknown character U+${ch.codePointAt(0).toString(16)} in "${word}"`);
  }
  return out;
}

function applyVowel(u, has) {
  if (has(FATHA)) u.v = "a";
  else if (has(DAMMA)) u.v = "u";
  else if (has(KASRA)) u.v = "i";
  else if (has(FATHATAN) || has(DAMMATAN) || has(KASRATAN)) {
    u.v = has(FATHATAN) ? "a" : has(DAMMATAN) ? "u" : "i";
    u.tan = true;
  }
  if (has(IMALA)) {
    u.v = "e";
    u.long = true;
  }
}

/** One written word -> sound units, before rules that cross word boundaries. */
function parseWord(word) {
  const units = [];
  let wasl = false;
  const last = () => units[units.length - 1];
  const lengthen = (vowel, silah = false) => {
    const u = last();
    if (!u) throw new Error(`Long vowel with nothing before it in "${word}"`);
    u.v ||= vowel;
    u.long = true;
    if (silah) u.silah = true;
  };

  let afterWasl = false;

  clusters(word).forEach(({ letter, marks }, position) => {
    const has = (m) => marks.includes(m);
    const vowelled = [FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN].some(has);
    const iqlab = has(MEEM_HIGH) || has(MEEM_LOW);

    if (has(SILENT)) return;

    if (letter === TATWEEL) {
      if (has(HAMZA_ABOVE)) {
        const u = unit("hamza", { gem: has(SHADDA), iqlab });
        applyVowel(u, has);
        units.push(u);
        if (has(DAGGER)) lengthen("a");
      } else if (has(SMALL_HIGH_NOON)) {
        units.push(unit("n"));
      } else if (has(SMALL_HIGH_YEH)) {
        if (vowelled) {
          const u = unit("y", { gem: has(SHADDA) });
          applyVowel(u, has);
          units.push(u);
        } else lengthen("i");
      } else if (has(DAGGER)) lengthen("a");
      else if (has(SMALL_WAW)) lengthen("u", true);
      else if (has(SMALL_YEH)) lengthen("i", true);
      return;
    }

    if (letter === WASLA) {
      if (position === 0) wasl = true;
      afterWasl = true;
      return; // after a prefix it is silent
    }

    if (letter === ALEF) {
      if (has(SILENT_UNLESS_STOPPING)) {
        if (last()) last().stopAlef = true;
        return;
      }
      if (vowelled) throw new Error(`Vowelled alef in "${word}"`);
      const prev = last();
      if (prev && !prev.tan && (prev.v === "a" || prev.v === "")) lengthen("a");
      return;
    }

    const prev = last();
    const plain = !vowelled && !has(SHADDA) && !has(SUKUN);

    // Letters that only stretch the vowel before them.
    if (plain && prev && (letter === WAW || letter === YEH || letter === MAKSURA)) {
      if (has(DAGGER)) {
        if (!prev.tan) lengthen("a");
        return;
      }
      if (letter === WAW && prev.v === "u" && !prev.tan) return lengthen("u");
      if (letter !== WAW && prev.v === "i" && !prev.tan) return lengthen("i");
      if (letter === MAKSURA && (prev.v === "a" || prev.tan)) {
        if (!prev.tan) lengthen("a");
        return;
      }
    }

    const c = LETTERS[letter];
    const u = unit(c, { gem: has(SHADDA), bare: plain, iqlab, marbuta: letter === TEH_MARBUTA });
    applyVowel(u, has);
    if (afterWasl && c === "l" && !u.v && !u.gem) u.articleLam = true;
    afterWasl = false;
    units.push(u);
    if (has(DAGGER)) lengthen("a");
    // Small waw / yeh stretch a pronoun ending ("lahu"), but not when the reader stops.
    if (has(SMALL_WAW)) lengthen("u", true);
    if (has(SMALL_YEH)) lengthen("i", true);
    if (has(SMALL_HIGH_YEH)) lengthen("i");
    if (has(HAMZA_ABOVE)) units.push(unit("hamza"));
  });

  // Noted before any lam is absorbed by the letter after it.
  return { units, wasl, article: wasl && units[0]?.c === "l" && (!units[0].v || units[0].gem) };
}

const bareWord = (word) => word.replace(/[^ء-غف-يٱ]/g, "").replace(/ٱ/g, ALEF);

function initialWaslVowel(word, units) {
  if (word.article) return "a";
  const plain = bareWord(word.source);
  if (WASL_I.some((w) => plain.startsWith(w))) return "i";
  return units[1]?.v === "u" ? "u" : "i";
}

/** Applies the rules that join one word to the next. */
function connect(words) {
  words.forEach((word, index) => {
    const prev = words[index - 1];
    const units = word.units;

    // Inside a word: a letter with no mark before a doubled letter is absorbed by it.
    for (let i = units.length - 2; i >= 0; i--) {
      if (units[i].bare && units[i + 1].gem) units.splice(i, 1);
    }

    if (!prev) {
      if (word.wasl) {
        const start = unit("hamza", { v: initialWaslVowel(word, units) });
        if (units[0]?.c === "l" && units[0].gem) {
          units.unshift(start);
        } else if (units[0]?.gem) {
          // Sun letter at the very start: "আর রাহমান"
          const first = units[0];
          units.unshift(start, unit(first.c, { breakAfter: true }));
          first.gem = false;
        } else units.unshift(start);
      } else if (units[0]) units[0].gem = false;
      return;
    }

    const tail = prev.units[prev.units.length - 1];

    if (word.wasl) {
      if (tail.tan) {
        // Tanween meeting a joining alef is read with "ni".
        tail.tan = false;
        prev.units.push(unit("n", { v: "i" }));
      } else if (tail.long) tail.long = false;

      const first = units[0];
      if (first.c === "l" && first.gem) {
        word.joinPrevious = true; // Allah, alladhi, and other words starting with a doubled lam
      } else if (first.gem) {
        prev.units.push(unit(first.c));
        first.gem = false;
      } else if (!first.v) {
        // The article gives its lam to the word before ("রাব্বিল আলামীন").
        // Other words would break into odd pieces, so they are written together.
        if (word.article) prev.units.push(units.shift());
        else word.joinPrevious = true;
      }
      return;
    }

    const first = units[0];
    if (!first) return;

    if (first.gem) {
      // Full assimilation: "মির রাব্বিহিম"
      first.gem = false;
      const absorbed = tail.tan || (tail.bare && !tail.v);
      if (absorbed) {
        if (tail.tan) tail.tan = false;
        else prev.units.pop();
        prev.units.push(unit(first.c));
      }
      return;
    }

    // Noon or tanween before ya / waw without doubling: nasal glide.
    const noonEnd = tail.tan || (tail.c === "n" && tail.bare && !tail.v);
    if (noonEnd && (first.c === "y" || first.c === "w")) {
      if (tail.tan) {
        tail.tan = false;
        prev.units.push(unit("nasal", { target: first.c }));
      } else Object.assign(tail, { c: "nasal", target: first.c });
    }
  });
}

/** Changes the final sound the way a reader does when stopping at the end of an ayah. */
function pauseAt(units) {
  const u = units[units.length - 1];
  if (!u) return;
  if (u.stopAlef) {
    u.v = "a";
    u.long = true;
    u.tan = false;
  } else if (u.marbuta) {
    Object.assign(u, { c: "h", v: "", long: false, tan: false });
  } else if (u.tan) {
    u.tan = false;
    if (u.v === "a") u.long = true;
    else u.v = "";
  } else if (!u.long || u.silah) {
    u.v = "";
    u.long = false;
  }
}

function render(units) {
  let out = "";
  let previousVowel = "";
  units.forEach((u, i) => {
    // Iqlab turns a noon sound into meem.
    const noonToMeem = u.iqlab && !u.tan && u.c === "n";
    const c = noonToMeem ? "m" : u.c;
    const sign = (u.long ? LONG_SIGN : SIGN)[u.v] ?? "";

    if (c === "nasal") {
      out += u.target === "y" ? "ইঁ" : "ওঁ";
    } else if (c === "hamza" || c === "ain") {
      if (u.gem) out += HAMZA_MARK;
      if (u.v) out += (u.long ? LONG_ALONE : ALONE)[u.v];
      else out += HAMZA_MARK;
    } else if (c === "y") {
      const afterI = previousVowel === "i";
      if (u.gem) out += (afterI ? "য়্য" : "ইয়্য") + sign;
      else if (!u.v) out += afterI ? "" : "ই";
      else if (u.v === "u") out += afterI ? "য়" + sign : u.long ? "ইয়ূ" : "ইউ";
      else out += (afterI ? "য়" : "ইয়") + sign;
    } else if (c === "w") {
      const syllable = !u.v ? "ও"
        : u.v === "a" ? "ওয়া"
        : u.v === "i" ? (u.long ? "উঈ" : "উই")
        : u.v === "u" ? (u.long ? "ঊ" : "উ")
        : "ওয়ে";
      out += (u.gem ? "ও" : "") + syllable;
    } else {
      const letter = BANGLA[c];
      if (!letter) throw new Error(`No Bangla letter for ${c}`);
      if (u.gem) out += letter + "্" + (SPLIT_DOUBLE.has(letter) ? "‌" : "") + letter + sign;
      else out += letter + sign;
    }

    if (u.tan) out += u.iqlab ? "ম" : "ন";
    previousVowel = u.tan ? "" : u.v;
    if (u.breakAfter && i < units.length - 1) {
      out += " ";
      previousVowel = "";
    }
  });
  return out;
}

/**
 * @param {string} text Uthmani text of one ayah (without a separated Basmalah)
 * @param {string} [key] "surah:ayah", needed for the disjointed opening letters
 */
export function uccharon(text, key = "") {
  const tokens = text.split(/\s+/).filter(Boolean);
  const words = [];
  let opening = MUQATTAAT[key] ?? "";
  let skipOpening = Boolean(opening);

  for (const token of tokens) {
    const word = token.replace(SIGNS, "");
    const isWord = [...word].some((ch) => LETTERS[ch] || ch === ALEF || ch === WASLA);
    if (!isWord) {
      // A free-standing sign: remember where a comma helps the reader.
      if (COMMA_SIGNS.test(token) && words.length) words[words.length - 1].comma = true;
      continue;
    }
    if (skipOpening) {
      skipOpening = false;
      continue;
    }
    words.push({ ...parseWord(word), source: word, comma: COMMA_SIGNS.test(token) });
  }

  connect(words);
  if (words.length) pauseAt(words[words.length - 1].units);

  // "ওয়াল আরদ" reads better than "ওয়ালআরদ" when the next sound is a vowel.
  for (const word of words) {
    word.units.forEach((u, i) => {
      const next = word.units[i + 1];
      if (u.articleLam && next && (next.c === "hamza" || next.c === "ain")) u.breakAfter = true;
    });
  }

  let out = "";
  words.forEach((word, i) => {
    const rendered = render(word.units);
    if (!rendered) return;
    // No comma inside a joined sound, or the second half would be left hanging.
    const comma = word.comma && i < words.length - 1 && !words[i + 1].joinPrevious;
    out += (out && !word.joinPrevious ? " " : "") + rendered + (comma ? "," : "");
  });

  return [opening, out].filter(Boolean).join(" ");
}

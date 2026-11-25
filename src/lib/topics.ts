/**
 * Topic pages gathered from the two verified sources only: the hadith publisher's own subject
 * groups (shown under the publisher's names) and Quran passages, chosen here by reference
 * as [surah, first ayah, last ayah]. No ruling, step, story or virtue is written by us.
 * The choice of references and groups still awaits a scholar's review.
 * (The step-by-step prayer lessons are our own writing and live apart, in lib/namaz.)
 */
export type Passage = readonly [surah: number, from: number, to: number];

export type Topic = {
  title: string;
  subtitle: string;
  groups: { title: string; categories: number[] }[];
  passages: Passage[];
  /** what a visitor might expect here but will not find yet */
  pending: string[];
};

const topic = (t: Topic) => t;

export const TOPICS = {
  namaz: topic({
    title: "নামাজ শিক্ষা",
    subtitle: "ধাপে ধাপে পাঠ, ভিডিও, হাদিস ও আয়াত",
    groups: [
      { title: "পবিত্রতা", categories: [437, 438, 439] },
      { title: "সালাত", categories: [458, 460, 461, 463, 464, 465, 466, 468, 469] },
      { title: "বিশেষ সালাত", categories: [471, 472, 473, 486, 487, 488, 490] },
      { title: "জানাজা", categories: [492, 493, 495, 496] },
    ],
    passages: [[5, 6, 6], [4, 43, 43], [2, 238, 238], [17, 78, 79], [20, 14, 14], [29, 45, 45]],
    pending: [
      "পাঠগুলোর আলেম যাচাই এবং আরবি উচ্চারণের ক্বারী যাচাই বাকি। দুই ঈদ ও জানাজার ভিডিওরও তাই।",
      "দোয়া কুনুত ও দোয়া মাসুরার যাচাই করা আরবি এখনো যোগ হয়নি।",
      "নিচের হাদিসগুলো থেকে নিজে নিয়ম বের করবেন না; সন্দেহ হলে আলেমের কাছে জেনে নিন।",
    ],
  }),
  afterSalah: topic({
    title: "নামাজের পরের আমল",
    subtitle: "সালাতের যিকিরের হাদিস ও আয়াত",
    groups: [{ title: "হাদিস", categories: [465] }],
    passages: [[4, 103, 103], [50, 39, 40], [33, 41, 42]],
    pending: [
      "পাঁচ ওয়াক্তের পরে কোনটি, কোন ক্রমে, কতবার: এই সাজানো রুটিন আলেম যাচাইয়ের পর যোগ হবে।",
      "“সালাতের যিকিরসমূহ” প্রকাশকের ভাগ। এতে নামাজের ভেতরের যিকিরের হাদিসও আছে, শুধু পরের নয়।",
    ],
  }),
  ramadan: topic({
    title: "রমজান",
    subtitle: "সেহরি-ইফতার, আয়াত ও হাদিস",
    groups: [
      { title: "রোজা", categories: [512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523] },
      { title: "রমজান ও শেষ দশক", categories: [726, 526, 525] },
      { title: "ফিতরা ও ঈদ", categories: [509, 486, 721] },
      { title: "নফল রোজা", categories: [524] },
    ],
    passages: [[2, 183, 187], [97, 1, 5]],
    pending: ["রমজানের দিনভিত্তিক আমল ও ২৭ আমল: উৎস ঠিক হওয়া ও আলেম যাচাই বাকি।"],
  }),
  hajj: topic({
    title: "হজ ও উমরাহ",
    subtitle: "আয়াত ও হাদিস",
    groups: [
      { title: "পরিচিতি ও ফযীলত", categories: [531, 532, 533, 539] },
      { title: "ইহরাম", categories: [536, 537, 538] },
      { title: "পালন", categories: [542, 544, 545, 546, 550, 551, 554] },
      { title: "মসজিদসমূহ", categories: [534, 549] },
    ],
    passages: [[2, 158, 158], [2, 196, 203], [3, 96, 97], [22, 26, 29]],
    pending: ["ধাপে ধাপে হজ ও উমরাহর নির্দেশিকা ও চেকলিস্ট: আলেম যাচাইয়ের পর। হজে যাওয়ার আগে অভিজ্ঞ আলেমের কাছে নিয়ম শিখে নিন।"],
  }),
  prophets: topic({
    title: "নবী ও সাহাবি",
    subtitle: "আয়াত, হাদিস ও নবীদের নামে সূরা",
    groups: [
      { title: "নবী-রাসূল", categories: [80, 81] },
      { title: "নবী সাল্লাল্লাহু আলাইহি ওয়াসাল্লামের জীবনী", categories: [398, 400, 401, 403, 404, 405, 406, 392, 393, 397, 389, 735] },
      { title: "সাহাবি ও আহলে বাইত", categories: [101, 103, 276, 105, 106] },
    ],
    passages: [[6, 83, 86], [21, 107, 107], [33, 21, 21], [33, 40, 40], [68, 4, 4], [9, 100, 100], [48, 18, 18], [48, 29, 29], [59, 8, 9]],
    pending: ["সহজ ভাষায় ধারাবাহিক জীবনী ও ঘটনা: নির্ভরযোগ্য উৎস ও আলেম যাচাই ছাড়া লেখা হবে না।"],
  }),
  zakat: topic({
    title: "যাকাত",
    subtitle: "আয়াত ও হাদিস",
    groups: [{ title: "যাকাতের হাদিস", categories: [500, 503, 504, 505, 506, 509, 510] }],
    passages: [[2, 267, 267], [9, 60, 60], [9, 103, 103]],
    pending: [],
  }),
} as const;

/** Surahs that carry a prophet's name. Only the numbers are listed; names come from the data. */
export const PROPHET_SURAHS = [10, 11, 12, 14, 47, 71] as const;

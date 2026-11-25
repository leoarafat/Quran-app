/**
 * Supplications found in the Quran. Only references are chosen here, as [surah, first ayah, last ayah];
 * every word shown comes from the data. Whole ayahs are shown, never a cut piece of one.
 * No topic, timing or virtue is claimed. The selection itself still awaits a scholar's review.
 *
 * Left out on purpose: 44:12 (said by people facing punishment for disbelief) and 26:86
 * (asks forgiveness for an idolater father, which 60:4 names as the exception not to follow).
 */
export const QURAN_DUAS: readonly (readonly [surah: number, from: number, to: number])[] = [
  [1, 5, 7], [2, 127, 128], [2, 201, 201], [2, 250, 250], [2, 285, 286],
  [3, 8, 8], [3, 16, 16], [3, 38, 38], [3, 53, 53], [3, 147, 147], [3, 191, 194],
  [5, 83, 83], [7, 23, 23], [7, 89, 89], [7, 126, 126], [7, 151, 151],
  [10, 85, 86], [11, 47, 47], [12, 101, 101], [14, 40, 41], [17, 24, 24], [17, 80, 80],
  [18, 10, 10], [19, 4, 6], [20, 25, 28], [20, 114, 114], [21, 83, 83], [21, 87, 87], [21, 89, 89],
  [23, 29, 29], [23, 97, 98], [23, 109, 109], [23, 118, 118], [25, 65, 65], [25, 74, 74],
  [26, 83, 85], [26, 87, 87], [27, 19, 19], [28, 16, 16], [28, 21, 21], [28, 24, 24], [29, 30, 30],
  [37, 100, 100], [40, 7, 8], [46, 15, 15], [59, 10, 10], [60, 4, 5], [66, 8, 8], [66, 11, 11], [71, 28, 28],
  [113, 1, 5], [114, 1, 6],
];

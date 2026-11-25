/**
 * The step-by-step prayer lessons. Unlike the hadith and Quran text, these steps are
 * our own writing (Hanafi, with other common practice noted), added at the owner's
 * direction. They still await a scholar's review (docs/ALEM-REVIEW.md, part চ),
 * and every lesson page says so.
 */
import { masala } from "./lessons/masala";
import { niyom } from "./lessons/niyom";
import { rakat } from "./lessons/rakat";
import { foroj, oju, waqt } from "./lessons/shuru";
import { doa, surah } from "./lessons/surah";
import type { Lesson } from "./types";

/** In the order a beginner should learn them. */
export const LESSONS: readonly Lesson[] = [waqt, oju, foroj, niyom, rakat, surah, doa, masala];
export const lessonPath = (slug: string) => `/namaz/${slug}/`;
export const REVIEW_NOTICE = "এই পাঠের বর্ণনা ও বাংলা উচ্চারণ আমাদের লেখা, মূলত হানাফি পদ্ধতিতে। আলেমের যাচাই এখনো বাকি। কোনো বিষয়ে সন্দেহ হলে নির্ভরযোগ্য আলেমের কাছে জেনে নিন।";

/**
 * The step-by-step prayer lessons. Unlike the hadith and Quran text, these steps are
 * our own writing (Hanafi, with other common practice noted), added at the owner's
 * direction. They still await a scholar's review (docs/ALEM-REVIEW.md, part চ),
 * and every lesson page says so.
 */
import { guruttho, jamat } from "./lessons/jamat";
import { eid, janaza, juma, tarabih } from "./lessons/bishesh";
import { kafonDafon } from "./lessons/kafon";
import { azan, kalema } from "./lessons/kalema-azan";
import { masala } from "./lessons/masala";
import { nari } from "./lessons/nari";
import { biseshNofol, nofol, qaza } from "./lessons/nofol";
import { niyom } from "./lessons/niyom";
import { niyot } from "./lessons/niyot";
import { rakat } from "./lessons/rakat";
import { gosol, oju, pobitrota } from "./lessons/pobitrota";
import { foroj, waqt } from "./lessons/shuru";
import { doa, surah, surahAro } from "./lessons/surah";
import type { Lesson } from "./types";

/** In the order a beginner should learn them. */
export const LESSONS: readonly Lesson[] = [kalema, guruttho, waqt, pobitrota, oju, gosol, azan, foroj, niyot, niyom, nari, rakat, jamat, surah, surahAro, doa, juma, tarabih, eid, janaza, kafonDafon, qaza, nofol, biseshNofol, masala];
/** "নতুন" for a new lesson, "নতুন অংশ" for an older one that gained sections. */
export const lessonBadge = (lesson: Lesson) => (lesson.isNew ? "নতুন" : lesson.sections.some((s) => s.isNew) ? "নতুন অংশ" : undefined);
export const lessonPath = (slug: string) => `/namaz/${slug}/`;
export const REVIEW_NOTICE = "এই পাঠের বর্ণনা ও বাংলা উচ্চারণ আমাদের লেখা, মূলত হানাফি পদ্ধতিতে। আলেমের যাচাই এখনো বাকি। কোনো বিষয়ে সন্দেহ হলে নির্ভরযোগ্য আলেমের কাছে জেনে নিন।";

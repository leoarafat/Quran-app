/**
 * Our own lesson videos. The files live on Cloudflare R2; videos.json is written by
 * video/scripts/publish.py, and the videos themselves are made by the project in video/.
 * Unlike the rest of the app's religious text, the steps in them were written by us and
 * still await a scholar's review, which the player says on screen.
 */
import data from "./videos.json";

export type LessonVideo = {
  id: string;
  /** the hadith group page that shows this video */
  category: number;
  title: string;
  url: string;
  poster: string;
  bytes: number;
  seconds: number;
  chapters: { title: string; at: number }[];
};

export const VIDEOS: LessonVideo[] = data;
export const videoFor = (category: number) => VIDEOS.find((v) => v.category === category);

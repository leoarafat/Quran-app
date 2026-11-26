// What can be done with one ayah, wherever it is shown.
import { showToast } from "@/components/ui/Toast";
import { toBnDigits } from "@/lib/bn";
import { askFolder } from "@/lib/bookmarks/folderPrompt";
import { haptic } from "@/lib/haptic";
import { add, remove, restore } from "@/lib/bookmarks/model";
import { getLibrary, update } from "@/lib/bookmarks/store";

type Where = { surah: number; surahName: string };
type Text = { a: number; ar: string; tr: string; bn: string };

export function ayahText({ surah, surahName }: Where, ayah: Text, credit: string) {
  return `${ayah.ar}\n\nউচ্চারণ: ${ayah.tr}\n\nঅর্থ: ${ayah.bn}\n\nসূরা ${surahName} ${toBnDigits(surah)}:${toBnDigits(ayah.a)}\n${credit}`;
}

/** The message to show. */
export async function copyAyah(where: Where, ayah: Text, credit: string): Promise<string> {
  try {
    await navigator.clipboard.writeText(ayahText(where, ayah, credit));
    return "কপি হয়েছে";
  } catch {
    return "কপি করা যায়নি";
  }
}

/** The message to show, or nothing when the phone's own share panel did the job. */
export async function shareAyahText(where: Where, ayah: Text, credit: string): Promise<string | null> {
  if (!navigator.share) return copyAyah(where, ayah, credit);
  try {
    await navigator.share({ text: ayahText(where, ayah, credit), url: `${location.origin}/quran/${where.surah}/#a${ayah.a}` });
    return null;
  } catch (error) {
    return (error as DOMException).name === "AbortError" ? null : "শেয়ার করা যায়নি";
  }
}

/** Adds the bookmark and asks for its folder, or removes it. A removal can be undone. */
export function toggleAyahBookmark(surah: number, ayah: number) {
  const existing = getLibrary().items.find((b) => b.s === surah && b.a === ayah);
  // A note would be lost with the bookmark, so that is removed only from the bookmarks page.
  if (existing?.note) return showToast("এতে নোট আছে, মুছতে বুকমার্ক পাতায় যান");
  const saved = update((library) => (existing ? remove(library, surah, ayah) : add(library, surah, ayah, Date.now())));
  if (!saved) return showToast("ফোনে সেভ করা যায়নি");
  if (!existing) {
    haptic();
    return askFolder({ surah, ayah });
  }
  showToast("বুকমার্ক সরানো হয়েছে", { label: "ফিরিয়ে আনুন", run: () => update((library) => restore(library, existing)) });
}

"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { addHadith, findHadith, removeHadith } from "@/lib/bookmarks/model";
import { getLibrary, update, useIsHadithBookmarked } from "@/lib/bookmarks/store";

export function HadithBookmarkButton({ id }: { id: number }) {
  const saved = useIsHadithBookmarked(id);
  const [notice, setNotice] = useState("");
  const say = (message: string) => { setNotice(message); setTimeout(() => setNotice(""), 2500); };
  const press = () => {
    const existing = findHadith(getLibrary(), id);
    // A note would be lost with the bookmark, so that is removed only from the bookmarks page.
    if (existing?.note) return say("এতে নোট আছে, মুছতে বুকমার্ক পাতায় যান");
    const stored = update((library) => (existing ? removeHadith(library, id) : addHadith(library, id, Date.now())));
    say(!stored ? "ফোনে সেভ করা যায়নি" : existing ? "বুকমার্ক সরানো হয়েছে" : "বুকমার্ক হয়েছে");
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span role="status" className="min-w-0 text-right text-sm leading-snug text-muted">{notice}</span>
      <button type="button" aria-pressed={saved} aria-label="হাদিস বুকমার্ক" onClick={press} className={`grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-surface ${saved ? "text-accent" : "text-muted"}`}>
        <Bookmark aria-hidden className="size-5" fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

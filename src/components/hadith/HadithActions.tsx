"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";
import { addHadith, changeHadith, findHadith, NOTE_MAX, removeHadith, restoreHadith } from "@/lib/bookmarks/model";
import { getLibrary, update, useLibrary } from "@/lib/bookmarks/store";
import { haptic } from "@/lib/haptic";

function toggle(id: number) {
  const existing = findHadith(getLibrary(), id);
  // A note would be lost with the bookmark, so that is removed only from the bookmarks page.
  if (existing?.note) return showToast("এতে নোট আছে, মুছতে বুকমার্ক পাতায় যান");
  const stored = update((library) => (existing ? removeHadith(library, id) : addHadith(library, id, Date.now())));
  if (!stored) return showToast("ফোনে সেভ করা যায়নি");
  if (!existing) {
    haptic();
    return showToast("বুকমার্ক হয়েছে");
  }
  showToast("বুকমার্ক সরানো হয়েছে", { label: "ফিরিয়ে আনুন", run: () => update((library) => restoreHadith(library, existing)) });
}

function NoteSheet({ id, note, onClose }: { id: number; note: string; onClose: () => void }) {
  const [draft, setDraft] = useState(note);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = update((l) => changeHadith(addHadith(l, id, Date.now()), id, { note: draft.trim() }, Date.now()));
    showToast(stored ? "নোট সেভ হয়েছে" : "ফোনে সেভ করা যায়নি");
    if (stored) onClose();
  };
  return (
    <BottomSheet title="হাদিসে নোট" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <textarea data-autofocus rows={5} maxLength={NOTE_MAX} aria-label="নোট" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="নিজের জন্য কিছু লিখে রাখুন" className="w-full rounded-md border border-ln2 bg-bg p-3 text-base" />
        <p className="text-sm text-ink2">নোট রাখলে হাদিসটি বুকমার্কেও থাকবে।</p>
        <button type="submit" className="h-12 w-full rounded-full bg-ac font-semibold text-on-ac">নোট সেভ করুন</button>
      </form>
    </BottomSheet>
  );
}

/** Bookmark, note, copy and share for one hadith. */
export function HadithActions({ id, text }: { id: number; /** what is copied or shared */ text: string }) {
  const entry = findHadith(useLibrary(), id);
  const [noting, setNoting] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("কপি হয়েছে");
    } catch {
      showToast("কপি করা যায়নি");
    }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ text, url: location.href });
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") showToast("শেয়ার করা যায়নি");
    }
  };

  return (
    <div role="group" aria-label="হাদিসের অপশন" className="grid grid-cols-2 gap-2 xs:grid-cols-4">
      <Chip aria-label="হাদিস বুকমার্ক" aria-pressed={!!entry} className={`!px-2 text-ac ${entry ? "!bg-gs" : ""}`} onClick={() => toggle(id)}><Icon name="bookmark" className="size-5" filled={!!entry} /> বুকমার্ক</Chip>
      <Chip aria-haspopup="dialog" className="!px-2 text-ac" onClick={() => setNoting(true)}><Icon name="note" className="size-5" /> নোট</Chip>
      <Chip className="!px-2 text-ac" onClick={() => void copy()}><Icon name="copy" className="size-5" /> কপি</Chip>
      <Chip className="!px-2 text-ac" onClick={() => void share()}><Icon name="share" className="size-5" /> শেয়ার</Chip>
      {entry?.note && <p className="col-span-full whitespace-pre-wrap break-words rounded-xl bg-gs px-3 py-2 text-sm">{entry.note}</p>}
      {noting && <NoteSheet id={id} note={entry?.note ?? ""} onClose={() => setNoting(false)} />}
    </div>
  );
}

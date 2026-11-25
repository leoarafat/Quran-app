"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { showToast } from "@/components/ui/Toast";
import { toBnDigits } from "@/lib/bn";
import { add, change, NOTE_MAX } from "@/lib/bookmarks/model";
import { getLibrary, update } from "@/lib/bookmarks/store";

/** Writing or changing an ayah's note. A note lives on a bookmark, so one is made if needed. */
export function NoteForm({ surah, ayah, onSaved }: { surah: number; ayah: number; onSaved?: () => void }) {
  const [text, setText] = useState(() => getLibrary().items.find((b) => b.s === surah && b.a === ayah)?.note ?? "");

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const note = text.trim();
    const exists = getLibrary().items.some((b) => b.s === surah && b.a === ayah);
    if (!note && !exists) return showToast("নোট লিখুন");
    const saved = update((library) => change(add(library, surah, ayah, Date.now()), surah, ayah, { note }, Date.now()));
    showToast(!saved ? "ফোনে সেভ করা যায়নি" : note ? "নোট সেভ হয়েছে" : "নোট মুছে ফেলা হয়েছে, বুকমার্ক আছে");
    if (saved) onSaved?.();
  };

  return (
    <form onSubmit={save} className="space-y-2">
      <label className="block text-sm font-semibold">
        আয়াত {toBnDigits(ayah)}-এর নোট
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={NOTE_MAX} rows={4} placeholder="নিজের জন্য কিছু লিখে রাখুন" className="mt-1.5 w-full rounded-md border border-ln2 bg-bg p-3 text-base font-normal" />
      </label>
      <p className="text-[0.8125rem] text-ink2">নোট এই ফোনেই থাকে। সব নোট বুকমার্ক পাতায় পাবেন।</p>
      <button type="submit" className="h-12 w-full rounded-full bg-ac font-semibold text-on-ac">নোট সেভ করুন</button>
    </form>
  );
}

export function NoteSheet({ surah, surahName, ayah, onClose }: { surah: number; surahName: string; ayah: number; onClose: () => void }) {
  return (
    <BottomSheet title={`সূরা ${surahName}`} onClose={onClose}>
      <NoteForm surah={surah} ayah={ayah} onSaved={onClose} />
    </BottomSheet>
  );
}

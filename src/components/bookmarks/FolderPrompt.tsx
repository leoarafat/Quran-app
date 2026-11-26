"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Icon } from "@/components/ui/Icon";
import { showToast } from "@/components/ui/Toast";
import { toBnDigits } from "@/lib/bn";
import { askFolder, useFolderPrompt } from "@/lib/bookmarks/folderPrompt";
import { addFolder, change, find, folderNameError, NAME_MAX, remove, type Library } from "@/lib/bookmarks/model";
import { update, useLibrary } from "@/lib/bookmarks/store";

function Sheet({ surah, ayah, library, onClose }: { surah: number; ayah: number; library: Library; onClose: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const folder = find(library, surah, ayah)?.folder ?? null;
  const options = [{ id: null as string | null, name: "ফোল্ডার ছাড়া" }, ...library.folders];

  const keep = (id: string | null, label: string) => {
    const stored = update((l) => change(l, surah, ayah, { folder: id }, Date.now()));
    onClose();
    showToast(!stored ? "ফোনে সেভ করা যায়নি" : id ? `“${label}” ফোল্ডারে রাখা হলো` : "বুকমার্ক হয়েছে");
  };

  const make = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = folderNameError(library, name);
    if (problem) return setError(problem);
    const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    if (!update((l) => addFolder(l, id, name))) return setError("ফোনে সেভ করা যায়নি");
    keep(id, name.trim());
  };

  return (
    <BottomSheet title="বুকমার্ক হয়েছে" onClose={onClose}>
      <p className="text-sm text-ink2">সূরা {toBnDigits(surah)} · আয়াত {toBnDigits(ayah)}। কোন ফোল্ডারে রাখবেন?</p>
      <ul className="rounded-md border border-ln px-3">
        {options.map((o) => (
          <li key={o.id ?? ""} className="border-b border-ln last:border-0">
            <button type="button" aria-pressed={folder === o.id} onClick={() => keep(o.id, o.name)} className="flex min-h-13 w-full items-center gap-3 text-left">
              <Icon name="bookmark" className="size-5 shrink-0 text-ac" />
              <span className="min-w-0 flex-1 truncate font-medium">{o.name}</span>
              {folder === o.id && <Icon name="check" className="size-5 shrink-0 text-ac" />}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={make} className="space-y-2">
        <div className="flex gap-2">
          <input aria-label="নতুন ফোল্ডারের নাম" maxLength={NAME_MAX} value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="নতুন ফোল্ডার" className="min-h-12 min-w-0 flex-1 rounded-md border border-ln2 bg-bg px-3 text-base" />
          <button type="submit" className="min-h-12 shrink-0 rounded-full bg-ac px-5 font-semibold text-on-ac">বানান</button>
        </div>
        {error && <p role="alert" className="text-sm text-gt">{error}</p>}
      </form>
      <button type="button" onClick={() => { update((l) => remove(l, surah, ayah)); onClose(); showToast("বুকমার্ক সরানো হয়েছে"); }} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-ln2 font-semibold">
        <Icon name="trash" className="size-5" /> বুকমার্ক রাখব না
      </button>
    </BottomSheet>
  );
}

/** Asks for a folder right after an ayah is bookmarked. Closing it keeps the bookmark. */
export function FolderPrompt() {
  const prompt = useFolderPrompt();
  const library = useLibrary();
  const pathname = usePathname();
  useEffect(() => askFolder(null), [pathname]);
  if (!prompt) return null;
  return <Sheet key={`${prompt.surah}:${prompt.ayah}`} {...prompt} library={library} onClose={() => askFolder(null)} />;
}

"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import { BACKUP_KEYS, eraseAll, makeBackup, readBackup, restoreBackup, type Backup } from "@/lib/tools/backup";
import { useInBrowser } from "@/lib/useStored";

const card = "space-y-3 rounded-md border border-ln bg-sf p-4 shadow-card";
const outline = "flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-ac/40 px-4 font-semibold text-ac";
const solid = "flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-ac px-4 font-semibold text-on-ac";

export function DataManager() {
  const [pending, setPending] = useState<Backup | null>(null);
  const [erasing, setErasing] = useState(false);
  const [message, setMessage] = useState("");
  if (!useInBrowser()) return <Skeleton className="h-52 !rounded-2xl" />;
  // What is on this phone now, by name.
  const stored = Object.entries(BACKUP_KEYS).filter(([key]) => {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  });

  const download = () => {
    try {
      const backup = makeBackup(window.localStorage, new Date());
      if (!Object.keys(backup.data).length) return setMessage("ব্যাকআপ করার মতো কিছু এখনো জমা হয়নি।");
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `noor-quran-backup-${backup.made.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("ব্যাকআপ ফাইল তৈরি হয়েছে।");
    } catch {
      setMessage("ব্যাকআপ করা যায়নি।");
    }
  };

  const choose = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const backup = file.size < 5_000_000 ? readBackup(await file.text()) : null;
    setPending(backup);
    setMessage(backup ? "" : "এটি এই অ্যাপের পূর্ণ ব্যাকআপ ফাইল নয়। শুধু বুকমার্কের ফাইল হলে বুকমার্ক পাতা থেকে আনুন।");
  };

  // Reloading makes every part of the app read the new data.
  const apply = (action: () => void) => {
    try {
      action();
      window.location.reload();
    } catch {
      setMessage("ফোনের স্টোরেজে লেখা যায়নি।");
    }
  };

  return (
    <div className="space-y-4">
      <p className="flex gap-3 rounded-md border border-ln bg-sf p-4 shadow-card"><Icon name="lock" className="mt-1 size-5 shrink-0 text-ac" /> <span>আপনার সব ডেটা শুধু এই ফোনের এই ব্রাউজারেই থাকে। অ্যাপ নিজে থেকে কিছু পাঠায় না।</span></p>
      <p role="status" className="rounded-md bg-gs px-4 py-2 empty:hidden">{message}</p>
      <section className={card}>
        <h2 className="font-display font-semibold">যা সংরক্ষিত আছে</h2>
        {stored.length === 0 ? <p className="text-sm text-ink2">এখনো কিছু জমা হয়নি।</p> : (
          <ul className="!mt-1">{stored.map(([key, name]) => <li key={key} className="flex min-h-10 items-center justify-between gap-3 border-b border-ln last:border-0"><span>{name}</span><Icon name="check" className="size-4 text-ac" /></li>)}</ul>
        )}
      </section>
      <section className={card}>
        <h2 className="font-display font-semibold">ব্যাকআপ</h2>
        <p className="text-sm text-ink2">হারানো এড়াতে বা অন্য ফোনে নিতে ফাইল নামিয়ে রাখুন। ফাইলে আপনার নোট ও বেছে নেওয়া জায়গা থাকে, তাই নিরাপদে রাখুন। ডাউনলোড করা অডিও এতে থাকে না।</p>
        <button type="button" className={solid} onClick={download}><Icon name="download" className="size-5" /> ব্যাকআপ ফাইল নামান</button>
        <label className={`${outline} has-focus-visible:outline-2 has-focus-visible:outline-ac`}>
          <Icon name="upload" className="size-5" /> ব্যাকআপ থেকে রিস্টোর
          <input type="file" accept="application/json,.json" aria-label="ব্যাকআপ ফাইল বাছুন" className="sr-only" onChange={(e) => void choose(e.target)} />
        </label>
      </section>
      <section className="space-y-3 rounded-md border border-gt/40 bg-sf p-4">
        <h2 className="font-display font-semibold text-gt">সব ডেটা মুছুন</h2>
        <p className="text-sm text-ink2">এটি ফেরানো যাবে না। আগে ব্যাকআপ নিন।</p>
        <button type="button" aria-haspopup="dialog" className={`${outline} !border-gt/50 !text-gt`} onClick={() => setErasing(true)}><Icon name="trash" className="size-5" /> সব ডেটা মুছতে চাই</button>
      </section>

      {/* The file is shown before anything is changed, and applied only after a yes. */}
      {pending && (
        <BottomSheet title="রিস্টোরের আগে দেখে নিন" onClose={() => setPending(null)}>
          <p className="text-sm text-ink2">{pending.made ? `ফাইল তৈরি ${new Intl.DateTimeFormat("bn-BD", { dateStyle: "long" }).format(new Date(pending.made))}। ` : ""}ফাইলে আছে:</p>
          <ul className="list-disc pl-5">{Object.keys(pending.data).map((k) => <li key={k}>{BACKUP_KEYS[k]}</li>)}</ul>
          <p className="rounded-md bg-gs p-3 text-sm">বুকমার্ক ও নোট এখনকারগুলোর সাথে যোগ হবে। বাকিগুলো ফাইলেরটি দিয়ে বদলে যাবে।</p>
          <button type="button" className={solid} onClick={() => apply(() => restoreBackup(window.localStorage, pending))}>রিস্টোর করুন</button>
          <button type="button" className={outline} onClick={() => setPending(null)}>বাতিল</button>
        </BottomSheet>
      )}
      {erasing && (
        <BottomSheet title="সত্যিই সব মুছবেন?" onClose={() => setErasing(false)}>
          <p role="alert">বুকমার্ক, নোট, খতম, আমলের খাতা ও সব সেটিংস চিরতরে মুছে যাবে। ফেরানো যাবে না।</p>
          <button type="button" className={solid} data-autofocus onClick={() => setErasing(false)}>না, রেখে দিন</button>
          <button type="button" className={`${outline} !border-gt/50 !text-gt`} onClick={() => apply(() => eraseAll(window.localStorage))}>হ্যাঁ, সব মুছুন</button>
        </BottomSheet>
      )}
    </div>
  );
}

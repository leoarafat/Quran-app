"use client";

import { useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { BACKUP_KEYS, eraseAll, makeBackup, readBackup, restoreBackup, type Backup } from "@/lib/tools/backup";
import { useInBrowser } from "@/lib/useStored";

const card = "space-y-3 rounded-[1.375rem] border border-line bg-surface p-4";
const outline = "flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong px-4 font-semibold text-accent";
const solid = "min-h-12 w-full rounded-full border border-brand bg-brand px-4 font-semibold text-on-brand";

export function DataManager() {
  const [pending, setPending] = useState<Backup | null>(null);
  const [erasing, setErasing] = useState(false);
  const [message, setMessage] = useState("");
  if (!useInBrowser()) return <p className="text-muted">আনা হচ্ছে…</p>;

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
      <p role="status" className="rounded-2xl border border-gold px-4 py-2 empty:hidden">{message}</p>
      <section className={card}>
        <h2 className="font-display font-semibold">ব্যাকআপ</h2>
        <p className="text-sm text-muted">আপনার সব ডেটা এই ফোনের এই ব্রাউজারেই থাকে। হারানো এড়াতে বা অন্য ফোনে নিতে ফাইল নামিয়ে রাখুন। ফাইলে আপনার নোট ও বেছে নেওয়া জায়গা থাকে, তাই নিরাপদে রাখুন। ডাউনলোড করা অডিও এতে থাকে না।</p>
        <button type="button" className={outline} onClick={download}><Download aria-hidden className="size-5" /> ব্যাকআপ ফাইল নামান</button>
      </section>
      <section className={card}>
        <h2 className="font-display font-semibold">রিস্টোর</h2>
        <label className={`${outline} has-focus-visible:outline-3 has-focus-visible:outline-accent`}>
          <Upload aria-hidden className="size-5" /> ব্যাকআপ ফাইল বাছুন
          <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => void choose(e.target)} />
        </label>
        {pending && (
          <div className="space-y-2 rounded-2xl border border-gold p-3">
            <p className="font-semibold">ফাইলে আছে:</p>
            <ul className="list-disc pl-5 text-sm">{Object.keys(pending.data).map((k) => <li key={k}>{BACKUP_KEYS[k]}</li>)}</ul>
            <p className="text-sm text-muted">বুকমার্ক ও নোট এখনকারগুলোর সাথে যোগ হবে। বাকিগুলো ফাইলেরটি দিয়ে বদলে যাবে।</p>
            <button type="button" className={solid} onClick={() => apply(() => restoreBackup(window.localStorage, pending))}>রিস্টোর করুন</button>
            <button type="button" className={outline} onClick={() => setPending(null)}>বাতিল</button>
          </div>
        )}
      </section>
      <section className={card}>
        <h2 className="font-display font-semibold">সব ডেটা মুছুন</h2>
        {erasing ? (
          <div className="space-y-2 rounded-2xl border border-gold p-3">
            <p role="alert">বুকমার্ক, নোট, খতম, আমলের খাতা ও সব সেটিংস চিরতরে মুছে যাবে। ফেরানো যাবে না।</p>
            <button type="button" className={solid} onClick={() => apply(() => eraseAll(window.localStorage))}>হ্যাঁ, সব মুছুন</button>
            <button type="button" className={outline} onClick={() => setErasing(false)}>না, রেখে দিন</button>
          </div>
        ) : (
          <button type="button" className={outline} onClick={() => setErasing(true)}><Trash2 aria-hidden className="size-5" /> সব ডেটা মুছতে চাই</button>
        )}
      </section>
    </div>
  );
}

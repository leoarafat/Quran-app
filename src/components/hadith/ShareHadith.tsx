"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function ShareHadith({ text }: { text: string }) {
  const [notice, setNotice] = useState("");
  const say = (message: string) => { setNotice(message); setTimeout(() => setNotice(""), 2500); };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      say("কপি হয়েছে");
    } catch {
      say("কপি করা যায়নি");
    }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ text, url: location.href });
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") say("শেয়ার করা যায়নি");
    }
  };
  const button = "flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-accent";
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" className={button} onClick={copy}>{notice === "কপি হয়েছে" ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />} কপি</button>
      <button type="button" className={button} onClick={share}><Share2 aria-hidden className="size-4" /> শেয়ার</button>
      <span role="status" className="w-full text-center text-sm text-muted empty:hidden">{notice}</span>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { NewBadge } from "@/components/NewBadge";
import audio from "@/lib/arabic/letter-audio.json";

/** Filled only with recordings a person has checked by ear; a letter without one shows nothing. */
const AUDIO: Record<string, { src: string; from: string }> = audio;

export function LetterAudio({ letter, name }: { letter: string; name: string }) {
  const player = useRef<HTMLAudioElement>(null);
  const found = AUDIO[letter];
  if (!found) return null;
  return (
    <div className="mt-3 space-y-1">
      <audio ref={player} src={found.src} preload="none" />
      <button
        type="button"
        aria-label={`${name} হরফের উচ্চারণ শুনুন`}
        onClick={() => { const a = player.current!; a.currentTime = 0; a.play().catch(() => {}); }}
        className="min-h-12 rounded-full border border-ac bg-ac px-6 font-semibold text-on-ac"
      >
        ▶ শুনুন
      </button>
      <NewBadge />
      {/* the licence asks for the author, the source, the licence and a note of changes */}
      <p className="text-[0.75rem] leading-relaxed text-ink2">
        অডিও: <a className="underline" href={found.from}>Ruaa GHAREEB, Wikimedia Commons</a> · <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> · কেটে ও MP3 করে বদলানো, একই লাইসেন্সে
      </p>
    </div>
  );
}

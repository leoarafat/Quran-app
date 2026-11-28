"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Icon } from "@/components/ui/Icon";
import { toggle, usePlayer, useProgress } from "@/lib/audio/player";
import { toBnDigits } from "@/lib/bn";
import { isReaderPath } from "@/lib/nav";
import { isBusy, PlayerControls, PlayIcon, playLabel, reciterName, STATUS_TEXT } from "./PlayerControls";

/** Keeps the screen awake while reciting, where the browser allows it. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const next = await navigator.wakeLock.request("screen");
        if (cancelled) await next.release();
        else lock = next;
      } catch {
        // Low battery or unsupported: recitation still works.
      }
    };
    void request();
    document.addEventListener("visibilitychange", request);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}

function ProgressLine() {
  const progress = useProgress();
  return <span aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] bg-gd" style={{ width: `${progress * 100}%` }} />;
}

export function MiniPlayer() {
  const { track, position, status, reciter, options } = usePlayer();
  const [open, setOpen] = useState(false);
  const reading = isReaderPath(usePathname());
  useWakeLock(isBusy(status));
  if (!track) return null;

  // Above the reader's dock or the tab bar on small screens; clear of the reader's side panes on wide ones.
  const place = reading
    ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:left-[calc(13.75rem+0.75rem)] lg:bottom-5 lg:left-[15.5rem] lg:right-[20rem] reading:left-[32.5rem]"
    : "bottom-[calc(6.25rem+env(safe-area-inset-bottom))] md:bottom-5 md:left-52 lg:left-[15.5rem]";

  return (
    <>
      {/* Reserves room so the floating player never hides the end of a page. */}
      <div aria-hidden="true" className="h-24" />
      <section aria-label="তিলাওয়াত প্লেয়ার" className={`fixed inset-x-3 z-30 mx-auto flex max-w-lg items-center gap-3 overflow-hidden rounded-[1.25rem] border border-ln bg-sf p-2 shadow-float ${place}`}>
        <p role="status" className="sr-only">{status === "error" ? "অডিও চালানো যায়নি" : ""}</p>
        <button type="button" onClick={toggle} aria-label={playLabel(status)} className="grid size-12 shrink-0 place-items-center rounded-[0.875rem] bg-gold text-on-gold"><PlayIcon status={status} className="size-6" /></button>
        <button type="button" aria-haspopup="dialog" aria-label="প্লেয়ার খুলুন" onClick={() => setOpen(true)} className="flex min-h-12 min-w-0 flex-1 items-center gap-2 text-left leading-snug">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{track.surahName} · আয়াত {toBnDigits(position.ayah)}</span>
            <span className={`block truncate text-xs ${status === "error" ? "font-semibold text-gt" : "text-ink2"}`}>
              {status === "playing" ? `${reciterName(reciter)} · ${toBnDigits(options.rate)}×` : status === "error" ? "অডিও আনা যায়নি। আবার চেষ্টা করুন" : `${reciterName(reciter)} · ${STATUS_TEXT[status]}`}
            </span>
          </span>
          <span className="grid size-11 shrink-0 place-items-center"><Icon name="up" /></span>
        </button>
        <ProgressLine />
      </section>
      {open && (
        <BottomSheet title="এখন চলছে" onClose={() => setOpen(false)} full>
          <PlayerControls words onLeave={() => setOpen(false)} />
        </BottomSheet>
      )}
    </>
  );
}

"use client";

import { useEffect } from "react";
import { applyUpdate, startPwa, usePwa } from "@/lib/offline/pwa";

export function PwaManager() {
  const { updateReady } = usePwa();
  useEffect(() => startPwa(), []);
  if (!updateReady) return null;
  return (
    <div role="status" className="fixed inset-x-3.5 top-[calc(0.75rem+env(safe-area-inset-top))] z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full border border-gold bg-raised py-1.5 pl-4 pr-1.5 shadow-lg">
      <span className="text-sm">অ্যাপের নতুন ভার্সন এসেছে</span>
      <button type="button" onClick={applyUpdate} className="min-h-11 rounded-full bg-gold px-4 font-semibold text-on-gold">হালনাগাদ</button>
    </div>
  );
}

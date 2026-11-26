"use client";

import { Icon } from "@/components/ui/Icon";

/** Something on the page broke. Saved data is not touched by this screen. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="flex min-h-[65dvh] flex-col items-center justify-center gap-3 text-center">
      <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-gs text-gt"><Icon name="info" className="size-8" /></span>
      <h1 className="font-display text-xl font-bold">লোড করা যায়নি</h1>
      <p className="text-ink2">সংযোগ ঠিক আছে কিনা দেখে আবার চেষ্টা করুন।</p>
      <button type="button" onClick={reset} className="mt-2 flex h-13 items-center rounded-full border border-ac/40 px-7 font-semibold text-ac">আবার চেষ্টা</button>
    </div>
  );
}

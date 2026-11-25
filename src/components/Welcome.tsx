"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { dismissWelcome } from "@/lib/welcome";

/** Design "খ · ফজর". Its colours are its own and do not follow the app theme. */
export function Welcome() {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (document.documentElement.dataset.welcome === "1") button.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="welcome fixed inset-0 z-50 justify-center overflow-y-auto bg-[#f5f7f3] text-[#10231c]">
      <div className="flex min-h-full w-full max-w-[26rem] flex-col px-5 pb-[calc(2.25rem+env(safe-area-inset-bottom))] pt-[calc(2.25rem+env(safe-area-inset-top))] short:pb-3 short:pt-3">
        <div className="relative h-[max(17rem,min(26.875rem,51dvh))] short:h-[43dvh] shrink-0 overflow-hidden rounded-t-[11rem] rounded-b-[1.75rem] bg-[#0d3b30]">
          <svg aria-hidden="true" viewBox="0 0 350 430" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
            {/* On short screens the sun sits lower so it never rises behind the greeting. */}
            <g className="short:translate-y-[68px]">
              <circle cx="175" cy="315" r="150" fill="#F2B65A" opacity=".10" />
              <circle cx="175" cy="315" r="112" fill="#F2B65A" opacity=".16" />
              <circle cx="175" cy="315" r="74" fill="#F4C375" className="[animation:sunrise_2.2s_cubic-bezier(.2,.7,.2,1)_both]" />
            </g>
            <path d="M0 340C60 312 110 330 160 342C225 357 290 312 350 322V430H0Z" fill="#14503F" />
            <path d="M0 384C80 352 150 394 220 382C270 373 310 360 350 370V430H0Z" fill="#08291F" />
            <g fill="#08291F">
              <rect x="62" y="296" width="9" height="80" /><path d="M58 298q8.5-26 17 0z" />
              <rect x="280" y="276" width="9" height="90" /><path d="M276 278q8.5-26 17 0z" />
              <path d="M92 358v-18c0-20 20-24 26-36c6 12 26 16 26 36v18z" />
            </g>
          </svg>
          <p lang="ar" dir="rtl" className="absolute inset-x-6 top-[17%] text-center font-arabic text-[1.8125rem] leading-[2.05] short:top-[11%] short:text-[1.5rem] short:leading-[1.9] text-[#fbf6ea] [animation:rise_1.2s_.4s_ease-out_both]">
            ٱلسَّلَامُ عَلَيْكُمْ<br />وَرَحْمَةُ ٱللَّهِ وَبَرَكَاتُهُ
          </p>
        </div>

        <div className="mt-8 px-2.5 short:mt-3 [animation:rise_1s_.7s_ease-out_both]">
          <h2 id="welcome-title" className="font-welcome text-[2.375rem] leading-[1.35] short:text-[1.625rem]">আসসালামু <br className="short:hidden" />আলাইকুম</h2>
          <p className="mt-3.5 text-lg leading-[1.75] text-[#3c5249] short:mt-1 short:text-base short:leading-[1.6]">আপনার ওপর শান্তি, রহমত ও বরকত বর্ষিত হোক। নতুন একটি ভোরের মতো, আজ কুরআন দিয়েই শুরু হোক।</p>
        </div>

        <div className="mt-auto flex justify-end px-2.5 pt-6 short:pt-2 [animation:rise_1s_.9s_ease-out_both]">
          <button ref={button} type="button" onClick={dismissWelcome} className="flex h-[3.75rem] items-center gap-[1.125rem] rounded-full bg-[#10231c] pl-7 pr-2.5 text-lg font-semibold text-[#f5f7f3]">
            বিসমিল্লাহ
            <span className="grid size-[2.625rem] place-items-center rounded-full bg-[#f4c375] text-[#10231c]"><ArrowRight aria-hidden className="size-5" strokeWidth={2.4} /></span>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toBnDigits } from "@/lib/bn";
import { headingFrom, qiblaBearing, qiblaDistance, turnNeeded } from "@/lib/tools/qibla";
import { usePlace } from "@/lib/usePlace";
import { useInBrowser } from "@/lib/useStored";
import { Skeleton } from "@/components/ui/Skeleton";
import { PlaceButton } from "./PlaceSheet";

type Status = "off" | "waiting" | "on" | "denied" | "unsupported";
type PermissionedOrientation = { requestPermission?: () => Promise<"granted" | "denied"> };

function useCompass() {
  const [status, setStatus] = useState<Status>("off");
  const [heading, setHeading] = useState<number | null>(null);
  /** how far off the reading may be, in degrees; only iPhones say */
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const listening = status === "waiting" || status === "on";

  useEffect(() => {
    if (!listening) return;
    const handle = (event: Event) => {
      const next = headingFrom(event as DeviceOrientationEvent & { webkitCompassHeading?: number }, window.screen.orientation?.angle ?? 0);
      if (next === null) return;
      setHeading(next);
      const off = (event as Event & { webkitCompassAccuracy?: number }).webkitCompassAccuracy;
      setAccuracy(typeof off === "number" && off >= 0 ? off : null);
      setStatus("on");
    };
    window.addEventListener("deviceorientationabsolute", handle);
    window.addEventListener("deviceorientation", handle);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handle);
      window.removeEventListener("deviceorientation", handle);
    };
  }, [listening]);

  // No usable reading after a few seconds means there is no compass to rely on.
  useEffect(() => {
    if (status !== "waiting") return;
    const timer = setTimeout(() => setStatus("unsupported"), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const start = async () => {
    const api = (typeof DeviceOrientationEvent !== "undefined" ? DeviceOrientationEvent : undefined) as unknown as PermissionedOrientation | undefined;
    if (!api) return setStatus("unsupported");
    // iPhones ask the visitor first, and only in response to a tap.
    if (api.requestPermission) {
      try {
        if ((await api.requestPermission()) !== "granted") return setStatus("denied");
      } catch {
        return setStatus("denied");
      }
    }
    setHeading(null);
    setStatus("waiting");
  };

  return { status, heading, accuracy, start };
}

/** which way a bearing points, in words */
const WINDS = ["উত্তর", "উত্তর-পূর্ব", "পূর্ব", "দক্ষিণ-পূর্ব", "দক্ষিণ", "দক্ষিণ-পশ্চিম", "পশ্চিম", "উত্তর-পশ্চিম"];

function Compass() {
  const place = usePlace();
  const bearing = qiblaBearing(place.lat, place.lng);
  const { status, heading, accuracy, start } = useCompass();
  const live = status === "on" && heading !== null;
  const turn = live ? turnNeeded(heading, bearing) : 0;
  const aligned = live && Math.abs(turn) <= 3;
  const degrees = toBnDigits(Math.round(bearing));
  const distance = Math.round(qiblaDistance(place.lat, place.lng) / 10) * 10;
  const card = "rounded-md border border-ln bg-sf p-3.5 shadow-card";

  return (
    <div className="space-y-4">
      <PlaceButton />
      <div className="relative mx-auto aspect-square w-full max-w-72">
        <svg viewBox="0 0 320 320" role="img" aria-label={`কিবলা উত্তর দিক থেকে ঘড়ির কাঁটার দিকে ${degrees} ডিগ্রি`} className="size-full">
          <circle cx="160" cy="160" r="152" fill="var(--sf)" stroke={aligned ? "var(--ac)" : "var(--ln2)"} strokeWidth={aligned ? 6 : 1.5} />
          <circle cx="160" cy="160" r="122" fill="none" stroke="var(--ln)" />
          {/* the dial turns with the phone */}
          <g transform={`rotate(${live ? -heading : 0} 160 160)`}>
            {Array.from({ length: 72 }, (_, i) => <line key={i} x1="160" y1="10" x2="160" y2={i % 18 === 0 ? 24 : 17} stroke="var(--ink2)" strokeOpacity={i % 18 === 0 ? 1 : 0.45} strokeWidth={i % 18 === 0 ? 2 : 1} transform={`rotate(${i * 5} 160 160)`} />)}
            {/* placed around the dial, but kept upright however it turns */}
            {([["উ", 160, 44], ["পূ", 276, 160], ["দ", 160, 276], ["প", 44, 160]] as const).map(([label, x, y]) => (
              <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700" fill={label === "উ" ? "var(--ac)" : "var(--ink2)"} transform={`rotate(${live ? heading : 0} ${x} ${y})`}>{label}</text>
            ))}
            <g transform={`rotate(${bearing} 160 160)`}>
              <line x1="160" y1="160" x2="160" y2="96" stroke="var(--gd)" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="160" cy="76" r="26" fill="var(--hero)" />
              <g transform="translate(147 64)" fill="none" stroke="var(--hero-accent)" strokeWidth="2"><rect width="26" height="24" rx="2" /><path d="M0 7h26" /></g>
            </g>
          </g>
          <circle cx="160" cy="160" r="7" fill="var(--sf)" stroke="var(--ac)" strokeWidth="4" />
          {live && <path d="M160 0l11 20h-22z" fill="var(--ac)" />}
        </svg>
      </div>

      <div className="text-center">
        <p><b className="text-4xl tabular-nums">{degrees}°</b> <span className="text-ink2">{WINDS[Math.round(bearing / 45) % 8]}</span></p>
        <p className="text-sm text-ink2">{place.name} থেকে কিবলা, প্রকৃত উত্তর থেকে ঘড়ির কাঁটার দিকে</p>
        <p role="status" className="mt-1 min-h-8 font-display text-lg font-semibold text-ac">
          {aligned ? "আপনি এখন কিবলামুখী" : live ? `${turn > 0 ? "ডানে" : "বামে"} ${toBnDigits(Math.round(Math.abs(turn)))}° ঘুরুন` : status === "waiting" ? "কম্পাস চালু হচ্ছে…" : ""}
        </p>
      </div>

      {status !== "on" && status !== "waiting" && (
        <button type="button" onClick={start} className="flex min-h-13 w-full items-center justify-center rounded-full bg-ac font-semibold text-on-ac">{status === "off" ? "কম্পাস চালু করুন" : "আবার চেষ্টা করুন"}</button>
      )}
      {status === "denied" && <p role="alert" className="text-center text-sm text-gt">কম্পাস ব্যবহারের অনুমতি পাওয়া যায়নি। ব্রাউজারের সেটিংসে অনুমতি দিন।</p>}
      {status === "unsupported" && <p role="alert" className="text-center text-sm text-gt">এই ডিভাইসে কম্পাস পাওয়া যায়নি। অন্য কোনো কম্পাসে উত্তর দিক বের করে সেখান থেকে ডান দিকে {degrees}° ঘুরলে কিবলা।</p>}

      <dl className="grid grid-cols-2 gap-3">
        <div className={card}><dt className="text-[0.8125rem] text-ink2">কাবা পর্যন্ত দূরত্ব</dt><dd className="font-semibold">প্রায় {toBnDigits(distance.toLocaleString("en-US"))} কিমি</dd></div>
        <div className={card}><dt className="text-[0.8125rem] text-ink2">সেন্সরের নির্ভুলতা</dt><dd className="font-semibold">{live && accuracy !== null ? `±${toBnDigits(Math.round(accuracy))}°` : live ? "ফোন জানায় না" : "কম্পাস বন্ধ"}</dd></div>
      </dl>
      <p className="rounded-md bg-gs p-4 text-sm leading-relaxed">ফোন সমতল করে ধরুন, চুম্বক, লোহা ও চার্জার থেকে দূরে রাখুন। ফোনের কম্পাস কয়েক ডিগ্রি ভুল দেখাতে পারে। ভুল মনে হলে ফোনটি ইংরেজি 8-এর মতো ঘুরিয়ে নিন, আর স্থানীয় মসজিদের দিকের সাথে মিলিয়ে নিন।</p>
    </div>
  );
}

export function QiblaCompass() {
  return useInBrowser() ? <Compass /> : <Skeleton className="mx-auto aspect-square w-full max-w-72 !rounded-full" />;
}

"use client";

import { useEffect, useState } from "react";
import { toBnDigits } from "@/lib/bn";
import { headingFrom, qiblaBearing, turnNeeded } from "@/lib/tools/qibla";
import { usePlace } from "@/lib/usePlace";
import { useInBrowser } from "@/lib/useStored";
import { PlaceSelect } from "./PlaceSelect";

type Status = "off" | "waiting" | "on" | "denied" | "unsupported";
type PermissionedOrientation = { requestPermission?: () => Promise<"granted" | "denied"> };

function useCompass() {
  const [status, setStatus] = useState<Status>("off");
  const [heading, setHeading] = useState<number | null>(null);
  const listening = status === "waiting" || status === "on";

  useEffect(() => {
    if (!listening) return;
    const handle = (event: Event) => {
      const next = headingFrom(event as DeviceOrientationEvent & { webkitCompassHeading?: number }, window.screen.orientation?.angle ?? 0);
      if (next === null) return;
      setHeading(next);
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

  return { status, heading, start };
}

function Compass() {
  const place = usePlace();
  const bearing = qiblaBearing(place.lat, place.lng);
  const { status, heading, start } = useCompass();
  const live = status === "on" && heading !== null;
  const turn = live ? turnNeeded(heading, bearing) : 0;
  const aligned = live && Math.abs(turn) <= 3;
  const degrees = toBnDigits(Math.round(bearing));

  return (
    <div className="space-y-4">
      <PlaceSelect />
      <div className="relative mx-auto aspect-square w-full max-w-80">
        <svg viewBox="0 0 320 320" role="img" aria-label={`কিবলা উত্তর দিক থেকে ঘড়ির কাঁটার দিকে ${degrees} ডিগ্রি`} className="size-full">
          <circle cx="160" cy="160" r="152" fill="var(--hero)" stroke={aligned ? "var(--hero-accent)" : "var(--gold)"} strokeOpacity={aligned ? 1 : 0.5} strokeWidth={aligned ? 6 : 1.5} />
          {/* the dial turns with the phone */}
          <g transform={`rotate(${live ? -heading : 0} 160 160)`}>
            {Array.from({ length: 72 }, (_, i) => <line key={i} x1="160" y1="18" x2="160" y2={i % 18 === 0 ? 34 : 26} stroke="var(--hero-muted)" strokeWidth={i % 18 === 0 ? 2.5 : 1} transform={`rotate(${i * 5} 160 160)`} />)}
            {/* placed around the dial, but kept upright however it turns */}
            {([["উ", 160, 56], ["পূ", 264, 160], ["দ", 160, 264], ["প", 56, 160]] as const).map(([label, x, y]) => (
              <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="600" fill={label === "উ" ? "var(--hero-accent)" : "var(--on-hero)"} transform={`rotate(${live ? heading : 0} ${x} ${y})`}>{label}</text>
            ))}
            <g transform={`rotate(${bearing} 160 160)`}>
              <line x1="160" y1="160" x2="160" y2="86" stroke="var(--gold)" strokeWidth="5" strokeLinecap="round" />
              <path d="M160 66l11 22h-22z" fill="var(--hero-accent)" />
              <g transform="translate(142 94)"><rect width="36" height="34" rx="3" fill="#0b0b0b" stroke="var(--gold)" /><rect y="9" width="36" height="5" fill="var(--gold)" /></g>
            </g>
          </g>
          <circle cx="160" cy="160" r="9" fill="var(--gold)" />
          {live && <path d="M160 0l10 16h-20z" fill="var(--on-hero)" />}
        </svg>
      </div>

      <div className="text-center">
        <p className="font-display text-2xl font-bold text-accent">{degrees}°</p>
        <p className="text-sm text-muted">{place.name} থেকে কিবলা, প্রকৃত উত্তর থেকে ঘড়ির কাঁটার দিকে</p>
        <p role="status" className="mt-2 min-h-8 font-display text-lg font-semibold">
          {aligned ? "আপনি এখন কিবলামুখী" : live ? `${turn > 0 ? "ডানে" : "বামে"} ${toBnDigits(Math.round(Math.abs(turn)))}° ঘুরুন` : status === "waiting" ? "কম্পাস চালু হচ্ছে…" : ""}
        </p>
      </div>

      {status !== "on" && status !== "waiting" && (
        <button type="button" onClick={start} className="mx-auto block min-h-12 rounded-full bg-gold px-6 font-semibold text-on-gold">{status === "off" ? "কম্পাস চালু করুন" : "আবার চেষ্টা করুন"}</button>
      )}
      {status === "denied" && <p role="alert" className="text-center text-sm text-accent">কম্পাস ব্যবহারের অনুমতি পাওয়া যায়নি। ব্রাউজারের সেটিংসে অনুমতি দিন।</p>}
      {status === "unsupported" && <p role="alert" className="text-center text-sm text-accent">এই ডিভাইসে কম্পাস পাওয়া যায়নি। অন্য কোনো কম্পাসে উত্তর দিক বের করে সেখান থেকে ডান দিকে {degrees}° ঘুরলে কিবলা।</p>}
      <p className="rounded-[1.375rem] border border-dashed border-line-strong p-4 text-sm leading-relaxed text-muted">ফোন সমতল করে ধরুন, চুম্বক, লোহা ও চার্জার থেকে দূরে রাখুন। ফোনের কম্পাস কয়েক ডিগ্রি ভুল দেখাতে পারে। ভুল মনে হলে ফোনটি ইংরেজি 8-এর মতো ঘুরিয়ে নিন, আর স্থানীয় মসজিদের দিকের সাথে মিলিয়ে নিন।</p>
    </div>
  );
}

export function QiblaCompass() {
  return useInBrowser() ? <Compass /> : <p className="text-muted">আনা হচ্ছে…</p>;
}

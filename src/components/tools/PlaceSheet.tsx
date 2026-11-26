"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { CITIES, clockTime, timesFor, calendarDay, PRAYERS, type Place } from "@/lib/prayer";
import { describePrefs } from "@/lib/tools/timetable";
import { usePrayerPrefs } from "@/lib/usePrayerPrefs";
import { useNow } from "@/lib/useNow";
import { savePlace, usePlace } from "@/lib/usePlace";

/** By Bangla name or by the spelling in the id ("sylhet"). */
export const findCities = (query: string): Place[] => {
  const q = query.trim().toLowerCase().normalize("NFC");
  return CITIES.filter((c) => !q || c.name.normalize("NFC").includes(q) || c.id.includes(q));
};

/** Today's times with the ways to change the place: the phone's own location, or a city. */
export function PlaceSheet({ onClose }: { onClose: () => void }) {
  const place = usePlace();
  const prefs = usePrayerPrefs();
  const now = useNow();
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const times = now === null ? null : timesFor(place, calendarDay(new Date(now), place.timeZone), prefs);
  const found = findCities(query);

  const locate = () => {
    if (!navigator.geolocation) return setMessage("এই ব্রাউজারে অবস্থান পাওয়া যায় না।");
    setLocating(true);
    setMessage("অবস্থান খোঁজা হচ্ছে…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        savePlace({ id: "here", name: "আমার অবস্থান", lat: coords.latitude, lng: coords.longitude, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        setLocating(false);
        setMessage("আপনার অবস্থান নেওয়া হয়েছে।");
      },
      () => {
        setLocating(false);
        setMessage("অবস্থান পাওয়া যায়নি। অনুমতি দিন অথবা শহর বেছে নিন।");
      },
      { timeout: 15000 },
    );
  };

  return (
    <BottomSheet title="আজকের নামাজের সময়" onClose={onClose}>
      <dl className="grid grid-cols-3 gap-2 text-center" aria-busy={locating}>
        {[...PRAYERS, ["sunrise", "সূর্যোদয়"] as const].map(([id, name]) => (
          <div key={id} className="rounded-md bg-gs py-2"><dt className="text-sm text-ink2">{name}</dt><dd className="flex min-h-7 justify-center font-semibold tabular-nums">{locating || !times ? <Skeleton className="my-1.5 h-4 w-12" /> : clockTime(times[id], place.timeZone)}</dd></div>
        ))}
      </dl>
      <Chip className="w-full" aria-pressed={place.id === "here"} selected={place.id === "here"} onClick={locate}>
        <Icon name="pin" className="size-5" /> আমার অবস্থান ব্যবহার করুন
      </Chip>
      <p role="status" className="min-h-6 text-sm text-gt">{message}</p>
      <label className="flex min-h-12 items-center gap-2.5 rounded-md border border-ln2 bg-bg px-3 text-ink2 focus-within:border-ac">
        <Icon name="search" className="size-5" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="শহর খুঁজুন" placeholder="শহর খুঁজুন" className="quiet-focus min-w-0 flex-1 self-stretch bg-transparent text-ink" />
      </label>
      <div role="group" aria-label="জায়গা বেছে নিন" className="grid grid-cols-3 gap-2">
        {found.map((c) => <Chip key={c.id} aria-pressed={place.id === c.id} selected={place.id === c.id} onClick={() => { savePlace(c); setMessage(""); }}>{c.name}</Chip>)}
      </div>
      {found.length === 0 && <p className="text-sm text-ink2">তালিকায় এখন আট বিভাগীয় শহর আছে। অন্য জায়গার জন্য “আমার অবস্থান” ব্যবহার করুন।</p>}
      <p className="text-sm text-ink2">ফোনেই হিসাব করা ({describePrefs(prefs)})। সেহরি-ইফতারসহ আমলের আগে স্থানীয় মসজিদ বা ইসলামিক ফাউন্ডেশনের সময়ের সাথে মিলিয়ে নিন। আপনার অবস্থান এই ফোনের বাইরে যায় না।</p>
      {pathname !== "/prayer-times/" && <Link href="/prayer-times/" className="flex min-h-12 items-center justify-center rounded-full border border-ln2 font-semibold text-ac">মাসিক সূচি, হিসাবের নিয়ম ও রিমাইন্ডার</Link>}
    </BottomSheet>
  );
}

/** "ঢাকা ⌄": says which place the times are for and opens the sheet. */
export function PlaceButton({ className = "" }: { className?: string }) {
  const place = usePlace();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-haspopup="dialog" aria-label={`জায়গা: ${place.name}। বদলাতে চাপুন`} onClick={() => setOpen(true)} className={`flex min-h-11 items-center gap-1.5 font-semibold ${className}`}>
        <Icon name="pin" className="size-[1.125rem] text-ac" /> {place.name} <Icon name="chevd" className="size-[1.125rem] text-ink2" />
      </button>
      {open && <PlaceSheet onClose={() => setOpen(false)} />}
    </>
  );
}

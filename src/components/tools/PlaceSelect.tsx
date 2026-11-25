"use client";

import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { CITIES } from "@/lib/prayer";
import { savePlace, usePlace } from "@/lib/usePlace";

export function PlaceSelect() {
  const place = usePlace();
  const [message, setMessage] = useState("");

  const locate = () => {
    if (!navigator.geolocation) return setMessage("এই ব্রাউজারে অবস্থান পাওয়া যায় না।");
    setMessage("অবস্থান খোঁজা হচ্ছে…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        savePlace({ id: "here", name: "আমার অবস্থান", lat: coords.latitude, lng: coords.longitude, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        setMessage("আপনার অবস্থান নেওয়া হয়েছে। এটি এই ফোনের বাইরে যায় না।");
      },
      () => setMessage("অবস্থান পাওয়া যায়নি। অনুমতি দিন অথবা শহর বেছে নিন।"),
      { timeout: 15000 },
    );
  };

  return (
    <div>
      <div className="flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">জায়গা</span>
          <select value={place.id} onChange={(e) => { const city = CITIES.find((c) => c.id === e.target.value); if (city) { savePlace(city); setMessage(""); } }} className="min-h-12 w-full rounded-full border border-line-strong bg-surface px-4">
            {place.id === "here" && <option value="here">আমার অবস্থান</option>}
            {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={locate} className="flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-accent">
          <LocateFixed aria-hidden className="size-5" /> আমার অবস্থান
        </button>
      </div>
      <p role="status" className="mt-1 text-sm text-accent empty:hidden">{message}</p>
    </div>
  );
}

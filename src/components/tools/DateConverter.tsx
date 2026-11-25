"use client";

import { useState } from "react";
import { toAsciiDigits, toBnDigits } from "@/lib/bn";
import { gregorianOf } from "@/lib/tools/convert";
import { HIJRI_MONTHS, hijriOf } from "@/lib/tools/hijri";

const field = "min-h-11 w-full min-w-0 rounded-2xl border border-line-strong bg-bg px-3 text-text";
const full = new Intl.DateTimeFormat("bn-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export function DateConverter({ today, adjust }: { today: Date; adjust: number }) {
  const [civil, setCivil] = useState("");
  const now = hijriOf(today, adjust);
  const [day, setDay] = useState(String(now.day));
  const [month, setMonth] = useState(now.month);
  const [year, setYear] = useState(String(now.year));

  const hijri = /^\d{4}-\d{2}-\d{2}$/.test(civil) && civil >= "1900-01-01" && civil <= "2100-12-31" ? hijriOf(new Date(`${civil}T12:00:00`), adjust) : null;
  const [d, y] = [day, year].map((v) => Number(toAsciiDigits(v.trim())));
  const inRange = y >= 1318 && y <= 1520;
  const back = inRange ? gregorianOf({ year: y, month, day: d }, adjust, today) : null;

  return (
    <section aria-label="তারিখ রূপান্তর" className="space-y-3 rounded-[1.375rem] border border-line bg-surface p-4">
      <h2 className="font-display text-lg font-semibold">তারিখ রূপান্তর</h2>
      <label className="block text-sm text-muted">ইংরেজি তারিখ থেকে হিজরি
        <input type="date" min="1900-01-01" max="2100-12-31" value={civil} onChange={(e) => setCivil(e.target.value)} className={field} />
      </label>
      <p role="status" className="font-semibold text-accent empty:hidden">{hijri && `${toBnDigits(hijri.day)} ${HIJRI_MONTHS[hijri.month - 1]} ${toBnDigits(hijri.year)} হিজরি`}</p>
      <fieldset>
        <legend className="mb-1 text-sm text-muted">হিজরি থেকে ইংরেজি তারিখ</legend>
        <div className="grid grid-cols-[4rem_1fr_5rem] gap-2">
          <input inputMode="numeric" aria-label="হিজরি দিন" value={day} onChange={(e) => setDay(e.target.value)} className={field} />
          <select aria-label="হিজরি মাস" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={field}>
            {HIJRI_MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
          </select>
          <input inputMode="numeric" aria-label="হিজরি সাল" value={year} onChange={(e) => setYear(e.target.value)} className={field} />
        </div>
      </fieldset>
      <p role="status" className="font-semibold text-accent">{back ? full.format(back) : inRange ? "এই মাসে এমন তারিখ নেই।" : "হিজরি সাল ১৩১৮ থেকে ১৫২০-এর মধ্যে লিখুন।"}</p>
      <p className="text-[0.8125rem] text-muted">উম্মুল কুরা হিসাব ও আপনার দিন-সমন্বয় অনুযায়ী আনুমানিক। চাঁদ দেখার সাথে এক-দুই দিন পার্থক্য হতে পারে।</p>
    </section>
  );
}

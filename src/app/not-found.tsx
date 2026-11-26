import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "পাতা পাওয়া যায়নি" };

export default function NotFound() {
  return (
    <div className="flex min-h-[65dvh] flex-col items-center justify-center gap-3 text-center">
      <p aria-hidden="true" lang="ar" dir="rtl" className="font-arabic text-7xl leading-[1.6] text-gd">٤٠٤</p>
      <h1 className="font-display text-2xl font-bold">পাতাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-ink2">লিংকটি ভুল হতে পারে। হোমে ফিরে গিয়ে খুঁজে দেখুন।</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link href="/" className="flex h-13 items-center rounded-full bg-ac px-7 font-semibold text-on-ac">হোমে ফিরুন</Link>
        <Link href="/search/" className="flex h-13 items-center rounded-full border border-ac/40 px-7 font-semibold text-ac">খুঁজুন</Link>
      </div>
    </div>
  );
}

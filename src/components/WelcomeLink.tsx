"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { showWelcome } from "@/lib/welcome";

export function WelcomeLink({ className }: { className: string }) {
  return (
    <Link href="/" onClick={showWelcome} className={className}>
      <Sparkles aria-hidden className="size-6 text-accent" />
      <span className="flex-1 font-semibold">স্বাগতম পাতা দেখুন</span>
    </Link>
  );
}

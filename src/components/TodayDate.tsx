"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function format(): string {
  return new Intl.DateTimeFormat("bn-BD", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

/** The date is only known on the visitor's device, never at build time. */
export function TodayDate({ className }: { className?: string }) {
  const text = useSyncExternalStore(subscribe, format, () => "");
  return <span className={`block min-h-[1.65em] ${className ?? ""}`}>{text}</span>;
}

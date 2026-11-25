"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function format(): string {
  return new Intl.DateTimeFormat("bn-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

/** The date is only known on the visitor's device, never at build time. */
export function TodayDate() {
  const text = useSyncExternalStore(subscribe, format, () => "");
  return <p className="min-h-[1.65em] text-on-hero/85">{text}</p>;
}

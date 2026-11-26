"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./Icon";

const subscribe = (listener: () => void) => {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
};

export const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

/** Shown only while the phone is offline. The words say what still works on this page. */
export function OfflineBanner({ children }: { children: React.ReactNode }) {
  if (useOnline()) return null;
  return (
    <p role="status" className="flex items-center gap-2.5 rounded-xl bg-gs px-3 py-2 text-sm text-gt print:hidden">
      <Icon name="wifioff" className="size-[1.125rem]" /> <span>অফলাইন · {children}</span>
    </p>
  );
}

/** A light tap on phones that support it (iPhone does not). */
export function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(12);
}

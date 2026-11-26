import { describe, expect, it } from "vitest";
import { needsOnboarding, ONBOARDED_KEY } from "@/lib/onboarding";

const store = (data: Record<string, string>) => ({ getItem: (k: string) => data[k] ?? null });

describe("first-run steps", () => {
  it("are for a visitor with nothing saved", () => {
    expect(needsOnboarding(store({}))).toBe(true);
    expect(needsOnboarding(store({ "noor.welcome.v1": "2026-11-26" }))).toBe(true);
  });

  it("are never shown again, nor to someone already using the app", () => {
    expect(needsOnboarding(store({ [ONBOARDED_KEY]: "1" }))).toBe(false);
    for (const key of ["noor.lastRead.v1", "noor.settings.v1", "noor.bookmarks.v1", "noor.khatm.v1"]) expect(needsOnboarding(store({ [key]: "x" }))).toBe(false);
  });
});

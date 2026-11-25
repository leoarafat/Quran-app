import { describe, expect, it } from "vitest";
import { WELCOME_SCRIPT } from "@/components/SettingsBootScript";
import { dayKey } from "@/lib/welcome";

function run(stored: string | null) {
  const root = { dataset: {} as Record<string, string> };
  new Function("localStorage", "document", WELCOME_SCRIPT)({ getItem: () => stored }, { documentElement: root });
  return root.dataset.welcome;
}

describe("daily welcome", () => {
  it("shows on a first visit and on a new day", () => {
    expect(run(null)).toBe("1");
    expect(run("2000-1-1")).toBe("1");
  });
  it("stays away once dismissed today", () => expect(run(dayKey(new Date()))).toBeUndefined());
  it("never blocks the app when storage throws", () => {
    expect(() => new Function("localStorage", "document", WELCOME_SCRIPT)({ getItem: () => { throw new Error(); } }, {})).not.toThrow();
  });
});

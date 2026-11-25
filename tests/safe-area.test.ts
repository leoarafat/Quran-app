import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/** The installed iPhone app is drawn under the status bar, so the top of every screen has to leave room. */
describe("iPhone status bar", () => {
  it("keeps every page and the reader header below it", () => {
    expect(read("src/app/layout.tsx")).toContain("pt-[calc(1.5rem+var(--safe-top))]");
    expect(read("src/app/layout.tsx")).toContain('className="status-bar"');
    // The reader has no padding around it; its own top bar takes the room.
    expect(read("src/app/globals.css")).toContain("#main:has([data-reader]) { max-width: none; padding: 0; }");
    expect(read("src/components/quran/Reader.tsx")).toContain('<header className="sticky top-0 z-20 bg-bg pt-[var(--safe-top)] md:hidden">');
  });
  it("reads the inset in one place only, so it can be tried out on a computer", () => {
    const sources = readdirSync(new URL("../src", import.meta.url), { recursive: true, encoding: "utf8" }).filter((f) => /\.(tsx?|css)$/.test(f));
    const users = sources.filter((f) => read(`src/${f}`).includes("env(safe-area-inset-top"));
    expect(users).toEqual(["app/globals.css"]);
  });
});

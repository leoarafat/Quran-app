import { describe, expect, it } from "vitest";
import { dayArc } from "@/lib/dayArc";
import { greetingFor } from "@/lib/greeting";
import { sectionTitle } from "@/lib/shell";

describe("next prayer curve", () => {
  it("starts and ends at the two prayers and never leaves the curve", () => {
    expect(dayArc(0)).toMatchObject({ x: 8, y: 66 });
    expect(dayArc(1)).toMatchObject({ x: 318, y: 66, done: dayArc(1).whole });
    expect(dayArc(-3)).toEqual(dayArc(0));
    expect(dayArc(9)).toEqual(dayArc(1));
    expect(dayArc(Number.NaN)).toEqual(dayArc(0));
    expect(dayArc(0.5)).toMatchObject({ x: 163, y: 22 });
  });
});

describe("greeting", () => {
  it("follows the hour", () => {
    expect([3, 4, 12, 15, 18, 20].map(greetingFor)).toEqual(["শুভ রাত্রি", "শুভ সকাল", "শুভ দুপুর", "শুভ অপরাহ্ন", "শুভ সন্ধ্যা", "শুভ রাত্রি"]);
  });
});

describe("top bar title", () => {
  const names = ["আল-ফাতিহা", "আল-বাকারা"];
  it("names the surah, and prefers the longest matching address", () => {
    expect(sectionTitle("/", names)).toBe("হোম");
    expect(sectionTitle("/quran/2/", names)).toBe("কুরআন · আল-বাকারা");
    expect(sectionTitle("/quran", names)).toBe("কুরআন");
    expect(sectionTitle("/amal/khatm/", names)).toBe("খতম ও লক্ষ্য");
    expect(sectionTitle("/amal/quran/", names)).toBe("দোয়া");
    expect(sectionTitle("/nowhere/", names)).toBe("নূর কুরআন");
  });
});

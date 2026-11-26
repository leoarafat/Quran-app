import { describe, expect, it } from "vitest";
import { weekFromSaturday } from "@/lib/tools/week";

describe("week from Saturday", () => {
  it("starts on Saturday and ends on Friday", () => {
    // 26 November 2026 is a Thursday.
    const week = weekFromSaturday(new Date(2026, 10, 26, 8));
    expect(week[0]).toBe("2026-11-21");
    expect(week[6]).toBe("2026-11-27");
  });

  it("puts a Saturday first in its own week and a Friday last", () => {
    expect(weekFromSaturday(new Date(2026, 10, 28, 23))[0]).toBe("2026-11-28");
    expect(weekFromSaturday(new Date(2026, 10, 27, 0))[6]).toBe("2026-11-27");
  });
});

import { describe, expect, it } from "vitest";
import { LESSONS } from "@/lib/namaz";
import { STAGES } from "@/lib/namaz/stages";

describe("the five steps of the prayer lessons", () => {
  it("hold every lesson exactly once", () => expect(STAGES.reduce((n, s) => n + s.count, 0)).toBe(LESSONS.length));
});

import { describe, expect, it } from "vitest";
import { qiblaDistance } from "@/lib/tools/qibla";

describe("distance to the Kaaba", () => {
  it("is nothing at the Kaaba and about 5,200 km from Dhaka", () => {
    expect(qiblaDistance(21.4225, 39.8262)).toBeCloseTo(0, 5);
    const dhaka = qiblaDistance(23.8103, 90.4125);
    expect(dhaka).toBeGreaterThan(5100);
    expect(dhaka).toBeLessThan(5300);
  });
});

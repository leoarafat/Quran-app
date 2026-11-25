import { describe, expect, it } from "vitest";
import { pinchScales } from "@/lib/reader/pinch";
import { SCALE_MAX, SCALE_MIN } from "@/lib/settings";

const start = { arScale: 1, bnScale: 1.2 };

describe("pinch to resize text", () => {
  it("grows and shrinks both sizes together, in slider steps", () => {
    expect(pinchScales(start, 1.5)).toEqual({ arScale: 1.5, bnScale: 1.8 });
    expect(pinchScales(start, 0.84)).toEqual({ arScale: 0.8, bnScale: 1 });
  });
  it("never leaves the allowed sizes", () => {
    expect(pinchScales(start, 50)).toEqual({ arScale: SCALE_MAX, bnScale: SCALE_MAX });
    expect(pinchScales(start, 0.01)).toEqual({ arScale: SCALE_MIN, bnScale: SCALE_MIN });
  });
  it("ignores a small tremble", () => expect(pinchScales(start, 1.02)).toEqual(start));
  it("gives the first sizes back when the fingers come back", () => {
    pinchScales(start, 3);
    expect(pinchScales(start, 1)).toEqual(start);
  });
  it.each([0, -1, Number.NaN, Infinity])("keeps the sizes for a meaningless ratio %s", (ratio) => expect(pinchScales(start, ratio)).toEqual(start));
});

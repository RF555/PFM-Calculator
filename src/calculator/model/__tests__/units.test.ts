import { describe, expect, it } from "vitest";
import { formatAsFraction, inchToMm, kgToLbs, mmToInch } from "../units";

describe("unit conversion", () => {
  it.each([50, 100, 3.2, 0.5, 1234.5678])(
    "round-trips %f mm without drift", (mm) => {
      expect(inchToMm(mmToInch(mm))).toBeCloseTo(mm, 12);
    });

  it("survives 100 round trips at full precision", () => {
    let v = 50;
    for (let i = 0; i < 100; i++) v = inchToMm(mmToInch(v));
    expect(v).toBeCloseTo(50, 12);
  });

  it("converts kg to lbs", () => {
    expect(kgToLbs(1)).toBeCloseTo(2.20462, 5);
  });
});

describe("formatAsFraction", () => {
  it.each([
    [0.5, "1/2"],
    [0.375, "3/8"],
    [0.0625, "1/16"],
    [0.75, "3/4"],
    [1.5, "1 1/2"],
    [1, "1"],
  ])("renders %f as %s when exact", (inch, expected) => {
    expect(formatAsFraction(inch)).toBe(expected);
  });

  it.each([
    1.968503937,  // 50 mm
    3.937007874,  // 100 mm
  ])("returns null for %f, which is not an exact binary fraction", (inch) => {
    expect(formatAsFraction(inch)).toBeNull();
  });
});

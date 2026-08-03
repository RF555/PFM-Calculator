import { describe, expect, it } from "vitest";
import { calculateVolume } from "@/utils/calculations";

/**
 * Documents the symmetric-decrease hazard. These inputs are physically
 * impossible; the formulas nonetheless return plausible positive numbers.
 * Task 7 moves enforcement into the shape registry.
 */
describe("impossible geometry produces misleading results", () => {
  it("square hollow: wall above half the side mirrors a valid wall", () => {
    const valid = calculateVolume(
      "squareHollow", { side: 50, wallThickness: 20, length: 1000 }, "mm");
    const impossible = calculateVolume(
      "squareHollow", { side: 50, wallThickness: 30, length: 1000 }, "mm");
    expect(impossible).toBeCloseTo(valid, 12);
  });

  it("round tube: wall above half the OD yields a negative volume", () => {
    const v = calculateVolume(
      "roundTubeOuter", { outerDiameter: 20, wallThickness: 25, length: 1000 }, "mm");
    expect(v).toBeLessThan(0);
  });

  it("angle: thickness at or above the leg stops increasing", () => {
    const atLeg = calculateVolume(
      "angle", { leg: 50, thickness: 50, length: 1000 }, "mm");
    const overLeg = calculateVolume(
      "angle", { leg: 50, thickness: 60, length: 1000 }, "mm");
    expect(overLeg).toBeLessThan(atLeg);
  });

  it("round tube by inner diameter has no upper wall bound", () => {
    const thick = calculateVolume(
      "roundTubeInner", { innerDiameter: 20, wallThickness: 50, length: 1000 }, "mm");
    expect(thick).toBeGreaterThan(0);
  });
});

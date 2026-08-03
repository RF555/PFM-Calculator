import { describe, expect, it } from "vitest";
import { formatNumber } from "../format";

describe("formatNumber", () => {
  it.each([
    [1234.1234567, "1234.1235"],
    [98765.4321, "98765.4321"],
    [15.414, "15.414"],
    [15.4, "15.40"],
    [1000, "1000.00"],
    [2.5, "2.50"],
    [0.246615, "0.2466"],
    [0.010603, "0.0106"],
    [0.0000453, "0.0000453"],
    [0.5, "0.50"],
    [0, "0.00"],
  ])("formats %f as %s", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });

  it("never renders 0.00 for a real non-zero mass", () => {
    for (let e = -9; e <= 6; e++) {
      for (const m of [1, 1.5, 3.7, 9.9]) {
        const v = m * Math.pow(10, e);
        expect(formatNumber(v)).not.toBe("0.00");
      }
    }
  });

  it("returns an em dash for non-finite input", () => {
    expect(formatNumber(NaN)).toBe("—");
    expect(formatNumber(Infinity)).toBe("—");
  });
});

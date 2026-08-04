import { describe, expect, it } from "vitest";
import { parseDimension } from "../parse";

describe("parseDimension", () => {
  it.each([
    ["50", 50],
    ["50.5", 50.5],
    [".5", 0.5],
    ["1/2", 0.5],
    ["3/8", 0.375],
    ["1 1/2", 1.5],
    ["1-1/2", 1.5],
    ['5/8"', 0.625],
    ["1,5", 1.5],      // European decimal comma
    ["  50  ", 50],
  ])("parses %s to %f", (raw, expected) => {
    const r = parseDimension(raw);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(expected, 10);
  });

  it.each([
    ["abc", "error.notANumber"],
    ["50mm", "error.notANumber"],
    ["1/0", "error.notANumber"],
    ["-10", "error.notPositive"],
    ["0", "error.notPositive"],
  ])("rejects %s", (raw, errorKey) => {
    const r = parseDimension(raw);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errorKey).toBe(errorKey);
  });

  // A stray minus must not be absorbed by the mixed-fraction separator.
  // Returning a plausible positive number for malformed input is the exact
  // hazard this parser replaces.
  it.each(["1 -1/2", "1- 1/2", "1  -  1/2", "1---1/2", "-1 1/2"])(
    "rejects %s rather than silently dropping the minus",
    (raw) => {
      expect(parseDimension(raw).ok).toBe(false);
    }
  );

  it("treats empty input as not-yet-entered, not an error", () => {
    expect(parseDimension("")).toEqual({ ok: false, errorKey: "" });
  });
});

describe("parseDimension error keys", () => {
  it("rejects non-numeric input with a key", () => {
    const result = parseDimension("abc");
    expect(result.ok).toBe(false);
    expect("errorKey" in result && result.errorKey).toBe("error.notANumber");
  });

  it("rejects zero and negatives with a key", () => {
    for (const input of ["0", "-5"]) {
      const result = parseDimension(input);
      expect(result.ok).toBe(false);
      expect("errorKey" in result && result.errorKey).toBe("error.notPositive");
    }
  });

  it("reports empty input with no error key", () => {
    const result = parseDimension("");
    expect(result.ok).toBe(false);
    expect("errorKey" in result && result.errorKey).toBe("");
  });
});

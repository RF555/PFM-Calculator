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
    ["abc", "Enter a number"],
    ["50mm", "Enter a number"],
    ["1/0", "Enter a number"],
    ["-10", "Must be greater than zero"],
    ["0", "Must be greater than zero"],
  ])("rejects %s", (raw, error) => {
    const r = parseDimension(raw);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(error);
  });

  it("treats empty input as not-yet-entered, not an error", () => {
    expect(parseDimension("")).toEqual({ ok: false, error: "" });
  });
});

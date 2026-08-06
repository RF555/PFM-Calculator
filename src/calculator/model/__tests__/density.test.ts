import { describe, expect, it } from "vitest";
import { MAX_DENSITY, MIN_DENSITY, parseDensity } from "../density";

describe("parseDensity", () => {
  it("accepts plain decimals", () => {
    expect(parseDensity("7930")).toEqual({ ok: true, value: 7930 });
    expect(parseDensity("7930.5")).toEqual({ ok: true, value: 7930.5 });
    expect(parseDensity("2700")).toEqual({ ok: true, value: 2700 });
  });

  it("treats a comma as a decimal separator, as parseDimension does", () => {
    expect(parseDensity("7930,5")).toEqual({ ok: true, value: 7930.5 });
  });

  it("trims surrounding whitespace", () => {
    expect(parseDensity("  7930  ")).toEqual({ ok: true, value: 7930 });
  });

  it("reports an empty field with a blank key, so no error shows while typing", () => {
    expect(parseDensity("")).toEqual({ ok: false, errorKey: "" });
    expect(parseDensity("   ")).toEqual({ ok: false, errorKey: "" });
  });

  it("rejects non-numeric input", () => {
    expect(parseDensity("abc")).toEqual({ ok: false, errorKey: "error.notANumber" });
    expect(parseDensity("79a30")).toEqual({ ok: false, errorKey: "error.notANumber" });
  });

  // Density is not an imperial measure. Silently reading "1 1/2" as 1.5 kg/m3
  // would be a wrong-unit trap, so fraction syntax is rejected outright.
  it("rejects imperial fraction syntax", () => {
    expect(parseDensity("1 1/2")).toEqual({ ok: false, errorKey: "error.notANumber" });
    expect(parseDensity("1/2")).toEqual({ ok: false, errorKey: "error.notANumber" });
    expect(parseDensity("1-1/2")).toEqual({ ok: false, errorKey: "error.notANumber" });
  });

  // Quote marks denote inches and are meaningless for density, so unlike
  // parseDimension they are not stripped.
  it("rejects inch marks rather than stripping them", () => {
    expect(parseDensity('7930"')).toEqual({ ok: false, errorKey: "error.notANumber" });
  });

  it("rejects zero and negatives", () => {
    expect(parseDensity("0")).toEqual({ ok: false, errorKey: "error.densityRange" });
    expect(parseDensity("-5")).toEqual({ ok: false, errorKey: "error.densityRange" });
  });

  it("accepts the exact bounds", () => {
    expect(parseDensity(String(MIN_DENSITY))).toEqual({ ok: true, value: 1 });
    expect(parseDensity(String(MAX_DENSITY))).toEqual({ ok: true, value: 25_000 });
  });

  it("rejects just outside the bounds", () => {
    expect(parseDensity("0.9")).toEqual({ ok: false, errorKey: "error.densityRange" });
    expect(parseDensity("25000.1")).toEqual({ ok: false, errorKey: "error.densityRange" });
  });
});

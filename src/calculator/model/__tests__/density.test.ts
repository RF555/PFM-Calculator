import { describe, expect, it } from "vitest";
import {
  MAX_DENSITY_DISPLAY,
  MIN_DENSITY_DISPLAY,
  gPerCm3,
  kgPerM3,
  parseDensity,
} from "../density";

describe("parseDensity", () => {
  // Input is g/cm³, the unit shown in the field; the result is canonical
  // kg/m³, which is what state and the weight formula consume.
  it("accepts plain decimals and returns canonical kg/m³", () => {
    expect(parseDensity("7.93")).toEqual({ ok: true, value: 7930 });
    expect(parseDensity("7.9305")).toEqual({ ok: true, value: 7930.5 });
    expect(parseDensity("2.7")).toEqual({ ok: true, value: 2700 });
  });

  it("treats a comma as a decimal separator, as parseDimension does", () => {
    expect(parseDensity("7,93")).toEqual({ ok: true, value: 7930 });
  });

  it("trims surrounding whitespace", () => {
    expect(parseDensity("  7.93  ")).toEqual({ ok: true, value: 7930 });
  });

  it("reports an empty field with a blank key, so no error shows while typing", () => {
    expect(parseDensity("")).toEqual({ ok: false, errorKey: "" });
    expect(parseDensity("   ")).toEqual({ ok: false, errorKey: "" });
  });

  it("rejects non-numeric input", () => {
    expect(parseDensity("abc")).toEqual({ ok: false, errorKey: "error.notANumber" });
    expect(parseDensity("7a93")).toEqual({ ok: false, errorKey: "error.notANumber" });
  });

  // Density is not an imperial measure. Silently reading "1 1/2" as 1.5 g/cm3
  // would be a wrong-unit trap, so fraction syntax is rejected outright.
  it("rejects imperial fraction syntax", () => {
    expect(parseDensity("1 1/2")).toEqual({ ok: false, errorKey: "error.notANumber" });
    expect(parseDensity("1/2")).toEqual({ ok: false, errorKey: "error.notANumber" });
    expect(parseDensity("1-1/2")).toEqual({ ok: false, errorKey: "error.notANumber" });
  });

  // Quote marks denote inches and are meaningless for density, so unlike
  // parseDimension they are not stripped.
  it("rejects inch marks rather than stripping them", () => {
    expect(parseDensity('7.93"')).toEqual({ ok: false, errorKey: "error.notANumber" });
  });

  it("rejects zero and negatives", () => {
    expect(parseDensity("0")).toEqual({ ok: false, errorKey: "error.densityRange" });
    expect(parseDensity("-5")).toEqual({ ok: false, errorKey: "error.densityRange" });
  });

  // The bounds the field advertises are the display bounds, so entering one
  // verbatim must be accepted rather than falling foul of the canonical check.
  it("accepts the exact bounds as displayed", () => {
    expect(parseDensity(String(MIN_DENSITY_DISPLAY))).toEqual({ ok: true, value: 1 });
    expect(parseDensity(String(MAX_DENSITY_DISPLAY))).toEqual({ ok: true, value: 25_000 });
  });

  it("rejects just outside the bounds", () => {
    expect(parseDensity("0.0009")).toEqual({ ok: false, errorKey: "error.densityRange" });
    expect(parseDensity("25.1")).toEqual({ ok: false, errorKey: "error.densityRange" });
  });
});

describe("density unit conversion", () => {
  it("converts canonical kg/m³ to the displayed g/cm³", () => {
    expect(gPerCm3(7930)).toBe(7.93);
    expect(gPerCm3(2700)).toBe(2.7);
  });

  it("round-trips a parsed entry back to what the user typed", () => {
    const parsed = parseDensity("7.93");
    expect(parsed.ok && gPerCm3(parsed.value)).toBe(7.93);
    expect(kgPerM3(gPerCm3(7930))).toBe(7930);
  });
});

import type { ParseResult } from "./parse";

/**
 * Plausible range for a solid material in kg/m³, from expanded foam at the
 * low end to tungsten alloys at the high end. Shared by the materials-file
 * validator and the manual override field so the two cannot drift apart.
 */
export const MIN_DENSITY = 1;
export const MAX_DENSITY = 25_000;

const EMPTY: ParseResult = { ok: false, errorKey: "" };
const NOT_A_NUMBER: ParseResult = { ok: false, errorKey: "error.notANumber" };
const OUT_OF_RANGE: ParseResult = { ok: false, errorKey: "error.densityRange" };

/**
 * Parses a density entered in kg/m³. Unlike parseDimension this takes no
 * fraction syntax and strips no inch marks: density is never an imperial
 * measure, so accepting either would silently produce a wrong figure.
 */
export function parseDensity(raw: string): ParseResult {
  const s = raw.trim().replace(",", ".");
  if (s === "") return EMPTY;

  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NOT_A_NUMBER;

  const n = Number(s);
  if (!Number.isFinite(n)) return NOT_A_NUMBER;
  if (n < MIN_DENSITY || n > MAX_DENSITY) return OUT_OF_RANGE;

  return { ok: true, value: n };
}

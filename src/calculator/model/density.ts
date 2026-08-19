import type { ParseResult } from "./parse";

/**
 * Plausible range for a solid material in kg/m³, from expanded foam at the
 * low end to tungsten alloys at the high end. Shared by the materials-file
 * validator and the manual override field so the two cannot drift apart.
 */
export const MIN_DENSITY = 1;
export const MAX_DENSITY = 25_000;

/**
 * Densities are stored and calculated in kg/m³ but shown to the user in
 * g/cm³, the unit material datasheets use (steel reads 7.7, not 7700).
 * The factor is exact: 1 g/cm³ = 1000 kg/m³.
 */
const KG_PER_M3_PER_G_PER_CM3 = 1000;

export const gPerCm3 = (kgPerM3: number): number =>
  kgPerM3 / KG_PER_M3_PER_G_PER_CM3;

export const kgPerM3 = (gramsPerCm3: number): number =>
  gramsPerCm3 * KG_PER_M3_PER_G_PER_CM3;

/**
 * The storage bounds expressed in the unit the user actually types, so the
 * range error quotes the same numbers the field accepts (0.001–25 g/cm³).
 */
export const MIN_DENSITY_DISPLAY = gPerCm3(MIN_DENSITY);
export const MAX_DENSITY_DISPLAY = gPerCm3(MAX_DENSITY);

const EMPTY: ParseResult = { ok: false, errorKey: "" };
const NOT_A_NUMBER: ParseResult = { ok: false, errorKey: "error.notANumber" };
const OUT_OF_RANGE: ParseResult = { ok: false, errorKey: "error.densityRange" };

/**
 * Parses a density entered in g/cm³ and returns canonical kg/m³. Unlike
 * parseDimension this takes no fraction syntax and strips no inch marks:
 * density is never an imperial measure, so accepting either would silently
 * produce a wrong figure.
 */
export function parseDensity(raw: string): ParseResult {
  const s = raw.trim().replace(",", ".");
  if (s === "") return EMPTY;

  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NOT_A_NUMBER;

  const n = Number(s);
  if (!Number.isFinite(n)) return NOT_A_NUMBER;

  // Range-checked in canonical units so the bound is the single stored
  // constant, not a separately rounded display figure.
  const canonical = kgPerM3(n);
  if (canonical < MIN_DENSITY || canonical > MAX_DENSITY) return OUT_OF_RANGE;

  return { ok: true, value: canonical };
}

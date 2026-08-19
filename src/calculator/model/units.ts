const MM_PER_INCH = 25.4;
const LBS_PER_KG = 2.20462;
const MAX_DENOMINATOR = 64;
const EXACT_TOLERANCE = 1e-9;

export const mmToInch = (mm: number): number => mm / MM_PER_INCH;
export const inchToMm = (inch: number): number => inch * MM_PER_INCH;
export const kgToLbs = (kg: number): number => kg * LBS_PER_KG;

/** Decimals kept when rounding a dimension for display. */
const DIMENSION_DECIMALS = 4;

/**
 * Renders a dimension the way the user would type it: no forced decimals, so
 * a bound of 25 reads "25" rather than "25.00". Distinct from formatNumber,
 * which pads masses and volumes to two decimals — a length is not money, and
 * padding makes a round figure look like a measured one.
 *
 * Rounded rather than truncated, and trailing zeros dropped, so a converted
 * value such as 0.9842519685 inch prints as 0.9843 instead of its full float
 * tail.
 */
export function formatDimension(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return String(Number(value.toFixed(DIMENSION_DECIMALS)));
}

/**
 * Renders an inch value as a shop fraction (binary denominators to 1/64).
 * Returns null when the value is not exactly representable, so an
 * approximation is never shown as though it were exact — metric stock
 * rarely lands on a binary fraction.
 */
export function formatAsFraction(inch: number): string | null {
  const whole = Math.floor(inch);
  const frac = inch - whole;

  if (frac < EXACT_TOLERANCE) return String(whole);

  for (let d = 2; d <= MAX_DENOMINATOR; d *= 2) {
    const n = Math.round(frac * d);
    if (n === 0 || n === d) continue;
    if (Math.abs(frac - n / d) < EXACT_TOLERANCE) {
      const g = gcd(n, d);
      const num = n / g;
      const den = d / g;
      return whole > 0 ? `${whole} ${num}/${den}` : `${num}/${den}`;
    }
  }
  return null;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

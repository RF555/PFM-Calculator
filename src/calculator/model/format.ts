const MAX_DECIMALS = 4;
const SIG_FIGS = 4;

/**
 * Display precision for masses and volumes.
 *
 * At or above 1: 2 to 4 decimals (trailing zeros trimmed past the second).
 * Below 1: enough decimals for ~4 significant figures, so small parts never
 * collapse to "0.00". Never switches unit — grams are not used.
 *
 * The integer part is grouped in thousands ("1,177,500.00") so long totals stay
 * scannable. Hebrew and English both group by three with a comma, so the
 * separator is a constant rather than locale-derived — output stays identical
 * whatever locale the host page runs under. Adding a language that groups
 * differently (or uses "." as the separator) means revisiting this.
 */
export function formatNumber(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0.00";

  const abs = Math.abs(v);

  if (abs >= 1) {
    return group(v.toFixed(MAX_DECIMALS).replace(/(\.\d{2}\d*?)0+$/, "$1"));
  }

  const leadingZeros = Math.floor(-Math.log10(abs));
  const decimals = Math.min(leadingZeros + SIG_FIGS, 12);
  return v.toFixed(decimals).replace(/(\.\d{2}\d*?)0+$/, "$1");
}

/** Insert thousands separators into the integer part, leaving decimals alone. */
function group(s: string): string {
  const [int, frac] = s.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

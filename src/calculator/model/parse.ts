export type ParseResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

const EMPTY: ParseResult = { ok: false, error: "" };
const NOT_A_NUMBER: ParseResult = { ok: false, error: "Enter a number" };
const NOT_POSITIVE: ParseResult = { ok: false, error: "Must be greater than zero" };

// Separator is either whitespace or a single hyphen — not a run of both.
// A looser class such as [\s-]+ absorbs a stray minus, so "1 -1/2" would
// parse to 1.5 rather than being rejected.
const MIXED = /^(\d+)(?:\s+|-)(\d+)\/(\d+)$/;
const FRACTION = /^(\d+)\/(\d+)$/;

/**
 * Parses a dimension entered as decimal or imperial fraction.
 * Accepts: 50, 50.5, .5, 1/2, 1 1/2, 1-1/2, 5/8", 1,5
 */
export function parseDimension(raw: string): ParseResult {
  const s = raw.trim().replace(/["']/g, "").replace(",", ".");
  if (s === "") return EMPTY;

  const mixed = s.match(MIXED);
  if (mixed) {
    const denom = Number(mixed[3]);
    if (denom === 0) return NOT_A_NUMBER;
    return positive(Number(mixed[1]) + Number(mixed[2]) / denom);
  }

  const frac = s.match(FRACTION);
  if (frac) {
    const denom = Number(frac[2]);
    if (denom === 0) return NOT_A_NUMBER;
    return positive(Number(frac[1]) / denom);
  }

  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return NOT_A_NUMBER;
  const n = Number(s);
  if (!Number.isFinite(n)) return NOT_A_NUMBER;
  return positive(n);
}

function positive(n: number): ParseResult {
  return n > 0 ? { ok: true, value: n } : NOT_POSITIVE;
}

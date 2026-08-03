import { LiveRegion } from "../atoms/LiveRegion";
import { ResultStat } from "../atoms/ResultStat";
import { formatNumber } from "../model/format";
import type { MassUnit } from "../model/types";
import { kgToLbs } from "../model/units";
import "./ResultPanel.css";

export interface ResultValues {
  /** Mass of a single piece, full precision. */
  unitKg: number;
  volumeCm3: number;
}

interface Props {
  result: ResultValues | null;
  quantity: number;
  massUnit: MassUnit;
  onCopy?: (text: string) => void;
}

const PLACEHOLDER = "—";

export function ResultPanel({ result, quantity, massUnit, onCopy }: Props) {
  // Totals derive from full-precision unit mass; multiplying a rounded
  // display value drifts measurably at large quantities.
  const totalKg = result ? result.unitKg * quantity : null;

  const pair = (kg: number | null) => {
    if (kg === null) return { primary: PLACEHOLDER, secondary: undefined };
    const kgText = `${formatNumber(kg)} kg`;
    const lbsText = `${formatNumber(kgToLbs(kg))} lbs`;
    return massUnit === "kg"
      ? { primary: kgText, secondary: lbsText }
      : { primary: lbsText, secondary: kgText };
  };

  const total = pair(totalKg);
  const unit = pair(result?.unitKg ?? null);

  const announcement = result
    ? quantity > 1
      ? `Unit ${spoken(result.unitKg, massUnit)}. Total for ${quantity} pieces, ${spoken(totalKg!, massUnit)}.`
      : `${spoken(totalKg!, massUnit)}.`
    : "";

  const copyText = result
    ? [
        `Volume: ${formatNumber(result.volumeCm3)} cm³`,
        `Unit weight: ${formatNumber(result.unitKg)} kg (${formatNumber(kgToLbs(result.unitKg))} lbs)`,
        `Quantity: ${quantity}`,
        `Total weight: ${formatNumber(totalKg!)} kg (${formatNumber(kgToLbs(totalKg!))} lbs)`,
      ].join("\n")
    : "";

  return (
    <section className="pfm-results" aria-label="Results">
      <div className="pfm-results__grid">
        <ResultStat
          label="Volume"
          primary={result ? `${formatNumber(result.volumeCm3)} cm³` : PLACEHOLDER}
        />
        {quantity > 1 && (
          <div data-testid="unit-stat">
            <ResultStatWithTestIds prefix="unit" label="Unit weight" {...unit} />
          </div>
        )}
        <ResultStatWithTestIds
          prefix="total"
          label={quantity > 1 ? `Total (× ${quantity})` : "Weight"}
          emphasis
          {...total}
        />
      </div>

      {result && onCopy && (
        <button
          type="button"
          className="pfm-results__copy"
          onClick={() => onCopy(copyText)}
        >
          Copy
        </button>
      )}

      <LiveRegion message={announcement} />
    </section>
  );
}

function ResultStatWithTestIds({
  prefix, label, primary, secondary, emphasis,
}: {
  prefix: string;
  label: string;
  primary: string;
  secondary?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="pfm-stat-wrap">
      <span className="pfm-stat__label">{label}</span>
      <span
        className={emphasis ? "pfm-stat__primary pfm-stat__primary--lg" : "pfm-stat__primary"}
        data-testid={`${prefix}-primary`}
      >
        {primary}
      </span>
      {secondary && (
        <span className="pfm-stat__secondary" data-testid={`${prefix}-secondary`}>
          {secondary}
        </span>
      )}
    </div>
  );
}

function spoken(kg: number, massUnit: MassUnit): string {
  return massUnit === "kg"
    ? `${formatNumber(kg)} kilograms`
    : `${formatNumber(kgToLbs(kg))} pounds`;
}

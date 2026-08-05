import { LiveRegion } from "../atoms/LiveRegion";
import { ResultStat } from "../atoms/ResultStat";
import { useTranslate } from "../i18n/LanguageContext";
import type { TranslationParams } from "../i18n/types";
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
}

const PLACEHOLDER = "—";

export function ResultPanel({ result, quantity, massUnit }: Props) {
  const t = useTranslate();

  // Totals derive from full-precision unit mass; multiplying a rounded
  // display value drifts measurably at large quantities.
  const totalKg = result ? result.unitKg * quantity : null;

  const pair = (kg: number | null) => {
    if (kg === null) return { primary: PLACEHOLDER, secondary: undefined };
    const kgText = `${formatNumber(kg)} ${t("unit.kg")}`;
    const lbsText = `${formatNumber(kgToLbs(kg))} ${t("unit.lbs")}`;
    return massUnit === "kg"
      ? { primary: kgText, secondary: lbsText }
      : { primary: lbsText, secondary: kgText };
  };

  const total = pair(totalKg);
  const unit = pair(result?.unitKg ?? null);

  const announcement = result
    ? quantity > 1
      ? t("a11y.unitWeightSpoken", {
          weight: spoken(t, result.unitKg, massUnit),
          quantity,
          total: spoken(t, totalKg!, massUnit),
        })
      : t("a11y.totalSpoken", { total: spoken(t, totalKg!, massUnit) })
    : "";

  return (
    <section className="pfm-results" aria-label={t("ui.results")}>
      <div className="pfm-results__grid">
        <ResultStat
          label={t("ui.volume")}
          primary={result ? `${formatNumber(result.volumeCm3)} ${t("unit.cm3")}` : PLACEHOLDER}
        />
        {quantity > 1 && (
          <ResultStatWithTestIds
            prefix="unit"
            testId="unit-stat"
            label={t("ui.unitWeight")}
            {...unit}
          />
        )}
        <ResultStatWithTestIds
          prefix="total"
          label={quantity > 1 ? t("ui.total", { quantity }) : t("ui.weight")}
          emphasis
          {...total}
        />
      </div>

      <LiveRegion message={announcement} />
    </section>
  );
}

function ResultStatWithTestIds({
  prefix, testId, label, primary, secondary, emphasis,
}: {
  prefix: string;
  testId?: string;
  label: string;
  primary: string;
  secondary?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="pfm-stat-wrap" data-testid={testId}>
      <span className="pfm-stat__label">{label}</span>
      <span
        className={emphasis ? "pfm-stat__primary pfm-stat__primary--lg" : "pfm-stat__primary"}
        data-testid={`${prefix}-primary`}
        dir="ltr"
      >
        {primary}
      </span>
      {secondary && (
        <span className="pfm-stat__secondary" data-testid={`${prefix}-secondary`} dir="ltr">
          {secondary}
        </span>
      )}
    </div>
  );
}

function spoken(
  t: (key: string, params?: TranslationParams) => string,
  kg: number,
  massUnit: MassUnit
): string {
  return massUnit === "kg"
    ? t("a11y.kilograms", { value: formatNumber(kg) })
    : t("a11y.pounds", { value: formatNumber(kgToLbs(kg)) });
}

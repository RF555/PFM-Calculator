import { useState } from "react";
import { FieldError } from "../calculator/atoms/FieldError";
import { LiveRegion } from "../calculator/atoms/LiveRegion";
import { NumberField } from "../calculator/atoms/NumberField";
import { QuantityField } from "../calculator/atoms/QuantityField";
import { ResultStat } from "../calculator/atoms/ResultStat";
import { SegmentedControl } from "../calculator/atoms/SegmentedControl";
import "../calculator/styles/tokens.css";
import "../calculator/styles/base.css";
import "./AtomsPreview.css";

const UNIT_OPTIONS = [
  { value: "mm", label: "mm" },
  { value: "inch", label: "inch" },
];

const MASS_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "lbs", label: "lbs" },
];

const WIDTHS = [320, 480, 768, 1200];

/**
 * Review surface for the atom layer. Renders every atom in its meaningful
 * states inside a resizable frame, so the container-query layout and the
 * visual language can be judged before larger components are built on them.
 */
export function AtomsPreview() {
  const [width, setWidth] = useState(480);
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const [unit, setUnit] = useState("mm");
  const [massUnit, setMassUnit] = useState("kg");
  const [quantity, setQuantity] = useState(1);
  const [good, setGood] = useState("50");
  const [bad, setBad] = useState("abc");

  return (
    <div className="prev">
      <header className="prev__bar">
        <strong>Width</strong>
        {WIDTHS.map((w) => (
          <button key={w} onClick={() => setWidth(w)} data-on={w === width || undefined}>
            {w}
          </button>
        ))}
        <input
          type="range"
          min={280}
          max={1400}
          step={10}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          aria-label="Container width"
        />
        <output>{width}px</output>

        <strong>Density</strong>
        <button
          onClick={() => setDensity("comfortable")}
          data-on={density === "comfortable" || undefined}
        >
          comfortable
        </button>
        <button
          onClick={() => setDensity("compact")}
          data-on={density === "compact" || undefined}
        >
          compact
        </button>
      </header>

      <main className="prev__stage">
        <div className="prev__frame" style={{ width }}>
          <div className="pfm-calc" data-density={density}>
            <div className="prev__inner">
              <section className="prev__group">
                <h2 className="prev__h">SegmentedControl — unit and mass toggles</h2>
                <p className="prev__note">
                  One tab stop; arrow keys move between options. Selected state uses
                  weight and border, not colour alone.
                </p>
                <div className="prev__row">
                  <SegmentedControl
                    label="Dimension unit"
                    options={UNIT_OPTIONS}
                    value={unit}
                    onChange={setUnit}
                  />
                  <SegmentedControl
                    label="Mass unit"
                    options={MASS_OPTIONS}
                    value={massUnit}
                    onChange={setMassUnit}
                  />
                </div>
              </section>

              <section className="prev__group">
                <h2 className="prev__h">NumberField — valid, error, and empty</h2>
                <p className="prev__note">
                  Text input with a decimal inputmode. Try typing <code>1 1/2</code> or{" "}
                  <code>3/8</code> — a number input could not carry those.
                </p>
                <div className="prev__grid">
                  <NumberField
                    id="p-good"
                    label={`Diameter (${unit})`}
                    value={good}
                    onChange={setGood}
                  />
                  <NumberField
                    id="p-bad"
                    label={`Wall thickness (${unit})`}
                    value={bad}
                    onChange={setBad}
                    error={/^[\d./ -]*$/.test(bad) ? undefined : "Enter a number"}
                  />
                  <NumberField
                    id="p-empty"
                    label={`Length (${unit})`}
                    value=""
                    onChange={() => {}}
                    hint="Enter length"
                  />
                </div>
              </section>

              <section className="prev__group">
                <h2 className="prev__h">FieldError — reserved space</h2>
                <p className="prev__note">
                  Always rendered so a message never shifts the layout.
                </p>
                <FieldError
                  id="p-err"
                  message="Wall must be less than half the side (under 25.00)"
                />
              </section>

              <section className="prev__group">
                <h2 className="prev__h">QuantityField</h2>
                <QuantityField value={quantity} onChange={setQuantity} />
              </section>

              <section className="prev__group">
                <h2 className="prev__h">ResultStat — tabular numerals</h2>
                <p className="prev__note">
                  Digits keep their width as values change. The emphasised stat is the
                  payload.
                </p>
                <div className="prev__stats">
                  <ResultStat label="Volume" primary="1963.4954 cm³" />
                  <ResultStat label="Unit weight" primary="15.4134 kg" secondary="33.9805 lbs" />
                  <ResultStat
                    label={quantity > 1 ? `Total (× ${quantity})` : "Weight"}
                    primary={`${(15.4134 * quantity).toFixed(4)} kg`}
                    secondary={`${(33.9805 * quantity).toFixed(4)} lbs`}
                    emphasis
                  />
                </div>
                <div className="prev__stats">
                  <ResultStat label="Small part" primary="0.0000453 kg" />
                  <ResultStat label="Large order" primary="98765.4321 kg" />
                  <ResultStat label="Not yet entered" primary="—" />
                </div>
              </section>

              <LiveRegion message={`${(15.4134 * quantity).toFixed(4)} kilograms`} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { MaterialCalculator } from "../calculator";
import "./TestBed.css";

const WIDTHS = [320, 480, 768, 1200];
const DEFAULT_WIDTH = 1400;

/**
 * Review surface for the assembled calculator. The frame stands in for an
 * arbitrary host container so container-driven layout is exercised against a
 * real width rather than the viewport.
 */
export function TestBed() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const [lastResult, setLastResult] = useState<string | null>(null);

  return (
    <div className="bed">
      <header className="bed__bar">
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

      <main className="bed__stage">
        <div className="bed__frame" style={{ width }}>
          <MaterialCalculator
            density={density}
            onCalculate={(r) =>
              setLastResult(
                r === null
                  ? "null — incomplete or invalid; a host must clear any prefilled figure"
                  : `${r.shapeId} · ${r.gradeId} · unit ${r.unitKg.toFixed(6)} kg · total ${r.totalKg.toFixed(6)} kg`
              )
            }
          />
        </div>
      </main>

      <section className="bed__out">
        <h2>onCalculate — what the host receives</h2>
        <pre>{lastResult ?? "(no complete calculation yet)"}</pre>
      </section>
    </div>
  );
}

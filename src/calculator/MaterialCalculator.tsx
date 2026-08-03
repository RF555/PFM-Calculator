import bundled from "./data/materials.json";
import { CalculatorForm, type CalculationResult } from "./organisms/CalculatorForm";
import type { Material } from "./model/schema";
import type { MassUnit, Unit } from "./model/types";
import { CalculatorShell } from "./templates/CalculatorShell";

export interface MaterialCalculatorProps {
  /** Defaults to the bundled data. */
  materials?: Material[];
  defaultUnit?: Unit;
  defaultMassUnit?: MassUnit;
  defaultQuantity?: number;
  density?: "compact" | "comfortable";
  /** Receives the result, or null while it is incomplete or invalid. */
  onCalculate?: (result: CalculationResult | null) => void;
  /** Fires when the user switches between mm and inch. */
  onUnitChange?: (unit: Unit) => void;
  className?: string;
}

export const defaultMaterials = (bundled as { materials: Material[] }).materials;

/**
 * Public entry point. Content only — the host owns any modal, drawer, or
 * popover wrapper and all of its behaviour.
 */
export function MaterialCalculator({
  materials = defaultMaterials,
  defaultUnit = "mm",
  defaultMassUnit = "kg",
  defaultQuantity = 1,
  density = "comfortable",
  onCalculate,
  onUnitChange,
  className,
}: MaterialCalculatorProps) {
  return (
    <CalculatorShell density={density} className={className}>
      <CalculatorForm
        materials={materials}
        defaultUnit={defaultUnit}
        defaultMassUnit={defaultMassUnit}
        defaultQuantity={defaultQuantity}
        onCalculate={onCalculate}
        onUnitChange={onUnitChange}
      />
    </CalculatorShell>
  );
}

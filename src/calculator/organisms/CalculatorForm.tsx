import { useEffect, useMemo, useReducer, useState } from "react";
import { SegmentedControl } from "../atoms/SegmentedControl";
import { QuantityField } from "../atoms/QuantityField";
import { GradeCombobox } from "../molecules/GradeCombobox";
import { MaterialCombobox } from "../molecules/MaterialCombobox";
import { ResultPanel, type ResultValues } from "../molecules/ResultPanel";
import { ShapeCombobox } from "../molecules/ShapeCombobox";
import { m3ToCm3, mm3ToM3, weightKg } from "../model/calculate";
import { calcReducer, initialState } from "../model/reducer";
import type { Material } from "../model/schema";
import { SHAPES, checkConstraints, volumeMm3 } from "../model/shapes";
import type { MassUnit, Unit } from "../model/types";
import { DimensionFieldset } from "./DimensionFieldset";
import "./CalculatorForm.css";

export interface CalculationResult {
  materialId: string;
  gradeId: string;
  shapeId: string;
  unitKg: number;
  totalKg: number;
  quantity: number;
  volumeCm3: number;
}

interface Props {
  materials: Material[];
  defaultUnit: Unit;
  defaultMassUnit: MassUnit;
  defaultQuantity: number;
  /** Receives the result, or null while it is incomplete or invalid. */
  onCalculate?: (result: CalculationResult | null) => void;
  onCopy?: (text: string) => void;
  onUnitChange?: (unit: Unit) => void;
}

const UNIT_OPTIONS = [
  { value: "mm", label: "mm" },
  { value: "inch", label: "inch" },
];

const MASS_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "lbs", label: "lbs" },
];

export function CalculatorForm({
  materials, defaultUnit, defaultMassUnit, defaultQuantity,
  onCalculate, onCopy, onUnitChange,
}: Props) {
  const [state, dispatch] = useReducer(
    calcReducer,
    { defaultUnit, defaultMassUnit, defaultQuantity },
    initialState
  );
  // Errors are shown only after a field has been left, so a value is not
  // marked invalid while it is still being typed.
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const material = materials.find((m) => m.id === state.materialId) ?? null;
  const grade = material?.grades.find((g) => g.id === state.gradeId) ?? null;

  const violations = useMemo(
    () => (state.shapeId ? checkConstraints(state.shapeId, state.dimensions) : []),
    [state.shapeId, state.dimensions]
  );

  const result = useMemo<ResultValues | null>(() => {
    if (!state.shapeId || !grade || violations.length > 0) return null;
    const complete = SHAPES[state.shapeId].fields.every(
      (f) => Number.isFinite(state.dimensions[f.key])
    );
    if (!complete) return null;

    const mm3 = volumeMm3(state.shapeId, state.dimensions);
    return { unitKg: weightKg(mm3, grade.density), volumeCm3: m3ToCm3(mm3ToM3(mm3)) };
  }, [state.shapeId, state.dimensions, grade, violations]);

  // Reported from an effect rather than the memo above: notifying the host is
  // a side effect, and a memo may re-run at React's discretion. null is sent
  // whenever the result becomes unavailable, so a host that prefills from this
  // never holds a figure the user can no longer see.
  const report = useMemo<CalculationResult | null>(() => {
    if (!result || !material || !grade || !state.shapeId) return null;
    return {
      materialId: material.id,
      gradeId: grade.id,
      shapeId: state.shapeId,
      unitKg: result.unitKg,
      totalKg: result.unitKg * state.quantity,
      quantity: state.quantity,
      volumeCm3: result.volumeCm3,
    };
  }, [result, material, grade, state.shapeId, state.quantity]);

  useEffect(() => {
    onCalculate?.(report);
  }, [report, onCalculate]);

  // Parse errors and constraint violations share one map; both only surface
  // once the field has been touched.
  const visibleErrors: Record<string, string> = {};
  for (const [key, message] of Object.entries(state.errors)) {
    if (touched[key]) visibleErrors[key] = message;
  }
  for (const v of violations) {
    if (touched[v.field]) visibleErrors[v.field] = v.message;
  }

  return (
    <div className="pfm-form">
      <div className="pfm-form__toolbar">
        <SegmentedControl
          label="Dimension unit"
          options={UNIT_OPTIONS}
          value={state.unit}
          onChange={(v) => {
            dispatch({ type: "SET_UNIT", unit: v as Unit });
            onUnitChange?.(v as Unit);
          }}
        />
        <SegmentedControl
          label="Mass unit"
          options={MASS_OPTIONS}
          value={state.massUnit}
          onChange={(v) => dispatch({ type: "SET_MASS_UNIT", massUnit: v as MassUnit })}
        />
      </div>

      <div className="pfm-form__selectors">
        <MaterialCombobox
          materials={materials}
          value={state.materialId}
          onChange={(id) => dispatch({ type: "SELECT_MATERIAL", materialId: id })}
        />
        <GradeCombobox
          material={material}
          value={state.gradeId}
          onChange={(id) => dispatch({ type: "SELECT_GRADE", gradeId: id })}
        />
        <ShapeCombobox
          value={state.shapeId}
          onChange={(id) => {
            setTouched({});
            dispatch({ type: "SELECT_SHAPE", shapeId: id });
          }}
        />
      </div>

      {state.shapeId && (
        <DimensionFieldset
          shapeId={state.shapeId}
          unit={state.unit}
          raw={state.raw}
          errors={visibleErrors}
          onChange={(key, raw) => dispatch({ type: "SET_DIMENSION", key, raw })}
          onBlur={(key) => setTouched((t) => ({ ...t, [key]: true }))}
        />
      )}

      <div className="pfm-form__footer">
        <QuantityField
          value={state.quantity}
          onChange={(q) => dispatch({ type: "SET_QUANTITY", quantity: q })}
        />
        <button
          type="button"
          className="pfm-form__reset"
          onClick={() => {
            setTouched({});
            dispatch({ type: "RESET" });
          }}
        >
          Reset
        </button>
      </div>

      <ResultPanel
        result={result}
        quantity={state.quantity}
        massUnit={state.massUnit}
        onCopy={onCopy}
      />
    </div>
  );
}

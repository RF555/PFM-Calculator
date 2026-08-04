import { useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import { LanguageSwitch } from "../atoms/LanguageSwitch";
import { SegmentedControl } from "../atoms/SegmentedControl";
import { QuantityField } from "../atoms/QuantityField";
import { useTranslate } from "../i18n/LanguageContext";
import { GradeCombobox } from "../molecules/GradeCombobox";
import { MaterialCombobox } from "../molecules/MaterialCombobox";
import { ResultPanel, type ResultValues } from "../molecules/ResultPanel";
import { ShapeCombobox } from "../molecules/ShapeCombobox";
import { m3ToCm3, mm3ToM3, weightKg } from "../model/calculate";
import { calcReducer, initialState } from "../model/reducer";
import type { Material } from "../model/schema";
import { SHAPES, checkConstraints, volumeMm3, type ShapeId } from "../model/shapes";
import type { DimensionFieldDef, MassUnit, Unit } from "../model/types";
import { DimensionFieldset } from "./DimensionFieldset";
import "./CalculatorForm.css";

export interface CalculationResult {
  materialId: string;
  gradeId: string;
  shapeId: ShapeId;
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
  onUnitChange?: (unit: Unit) => void;
}

export function CalculatorForm({
  materials, defaultUnit, defaultMassUnit, defaultQuantity,
  onCalculate, onUnitChange,
}: Props) {
  // React's useId() is stable across a component's lifetime and unique per
  // mounted instance, so two calculators on one page never collide on the
  // ids their fields need for <label for> and aria-controls association.
  const idPrefix = useId();
  const t = useTranslate();

  const unitOptions = useMemo(
    () => [
      { value: "mm", label: t("unit.mm") },
      { value: "inch", label: t("unit.inch") },
    ],
    [t]
  );

  const massOptions = useMemo(
    () => [
      { value: "kg", label: t("unit.kg") },
      { value: "lbs", label: t("unit.lbs") },
    ],
    [t]
  );

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
    // `SHAPES[id].fields` narrows to a union of the registry's per-shape
    // literal field types unless pinned explicitly here, which loses the
    // `optional` property for every shape that never sets it.
    const fields: DimensionFieldDef[] = SHAPES[state.shapeId].fields;
    const complete = fields.every(
      (f) => f.optional || Number.isFinite(state.dimensions[f.key])
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

  // Hosts commonly pass inline arrow callbacks, which get a new identity on
  // every render. Depending on the callback itself would re-run this effect
  // every time the host re-renders — and since the effect calls back into
  // host state, that can loop forever if the host stores a non-primitive.
  // Stashing the latest callback in a ref keeps the effect dependent only on
  // `report`, which already only changes when the computed result changes.
  const onCalculateRef = useRef(onCalculate);
  useEffect(() => {
    onCalculateRef.current = onCalculate;
  });
  const onUnitChangeRef = useRef(onUnitChange);
  useEffect(() => {
    onUnitChangeRef.current = onUnitChange;
  });

  useEffect(() => {
    onCalculateRef.current?.(report);
  }, [report]);

  // Parse errors and constraint violations share one map; both only surface
  // once the field has been touched. The model stores translation keys, which
  // are resolved to display text here.
  const visibleErrors: Record<string, string> = {};
  for (const [key, errorKey] of Object.entries(state.errors)) {
    if (touched[key]) visibleErrors[key] = t(errorKey);
  }
  for (const v of violations) {
    if (touched[v.field]) visibleErrors[v.field] = t(v.message.key, v.message.params);
  }

  return (
    <div className="pfm-form">
      <div className="pfm-form__toolbar">
        <LanguageSwitch />
        <div className="pfm-form__units">
          <SegmentedControl
            label={t("ui.dimensionUnit")}
            options={unitOptions}
            value={state.unit}
            onChange={(v) => {
              dispatch({ type: "SET_UNIT", unit: v as Unit });
              onUnitChangeRef.current?.(v as Unit);
            }}
          />
          <SegmentedControl
            label={t("ui.massUnit")}
            options={massOptions}
            value={state.massUnit}
            onChange={(v) => dispatch({ type: "SET_MASS_UNIT", massUnit: v as MassUnit })}
          />
        </div>
      </div>

      <div className="pfm-form__selectors">
        <MaterialCombobox
          idPrefix={idPrefix}
          materials={materials}
          value={state.materialId}
          onChange={(id) => dispatch({ type: "SELECT_MATERIAL", materialId: id })}
        />
        <GradeCombobox
          idPrefix={idPrefix}
          material={material}
          value={state.gradeId}
          onChange={(id) => dispatch({ type: "SELECT_GRADE", gradeId: id })}
        />
        <ShapeCombobox
          idPrefix={idPrefix}
          value={state.shapeId}
          onChange={(id) => {
            setTouched({});
            dispatch({ type: "SELECT_SHAPE", shapeId: id });
          }}
        />
      </div>

      {state.shapeId && (
        <DimensionFieldset
          idPrefix={idPrefix}
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
          idPrefix={idPrefix}
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
          {t("ui.reset")}
        </button>
      </div>

      <ResultPanel
        result={result}
        quantity={state.quantity}
        massUnit={state.massUnit}
      />
    </div>
  );
}

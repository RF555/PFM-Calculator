import { DimensionField } from "../molecules/DimensionField";
import { DimensionGrid } from "../molecules/DimensionGrid";
import { SHAPES, type ShapeId } from "../model/shapes";
import type { Unit } from "../model/types";

interface Props {
  idPrefix: string;
  shapeId: ShapeId;
  unit: Unit;
  raw: Record<string, string>;
  errors: Record<string, string>;
  onChange: (key: string, raw: string) => void;
  onBlur: (key: string) => void;
}

export function DimensionFieldset({
  idPrefix, shapeId, unit, raw, errors, onChange, onBlur,
}: Props) {
  return (
    <fieldset className="pfm-fieldset">
      <legend className="pfm-visually-hidden">Dimensions</legend>
      <DimensionGrid>
        {SHAPES[shapeId].fields.map((f) => (
          <DimensionField
            key={f.key}
            idPrefix={idPrefix}
            fieldKey={f.key}
            label={f.label}
            unit={unit}
            value={raw[f.key] ?? ""}
            error={errors[f.key]}
            onChange={(v) => onChange(f.key, v)}
            onBlur={() => onBlur(f.key)}
          />
        ))}
      </DimensionGrid>
    </fieldset>
  );
}

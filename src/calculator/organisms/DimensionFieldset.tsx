import { ShapeIcon } from "../atoms/ShapeIcon";
import { useTranslate } from "../i18n/LanguageContext";
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
  const t = useTranslate();

  return (
    <fieldset className="pfm-fieldset">
      <legend className="pfm-visually-hidden">{t("ui.dimensions")}</legend>
      {/*
        The chosen profile drawn as a solid, sitting with the measurements it
        takes. Decorative: the shape name is already on the picker above and
        every field is labelled, so it adds nothing for a screen reader.
      */}
      <ShapeIcon
        shapeId={shapeId}
        variant="iso"
        size={176}
        hints
        className="pfm-fieldset__figure"
      />
      <DimensionGrid>
        {SHAPES[shapeId].fields.map((f) => (
          <DimensionField
            key={f.key}
            idPrefix={idPrefix}
            fieldKey={f.key}
            label={t(f.labelKey)}
            notation={f.notation}
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

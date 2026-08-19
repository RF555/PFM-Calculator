import { useTranslate } from "../i18n/LanguageContext";
import { NumberField } from "../atoms/NumberField";
import type { Unit } from "../model/types";

interface Props {
  idPrefix: string;
  fieldKey: string;
  label: string;
  /** Letter marking this dimension on the shape sketch, e.g. "OD". */
  notation?: string;
  value: string;
  unit: Unit;
  onChange: (raw: string) => void;
  onBlur?: () => void;
  error?: string;
}

export function DimensionField({
  idPrefix, fieldKey, label, notation, value, unit, onChange, onBlur, error,
}: Props) {
  const t = useTranslate();

  return (
    <NumberField
      id={`${idPrefix}-dim-${fieldKey}`}
      label={t("ui.fieldWithUnit", { label, unit: t(`unit.${unit}`) })}
      notation={notation}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
    />
  );
}

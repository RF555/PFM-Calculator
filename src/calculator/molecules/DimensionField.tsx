import { useTranslate } from "../i18n/LanguageContext";
import { NumberField } from "../atoms/NumberField";
import type { Unit } from "../model/types";

interface Props {
  idPrefix: string;
  fieldKey: string;
  label: string;
  value: string;
  unit: Unit;
  onChange: (raw: string) => void;
  onBlur?: () => void;
  error?: string;
}

export function DimensionField({
  idPrefix, fieldKey, label, value, unit, onChange, onBlur, error,
}: Props) {
  const t = useTranslate();

  return (
    <NumberField
      id={`${idPrefix}-dim-${fieldKey}`}
      label={t("ui.fieldWithUnit", { label, unit: t(`unit.${unit}`) })}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
    />
  );
}

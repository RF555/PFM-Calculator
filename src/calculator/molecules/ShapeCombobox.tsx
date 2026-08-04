import { useTranslate } from "../i18n/LanguageContext";
import { SHAPES, SHAPE_IDS, type ShapeId } from "../model/shapes";
import { Combobox } from "./Combobox";

interface Props {
  idPrefix: string;
  value: ShapeId | null;
  onChange: (shapeId: ShapeId) => void;
}

export function ShapeCombobox({ idPrefix, value, onChange }: Props) {
  const t = useTranslate();

  return (
    <Combobox
      id={`${idPrefix}-shape`}
      label={t("ui.shape")}
      placeholder={t("ui.shapePlaceholder")}
      options={SHAPE_IDS.map((id) => ({ value: id, label: t(SHAPES[id].labelKey) }))}
      value={value}
      onChange={(v) => onChange(v as ShapeId)}
    />
  );
}

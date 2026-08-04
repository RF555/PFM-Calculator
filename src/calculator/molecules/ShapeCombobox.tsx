import { ShapeIcon } from "../atoms/ShapeIcon";
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
      // Flat cross-sections in the list, where the icon only has to separate
      // one row from the next; the isometric solid on the trigger, where the
      // chosen profile gets the room to read as a physical piece of stock.
      renderOptionIcon={(v) => (
        <ShapeIcon
          shapeId={v as ShapeId}
          variant="flat"
          size={22}
          className="pfm-combobox__icon"
        />
      )}
      renderTriggerIcon={(v) => (
        <ShapeIcon
          shapeId={v as ShapeId}
          variant="iso"
          size={28}
          className="pfm-combobox__icon"
        />
      )}
    />
  );
}

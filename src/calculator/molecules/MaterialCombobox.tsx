import { CustomDensityIcon } from "../atoms/CustomDensityIcon";
import { useLanguage, useTranslate } from "../i18n/LanguageContext";
import { CUSTOM_MATERIAL_ID, type Material } from "../model/schema";
import { sortOptions } from "../model/sortOptions";
import { Combobox } from "./Combobox";

interface Props {
  idPrefix: string;
  materials: Material[];
  value: string | null;
  onChange: (materialId: string) => void;
}

export function MaterialCombobox({ idPrefix, materials, value, onChange }: Props) {
  const { language } = useLanguage();
  const t = useTranslate();

  return (
    <Combobox
      id={`${idPrefix}-material`}
      label={t("ui.material")}
      placeholder={t("ui.materialPlaceholder")}
      // Custom density is appended after sorting, not sorted with the
      // catalog: it is an escape hatch from the list rather than a member of
      // it, so it belongs at the end in every language. Collating it would
      // file it under its translated label and move it per language.
      options={[
        ...sortOptions(
          materials.map((m) => ({ value: m.id, label: m.name[language] })),
          language
        ),
        { value: CUSTOM_MATERIAL_ID, label: t("ui.customDensity"), distinct: true },
      ]}
      value={value}
      onChange={onChange}
      // Only the custom entry is illustrated. Materials have no artwork to
      // show, so an icon here marks the one row that behaves differently
      // rather than decorating the whole list.
      renderOptionIcon={(v) =>
        v === CUSTOM_MATERIAL_ID ? (
          <CustomDensityIcon size={20} className="pfm-combobox__custom-icon" />
        ) : null
      }
      renderTriggerIcon={(v) =>
        v === CUSTOM_MATERIAL_ID ? (
          <CustomDensityIcon size={20} className="pfm-combobox__custom-icon" />
        ) : null
      }
    />
  );
}

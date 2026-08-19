import { useLanguage, useTranslate } from "../i18n/LanguageContext";
import type { Material } from "../model/schema";
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
      options={sortOptions(
        materials.map((m) => ({ value: m.id, label: m.name[language] })),
        language
      )}
      value={value}
      onChange={onChange}
    />
  );
}

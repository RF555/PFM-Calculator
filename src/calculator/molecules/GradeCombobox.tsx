import { useLanguage, useTranslate } from "../i18n/LanguageContext";
import type { Material } from "../model/schema";
import { sortOptions } from "../model/sortOptions";
import { Combobox } from "./Combobox";

interface Props {
  idPrefix: string;
  material: Material | null;
  value: string | null;
  onChange: (gradeId: string) => void;
}

export function GradeCombobox({ idPrefix, material, value, onChange }: Props) {
  const { language } = useLanguage();
  const t = useTranslate();

  return (
    <Combobox
      id={`${idPrefix}-grade`}
      label={t("ui.grade")}
      placeholder={t("ui.gradePlaceholder")}
      options={
        material
          ? sortOptions(
              material.grades.map((g) => ({
                value: g.id,
                label: g.name[language],
              })),
              language
            )
          : []
      }
      value={value}
      onChange={onChange}
      disabled={!material}
      disabledHint={t("ui.gradeDisabledHint")}
    />
  );
}

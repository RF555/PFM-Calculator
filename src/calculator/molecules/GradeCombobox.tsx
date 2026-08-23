import { useLanguage, useTranslate } from "../i18n/LanguageContext";
import type { Material } from "../model/schema";
import { sortOptions } from "../model/sortOptions";
import { Combobox } from "./Combobox";

interface Props {
  idPrefix: string;
  material: Material | null;
  value: string | null;
  onChange: (gradeId: string) => void;
  /**
   * The user is supplying a density directly, so no grade applies. Disabled
   * either way — `material` is null in this mode — but the hint has to say
   * which of the two reasons it is, or it tells the user to select a material
   * they have already selected.
   */
  customDensity?: boolean;
}

export function GradeCombobox({
  idPrefix, material, value, onChange, customDensity,
}: Props) {
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
      disabled={!material || customDensity}
      disabledHint={t(customDensity ? "ui.gradeCustomHint" : "ui.gradeDisabledHint")}
    />
  );
}

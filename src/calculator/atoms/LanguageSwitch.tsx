import { useLanguage, useTranslate } from "../i18n/LanguageContext";
import type { Language } from "../i18n/types";
import { SegmentedControl } from "./SegmentedControl";

// Each option is written in its own script, so it is recognizable whichever
// language is currently active.
const OPTIONS = [
  { value: "he", label: "עברית" },
  { value: "en", label: "English" },
];

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslate();

  return (
    <SegmentedControl
      label={t("ui.language")}
      options={OPTIONS}
      value={language}
      onChange={(value) => setLanguage(value as Language)}
    />
  );
}

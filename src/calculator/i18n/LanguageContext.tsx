import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LANGUAGE, translate } from "./strings";
import type { Language, TranslationParams } from "./types";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

// A default value rather than undefined: a component rendered outside the
// provider still resolves strings in the default language instead of
// throwing, which keeps atoms usable in isolation (including in tests).
const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

interface Props {
  language: Language;
  setLanguage: (language: Language) => void;
  children: React.ReactNode;
}

export function LanguageProvider({ language, setLanguage, children }: Props) {
  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage]
  );
  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

/** Resolves a translation key in the active language. */
export function useTranslate(): (key: string, params?: TranslationParams) => string {
  const { language } = useLanguage();
  return useMemo(
    () => (key: string, params?: TranslationParams) =>
      translate(language, key, params),
    [language]
  );
}

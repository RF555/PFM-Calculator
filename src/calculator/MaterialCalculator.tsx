import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import bundled from "./data/materials.json";
import { LanguageProvider } from "./i18n/LanguageContext";
import { DEFAULT_LANGUAGE, LANGUAGES } from "./i18n/strings";
import type { Language, Localized } from "./i18n/types";
import { CalculatorForm, type CalculationResult } from "./organisms/CalculatorForm";
import { validateMaterials, type Material } from "./model/schema";
import type { MassUnit, Unit } from "./model/types";
import { CalculatorShell } from "./templates/CalculatorShell";

/**
 * Host-facing disclaimer copy, in both languages. There is deliberately no
 * way to remove the disclaimer — a host with different counsel can reword it,
 * but the notice itself always renders.
 */
export interface DisclaimerCopy {
  summary: Localized<string>;
  points: Localized<string[]>;
}

export interface MaterialCalculatorProps {
  /** Defaults to the bundled data. */
  materials?: Material[];
  /** Initial interface language. The in-widget switch owns it after mount. */
  defaultLanguage?: Language;
  defaultUnit?: Unit;
  defaultMassUnit?: MassUnit;
  defaultQuantity?: number;
  density?: "compact" | "comfortable";
  /** Receives the result, or null while it is incomplete or invalid. */
  onCalculate?: (result: CalculationResult | null) => void;
  /** Fires when the user switches between mm and inch. */
  onUnitChange?: (unit: Unit) => void;
  /** Fires when the user switches between Hebrew and English. */
  onLanguageChange?: (language: Language) => void;
  /** Replaces the default disclaimer copy. The disclaimer cannot be removed. */
  disclaimer?: Partial<DisclaimerCopy>;
  className?: string;
}

export const defaultMaterials = (bundled as unknown as { materials: Material[] }).materials;

/**
 * Hosts are not necessarily TypeScript, so a prop typed as `Language` can
 * still arrive as any string at runtime. Anything outside the closed union
 * falls back to the default rather than reaching state and crashing render.
 */
function coerceLanguage(language: Language): Language {
  return LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

/**
 * Public entry point. Content only — the host owns any modal, drawer, or
 * popover wrapper and all of its behaviour.
 */
export function MaterialCalculator({
  materials = defaultMaterials,
  defaultLanguage = DEFAULT_LANGUAGE,
  defaultUnit = "mm",
  defaultMassUnit = "kg",
  defaultQuantity = 1,
  density = "comfortable",
  onCalculate,
  onUnitChange,
  onLanguageChange,
  disclaimer,
  className,
}: MaterialCalculatorProps) {
  const [language, setLanguage] = useState<Language>(() => coerceLanguage(defaultLanguage));

  // The bundled default is already known-good; only host-supplied data pays
  // for validation, and only once per identity rather than on every render.
  const validatedMaterials = useMemo(() => {
    if (materials === defaultMaterials) return materials;
    return validateMaterials({ version: 2, materials }).materials;
  }, [materials]);

  // Hosts are not necessarily TypeScript, so each field is validated
  // independently and a malformed one falls back to the bundled copy rather
  // than blanking the notice.
  const disclaimerText = useMemo(() => {
    const summary = disclaimer?.summary?.[language];
    const points = disclaimer?.points?.[language];
    return {
      summary: typeof summary === "string" && summary ? summary : undefined,
      points:
        Array.isArray(points) && points.length && points.every((p) => typeof p === "string")
          ? points
          : undefined,
    };
  }, [disclaimer, language]);

  // Hosts commonly pass inline arrow callbacks, which get a new identity on
  // every render; stashing the latest in a ref keeps setLanguage's identity
  // stable, which in turn keeps the context value stable.
  const onLanguageChangeRef = useRef(onLanguageChange);
  useEffect(() => {
    onLanguageChangeRef.current = onLanguageChange;
  });

  const changeLanguage = useCallback((next: Language) => {
    setLanguage(next);
    onLanguageChangeRef.current?.(next);
  }, []);

  return (
    <LanguageProvider language={language} setLanguage={changeLanguage}>
      <CalculatorShell language={language} density={density} className={className}>
        <CalculatorForm
          materials={validatedMaterials}
          defaultUnit={defaultUnit}
          defaultMassUnit={defaultMassUnit}
          defaultQuantity={defaultQuantity}
          onCalculate={onCalculate}
          onUnitChange={onUnitChange}
          disclaimerText={disclaimerText}
        />
      </CalculatorShell>
    </LanguageProvider>
  );
}

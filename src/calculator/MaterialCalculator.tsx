import { useCallback, useEffect, useRef, useState } from "react";
import bundled from "./data/materials.json";
import { LanguageProvider } from "./i18n/LanguageContext";
import { DEFAULT_LANGUAGE } from "./i18n/strings";
import type { Language } from "./i18n/types";
import { CalculatorForm, type CalculationResult } from "./organisms/CalculatorForm";
import type { Material } from "./model/schema";
import type { MassUnit, Unit } from "./model/types";
import { CalculatorShell } from "./templates/CalculatorShell";

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
  className?: string;
}

export const defaultMaterials = (bundled as unknown as { materials: Material[] }).materials;

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
  className,
}: MaterialCalculatorProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

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
          materials={materials}
          defaultUnit={defaultUnit}
          defaultMassUnit={defaultMassUnit}
          defaultQuantity={defaultQuantity}
          onCalculate={onCalculate}
          onUnitChange={onUnitChange}
        />
      </CalculatorShell>
    </LanguageProvider>
  );
}

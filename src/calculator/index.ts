export { MaterialCalculator, defaultMaterials } from "./MaterialCalculator";
export type { MaterialCalculatorProps, DisclaimerCopy } from "./MaterialCalculator";
export type { DisclaimerText } from "./atoms/Disclaimer";
export type { CalculationResult } from "./organisms/CalculatorForm";
export type { Grade, Material, MaterialsFile } from "./model/schema";
export type { MassUnit, Unit } from "./model/types";
export { validateMaterials } from "./model/schema";
// The registry stores translation keys, so shapeLabel — not SHAPES[id].label —
// renders a human-readable name for a ShapeId a host receives via onCalculate.
export { SHAPES, SHAPE_IDS, shapeLabel } from "./model/shapes";
export type { ShapeId } from "./model/shapes";
export type { Language, Localized } from "./i18n/types";
export { LANGUAGES, DEFAULT_LANGUAGE } from "./i18n/strings";

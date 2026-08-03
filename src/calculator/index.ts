export { MaterialCalculator, defaultMaterials } from "./MaterialCalculator";
export type { MaterialCalculatorProps } from "./MaterialCalculator";
export type { CalculationResult } from "./organisms/CalculatorForm";
export type { Grade, Material, MaterialsFile } from "./model/schema";
export type { MassUnit, Unit } from "./model/types";
export { validateMaterials } from "./model/schema";
// SHAPES doubles as the shape label lookup: SHAPES[id].label renders a
// human-readable name for any ShapeId a host receives via onCalculate.
export { SHAPES, SHAPE_IDS } from "./model/shapes";
export type { ShapeId } from "./model/shapes";

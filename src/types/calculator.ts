export interface Material {
  name: string;
  density: number;
  subtypes: MaterialSubtype[];
}

export interface MaterialSubtype {
  name: string;
  density: number;
}

export type ShapeType =
  | "sheet"
  | "roundBar"
  | "squareBar"
  | "flatBar"
  | "hexBar"
  | "roundTubeOuter"
  | "roundTubeInner"
  | "rectangularHollow"
  | "squareHollow"
  | "angle";

export type Unit = "mm" | "inch";

export interface CalculationResult {
  material: string;
  subtype?: string;
  shape: string;
  dimensions: Record<string, number>;
  unit: Unit;
  volumeCm3: number;
  volumeM3: number;
  weightKg: number;
  weightLbs: number;
  timestamp: number;
}

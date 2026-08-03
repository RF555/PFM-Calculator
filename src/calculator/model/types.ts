export type Unit = "mm" | "inch";
export type MassUnit = "kg" | "lbs";

/** Dimension values in canonical millimetres. */
export type DimensionValues = Record<string, number>;

export interface DimensionFieldDef {
  key: string;
  label: string;
}

export interface ConstraintDef {
  /** Field the message attaches to. */
  field: string;
  /** Returns true when the combination is valid. */
  test: (d: DimensionValues) => boolean;
  message: (d: DimensionValues) => string;
}

export interface ShapeDef {
  label: string;
  fields: DimensionFieldDef[];
  constraints: ConstraintDef[];
  /** Volume in cubic millimetres. */
  volume: (d: DimensionValues) => number;
}

export interface ConstraintViolation {
  field: string;
  message: string;
}

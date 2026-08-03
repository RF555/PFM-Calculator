export type Unit = "mm" | "inch";
export type MassUnit = "kg" | "lbs";

/** Dimension values in canonical millimetres. */
export type DimensionValues = Record<string, number>;

export interface DimensionFieldDef {
  key: string;
  label: string;
  /**
   * Not required for a complete, calculable shape. An optional field is
   * excluded from the "all fields finite" completeness check, so the shape
   * still calculates (typically falling back to another field's value)
   * while it is left blank.
   */
  optional?: boolean;
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

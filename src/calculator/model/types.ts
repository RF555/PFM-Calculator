import type { TranslationParams } from "../i18n/types";

export type Unit = "mm" | "inch";
export type MassUnit = "kg" | "lbs";

/** Dimension values in canonical millimetres. */
export type DimensionValues = Record<string, number>;

/** A translation key plus the values its placeholders need. */
export interface TranslatableMessage {
  key: string;
  params?: TranslationParams;
}

export interface DimensionFieldDef {
  key: string;
  /** Translation key for the field's label, e.g. "field.diameter". */
  labelKey: string;
  /**
   * The letter marking this dimension on the shape's sketch, e.g. "OD".
   * Shown beside the field label so the drawing can be read without a
   * separate legend. Latin engineering notation in every locale — that is
   * how these are read on drawings and mill certs.
   */
  notation: string;
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
  message: (d: DimensionValues) => TranslatableMessage;
}

export interface ShapeDef {
  /** Translation key for the shape's name, e.g. "shape.roundBar". */
  labelKey: string;
  fields: DimensionFieldDef[];
  constraints: ConstraintDef[];
  /** Volume in cubic millimetres. */
  volume: (d: DimensionValues) => number;
}

export interface ConstraintViolation {
  field: string;
  message: TranslatableMessage;
}

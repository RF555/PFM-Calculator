import { formatNumber } from "./format";
import { translate } from "../i18n/strings";
import type { Language } from "../i18n/types";
import type {
  ConstraintDef,
  ConstraintViolation,
  DimensionFieldDef,
  DimensionValues,
  ShapeDef,
} from "./types";

const sq = (x: number) => x * x;

/**
 * Effective B leg for an angle: falls back to leg A when `legB` is absent
 * or not a finite number, so equal-leg angle needs only one field filled in.
 */
const effectiveLegB = (d: DimensionValues): number =>
  Number.isFinite(d.legB) ? d.legB : d.leg;

export const SHAPES = {
  sheet: {
    labelKey: "shape.sheet",
    fields: [
      { key: "length", labelKey: "field.length", notation: "L" },
      { key: "width", labelKey: "field.width", notation: "W" },
      { key: "thickness", labelKey: "field.thickness", notation: "t" },
    ],
    constraints: [],
    volume: (d) => d.length * d.width * d.thickness,
  },

  roundBar: {
    labelKey: "shape.roundBar",
    fields: [
      { key: "diameter", labelKey: "field.diameter", notation: "D" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    constraints: [],
    volume: (d) => Math.PI * sq(d.diameter / 2) * d.length,
  },

  squareBar: {
    labelKey: "shape.squareBar",
    fields: [
      { key: "side", labelKey: "field.side", notation: "A" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    constraints: [],
    volume: (d) => sq(d.side) * d.length,
  },

  flatBar: {
    labelKey: "shape.flatBar",
    fields: [
      { key: "width", labelKey: "field.width", notation: "W" },
      { key: "thickness", labelKey: "field.thickness", notation: "t" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    constraints: [],
    volume: (d) => d.width * d.thickness * d.length,
  },

  hexBar: {
    labelKey: "shape.hexBar",
    fields: [
      { key: "flatToFlat", labelKey: "field.flatToFlat", notation: "A/F" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    constraints: [],
    // Area by across-flats F: side = F/sqrt(3), so area = (sqrt(3)/2)*F^2.
    volume: (d) => (Math.sqrt(3) / 2) * sq(d.flatToFlat) * d.length,
  },

  roundTubeOuter: {
    labelKey: "shape.roundTubeOuter",
    fields: [
      { key: "outerDiameter", labelKey: "field.outerDiameter", notation: "OD" },
      { key: "wallThickness", labelKey: "field.wallThickness", notation: "t" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    constraints: [
      {
        field: "wallThickness",
        test: (d) => d.wallThickness < d.outerDiameter / 2,
        message: (d) => ({
          key: "constraint.wallHalfOuterDiameter",
          params: { max: formatNumber(d.outerDiameter / 2) },
        }),
      },
    ],
    volume: (d) =>
      Math.PI * d.length *
      (sq(d.outerDiameter / 2) - sq(d.outerDiameter / 2 - d.wallThickness)),
  },

  roundTubeInner: {
    labelKey: "shape.roundTubeInner",
    fields: [
      { key: "innerDiameter", labelKey: "field.innerDiameter", notation: "ID" },
      { key: "wallThickness", labelKey: "field.wallThickness", notation: "t" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    // Wall grows outward from a fixed bore, so there is no upper bound.
    constraints: [],
    volume: (d) =>
      Math.PI * d.length *
      (sq(d.innerDiameter / 2 + d.wallThickness) - sq(d.innerDiameter / 2)),
  },

  rectangularHollow: {
    labelKey: "shape.rectangularHollow",
    fields: [
      { key: "width", labelKey: "field.width", notation: "W" },
      { key: "height", labelKey: "field.height", notation: "H" },
      { key: "wallThickness", labelKey: "field.wallThickness", notation: "t" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    constraints: [
      {
        field: "wallThickness",
        test: (d) => d.wallThickness < Math.min(d.width, d.height) / 2,
        message: (d) => ({
          key: "constraint.wallHalfSmallerSide",
          params: { max: formatNumber(Math.min(d.width, d.height) / 2) },
        }),
      },
    ],
    volume: (d) =>
      d.length *
      (d.width * d.height -
        (d.width - 2 * d.wallThickness) * (d.height - 2 * d.wallThickness)),
  },

  squareHollow: {
    labelKey: "shape.squareHollow",
    fields: [
      { key: "side", labelKey: "field.side", notation: "A" },
      { key: "wallThickness", labelKey: "field.wallThickness", notation: "t" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    constraints: [
      {
        field: "wallThickness",
        test: (d) => d.wallThickness < d.side / 2,
        message: (d) => ({
          key: "constraint.wallHalfSide",
          params: { max: formatNumber(d.side / 2) },
        }),
      },
    ],
    volume: (d) =>
      d.length * (sq(d.side) - sq(d.side - 2 * d.wallThickness)),
  },

  angle: {
    labelKey: "shape.angle",
    fields: [
      { key: "leg", labelKey: "field.legA", notation: "L1" },
      { key: "legB", labelKey: "field.legB", notation: "L2", optional: true },
      { key: "thickness", labelKey: "field.thickness", notation: "t" },
      { key: "length", labelKey: "field.length", notation: "L" },
    ],
    constraints: [
      {
        field: "thickness",
        test: (d) => d.thickness < Math.min(d.leg, effectiveLegB(d)),
        message: (d) => ({
          key: "constraint.thicknessSmallerLeg",
          params: { max: formatNumber(Math.min(d.leg, effectiveLegB(d))) },
        }),
      },
    ],
    // Equal-leg when legB is absent: effectiveLegB falls back to leg, which
    // reduces this to the prior L * (2*leg*t - t^2) formula exactly.
    volume: (d) => d.length * ((d.leg + effectiveLegB(d) - d.thickness) * d.thickness),
  },
} as const satisfies Record<string, ShapeDef>;

export type ShapeId = keyof typeof SHAPES;

export const SHAPE_IDS = Object.keys(SHAPES) as ShapeId[];

/**
 * Human-readable shape name. Hosts receive a ShapeId via onCalculate and need
 * a supported way to render it, since the registry stores a key, not text.
 */
export function shapeLabel(id: ShapeId, language: Language): string {
  return translate(language, SHAPES[id].labelKey);
}

/** Volume in cubic millimetres. Assumes constraints already passed. */
export function volumeMm3(id: ShapeId, dims: DimensionValues): number {
  return SHAPES[id].volume(dims);
}

/**
 * Returns violated constraints. Must be called before volumeMm3 — past their
 * valid range these formulas decrease symmetrically, returning plausible but
 * incorrect values rather than failing.
 */
export function checkConstraints(
  id: ShapeId,
  dims: DimensionValues
): ConstraintViolation[] {
  const shape = SHAPES[id];
  // `shape.fields` narrows to a union of the registry's per-shape literal
  // field types unless the element type is pinned explicitly here, which
  // loses the `optional` property for every shape that never sets it.
  const fields: DimensionFieldDef[] = shape.fields;
  const complete = fields.every((f) => f.optional || Number.isFinite(dims[f.key]));
  if (!complete) return [];

  // `shape.constraints` narrows to `never[]` for the union of registry
  // literals unless the element type is pinned explicitly here.
  const constraints: ConstraintDef[] = shape.constraints;
  return constraints
    .filter((c) => !c.test(dims))
    .map((c) => ({ field: c.field, message: c.message(dims) }));
}

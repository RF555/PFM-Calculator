import { formatNumber } from "./format";
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
    label: "Sheet / Plate",
    fields: [
      { key: "length", label: "Length" },
      { key: "width", label: "Width" },
      { key: "thickness", label: "Thickness" },
    ],
    constraints: [],
    volume: (d) => d.length * d.width * d.thickness,
  },

  roundBar: {
    label: "Round Bar",
    fields: [
      { key: "diameter", label: "Diameter" },
      { key: "length", label: "Length" },
    ],
    constraints: [],
    volume: (d) => Math.PI * sq(d.diameter / 2) * d.length,
  },

  squareBar: {
    label: "Square Bar",
    fields: [
      { key: "side", label: "Side" },
      { key: "length", label: "Length" },
    ],
    constraints: [],
    volume: (d) => sq(d.side) * d.length,
  },

  flatBar: {
    label: "Flat Bar",
    fields: [
      { key: "width", label: "Width" },
      { key: "thickness", label: "Thickness" },
      { key: "length", label: "Length" },
    ],
    constraints: [],
    volume: (d) => d.width * d.thickness * d.length,
  },

  hexBar: {
    label: "Hexagonal Bar",
    fields: [
      { key: "flatToFlat", label: "Flat-to-Flat" },
      { key: "length", label: "Length" },
    ],
    constraints: [],
    // Area by across-flats F: side = F/sqrt(3), so area = (sqrt(3)/2)*F^2.
    volume: (d) => (Math.sqrt(3) / 2) * sq(d.flatToFlat) * d.length,
  },

  roundTubeOuter: {
    label: "Round Tube (Outer Ø + Wall)",
    fields: [
      { key: "outerDiameter", label: "Outer Diameter" },
      { key: "wallThickness", label: "Wall Thickness" },
      { key: "length", label: "Length" },
    ],
    constraints: [
      {
        field: "wallThickness",
        test: (d) => d.wallThickness < d.outerDiameter / 2,
        message: (d) =>
          `Wall must be less than half the outer diameter (under ${formatNumber(d.outerDiameter / 2)})`,
      },
    ],
    volume: (d) =>
      Math.PI * d.length *
      (sq(d.outerDiameter / 2) - sq(d.outerDiameter / 2 - d.wallThickness)),
  },

  roundTubeInner: {
    label: "Round Tube (Inner Ø + Wall)",
    fields: [
      { key: "innerDiameter", label: "Inner Diameter" },
      { key: "wallThickness", label: "Wall Thickness" },
      { key: "length", label: "Length" },
    ],
    // Wall grows outward from a fixed bore, so there is no upper bound.
    constraints: [],
    volume: (d) =>
      Math.PI * d.length *
      (sq(d.innerDiameter / 2 + d.wallThickness) - sq(d.innerDiameter / 2)),
  },

  rectangularHollow: {
    label: "Rectangular Hollow Section",
    fields: [
      { key: "width", label: "Width" },
      { key: "height", label: "Height" },
      { key: "wallThickness", label: "Wall Thickness" },
      { key: "length", label: "Length" },
    ],
    constraints: [
      {
        field: "wallThickness",
        test: (d) => d.wallThickness < Math.min(d.width, d.height) / 2,
        message: (d) =>
          `Wall must be less than half the smaller side (under ${formatNumber(Math.min(d.width, d.height) / 2)})`,
      },
    ],
    volume: (d) =>
      d.length *
      (d.width * d.height -
        (d.width - 2 * d.wallThickness) * (d.height - 2 * d.wallThickness)),
  },

  squareHollow: {
    label: "Square Hollow Section",
    fields: [
      { key: "side", label: "Side" },
      { key: "wallThickness", label: "Wall Thickness" },
      { key: "length", label: "Length" },
    ],
    constraints: [
      {
        field: "wallThickness",
        test: (d) => d.wallThickness < d.side / 2,
        message: (d) =>
          `Wall must be less than half the side (under ${formatNumber(d.side / 2)})`,
      },
    ],
    volume: (d) =>
      d.length * (sq(d.side) - sq(d.side - 2 * d.wallThickness)),
  },

  angle: {
    label: "Angle (L-profile)",
    fields: [
      { key: "leg", label: "Leg A" },
      { key: "legB", label: "Leg B (optional)", optional: true },
      { key: "thickness", label: "Thickness" },
      { key: "length", label: "Length" },
    ],
    constraints: [
      {
        field: "thickness",
        test: (d) => d.thickness < Math.min(d.leg, effectiveLegB(d)),
        message: (d) =>
          `Thickness must be less than the smaller leg (under ${formatNumber(Math.min(d.leg, effectiveLegB(d)))})`,
      },
    ],
    // Equal-leg when legB is absent: effectiveLegB falls back to leg, which
    // reduces this to the prior L * (2*leg*t - t^2) formula exactly.
    volume: (d) => d.length * ((d.leg + effectiveLegB(d) - d.thickness) * d.thickness),
  },
} as const satisfies Record<string, ShapeDef>;

export type ShapeId = keyof typeof SHAPES;

export const SHAPE_IDS = Object.keys(SHAPES) as ShapeId[];

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

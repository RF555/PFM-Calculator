import { parseDimension } from "./parse";
import type { ShapeId } from "./shapes";
import type { DimensionValues, MassUnit, Unit } from "./types";
import { formatAsFraction, inchToMm, mmToInch } from "./units";

export interface CalcState {
  materialId: string | null;
  gradeId: string | null;
  shapeId: ShapeId | null;
  unit: Unit;
  massUnit: MassUnit;
  quantity: number;
  /** Canonical millimetres. */
  dimensions: DimensionValues;
  /** Exactly what the user typed, per field. */
  raw: Record<string, string>;
  /** Translation keys for per-field errors, resolved by the view. */
  errors: Record<string, string>;
}

export type CalcAction =
  | { type: "SELECT_MATERIAL"; materialId: string }
  | { type: "SELECT_GRADE"; gradeId: string }
  | { type: "SELECT_SHAPE"; shapeId: ShapeId }
  | { type: "SET_UNIT"; unit: Unit }
  | { type: "SET_MASS_UNIT"; massUnit: MassUnit }
  | { type: "SET_DIMENSION"; key: string; raw: string }
  | { type: "SET_QUANTITY"; quantity: number }
  | { type: "RESET" };

export interface InitialOptions {
  defaultUnit: Unit;
  defaultMassUnit: MassUnit;
  defaultQuantity: number;
}

export function initialState(opts: InitialOptions): CalcState {
  return {
    materialId: null,
    gradeId: null,
    shapeId: null,
    unit: opts.defaultUnit,
    massUnit: opts.defaultMassUnit,
    quantity: clampQuantity(opts.defaultQuantity),
    dimensions: {},
    raw: {},
    errors: {},
  };
}

/**
 * Display string for a canonical millimetre value, in the active unit.
 * In inch mode a fraction is used only when exactly representable, so an
 * approximation is never shown as though it were exact.
 */
function toDisplay(mm: number, unit: Unit): string {
  if (unit === "mm") return String(mm);
  const inch = mmToInch(mm);
  return formatAsFraction(inch) ?? String(inch);
}

/** Canonical millimetres from a value entered in the active unit. */
const toCanonical = (value: number, unit: Unit): number =>
  unit === "mm" ? value : inchToMm(value);

/**
 * Whole pieces, at least one. Guards the non-finite cases too: a host may
 * pass any number as defaultQuantity, and Infinity would multiply through
 * to a meaningless total.
 */
function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

export function calcReducer(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case "SELECT_MATERIAL":
      // Grades belong to a material, so a material change invalidates the grade.
      return { ...state, materialId: action.materialId, gradeId: null };

    case "SELECT_GRADE":
      return { ...state, gradeId: action.gradeId };

    case "SELECT_SHAPE":
      // Field sets differ per shape, so previous values no longer apply.
      return { ...state, shapeId: action.shapeId, dimensions: {}, raw: {}, errors: {} };

    case "SET_UNIT": {
      if (action.unit === state.unit) return state;
      // Canonical millimetres are untouched; only the displayed strings are
      // re-projected. Writing a rounded display value back would corrupt data.
      const raw: Record<string, string> = {};
      for (const [key, mm] of Object.entries(state.dimensions)) {
        raw[key] = toDisplay(mm, action.unit);
      }
      return { ...state, unit: action.unit, raw, errors: {} };
    }

    case "SET_MASS_UNIT":
      return { ...state, massUnit: action.massUnit };

    case "SET_DIMENSION": {
      const result = parseDimension(action.raw);
      const raw = { ...state.raw, [action.key]: action.raw };
      const dimensions = { ...state.dimensions };
      const errors = { ...state.errors };

      if (result.ok) {
        dimensions[action.key] = toCanonical(result.value, state.unit);
        delete errors[action.key];
      } else if ("errorKey" in result) {
        // `"errorKey" in result` (rather than the `else` alone) keeps this
        // branch narrowed to the error variant under this project's tsconfig,
        // which has strictNullChecks off and loses discriminated-union
        // narrowing on a plain `else`.
        delete dimensions[action.key];
        if (result.errorKey) errors[action.key] = result.errorKey;
        else delete errors[action.key];
      }

      return { ...state, raw, dimensions, errors };
    }

    case "SET_QUANTITY":
      return { ...state, quantity: clampQuantity(action.quantity) };

    case "RESET":
      return initialState({
        defaultUnit: state.unit,
        defaultMassUnit: state.massUnit,
        defaultQuantity: 1,
      });

    default:
      return state;
  }
}

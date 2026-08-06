import { describe, expect, it } from "vitest";
import { calcReducer, initialState } from "../reducer";

const base = initialState({ defaultUnit: "mm", defaultMassUnit: "kg", defaultQuantity: 1 });

const withShape = calcReducer(base, { type: "SELECT_SHAPE", shapeId: "roundBar" });
const withDims = calcReducer(
  calcReducer(withShape, { type: "SET_DIMENSION", key: "diameter", raw: "50" }),
  { type: "SET_DIMENSION", key: "length", raw: "1000" }
);

describe("calcReducer", () => {
  it("starts with no material, shape or dimensions", () => {
    expect(base.materialId).toBeNull();
    expect(base.gradeId).toBeNull();
    expect(base.shapeId).toBeNull();
    expect(base.quantity).toBe(1);
  });

  it("clears the grade when the material changes", () => {
    const s = calcReducer(
      { ...base, materialId: "steel", gradeId: "steel.a36" },
      { type: "SELECT_MATERIAL", materialId: "aluminum" }
    );
    expect(s.materialId).toBe("aluminum");
    expect(s.gradeId).toBeNull();
  });

  it("clears dimensions when the shape changes", () => {
    const s = calcReducer(withDims, { type: "SELECT_SHAPE", shapeId: "squareBar" });
    expect(s.dimensions).toEqual({});
    expect(s.raw).toEqual({});
  });

  it("stores both the raw string and the parsed value", () => {
    expect(withDims.raw.diameter).toBe("50");
    expect(withDims.dimensions.diameter).toBe(50);
  });

  it("records a parse error key without storing a value", () => {
    const s = calcReducer(withShape, { type: "SET_DIMENSION", key: "diameter", raw: "abc" });
    expect(s.errors.diameter).toBe("error.notANumber");
    expect(s.dimensions.diameter).toBeUndefined();
  });

  it("converts dimensions when the unit changes", () => {
    const s = calcReducer(withDims, { type: "SET_UNIT", unit: "inch" });
    expect(s.unit).toBe("inch");
    // 50 mm = 1.9685 inch; canonical mm is unchanged
    expect(s.dimensions.diameter).toBeCloseTo(50, 10);
    expect(Number(s.raw.diameter)).toBeCloseTo(1.968503937, 6);
  });

  it("shows a fraction when the converted value is exact", () => {
    // 12.7 mm is exactly 1/2 inch
    const half = calcReducer(
      calcReducer(withShape, { type: "SET_DIMENSION", key: "diameter", raw: "12.7" }),
      { type: "SET_UNIT", unit: "inch" }
    );
    expect(half.raw.diameter).toBe("1/2");
  });

  it("shows a decimal when the converted value is not an exact fraction", () => {
    // 50 mm is 1.9685...", which is not a binary fraction
    const s = calcReducer(withDims, { type: "SET_UNIT", unit: "inch" });
    expect(s.raw.diameter).not.toContain("/");
  });

  it("does not corrupt values across repeated unit toggles", () => {
    let s = withDims;
    for (let i = 0; i < 10; i++) {
      s = calcReducer(s, { type: "SET_UNIT", unit: "inch" });
      s = calcReducer(s, { type: "SET_UNIT", unit: "mm" });
    }
    expect(s.dimensions.diameter).toBeCloseTo(50, 10);
  });

  it("clamps quantity to a minimum of 1", () => {
    expect(calcReducer(base, { type: "SET_QUANTITY", quantity: 0 }).quantity).toBe(1);
    expect(calcReducer(base, { type: "SET_QUANTITY", quantity: -5 }).quantity).toBe(1);
    expect(calcReducer(base, { type: "SET_QUANTITY", quantity: 25 }).quantity).toBe(25);
  });

  it("keeps quantity a whole finite number", () => {
    expect(calcReducer(base, { type: "SET_QUANTITY", quantity: 2.7 }).quantity).toBe(2);
    expect(calcReducer(base, { type: "SET_QUANTITY", quantity: NaN }).quantity).toBe(1);
    expect(calcReducer(base, { type: "SET_QUANTITY", quantity: Infinity }).quantity).toBe(1);
    expect(calcReducer(base, { type: "SET_QUANTITY", quantity: -Infinity }).quantity).toBe(1);
  });

  it("clamps a defaultQuantity supplied by the host", () => {
    const opts = { defaultUnit: "mm", defaultMassUnit: "kg" } as const;
    expect(initialState({ ...opts, defaultQuantity: Infinity }).quantity).toBe(1);
    expect(initialState({ ...opts, defaultQuantity: 0 }).quantity).toBe(1);
    expect(initialState({ ...opts, defaultQuantity: 4.9 }).quantity).toBe(4);
  });

  it("resets to the initial state", () => {
    const s = calcReducer(withDims, { type: "RESET" });
    expect(s.shapeId).toBeNull();
    expect(s.dimensions).toEqual({});
    expect(s.errors).toEqual({});
  });

  it("starts with no density override", () => {
    expect(base.densityOverride).toBeNull();
    expect(base.densityRaw).toBe("");
    expect(base.densityError).toBe("");
  });

  it("stores a valid density override with its raw text", () => {
    const s = calcReducer(base, { type: "SET_DENSITY", raw: "7800" });
    expect(s.densityOverride).toBe(7800);
    expect(s.densityRaw).toBe("7800");
    expect(s.densityError).toBe("");
  });

  // The raw text survives so the field does not blank out mid-keystroke; the
  // parsed value is dropped so no stale figure can drive a calculation.
  it("keeps the raw text but drops the value when the density is invalid", () => {
    const valid = calcReducer(base, { type: "SET_DENSITY", raw: "7800" });
    const s = calcReducer(valid, { type: "SET_DENSITY", raw: "99999" });
    expect(s.densityRaw).toBe("99999");
    expect(s.densityOverride).toBeNull();
    expect(s.densityError).toBe("error.densityRange");
  });

  // Regression: an emptied field used to be indistinguishable from "no
  // override", so the result silently fell back to the catalog density and
  // showed a weight derived from a figure the user had just deleted.
  it("marks an emptied field as cleared rather than as no override", () => {
    const s = calcReducer(
      calcReducer(base, { type: "SET_DENSITY", raw: "2700" }),
      { type: "SET_DENSITY", raw: "" }
    );
    expect(s.densityOverride).toBeNull();
    expect(s.densityCleared).toBe(true);
    // No error: clearing a field to retype is not a mistake to scold.
    expect(s.densityError).toBe("");
  });

  it("stops treating the field as cleared once a value parses again", () => {
    const s = calcReducer(
      calcReducer(base, { type: "SET_DENSITY", raw: "" }),
      { type: "SET_DENSITY", raw: "2700" }
    );
    expect(s.densityCleared).toBe(false);
    expect(s.densityOverride).toBe(2700);
  });

  it("does not mark an invalid entry as cleared", () => {
    const s = calcReducer(base, { type: "SET_DENSITY", raw: "99999" });
    expect(s.densityCleared).toBe(false);
    expect(s.densityError).toBe("error.densityRange");
  });

  it("clears the override", () => {
    const s = calcReducer(
      calcReducer(base, { type: "SET_DENSITY", raw: "7800" }),
      { type: "CLEAR_DENSITY" }
    );
    expect(s.densityOverride).toBeNull();
    expect(s.densityRaw).toBe("");
    expect(s.densityError).toBe("");
  });

  // An override belongs to one grade selection. Carrying it across would let a
  // user quote 316 stainless at aluminium's density without noticing.
  it("clears the override when the grade changes", () => {
    const s = calcReducer(
      calcReducer(base, { type: "SET_DENSITY", raw: "7800" }),
      { type: "SELECT_GRADE", gradeId: "steel.a36" }
    );
    expect(s.densityOverride).toBeNull();
    expect(s.densityRaw).toBe("");
  });

  it("clears the override when the material changes", () => {
    const s = calcReducer(
      calcReducer(base, { type: "SET_DENSITY", raw: "7800" }),
      { type: "SELECT_MATERIAL", materialId: "aluminum" }
    );
    expect(s.densityOverride).toBeNull();
    expect(s.densityRaw).toBe("");
  });

  it("clears the override on reset", () => {
    const s = calcReducer(
      calcReducer(withDims, { type: "SET_DENSITY", raw: "7800" }),
      { type: "RESET" }
    );
    expect(s.densityOverride).toBeNull();
    expect(s.densityRaw).toBe("");
    expect(s.densityError).toBe("");
  });
});

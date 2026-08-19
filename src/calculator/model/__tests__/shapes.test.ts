import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { ShapeIcon } from "../../atoms/ShapeIcon";
import { SHAPES, SHAPE_IDS, checkConstraints, volumeMm3 } from "../shapes";
import type { ShapeId } from "../shapes";
import type { DimensionValues } from "../types";
import { weightKg } from "../calculate";
import { STRINGS } from "../../i18n/strings";

const STEEL = 7850;
const ALL = Object.keys(SHAPES) as Array<keyof typeof SHAPES>;

/**
 * The callout letters a shape's annotated sketch actually paints, read out of
 * the rendered SVG rather than from the source, so the check covers what
 * ships. Anchored on the `iso` variant with hints, which is what sits beside
 * the dimension fields.
 */
function calloutLetters(id: ShapeId): string[] {
  const { container } = render(
    createElement(ShapeIcon, { shapeId: id, variant: "iso", hints: true })
  );
  const letters = [...container.querySelectorAll("[data-hint] text")].map(
    (n) => n.textContent ?? ""
  );
  cleanup();
  return letters;
}

describe("registry completeness", () => {
  it("covers the ten supported shapes", () => {
    expect(ALL).toHaveLength(10);
  });

  it.each(ALL)("%s declares a labelKey, fields and a volume function", (id) => {
    const s = SHAPES[id];
    expect(s.labelKey.length).toBeGreaterThan(0);
    expect(s.fields.length).toBeGreaterThan(0);
    expect(typeof s.volume).toBe("function");
  });

  it("every shape label key exists in both dictionaries", () => {
    for (const id of SHAPE_IDS) {
      const key = SHAPES[id].labelKey;
      expect(STRINGS.en[key], `en missing ${key}`).toBeTruthy();
      expect(STRINGS.he[key], `he missing ${key}`).toBeTruthy();
    }
  });

  it("every dimension field label key exists in both dictionaries", () => {
    for (const id of SHAPE_IDS) {
      for (const field of SHAPES[id].fields) {
        expect(STRINGS.en[field.labelKey], `en missing ${field.labelKey}`).toBeTruthy();
        expect(STRINGS.he[field.labelKey], `he missing ${field.labelKey}`).toBeTruthy();
      }
    }
  });

  it("every dimension field carries a sketch notation", () => {
    for (const id of SHAPE_IDS) {
      for (const field of SHAPES[id].fields) {
        expect(field.notation, `${id}.${field.key} has no notation`).toBeTruthy();
      }
    }
  });

  // A field's notation is only useful if the same letter is actually drawn on
  // that shape's sketch — the letter is what ties the two together, so a field
  // labelled "W" whose drawing never marks W sends the user hunting. Guards
  // both directions: a field with no callout, and a callout for no field.
  it("field notations match the letters drawn on each sketch", () => {
    for (const id of SHAPE_IDS) {
      const fields = SHAPES[id].fields.map((f) => f.notation).sort();
      expect(calloutLetters(id).sort(), `${id} sketch/field letters differ`)
        .toEqual(fields);
    }
  });
});

describe("volumes match reference values", () => {
  it.each([
    ["sheet", { length: 100, width: 50, thickness: 10 }, 0.3925],
    ["roundBar", { diameter: 50, length: 1000 }, 15.4134],
    ["squareBar", { side: 50, length: 1000 }, 19.625],
    ["flatBar", { width: 50, thickness: 10, length: 1000 }, 3.925],
    ["hexBar", { flatToFlat: 50, length: 1000 }, 16.9957],
    ["roundTubeOuter", { outerDiameter: 50, wallThickness: 5, length: 1000 }, 5.5488],
    ["roundTubeInner", { innerDiameter: 40, wallThickness: 5, length: 1000 }, 5.5488],
    ["rectangularHollow", { width: 50, height: 30, wallThickness: 5, length: 1000 }, 5.495],
    ["squareHollow", { side: 50, wallThickness: 5, length: 1000 }, 7.065],
    ["angle", { leg: 50, thickness: 5, length: 1000 }, 3.7288],
  ] as const)("%s weighs %f kg in steel", (id, dims, kg) => {
    expect(weightKg(volumeMm3(id, dims), STEEL)).toBeCloseTo(kg, 3);
  });
});

describe("angle supports unequal legs", () => {
  it("equal-leg reference value is unchanged (leg=50, t=5, L=1000)", () => {
    const kg = weightKg(volumeMm3("angle", { leg: 50, thickness: 5, length: 1000 }), STEEL);
    expect(kg).toBeCloseTo(3.7288, 3);
  });

  it("100x75x10 over 1000mm weighs 12.953 kg — verified independently: "
    + "L*((a+b-t)*t) = 1000*((100+75-10)*10) = 1,650,000 mm^3, "
    + "*7850/1e9 = 12.9525 kg", () => {
    const kg = weightKg(
      volumeMm3("angle", { leg: 100, legB: 75, thickness: 10, length: 1000 }),
      STEEL
    );
    expect(kg).toBeCloseTo(12.953, 2);
  });

  it("a blank legB calculates identically to equal-leg (no legB key present)", () => {
    const withLegB = volumeMm3("angle", { leg: 50, legB: 50, thickness: 5, length: 1000 });
    const withoutLegB = volumeMm3("angle", { leg: 50, thickness: 5, length: 1000 });
    expect(withLegB).toBeCloseTo(withoutLegB, 9);
  });

  it("a non-finite legB (e.g. NaN from a cleared field) falls back to leg", () => {
    const withNaN = volumeMm3("angle", { leg: 50, legB: NaN, thickness: 5, length: 1000 });
    const withoutLegB = volumeMm3("angle", { leg: 50, thickness: 5, length: 1000 });
    expect(withNaN).toBeCloseTo(withoutLegB, 9);
  });

  it("legB is optional and does not block constraint checking when absent", () => {
    expect(
      checkConstraints("angle", { leg: 50, thickness: 5, length: 1000 })
    ).toHaveLength(0);
  });

  it("constraint fires when thickness >= the smaller leg (unequal legs)", () => {
    const violations = checkConstraints("angle", {
      leg: 100, legB: 75, thickness: 75, length: 1000,
    });
    expect(violations.map((v) => v.field)).toContain("thickness");
  });

  it("constraint message states the smaller leg's limit, not leg A's", () => {
    const [v] = checkConstraints("angle", {
      leg: 100, legB: 75, thickness: 80, length: 1000,
    });
    // Canonical millimetres, unformatted: the view converts to the active unit
    // and labels it, since the model has no idea which unit is on screen.
    expect(v.message.params).toEqual({ max: 75 });
  });

  it("unequal-leg geometry within limits passes the constraint", () => {
    expect(
      checkConstraints("angle", { leg: 100, legB: 75, thickness: 10, length: 1000 })
    ).toHaveLength(0);
  });
});

describe("hex bar against the industry steel formula", () => {
  // Standard: kg per metre = 0.006798 * F^2, F in mm across flats, steel 7850 kg/m^3.
  // An external reference, so a regression cannot hide behind a matching
  // internal expected value.
  it.each([25, 50, 75])("matches 0.006798*F^2 for F=%i", (F) => {
    const kg = weightKg(volumeMm3("hexBar", { flatToFlat: F, length: 1000 }), STEEL);
    expect(kg).toBeCloseTo(0.006798 * F * F, 2);
  });
});

describe("constraints reject impossible geometry", () => {
  it.each([
    ["squareHollow", { side: 50, wallThickness: 25, length: 1000 }, "wallThickness"],
    ["squareHollow", { side: 50, wallThickness: 30, length: 1000 }, "wallThickness"],
    ["roundTubeOuter", { outerDiameter: 50, wallThickness: 25, length: 1000 }, "wallThickness"],
    ["rectangularHollow", { width: 50, height: 30, wallThickness: 15, length: 1000 }, "wallThickness"],
    ["angle", { leg: 50, thickness: 50, length: 1000 }, "thickness"],
  ] as const)("%s rejects %o on %s", (id, dims, field) => {
    const violations = checkConstraints(id, dims);
    expect(violations.map((v) => v.field)).toContain(field);
  });

  it.each([
    ["squareHollow", { side: 50, wallThickness: 5, length: 1000 }],
    ["roundTubeOuter", { outerDiameter: 50, wallThickness: 5, length: 1000 }],
    ["angle", { leg: 50, thickness: 5, length: 1000 }],
  ] as const)("%s accepts valid geometry", (id, dims) => {
    expect(checkConstraints(id, dims)).toHaveLength(0);
  });

  it("round tube by inner diameter has no upper wall bound", () => {
    expect(
      checkConstraints("roundTubeInner", {
        innerDiameter: 20, wallThickness: 100, length: 1000,
      })
    ).toHaveLength(0);
  });

  it("returns a translatable message for a violated constraint", () => {
    const violations = checkConstraints("squareHollow", {
      side: 50, wallThickness: 30, length: 1000,
    });
    expect(violations).toHaveLength(1);
    expect(violations[0].field).toBe("wallThickness");
    expect(violations[0].message.key).toBe("constraint.wallHalfSide");
    expect(violations[0].message.params).toEqual({ max: 25 });
  });

  it("every constraint message key exists in both dictionaries", () => {
    // Values chosen to violate every constraint in the registry.
    const cases: Array<[ShapeId, DimensionValues]> = [
      ["roundTubeOuter", { outerDiameter: 50, wallThickness: 30, length: 100 }],
      ["rectangularHollow", { width: 50, height: 40, wallThickness: 30, length: 100 }],
      ["squareHollow", { side: 50, wallThickness: 30, length: 100 }],
      ["angle", { leg: 50, thickness: 60, length: 100 }],
    ];
    for (const [id, dims] of cases) {
      const violations = checkConstraints(id, dims);
      expect(violations.length, `${id} produced no violation`).toBeGreaterThan(0);
      for (const v of violations) {
        expect(STRINGS.en[v.message.key], `en missing ${v.message.key}`).toBeTruthy();
        expect(STRINGS.he[v.message.key], `he missing ${v.message.key}`).toBeTruthy();
      }
    }
  });
});

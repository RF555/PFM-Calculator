import { describe, expect, it } from "vitest";
import { SHAPES, checkConstraints, volumeMm3 } from "../shapes";
import { weightKg } from "../calculate";

const STEEL = 7850;
const ALL = Object.keys(SHAPES) as Array<keyof typeof SHAPES>;

describe("registry completeness", () => {
  it("covers the ten supported shapes", () => {
    expect(ALL).toHaveLength(10);
  });

  it.each(ALL)("%s declares a label, fields and a volume function", (id) => {
    const s = SHAPES[id];
    expect(s.label.length).toBeGreaterThan(0);
    expect(s.fields.length).toBeGreaterThan(0);
    expect(typeof s.volume).toBe("function");
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

  it("constraint messages state the actual limit", () => {
    const [v] = checkConstraints("squareHollow", {
      side: 50, wallThickness: 30, length: 1000,
    });
    expect(v.message).toContain("25");
  });
});

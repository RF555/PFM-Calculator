import { describe, expect, it } from "vitest";
import materials from "../../data/materials.json";
import { validateMaterials } from "../schema";

describe("bundled materials data", () => {
  it("passes validation", () => {
    expect(() => validateMaterials(materials)).not.toThrow();
  });

  it("has globally unique grade ids", () => {
    const ids = materials.materials.flatMap((m) => m.grades.map((g) => g.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("validateMaterials", () => {
  const valid = {
    version: 1,
    materials: [
      { id: "steel", name: "Steel",
        grades: [{ id: "steel.a36", name: "A36", density: 7850 }] },
    ],
  };

  it("accepts a well-formed file", () => {
    expect(() => validateMaterials(valid)).not.toThrow();
  });

  it("rejects a material with no grades", () => {
    const bad = { version: 1, materials: [{ id: "x", name: "X", grades: [] }] };
    expect(() => validateMaterials(bad)).toThrow(/at least one grade/);
  });

  it("rejects duplicate grade ids", () => {
    const bad = {
      version: 1,
      materials: [
        { id: "a", name: "A", grades: [{ id: "dup", name: "1", density: 1000 }] },
        { id: "b", name: "B", grades: [{ id: "dup", name: "2", density: 2000 }] },
      ],
    };
    expect(() => validateMaterials(bad)).toThrow(/duplicate grade id/i);
  });

  it("rejects a non-positive density", () => {
    const bad = {
      version: 1,
      materials: [
        { id: "a", name: "A", grades: [{ id: "a.x", name: "X", density: 0 }] },
      ],
    };
    expect(() => validateMaterials(bad)).toThrow(/density/i);
  });
});

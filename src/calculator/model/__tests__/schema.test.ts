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

  it("bundled materials.json is valid v2 data", () => {
    const file = validateMaterials(materials);
    expect(file.version).toBe(2);
    expect(file.materials.length).toBeGreaterThan(0);
  });

  it("every bundled name has both locales filled", () => {
    const file = validateMaterials(materials);
    for (const m of file.materials) {
      expect(m.name.he, `${m.id}.he`).toBeTruthy();
      expect(m.name.en, `${m.id}.en`).toBeTruthy();
      for (const g of m.grades) {
        expect(g.name.he, `${g.id}.he`).toBeTruthy();
        expect(g.name.en, `${g.id}.en`).toBeTruthy();
      }
    }
  });
});

describe("validateMaterials", () => {
  const valid = {
    version: 2,
    materials: [
      { id: "steel", name: { he: "פלדה", en: "Steel" },
        grades: [{ id: "steel.a36", name: { he: "א36", en: "A36" }, density: 7850 }] },
    ],
  };

  it("accepts a well-formed file", () => {
    expect(() => validateMaterials(valid)).not.toThrow();
  });

  it("rejects a material with no grades", () => {
    const bad = { version: 2, materials: [{ id: "x", name: { he: "X", en: "X" }, grades: [] }] };
    expect(() => validateMaterials(bad)).toThrow(/at least one grade/);
  });

  it("rejects duplicate grade ids", () => {
    const bad = {
      version: 2,
      materials: [
        { id: "a", name: { he: "א", en: "A" }, grades: [{ id: "dup", name: { he: "1", en: "1" }, density: 1000 }] },
        { id: "b", name: { he: "ב", en: "B" }, grades: [{ id: "dup", name: { he: "2", en: "2" }, density: 2000 }] },
      ],
    };
    expect(() => validateMaterials(bad)).toThrow(/duplicate grade id/i);
  });

  it("rejects a non-positive density", () => {
    const bad = {
      version: 2,
      materials: [
        { id: "a", name: { he: "א", en: "A" }, grades: [{ id: "a.x", name: { he: "X", en: "X" }, density: 0 }] },
      ],
    };
    expect(() => validateMaterials(bad)).toThrow(/density/i);
  });

  it("rejects a plain-string material name", () => {
    expect(() =>
      validateMaterials({
        version: 2,
        materials: [
          { id: "steel", name: "Steel",
            grades: [{ id: "steel.a", name: { he: "א", en: "A" }, density: 7850 }] },
        ],
      })
    ).toThrow(/steel.*name.*he.*en/i);
  });

  it("rejects a name missing the he locale", () => {
    expect(() =>
      validateMaterials({
        version: 2,
        materials: [
          { id: "steel", name: { en: "Steel" },
            grades: [{ id: "steel.a", name: { he: "א", en: "A" }, density: 7850 }] },
        ],
      })
    ).toThrow(/steel/);
  });

  it("rejects an empty translation", () => {
    expect(() =>
      validateMaterials({
        version: 2,
        materials: [
          { id: "steel", name: { he: "", en: "Steel" },
            grades: [{ id: "steel.a", name: { he: "א", en: "A" }, density: 7850 }] },
        ],
      })
    ).toThrow(/steel/);
  });

  it("rejects a plain-string grade name", () => {
    expect(() =>
      validateMaterials({
        version: 2,
        materials: [
          { id: "steel", name: { he: "פלדה", en: "Steel" },
            grades: [{ id: "steel.a", name: "A", density: 7850 }] },
        ],
      })
    ).toThrow(/steel\.a/);
  });

  it("accepts a well-formed v2 file", () => {
    const file = validateMaterials({
      version: 2,
      materials: [
        { id: "steel", name: { he: "פלדה", en: "Steel" },
          grades: [{ id: "steel.a", name: { he: "פלדת פחמן", en: "Carbon Steel" }, density: 7850 }] },
      ],
    });
    expect(file.materials[0].name.he).toBe("פלדה");
  });
});

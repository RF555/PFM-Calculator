import { describe, expect, it } from "vitest";
import { calculateVolume, calculateWeight } from "@/utils/calculations";

const STEEL = 7850;

/** volumeM3 expected for each shape, dimensions in mm. */
const CASES: Array<{
  name: string;
  shape: Parameters<typeof calculateVolume>[0];
  dims: Record<string, number>;
  volumeM3: number;
  kg: number;
}> = [
  { name: "sheet 100x50x10", shape: "sheet",
    dims: { length: 100, width: 50, thickness: 10 },
    volumeM3: 5.0e-5, kg: 0.3925 },
  { name: "roundBar d50 L1000", shape: "roundBar",
    dims: { diameter: 50, length: 1000 },
    volumeM3: 1.963495e-3, kg: 15.4134 },
  { name: "squareBar a50 L1000", shape: "squareBar",
    dims: { side: 50, length: 1000 },
    volumeM3: 2.5e-3, kg: 19.625 },
  { name: "flatBar w50 t10 L1000", shape: "flatBar",
    dims: { width: 50, thickness: 10, length: 1000 },
    volumeM3: 5.0e-4, kg: 3.925 },
  // Across-flats F=50. Area = (sqrt(3)/2)*F^2. Cross-checked: 0.006798*50^2 = 16.995 kg/m
  { name: "hexBar F50 L1000", shape: "hexBar",
    dims: { flatToFlat: 50, length: 1000 },
    volumeM3: 2.165064e-3, kg: 16.9957 },
  { name: "roundTubeOuter OD50 t5 L1000", shape: "roundTubeOuter",
    dims: { outerDiameter: 50, wallThickness: 5, length: 1000 },
    volumeM3: 7.068583e-4, kg: 5.5488 },
  { name: "roundTubeInner ID40 t5 L1000", shape: "roundTubeInner",
    dims: { innerDiameter: 40, wallThickness: 5, length: 1000 },
    volumeM3: 7.068583e-4, kg: 5.5488 },
  { name: "rectangularHollow W50 H30 t5 L1000", shape: "rectangularHollow",
    dims: { width: 50, height: 30, wallThickness: 5, length: 1000 },
    volumeM3: 7.0e-4, kg: 5.495 },
  { name: "squareHollow a50 t5 L1000", shape: "squareHollow",
    dims: { side: 50, wallThickness: 5, length: 1000 },
    volumeM3: 9.0e-4, kg: 7.065 },
  { name: "angle leg50 t5 L1000", shape: "angle",
    dims: { leg: 50, thickness: 5, length: 1000 },
    volumeM3: 4.75e-4, kg: 3.7288 },
];

describe("shape volumes against reference values", () => {
  for (const c of CASES) {
    it(`${c.name} volume`, () => {
      const v = calculateVolume(c.shape, c.dims, "mm");
      expect(v).toBeCloseTo(c.volumeM3, 9);
    });

    it(`${c.name} weight in steel`, () => {
      const v = calculateVolume(c.shape, c.dims, "mm");
      const { weightKg } = calculateWeight(v, STEEL);
      expect(weightKg).toBeCloseTo(c.kg, 3);
    });
  }
});

describe("hex bar against the industry steel formula", () => {
  // Standard: kg per metre = 0.006798 * F^2, F in mm, steel 7850 kg/m^3
  it.each([25, 50, 75])("matches 0.006798*F^2 for F=%i", (F) => {
    const v = calculateVolume("hexBar", { flatToFlat: F, length: 1000 }, "mm");
    const { weightKg } = calculateWeight(v, STEEL);
    expect(weightKg).toBeCloseTo(0.006798 * F * F, 2);
  });
});

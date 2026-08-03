const MM3_PER_M3 = 1e9;
const CM3_PER_M3 = 1e6;

/** Mass in kilograms from cubic millimetres and kg/m³. */
export function weightKg(volumeMm3Value: number, densityKgPerM3: number): number {
  return (volumeMm3Value / MM3_PER_M3) * densityKgPerM3;
}

export const mm3ToM3 = (v: number): number => v / MM3_PER_M3;
export const m3ToCm3 = (v: number): number => v * CM3_PER_M3;

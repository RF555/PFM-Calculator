import { ShapeType, Unit } from "@/types/calculator";

const MM_TO_M = 0.001;
const INCH_TO_M = 0.0254;
const KG_TO_LBS = 2.20462;

export const convertToMeters = (value: number, unit: Unit): number => {
  return unit === "mm" ? value * MM_TO_M : value * INCH_TO_M;
};

export const calculateVolume = (
  shape: ShapeType,
  dimensions: Record<string, number>,
  unit: Unit
): number => {
  // Convert all dimensions to meters
  const convert = (key: string) => convertToMeters(dimensions[key] || 0, unit);

  switch (shape) {
    case "sheet": {
      // L × W × T
      const l = convert("length");
      const w = convert("width");
      const t = convert("thickness");
      return l * w * t;
    }

    case "roundBar": {
      // π × (D/2)² × L
      const d = convert("diameter");
      const l = convert("length");
      return Math.PI * Math.pow(d / 2, 2) * l;
    }

    case "squareBar": {
      // a² × L
      const a = convert("side");
      const l = convert("length");
      return a * a * l;
    }

    case "flatBar": {
      // W × T × L
      const w = convert("width");
      const t = convert("thickness");
      const l = convert("length");
      return w * t * l;
    }

    case "hexBar": {
      // Regular hexagon by across-flats distance F: side = F/sqrt(3),
      // so area = (3*sqrt(3)/2) * (F/sqrt(3))^2 = (sqrt(3)/2) * F^2.
      const f = convert("flatToFlat");
      const l = convert("length");
      return (Math.sqrt(3) / 2) * f * f * l;
    }

    case "roundTubeOuter": {
      // π × L × [(Do/2)² − (Do/2 − t)²]
      const dO = convert("outerDiameter");
      const t = convert("wallThickness");
      const l = convert("length");
      return Math.PI * l * (Math.pow(dO / 2, 2) - Math.pow(dO / 2 - t, 2));
    }

    case "roundTubeInner": {
      // π × L × [(Di/2 + t)² − (Di/2)²]
      const dI = convert("innerDiameter");
      const t = convert("wallThickness");
      const l = convert("length");
      return Math.PI * l * (Math.pow(dI / 2 + t, 2) - Math.pow(dI / 2, 2));
    }

    case "rectangularHollow": {
      // L × [(W × H) − ((W − 2t) × (H − 2t))]
      const w = convert("width");
      const h = convert("height");
      const t = convert("wallThickness");
      const l = convert("length");
      return l * (w * h - (w - 2 * t) * (h - 2 * t));
    }

    case "squareHollow": {
      // L × [a² − (a − 2t)²]
      const a = convert("side");
      const t = convert("wallThickness");
      const l = convert("length");
      return l * (a * a - Math.pow(a - 2 * t, 2));
    }

    case "angle": {
      // L × [2 × b × t − t²]
      const b = convert("leg");
      const t = convert("thickness");
      const l = convert("length");
      return l * (2 * b * t - t * t);
    }

    default:
      return 0;
  }
};

export const calculateWeight = (volumeM3: number, densityKgPerM3: number) => {
  const weightKg = volumeM3 * densityKgPerM3;
  const weightLbs = weightKg * KG_TO_LBS;
  const volumeCm3 = volumeM3 * 1000000;

  return {
    volumeCm3,
    volumeM3,
    weightKg,
    weightLbs,
  };
};

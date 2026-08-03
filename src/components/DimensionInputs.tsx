import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShapeType } from "@/types/calculator";

interface DimensionInputsProps {
  shape: ShapeType;
  dimensions: Record<string, number>;
  onDimensionsChange: (dimensions: Record<string, number>) => void;
}

interface DimensionField {
  key: string;
  label: string;
  placeholder: string;
}

const dimensionFields: Record<ShapeType, DimensionField[]> = {
  sheet: [
    { key: "length", label: "Length", placeholder: "Enter length" },
    { key: "width", label: "Width", placeholder: "Enter width" },
    { key: "thickness", label: "Thickness", placeholder: "Enter thickness" },
  ],
  roundBar: [
    { key: "diameter", label: "Diameter", placeholder: "Enter diameter" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
  squareBar: [
    { key: "side", label: "Side", placeholder: "Enter side length" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
  flatBar: [
    { key: "width", label: "Width", placeholder: "Enter width" },
    { key: "thickness", label: "Thickness", placeholder: "Enter thickness" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
  hexBar: [
    { key: "flatToFlat", label: "Flat-to-Flat", placeholder: "Enter flat-to-flat distance" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
  roundTubeOuter: [
    { key: "outerDiameter", label: "Outer Diameter", placeholder: "Enter outer diameter" },
    { key: "wallThickness", label: "Wall Thickness", placeholder: "Enter wall thickness" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
  roundTubeInner: [
    { key: "innerDiameter", label: "Inner Diameter", placeholder: "Enter inner diameter" },
    { key: "wallThickness", label: "Wall Thickness", placeholder: "Enter wall thickness" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
  rectangularHollow: [
    { key: "width", label: "Width", placeholder: "Enter width" },
    { key: "height", label: "Height", placeholder: "Enter height" },
    { key: "wallThickness", label: "Wall Thickness", placeholder: "Enter wall thickness" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
  squareHollow: [
    { key: "side", label: "Side", placeholder: "Enter side length" },
    { key: "wallThickness", label: "Wall Thickness", placeholder: "Enter wall thickness" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
  angle: [
    { key: "leg", label: "Leg Length", placeholder: "Enter leg length" },
    { key: "thickness", label: "Thickness", placeholder: "Enter thickness" },
    { key: "length", label: "Length", placeholder: "Enter length" },
  ],
};

const DimensionInputs = ({
  shape,
  dimensions,
  onDimensionsChange,
}: DimensionInputsProps) => {
  const fields = dimensionFields[shape];

  const handleChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onDimensionsChange({
      ...dimensions,
      [key]: numValue,
    });
  };

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={field.key} className="text-xs font-medium text-muted-foreground">
            {field.label}
          </Label>
          <Input
            id={field.key}
            type="number"
            step="0.01"
            min="0"
            placeholder={field.placeholder}
            value={dimensions[field.key] || ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};

export default DimensionInputs;

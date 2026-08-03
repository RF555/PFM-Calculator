import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShapeType } from "@/types/calculator";

interface ShapeSelectorProps {
  selectedShape: ShapeType | null;
  onShapeChange: (shape: ShapeType) => void;
}

const shapes: { value: ShapeType; label: string }[] = [
  { value: "sheet", label: "Sheet / Plate" },
  { value: "roundBar", label: "Round Bar" },
  { value: "squareBar", label: "Square Bar" },
  { value: "flatBar", label: "Flat Bar" },
  { value: "hexBar", label: "Hexagonal Bar" },
  { value: "roundTubeOuter", label: "Round Tube (Outer Ø + Wall)" },
  { value: "roundTubeInner", label: "Round Tube (Inner Ø + Wall)" },
  { value: "rectangularHollow", label: "Rectangular Hollow Section" },
  { value: "squareHollow", label: "Square Hollow Section" },
  { value: "angle", label: "Angle (L-profile)" },
];

const ShapeSelector = ({ selectedShape, onShapeChange }: ShapeSelectorProps) => {
  return (
    <Select
      value={selectedShape || ""}
      onValueChange={(value) => onShapeChange(value as ShapeType)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select shape" />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        {shapes.map((shape) => (
          <SelectItem key={shape.value} value={shape.value}>
            {shape.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ShapeSelector;

import { Button } from "@/components/ui/button";
import { Unit } from "@/types/calculator";

interface UnitToggleProps {
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
}

const UnitToggle = ({ unit, onUnitChange }: UnitToggleProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={unit === "mm" ? "default" : "ghost"}
        size="sm"
        onClick={() => onUnitChange("mm")}
        className="px-4"
      >
        mm
      </Button>
      <Button
        variant={unit === "inch" ? "default" : "ghost"}
        size="sm"
        onClick={() => onUnitChange("inch")}
        className="px-4"
      >
        inch
      </Button>
    </div>
  );
};

export default UnitToggle;

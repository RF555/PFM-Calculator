import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Material } from "@/types/calculator";

interface MaterialSelectorProps {
  materials: Material[];
  selectedMaterial: Material | null;
  selectedSubtype: number;
  onMaterialChange: (material: Material) => void;
  onSubtypeChange: (subtypeIndex: number) => void;
}

const MaterialSelector = ({
  materials,
  selectedMaterial,
  selectedSubtype,
  onMaterialChange,
  onSubtypeChange,
}: MaterialSelectorProps) => {
  return (
    <div className="space-y-3">
      <Select
        value={selectedMaterial?.name || ""}
        onValueChange={(value) => {
          const material = materials.find((m) => m.name === value);
          if (material) onMaterialChange(material);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select material" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {materials.map((material) => (
            <SelectItem key={material.name} value={material.name}>
              {material.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedMaterial && (
        <Select
          value={selectedSubtype.toString()}
          onValueChange={(value) => onSubtypeChange(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${selectedMaterial.name} grade`} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {selectedMaterial.subtypes.length === 0 ? (
              <SelectItem value="-1">Standard ({selectedMaterial.density} kg/m³)</SelectItem>
            ) : (
              selectedMaterial.subtypes.map((subtype, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {subtype.name} ({subtype.density} kg/m³)
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default MaterialSelector;



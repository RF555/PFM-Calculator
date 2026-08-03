import type { Material } from "../model/schema";
import { Combobox } from "./Combobox";

interface Props {
  materials: Material[];
  value: string | null;
  onChange: (materialId: string) => void;
}

export function MaterialCombobox({ materials, value, onChange }: Props) {
  return (
    <Combobox
      id="pfm-material"
      label="Material"
      placeholder="Select material"
      options={materials.map((m) => ({ value: m.id, label: m.name }))}
      value={value}
      onChange={onChange}
    />
  );
}

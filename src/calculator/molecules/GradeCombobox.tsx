import type { Material } from "../model/schema";
import { Combobox } from "./Combobox";

interface Props {
  material: Material | null;
  value: string | null;
  onChange: (gradeId: string) => void;
}

export function GradeCombobox({ material, value, onChange }: Props) {
  return (
    <Combobox
      id="pfm-grade"
      label="Grade"
      placeholder="Select grade"
      options={
        material?.grades.map((g) => ({
          value: g.id,
          label: `${g.name} (${g.density} kg/m³)`,
        })) ?? []
      }
      value={value}
      onChange={onChange}
      disabled={!material}
      disabledHint="Select a material first"
    />
  );
}

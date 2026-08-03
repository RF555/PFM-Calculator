import type { Material } from "../model/schema";
import { Combobox } from "./Combobox";

interface Props {
  idPrefix: string;
  material: Material | null;
  value: string | null;
  onChange: (gradeId: string) => void;
}

export function GradeCombobox({ idPrefix, material, value, onChange }: Props) {
  return (
    <Combobox
      id={`${idPrefix}-grade`}
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

import { SHAPES, SHAPE_IDS, type ShapeId } from "../model/shapes";
import { Combobox } from "./Combobox";

interface Props {
  idPrefix: string;
  value: ShapeId | null;
  onChange: (shapeId: ShapeId) => void;
}

export function ShapeCombobox({ idPrefix, value, onChange }: Props) {
  return (
    <Combobox
      id={`${idPrefix}-shape`}
      label="Shape"
      placeholder="Select shape"
      options={SHAPE_IDS.map((id) => ({ value: id, label: SHAPES[id].label }))}
      value={value}
      onChange={(v) => onChange(v as ShapeId)}
    />
  );
}

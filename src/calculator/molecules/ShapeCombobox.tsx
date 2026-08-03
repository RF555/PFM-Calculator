import { SHAPES, SHAPE_IDS, type ShapeId } from "../model/shapes";
import { Combobox } from "./Combobox";

interface Props {
  value: ShapeId | null;
  onChange: (shapeId: ShapeId) => void;
}

export function ShapeCombobox({ value, onChange }: Props) {
  return (
    <Combobox
      id="pfm-shape"
      label="Shape"
      placeholder="Select shape"
      options={SHAPE_IDS.map((id) => ({ value: id, label: SHAPES[id].label }))}
      value={value}
      onChange={(v) => onChange(v as ShapeId)}
    />
  );
}

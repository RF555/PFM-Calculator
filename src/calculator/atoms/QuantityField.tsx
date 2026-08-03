import { FieldLabel } from "./FieldLabel";
import "./QuantityField.css";

interface QuantityFieldProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN = 1;

export function QuantityField({ value, onChange }: QuantityFieldProps) {
  function onInput(raw: string) {
    if (raw === "") return;
    if (!/^\d+$/.test(raw)) return;
    onChange(Math.max(MIN, Number(raw)));
  }

  return (
    <div className="pfm-quantity">
      <FieldLabel htmlFor="pfm-quantity">Quantity</FieldLabel>
      <div className="pfm-quantity__row">
        <button
          type="button"
          className="pfm-quantity__step"
          aria-label="Decrease quantity"
          disabled={value <= MIN}
          onClick={() => onChange(Math.max(MIN, value - 1))}
        >
          −
        </button>
        <input
          id="pfm-quantity"
          className="pfm-input pfm-quantity__input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={String(value)}
          onChange={(e) => onInput(e.target.value)}
        />
        <button
          type="button"
          className="pfm-quantity__step"
          aria-label="Increase quantity"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

import { FieldError } from "./FieldError";
import { FieldLabel } from "./FieldLabel";
import "./NumberField.css";
import "./FieldError.css";

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (raw: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
}

/**
 * Text input rather than type="number": per the HTML spec, number inputs
 * return "" for unparseable content, so fraction entry such as "1 1/2"
 * would be invisible to the parser. inputmode keeps the mobile numeric pad.
 */
export function NumberField({
  id, label, value, onChange, onBlur, error, hint,
}: NumberFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="pfm-number-field">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        className="pfm-input"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={hint}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

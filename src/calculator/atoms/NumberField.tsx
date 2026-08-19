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
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  /**
   * Letter marking this dimension on the shape sketch, e.g. "OD". Rendered
   * as a badge before the label text, which is what ties the drawing to the
   * fields without a separate legend.
   */
  notation?: string;
}

/**
 * Text input rather than type="number": per the HTML spec, number inputs
 * return "" for unparseable content, so fraction entry such as "1 1/2"
 * would be invisible to the parser. inputmode keeps the mobile numeric pad.
 */
export function NumberField({
  id, label, value, onChange, onBlur, onKeyDown, error, hint, notation,
}: NumberFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="pfm-number-field">
      {/*
        The notation chip sits beside the label rather than inside it: text
        within the <label> becomes part of the input's accessible name, and
        "D Diameter (mm)" is both wrong and noisier than the name it replaces.
        Kept aria-hidden for the same reason — the letter is a pointer into
        the sketch, which is itself decorative.
      */}
      <div className="pfm-label-row">
        {notation && (
          <span className="pfm-label__notation" dir="ltr" aria-hidden="true">
            {notation}
          </span>
        )}
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      </div>
      <input
        id={id}
        className="pfm-input"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        /* Content is numeric whatever the interface language. Left to inherit
           rtl, a mixed fraction reorders visually — "1 1/2" paints as "1/21" —
           because the space splits it into two bidi runs. */
        dir="ltr"
        value={value}
        placeholder={hint}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

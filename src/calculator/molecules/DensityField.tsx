import { useEffect, useRef, useState } from "react";
import { FieldLabel } from "../atoms/FieldLabel";
import { NumberField } from "../atoms/NumberField";
import { useTranslate } from "../i18n/LanguageContext";
import "./DensityField.css";

export interface DensityFieldProps {
  idPrefix: string;
  /** Identity of the selected grade, or null when none is selected. Drives
   *  the re-seed effect: the reducer clears any override on every grade
   *  change, even between two grades that share a catalog density. */
  gradeId: string | null;
  /** Catalog density of the selected grade, or null when none is selected. */
  catalogDensity: number | null;
  /** Active override, or null when the catalog value is in force. */
  override: number | null;
  /** Raw text of an in-progress edit. */
  raw: string;
  /** Resolved error message, or undefined when the value is valid. */
  error?: string;
  onChange: (raw: string) => void;
}

const PLACEHOLDER = "—";

/**
 * Shows the density driving the calculation, and lets the user replace it.
 *
 * Read-only until the user asks to edit, so a figure that silently rescales
 * every result is not sitting in an input inviting stray keystrokes. Once
 * revealed the field behaves like any dimension entry — each keystroke
 * applies immediately, with no confirmation step — and stays a field for the
 * rest of the session. Reverting to the catalog value is the form's Reset
 * button; there is no separate control for it.
 */
export function DensityField({
  idPrefix, gradeId, catalogDensity, override, raw, error, onChange,
}: DensityFieldProps) {
  const t = useTranslate();
  const [editing, setEditing] = useState(false);
  // The input's own live text while editing. Mirrored to the caller on every
  // keystroke via onChange, but not re-derived from `raw` on each render:
  // the caller (the reducer, in real use) may not echo a prop update back
  // before the next keystroke lands, and a fully prop-controlled input would
  // then get overwritten mid-type.
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Last gradeId seen, so the re-seed effect below can tell "grade changed
  // under an open field" apart from "re-rendered for an unrelated reason"
  // (mount is instead guarded by `editing` being false at that point).
  const lastGradeId = useRef(gradeId);

  const id = `${idPrefix}-density`;
  const effective = override ?? catalogDensity;
  const disabled = catalogDensity === null;

  useEffect(() => {
    if (editing) inputRef.current?.querySelector("input")?.focus();
  }, [editing]);

  // Selecting a different grade clears the reducer's override underneath an
  // open field. When the new grade still has a catalog density (disabled
  // stays false), re-seed from it instead of leaving the old grade's number
  // in place: the in-progress edit belonged to the old grade, so carrying it
  // over would silently apply the wrong figure. Keyed on grade identity, not
  // on the density value — two grades can share a density, and the reducer
  // clears on every grade change regardless.
  useEffect(() => {
    const changed = lastGradeId.current !== gradeId;
    lastGradeId.current = gradeId;
    if (!changed || !editing || disabled) return;
    setText(catalogDensity !== null ? String(catalogDensity) : "");
  }, [gradeId, catalogDensity, editing, disabled]);

  // A grade with no catalog density leaves nothing to edit, so close the
  // field. Focus would otherwise fall to the document body: the Edit button
  // is itself disabled in this state and cannot receive it.
  useEffect(() => {
    if (!disabled) return;
    setEditing((was) => {
      if (was) containerRef.current?.focus();
      return false;
    });
  }, [disabled]);

  function beginEditing() {
    setText(raw !== "" ? raw : effective !== null ? String(effective) : "");
    setEditing(true);
  }

  function handleChange(next: string) {
    setText(next);
    onChange(next);
  }

  if (editing) {
    return (
      <div className="pfm-material-density pfm-material-density--editing" ref={inputRef}>
        <NumberField
          id={id}
          label={`${t("ui.density")} (${t("unit.kgm3")})`}
          value={text}
          error={error}
          onChange={handleChange}
        />
        {override !== null && (
          <span className="pfm-material-density__badge pfm-material-density__badge--float">
            {t("ui.densityEdited")}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="pfm-material-density" ref={containerRef} tabIndex={-1}>
      {/* Not paired via htmlFor: the read-only row has no single control to
          receive focus from a label click, and pointing it at the Edit
          button below would let the label's text override the button's own
          accessible name ("Edit"). */}
      <FieldLabel htmlFor={`${id}-value`}>{t("ui.density")}</FieldLabel>
      <div className="pfm-material-density__row">
        <span id={`${id}-value`} className="pfm-material-density__value" dir="ltr">
          {effective === null ? PLACEHOLDER : `${effective} ${t("unit.kgm3")}`}
        </span>

        {override !== null && (
          <span className="pfm-material-density__badge">{t("ui.densityEdited")}</span>
        )}

        <button
          type="button"
          className="pfm-material-density__button"
          disabled={disabled}
          onClick={beginEditing}
        >
          {t("ui.densityEdit")}
        </button>

        {disabled && (
          <span className="pfm-material-density__hint">
            {t("ui.densityDisabledHint")}
          </span>
        )}
      </div>
    </div>
  );
}

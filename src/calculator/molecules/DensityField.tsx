import { useEffect, useRef, useState } from "react";
import { FieldLabel } from "../atoms/FieldLabel";
import { NumberField } from "../atoms/NumberField";
import { useTranslate } from "../i18n/LanguageContext";
import "./DensityField.css";

export interface DensityFieldProps {
  idPrefix: string;
  /** Catalog density of the selected grade, or null when none is selected. */
  catalogDensity: number | null;
  /** Active override, or null when the catalog value is in force. */
  override: number | null;
  /** Raw text of an in-progress edit. */
  raw: string;
  /** Resolved error message, or undefined when the value is valid. */
  error?: string;
  onChange: (raw: string) => void;
  onClear: () => void;
}

const PLACEHOLDER = "—";

/**
 * Shows the density driving the calculation, and lets the user replace it.
 *
 * Read-only by default: the value is informational for almost every user, and
 * an always-editable input invites accidental edits to a figure that silently
 * rescales every result. Edit mode is the only local state here; the value
 * itself lives in the reducer.
 */
export function DensityField({
  idPrefix, catalogDensity, override, raw, error, onChange, onClear,
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
  const editButtonRef = useRef<HTMLButtonElement>(null);
  // Set when edit mode is left, so focus returns to the Edit control rather
  // than falling back to the document.
  const returnFocus = useRef(false);
  // Snapshot of `raw` when editing began, so Cancel can restore exactly what
  // was committed before this edit rather than wiping the field to catalog:
  // CLEAR_DENSITY resets to catalog unconditionally, which is right for the
  // "Reset" control but wrong for "Cancel" on top of an existing override.
  const committedRaw = useRef("");

  const id = `${idPrefix}-density`;
  const effective = override ?? catalogDensity;
  const disabled = catalogDensity === null;

  useEffect(() => {
    if (editing) {
      inputRef.current?.querySelector("input")?.focus();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [editing]);

  // A grade change clears the override underneath an open editor; without
  // this the field would keep showing a stale input over a new catalog value.
  useEffect(() => {
    if (disabled) setEditing(false);
  }, [disabled]);

  function leaveEditing() {
    returnFocus.current = true;
    setEditing(false);
  }

  function beginEditing() {
    committedRaw.current = raw;
    setText(raw !== "" ? raw : effective !== null ? String(effective) : "");
    setEditing(true);
  }

  function handleChange(next: string) {
    setText(next);
    onChange(next);
  }

  function commit() {
    if (error || text === "") return;
    leaveEditing();
  }

  function cancel() {
    if (committedRaw.current !== "") onChange(committedRaw.current);
    else onClear();
    leaveEditing();
  }

  if (editing) {
    return (
      <div className="pfm-material-density" ref={inputRef}>
        <NumberField
          id={id}
          label={`${t("ui.density")} (${t("unit.kgm3")})`}
          value={text}
          error={error}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
        />
        <div className="pfm-material-density__actions">
          <button
            type="button"
            className="pfm-material-density__button"
            disabled={Boolean(error) || text === ""}
            onClick={commit}
          >
            {t("ui.densityDone")}
          </button>
          <button
            type="button"
            className="pfm-material-density__button"
            onClick={cancel}
          >
            {t("ui.densityCancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pfm-material-density">
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

        {override !== null && (
          <button
            type="button"
            className="pfm-material-density__button"
            onClick={onClear}
          >
            {t("ui.densityReset")}
          </button>
        )}

        <button
          ref={editButtonRef}
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

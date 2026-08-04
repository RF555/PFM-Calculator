import { Command } from "cmdk";
import { useEffect, useRef, useState } from "react";
import { FieldLabel } from "../atoms/FieldLabel";
import { useTranslate } from "../i18n/LanguageContext";
import "./Combobox.css";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  id: string;
  label: string;
  placeholder: string;
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledHint?: string;
}

/**
 * Searchable single-select built on cmdk, which supplies the combobox
 * keyboard and ARIA behaviour (active-descendant tracking, scrolling the
 * active option into view, type-ahead). Lists here run to ~90 entries.
 */
export function Combobox({
  id, label, placeholder, options, value, onChange, disabled, disabledHint,
}: ComboboxProps) {
  const t = useTranslate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);
  const triggerText = disabled
    ? (disabledHint ?? placeholder)
    : (selected?.label ?? placeholder);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="pfm-combobox" ref={rootRef}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        className="pfm-combobox__trigger"
        data-placeholder={!selected || undefined}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        {triggerText}
      </button>

      {open && (
        <div className="pfm-combobox__popover">
          <Command
            label={label}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
              }
            }}
          >
            <Command.Input
              className="pfm-combobox__search"
              placeholder={t("ui.search")}
              autoFocus
            />
            <Command.List id={`${id}-list`} className="pfm-combobox__list">
              <Command.Empty className="pfm-combobox__empty">{t("ui.noMatches")}</Command.Empty>
              {options.map((o) => (
                <Command.Item
                  key={o.value}
                  value={o.label}
                  className="pfm-combobox__option"
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                >
                  {o.label}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}

import { useRef } from "react";
import "./SegmentedControl.css";

export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * A mutually exclusive choice, so radiogroup/aria-checked rather than a pair
 * of aria-pressed toggle buttons: the group announces its state as a unit.
 * Roving tabindex keeps it to one tab stop, with arrows moving between options.
 */
export function SegmentedControl({
  label, options, value, onChange,
}: SegmentedControlProps) {
  const ref = useRef<HTMLDivElement>(null);
  const index = options.findIndex((o) => o.value === value);

  function move(delta: number) {
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    const buttons = ref.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        e.preventDefault();
        onChange(options[0].value);
        break;
      case "End":
        e.preventDefault();
        onChange(options[options.length - 1].value);
        break;
    }
  }

  return (
    <div
      ref={ref}
      className="pfm-segmented"
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className="pfm-segmented__option"
            data-selected={selected || undefined}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

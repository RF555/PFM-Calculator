import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { DensityField } from "../DensityField";

function renderField(props: Partial<React.ComponentProps<typeof DensityField>> = {}) {
  const merged = {
    idPrefix: "t",
    catalogDensity: 7850,
    override: null,
    raw: "",
    onChange: vi.fn(),
    onClear: vi.fn(),
    ...props,
  };
  render(
    <LanguageProvider language="en" setLanguage={() => {}}>
      <div className="pfm-calc">
        <DensityField {...merged} />
      </div>
    </LanguageProvider>
  );
  return merged;
}

/**
 * Drives the component with real state, the way CalculatorForm does.
 * Also mirrors the reducer's SELECT_GRADE behaviour: a changed catalogDensity
 * resets raw/override, so a rerender with a new prop here matches what
 * happens when the user actually picks a different grade mid-edit.
 */
function Harness({ catalogDensity = 7850 }: { catalogDensity?: number | null }) {
  const [raw, setRaw] = useState("");
  const [override, setOverride] = useState<number | null>(null);
  const lastCatalogDensity = useRef(catalogDensity);
  useEffect(() => {
    if (lastCatalogDensity.current === catalogDensity) return;
    lastCatalogDensity.current = catalogDensity;
    setRaw("");
    setOverride(null);
  }, [catalogDensity]);
  return (
    <LanguageProvider language="en" setLanguage={() => {}}>
      <div className="pfm-calc">
        <DensityField
          idPrefix="t"
          catalogDensity={catalogDensity}
          override={override}
          raw={raw}
          onChange={(next) => {
            setRaw(next);
            const n = Number(next);
            setOverride(next !== "" && n >= 1 && n <= 25000 ? n : null);
          }}
          onClear={() => {
            setRaw("");
            setOverride(null);
          }}
        />
      </div>
    </LanguageProvider>
  );
}

describe("DensityField", () => {
  it("shows the catalog density read-only, with no input", () => {
    renderField();
    expect(screen.getByText("7850 kg/m³")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows a placeholder and disables editing when no grade is selected", () => {
    renderField({ catalogDensity: null });
    expect(screen.getByRole("button", { name: /edit/i })).toBeDisabled();
    expect(screen.getByText("Select a grade first")).toBeInTheDocument();
  });

  it("reveals an input seeded with the current value when Edit is clicked", async () => {
    renderField();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("textbox")).toHaveValue("7850");
  });

  it("moves focus into the input on entering edit mode", async () => {
    renderField();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("reports each keystroke to onChange", async () => {
    const props = renderField();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "7800");
    expect(props.onChange).toHaveBeenCalled();
    expect(props.onChange.mock.calls.at(-1)![0]).toBe("7800");
  });

  it("commits on Done and shows the edited badge", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "7800");
    await userEvent.click(screen.getByRole("button", { name: /done/i }));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("7800 kg/m³")).toBeInTheDocument();
    expect(screen.getByText("edited")).toBeInTheDocument();
  });

  it("returns focus to Edit after leaving edit mode", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.click(screen.getByRole("button", { name: /done/i }));
    expect(screen.getByRole("button", { name: /edit/i })).toHaveFocus();
  });

  it("discards the edit on Cancel", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "7800");
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("7850 kg/m³")).toBeInTheDocument();
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
  });

  it("commits on Enter and cancels on Escape", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "7800{Enter}");
    expect(screen.getByText("7800 kg/m³")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "1234{Escape}");
    expect(screen.getByText("7800 kg/m³")).toBeInTheDocument();
  });

  // Leaving edit mode with a broken value would strand the calculator with no
  // result and no visible cause, so Done stays unavailable until it parses.
  it("disables Done while the value is invalid", async () => {
    renderField({ error: "Must be between 1 and 25000 kg/m³", raw: "0" });
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("button", { name: /done/i })).toBeDisabled();
    expect(screen.getByText("Must be between 1 and 25000 kg/m³")).toBeInTheDocument();
  });

  it("offers Reset only while an override is active", async () => {
    renderField();
    expect(screen.queryByRole("button", { name: /reset to catalog/i })).not.toBeInTheDocument();

    const props = renderField({ override: 7800, raw: "7800" });
    await userEvent.click(screen.getByRole("button", { name: /reset to catalog/i }));
    expect(props.onClear).toHaveBeenCalled();
  });

  it("renders the value left-to-right so it does not reorder in Hebrew", () => {
    renderField({ override: 7800, raw: "7800" });
    expect(screen.getByText("7800 kg/m³")).toHaveAttribute("dir", "ltr");
  });

  // Regression: switching grades while the editor is open used to leave the
  // old grade's text and committedRaw snapshot in place, so Cancel and Done
  // both resolved against stale data superimposed on the new grade.
  it("re-seeds from the new catalog density when the grade changes mid-edit", async () => {
    const { rerender } = render(<Harness catalogDensity={7850} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("textbox")).toHaveValue("7850");

    rerender(<Harness catalogDensity={4500} />);
    expect(screen.getByRole("textbox")).toHaveValue("4500");

    // Cancel now falls back to the new grade's catalog value, not a snapshot
    // of the old grade's committed raw.
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.getByText("4500 kg/m³")).toBeInTheDocument();
  });

  it("closes the editor when the new grade has no catalog density", async () => {
    const { rerender } = render(<Harness catalogDensity={7850} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    rerender(<Harness catalogDensity={null} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Select a grade first")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { DensityField } from "../DensityField";

function renderField(props: Partial<React.ComponentProps<typeof DensityField>> = {}) {
  const merged = {
    idPrefix: "t",
    gradeId: "grade-a",
    catalogDensity: 7850,
    override: null,
    raw: "",
    onChange: vi.fn(),
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
 * Also mirrors the reducer's SELECT_GRADE behaviour: it clears raw/override
 * on ANY grade-identity change, regardless of whether the new grade's
 * catalog density happens to differ from the old one's, so a rerender with
 * a new gradeId here matches what happens when the user actually picks a
 * different grade mid-edit — including a switch between two grades that
 * share a catalog density.
 */
function Harness({
  gradeId = "grade-a",
  catalogDensity = 7850,
}: {
  gradeId?: string | null;
  catalogDensity?: number | null;
}) {
  const [raw, setRaw] = useState("");
  const [override, setOverride] = useState<number | null>(null);
  const lastGradeId = useRef(gradeId);
  useEffect(() => {
    if (lastGradeId.current === gradeId) return;
    lastGradeId.current = gradeId;
    setRaw("");
    setOverride(null);
  }, [gradeId]);
  return (
    <LanguageProvider language="en" setLanguage={() => {}}>
      <div className="pfm-calc">
        <DensityField
          idPrefix="t"
          gradeId={gradeId}
          catalogDensity={catalogDensity}
          override={override}
          raw={raw}
          onChange={(next) => {
            setRaw(next);
            const n = Number(next);
            setOverride(next !== "" && n >= 1 && n <= 25000 ? n : null);
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

  // The field behaves like a dimension entry once revealed: what you type is
  // what is in force, with no confirmation step standing between the two.
  it("applies each keystroke immediately, with no confirmation step", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "2700");

    expect(screen.queryByRole("button", { name: /done/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    expect(screen.getByText("edited")).toBeInTheDocument();
  });

  it("stays an input once revealed rather than collapsing back to read-only", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "2700");
    await userEvent.tab();

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  // Reverting is the form's own Reset button; a second control for it would
  // be one more thing to explain and to keep in sync.
  it("offers no reset-to-catalog control", () => {
    renderField({ override: 7800, raw: "7800" });
    expect(
      screen.queryByRole("button", { name: /reset to catalog/i })
    ).not.toBeInTheDocument();
  });

  it("shows the edited badge only while an override is in force", () => {
    renderField();
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
  });

  it("shows the error message while the value is invalid", async () => {
    renderField({ error: "Must be between 1 and 25000 kg/m³", raw: "0" });
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByText("Must be between 1 and 25000 kg/m³")).toBeInTheDocument();
  });

  it("renders the value left-to-right so it does not reorder in Hebrew", () => {
    renderField({ override: 7800, raw: "7800" });
    expect(screen.getByText("7800 kg/m³")).toHaveAttribute("dir", "ltr");
  });

  // Regression: switching grades while the field is open used to leave the
  // old grade's text in place, superimposed on the new grade's density.
  it("re-seeds from the new catalog density when the grade changes mid-edit", async () => {
    const { rerender } = render(<Harness gradeId="grade-a" catalogDensity={7850} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("textbox")).toHaveValue("7850");

    rerender(<Harness gradeId="grade-b" catalogDensity={4500} />);
    expect(screen.getByRole("textbox")).toHaveValue("4500");
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
  });

  // Regression: the re-seed effect used to key off catalogDensity instead of
  // grade identity, so switching between two DIFFERENT grades that happen to
  // share a catalog density looked like "nothing changed" and the stale
  // in-progress edit survived the switch, even though the reducer had
  // already cleared the override underneath it.
  it("re-seeds when the grade changes even if the new grade has the same catalog density", async () => {
    const { rerender } = render(<Harness gradeId="grade-a" catalogDensity={7850} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "2700");
    expect(screen.getByRole("textbox")).toHaveValue("2700");

    // Same catalog density (7850) as grade-a, but a different grade.
    rerender(<Harness gradeId="grade-c" catalogDensity={7850} />);
    expect(screen.getByRole("textbox")).toHaveValue("7850");
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
  });

  it("closes the editor when the new grade has no catalog density", async () => {
    const { rerender } = render(<Harness gradeId="grade-a" catalogDensity={7850} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    rerender(<Harness gradeId={null} catalogDensity={null} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Select a grade first")).toBeInTheDocument();
  });
});

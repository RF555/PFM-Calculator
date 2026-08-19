import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { CalculatorForm } from "../CalculatorForm";

// jsdom has neither ResizeObserver nor scrollIntoView; cmdk (used by the
// comboboxes) relies on both to keep the active option in view.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
  ResizeObserverStub;
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

const MATERIALS = [
  { id: "steel", name: { he: "פלדה", en: "Steel" },
    grades: [
      { id: "steel.carbon", name: { he: "פלדת פחמן", en: "Carbon Steel" }, density: 7850 },
      { id: "steel.stainless", name: { he: "נירוסטה", en: "Stainless 304" }, density: 7930 },
      // Shares steel.carbon's catalog density on purpose: regression coverage
      // for a re-seed bug that keyed off density value instead of grade
      // identity, so switching between two same-density grades looked like
      // no change at all and left a stale in-progress edit on screen.
      { id: "steel.carbon2", name: { he: "פלדת פחמן 2", en: "Carbon Steel 2" }, density: 7850 },
    ] },
];

function renderEn(ui: React.ReactElement) {
  return render(
    <LanguageProvider language="en" setLanguage={() => {}}>{ui}</LanguageProvider>
  );
}

function setup(props = {}) {
  return renderEn(
    <div className="pfm-calc">
      <CalculatorForm
        materials={MATERIALS}
        defaultUnit="mm"
        defaultMassUnit="kg"
        defaultQuantity={1}
        {...props}
      />
    </div>
  );
}

async function pick(name: string, option: string) {
  await userEvent.click(screen.getByRole("combobox", { name }));
  await userEvent.click(screen.getByRole("option", { name: option }));
}

describe("CalculatorForm", () => {
  it("calculates as the user types, with no Calculate button", async () => {
    setup();
    expect(screen.queryByRole("button", { name: /calculate/i })).not.toBeInTheDocument();

    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");

    expect(screen.getByTestId("total-primary")).toHaveTextContent("15.4134 kg");
  });

  it("keeps the grade field disabled until a material is chosen", async () => {
    setup();
    const grade = screen.getByRole("combobox", { name: "Grade" });
    expect(grade).toBeDisabled();
    expect(grade).toHaveTextContent("Select a material first");
  });

  it("suppresses the result when geometry is impossible", async () => {
    setup();
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");
    await pick("Shape", "Square Hollow Section");
    await userEvent.type(screen.getByLabelText("Width (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Wall Thickness (mm)"), "30");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");
    await userEvent.tab();

    expect(screen.getByTestId("total-primary")).toHaveTextContent("—");
    expect(screen.getByText(/less than half the width/)).toBeInTheDocument();
  });

  // The bound is a length, so it reads like one: the figure the user would
  // type, with its unit. Not "25.00" — that is mass/volume formatting, and
  // padding a round limit makes it look measured rather than derived.
  it("states the constraint limit unpadded and with its unit", async () => {
    setup();
    await pick("Shape", "Square Hollow Section");
    await userEvent.type(screen.getByLabelText("Width (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Wall Thickness (mm)"), "30");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");
    await userEvent.tab();

    expect(screen.getByText(/under 25 mm/)).toBeInTheDocument();
    expect(screen.queryByText(/25\.00/)).not.toBeInTheDocument();
  });

  // Regression: the model's bound is canonical millimetres. Shown raw in inch
  // mode it stated a millimetre limit to someone typing inches, unlabelled —
  // a wrong number rather than merely an unlabelled one.
  it("converts the constraint limit into the active unit", async () => {
    setup();
    await pick("Shape", "Square Hollow Section");
    await userEvent.click(screen.getByRole("radio", { name: "inch" }));
    await userEvent.type(screen.getByLabelText("Width (inch)"), "2");
    await userEvent.type(screen.getByLabelText("Wall Thickness (inch)"), "1.5");
    await userEvent.type(screen.getByLabelText("Length (inch)"), "40");
    await userEvent.tab();

    // Half of 2 inch, stated in inches — not the 25.4 mm the model computed.
    expect(screen.getByText(/under 1 inch/)).toBeInTheDocument();
  });

  it("converts entered values when the unit changes", async () => {
    setup();
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await userEvent.click(screen.getByRole("radio", { name: "inch" }));

    const converted = Number((screen.getByLabelText("Diameter (inch)") as HTMLInputElement).value);
    expect(converted).toBeCloseTo(1.968503937, 6);
  });

  it("multiplies by quantity", async () => {
    setup();
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(screen.getByTestId("unit-primary")).toHaveTextContent("15.4134 kg");
    expect(screen.getByTestId("total-primary")).toHaveTextContent("30.8269 kg");
  });

  it("reports results to the host", async () => {
    const onCalculate = vi.fn();
    setup({ onCalculate });
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");

    expect(onCalculate).toHaveBeenCalled();
    const last = onCalculate.mock.calls.at(-1)![0];
    expect(last.unitKg).toBeCloseTo(15.4134, 3);
  });

  it("reports null once a valid result becomes invalid", async () => {
    const onCalculate = vi.fn();
    setup({ onCalculate });
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");
    await pick("Shape", "Square Hollow Section");
    await userEvent.type(screen.getByLabelText("Width (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Wall Thickness (mm)"), "5");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");
    expect(onCalculate.mock.calls.at(-1)![0]).not.toBeNull();

    // A wall at or above half the width is impossible. The host must be told,
    // or it keeps a figure the user can no longer see.
    await userEvent.clear(screen.getByLabelText("Wall Thickness (mm)"));
    await userEvent.type(screen.getByLabelText("Wall Thickness (mm)"), "30");

    expect(onCalculate.mock.calls.at(-1)![0]).toBeNull();
  });

  it("calculates the angle shape with the optional Leg B left blank", async () => {
    setup();
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");
    await pick("Shape", "Angle (L-profile)");
    await userEvent.type(screen.getByLabelText("Leg A (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Thickness (mm)"), "5");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");
    // Leg B (optional) is never touched — the shape must still calculate.
    // 3.7287, not 3.7288: 475000 mm^3 * 7850 / 1e9 = 3.72875 exactly, but
    // that value isn't exactly representable in a float64 (it lands a hair
    // under 3.72875), so toFixed(4) rounds down — the same floating-point
    // behaviour the pre-existing model-level reference test already
    // tolerates via toBeCloseTo(3.7288, 3).
    expect(screen.getByTestId("total-primary")).toHaveTextContent("3.7287 kg");
  });

  it("calculates unequal-leg angle once Leg B is filled in", async () => {
    setup();
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");
    await pick("Shape", "Angle (L-profile)");
    await userEvent.type(screen.getByLabelText("Leg A (mm)"), "100");
    await userEvent.type(screen.getByLabelText("Leg B (optional) (mm)"), "75");
    await userEvent.type(screen.getByLabelText("Thickness (mm)"), "10");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");

    expect(screen.getByTestId("total-primary")).toHaveTextContent("12.9525 kg");
  });

  it("clears dimensions when the shape changes", async () => {
    setup();
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await pick("Shape", "Square Bar");
    expect(screen.getByLabelText("Width (mm)")).toHaveValue("");
  });

  // A stable vi.fn() cannot catch this: the bug only shows up when the host
  // passes a fresh inline callback every render (the ordinary way to write
  // one) AND that callback stores a non-primitive in host state. Without
  // ref-wrapping onCalculate, the effect re-runs every render, which sets
  // host state, which re-renders, forever.
  it("does not loop when the host passes an inline callback storing an object", () => {
    let renders = 0;
    function Host() {
      renders++;
      if (renders > 40) throw new Error(`render loop: ${renders}`);
      const [quote, setQuote] = useState<{ kg: number | null }>({ kg: null });
      return (
        <>
          <CalculatorForm
            materials={MATERIALS}
            defaultUnit="mm"
            defaultMassUnit="kg"
            defaultQuantity={1}
            onCalculate={(r) => setQuote({ kg: r ? r.totalKg : null })}
          />
          <span data-testid="q">{String(quote.kg)}</span>
        </>
      );
    }
    render(<Host />);
    expect(screen.getByTestId("q")).toBeInTheDocument();
  });

  it("shows constraint messages in Hebrew", async () => {
    render(
      <LanguageProvider language="he" setLanguage={() => {}}>
        <CalculatorForm materials={MATERIALS} defaultUnit="mm"
          defaultMassUnit="kg" defaultQuantity={1} />
      </LanguageProvider>
    );
    await pick("צורה", "פרופיל מרובע חלול");
    await userEvent.type(screen.getByLabelText("רוחב (מ\"מ)"), "50");
    const wall = screen.getByLabelText("עובי דופן (מ\"מ)");
    await userEvent.type(wall, "30");
    // checkConstraints only evaluates once every field is filled (see
    // model/shapes.ts), so Length must be filled too, or no violation
    // is ever computed for the wall-thickness field to display.
    await userEvent.type(screen.getByLabelText("אורך (מ\"מ)"), "1000");
    await userEvent.tab();
    expect(await screen.findByText(/הדופן חייבת להיות קטנה/)).toBeInTheDocument();
  });

  async function fillRoundBar() {
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");
  }

  it("places the density field alongside quantity", async () => {
    setup();
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel");

    const footer = screen.getByLabelText("Quantity").closest(".pfm-form__footer");
    expect(footer).not.toBeNull();
    expect(footer!.querySelector(".pfm-material-density")).not.toBeNull();
  });

  it("recalculates from an overridden density", async () => {
    setup();
    await fillRoundBar();
    expect(screen.getByTestId("total-primary")).toHaveTextContent("15.4134 kg");

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));
    await userEvent.type(screen.getByRole("textbox", { name: /density/i }), "2.7");

    // Same 1963495.4 mm^3 at 2.7 g/cm3 (2700 kg/m3) instead of 7850.
    expect(screen.getByTestId("total-primary")).toHaveTextContent("5.3014 kg");
  });

  it("blanks the result while the density is invalid", async () => {
    setup();
    await fillRoundBar();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));
    await userEvent.type(screen.getByRole("textbox", { name: /density/i }), "99999");

    expect(screen.getByTestId("total-primary")).toHaveTextContent("—");
    expect(screen.getByText(/Must be between 0.001 and 25/)).toBeInTheDocument();
  });

  // Regression: clearing the field used to fall back to the catalog density,
  // so the total silently changed to a figure derived from a number the user
  // had just deleted — no error, no badge, nothing on screen to explain it.
  // On a quote that is a real money error.
  it("blanks the result when the density field is cleared", async () => {
    const onCalculate = vi.fn();
    setup({ onCalculate });
    await fillRoundBar();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));
    await userEvent.type(screen.getByRole("textbox", { name: /density/i }), "2.7");
    expect(screen.getByTestId("total-primary")).toHaveTextContent("5.3014 kg");

    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));

    // Must NOT revert to the catalog 7850 (which would read 15.4134 kg).
    expect(screen.getByTestId("total-primary")).toHaveTextContent("—");
    expect(onCalculate.mock.calls.at(-1)![0]).toBeNull();
  });

  it("recovers the result once a density is typed again after clearing", async () => {
    setup();
    await fillRoundBar();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));
    expect(screen.getByTestId("total-primary")).toHaveTextContent("—");

    await userEvent.type(screen.getByRole("textbox", { name: /density/i }), "2.7");
    expect(screen.getByTestId("total-primary")).toHaveTextContent("5.3014 kg");
  });

  it("drops the override and uses the new catalog value when the grade changes", async () => {
    setup();
    await fillRoundBar();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));
    await userEvent.type(screen.getByRole("textbox", { name: /density/i }), "2.7");
    expect(screen.getByText("edited")).toBeInTheDocument();

    await pick("Grade", "Stainless 304");

    // The field stays revealed once opened, so the new grade's catalog value
    // shows in the input rather than as read-only text.
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /density/i })).toHaveValue("7.93");
    expect(screen.getByTestId("total-primary")).toHaveTextContent("15.5705 kg");
  });

  // Regression: the density re-seed effect used to key off catalogDensity
  // instead of grade identity. Carbon Steel and Carbon Steel 2 share a
  // catalog density (7850), so the old comparison saw "no change" and left
  // the previous grade's in-progress edit on screen even though the reducer
  // had already cleared the override underneath it.
  it("drops a stale in-progress edit when switching to a different grade with the same catalog density", async () => {
    setup();
    await fillRoundBar();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));
    await userEvent.type(screen.getByRole("textbox", { name: /density/i }), "2.7");

    await pick("Grade", "Carbon Steel 2");

    // The stale "2.7" must not still be showing; the field re-seeds to the
    // new grade's catalog value (also 7850 kg/m³) and the result agrees.
    expect(screen.queryByDisplayValue("2.7")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /density/i })).toHaveValue("7.85");
    expect(screen.getByTestId("total-primary")).toHaveTextContent("15.4134 kg");
  });

  it("reports the density that produced the result", async () => {
    const onCalculate = vi.fn();
    setup({ onCalculate });
    await fillRoundBar();
    expect(onCalculate.mock.calls.at(-1)![0].densityKgM3).toBe(7850);

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));
    await userEvent.type(screen.getByRole("textbox", { name: /density/i }), "2.7");

    expect(onCalculate.mock.calls.at(-1)![0].densityKgM3).toBe(2700);
  });

  it("clears the override on reset", async () => {
    setup();
    await fillRoundBar();
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /density/i }));
    await userEvent.type(screen.getByRole("textbox", { name: /density/i }), "2.7");

    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
  });

  it("shows the disclaimer summary beneath the results", () => {
    setup();
    expect(screen.getByText(/Theoretical estimate only/)).toBeInTheDocument();
  });

  it("renders the disclaimer outside the results panel", () => {
    const { container } = setup();
    const results = container.querySelector(".pfm-results");
    expect(results?.querySelector(".pfm-disclaimer")).toBeNull();
    expect(container.querySelector(".pfm-disclaimer")).toBeInTheDocument();
  });

  it("passes a host override through to the disclaimer", () => {
    setup({ disclaimerText: { summary: "Custom notice." } });
    expect(screen.getByText("Custom notice.")).toBeInTheDocument();
  });
});

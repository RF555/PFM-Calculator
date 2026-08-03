import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
  { id: "steel", name: "Steel",
    grades: [{ id: "steel.carbon", name: "Carbon Steel", density: 7850 }] },
];

function setup(props = {}) {
  return render(
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
    await pick("Grade", "Carbon Steel (7850 kg/m³)");
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
    await pick("Grade", "Carbon Steel (7850 kg/m³)");
    await pick("Shape", "Square Hollow Section");
    await userEvent.type(screen.getByLabelText("Side (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Wall Thickness (mm)"), "30");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");
    await userEvent.tab();

    expect(screen.getByTestId("total-primary")).toHaveTextContent("—");
    expect(screen.getByText(/less than half the side/)).toBeInTheDocument();
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
    await pick("Grade", "Carbon Steel (7850 kg/m³)");
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
    await pick("Grade", "Carbon Steel (7850 kg/m³)");
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");

    expect(onCalculate).toHaveBeenCalled();
    const last = onCalculate.mock.calls.at(-1)![0];
    expect(last.unitKg).toBeCloseTo(15.4134, 3);
  });

  it("clears dimensions when the shape changes", async () => {
    setup();
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await pick("Shape", "Square Bar");
    expect(screen.getByLabelText("Side (mm)")).toHaveValue("");
  });
});

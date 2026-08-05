import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MaterialCalculator } from "../MaterialCalculator";
import { shapeLabel } from "../index";

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

const rootOf = (container: HTMLElement) => container.querySelector(".pfm-calc");

async function pick(name: string, option: string) {
  await userEvent.click(screen.getByRole("combobox", { name }));
  await userEvent.click(screen.getByRole("option", { name: option }));
}

describe("language switching", () => {
  it("defaults to Hebrew and rtl", () => {
    const { container } = render(<MaterialCalculator />);
    expect(rootOf(container)).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("combobox", { name: "חומר" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "צורה" })).toBeInTheDocument();
  });

  it("switches every visible label to English", async () => {
    const { container } = render(<MaterialCalculator />);
    await userEvent.click(screen.getByRole("radio", { name: "English" }));
    expect(rootOf(container)).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("combobox", { name: "Material" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Shape" })).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("localizes material and grade names", async () => {
    render(<MaterialCalculator />);
    await pick("חומר", "פלדה");
    await userEvent.click(screen.getByRole("radio", { name: "English" }));
    expect(screen.getByRole("combobox", { name: "Material" }))
      .toHaveTextContent("Steel");
  });

  it("preserves all state across a language switch", async () => {
    render(<MaterialCalculator defaultLanguage="en" />);
    await pick("Material", "Steel");
    await pick("Grade", "Carbon Steel (Structural / A36)");
    await pick("Shape", "Round Bar");
    await userEvent.type(screen.getByLabelText("Diameter (mm)"), "50");
    await userEvent.type(screen.getByLabelText("Length (mm)"), "1000");
    const before = screen.getByTestId("total-primary").textContent;

    await userEvent.click(screen.getByRole("radio", { name: "עברית" }));

    expect(screen.getByLabelText("קוטר (מ\"מ)")).toHaveValue("50");
    expect(screen.getByLabelText("אורך (מ\"מ)")).toHaveValue("1000");
    // Same magnitude, Hebrew unit symbol.
    expect(screen.getByTestId("total-primary").textContent)
      .toBe(before!.replace("kg", "ק\"ג"));
  });

  it("keeps the quantity across a switch", async () => {
    render(<MaterialCalculator defaultQuantity={7} />);
    await userEvent.click(screen.getByRole("radio", { name: "English" }));
    expect(screen.getByLabelText("Quantity")).toHaveValue("7");
  });
});

describe("shapeLabel", () => {
  it("resolves a shape name in both languages", () => {
    expect(shapeLabel("roundBar", "en")).toBe("Round Bar");
    expect(shapeLabel("roundBar", "he")).toBe("מוט עגול");
  });
});

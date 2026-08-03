import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MaterialCalculator, defaultMaterials } from "../index";

describe("public API", () => {
  it("renders with no props", () => {
    render(<MaterialCalculator />);
    expect(screen.getByRole("combobox", { name: "Material" })).toBeInTheDocument();
  });

  it("exports non-empty bundled materials", () => {
    expect(defaultMaterials.length).toBeGreaterThan(0);
    expect(defaultMaterials[0].grades.length).toBeGreaterThan(0);
  });

  it("accepts a custom materials list", async () => {
    render(<MaterialCalculator materials={[
      { id: "x", name: "Unobtainium", grades: [{ id: "x.1", name: "Grade 1", density: 1234 }] },
    ]} />);
    expect(screen.getByRole("combobox", { name: "Material" })).toBeInTheDocument();
  });

  it("honours default unit and quantity props", () => {
    render(<MaterialCalculator defaultUnit="inch" defaultQuantity={5} />);
    expect(screen.getByRole("radio", { name: "inch" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText("Quantity")).toHaveValue("5");
  });
});

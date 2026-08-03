import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MaterialCalculator, defaultMaterials, SHAPES, SHAPE_IDS, type ShapeId } from "../index";

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

  it("renders two instances on one page with no duplicate element ids", () => {
    const { container } = render(
      <>
        <MaterialCalculator />
        <MaterialCalculator />
      </>
    );
    const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("exports a ShapeId a host can exhaustively switch on, with a label for every id", () => {
    // Compile-time check: a host can narrow a CalculationResult.shapeId to
    // ShapeId and use it as a SHAPES key without a cast or a parallel union.
    const describe = (id: ShapeId): string => SHAPES[id].label;

    expect(SHAPE_IDS.length).toBeGreaterThan(0);
    for (const id of SHAPE_IDS) {
      expect(typeof describe(id)).toBe("string");
      expect(SHAPES[id].label.length).toBeGreaterThan(0);
    }
  });
});

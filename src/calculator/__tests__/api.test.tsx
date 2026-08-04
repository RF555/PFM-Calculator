import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MaterialCalculator, defaultMaterials, SHAPE_IDS, shapeLabel, type ShapeId } from "../index";

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

describe("public API", () => {
  it("renders with no props", () => {
    render(<MaterialCalculator defaultLanguage="en" />);
    expect(screen.getByRole("combobox", { name: "Material" })).toBeInTheDocument();
  });

  it("exports non-empty bundled materials", () => {
    expect(defaultMaterials.length).toBeGreaterThan(0);
    expect(defaultMaterials[0].grades.length).toBeGreaterThan(0);
  });

  it("accepts a custom materials list and renders its options", async () => {
    render(<MaterialCalculator defaultLanguage="en" materials={[
      {
        id: "x",
        name: { he: "אונובטניום", en: "Unobtainium" },
        grades: [{ id: "x.1", name: { he: "דרגה 1", en: "Grade 1" }, density: 1234 }],
      },
    ]} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));
    expect(screen.getByRole("option", { name: "Unobtainium" })).toBeInTheDocument();
  });

  it("honours default unit and quantity props", () => {
    render(<MaterialCalculator defaultLanguage="en" defaultUnit="inch" defaultQuantity={5} />);
    expect(screen.getByRole("radio", { name: "inch" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText("Quantity")).toHaveValue("5");
  });

  it("renders two instances on one page with no duplicate element ids", () => {
    const { container } = render(
      <>
        <MaterialCalculator defaultLanguage="en" />
        <MaterialCalculator defaultLanguage="en" />
      </>
    );
    const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("exports a ShapeId a host can exhaustively switch on, with a label for every id", () => {
    // Compile-time check: a host can narrow a CalculationResult.shapeId to
    // ShapeId and pass it to shapeLabel without a cast or a parallel union.
    const describe = (id: ShapeId): string => shapeLabel(id, "en");

    expect(SHAPE_IDS.length).toBeGreaterThan(0);
    for (const id of SHAPE_IDS) {
      expect(typeof describe(id)).toBe("string");
      expect(shapeLabel(id, "en").length).toBeGreaterThan(0);
      expect(shapeLabel(id, "he").length).toBeGreaterThan(0);
    }
  });

  it("renders in Hebrew with rtl direction by default", () => {
    const { container } = render(<MaterialCalculator />);
    const root = container.querySelector(".pfm-calc");
    expect(root).toHaveAttribute("dir", "rtl");
    expect(root).toHaveAttribute("lang", "he");
    expect(screen.getByRole("combobox", { name: "חומר" })).toBeInTheDocument();
  });

  it("honours defaultLanguage", () => {
    const { container } = render(<MaterialCalculator defaultLanguage="en" />);
    const root = container.querySelector(".pfm-calc");
    expect(root).toHaveAttribute("dir", "ltr");
    expect(root).toHaveAttribute("lang", "en");
    expect(screen.getByRole("combobox", { name: "Material" })).toBeInTheDocument();
  });

  it("reports language changes to the host", async () => {
    const onLanguageChange = vi.fn();
    render(<MaterialCalculator onLanguageChange={onLanguageChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "English" }));
    expect(onLanguageChange).toHaveBeenCalledWith("en");
  });

  it("coerces an out-of-range defaultLanguage to the default instead of crashing", () => {
    const { container } = render(
      // @ts-expect-error deliberately passing a language outside the closed union
      <MaterialCalculator defaultLanguage="fr" />
    );
    const root = container.querySelector(".pfm-calc");
    expect(root).toHaveAttribute("dir", "rtl");
    expect(root).toHaveAttribute("lang", "he");
    expect(screen.getByRole("combobox", { name: "חומר" })).toBeInTheDocument();
  });

  it("rejects a v1 plain-string material name instead of rendering a blank option", () => {
    expect(() =>
      render(
        <MaterialCalculator
          defaultLanguage="en"
          materials={[
            // @ts-expect-error deliberately passing the pre-v2 plain-string shape
            { id: "x", name: "Unobtainium", grades: [{ id: "x.1", name: "Grade 1", density: 1234 }] },
          ]}
        />
      )
    ).toThrow(/name must be an object/);
  });

  it("rejects a v2 material name missing the active locale instead of rendering a blank option", () => {
    expect(() =>
      render(
        <MaterialCalculator
          defaultLanguage="en"
          materials={[
            {
              id: "x",
              // @ts-expect-error deliberately omitting the "en" locale
              name: { he: "אונובטניום" },
              grades: [{ id: "x.1", name: { he: "דרגה 1", en: "Grade 1" }, density: 1234 }],
            },
          ]}
        />
      )
    ).toThrow(/missing a non-empty "en" translation/);
  });
});

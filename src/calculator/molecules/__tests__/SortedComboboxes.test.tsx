import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import type { Language } from "../../i18n/types";
import { CUSTOM_MATERIAL_ID, type Material } from "../../model/schema";
import { GradeCombobox } from "../GradeCombobox";
import { MaterialCombobox } from "../MaterialCombobox";

// cmdk needs both, and jsdom supplies neither. See Combobox.test.tsx.
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

// Deliberately stored out of order, so a passing test means the component
// sorted rather than that it echoed the source order.
const MATERIALS: Material[] = [
  {
    id: "steel",
    name: { en: "Steel", he: "פלדה" },
    grades: [
      { id: "gr12", name: { en: "Gr.12", he: "Gr.12" }, density: 4.5 },
      { id: "gr2", name: { en: "Gr.2", he: "Gr.2" }, density: 4.5 },
      { id: "gr9", name: { en: "Gr.9", he: "Gr.9" }, density: 4.5 },
    ],
  },
  { id: "aluminum", name: { en: "Aluminum", he: "אלומיניום" }, grades: [] },
  { id: "copper", name: { en: "Copper", he: "נחושת" }, grades: [] },
];

function renderIn(language: Language, ui: React.ReactElement) {
  return render(
    <LanguageProvider language={language} setLanguage={() => {}}>{ui}</LanguageProvider>
  );
}

/** Open the combobox and read back the option labels in DOM order. */
async function openAndListOptions(name: string): Promise<string[]> {
  await userEvent.click(screen.getByRole("combobox", { name }));
  return screen.getAllByRole("option").map((o) => o.textContent ?? "");
}

describe("MaterialCombobox ordering", () => {
  // The trailing custom-density entry is asserted on its own below; these
  // cover the catalog entries, which are the part the collator orders.
  it("lists materials alphabetically in English", async () => {
    renderIn("en", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={null} onChange={() => {}} />);
    expect((await openAndListOptions("Material")).slice(0, 3))
      .toEqual(["Aluminum", "Copper", "Steel"]);
  });

  it("reorders by the Hebrew names when the language is Hebrew", async () => {
    renderIn("he", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={null} onChange={() => {}} />);
    // Hebrew alphabetical order, which is a different sequence to the English
    // one above — the sort follows the translation, not the underlying id.
    expect((await openAndListOptions("חומר")).slice(0, 3))
      .toEqual(["אלומיניום", "נחושת", "פלדה"]);
  });
});

describe("GradeCombobox ordering", () => {
  it("lists grades with embedded numbers in numeric order", async () => {
    renderIn("en", <GradeCombobox idPrefix="t" material={MATERIALS[0]}
      value={null} onChange={() => {}} />);
    expect(await openAndListOptions("Grade"))
      .toEqual(["Gr.2", "Gr.9", "Gr.12"]);
  });

  it("stays disabled with no material selected", () => {
    renderIn("en", <GradeCombobox idPrefix="t" material={null}
      value={null} onChange={() => {}} />);
    expect(screen.getByRole("combobox", { name: "Grade" })).toBeDisabled();
  });

  // Both states are disabled but they are not the same state, and the hint is
  // the only thing on screen that tells them apart.
  it("explains that no grade is needed in custom-density mode", () => {
    renderIn("en", <GradeCombobox idPrefix="t" material={null} customDensity
      value={null} onChange={() => {}} />);
    const grade = screen.getByRole("combobox", { name: "Grade" });
    expect(grade).toBeDisabled();
    expect(grade).toHaveTextContent("Not needed for custom density");
  });
});

/**
 * Custom density is appended after the collator has run, not sorted with the
 * catalog entries. Sorting it would file it under its translated label, so it
 * would sit mid-list in one language and elsewhere in the other.
 */
describe("MaterialCombobox custom density option", () => {
  it("offers custom density last in English", async () => {
    renderIn("en", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={null} onChange={() => {}} />);
    expect(await openAndListOptions("Material"))
      .toEqual(["Aluminum", "Copper", "Steel", "Custom density"]);
  });

  it("offers custom density last in Hebrew too", async () => {
    renderIn("he", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={null} onChange={() => {}} />);
    expect(await openAndListOptions("חומר"))
      .toEqual(["אלומיניום", "נחושת", "פלדה", "צפיפות מותאמת אישית"]);
  });

  it("reports the reserved id when custom density is picked", async () => {
    const onChange = vi.fn();
    renderIn("en", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));
    await userEvent.click(screen.getByRole("option", { name: "Custom density" }));
    expect(onChange).toHaveBeenCalledWith(CUSTOM_MATERIAL_ID);
  });

  it("shows the custom label on the trigger once selected", () => {
    renderIn("en", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={CUSTOM_MATERIAL_ID} onChange={() => {}} />);
    expect(screen.getByRole("combobox", { name: "Material" }))
      .toHaveTextContent("Custom density");
  });

  // Set apart visually as well as positionally: it is an escape hatch from
  // the catalog, not another entry in it, and a user scanning the list should
  // not have to read the label to see that.
  it("marks the custom row so it reads as distinct from the materials", async () => {
    renderIn("en", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={null} onChange={() => {}} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));

    const rows = screen.getAllByRole("option");
    const customRow = rows.at(-1)!;
    expect(customRow).toHaveTextContent("Custom density");
    expect(customRow).toHaveAttribute("data-custom", "true");
    // Catalog rows must not pick up the treatment.
    expect(rows[0]).not.toHaveAttribute("data-custom");
  });

  it("gives the custom row an icon the catalog rows do not have", async () => {
    const { container } = renderIn("en", <MaterialCombobox idPrefix="t"
      materials={MATERIALS} value={null} onChange={() => {}} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));

    const rows = screen.getAllByRole("option");
    expect(rows.at(-1)!.querySelector("svg")).toBeInTheDocument();
    expect(rows[0].querySelector("svg")).toBeNull();
    // Decorative: the label beside it already names the option, so a second
    // announcement would just be noise to a screen reader.
    expect(container.querySelector(".pfm-combobox__custom-icon"))
      .toHaveAttribute("aria-hidden", "true");
  });

  it("carries the icon onto the trigger once selected", () => {
    const { container } = renderIn("en", <MaterialCombobox idPrefix="t"
      materials={MATERIALS} value={CUSTOM_MATERIAL_ID} onChange={() => {}} />);
    expect(
      screen.getByRole("combobox", { name: "Material" }).querySelector("svg")
    ).toBeInTheDocument();
    expect(container.querySelector(".pfm-combobox__custom-icon")).toBeInTheDocument();
  });

  it("leaves the trigger iconless for a catalog material", () => {
    renderIn("en", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value="steel" onChange={() => {}} />);
    expect(
      screen.getByRole("combobox", { name: "Material" }).querySelector("svg")
    ).toBeNull();
  });
});

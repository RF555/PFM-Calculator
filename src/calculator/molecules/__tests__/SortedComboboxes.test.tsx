import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import type { Language } from "../../i18n/types";
import type { Material } from "../../model/schema";
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
  it("lists materials alphabetically in English", async () => {
    renderIn("en", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={null} onChange={() => {}} />);
    expect(await openAndListOptions("Material"))
      .toEqual(["Aluminum", "Copper", "Steel"]);
  });

  it("reorders by the Hebrew names when the language is Hebrew", async () => {
    renderIn("he", <MaterialCombobox idPrefix="t" materials={MATERIALS}
      value={null} onChange={() => {}} />);
    // Hebrew alphabetical order, which is a different sequence to the English
    // one above — the sort follows the translation, not the underlying id.
    expect(await openAndListOptions("חומר"))
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
});

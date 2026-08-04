import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { DimensionField } from "../DimensionField";
import { DimensionGrid } from "../DimensionGrid";

function renderEn(ui: React.ReactElement) {
  return render(
    <LanguageProvider language="en" setLanguage={() => {}}>{ui}</LanguageProvider>
  );
}

describe("DimensionGrid", () => {
  it("renders its fields", () => {
    renderEn(
      <DimensionGrid>
        <DimensionField idPrefix="pfm" fieldKey="diameter" label="Diameter" value="50" unit="mm" onChange={() => {}} />
        <DimensionField idPrefix="pfm" fieldKey="length" label="Length" value="1000" unit="mm" onChange={() => {}} />
      </DimensionGrid>
    );
    expect(screen.getByLabelText("Diameter (mm)")).toHaveValue("50");
    expect(screen.getByLabelText("Length (mm)")).toHaveValue("1000");
  });

  it("puts the active unit in each label", () => {
    renderEn(
      <DimensionGrid>
        <DimensionField idPrefix="pfm" fieldKey="diameter" label="Diameter" value="2" unit="inch" onChange={() => {}} />
      </DimensionGrid>
    );
    expect(screen.getByLabelText("Diameter (inch)")).toBeInTheDocument();
  });

  it("surfaces a field error", () => {
    renderEn(
      <DimensionGrid>
        <DimensionField idPrefix="pfm" fieldKey="wallThickness" label="Wall Thickness" value="30" unit="mm"
          onChange={() => {}} error="Wall must be less than half the side (under 25.00)" />
      </DimensionGrid>
    );
    expect(screen.getByText(/less than half the side/)).toBeInTheDocument();
    expect(screen.getByLabelText("Wall Thickness (mm)")).toHaveAttribute("aria-invalid", "true");
  });
});

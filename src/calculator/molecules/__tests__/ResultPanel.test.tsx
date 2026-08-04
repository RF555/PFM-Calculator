import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { ResultPanel } from "../ResultPanel";

const RESULT = { unitKg: 15.4134, volumeCm3: 1963.4954 };

function renderEn(ui: React.ReactElement) {
  return render(
    <LanguageProvider language="en" setLanguage={() => {}}>{ui}</LanguageProvider>
  );
}

function renderHe(ui: React.ReactElement) {
  return render(
    <LanguageProvider language="he" setLanguage={() => {}}>{ui}</LanguageProvider>
  );
}

describe("ResultPanel", () => {
  it("renders a placeholder before any result", () => {
    renderEn(<ResultPanel result={null} quantity={1} massUnit="kg" />);
    // Both the Volume and Weight stats show the placeholder when there is no
    // result yet, so more than one "—" is expected on screen.
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows kg first and lbs beneath when kg is primary", () => {
    renderEn(<ResultPanel result={RESULT} quantity={1} massUnit="kg" />);
    expect(screen.getByTestId("total-primary")).toHaveTextContent("15.4134 kg");
    // kgToLbs uses LBS_PER_KG = 2.20462 (model/units.ts): 15.4134 * 2.20462 = 33.98069 -> "33.9807"
    expect(screen.getByTestId("total-secondary")).toHaveTextContent("33.9807 lbs");
  });

  it("swaps emphasis when lbs is primary, keeping both visible", () => {
    renderEn(<ResultPanel result={RESULT} quantity={1} massUnit="lbs" />);
    expect(screen.getByTestId("total-primary")).toHaveTextContent("33.9807 lbs");
    expect(screen.getByTestId("total-secondary")).toHaveTextContent("15.4134 kg");
  });

  it("shows unit weight separately once quantity exceeds one", () => {
    renderEn(<ResultPanel result={RESULT} quantity={10} massUnit="kg" />);
    expect(screen.getByTestId("unit-primary")).toHaveTextContent("15.4134 kg");
    expect(screen.getByTestId("total-primary")).toHaveTextContent("154.134 kg");
  });

  it("computes the total from full precision, not the rounded display", () => {
    renderEn(<ResultPanel result={{ unitKg: 0.2466150233, volumeCm3: 31.4 }}
      quantity={10000} massUnit="kg" />);
    // 0.2466150233 * 10000 = 2466.150233 -> "2466.1502"
    // Multiplying the displayed 0.2466 would give 2466.00
    expect(screen.getByTestId("total-primary")).toHaveTextContent("2466.1502 kg");
  });

  it("renders no action buttons — the panel only displays", () => {
    renderEn(<ResultPanel result={RESULT} quantity={2} massUnit="kg" />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("marks result values dir=\"ltr\" so digits don't get mirrored", () => {
    renderEn(<ResultPanel result={RESULT} quantity={10} massUnit="kg" />);
    expect(screen.getByTestId("total-primary")).toHaveAttribute("dir", "ltr");
    expect(screen.getByTestId("total-secondary")).toHaveAttribute("dir", "ltr");
    expect(screen.getByTestId("unit-primary")).toHaveAttribute("dir", "ltr");
  });

  it("marks result values dir=\"ltr\" even when the surrounding UI is Hebrew/rtl", () => {
    renderHe(<ResultPanel result={RESULT} quantity={10} massUnit="kg" />);
    expect(screen.getByTestId("total-primary")).toHaveAttribute("dir", "ltr");
    expect(screen.getByTestId("total-secondary")).toHaveAttribute("dir", "ltr");
    expect(screen.getByTestId("unit-primary")).toHaveAttribute("dir", "ltr");
  });
});

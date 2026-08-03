import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResultPanel } from "../ResultPanel";

const RESULT = { unitKg: 15.4134, volumeCm3: 1963.4954 };

describe("ResultPanel", () => {
  it("renders a placeholder before any result", () => {
    render(<ResultPanel result={null} quantity={1} massUnit="kg" />);
    // Both the Volume and Weight stats show the placeholder when there is no
    // result yet, so more than one "—" is expected on screen.
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows kg first and lbs beneath when kg is primary", () => {
    render(<ResultPanel result={RESULT} quantity={1} massUnit="kg" />);
    expect(screen.getByTestId("total-primary")).toHaveTextContent("15.4134 kg");
    // kgToLbs uses LBS_PER_KG = 2.20462 (model/units.ts): 15.4134 * 2.20462 = 33.98069 -> "33.9807"
    expect(screen.getByTestId("total-secondary")).toHaveTextContent("33.9807 lbs");
  });

  it("swaps emphasis when lbs is primary, keeping both visible", () => {
    render(<ResultPanel result={RESULT} quantity={1} massUnit="lbs" />);
    expect(screen.getByTestId("total-primary")).toHaveTextContent("33.9807 lbs");
    expect(screen.getByTestId("total-secondary")).toHaveTextContent("15.4134 kg");
  });

  it("shows unit weight separately once quantity exceeds one", () => {
    render(<ResultPanel result={RESULT} quantity={10} massUnit="kg" />);
    expect(screen.getByTestId("unit-primary")).toHaveTextContent("15.4134 kg");
    expect(screen.getByTestId("total-primary")).toHaveTextContent("154.134 kg");
  });

  it("computes the total from full precision, not the rounded display", () => {
    render(<ResultPanel result={{ unitKg: 0.2466150233, volumeCm3: 31.4 }}
      quantity={10000} massUnit="kg" />);
    // 0.2466150233 * 10000 = 2466.150233 -> "2466.1502"
    // Multiplying the displayed 0.2466 would give 2466.00
    expect(screen.getByTestId("total-primary")).toHaveTextContent("2466.1502 kg");
  });

  it("hands the copy payload to the host rather than notifying itself", async () => {
    const onCopy = vi.fn();
    render(<ResultPanel result={RESULT} quantity={2} massUnit="kg" onCopy={onCopy} />);
    await userEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onCopy.mock.calls[0][0]).toContain("15.4134");
  });
});

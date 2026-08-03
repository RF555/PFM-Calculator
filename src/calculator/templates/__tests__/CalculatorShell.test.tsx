import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CalculatorShell } from "../CalculatorShell";

describe("CalculatorShell", () => {
  it("applies the component root class", () => {
    const { container } = render(<CalculatorShell>content</CalculatorShell>);
    expect(container.querySelector(".pfm-calc")).toBeInTheDocument();
  });

  it("defaults to comfortable density", () => {
    const { container } = render(<CalculatorShell>content</CalculatorShell>);
    expect(container.querySelector(".pfm-calc")).toHaveAttribute("data-density", "comfortable");
  });

  it("accepts a compact density", () => {
    const { container } = render(<CalculatorShell density="compact">content</CalculatorShell>);
    expect(container.querySelector(".pfm-calc")).toHaveAttribute("data-density", "compact");
  });

  it("merges a host-supplied className", () => {
    const { container } = render(<CalculatorShell className="host-x">content</CalculatorShell>);
    const root = container.querySelector(".pfm-calc");
    expect(root).toHaveClass("pfm-calc");
    expect(root).toHaveClass("host-x");
  });

  it("renders no dialog role — the host owns the wrapper", () => {
    render(<CalculatorShell>content</CalculatorShell>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

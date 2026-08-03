import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "../SegmentedControl";

const OPTIONS = [
  { value: "mm", label: "mm" },
  { value: "inch", label: "inch" },
];

describe("SegmentedControl", () => {
  it("exposes a labelled radiogroup", () => {
    render(<SegmentedControl label="Unit" options={OPTIONS} value="mm" onChange={() => {}} />);
    expect(screen.getByRole("radiogroup", { name: "Unit" })).toBeInTheDocument();
  });

  it("marks only the selected option as checked", () => {
    render(<SegmentedControl label="Unit" options={OPTIONS} value="mm" onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "mm" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "inch" })).toHaveAttribute("aria-checked", "false");
  });

  it("is a single tab stop via roving tabindex", () => {
    render(<SegmentedControl label="Unit" options={OPTIONS} value="mm" onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "mm" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "inch" })).toHaveAttribute("tabindex", "-1");
  });

  it("selects the next option on ArrowRight", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Unit" options={OPTIONS} value="mm" onChange={onChange} />);
    screen.getByRole("radio", { name: "mm" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("inch");
  });

  it("wraps from the last option to the first", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Unit" options={OPTIONS} value="inch" onChange={onChange} />);
    screen.getByRole("radio", { name: "inch" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("mm");
  });

  it("selects on click", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Unit" options={OPTIONS} value="mm" onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "inch" }));
    expect(onChange).toHaveBeenCalledWith("inch");
  });
});

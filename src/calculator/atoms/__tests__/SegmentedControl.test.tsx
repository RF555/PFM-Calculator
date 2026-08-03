import { readFileSync } from "node:fs";
import { join } from "node:path";
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

  // jsdom does not run layout or resolve the stylesheet cascade, so a rendered
  // option's computed height can't be asserted from a DOM test. Instead this
  // reads the CSS source directly and checks that the option — the actual tap
  // target — carries the full 44px touch-target token rather than a reduced
  // value, so a future "optimisation" can't silently shrink it below 44px.
  it("keeps the option's tap target at the full touch-target height", () => {
    const cssPath = join(import.meta.dirname, "../SegmentedControl.css");
    const css = readFileSync(cssPath, "utf-8");
    const optionRule = css.slice(css.indexOf(".pfm-segmented__option {"));

    expect(optionRule).toContain("min-height: var(--pfm-control-h);");
    expect(optionRule).not.toMatch(/min-height:\s*calc\(var\(--pfm-control-h\)\s*-\s*/);
  });
});

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

  // A 3-option fixture starting on the MIDDLE option, so forward (index+1)
  // and backward (index-1) land on different neighbours — with only 2
  // options, move(1) and move(-1) wrap to the same element and the RTL
  // assertion can't tell a working fix from a broken one.
  //
  // jsdom does not resolve `getComputedStyle().direction` from a `dir`
  // attribute (own or ancestor) — only from an inline `style.direction` set
  // directly on the queried element. SegmentedControl reads direction from
  // its own root (the ref'd `.pfm-segmented` div), so the style has to be
  // set on that exact node, not a wrapping container. Each test verifies the
  // computed style actually resolved to "rtl" before asserting on key
  // behaviour, so a silent regression in this setup can't masquerade as a
  // passing test.
  const RTL_OPTIONS = [
    { value: "mm", label: "mm" },
    { value: "inch", label: "inch" },
    { value: "cm", label: "cm" },
  ];

  function renderRtl(value: string, onChange: (value: string) => void) {
    const { container } = render(
      <SegmentedControl label="Unit" options={RTL_OPTIONS} value={value} onChange={onChange} />
    );
    const root = container.querySelector(".pfm-segmented") as HTMLElement;
    root.style.direction = "rtl";
    expect(getComputedStyle(root).direction).toBe("rtl");
    return root;
  }

  it("ArrowLeft selects the next option in an RTL container", async () => {
    const onChange = vi.fn();
    renderRtl("inch", onChange);
    screen.getByRole("radio", { name: "inch" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith("cm");
  });

  it("ArrowRight selects the previous option in an RTL container", async () => {
    const onChange = vi.fn();
    renderRtl("inch", onChange);
    screen.getByRole("radio", { name: "inch" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("mm");
  });

  it("ArrowDown selects the next option regardless of direction", async () => {
    const onChange = vi.fn();
    renderRtl("inch", onChange);
    screen.getByRole("radio", { name: "inch" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenCalledWith("cm");
  });

  it("ArrowUp selects the previous option regardless of direction", async () => {
    const onChange = vi.fn();
    renderRtl("inch", onChange);
    screen.getByRole("radio", { name: "inch" }).focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenCalledWith("mm");
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

import { render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveRegion } from "../LiveRegion";

describe("LiveRegion", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders an empty polite atomic region on mount", () => {
    render(<LiveRegion message="" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region).toHaveTextContent("");
  });

  it("does not announce before the debounce elapses", () => {
    render(<LiveRegion message="14.5 kilograms" />);
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("announces once the debounce elapses", () => {
    render(<LiveRegion message="14.5 kilograms" />);
    act(() => { vi.advanceTimersByTime(700); });
    expect(screen.getByRole("status")).toHaveTextContent("14.5 kilograms");
  });

  it("announces only the latest value when updates arrive quickly", () => {
    const { rerender } = render(<LiveRegion message="1 kilogram" />);
    act(() => { vi.advanceTimersByTime(200); });
    rerender(<LiveRegion message="10 kilograms" />);
    act(() => { vi.advanceTimersByTime(200); });
    rerender(<LiveRegion message="100 kilograms" />);
    act(() => { vi.advanceTimersByTime(700); });
    expect(screen.getByRole("status")).toHaveTextContent("100 kilograms");
  });
});

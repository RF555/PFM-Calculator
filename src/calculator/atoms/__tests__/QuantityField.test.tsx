import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuantityField } from "../QuantityField";

describe("QuantityField", () => {
  it("renders the current quantity", () => {
    render(<QuantityField value={3} onChange={() => {}} />);
    expect(screen.getByLabelText("Quantity")).toHaveValue("3");
  });

  it("increments and decrements", async () => {
    const onChange = vi.fn();
    render(<QuantityField value={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(onChange).toHaveBeenCalledWith(4);
    await userEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables decrement at the minimum", () => {
    render(<QuantityField value={1} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
  });

  it("ignores non-numeric typing", async () => {
    const onChange = vi.fn();
    render(<QuantityField value={1} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Quantity"), "x");
    expect(onChange).not.toHaveBeenCalled();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "../NumberField";

describe("NumberField", () => {
  it("uses a text input with a decimal inputmode", () => {
    render(<NumberField id="len" label="Length" value="" onChange={() => {}} />);
    const input = screen.getByLabelText("Length");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "decimal");
  });

  it("reports exactly what was typed, including fractions", async () => {
    // Wrapped in a stateful harness: with a static no-op onChange, the
    // controlled `value` stays pinned at "" and React resets the DOM value
    // after every keystroke, so userEvent.type only ever reports its last
    // character. Feeding onChange back into value mirrors real usage.
    const onChange = vi.fn();
    function Wrapper() {
      const [value, setValue] = useState("");
      return (
        <NumberField
          id="len"
          label="Length"
          value={value}
          onChange={(raw) => {
            onChange(raw);
            setValue(raw);
          }}
        />
      );
    }
    render(<Wrapper />);
    await userEvent.type(screen.getByLabelText("Length"), "1 1/2");
    expect(onChange).toHaveBeenLastCalledWith("1 1/2");
  });

  it("wires aria-invalid and aria-describedby when in error", () => {
    render(
      <NumberField id="len" label="Length" value="abc" onChange={() => {}}
        error="Enter a number" />
    );
    const input = screen.getByLabelText("Length");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "len-error");
    expect(screen.getByText("Enter a number")).toHaveAttribute("id", "len-error");
  });

  it("sets neither aria-invalid nor aria-describedby when valid", () => {
    render(<NumberField id="len" label="Length" value="50" onChange={() => {}} />);
    const input = screen.getByLabelText("Length");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("calls onBlur so validation can be deferred until focus leaves", async () => {
    const onBlur = vi.fn();
    render(
      <>
        <NumberField id="len" label="Length" value="50" onChange={() => {}} onBlur={onBlur} />
        <button>elsewhere</button>
      </>
    );
    await userEvent.click(screen.getByLabelText("Length"));
    await userEvent.click(screen.getByRole("button", { name: "elsewhere" }));
    expect(onBlur).toHaveBeenCalled();
  });
});

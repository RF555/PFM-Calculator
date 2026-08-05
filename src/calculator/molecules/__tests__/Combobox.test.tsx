import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { Combobox } from "../Combobox";

function renderEn(ui: React.ReactElement) {
  return render(
    <LanguageProvider language="en" setLanguage={() => {}}>{ui}</LanguageProvider>
  );
}

// jsdom has neither ResizeObserver nor scrollIntoView; cmdk uses both to
// keep the active option in view. Minimal no-op stubs are enough here.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
  ResizeObserverStub;
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

const OPTIONS = [
  { value: "steel", label: "Steel" },
  { value: "aluminum", label: "Aluminum" },
  { value: "titanium", label: "Titanium" },
];

describe("Combobox", () => {
  it("shows the placeholder when nothing is selected", () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={() => {}} />);
    expect(screen.getByRole("combobox", { name: "Material" }))
      .toHaveTextContent("Select material");
  });

  it("shows the selected option label", () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value="steel" onChange={() => {}} />);
    expect(screen.getByRole("combobox", { name: "Material" })).toHaveTextContent("Steel");
  });

  it("opens on click and lists every option", async () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={() => {}} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));
    expect(screen.getByRole("option", { name: "Steel" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Aluminum" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Titanium" })).toBeInTheDocument();
  });

  it("filters as the user types", async () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={() => {}} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));
    await userEvent.type(screen.getByPlaceholderText("Search…"), "tita");
    expect(screen.getByRole("option", { name: "Titanium" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Steel" })).not.toBeInTheDocument();
  });

  it("reports the chosen value", async () => {
    const onChange = vi.fn();
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));
    await userEvent.click(screen.getByRole("option", { name: "Aluminum" }));
    expect(onChange).toHaveBeenCalledWith("aluminum");
  });

  it("shows an empty state when nothing matches", async () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={() => {}} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));
    await userEvent.type(screen.getByPlaceholderText("Search…"), "zzzz");
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("explains why it is disabled rather than being silently dead", () => {
    renderEn(<Combobox id="g" label="Grade" placeholder="Select grade"
      options={[]} value={null} onChange={() => {}}
      disabled disabledHint="Select a material first" />);
    const trigger = screen.getByRole("combobox", { name: "Grade" });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveTextContent("Select a material first");
  });

  it("closes on Escape", async () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={() => {}} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Material" }));
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByPlaceholderText("Search…")).not.toBeInTheDocument();
  });

  it("leaves the search box unfocused on open, keeping focus on the trigger", async () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={() => {}} />);
    const trigger = screen.getByRole("combobox", { name: "Material" });
    await userEvent.click(trigger);
    expect(screen.getByPlaceholderText("Search…")).not.toHaveFocus();
    expect(trigger).toHaveFocus();
  });

  it("moves into the search box on ArrowDown, so the keyboard path still works", async () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={() => {}} />);
    screen.getByRole("combobox", { name: "Material" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(await screen.findByPlaceholderText("Search…")).toHaveFocus();
  });

  it("closes on Escape while focus is still on the trigger", async () => {
    renderEn(<Combobox id="m" label="Material" placeholder="Select material"
      options={OPTIONS} value={null} onChange={() => {}} />);
    const trigger = screen.getByRole("combobox", { name: "Material" });
    await userEvent.click(trigger);
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByPlaceholderText("Search…")).not.toBeInTheDocument();
  });

  it("localizes its search placeholder and empty state", async () => {
    render(
      <LanguageProvider language="he" setLanguage={() => {}}>
        <Combobox id="m" label="חומר" placeholder="בחר חומר"
          options={OPTIONS} value={null} onChange={() => {}} />
      </LanguageProvider>
    );
    await userEvent.click(screen.getByRole("combobox", { name: "חומר" }));
    expect(screen.getByPlaceholderText("חיפוש…")).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText("חיפוש…"), "zzz");
    expect(screen.getByText("אין תוצאות")).toBeInTheDocument();
  });
});

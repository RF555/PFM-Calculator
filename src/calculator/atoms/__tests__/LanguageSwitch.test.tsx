import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import type { Language } from "../../i18n/types";
import { LanguageSwitch } from "../LanguageSwitch";

function Harness({ initial = "he" as Language }) {
  const [language, setLanguage] = useState<Language>(initial);
  return (
    <LanguageProvider language={language} setLanguage={setLanguage}>
      <LanguageSwitch />
      <span data-testid="active">{language}</span>
    </LanguageProvider>
  );
}

describe("LanguageSwitch", () => {
  it("marks the active language as checked", () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "עברית" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "English" })).not.toBeChecked();
  });

  it("switches the language on click", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("radio", { name: "English" }));
    expect(screen.getByTestId("active")).toHaveTextContent("en");
  });

  it("labels the group in the active language", () => {
    render(<Harness initial="en" />);
    expect(screen.getByRole("radiogroup", { name: "Language" })).toBeInTheDocument();
  });
});

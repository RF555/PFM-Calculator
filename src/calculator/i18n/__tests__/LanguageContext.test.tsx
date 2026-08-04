import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { LanguageProvider, useLanguage, useTranslate } from "../LanguageContext";
import type { Language } from "../types";

function Probe() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslate();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="text">{t("ui.material")}</span>
      <button onClick={() => setLanguage(language === "he" ? "en" : "he")}>
        toggle
      </button>
    </div>
  );
}

function Harness({ initial = "he" as Language }) {
  const [language, setLanguage] = useState<Language>(initial);
  return (
    <LanguageProvider language={language} setLanguage={setLanguage}>
      <Probe />
    </LanguageProvider>
  );
}

describe("LanguageProvider", () => {
  it("provides the active language to consumers", () => {
    render(<Harness />);
    expect(screen.getByTestId("lang")).toHaveTextContent("he");
    expect(screen.getByTestId("text")).toHaveTextContent("חומר");
  });

  it("resolves strings in the active language", () => {
    render(<Harness initial="en" />);
    expect(screen.getByTestId("text")).toHaveTextContent("Material");
  });

  it("re-renders consumers when the language changes", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    expect(screen.getByTestId("text")).toHaveTextContent("Material");
  });

  it("falls back to the default language outside a provider", () => {
    render(<Probe />);
    expect(screen.getByTestId("lang")).toHaveTextContent("he");
    expect(screen.getByTestId("text")).toHaveTextContent("חומר");
  });
});

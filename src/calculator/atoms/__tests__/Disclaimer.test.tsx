import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LanguageProvider } from "../../i18n/LanguageContext";
import { Disclaimer } from "../Disclaimer";

function renderEn(ui: React.ReactElement) {
  return render(
    <LanguageProvider language="en" setLanguage={() => {}}>{ui}</LanguageProvider>
  );
}

describe("Disclaimer", () => {
  it("shows the summary sentence without any interaction", () => {
    renderEn(<Disclaimer idPrefix="t" />);
    expect(screen.getByText(/Theoretical estimate only/)).toBeInTheDocument();
  });

  it("keeps the panel hidden until the trigger is activated", () => {
    renderEn(<Disclaimer idPrefix="t" />);
    const trigger = screen.getByRole("button", { name: "Why weights vary" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/varies between heats/)).not.toBeInTheDocument();
  });

  it("opens on click and marks the trigger expanded", async () => {
    renderEn(<Disclaimer idPrefix="t" />);
    await userEvent.click(screen.getByRole("button", { name: "Why weights vary" }));
    expect(screen.getByRole("button", { name: "Why weights vary" }))
      .toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/varies between heats/)).toBeInTheDocument();
  });

  it("closes when the trigger is activated again", async () => {
    renderEn(<Disclaimer idPrefix="t" />);
    const trigger = screen.getByRole("button", { name: "Why weights vary" });
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on the close button and returns focus to the trigger", async () => {
    renderEn(<Disclaimer idPrefix="t" />);
    const trigger = screen.getByRole("button", { name: "Why weights vary" });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    renderEn(<Disclaimer idPrefix="t" />);
    const trigger = screen.getByRole("button", { name: "Why weights vary" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("leaves focus on the trigger when opening — the panel is not a dialog", async () => {
    renderEn(<Disclaimer idPrefix="t" />);
    const trigger = screen.getByRole("button", { name: "Why weights vary" });
    await userEvent.click(trigger);
    expect(trigger).toHaveFocus();
  });

  it("does not open on hover", async () => {
    renderEn(<Disclaimer idPrefix="t" />);
    const trigger = screen.getByRole("button", { name: "Why weights vary" });
    await userEvent.hover(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("points aria-controls at the namespaced panel id", async () => {
    renderEn(<Disclaimer idPrefix="abc" />);
    const trigger = screen.getByRole("button", { name: "Why weights vary" });
    expect(trigger).toHaveAttribute("aria-controls", "abc-disclaimer");
    await userEvent.click(trigger);
    expect(document.getElementById("abc-disclaimer")).toBeInTheDocument();
  });

  it("renders the trigger as a non-submitting button", () => {
    renderEn(<Disclaimer idPrefix="t" />);
    expect(screen.getByRole("button", { name: "Why weights vary" }))
      .toHaveAttribute("type", "button");
  });

  it("hides the decorative icon from assistive technology", () => {
    const { container } = renderEn(<Disclaimer idPrefix="t" />);
    const svg = container.querySelector(".pfm-disclaimer__trigger svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("isolates Latin runs inside Hebrew text with bdi", async () => {
    render(
      <LanguageProvider language="he" setLanguage={() => {}}>
        <Disclaimer idPrefix="t" />
      </LanguageProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "למה המשקלים משתנים" }));
    const isolated = Array.from(document.querySelectorAll("bdi")).map((n) => n.textContent);
    expect(isolated).toContain("EN 10029");
    expect(isolated).toContain("ASTM A6");
  });

  it("closes on a click outside without stealing focus back", async () => {
    renderEn(
      <>
        <Disclaimer idPrefix="t" />
        <button type="button">elsewhere</button>
      </>
    );
    const trigger = screen.getByRole("button", { name: "Why weights vary" });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "elsewhere" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveFocus();
  });

  it("accepts a summary override while keeping the default points", async () => {
    renderEn(<Disclaimer idPrefix="t" text={{ summary: "Custom notice." }} />);
    expect(screen.getByText("Custom notice.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Why weights vary" }));
    expect(screen.getByText(/varies between heats/)).toBeInTheDocument();
  });

  it("ignores an empty points override rather than rendering an empty panel", async () => {
    renderEn(<Disclaimer idPrefix="t" text={{ points: [] }} />);
    await userEvent.click(screen.getByRole("button", { name: "Why weights vary" }));
    expect(screen.getByText(/varies between heats/)).toBeInTheDocument();
  });
});

describe("Disclaimer styles", () => {
  const css = readFileSync(join(import.meta.dirname, "../Disclaimer.css"), "utf-8");
  const rule = (selector: string) => {
    const start = css.indexOf(selector + " {");
    expect(start, `${selector} rule is missing`).toBeGreaterThan(-1);
    return css.slice(start, css.indexOf("}", start));
  };

  it("keeps the trigger at the minimum target size", () => {
    expect(rule(".pfm-disclaimer__trigger")).toContain("min-block-size: 24px");
  });

  // The panel must never escape the widget's border box: a host page can put
  // overflow:hidden on an ancestor, and a clipped legal notice is worse than
  // none. max-block-size is what guarantees containment.
  it("caps the panel inside the widget box", () => {
    expect(rule(".pfm-disclaimer__panel")).toContain("max-block-size");
  });

  // An absolutely-positioned child of a scroll container scrolls away with
  // the content. The close button must be a flex sibling of the scrolling
  // body, positioned with align-self, never with inset-*.
  it("keeps the close button out of the scroll container", () => {
    const closeRule = rule(".pfm-disclaimer__close");
    expect(closeRule).toContain("align-self");
    expect(closeRule).not.toContain("position: absolute");
  });

  it("scrolls the body rather than the panel", () => {
    expect(rule(".pfm-disclaimer__body")).toContain("overflow-y");
  });

  // Berman v. Freedom Financial rejected notice set in "tiny gray font".
  // The summary must use the full foreground token, not the muted one.
  it("does not mute the summary text", () => {
    expect(rule(".pfm-disclaimer__summary")).toContain("var(--pfm-fg)");
    expect(rule(".pfm-disclaimer__summary")).not.toContain("var(--pfm-muted)");
  });
});

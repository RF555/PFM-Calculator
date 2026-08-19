import { describe, expect, it, vi } from "vitest";
import { STRINGS, translate } from "../strings";

describe("dictionaries", () => {
  it("he and en have identical key sets", () => {
    const he = Object.keys(STRINGS.he).sort();
    const en = Object.keys(STRINGS.en).sort();
    expect(he).toEqual(en);
  });

  it("has no empty values", () => {
    for (const [language, dict] of Object.entries(STRINGS)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value, `${language}.${key} is empty`).not.toBe("");
      }
    }
  });

  it("has every density key in both languages", () => {
    const keys = [
      "ui.density",
      "ui.densityEdit",
      "ui.densityEdited",
      "ui.densityDisabledHint",
      "error.densityRange",
      "a11y.densityOverridden",
    ];
    for (const key of keys) {
      expect(STRINGS.en[key], `en.${key}`).toBeTruthy();
      expect(STRINGS.he[key], `he.${key}`).toBeTruthy();
    }
  });

  it("keeps the bound placeholders in the density range message", () => {
    for (const language of ["en", "he"] as const) {
      expect(STRINGS[language]["error.densityRange"]).toContain("{min}");
      expect(STRINGS[language]["error.densityRange"]).toContain("{max}");
    }
  });

  it("has every legal key in both languages", () => {
    const keys = [
      "legal.summary",
      "legal.why",
      "legal.whyLabel",
      "legal.close",
      "legal.heading",
      "legal.point1",
      "legal.point2",
      "legal.point3",
      "legal.point4",
      "legal.point5",
      "legal.point6",
    ];
    for (const key of keys) {
      expect(STRINGS.en[key], `en.${key}`).toBeTruthy();
      expect(STRINGS.he[key], `he.${key}`).toBeTruthy();
    }
  });

  // legal.whyLabel now labels the PANEL, not the trigger. The trigger carries no
  // aria-label at all, so its visible text is its accessible name and SC 2.5.3
  // Label in Name holds by construction rather than by string comparison.
  it("gives the panel a label that names its subject", () => {
    for (const language of ["en", "he"] as const) {
      expect(STRINGS[language]["legal.whyLabel"].length).toBeGreaterThan(
        STRINGS[language]["legal.why"].length
      );
    }
  });

  // Hebrew punctuation sits at the LOGICAL end of the string; the bidi algorithm
  // then renders it at the visual left. Leading the "?" put it on the wrong side
  // on screen — a real bug this guards against.
  it("ends the Hebrew trigger strings with their question mark", () => {
    expect(STRINGS.he["legal.why"].startsWith("?")).toBe(false);
    expect(STRINGS.he["legal.why"].endsWith("?")).toBe(true);
    expect(STRINGS.he["legal.whyLabel"].startsWith("?")).toBe(false);
    expect(STRINGS.he["legal.whyLabel"].endsWith("?")).toBe(true);
  });

  it("keeps the quantity placeholder in the revised total label", () => {
    for (const language of ["en", "he"] as const) {
      expect(STRINGS[language]["ui.total"]).toContain("{quantity}");
    }
  });

  it("labels the weight results as theoretical", () => {
    expect(STRINGS.en["ui.weight"]).toBe("Theoretical weight");
    expect(STRINGS.he["ui.weight"]).toBe("משקל תיאורטי");
  });
});

describe("translate", () => {
  it("returns the string for the active language", () => {
    expect(translate("en", "ui.material")).toBe("Material");
    expect(translate("he", "ui.material")).toBe("חומר");
  });

  it("substitutes named params", () => {
    expect(translate("en", "constraint.wallHalfSide", { max: 25 }))
      .toContain("25");
  });

  it("falls back to English when the key is missing in the active language", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error deliberately deleting to simulate a missing translation
    const original = STRINGS.he["ui.material"];
    delete STRINGS.he["ui.material"];
    expect(translate("he", "ui.material")).toBe("Material");
    STRINGS.he["ui.material"] = original;
    warn.mockRestore();
  });

  it("returns the key itself when it exists in neither language", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(translate("he", "does.not.exist")).toBe("does.not.exist");
    warn.mockRestore();
  });

  it("leaves an unmatched placeholder intact", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(translate("en", "constraint.wallHalfSide", {})).toContain("{max}");
    warn.mockRestore();
  });

  it("falls back to English instead of throwing when the language itself is unknown", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error deliberately passing a language outside the closed union
    expect(translate("fr", "ui.material")).toBe("Material");
    warn.mockRestore();
  });
});

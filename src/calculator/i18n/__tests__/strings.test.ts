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
      "ui.densityDone",
      "ui.densityCancel",
      "ui.densityReset",
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

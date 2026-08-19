import { describe, expect, it } from "vitest";
import { sortOptions } from "../sortOptions";

const labels = (options: { value: string; label: string }[]) =>
  options.map((o) => o.label);

const opts = (...names: string[]) =>
  names.map((n) => ({ value: n.toLowerCase(), label: n }));

describe("sortOptions", () => {
  it("orders labels alphabetically in English", () => {
    const sorted = sortOptions(opts("Steel", "Aluminum", "Titanium"), "en");
    expect(labels(sorted)).toEqual(["Aluminum", "Steel", "Titanium"]);
  });

  it("orders labels by the Hebrew alphabet in Hebrew", () => {
    const sorted = sortOptions(opts("פלדה", "אלומיניום", "נחושת"), "he");
    expect(labels(sorted)).toEqual(["אלומיניום", "נחושת", "פלדה"]);
  });

  it("sorts on the translated label, so the order follows the language", () => {
    // Same three materials, each labelled in one language: the resulting
    // sequences differ, because each is alphabetical in its own script.
    const en = sortOptions(opts("Copper", "Brass", "Steel"), "en");
    const he = sortOptions(opts("נחושת", "פליז", "פלדה"), "he");
    expect(labels(en)).toEqual(["Brass", "Copper", "Steel"]);
    // Hebrew order is פ-ל-ד before פ-ל-י, and both after נ.
    expect(labels(he)).toEqual(["נחושת", "פלדה", "פליז"]);
  });

  it("compares embedded numbers numerically, not digit by digit", () => {
    const sorted = sortOptions(opts("Gr.12", "Gr.2", "Gr.9", "Gr.1"), "en");
    expect(labels(sorted)).toEqual(["Gr.1", "Gr.2", "Gr.9", "Gr.12"]);
  });

  it("keeps grade families in numeric order", () => {
    // Real cases from the bundled catalog that a plain string sort interleaves.
    expect(labels(sortOptions(opts("PA 66", "PA 6", "PA 12"), "en")))
      .toEqual(["PA 6", "PA 12", "PA 66"]);
    expect(labels(sortOptions(opts("PE 1000 (UHMW-PE)", "PE 500 (HMW-PE)"), "en")))
      .toEqual(["PE 500 (HMW-PE)", "PE 1000 (UHMW-PE)"]);
    expect(labels(sortOptions(opts("Hastelloy C-276", "Hastelloy C-4", "Hastelloy C-22"), "en")))
      .toEqual(["Hastelloy C-4", "Hastelloy C-22", "Hastelloy C-276"]);
  });

  it("leaves the caller's array untouched", () => {
    const input = opts("Steel", "Aluminum");
    sortOptions(input, "en");
    expect(labels(input)).toEqual(["Steel", "Aluminum"]);
  });

  it("handles empty and single-entry lists", () => {
    expect(sortOptions([], "en")).toEqual([]);
    expect(labels(sortOptions(opts("Steel"), "en"))).toEqual(["Steel"]);
  });
});

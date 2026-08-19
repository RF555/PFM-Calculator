import type { Language } from "../i18n/types";
import type { ComboboxOption } from "../molecules/Combobox";

/**
 * Collators are expensive to construct and the option lists are re-sorted on
 * every render, so one instance per language is kept around.
 */
const collators = new Map<Language, Intl.Collator>();

function collator(language: Language): Intl.Collator {
  let c = collators.get(language);
  if (!c) {
    /*
     * numeric: runs of digits compare as numbers, which is what makes grade
     * codes read correctly — "Gr.12" lands after "Gr.9", "PA 66" after "PA 6",
     * and "Hastelloy C-276" after "C-4", where a digit-by-digit string sort
     * would interleave them. base sensitivity keeps case and diacritics from
     * splitting the order.
     */
    c = new Intl.Collator(language, { numeric: true, sensitivity: "base" });
    collators.set(language, c);
  }
  return c;
}

/**
 * Orders dropdown options by their displayed label in the active language, so
 * the list reads alphabetically to the user in Hebrew and English alike. The
 * order therefore changes when the language does. Returns a new array; the
 * input is left untouched.
 */
export function sortOptions(
  options: ComboboxOption[],
  language: Language
): ComboboxOption[] {
  const compare = collator(language);
  return [...options].sort((a, b) => compare.compare(a.label, b.label));
}

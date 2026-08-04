/** Supported interface languages. Hebrew is the default. */
export type Language = "he" | "en";

/** A value that exists in both languages. */
export interface Localized<T> {
  he: T;
  en: T;
}

/** Values substituted into a translation's {name} placeholders. */
export type TranslationParams = Record<string, string | number>;

/** Flat key -> string map for one language. */
export type Dictionary = Record<string, string>;

import type { Localized } from "../i18n/types";

export interface Grade {
  id: string;
  name: Localized<string>;
  density: number;
}

export interface Material {
  id: string;
  name: Localized<string>;
  grades: Grade[];
}

export interface MaterialsFile {
  version: number;
  materials: Material[];
}

const MIN_DENSITY = 1;
const MAX_DENSITY = 25_000;

/**
 * Every name carries both locales. A plain string — the pre-v2 shape — is
 * rejected rather than coerced, so stale data fails at the boundary instead
 * of rendering "[object Object]" in a dropdown.
 */
function validateName(name: unknown, what: string): Localized<string> {
  if (!name || typeof name !== "object" || Array.isArray(name)) {
    throw new Error(
      `${what} name must be an object with "he" and "en" (got ${JSON.stringify(name)})`
    );
  }
  const localized = name as Partial<Localized<string>>;
  for (const locale of ["he", "en"] as const) {
    const value = localized[locale];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`${what} name is missing a non-empty "${locale}" translation`);
    }
  }
  return localized as Localized<string>;
}

/**
 * Validates a materials file. The file is hand-maintained, so an editing
 * mistake should fail the build rather than surface in a quote.
 */
export function validateMaterials(data: unknown): MaterialsFile {
  const file = data as MaterialsFile;

  if (!file || typeof file !== "object" || !Array.isArray(file.materials)) {
    throw new Error("materials file must be { version, materials: [] }");
  }

  const seenMaterialIds = new Set<string>();
  const seenGradeIds = new Set<string>();

  for (const m of file.materials) {
    if (!m.id) throw new Error(`material missing id: ${JSON.stringify(m)}`);
    validateName(m.name, `material "${m.id}"`);
    if (seenMaterialIds.has(m.id)) throw new Error(`duplicate material id: ${m.id}`);
    seenMaterialIds.add(m.id);

    if (!Array.isArray(m.grades) || m.grades.length === 0) {
      throw new Error(`material "${m.id}" must have at least one grade`);
    }

    for (const g of m.grades) {
      if (!g.id) throw new Error(`grade missing id in "${m.id}"`);
      validateName(g.name, `grade "${g.id}"`);
      if (seenGradeIds.has(g.id)) throw new Error(`duplicate grade id: ${g.id}`);
      seenGradeIds.add(g.id);

      if (typeof g.density !== "number" || !Number.isFinite(g.density)) {
        throw new Error(`grade "${g.id}" density must be a number`);
      }
      if (g.density < MIN_DENSITY || g.density > MAX_DENSITY) {
        throw new Error(
          `grade "${g.id}" density ${g.density} outside ${MIN_DENSITY}-${MAX_DENSITY} kg/m3`
        );
      }
    }
  }

  return file;
}

import type { Dictionary, Language, TranslationParams } from "./types";

export const LANGUAGES: readonly Language[] = ["he", "en"];

export const DEFAULT_LANGUAGE: Language = "he";

const en: Dictionary = {
  "ui.material": "Material",
  "ui.materialPlaceholder": "Select material",
  "ui.grade": "Grade",
  "ui.gradePlaceholder": "Select grade",
  "ui.gradeDisabledHint": "Select a material first",
  "ui.shape": "Shape",
  "ui.shapePlaceholder": "Select shape",
  "ui.quantity": "Quantity",
  "ui.reset": "Reset",
  "ui.search": "Search…",
  "ui.noMatches": "No matches",
  "ui.dimensionUnit": "Dimension unit",
  "ui.massUnit": "Mass unit",
  "ui.density": "Density",
  "ui.densityEdit": "Edit",
  "ui.densityDone": "Done",
  "ui.densityCancel": "Cancel",
  "ui.densityReset": "Reset to catalog",
  "ui.densityEdited": "edited",
  "ui.densityDisabledHint": "Select a grade first",
  "ui.language": "Language",
  "ui.dimensions": "Dimensions",
  "ui.results": "Results",
  "ui.volume": "Volume",
  "ui.unitWeight": "Unit weight",
  "ui.weight": "Weight",
  "ui.total": "Total (× {quantity})",
  // Dimension field label: "Diameter (mm)"
  "ui.fieldWithUnit": "{label} ({unit})",

  "unit.mm": "mm",
  "unit.inch": "inch",
  "unit.kg": "kg",
  "unit.lbs": "lbs",
  "unit.cm3": "cm³",
  "unit.kgm3": "kg/m³",

  "shape.sheet": "Sheet / Plate",
  "shape.roundBar": "Round Bar",
  "shape.squareBar": "Square Bar",
  "shape.flatBar": "Flat Bar",
  "shape.hexBar": "Hexagonal Bar",
  "shape.roundTubeOuter": "Round Tube (Outer Ø + Wall)",
  "shape.roundTubeInner": "Round Tube (Inner Ø + Wall)",
  "shape.rectangularHollow": "Rectangular Hollow Section",
  "shape.squareHollow": "Square Hollow Section",
  "shape.angle": "Angle (L-profile)",

  "field.length": "Length",
  "field.width": "Width",
  "field.height": "Height",
  "field.thickness": "Thickness",
  "field.diameter": "Diameter",
  "field.side": "Side",
  "field.flatToFlat": "Flat-to-Flat",
  "field.outerDiameter": "Outer Diameter",
  "field.innerDiameter": "Inner Diameter",
  "field.wallThickness": "Wall Thickness",
  "field.legA": "Leg A",
  "field.legB": "Leg B (optional)",

  "error.notANumber": "Enter a number",
  "error.notPositive": "Must be greater than zero",
  "error.densityRange": "Must be between {min} and {max} kg/m³",

  "constraint.wallHalfOuterDiameter":
    "Wall must be less than half the outer diameter (under {max})",
  "constraint.wallHalfSmallerSide":
    "Wall must be less than half the smaller side (under {max})",
  "constraint.wallHalfSide":
    "Wall must be less than half the side (under {max})",
  "constraint.thicknessSmallerLeg":
    "Thickness must be less than the smaller leg (under {max})",

  "a11y.unitWeightSpoken": "Unit {weight}. Total for {quantity} pieces, {total}.",
  "a11y.totalSpoken": "{total}.",
  "a11y.kilograms": "{value} kilograms",
  "a11y.pounds": "{value} pounds",
  "a11y.decreaseQuantity": "Decrease quantity",
  "a11y.increaseQuantity": "Increase quantity",
  "a11y.densityOverridden":
    "Density overridden: {value} kg/m³, catalog value {catalog} kg/m³",
};

const he: Dictionary = {
  "ui.material": "חומר",
  "ui.materialPlaceholder": "בחר חומר",
  "ui.grade": "סוג",
  "ui.gradePlaceholder": "בחר סוג",
  "ui.gradeDisabledHint": "בחר חומר תחילה",
  "ui.shape": "צורה",
  "ui.shapePlaceholder": "בחר צורה",
  "ui.quantity": "כמות",
  "ui.reset": "איפוס",
  "ui.search": "חיפוש…",
  "ui.noMatches": "אין תוצאות",
  "ui.dimensionUnit": "יחידת מידה",
  "ui.massUnit": "יחידת משקל",
  "ui.density": "צפיפות",
  "ui.densityEdit": "עריכה",
  "ui.densityDone": "אישור",
  "ui.densityCancel": "ביטול",
  "ui.densityReset": "איפוס לערך מקורי",
  "ui.densityEdited": "נערך",
  "ui.densityDisabledHint": "בחר סוג תחילה",
  "ui.language": "שפה",
  "ui.dimensions": "מידות",
  "ui.results": "תוצאות",
  "ui.volume": "נפח",
  "ui.unitWeight": "משקל ליחידה",
  "ui.weight": "משקל",
  "ui.total": "סה\"כ (× {quantity})",
  "ui.fieldWithUnit": "{label} ({unit})",

  "unit.mm": "מ\"מ",
  "unit.inch": "אינץ'",
  "unit.kg": "ק\"ג",
  "unit.lbs": "ליברה",
  "unit.cm3": "סמ\"ק",
  "unit.kgm3": "ק\"ג/מ\"ק",

  "shape.sheet": "פח / לוח",
  "shape.roundBar": "מוט עגול",
  "shape.squareBar": "מוט מרובע",
  "shape.flatBar": "מוט שטוח",
  "shape.hexBar": "מוט משושה",
  "shape.roundTubeOuter": "צינור עגול (קוטר חיצוני + דופן)",
  "shape.roundTubeInner": "צינור עגול (קוטר פנימי + דופן)",
  "shape.rectangularHollow": "פרופיל מלבני חלול",
  "shape.squareHollow": "פרופיל מרובע חלול",
  "shape.angle": "זווית (פרופיל L)",

  "field.length": "אורך",
  "field.width": "רוחב",
  "field.height": "גובה",
  "field.thickness": "עובי",
  "field.diameter": "קוטר",
  "field.side": "צלע",
  "field.flatToFlat": "בין מקבילים",
  "field.outerDiameter": "קוטר חיצוני",
  "field.innerDiameter": "קוטר פנימי",
  "field.wallThickness": "עובי דופן",
  "field.legA": "שוק א'",
  "field.legB": "שוק ב' (אופציונלי)",

  "error.notANumber": "הזן מספר",
  "error.notPositive": "חייב להיות גדול מאפס",
  "error.densityRange": "חייב להיות בין {min} ל-{max}",

  "constraint.wallHalfOuterDiameter":
    "הדופן חייבת להיות קטנה מחצי הקוטר החיצוני (מתחת ל-{max})",
  "constraint.wallHalfSmallerSide":
    "הדופן חייבת להיות קטנה מחצי הצלע הקטנה (מתחת ל-{max})",
  "constraint.wallHalfSide":
    "הדופן חייבת להיות קטנה מחצי הצלע (מתחת ל-{max})",
  "constraint.thicknessSmallerLeg":
    "העובי חייב להיות קטן מהשוק הקטנה (מתחת ל-{max})",

  "a11y.unitWeightSpoken": "משקל ליחידה {weight}. סה\"כ עבור {quantity} יחידות, {total}.",
  "a11y.totalSpoken": "{total}.",
  "a11y.kilograms": "{value} קילוגרם",
  "a11y.pounds": "{value} ליברות",
  "a11y.decreaseQuantity": "הפחת כמות",
  "a11y.increaseQuantity": "הוסף כמות",
  "a11y.densityOverridden": "צפיפות מותאמת: {value}, ערך מקורי {catalog}",
};

export const STRINGS: Record<Language, Dictionary> = { he, en };

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Resolves a translation key, substituting {name} placeholders.
 *
 * A key missing from the active language falls back to English, and a key
 * missing from both returns the key itself — a missing translation degrades
 * to something diagnosable rather than a blank or a crash. The same applies
 * if `language` itself isn't a known dictionary (untrusted host input can
 * pass anything through the JS boundary at runtime, closed union or not).
 */
export function translate(
  language: Language,
  key: string,
  params?: TranslationParams
): string {
  let template = STRINGS[language]?.[key];

  if (template === undefined) {
    template = STRINGS.en[key];
    if (template === undefined) {
      warnOnce(`missing translation key: ${key}`);
      return key;
    }
    warnOnce(`missing ${language} translation, using en: ${key}`);
  }

  if (!params) return template;

  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

// Dev-only, and deduplicated: a missing key sits in a render path, so an
// un-deduplicated warning would fire on every re-render.
const warned = new Set<string>();

function warnOnce(message: string): void {
  if (!import.meta.env.DEV) return;
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`[pfm-calculator] ${message}`);
}

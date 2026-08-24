import type { Dictionary, Language, TranslationParams } from "./types";

export const LANGUAGES: readonly Language[] = ["he", "en"];

export const DEFAULT_LANGUAGE: Language = "he";

const en: Dictionary = {
  "ui.material": "Material",
  "ui.materialPlaceholder": "Select material",
  "ui.customDensity": "Custom density",
  "ui.grade": "Grade",
  "ui.gradePlaceholder": "Select grade",
  "ui.gradeDisabledHint": "Select a material first",
  "ui.gradeCustomHint": "Not needed for custom density",
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
  "ui.densityEdited": "edited",
  "ui.densityDisabledHint": "Select a grade first",
  "ui.language": "Language",
  "ui.dimensions": "Dimensions",
  "ui.results": "Results",
  "ui.volume": "Volume",
  "ui.unitWeight": "Theoretical unit weight",
  "ui.weight": "Theoretical weight",
  "ui.total": "Theoretical total (× {quantity})",
  // Dimension field label: "Diameter (mm)"
  "ui.fieldWithUnit": "{label} ({unit})",

  "unit.mm": "mm",
  "unit.inch": "inch",
  "unit.kg": "kg",
  "unit.lbs": "lbs",
  "unit.cm3": "cm³",
  "unit.gcm3": "g/cm³",

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
  "field.acrossFlats": "Across Flats",
  "field.outerDiameter": "Outer Diameter",
  "field.innerDiameter": "Inner Diameter",
  "field.wallThickness": "Wall Thickness",
  "field.legA": "Leg A",
  "field.legB": "Leg B (optional)",

  "error.notANumber": "Enter a number",
  "error.notPositive": "Must be greater than zero",
  "error.densityRange": "Must be between {min} and {max} g/cm³",

  "constraint.wallHalfOuterDiameter":
    "Wall must be less than half the outer diameter (under {max})",
  "constraint.wallHalfSmallerSide":
    "Wall must be less than half the smaller side (under {max})",
  "constraint.wallHalfSide":
    "Wall must be less than half the width (under {max})",
  "constraint.thicknessSmallerLeg":
    "Thickness must be less than the smaller leg (under {max})",

  "a11y.unitWeightSpoken": "Unit {weight}. Total for {quantity} pieces, {total}.",
  "a11y.totalSpoken": "{total}.",
  "a11y.kilograms": "{value} kilograms",
  "a11y.pounds": "{value} pounds",
  "a11y.decreaseQuantity": "Decrease quantity",
  "a11y.increaseQuantity": "Increase quantity",
  "a11y.densityOverridden":
    "Density overridden: {value} g/cm³, catalog value {catalog} g/cm³",

  // Legal disclaimer. The summary is always visible; the points sit behind a
  // tap-only panel. Both languages carry identical content — an asymmetry
  // here would leave one audience worse informed.
  "legal.summary": "Theoretical weight, for estimation only — actual figures may differ.",
  "legal.why": "Why?",
  // Must contain "legal.why" verbatim — SC 2.5.3 Label in Name, so a speech-input
  // user can activate the control by saying the word they can see.
  "legal.whyLabel": "Why? Weights can vary from this estimate",
  "legal.close": "Close",
  "legal.heading": "Legal notice",
  "legal.point1": "Actual weight may vary due to manufacturing tolerances.",
  "legal.point2":
    "The calculations exclude saw kerf allowance (which must be added separately for each cut face), and the figures are rounded for convenience and presentation.",
  "legal.point3":
    "The data, calculations, and results shown do not constitute a binding offer, a price quotation, a legal representation, or a commitment of any kind.",
  "legal.point4":
    "The calculation is intended to provide an indication only. It is the user's sole responsibility to verify the data entered and to confirm the weight, specification, and dimensions in writing with the company / supplier in an official order document before placing an order, arranging transport, or entering into an engagement.",
  "legal.point5":
    "The company shall bear no liability of any kind, direct or indirect, for any damage, loss, loss of profit, or expense incurred by the user or by a third party as a result of using these results or relying on them.",
};

const he: Dictionary = {
  "ui.material": "חומר",
  "ui.materialPlaceholder": "בחר חומר",
  "ui.customDensity": "צפיפות מותאמת אישית",
  "ui.grade": "סוג",
  "ui.gradePlaceholder": "בחר סוג",
  "ui.gradeDisabledHint": "בחר חומר תחילה",
  "ui.gradeCustomHint": "לא נדרש בצפיפות מותאמת אישית",
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
  "ui.densityEdited": "נערך",
  "ui.densityDisabledHint": "בחר סוג תחילה",
  "ui.language": "שפה",
  "ui.dimensions": "מידות",
  "ui.results": "תוצאות",
  "ui.volume": "נפח",
  "ui.unitWeight": "משקל תיאורטי ליחידה",
  "ui.weight": "משקל תיאורטי",
  "ui.total": "סה\"כ תיאורטי (× {quantity})",
  "ui.fieldWithUnit": "{label} ({unit})",

  "unit.mm": "מ\"מ",
  "unit.inch": "אינץ'",
  "unit.kg": "ק\"ג",
  "unit.lbs": "ליברה",
  "unit.cm3": "סמ\"ק",
  "unit.gcm3": "גר'/סמ\"ק",

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
  "field.acrossFlats": "בין מישורים",
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
    "הדופן חייבת להיות קטנה מחצי הרוחב (מתחת ל-{max})",
  "constraint.thicknessSmallerLeg":
    "העובי חייב להיות קטן מהשוק הקטנה (מתחת ל-{max})",

  "a11y.unitWeightSpoken": "משקל ליחידה {weight}. סה\"כ עבור {quantity} יחידות, {total}.",
  "a11y.totalSpoken": "{total}.",
  "a11y.kilograms": "{value} קילוגרם",
  "a11y.pounds": "{value} ליברות",
  "a11y.decreaseQuantity": "הפחת כמות",
  "a11y.increaseQuantity": "הוסף כמות",
  "a11y.densityOverridden": "צפיפות מותאמת: {value}, ערך מקורי {catalog}",

  "legal.summary": "משקל תיאורטי להערכה בלבד - ייתכנו הפרשים בפועל.",
  // The "?" sits LAST in logical order, as Hebrew punctuation does; the bidi
  // algorithm renders it at the visual left. Leading it renders on the wrong side.
  "legal.why": "למה?",
  "legal.whyLabel": "למה המשקלים משתנים?",
  "legal.close": "סגור",
  "legal.heading": "הבהרה משפטית",
  "legal.point1": "המשקל בפועל עלול להשתנות בהתאם לסטיות ייצור (טולרנסים).",
  "legal.point2":
    "החישובים אינם כוללים פחת חיתוך (אותו יש להוסיף בנפרד לכל שטח חיתוך) והנתונים מעוגלים לצורכי נוחות ותצוגה.",
  "legal.point3":
    "הנתונים, החישובים והתוצאות המוצגים אינם מהווים הצעה מחייבת, הצעת מחיר, מצג משפטי או התחייבות מכל סוג שהוא.",
  "legal.point4":
    "החישוב מיועד לספק אינדיקציה בלבד. באחריות המשתמש בלבד לוודא את תקינות הנתונים שהזין ולאמת את המשקל, המפרט והמידות בכתב מול החברה / ספק במסמך הזמנה רשמי בטרם ביצוע הזמנה, שינוע או התקשרות.",
  "legal.point5":
    "החברה לא תישא באחריות מכל סוג שהוא, ישירה או עקיפה, לכל נזק, הפסד, אובדן רווח או הוצאה שייגרמו למשתמש או לצד שלישי כתוצאה משימוש בתוצאות אלו או מהסתמכות עליהן.",
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

import type { Language } from "../i18n/types";
import "../styles/tokens.css";
import "../styles/base.css";
import "./CalculatorShell.css";

interface Props {
  language: Language;
  density?: "compact" | "comfortable";
  className?: string;
  children: React.ReactNode;
}

/**
 * Root container. Renders a plain box: no positioning, no viewport units, no
 * width assumptions — the host owns the wrapper (modal, drawer, page section)
 * and all of its behaviour. Layout inside adapts via container queries.
 *
 * `dir` is set here rather than inherited, so a Hebrew calculator embedded in
 * an LTR host page still lays out right-to-left (and the reverse).
 */
export function CalculatorShell({
  language, density = "comfortable", className, children,
}: Props) {
  return (
    <div
      className={className ? `pfm-calc ${className}` : "pfm-calc"}
      dir={language === "he" ? "rtl" : "ltr"}
      lang={language}
      data-density={density}
    >
      <div className="pfm-calc__inner">{children}</div>
    </div>
  );
}

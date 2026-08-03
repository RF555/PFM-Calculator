import "../styles/tokens.css";
import "../styles/base.css";
import "./CalculatorShell.css";

interface Props {
  density?: "compact" | "comfortable";
  className?: string;
  children: React.ReactNode;
}

/**
 * Root container. Renders a plain box: no positioning, no viewport units, no
 * width assumptions — the host owns the wrapper (modal, drawer, page section)
 * and all of its behaviour. Layout inside adapts via container queries.
 */
export function CalculatorShell({
  density = "comfortable", className, children,
}: Props) {
  return (
    <div
      className={className ? `pfm-calc ${className}` : "pfm-calc"}
      data-density={density}
    >
      <div className="pfm-calc__inner">{children}</div>
    </div>
  );
}

import "./ResultStat.css";

interface ResultStatProps {
  label: string;
  primary: string;
  secondary?: string;
  emphasis?: boolean;
}

export function ResultStat({ label, primary, secondary, emphasis }: ResultStatProps) {
  return (
    <div className="pfm-stat" data-emphasis={emphasis || undefined}>
      <span className="pfm-stat__label">{label}</span>
      <span className="pfm-stat__primary" dir="ltr">{primary}</span>
      {secondary && <span className="pfm-stat__secondary">{secondary}</span>}
    </div>
  );
}

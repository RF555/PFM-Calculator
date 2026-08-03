interface FieldLabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

export function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label className="pfm-label" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

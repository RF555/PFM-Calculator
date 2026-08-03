interface FieldErrorProps {
  id: string;
  message?: string;
}

/**
 * Always rendered so that showing a message never shifts layout — important
 * inside a constrained host container.
 */
export function FieldError({ id, message }: FieldErrorProps) {
  return (
    <span className="pfm-field-error" id={id} role={message ? "alert" : undefined}>
      {message ?? " "}
    </span>
  );
}

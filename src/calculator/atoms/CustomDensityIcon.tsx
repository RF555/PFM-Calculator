interface Props {
  size?: number;
  className?: string;
}

/**
 * Marks the custom-density entry in the material picker: a pencil over a
 * ruled line, the conventional "you fill this in" mark.
 *
 * Drawn on the same 48x48 grid as ShapeIcon and stroked in `currentColor`,
 * so it inherits text colour, scales with the icon size, and needs no
 * separate dark-theme artwork.
 *
 * Decorative — `aria-hidden`, since the label beside it already names the
 * option and a second announcement would only add noise.
 */
export function CustomDensityIcon({ size = 30, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Pencil: barrel, then the tip narrowing to a point. */}
      <path d="M31 9.5 38.5 17 20 35.5l-9 1.5 1.5-9z" />
      {/* Collar across the barrel, where a real pencil's ferrule sits. */}
      <path d="M26.5 14 34 21.5" />
      {/* The ruled line being written on. */}
      <path d="M10 43h28" />
    </svg>
  );
}

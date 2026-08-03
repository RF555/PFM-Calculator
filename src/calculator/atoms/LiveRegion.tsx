import { useEffect, useState } from "react";

/**
 * Announcement delay. Results change on every keystroke; announcing each
 * one overflows the speech queue and the user hears nothing useful.
 * Verify against a real screen reader before changing.
 */
export const ANNOUNCE_DELAY_MS = 600;

interface LiveRegionProps {
  message: string;
}

/**
 * Visually hidden announcer. Rendered from mount (empty) because regions
 * inserted at the moment content arrives are often missed. aria-atomic is
 * required: without it only the changed text node is read, so 15.41 -> 15.42
 * announces "2".
 */
export function LiveRegion({ message }: LiveRegionProps) {
  const [announced, setAnnounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(message), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      className="pfm-visually-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announced}
    </div>
  );
}

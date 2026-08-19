import { useEffect, useRef, useState } from "react";
import { useTranslate } from "../i18n/LanguageContext";
import "./Disclaimer.css";

/** Copy for one language, already resolved. Not the host-facing type. */
export interface DisclaimerText {
  summary: string;
  points: string[];
}

interface Props {
  /** Namespaces the panel id so two calculators on one page never collide. */
  idPrefix: string;
  /** Overrides the default copy. A missing field falls back to the default. */
  text?: Partial<DisclaimerText>;
}

const POINT_KEYS = [
  "legal.point1",
  "legal.point2",
  "legal.point3",
  "legal.point4",
  "legal.point5",
  "legal.point6",
];

/**
 * Splits a translated string on [[…]] markers and wraps each marked run in
 * <bdi>. In an RTL paragraph the Unicode Bidirectional Algorithm reorders
 * weakly-directional runs: "EN 10029" renders as "10029 EN" and a range
 * "0.3-0.5" flips to "0.5-0.3" — a correctness bug in an engineering tool,
 * not a cosmetic one. <bdi> isolates each run and keeps its number and unit
 * together.
 */
function isolateLatinRuns(text: string): React.ReactNode[] {
  return text.split(/\[\[(.+?)\]\]/g).map((part, i) =>
    // Odd indices are the captured groups, i.e. the marked runs.
    i % 2 === 1 ? <bdi key={i}>{part}</bdi> : part
  );
}

/**
 * Legal notice under the results. The summary sentence is always visible —
 * it carries the operative point on its own, so a user who never opens the
 * panel is still correctly informed. The panel holds the elaboration and
 * opens on click/tap only: it paints over the results, which is too heavy a
 * consequence to trigger from a pointer passing through.
 */
export function Disclaimer({ idPrefix, text }: Props) {
  const t = useTranslate();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const panelId = `${idPrefix}-disclaimer`;
  const summary = text?.summary ?? t("legal.summary");
  // An empty override array falls back rather than rendering an empty panel.
  const points = text?.points?.length ? text.points : POINT_KEYS.map((k) => t(k));

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    // pointerdown fires before the trigger's own click. A press inside the
    // root (trigger or panel) is left alone so the click handler can toggle;
    // only a press outside closes. Closing here without focusing the trigger
    // is deliberate — the user is already looking elsewhere.
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <section className="pfm-disclaimer" ref={rootRef}>
      <p className="pfm-disclaimer__summary">
        <span>
          {isolateLatinRuns(summary)}
          <button
            type="button"
            className="pfm-disclaimer__trigger"
            ref={triggerRef}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={t("legal.whyLabel")}
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.35" />
              <path d="M8 7v4.4M8 4.6v.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {t("legal.why")}
          </button>
        </span>
      </p>

      {/* The wrapper keeps a stable id so aria-controls always resolves; its
          content only mounts while open, since [hidden] alone does not stop
          find-in-page/copy from reaching it once mounted. */}
      <div
        id={panelId}
        className="pfm-disclaimer__panel"
        role="group"
        aria-label={t("legal.whyLabel")}
        hidden={!open}
      >
        {open && (
          <>
            <button
              type="button"
              className="pfm-disclaimer__close"
              aria-label={t("legal.close")}
              onClick={close}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            {/* A <p>, not an <h*>: the widget is embedded and must not inject
                a heading into the host page's document outline. */}
            <p className="pfm-disclaimer__heading">{t("legal.heading")}</p>
            <div className="pfm-disclaimer__body">
              <ul>
                {points.map((point, i) => (
                  <li key={i}>{isolateLatinRuns(point)}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

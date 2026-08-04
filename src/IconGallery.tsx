// Temporary visual proof sheet for ShapeIcon. Not part of the app.
import { ShapeIcon } from "./calculator/atoms/ShapeIcon";
import { SHAPE_IDS, type ShapeId } from "./calculator/model/shapes";

/** Shapes whose callouts are done, in the order we are working through them. */
const DONE: ShapeId[] = [
  "roundBar", "roundTubeOuter", "roundTubeInner",
  "squareBar", "flatBar", "sheet",
  "squareHollow", "rectangularHollow", "hexBar", "angle",
];

/**
 * Renders the real ShapeIcon, so what is reviewed here is exactly what ships.
 * The 48-unit artwork grid is overlaid at 25% steps; the callout margin sits
 * outside it.
 */
function Card({ id, size, grid }: { id: ShapeId; size: number; grid?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        position: "relative", display: "inline-block",
        outline: grid ? "1px dashed #dbe1e8" : undefined,
      }}>
        <ShapeIcon shapeId={id} variant="iso" size={size} hints />
      </div>
    </div>
  );
}

export function IconGallery() {
  const pending = SHAPE_IDS.filter((id) => !DONE.includes(id));
  return (
    <div style={{ font: "13px system-ui", padding: 20, color: "#16191d" }}>
      <h2 style={{ margin: "0 0 4px" }}>Dimension callouts</h2>
      <p style={{ margin: "0 0 16px", color: "#5c6672" }}>
        Real ShapeIcon output. Large for judging, then at the 104px size it
        renders beside the dimension fields.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {DONE.map((id) => (
          <div key={id} style={{
            border: "1px solid #ccc", borderRadius: 8, padding: 12,
            background: "#fff", width: 270,
          }}>
            <div style={{
              fontFamily: "ui-monospace, monospace", fontWeight: 600, marginBottom: 6,
            }}>{id}</div>
            <Card id={id} size={244} grid />
            <div style={{
              borderTop: "1px dashed #ddd", marginTop: 8, paddingTop: 8,
            }}>
              <Card id={id} size={140} />
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ margin: "24px 0 8px", color: "#5c6672" }}>
        Still to annotate
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {pending.map((id) => (
          <div key={id} style={{
            border: "1px solid #e3e8ee", borderRadius: 6, padding: 8,
            width: 130, textAlign: "center", background: "#fff",
          }}>
            <div style={{ fontSize: 10, fontFamily: "ui-monospace, monospace" }}>{id}</div>
            <ShapeIcon shapeId={id} variant="iso" size={110} />
          </div>
        ))}
      </div>
    </div>
  );
}

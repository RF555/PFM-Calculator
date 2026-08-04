import type { ShapeId } from "../model/shapes";

/**
 * Profile artwork for the ten stock shapes, in two variants:
 *
 * - `flat`  — head-on 2D cross-section. Reads at 20px, used in the picker list.
 * - `iso`   — isometric solid showing length, used for the selected shape.
 *
 * Both are drawn on a 48x48 grid from the same geometry the volume formulas in
 * `shapes.ts` use, so the picture always matches what is being calculated.
 * Strokes use `currentColor` and scale with the icon, so the artwork inherits
 * text colour and works unchanged in the dark theme.
 */

/** Isometric projection: 30° axes, the standard for technical stock drawings. */
const ISO_DX = 9;
const ISO_DY = -5;

/**
 * Shallower axis used only by the hex bar. Its upper-right face runs at
 * roughly the negative of the standard axis' slope, so at ISO_DX/DY the face
 * and the edge receding from it merge into a single stroke.
 */
const HEX_DX = 13;
const HEX_DY = -3.5;

/** Displaces a point along the extrusion axis by `n` depth units. */
const iso = (x: number, y: number, n = 1): string =>
  `${x + ISO_DX * n},${y + ISO_DY * n}`;

/**
 * The interior edge seen through a hollow section's near opening: it starts at
 * the bore's bottom-left corner and recedes along the extrusion axis, parallel
 * to the body's own receding edges. Its length is solved rather than fixed —
 * the run stops where it meets the bore's top or right edge, whichever comes
 * first — so a full-depth edge can never spill past the opening onto the
 * surrounding front face.
 */
function boreEdge(
  x: number, y: number,
  bx: number, by: number, bw: number,
  depth = 1.5
): { x1: number; y1: number; x2: number; y2: number } {
  // Run the body's full extrusion depth, but stop early at whichever bore edge
  // the axis reaches first, so the edge never escapes the opening.
  const t = Math.min(depth, (bx + bw - x) / ISO_DX, (y - by) / -ISO_DY);
  // Not rounded: truncating either coordinate tilts the edge off the extrusion
  // axis, which is the one property this line has to hold exactly.
  return { x1: x, y1: y, x2: x + ISO_DX * t, y2: y + ISO_DY * t };
}

/** Regular hexagon vertices for a given across-flats distance. */
function hexVertices(cx: number, cy: number, flatToFlat: number): [number, number][] {
  const r = flatToFlat / Math.sqrt(3); // circumradius from across-flats
  return Array.from({ length: 6 }, (_, i) => {
    // Flat top and bottom, matching how hex bar stock is measured.
    const a = (Math.PI / 180) * (30 + 60 * i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
  });
}

const pointsAttr = (pts: [number, number][]): string =>
  pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

/**
 * Extrudes a convex face along an axis and returns the outline actually
 * visible: the silhouette vertices (where the extrusion direction crosses from
 * inside the face to outside), their trailing edges, and the back profile
 * joining them. Which vertices qualify depends on the axis, so solving it here
 * keeps the drawing correct if the projection angle changes — hand-listing
 * them silently leaves a face missing or draws one that should be hidden.
 */
function extrude(
  pts: [number, number][],
  dx: number,
  dy: number
): { edges: [number, number][]; back: [number, number][] } {
  const n = pts.length;
  const silhouette = pts.filter((p, i) => {
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const c1 = (p[0] - prev[0]) * dy - (p[1] - prev[1]) * dx;
    const c2 = (next[0] - p[0]) * dy - (next[1] - p[1]) * dx;
    return c1 > 0 !== c2 > 0;
  });
  // Walk the near outline from one silhouette vertex to the other the long way
  // round, keeping only the side that faces the viewer.
  const [a, b] = silhouette;
  const ia = pts.indexOf(a);
  const ib = pts.indexOf(b);
  const forward: [number, number][] = [];
  for (let i = ia; ; i = (i + 1) % n) {
    forward.push(pts[i]);
    if (i === ib) break;
  }
  const backward: [number, number][] = [];
  for (let i = ib; ; i = (i + 1) % n) {
    backward.push(pts[i]);
    if (i === ia) break;
  }
  // The visible chain is whichever runs on the far side of the extrusion.
  const mid = (c: [number, number][]) => c[Math.floor(c.length / 2)];
  const side = (p: [number, number]) =>
    (p[0] - a[0]) * dy - (p[1] - a[1]) * dx;
  const chain = side(mid(forward)) * side([a[0] + dx, a[1] + dy]) > 0 ? forward : backward;
  return {
    edges: chain,
    back: chain.map(([x, y]) => [x + dx, y + dy] as [number, number]),
  };
}

/** L-profile outline, drawn from the same legs/thickness the volume uses. */
function anglePoints(x: number, y: number, leg: number, t: number): string {
  return [
    `${x},${y}`,
    `${x},${y + leg}`,
    `${x + leg},${y + leg}`,
    `${x + leg},${y + leg - t}`,
    `${x + t},${y + leg - t}`,
    `${x + t},${y}`,
  ].join(" ");
}

/**
 * A length of round tube in the same oblique projection as the solid bars: a
 * true circular near face with the bore set into it, the far cap pushed along
 * the extrusion axis, and the two tangents joining them.
 *
 * Both variants are the same pipe and differ only in which diameter the user
 * supplies, so the dashed marker spans the one being measured — the full outer
 * width, or the bore alone.
 */
function roundTube(measures: "outer" | "inner"): React.ReactNode {
  const R = 13.5;
  const BORE = 7.5;
  const [cx, cy] = [15, 28];
  // See roundBar: the grid caps this, not taste.
  const depth = 2.1;
  const [fx, fy] = [cx + ISO_DX * depth, cy + ISO_DY * depth];
  const len = Math.hypot(ISO_DX, ISO_DY);
  const [nx, ny] = [(-ISO_DY / len) * R, (ISO_DX / len) * R];
  const span = measures === "outer" ? R : BORE;
  return (
    <>
      <path d={`M${fx + nx} ${fy + ny} A${R} ${R} 0 0 0 ${fx - nx} ${fy - ny}`} />
      <line x1={cx + nx} y1={cy + ny} x2={fx + nx} y2={fy + ny} />
      <line x1={cx - nx} y1={cy - ny} x2={fx - nx} y2={fy - ny} />
      <circle cx={cx} cy={cy} r={R} />
      <circle cx={cx} cy={cy} r={BORE} />
      <line
        x1={cx} y1={cy - span} x2={cx} y2={cy + span}
        strokeWidth={1.2} strokeDasharray="3 2.5"
      />
    </>
  );
}

const FLAT: Record<ShapeId, React.ReactNode> = {
  sheet: <rect x="6" y="21" width="36" height="6" rx="0.5" />,
  roundBar: <circle cx="24" cy="24" r="15" />,
  squareBar: <rect x="9" y="9" width="30" height="30" rx="0.5" />,
  flatBar: <rect x="6" y="17" width="36" height="14" rx="0.5" />,
  hexBar: <polygon points={pointsAttr(hexVertices(24, 24, 30))} />,
  // Both tube variants have the same cross-section and differ only in which
  // diameter the user supplies, so a dashed line spans the diameter being
  // measured: full width for outer-Ø, the bore only for inner-Ø. It runs
  // vertically because a horizontal one reads as a face between the circles.
  //
  // Dashes are long and few rather than fine: these render at ~30px in the
  // picker, where a 3-unit dash lands under 2 device pixels and greys out into
  // a solid line. Full stroke weight for the same reason.
  roundTubeOuter: (
    <>
      <circle cx="24" cy="24" r="15" />
      <circle cx="24" cy="24" r="9" />
      <line x1="24" y1="9" x2="24" y2="39" strokeDasharray="7 5" />
    </>
  ),
  roundTubeInner: (
    <>
      <circle cx="24" cy="24" r="15" />
      <circle cx="24" cy="24" r="9" />
      <line x1="24" y1="15" x2="24" y2="33" strokeDasharray="7 4" />
    </>
  ),
  rectangularHollow: (
    <>
      <rect x="6" y="13" width="36" height="22" rx="0.5" />
      <rect x="11" y="18" width="26" height="12" rx="0.5" />
    </>
  ),
  squareHollow: (
    <>
      <rect x="9" y="9" width="30" height="30" rx="0.5" />
      <rect x="15" y="15" width="18" height="18" rx="0.5" />
    </>
  ),
  angle: <polygon points={anglePoints(12, 9, 30, 8)} />,
};

const ISO: Record<ShapeId, React.ReactNode> = {
  // A broad thin plate: wide in both plan axes, minimal thickness. Built like
  // squareBar and flatBar — a solid front face plus the two visible faces, so
  // it reads as opaque. Depth runs 1.7 units against flatBar's 1, which is
  // what separates the two: plate is a panel, flat bar is a strip.
  sheet: (
    <>
      <rect x="8" y="28" width="19" height="4" />
      <polyline points={`8,28 ${iso(8, 28, 1.7)} ${iso(27, 28, 1.7)} 27,28`} />
      <polyline points={`${iso(27, 28, 1.7)} ${iso(27, 32, 1.7)} 27,32`} />
    </>
  ),
  // Same oblique projection as the boxy solids: the near face is drawn true (a
  // circle, not a squashed ellipse) and the far one is that circle pushed along
  // the extrusion axis, joined by the two tangents. Drawing it side-on instead
  // would put this bar in a different projection from the rest of the set.
  roundBar: (() => {
    const r = 13.5;
    const [cx, cy] = [15, 28];
    // Long enough that the far cap clears the near one, or the crescent that
    // gives the bar its length disappears inside the front circle. Capped by
    // the grid: the drawing spans 2r + ISO_DX*depth plus the stroke, so past
    // ~2.15 the far cap leaves the 48-unit box however the icon is centred.
    const depth = 1.95;
    const [fx, fy] = [cx + ISO_DX * depth, cy + ISO_DY * depth];
    // Tangents leave each circle perpendicular to the extrusion axis.
    const len = Math.hypot(ISO_DX, ISO_DY);
    const [nx, ny] = [(-ISO_DY / len) * r, (ISO_DX / len) * r];
    return (
      <>
        {/* Far cap: only the half turned away from the near circle shows. */}
        <path d={`M${fx + nx} ${fy + ny} A${r} ${r} 0 0 0 ${fx - nx} ${fy - ny}`} />
        <line x1={cx + nx} y1={cy + ny} x2={fx + nx} y2={fy + ny} />
        <line x1={cx - nx} y1={cy - ny} x2={fx - nx} y2={fy - ny} />
        <circle cx={cx} cy={cy} r={r} />
      </>
    );
  })(),
  squareBar: (
    <>
      <rect x="10" y="16" width="20" height="20" />
      <polyline points={`10,16 ${iso(10, 16)} ${iso(30, 16)} 30,16`} />
      <polyline points={`${iso(30, 16)} ${iso(30, 36)} 30,36`} />
    </>
  ),
  flatBar: (
    <>
      <rect x="9" y="24" width="24" height="11" />
      <polyline points={`9,24 ${iso(9, 24)} ${iso(33, 24)} 33,24`} />
      <polyline points={`${iso(33, 24)} ${iso(33, 35)} 33,35`} />
    </>
  ),
  // Extruded shallower than the other bars: a flat-topped hexagon's upper-right
  // face has slope +0.577, close to the mirror of the standard -0.556 axis, so
  // at the usual angle that face and the edge receding from it merge into one
  // stroke. Visible edges are solved by extrude(), which picks the silhouette
  // for whatever axis is passed.
  hexBar: (() => {
    const face = hexVertices(16, 24, 22);
    const { edges, back } = extrude(face, HEX_DX, HEX_DY);
    return (
      <>
        <polygon points={pointsAttr(face)} />
        {edges.map(([x, y]) => (
          <line key={`${x},${y}`} x1={x} y1={y} x2={x + HEX_DX} y2={y + HEX_DY} />
        ))}
        <polyline points={pointsAttr(back)} />
      </>
    );
  })(),
  roundTubeOuter: roundTube("outer"),
  roundTubeInner: roundTube("inner"),
  // Hollow sections are opaque like the solid bars: outer body drawn as the
  // front face plus its two visible faces, with the bore set into that face.
  // With the body receding up and to the right, the bore's bottom-left corner
  // is the one whose inner walls face the viewer, so a single edge runs back
  // from it into the opening; the other three corners stay hidden behind the
  // metal. That edge must share the body's extrusion vector and depth — it is
  // the same corner seen through the hole, so anything else (a shorter run, or
  // a diagonal to the opposite corner) reads as a slash across the bore.
  rectangularHollow: (
    <>
      <rect x="6" y="20" width="26" height="15" />
      <rect x="10" y="24" width="18" height="7" />
      <polyline points={`6,20 ${iso(6, 20, 1.5)} ${iso(32, 20, 1.5)} 32,20`} />
      <polyline points={`${iso(32, 20, 1.5)} ${iso(32, 35, 1.5)} 32,35`} />
      <line {...boreEdge(10, 31, 10, 24, 18)} />
    </>
  ),
  squareHollow: (
    <>
      <rect x="10" y="17" width="19" height="19" />
      <rect x="14" y="21" width="11" height="11" />
      <polyline points={`10,17 ${iso(10, 17, 1.5)} ${iso(29, 17, 1.5)} 29,17`} />
      <polyline points={`${iso(29, 17, 1.5)} ${iso(29, 36, 1.5)} 29,36`} />
      <line {...boreEdge(14, 32, 14, 21, 11)} />
    </>
  ),
  angle: (
    <>
      <polygon points={anglePoints(11, 16, 21, 6)} />
      {/*
        Visible edges only. The extrusion runs up and to the right, so the back
        face is hidden behind the solid apart from the silhouette that clears
        it: over the top of the upright, round the inner step, and out to the
        toe. The heel's receding edge is occluded by the body and is left out —
        drawing it, or closing the back face, makes the L look transparent.
      */}
      <polyline points={`11,16 ${iso(11, 16)} ${iso(17, 16)} 17,16`} />
      <polyline points={`${iso(17, 16)} ${iso(17, 31)} ${iso(32, 31)} ${iso(32, 37)} 32,37`} />
      {/* Both edges of the inner step recede into view through the notch. */}
      <line x1={17} y1={31} x2={17 + ISO_DX} y2={31 + ISO_DY} />
      <line x1={32} y1={31} x2={32 + ISO_DX} y2={31 + ISO_DY} />
    </>
  ),
};

/**
 * Per-icon nudges that centre each drawing's inked bounds (geometry plus half
 * the stroke) on the 48x48 grid. Shapes are authored at their true
 * proportions, which does not generally leave them centred — an L-profile's
 * mass sits in one corner, and an isometric solid leans along its extrusion
 * axis. Without this, icons visibly jitter row to row in the picker list.
 * Values are measured from getBBox, not guessed; entries at 0,0 are omitted.
 */
const CENTRE: Partial<Record<`${"flat" | "iso"}:${ShapeId}`, [number, number]>> = {
  "flat:angle": [-3, 0],
  "iso:sheet": [-1.15, -1.75],
  "iso:roundBar": [0.22, 0.87],
  "iso:roundTubeOuter": [-0.45, 1.25],
  "iso:roundTubeInner": [-0.45, 1.25],
  "iso:squareBar": [-0.5, 0.5],
  "iso:flatBar": [-1.5, -3],
  "iso:hexBar": [1.5, 1.75],
  "iso:rectangularHollow": [-1.75, 0.25],
  "iso:squareHollow": [-2.25, 1.25],
  "iso:angle": [-2, 0],
};

interface Props {
  shapeId: ShapeId;
  variant?: "flat" | "iso";
  size?: number;
  className?: string;
}

/**
 * Decorative by default: the shape name always sits beside the icon, so
 * announcing it again would make screen readers read every option twice.
 *
 * Stroke weight is per variant, since the two render at very different sizes:
 * the flat cross-sections sit at ~30px in the picker list and need a heavier
 * line to hold up, while the isometric solid renders at 72px beside the
 * dimension fields, where that weight would look clumsy and close up its
 * interior detail.
 */
export function ShapeIcon({ shapeId, variant = "flat", size = 24, className }: Props) {
  const [dx, dy] = CENTRE[`${variant}:${shapeId}`] ?? [0, 0];
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={variant === "iso" ? 1.6 : 2.4}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <g transform={dx || dy ? `translate(${dx} ${dy})` : undefined}>
        {variant === "iso" ? ISO[shapeId] : FLAT[shapeId]}
      </g>
    </svg>
  );
}

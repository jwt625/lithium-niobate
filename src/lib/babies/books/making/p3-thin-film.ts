// Making p3: ion slicing in three manual panels. (1) Accent ion arrows rain into a lithium niobate wafer and stop at
// one buried depth (dashed plane). (2) The wafer, flipped, comes down onto a silicon wafer with a glassy top.
// (3) Heat: the stack splits at the dashed plane; the thick part lifts away, a thin film stays on the glass.
// Tap: replay.
import type { Scene, SceneHost } from "../../types";
import { ACC, DARK, INK, Iso, MID, SIDE, TOP, bigArrow, easeInOut, easeOut, heat, hull, layer, line, lerp, makeStage, pathArrow, poly, ring, seg, stepDisc, type Pt } from "./kit";

const END = 2.9;
const R = 95;
const H_LN = 40; // donor thickness, drawn (not to scale)
const D_IMP = 12; // implanted depth, drawn (not to scale)
const H_SI = 30;
const H_OX = 9;
const GLASS = "#CFE3EA";

/** Disc lying flat from z0 with height h. Returns the top ring. */
function slab(g: Element, io: Iso, z0: number, h: number, r: number, top: string, side: string, cx = 0, cy = 0): Pt[] {
  const a = ring(io, [cx, cy, z0], r, "z", 48);
  const b = ring(io, [cx, cy, z0 + h], r, "z", 48);
  poly(g, hull(a.concat(b)), side);
  poly(g, b, top);
  return b;
}

/** Front half of a horizontal circle at height z (the part seen on the side wall). */
function frontArc(io: Iso, z: number, r: number, cx = 0, cy = 0): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= 32; i++) {
    const a = -Math.PI / 4 + (i / 32) * Math.PI;
    out.push(io.p(cx + r * Math.cos(a), cy + r * Math.sin(a), z));
  }
  return out;
}

export function thinFilmScene(host: SceneHost, text: string): Scene {
  const st = makeStage(host, text, ["Shoot in tiny bits.", "Flip it onto a new wafer.", "Warm it. It splits!"]);
  const io1 = new Iso(235, 300, 0.95);
  const io2 = new Iso(765, 330, 0.95);
  const io3 = new Iso(490, 630, 1.05);
  const dyn = layer(st.art);
  // a neat 3 x 3 array of ion arrows, staggered start
  const ions: [number, number, number][] = [];
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) ions.push([i * 48, j * 48, ((i + 1) * 3 + (j + 1)) * 0.035]);

  let lastT = 0;
  let replay = -1;
  const onDown = () => {
    replay = host.reduced ? -1 : lastT;
    host.wake(END + 0.2);
  };
  st.svg.addEventListener("pointerdown", onDown);

  const draw = (tau: number) => {
    const g = dyn.clear();

    // ---- panel 1: implant ----
    slab(g, io1, 0, H_LN, R, TOP, SIDE);
    const plane = seg(tau, 0.45, 0.9);
    if (plane > 0) line(g, frontArc(io1, H_LN - D_IMP, R), { stroke: ACC, "stroke-width": 4, "stroke-dasharray": "10 8", opacity: plane.toFixed(2) });
    for (const [x, y, d] of ions) {
      const f = easeOut(seg(tau, d, d + 0.6));
      if (f <= 0) continue;
      const zTip = lerp(330, H_LN + 18, f);
      pathArrow(g, [io1.p(x, y, zTip + 70), io1.p(x, y, zTip)], ACC, 6, 22);
    }
    stepDisc(g, 70, 95, 1);

    // ---- arrow 1 -> 2 ----
    const a12 = easeOut(seg(tau, 0.6, 0.9));
    if (a12 > 0) bigArrow(g, [420, 250], [lerp(420, 545, a12), 250], 30, "#fff");

    // ---- panel 2: flip and bond ----
    slab(g, io2, 0, H_SI, R, DARK, MID);
    slab(g, io2, H_SI, H_OX, R, GLASS, GLASS);
    const drop = easeInOut(seg(tau, 1.0, 1.6));
    const z2 = lerp(150, 0, drop) + H_SI + H_OX;
    if (tau >= 0.7) {
      slab(g, io2, z2, H_LN, R, SIDE, SIDE);
      line(g, frontArc(io2, z2 + D_IMP, R), { stroke: ACC, "stroke-width": 4, "stroke-dasharray": "10 8" });
    }
    // flip arrow over it
    const fl = seg(tau, 0.7, 1.15);
    if (fl > 0) {
      const [fx, fy] = io2.p(0, 0, 230);
      const pts: Pt[] = [];
      for (let i = 0; i <= 28; i++) {
        const a = Math.PI * (1.08 + (i / 28) * 0.84);
        pts.push([fx + 105 * Math.cos(a), fy + 62 * Math.sin(a)]);
      }
      pathArrow(g, pts, INK, 7, 28, fl);
    }
    stepDisc(g, 930, 95, 2);

    // ---- arrow 2 -> 3 ----
    const a23 = easeOut(seg(tau, 1.4, 1.7));
    if (a23 > 0) bigArrow(g, [705, 455], [lerp(705, 640, a23), lerp(455, 520, a23)], 30, "#fff");

    // ---- panel 3: warm and split ----
    const warm = seg(tau, 1.6, 2.0);
    if (warm > 0) {
      const ph = tau < END ? tau * 7 : 0;
      for (const [x, y, h] of [[270, 735, 115], [310, 750, 95], [680, 750, 95], [720, 735, 115]] as const) heat(g, x, y, h * warm, ph, { opacity: warm.toFixed(2) });
    }
    slab(g, io3, 0, H_SI, R, DARK, MID);
    slab(g, io3, H_SI, H_OX, R, GLASS, GLASS);
    const lift = easeOut(seg(tau, 2.1, 2.8));
    const zf = H_SI + H_OX;
    if (lift <= 0) {
      slab(g, io3, zf, H_LN, R, SIDE, SIDE);
      line(g, frontArc(io3, zf + D_IMP, R), { stroke: ACC, "stroke-width": 4, "stroke-dasharray": "10 8" });
    } else {
      slab(g, io3, zf, 5, R, TOP, SIDE);
      const zu = zf + D_IMP + lift * 120;
      slab(g, io3, zu, H_LN - D_IMP, R, SIDE, SIDE);
    }
    stepDisc(g, 175, 590, 3);
  };

  return {
    settle: END,
    frame(t: number) {
      lastT = t;
      let tau = host.reduced ? END : t;
      if (replay >= 0) tau = Math.min(END, t - replay);
      draw(tau);
    },
    destroy() {
      st.svg.removeEventListener("pointerdown", onDown);
      st.destroy();
    },
  };
}

// Making p2: the boule lies on its side (seed end at the left, a flat ground along its top). (1) A saw blade drops
// through it, (2) each slice slides off along the axis into an exploded row of wafers, (3) callout: one round wafer
// with its edge flat. Tap: cut one more wafer.
import type { Scene, SceneHost } from "../../types";
import { INK, Iso, SIDE, TOP, callout, calloutRim, easeInOut, easeOut, el, hull, layer, lerp, line, makeStage, pathArrow, poly, seg, stepDisc, type Pt, type V3 } from "./kit";

const R = 86; // boule radius (world)
const T = 15; // wafer thickness, drawn
const X0 = -200; // body start (shoulder end)
const X1 = 60; // original body end
const G = 120; // gap between boule end and first wafer
const S = 118; // wafer pitch in the exploded row
const FLAT = 0.93; // flat chord at z = FLAT * R
const INTRO = [0.25, 0.7, 1.15, 1.6];
const MAXN = 6;
const CUT = 0.3; // blade travel
const SLIDE = 0.5;

/** Circle in the y-z plane (normal x) or x-y plane (normal z) with a flat chord. */
function flatRing(iso: Iso, c: V3, r: number, axis: "x" | "z", n = 48): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const u = r * Math.cos(a);
    const w = Math.min(r * Math.sin(a), FLAT * r);
    out.push(axis === "x" ? iso.p(c[0], c[1] + u, c[2] + w) : iso.p(c[0] + w, c[1] + u, c[2]));
  }
  return out;
}

function disc(g: Element, iso: Iso, x0: number, len: number, r = R): void {
  const a = flatRing(iso, [x0, 0, 0], r, "x");
  const b = flatRing(iso, [x0 + len, 0, 0], r, "x");
  poly(g, hull(a.concat(b)), SIDE);
  // the flat face along the top
  const c = FLAT * r;
  const hw = Math.sqrt(1 - FLAT * FLAT) * r;
  poly(g, [iso.p(x0, -hw, c), iso.p(x0 + len, -hw, c), iso.p(x0 + len, hw, c), iso.p(x0, hw, c)], SIDE);
  poly(g, b, TOP);
}

export function wafersScene(host: SceneHost, text: string): Scene {
  const st = makeStage(host, text);
  const iso = new Iso(335, 345, 0.9);
  const dyn = layer(st.art);

  // static: wafer callout (top right) with flat
  const cg = el("g", {}, st.art);
  const ccx = 815;
  const ccy = 190;
  const cr = 135;
  const inner = callout(cg, st.id("c"), ccx, ccy, cr, iso.p(X1 - 4 * T + G + 3 * S + T, 30, R * 0.75));
  const ci = new Iso(ccx, ccy + 18, 0.95);
  {
    const r = 105;
    const a = flatRing(ci, [0, 0, 0], r, "z");
    const b = flatRing(ci, [0, 0, 14], r, "z");
    poly(inner, hull(a.concat(b)), SIDE);
    poly(inner, b, TOP);
  }
  calloutRim(cg, ccx, ccy, cr);
  stepDisc(cg, ccx - cr + 8, ccy + cr - 8, 3);

  // cut times: intro plus taps
  const cuts: number[] = INTRO.slice();
  let lastT = 0;
  let base = 0; // t offset of the current run
  const onDown = () => {
    if (cuts.length >= MAXN) {
      cuts.length = 0;
      cuts.push(...INTRO);
      base = lastT;
      host.wake(INTRO[INTRO.length - 1] + CUT + SLIDE + 0.2);
      return;
    }
    const prev = cuts.length ? base + cuts[cuts.length - 1] + CUT : lastT;
    cuts.push(Math.max(lastT, prev) - base);
    host.wake(Math.max(lastT, prev) - lastT + CUT + SLIDE + 0.2);
  };
  st.svg.addEventListener("pointerdown", onDown);

  const xs = (k: number, n: number) => (n <= k ? X1 - (k + 1) * T : X1 - n * T + G + (n - 1 - k) * S);

  const draw = (tau: number) => {
    const g = dyn.clear();
    // how many cuts are complete and the current partial one
    let n = 0;
    let blade = -1; // 0..1 blade travel of the cut in progress
    const slideF: number[] = [];
    for (let k = 0; k < cuts.length; k++) {
      const c0 = cuts[k];
      if (tau < c0) break;
      const b = seg(tau, c0, c0 + CUT);
      if (b < 1) {
        blade = b;
        break;
      }
      n = k + 1;
      slideF[k] = easeOut(seg(tau, c0 + CUT, c0 + CUT + SLIDE));
    }
    // slice positions: tween every cut slice between the layouts before and after the latest cut
    const last = n - 1;
    const f = last >= 0 ? slideF[last] : 1;
    const pos: number[] = [];
    for (let k = 0; k < n; k++) pos.push(lerp(xs(k, n - 1), xs(k, n), f));

    const end = X1 - n * T; // current boule end
    const xc = blade >= 0 ? end - T : end; // body end drawn

    // seed nub and shoulder, then body
    const tip = iso.p(X0 - 120, 0, 0);
    poly(g, hull(flatRing(iso, [X0, 0, 0], R * 0.98, "x").concat(ringPts(iso, X0 - 100, 14), [tip])), SIDE);
    poly(g, [iso.p(X0 - 100, -8, 8), iso.p(X0 - 130, -8, 8), iso.p(X0 - 130, 8, -8), iso.p(X0 - 100, 8, -8)], TOP);
    disc(g, iso, X0, xc - X0);
    // dashed cut marks on the body (intro only)
    const marks = 1 - seg(tau, 1.4, 2.0);
    if (marks > 0 && n < INTRO.length) {
      for (let k = n; k < INTRO.length; k++) {
        if (blade >= 0 && k === n) continue;
        const x = X1 - (k + 1) * T;
        const pts: Pt[] = [];
        for (let i = 0; i <= 24; i++) {
          const a = Math.PI * (1.0 + (i / 24) * 1.0);
          pts.push(iso.p(x, R * Math.cos(a), Math.min(-R * Math.sin(a), FLAT * R)));
        }
        line(g, pts, { "stroke-dasharray": "8 9", "stroke-width": 2.5, opacity: marks.toFixed(2) });
      }
    }
    // saw blade in the cut plane
    if (blade >= 0) {
      const zb = lerp(R + 30, -R - 40, easeInOut(blade));
      drawBlade(g, iso, xc, zb);
      disc(g, iso, xc, T);
    }
    for (let k = n - 1; k >= 0; k--) disc(g, iso, pos[k], T);
    // step 1 and 2 cues
    const [bx, by] = iso.p(X1 - T, 0, R + 120);
    stepDisc(g, bx - 70, by - 10, 1);
    if (n > 0) {
      const rowA = iso.p(end + 10, 100, -R - 20);
      const rowEnd = iso.p(xs(0, Math.min(n, INTRO.length)) + T + 10, 100, -R - 20);
      pathArrow(g, [rowA, rowEnd], INK, 7, 26);
      stepDisc(g, rowA[0] - 45, rowA[1] + 10, 2);
    }
  };

  return {
    settle: INTRO[INTRO.length - 1] + CUT + SLIDE,
    frame(t: number) {
      lastT = t;
      const tau = host.reduced ? 1e9 : t - base;
      draw(tau);
    },
    destroy() {
      st.svg.removeEventListener("pointerdown", onDown);
      st.destroy();
    },
  };
}

function ringPts(iso: Iso, x: number, r: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    out.push(iso.p(x, r * Math.cos(a), r * Math.sin(a)));
  }
  return out;
}

/** Saw blade: a plate in the y-z plane at x, bottom edge toothed, top at zb + 150. */
function drawBlade(g: Element, iso: Iso, x: number, zb: number): void {
  const y0 = -175;
  const y1 = 175;
  const pts: Pt[] = [iso.p(x, y0, zb + 150), iso.p(x, y1, zb + 150)];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const y = y1 - ((y1 - y0) * i) / n;
    pts.push(iso.p(x, y, zb + (i % 2 ? 0 : 14)));
  }
  poly(g, pts, "#F2F2F2");
  // handle bar on top
  poly(g, [iso.p(x - 6, y0 - 20, zb + 150), iso.p(x - 6, y1 + 20, zb + 150), iso.p(x - 6, y1 + 20, zb + 185), iso.p(x - 6, y0 - 20, zb + 185)], TOP);
}

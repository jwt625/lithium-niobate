// Light p4 (TFLN waveguide): a chip in oblique view, leaded like a window: slate silicon, pale blue silica, a thin
// lavender crystal film with a raised ridge that curves from the back to the front. Light from a lamp at the back runs
// pane by pane along the ridge, around the bends, and glows as a spot in the ridge's front face. Tap: send light again.
import type { Scene, SceneHost } from "../../types";
import { G, LIGHT, blob, circlePts, clamp01, frameAndField, glowFill, makeWindow, pane, polyPath, ribbon, seg, voronoi, type Pt } from "./kit";
import { banner } from "./letters";

export const TEXT4 = "A thin ridge holds the light. Now you know light!";
const LINES = ["A thin ridge holds the light.", "Now you know light!"];

// oblique projection: u along the front edge, v into the depth, h up
const FX = 96;
const FY = 456; // top of the film at the front edge
const DU = 0.64;
const DV = -0.4;
const W = 470; // chip width (u)
const D = 530; // chip depth (v)
const P = (u: number, v: number, h = 0): Pt => [FX + u + DU * v, FY + DV * v - h];
const SLAB = 22;
const OX = 64; // silica thickness
const SI = 50;
const RH = 46; // ridge height
const RW = 112; // ridge width
const U0 = 175; // ridge at the front
const U1 = 372; // ridge at the back
const RATE = 3.2; // ridge panes lit per second
const T0 = 0.35;

/** Ridge centerline (u, v) from back (s = 0) to front (s = 1): straight, S-bend, straight. */
function center(s: number): Pt {
  const v = D * (1 - s);
  const b = clamp01((v - 150) / 260);
  const k = b * b * (3 - 2 * b);
  return [U0 + (U1 - U0) * k, v];
}

export function ridgeScene(host: SceneHost): Scene {
  return makeWindow(host, 24, (w) => {
    frameAndField(w, 654);
    const { rng } = w;
    // silicon and silica (front and right faces)
    const front = (y0: number, y1: number, c: string) => w.add(pane([[FX, y0], [FX + W, y0], [FX + W, y1], [FX, y1]], c, 0.5));
    const side = (h0: number, h1: number, c: string) => w.add(pane([P(W, 0, -h0), P(W, D, -h0), P(W, D, -h1), P(W, 0, -h1)], c, 0.5));
    const yS = FY + SLAB;
    const yO = yS + OX;
    side(SLAB + OX, SLAB + OX + SI, G.slate);
    side(SLAB, SLAB + OX, G.silica);
    side(0, SLAB, "#8D7BBE");
    front(yO, yO + SI, G.slate);
    for (let i = 0; i < 3; i++) w.add(pane([[FX + (W * i) / 3, yS], [FX + (W * (i + 1)) / 3, yS], [FX + (W * (i + 1)) / 3, yO], [FX + (W * i) / 3, yO]], i % 2 ? "#B9D5E8" : G.silica, 0.55));
    front(FY, yS, "#9A88C8");
    // top of the film: facets in (u, v), projected
    for (const c of voronoi(rng, 0, 0, W, D, 150)) w.add(pane(c.map(([u, v]) => P(u, v)), rng() < 0.5 ? "#A595D0" : "#B2A4D8", 0.55));
    // ridge: back-to-front segments, each = visible right wall + top
    const N = 11;
    const tops: Path2D[] = [];
    const mids: Pt[] = [];
    for (let i = 0; i < N; i++) {
      const s0 = i / N;
      const s1 = (i + 1) / N;
      const cl: Pt[] = [];
      for (let k = 0; k <= 8; k++) cl.push(center(s0 + ((s1 - s0) * k) / 8));
      // ribbon in (u, v) plane; R side = +u side for a path heading -v
      const rb = ribbon(cl, RW / 2);
      const half = rb.length / 2;
      const left = rb.slice(0, half);
      const right = rb.slice(half).reverse();
      const sideU = left[0][0] > right[0][0] ? left : right; // the +u edge
      const wall: Pt[] = [...sideU.map(([u, v]) => P(u, v, RH)), ...sideU.slice().reverse().map(([u, v]) => P(u, v, 0))];
      w.add(pane(wall, "#5B4892", 0.45, 8));
      const top = rb.map(([u, v]) => P(u, v, RH));
      w.add(pane(top, i % 2 ? "#7A64B3" : "#8570BC", 0.55, 8));
      tops.push(polyPath(top));
      const [mu, mv] = center((s0 + s1) / 2);
      mids.push(P(mu, mv, RH));
    }
    // ridge front face (cross-section) and the mode spot in it
    const rf: Pt[] = [[FX + U0 - RW / 2, FY - RH], [FX + U0 + RW / 2, FY - RH], [FX + U0 + RW / 2, FY], [FX + U0 - RW / 2, FY]];
    w.add(pane(rf, "#6E59A8", 0.5));
    const MX = FX + U0;
    const MY = FY - RH / 2 + 6;
    w.add(pane(circlePts(MX, MY, 40, 24, 36), "#C9C0A8", 0.7, 7));
    // lamp behind the far end of the ridge
    const [LX0, LY] = P(U1, D + 52, RH);
    const LX = LX0 - 10;
    w.add(pane(circlePts(LX + 10, LY, 40), G.amber, 0.7));
    w.add(pane(circlePts(LX + 10, LY, 23), G.warm, 0.9));
    const lampIn = polyPath(circlePts(LX + 10, LY, 23));
    const mode = polyPath(circlePts(MX, MY, 40, 24, 36));
    banner(w, LINES);

    let t0 = 0;
    const tEnd = T0 + N / RATE;
    return {
      settle: tEnd + 0.6,
      glow(g, t) {
        const r = host.reduced ? 99 : t - t0;
        const lamp = clamp01((t - Math.min(t0, 0)) / T0);
        glowFill(g, lampIn, LIGHT, 0.55 * lamp);
        blob(g, LX + 10, LY, 110, 0.5 * lamp);
        const h = (r - T0) * RATE; // panes reached
        for (let i = 0; i < N; i++) {
          const a = clamp01(h - i) * 1;
          if (a <= 0) break;
          glowFill(g, tops[i], LIGHT, 0.62 * a);
          blob(g, mids[i][0], mids[i][1], 46, 0.28 * a);
        }
        if (h > 0 && h < N + 1) {
          const k = Math.min(N - 1, Math.floor(h));
          blob(g, mids[k][0], mids[k][1], 80, 0.7 * (1 - seg(h, N - 0.5, N + 1)));
        }
        const m = seg(r, tEnd - 0.1, tEnd + 0.25);
        const flare = 1 + 0.6 * (1 - seg(r, tEnd + 0.1, tEnd + 0.6)) * m;
        glowFill(g, mode, LIGHT, 0.85 * m);
        blob(g, MX, MY, 110 * flare, 0.75 * m);
      },
      tap(_x, _y, t) {
        t0 = host.reduced ? -99 : t;
        return tEnd + 0.7;
      },
    };
  });
}

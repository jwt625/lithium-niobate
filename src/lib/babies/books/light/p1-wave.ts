// Light p1 (birefringence): a lamp sends one leaded wave into a lavender crystal with its amber arrow. Inside, the wave
// is drawn as two lanes: wiggle up-and-down (along the arrow, n_e, longer crests, faster) and wiggle side-to-side
// (across the arrow, n_o, closer crests, slower; drawn in oblique projection). Light lights the panes one per half
// period, so the along-arrow lane fills first. Tap: race again.
import type { Scene, SceneHost } from "../../types";
import { G, LIGHT, arrowPts, blob, circlePts, ease, frameAndField, glowFill, makeWindow, movePts, pane, seg, voronoi, type Pt } from "./kit";
import { banner } from "./letters";
import { makeLane, type Lane } from "./wave";

export const TEXT1 = "Light is a wave. In the crystal, two wiggles travel at two speeds.";
const LINES = ["Light is a wave.", "In the crystal, two wiggles", "travel at two speeds."];

const CX0 = 300;
const CX1 = 690;
const LAM_AIR = 150;
const LAM_FAST = 100; // along the arrow (n_e < n_o)
const LAM_SLOW = 70; // across the arrow; ratio drawn much bigger than the real 1.034
const RATE = 6.5; // half waves per second (= 2 x frequency)
const T0 = 0.35;

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

export function waveScene(host: SceneHost): Scene {
  return makeWindow(host, 21, (w) => {
    frameAndField(w, 654);
    const { rng } = w;
    // lamp
    const LX = 102;
    const LY = 352;
    w.add(pane(circlePts(LX, LY, 50), G.amber, 0.7));
    w.add(pane(circlePts(LX, LY, 30), G.warm, 0.9));
    // crystal: lavender facets
    for (const c of voronoi(rng, CX0, 150, CX1, 562, 150)) w.add(pane(c, rng() < 0.5 ? "#8A76BC" : "#9886C6", 0.55));
    w.add(pane(movePts(arrowPts(126), 495, 356), G.amber, 0.7));
    // input wave in air, then two lanes
    const yIn = 352;
    const yUp = 248;
    const yLo = 462;
    const lane = (target: number, lamIn: number, dir: Pt, colors: [string, string]): Lane =>
      makeLane({
        x0: 150,
        x1: 942,
        yc: (x) => yIn + (target - yIn) * smooth((x - CX0 + 10) / 95),
        lam: (x) => (x < CX0 || x > CX1 ? LAM_AIR : lamIn),
        amp: 30,
        ampAt: (x) => (x < CX0 ? 1 : smooth((x - CX0 - 15) / 80)),
        dir,
        hw: 11,
        colors,
      });
    const up = lane(yUp, LAM_FAST, [0, -1], ["#A89A70", "#8F8462"]);
    const lo = lane(yLo, LAM_SLOW, [0.34, 0.5], ["#A89A70", "#6F6750"]);
    // the shared input section: draw only from one lane before the crystal (both lanes coincide there)
    const split = (l: Lane) => l.centers.findIndex((c) => c[0] > CX0 - 4);
    const su = split(up);
    const sl = split(lo);
    const lanes = [
      { l: up, from: 0 },
      { l: lo, from: sl },
    ];
    // input in air drawn once, in-plane (unpolarized light drawn as one wave)
    w.addAll(up.panes.slice(0, su));
    w.addAll(up.panes.slice(su));
    w.addAll(lo.panes.slice(sl));
    // crystal outline lead on top of the lane ends so the block reads as one piece
    w.leadLine([[CX0, 150], [CX1, 150], [CX1, 562], [CX0, 562], [CX0, 150]], 11);
    banner(w, LINES);

    let t0 = 0;
    const lit = (t: number, h: number) => ease((t - t0 - T0 - h / RATE) * 4);
    return {
      settle: T0 + Math.max(up.total, lo.total) / RATE + 0.4,
      glow(g, t) {
        const lamp = ease((t - t0) / T0);
        g.fillStyle = `rgba(${LIGHT},${0.5 * lamp})`;
        g.beginPath();
        g.arc(LX, LY, 30, 0, Math.PI * 2);
        g.fill();
        blob(g, LX, LY, 110, 0.55 * lamp);
        for (const { l, from } of lanes) {
          for (let i = from; i < l.panes.length; i++) {
            const a = lit(t, l.start[i]);
            if (a <= 0) break;
            glowFill(g, l.paths[i], LIGHT, 0.62 * a);
            blob(g, l.centers[i][0], l.centers[i][1], 34, 0.22 * a);
          }
          const h = (t - t0 - T0) * RATE;
          if (h > 0 && h < l.total + 1) {
            const [hx, hy] = l.at(h);
            blob(g, hx, hy, 58, 0.75 * (1 - seg(h, l.total - 1, l.total + 1)));
          }
        }
      },
      tap(_x, _y, t) {
        t0 = host.reduced ? -1e3 : t;
        return T0 + Math.max(up.total, lo.total) / RATE + 0.5;
      },
    };
  });
}

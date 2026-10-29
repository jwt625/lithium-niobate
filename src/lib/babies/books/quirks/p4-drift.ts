// p4 DC bias drift: a battery holds a steady voltage across a layered slab; mobile charges creep to the plates and
// the gauge pointer walks away from its set mark, leaving faint old scratches. Tap: re-lock (pointer snaps back,
// charges spread out again, old scratches heal), then it drifts again.
import type { Scene, SceneHost } from "../../types";
import { bakeAll, bakeText, drawAll } from "./common";
import { arrowScratches, circle, easeIO, hatchLines, lerp, makeScene, rectPts, scratch, seg, type Pt, type Scratch } from "./kit";
import { labelScratches } from "./letters";

export const TEXT4 = "Keep the voltage steady. The pointer slowly drifts away. Now you know the quirks!";

const GC: Pt = [500, 372];
const GR = 200;
const SWING = (52 * Math.PI) / 180;
const SLAB = { x0: 272, x1: 728, y0: 470, y1: 618, mid: 512 };
const BAT = { x0: 84, x1: 176, y0: 492, y1: 612 };
const DRIFT_T = 3.2, TAU = 1.1;

/** Normalized drift after tau seconds of steady voltage: one-RC approach, reaching 1 at DRIFT_T. */
const drift = (tau: number): number => (tau <= 0 ? 0 : Math.min(1, (1 - Math.exp(-tau / TAU)) / (1 - Math.exp(-DRIFT_T / TAU))));

export function driftScene(host: SceneHost): Scene {
  return makeScene(host, 4401, (k) => {
    const rng = host.rng(4402);
    const R = host.reduced;
    const needle = (w: number, len: number): Scratch => scratch([[0, 0], [0, -len]], w, rng, 0.4);
    const main = needle(10, GR - 22);
    const tip = scratch([[-14, -(GR - 50)], [0, -(GR - 22)], [14, -(GR - 50)]], 9, rng, 0.4);
    const GHOST = [0.25, 0.5, 0.75];
    const ghosts = GHOST.map(() => needle(4, GR - 30));
    const hub = [scratch(circle(0, 0, 16), 7, rng, 0.4), ...hatchLines(circle(0, 0, 12, 12, 0, Math.PI * 2, 16), 0.8, 6, 3, rng, 0.2)];
    // mobile charges: negatives creep up to the + plate, positives down to the - plate
    interface Q { x: number; y0: number; y1: number; neg: boolean }
    const qs: Q[] = [];
    for (let i = 0; i < 16; i++) {
      const neg = i % 2 === 0;
      const x = lerp(SLAB.x0 + 34, SLAB.x1 - 80, (i + 0.5) / 16) + (rng() - 0.5) * 14;
      const y0 = lerp(SLAB.y0 + 22, SLAB.y1 - 22, rng());
      const y1 = neg ? SLAB.y0 + 13 + rng() * 8 : SLAB.y1 - 13 - rng() * 8;
      qs.push({ x, y0, y1, neg });
    }
    const dot = scratch(circle(0, 0, 3.5, 3.5, 0, Math.PI * 2, 10), 8, rng, 0.15);

    // re-lock events; drift restarts 0.45 s after each
    const ev: number[] = [];
    const start = (): number => (ev.length ? ev[ev.length - 1] + 0.45 : 0.5);
    const state = (t: number): { d: number; relock: number; dOld: number } => {
      if (R) return { d: 1, relock: 1, dOld: 0 };
      if (!ev.length) return { d: drift(t - 0.5), relock: 1, dOld: 0 };
      const te = ev[ev.length - 1];
      const prevStart = ev.length > 1 ? ev[ev.length - 2] + 0.45 : 0.5;
      const dOld = drift(te - prevStart);
      const back = easeIO(seg(t, te, te + 0.3));
      return { d: t < start() ? dOld * (1 - back) : drift(t - start()), relock: back, dOld };
    };

    return {
      settle: 4.0,
      bake(g, r) {
        // gauge face: arc, ticks, the green "set" notch at the top
        const face: Scratch[] = [scratch(circle(GC[0], GC[1], GR, GR, Math.PI + 0.32, Math.PI * 2 - 0.32), 7, r)];
        for (let a = Math.PI + 0.42; a <= Math.PI * 2 - 0.4; a += 0.157)
          face.push(scratch([[GC[0] + (GR - 4) * Math.cos(a), GC[1] + (GR - 4) * Math.sin(a)], [GC[0] + (GR - 26) * Math.cos(a), GC[1] + (GR - 26) * Math.sin(a)]], 4, r, 0.4));
        face.push(scratch([[GC[0] - 160, GC[1]], [GC[0] + 160, GC[1]]], 6, r));
        bakeAll(g, face, k.ink("rainbow"), r);
        bakeAll(g, [scratch([[GC[0] - 18, GC[1] - GR - 40], [GC[0] + 18, GC[1] - GR - 40], [GC[0], GC[1] - GR - 10], [GC[0] - 18, GC[1] - GR - 40]], 8, r)], k.ink("green"), r);
        // stem from the gauge to the top plate
        bakeAll(g, [scratch([[GC[0], GC[1] + 18], [GC[0], SLAB.y0 - 18]], 6, r)], k.ink("white"), r);
        // slab: outline, dashed layer boundary, plates, the crystal arrow in the lower layer
        bakeAll(g, [scratch(rectPts(SLAB.x0, SLAB.y0, SLAB.x1, SLAB.y1), 7, r)], k.ink("purple"), r);
        const dash: Scratch[] = [];
        for (let x = SLAB.x0 + 14; x < SLAB.x1 - 20; x += 30) dash.push(scratch([[x, SLAB.mid], [x + 16, SLAB.mid]], 4, r, 0.4));
        bakeAll(g, dash, k.ink("purple"), r);
        const plateTop: Pt[] = [[SLAB.x0 - 6, SLAB.y0 - 20], [SLAB.x1 + 6, SLAB.y0 - 20], [SLAB.x1 + 6, SLAB.y0 - 3], [SLAB.x0 - 6, SLAB.y0 - 3]];
        const plateBot: Pt[] = [[SLAB.x0 - 6, SLAB.y1 + 3], [SLAB.x1 + 6, SLAB.y1 + 3], [SLAB.x1 + 6, SLAB.y1 + 20], [SLAB.x0 - 6, SLAB.y1 + 20]];
        bakeAll(g, [...hatchLines(plateTop, 0, 5, 3.2, r, 0.3), ...hatchLines(plateBot, 0, 5, 3.2, r, 0.3)], k.ink("yellow"), r);
        bakeAll(g, arrowScratches(SLAB.x1 - 34, SLAB.y1 - 14, SLAB.mid + 10, r, 8), k.ink("green"), r);
        // battery with + on top, wires to the plates
        bakeAll(g, [scratch(rectPts(BAT.x0, BAT.y0, BAT.x1, BAT.y1), 7, r), scratch(rectPts(112, BAT.y0 - 14, 148, BAT.y0), 6, r)], k.ink("orange"), r);
        bakeAll(g, labelScratches("+", 130, BAT.y0 + 30, 36, r, 0.24), k.ink("red"), r);
        bakeAll(g, labelScratches("-", 130, BAT.y1 - 34, 36, r, 0.24), k.ink("blue"), r);
        const wires: Scratch[] = [
          scratch([[130, BAT.y0 - 14], [130, SLAB.y0 - 12], [SLAB.x0 - 6, SLAB.y0 - 12]], 5, r, 0.5),
          scratch([[130, BAT.y1], [130, SLAB.y1 + 12], [SLAB.x0 - 6, SLAB.y1 + 12]], 5, r, 0.5),
        ];
        bakeAll(g, wires, k.ink("white"), r);
        bakeText(g, k.ink, TEXT4, r, 36, 80, 840);
      },
      draw(g, t) {
        const { d, relock, dOld } = state(t);
        // charges
        for (const q of qs) {
          const y = lerp(q.y0, q.y1, easeIO(d));
          g.save();
          g.translate(q.x, y);
          drawAll(g, [dot], k.ink(q.neg ? "blue" : "red"), 1, false);
          g.restore();
        }
        // ghost scratches where the pointer has been
        g.save();
        g.translate(GC[0], GC[1]);
        const red = k.ink("red");
        GHOST.forEach((f, i) => {
          let a = d >= f ? 0.4 : 0;
          if (ev.length && !R && t < start() && dOld >= f) a = 0.4 * (1 - relock);
          if (a <= 0) return;
          g.globalAlpha = a;
          g.save();
          g.rotate(SWING * f);
          drawAll(g, [ghosts[i]], red, 1, false);
          g.restore();
        });
        g.globalAlpha = 1;
        g.save();
        g.rotate(SWING * d);
        drawAll(g, [main, tip], red, 1, false);
        g.restore();
        drawAll(g, hub, k.ink("white"), 1, false);
        g.restore();
      },
      down(_x, _y, t) {
        if (R) {
          ev.push(-1e9);
          return 0.01;
        }
        const last = ev[ev.length - 1] ?? -1e9;
        const at = Math.max(t, last + 0.5);
        ev.push(at);
        return at - t + 0.45 + DRIFT_T + 0.2;
      },
    };
  });
}

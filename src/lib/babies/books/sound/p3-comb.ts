// p3: two carved metal combs (IDTs) on the crystal, top view. The left comb turns the red wiggle
// into a ripple, the right comb catches it and the phone shows the signal. Only the ripple whose
// wavelength equals the comb period builds up; tap to try a shorter or a longer ripple.

import type { Scene, SceneHost } from "../../types";
import { PAL, TAU, blob, boil, easeIO, gouge, hash, makeScene, q10, rect, roughPoly, seg, type Ctx, type Pt } from "./kit";

export const P3_TEXT = "Combs make a ripple and catch it. Only ripples that fit get through: a phone filter!";

const P = 80; // comb period = matched wavelength
const FW = 17; // finger width
const NF = 5; // fingers per comb
const BT = 176; // top bus bar y (centre)
const BB = 568; // bottom bus bar y
const BAR = 28;
const LX = 214; // first finger x, left comb
const RX = 618; // first finger x, right comb
const CH = { x0: 156, y0: 136, x1: 836, y1: 608 };
const NOTES = [1, 0.58, 1.6]; // ripple wavelength / comb period
const V = 62; // ripple speed, units per second

function comb(g: Ctx, x0: number, seed: number): void {
  const xEnd = x0 + (NF - 1) * (P / 2);
  roughPoly(g, rect(x0 - 26, BT - BAR / 2, xEnd + 26, BT + BAR / 2), seed, 1.2);
  roughPoly(g, rect(x0 - 26, BB - BAR / 2, xEnd + 26, BB + BAR / 2), seed + 1, 1.2);
  for (let i = 0; i < NF; i++) {
    const x = x0 + i * (P / 2);
    const fromTop = i % 2 === 0;
    const ya = fromTop ? BT : BB;
    const yb = fromTop ? BB - 60 : BT + 60;
    roughPoly(g, rect(x - FW / 2, Math.min(ya, yb), x + FW / 2, Math.max(ya, yb)), seed + 10 + i, 1.1, 5);
  }
}

/** Red sine inside a ring: the input or output signal. */
function wiggle(g: Ctx, cx: number, cy: number, r: number, cycles: number, a: number, ph: number, seed: number): void {
  const pts: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const s = i / 40;
    pts.push([cx - r * 0.72 + 1.44 * r * s, cy - r * 0.42 * a * Math.sin(TAU * cycles * s + ph) * Math.sin(Math.PI * s) ** 0.5]);
  }
  gouge(g, pts, 7, { taper: 0.7, rough: 0.6, seed, step: 2.5 });
}

export function p3Scene(host: SceneHost): Scene {
  return makeScene(host, P3_TEXT, 3301, (k) => {
    let note = 0;
    let prev = 0;
    let tn = k.reduced ? -1e6 : -10;
    // crystal-surface hatch: fine broken horizontal cuts (static, seeded)
    const hatch: [number, number, number][] = [];
    for (let y = CH.y0 + 14; y < CH.y1 - 8; y += 15) {
      let x = CH.x0 + 10 + hash(y, 1) * 30;
      while (x < CH.x1 - 20) {
        const len = 40 + hash(Math.floor(x), y) * 120;
        hatch.push([x, Math.min(CH.x1 - 12, x + len), y]);
        x += len + 14 + hash(y, Math.floor(x)) * 40;
      }
    }
    const intro = (t: number) => (k.reduced ? 1 : seg(t, 0.1, 1.0));
    return {
      settle: Infinity,
      key: (t) => `${q10(t)}`,
      down(_x, _y, t) {
        prev = note;
        note = (note + 1) % NOTES.length;
        tn = k.reduced ? -1e6 : t;
        return 1.6;
      },
      draw(g, t) {
        const tq = q10(t);
        const b = boil(t) * 1000;
        const mix = easeIO(seg(tq - tn, 0, 0.7));
        const ampOf = (n: number) => (n === 0 ? 1 : 0.22);
        const amp = ampOf(prev) * (1 - mix) + ampOf(note) * mix;
        const lam = P * (NOTES[prev] * (1 - mix) + NOTES[note] * mix);
        const on = intro(tq);

        // crystal chip: cut black edge, fine hatch
        g.fillStyle = PAL.ink;
        g.beginPath();
        roughPoly(g, rect(CH.x0 - 9, CH.y0 - 9, CH.x1 + 9, CH.y1 + 9), b + 1, 1.3);
        roughPoly(g, [[CH.x0, CH.y0], [CH.x0, CH.y1], [CH.x1, CH.y1], [CH.x1, CH.y0]], b + 2, 1.3);
        g.fill("nonzero");
        g.beginPath();
        hatch.forEach(([xa, xb, y], i) => gouge(g, [[xa, y], [xb, y]], 1.5, { taper: 1, rough: 0.35, seed: b + 20 + i }));
        g.fill();

        // wires: source -> left comb, right comb -> phone
        const lEnd = LX + (NF - 1) * (P / 2) + 26;
        const rEnd = RX + (NF - 1) * (P / 2) + 26;
        g.beginPath();
        gouge(g, [[88, 330], [88, BT], [LX - 26, BT]], 6, { taper: 0, rough: 0.6, seed: b + 40 });
        gouge(g, [[88, 414], [88, BB], [LX - 26, BB]], 6, { taper: 0, rough: 0.6, seed: b + 41 });
        gouge(g, [[rEnd, BT], [902, BT], [902, 268]], 6, { taper: 0, rough: 0.6, seed: b + 42 });
        gouge(g, [[rEnd, BB], [902, BB], [902, 476]], 6, { taper: 0, rough: 0.6, seed: b + 43 });
        g.fill();

        // the two combs
        g.beginPath();
        comb(g, LX, b + 50);
        comb(g, RX, b + 80);
        g.fill();
        // highlight cuts on the bus bars
        g.fillStyle = PAL.paperInk;
        g.beginPath();
        for (const [x0, xe] of [
          [LX, lEnd],
          [RX, rEnd],
        ]) {
          gouge(g, [[x0 - 12, BT - 5], [xe - 30, BT - 5]], 2.6, { taper: 1, rough: 0.4, seed: b + 110 + x0 });
          gouge(g, [[x0 + 10, BB + 5], [xe - 12, BB + 5]], 2.6, { taper: 1, rough: 0.4, seed: b + 120 + x0 });
        }
        g.fill();

        // ripple crests (red): launched under the left comb, travel right
        const xs = LX;
        const xEndR = rEnd - 20;
        const shift = (V * tq) % lam;
        const lc = LX + (NF - 1) * (P / 2);
        g.fillStyle = PAL.red;
        g.beginPath();
        for (let x = xs - lam + shift; x < xEndR; x += lam) {
          if (x < xs) continue;
          // build-up across the launching comb; a ripple that does not fit also dies away
          const build = seg(x, xs - 10, lc + 10);
          const decay = amp < 0.6 ? Math.exp(-(x - lc) / 120) : 1;
          const a = on * amp * (0.35 + 0.65 * build) * Math.min(1, decay);
          if (a < 0.04) continue;
          const h = 50 + 120 * a;
          const yc = (BT + BB) / 2;
          const bow = 16;
          const arcPts: Pt[] = [];
          for (let i = -6; i <= 6; i++) arcPts.push([x - bow * (i / 6) ** 2, yc + (h * i) / 6]);
          gouge(g, arcPts, 4 + 11 * a, { taper: 1, rough: 0.9, seed: b + 200 + Math.floor(x) });
        }
        g.fill();

        // source ring (left) and phone (right)
        const outA = on * Math.max(0, (amp - 0.22) / 0.78);
        g.fillStyle = PAL.ink;
        g.beginPath();
        blob(g, 88, 372, 52, b + 300, 1.2);
        g.fill();
        g.fillStyle = PAL.paper;
        g.beginPath();
        blob(g, 88, 372, 40, b + 301, 1);
        g.fill();
        g.fillStyle = PAL.red;
        g.beginPath();
        wiggle(g, 88, 372, 40, 2.2 / (lam / P), on, -TAU * (V / lam) * tq, b + 310);
        g.fill();

        g.fillStyle = PAL.ink;
        g.beginPath();
        roughPoly(g, rect(864, 262, 940, 482), b + 320, 1.3);
        g.fill();
        g.fillStyle = PAL.paper;
        g.beginPath();
        roughPoly(g, rect(873, 288, 931, 446), b + 321, 1);
        g.fill();
        g.fillStyle = PAL.ink;
        g.beginPath();
        blob(g, 902, 464, 7, b + 322);
        gouge(g, [[892, 275], [912, 275]], 4, { taper: 0.3, rough: 0.4, seed: b + 323 });
        g.fill();
        if (outA > 0.02) {
          g.fillStyle = PAL.red;
          g.beginPath();
          const pts: Pt[] = [];
          for (let i = 0; i <= 30; i++) {
            const s = i / 30;
            pts.push([902 + 18 * outA * Math.sin(TAU * 1.6 * s - TAU * (V / P) * tq), 300 + 134 * s]);
          }
          gouge(g, pts, 6, { taper: 0.6, rough: 0.5, seed: b + 330, step: 2.5 });
          g.fill();
        }
      },
    };
  });
}

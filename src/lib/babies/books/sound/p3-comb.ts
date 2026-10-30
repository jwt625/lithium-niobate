// p3: two carved metal combs (IDTs) on the crystal, top view. The left comb turns the red wiggle
// into a ripple, the right comb catches it and the phone shows the signal. The drive wavelength
// sweeps 1.6 P -> 0.58 P and back (cosine in log lam); the comb response R(lam) is the finger
// array factor, ripple amplitude R, phone R^2: none -> through -> none. Input wiggle, crest spacing
// and phone wiggle all follow lam, phase from the integral of V/lam (table). Tap: freeze the sweep.

import type { Scene, SceneHost } from "../../types";
import { PAL, TAU, blob, boil, gouge, hash, makeScene, q10, rect, roughPoly, seg, type Ctx, type Pt } from "./kit";

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
const V = 80; // ripple speed at the mid-crystal anchor, units per second

// sweep: lam/P from LAM_LONG (low frequency) to LAM_SHORT (high frequency) and back, cosine in log lam
const LAM_LONG = 1.6;
const LAM_SHORT = 0.58;
const T_START = 1.0; // s, sweep starts when the intro is done; held at LAM_LONG before
const T_PASS = 6.0; // s, one one-way pass
const T_PER = 2 * T_PASS;
const OUT_MIN = 0.08; // phone R^2 below which the output line is not drawn
const U_MID = (Math.log(LAM_LONG) + Math.log(LAM_SHORT)) / 2;
const U_AMP = (Math.log(LAM_LONG) - Math.log(LAM_SHORT)) / 2;

/** lam (logical units) at sweep clock s (seconds since page start, freezes excluded). */
function lamAt(s: number): number {
  if (s <= T_START) return P * LAM_LONG;
  return P * Math.exp(U_MID + U_AMP * Math.cos((Math.PI * (s - T_START)) / T_PASS));
}

/** Comb launch (= catch) response: array factor of NF alternating fingers at pitch P/2,
 *  |sin(NF d/2) / (NF sin(d/2))| with d = pi (P/lam - 1); 1 at lam = P, first zeros at P/lam = 1 +- 2/NF. */
function resp(lam: number): number {
  const h = (Math.PI / 2) * (P / lam - 1);
  if (Math.abs(h) < 1e-6) return 1;
  return Math.abs(Math.sin(NF * h) / (NF * Math.sin(h)));
}

// accumulated phase (cycles) over one ping-pong period: PH[i] = integral of V/lam from T_START
const PH_N = 2400;
const PH = new Float64Array(PH_N + 1);
for (let i = 1; i <= PH_N; i++) {
  const s0 = T_START + ((i - 1) * T_PER) / PH_N;
  const s1 = T_START + (i * T_PER) / PH_N;
  const sm = (s0 + s1) / 2;
  // Simpson per step
  PH[i] = PH[i - 1] + ((s1 - s0) / 6) * (V / lamAt(s0) + (4 * V) / lamAt(sm) + V / lamAt(s1));
}

/** Cycles of the drive at sweep clock s: crests, input and output wiggles all use this phase. */
function cyclesAt(s: number): number {
  const c0 = (V / (P * LAM_LONG)) * T_START;
  if (s <= T_START) return (V / (P * LAM_LONG)) * s;
  const r = s - T_START;
  const k = Math.floor(r / T_PER);
  const f = ((r - k * T_PER) / T_PER) * PH_N;
  const i = Math.min(PH_N - 1, Math.floor(f));
  return c0 + k * PH[PH_N] + PH[i] + (PH[i + 1] - PH[i]) * (f - i);
}

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
    // tap state: sweep clock = t - off (running) or tf - off (frozen); ph = cycles gained while frozen
    let frozen = false;
    let tf = 0;
    let off = 0;
    let ph = 0;
    const clock = (t: number): number => (frozen ? tf - off : t - off);
    const cycles = (t: number): number => {
      const s = clock(t);
      return cyclesAt(s) + ph + (frozen ? ((t - tf) * V) / lamAt(s) : 0);
    };
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
        if (k.reduced) return 0;
        const tq = q10(t);
        if (frozen) {
          ph += ((tq - tf) * V) / lamAt(tf - off);
          off += tq - tf;
          frozen = false;
        } else {
          tf = tq;
          frozen = true;
        }
        return 1.6;
      },
      draw(g, t) {
        const tq = q10(t);
        const b = boil(t) * 1000;
        // reduced motion: matched state, still
        const lam = k.reduced ? P : lamAt(clock(tq));
        const cyc = k.reduced ? 0 : cycles(tq);
        const R = resp(lam);
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

        // ripple crests (red): crest n at xm + lam (n + cyc), amplitude R, built up across the launching comb
        const xs = LX;
        const xEndR = rEnd - 20;
        const xm = (xs + xEndR) / 2;
        const lc = LX + (NF - 1) * (P / 2);
        g.fillStyle = PAL.red;
        g.beginPath();
        for (let n = Math.ceil((xs - xm) / lam - cyc); ; n++) {
          const x = xm + lam * (n + cyc);
          if (x >= xEndR) break;
          const build = seg(x, xs - 10, lc + 10);
          const a = on * R * (0.35 + 0.65 * build);
          if (a < 0.04) continue;
          const h = 50 + 120 * a;
          const yc = (BT + BB) / 2;
          const bow = 16;
          const arcPts: Pt[] = [];
          for (let i = -6; i <= 6; i++) arcPts.push([x - bow * (i / 6) ** 2, yc + (h * i) / 6]);
          gouge(g, arcPts, 4 + 11 * a, { taper: 1, rough: 0.9, seed: b + 200 + (((n % 97) + 97) % 97) });
        }
        g.fill();

        // source ring (left) and phone (right)
        // phone: R^2 (launch x catch); below OUT_MIN (comb sidelobes, about -24 dB) the line is not drawn
        const outA = on * R * R;
        const outW = 6 * seg(outA, OUT_MIN, OUT_MIN + 0.22);
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
        wiggle(g, 88, 372, 40, (2.2 * P) / lam, on, -TAU * cyc, b + 310);
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
        if (outW > 1) {
          g.fillStyle = PAL.red;
          g.beginPath();
          const pts: Pt[] = [];
          for (let i = 0; i <= 30; i++) {
            const s = i / 30;
            pts.push([902 + 18 * outA * Math.sin((TAU * 1.6 * P * s) / lam - TAU * cyc), 300 + 134 * s]);
          }
          gouge(g, pts, outW, { taper: 0.6, rough: 0.5, seed: b + 330, step: 2.5 });
          g.fill();
        }
      },
    };
  });
}

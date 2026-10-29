// p1: squeeze the crystal -> charge appears on the pressed faces; a centre-zero meter swings.
// Tap: the press lifts, the charges go, then it squeezes again.

import type { Scene, SceneHost } from "../../types";
import { PAL, arrow, blob, boil, ease, gouge, hash, makeScene, q10, rect, roughPoly, seg, type Ctx, type Pt } from "./kit";

export const P1_TEXT = "Squeeze the crystal. Charge appears on its faces!";

const CX = 330; // block centre x
const CY = 392; // block centre y
const W0 = 270;
const H0 = 250;
const MX = 735; // meter centre
const MY = 330;
const MR = 120;

/** Squeeze amount 0..1 at u seconds after the (re)start; `from` = squeeze at the restart. */
function squeeze(u: number, from: number): number {
  if (u < 0.35) return from * (1 - ease(u / 0.35));
  return ease(seg(u, 0.55, 1.05));
}

function sign(g: Ctx, x: number, y: number, r: number, plus: boolean, seed: number): void {
  gouge(g, [[x - r, y], [x + r, y]], r * 0.5, { taper: 0.3, rough: 0.8, seed });
  if (plus) gouge(g, [[x, y - r], [x, y + r]], r * 0.5, { taper: 0.3, rough: 0.8, seed: seed + 1 });
}

export function p1Scene(host: SceneHost): Scene {
  return makeScene(host, P1_TEXT, 3101, (k) => {
    let t0 = k.reduced ? -1e6 : 0;
    let from = 0;
    const at = (t: number) => squeeze(t - t0, from);
    const needle = (t: number): number => {
      const u = t - t0;
      const sq = at(t);
      const v = Math.max(0, u - 0.8);
      return sq * (1 + 0.28 * Math.sin(9 * v) * Math.exp(-3.4 * v));
    };
    return {
      settle: 2.6,
      key: (t) => {
        const u = t - t0;
        return u > 2.7 ? "end" : `${q10(t)}`;
      },
      down(_x, _y, t) {
        from = at(t);
        t0 = k.reduced ? -1e6 : t;
        return 2.6;
      },
      draw(g, t) {
        const b = boil(t - t0 > 2.7 ? 0 : t) * 1000;
        const tq = t - t0 > 2.7 ? t : t0 + q10(t - t0);
        const sq = at(tq);
        const H = H0 * (1 - 0.1 * sq);
        const W = W0 * (1 + 0.035 * sq);
        const top = CY - H / 2;
        const bot = CY + H / 2;
        const x0 = CX - W / 2;
        const x1 = CX + W / 2;

        // crystal block: black, with white strain cuts that crowd together when squeezed
        g.fillStyle = PAL.ink;
        g.beginPath();
        roughPoly(g, rect(x0, top, x1, bot), b + 20, 1.6);
        g.fill();
        // right side face (depth), cut with dense diagonal lines
        const DX = 44;
        const DY = -30;
        g.fillStyle = PAL.ink;
        g.beginPath();
        roughPoly(g, [[x1, top], [x1 + DX, top + DY], [x1 + DX, bot + DY], [x1, bot]], b + 21, 1.4);
        g.fill();
        g.fillStyle = PAL.paperInk;
        g.beginPath();
        for (let i = 0; i < 9; i++) {
          const y = top + 20 + ((H - 30) * i) / 8;
          gouge(g, [[x1 + 8, y], [x1 + DX - 8, y + DY + 4]], 2.6, { taper: 1, rough: 0.5, seed: b + 30 + i });
        }
        // front face: strain cuts that crowd together when squeezed
        const nL = 7;
        for (let i = 1; i <= nL; i++) {
          const f = i / (nL + 1);
          const y = top + 40 + (H - 80) * f;
          // each cut is two or three tapered gouge runs with seeded breaks
          const w = 5.6 - 2.6 * Math.abs(f - 0.5) * 2;
          let xa = x0 + 22 + hash(i, 1) * 26;
          let j = 0;
          while (xa < x1 - 40) {
            const xb = Math.min(x1 - 22 - hash(i, 2) * 20, xa + 70 + hash(i, j + 3) * 130);
            gouge(g, [[xa, y], [xb, y]], w, { taper: 1, rough: 0.9, seed: b + 40 + i * 7 + j });
            xa = xb + 8 + hash(j, i + 5) * 14;
            j++;
          }
        }
        g.fill();
        // charges on the pressed faces: red + on top, red - on the bottom (on a plain band)
        const cA = seg(sq, 0.45, 0.95);
        if (cA > 0) {
          const r = 18 * cA;
          g.fillStyle = PAL.red;
          g.beginPath();
          for (let i = 0; i < 5; i++) sign(g, x0 + W * (0.14 + 0.18 * i), top + 22, r, true, b + 70 + i * 2);
          g.fill();
          g.fillStyle = PAL.red;
          g.beginPath();
          for (let i = 0; i < 5; i++) {
            const x = x0 + W * (0.14 + 0.18 * i);
            gouge(g, [[x - r * 0.8, bot - 24], [x + r * 0.8, bot - 24]], r * 0.62, { taper: 0.3, rough: 0.8, seed: b + 90 + i * 2 });
          }
          g.fill();
        }

        // press plates (metal: black with highlight cuts) and big red push arrows
        const pw = W0 + 100;
        const PC = CX + 20;
        const ph = 30;
        const lift = 14 * (1 - sq);
        const pt = top - ph - lift;
        const pb = bot + lift;
        g.fillStyle = PAL.ink;
        g.beginPath();
        roughPoly(g, rect(PC - pw / 2, pt, PC + pw / 2, pt + ph), b + 110, 1.2);
        roughPoly(g, rect(PC - pw / 2, pb, PC + pw / 2, pb + ph), b + 111, 1.2);
        g.fill();
        g.fillStyle = PAL.paperInk;
        g.beginPath();
        gouge(g, [[PC - pw / 2 + 16, pt + 10], [PC + pw / 2 - 40, pt + 10]], 3, { taper: 1, rough: 0.5, seed: b + 115 });
        gouge(g, [[PC - pw / 2 + 40, pb + 10], [PC + pw / 2 - 16, pb + 10]], 3, { taper: 1, rough: 0.5, seed: b + 116 });
        g.fill();
        const push = 22 * sq;
        g.fillStyle = PAL.red;
        g.beginPath();
        for (const dx of [-80, 80]) {
          arrow(g, CX + dx, 60 - 10 + push * 0.3, CX + dx, pt - 10, 20, b + 120 + dx);
          arrow(g, CX + dx, 708 - push * 0.3, CX + dx, pb + ph + 10, 20, b + 130 + dx);
        }
        g.fill();

        // wires from the plates to the meter
        g.fillStyle = PAL.ink;
        g.beginPath();
        const wy1 = pt + ph / 2;
        const wy2 = pb + ph / 2;
        const ex = PC + pw / 2;
        gouge(g, [[ex - 4, wy1], [MX - 50, wy1], [MX - 50, MY + 62]], 6, { taper: 0, rough: 0.7, seed: b + 140 });
        gouge(g, [[ex - 4, wy2], [MX + 50, wy2], [MX + 50, MY + 62]], 6, { taper: 0, rough: 0.7, seed: b + 141 });
        g.fill();

        // meter: carved black case, paper dial, ticks, needle (centre zero)
        g.fillStyle = PAL.ink;
        g.beginPath();
        roughPoly(g, rect(MX - MR - 22, MY - MR - 26, MX + MR + 22, MY + 74), b + 150, 1.4);
        g.fill();
        g.fillStyle = PAL.paper;
        g.beginPath();
        const dial: Pt[] = [];
        for (let i = 0; i <= 24; i++) {
          const a = Math.PI + (Math.PI * i) / 24;
          dial.push([MX + MR * Math.cos(a), MY + 30 + MR * Math.sin(a)]);
        }
        roughPoly(g, dial, b + 151, 1.1, 5);
        g.fill();
        g.fillStyle = PAL.ink;
        g.beginPath();
        for (let i = -4; i <= 4; i++) {
          const a = -Math.PI / 2 + i * 0.32;
          const r0 = MR - (i === 0 ? 34 : 22);
          gouge(
            g,
            [
              [MX + r0 * Math.cos(a), MY + 30 + r0 * Math.sin(a)],
              [MX + (MR - 8) * Math.cos(a), MY + 30 + (MR - 8) * Math.sin(a)],
            ],
            i === 0 ? 6 : 4,
            { taper: 0.5, rough: 0.5, seed: b + 160 + i },
          );
        }
        const na = -Math.PI / 2 + 1.05 * needle(tq);
        gouge(g, [[MX, MY + 30], [MX + (MR - 18) * Math.cos(na), MY + 30 + (MR - 18) * Math.sin(na)]], 8, { taper: 0.8, rough: 0.6, seed: b + 170 });
        g.fill();
        g.fillStyle = PAL.red;
        g.beginPath();
        blob(g, MX, MY + 30, 13, b + 171);
        g.fill();
      },
    };
  });
}

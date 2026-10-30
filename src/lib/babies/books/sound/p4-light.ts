// p4: acousto-optics, run as a deflector (AOD). A transducer under the crystal sends sound up; its squeezed
// bands are carved black stripes that move. The drive frequency wobbles gently about its centre, so the
// crystal holds a slightly chirped grating (each stripe keeps the spacing it was launched with) and the
// turned-aside beam swings with the frequency of the stripes it crosses: angle = 2 TH f/F0 (much
// exaggerated); the straight beam and the block stay put. Tap: sound off / on.

import type { Scene, SceneHost } from "../../types";
import { PAL, TAU, blob, boil, easeIO, gouge, hash, makeScene, q10, rect, roughPoly, seg, type Ctx, type Pt } from "./kit";

export const P4_TEXT = "Sound makes moving stripes. They turn some light aside. Now you know sound!";
export const P4_RED_FROM = 9; // "Now you know sound!" cut in red

const BX0 = 336;
const BX1 = 664;
const BY0 = 104;
const BY1 = 548;
const LAMS = 58; // sound wavelength at the centre frequency (stripe period)
const VS = 34; // sound speed, units per second (upward); fixed, so wavelength = VS / f
const F0 = VS / LAMS; // centre drive frequency, stripes per second
const FA = 0.22; // frequency wobble, fraction of F0
const FT = 6; // wobble period, seconds
const HIT: Pt = [500, 330]; // where the beam meets the stripes
const TH = 0.13; // Bragg angle as drawn at F0, radians (much exaggerated); the block is tilted by it
const FW = TAU / FT;
const DHIT = (BY1 - HIT[1]) / VS; // travel time from the transducer to the beam, seconds

// drive frequency f(t) = F0 (1 + a sin(FW t)) and its phase in cycles, phi(t) = integral of f dt (phi(0) = 0)
const freq = (t: number, a: number): number => F0 * (1 + a * Math.sin(FW * t));
const phase = (t: number, a: number): number => F0 * (t + (a / FW) * (1 - Math.cos(FW * t)));
// launch time of the stripe with phase c: phi(s) = c (phi is monotonic for a < 1; Newton from the uniform guess)
function launch(c: number, a: number): number {
  let s = c / F0;
  for (let i = 0; i < 5; i++) s -= (phase(s, a) - c) / freq(s, a);
  return s;
}

function beam(g: Ctx, from: Pt, to: Pt, n: number, w: number, gap: number, seed: number): void {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L;
  const ny = dx / L;
  for (let i = 0; i < n; i++) {
    const o = (i - (n - 1) / 2) * gap;
    gouge(
      g,
      [
        [from[0] + nx * o, from[1] + ny * o],
        [to[0] + nx * o, to[1] + ny * o],
      ],
      w,
      { taper: 0.35, rough: 0.8, seed: seed + i, step: 4 },
    );
  }
}

export function p4Scene(host: SceneHost): Scene {
  return makeScene(
    host,
    P4_TEXT,
    3401,
    (k) => {
      let soundOn = true;
      let tTog = k.reduced ? -1e6 : 0.15;
      let fromLevel = 0;
      const level = (t: number): number => {
        const m = easeIO(seg(t - tTog, 0, 0.8));
        return fromLevel + ((soundOn ? 1 : 0) - fromLevel) * m;
      };
      return {
        settle: Infinity,
        key: (t) => `${q10(t)}`,
        down(_x, _y, t) {
          fromLevel = level(t);
          soundOn = !soundOn;
          tTog = k.reduced ? -1e6 : t;
          return 1.4;
        },
        draw(g, t) {
          const tq = q10(t);
          const b = boil(t) * 1000;
          const lv = level(tq);
          const side = easeIO(seg(lv, 0.35, 1));
          const fa = k.reduced ? 0 : FA; // reduced motion: one frame at the centre frequency
          const rIn = freq(tq, fa) / F0; // drive frequency now, relative to F0 (input gauge)
          const rHit = freq(tq - DHIT, fa) / F0; // frequency of the stripes now at the beam

          // the block, its stripes and transducer are tilted by TH, so the beam can come in level
          g.save();
          g.translate(HIT[0], HIT[1]);
          g.rotate(-TH);
          g.translate(-HIT[0], -HIT[1]);
          // crystal block: thick cut outline, paper inside
          g.fillStyle = PAL.ink;
          g.beginPath();
          roughPoly(g, rect(BX0 - 12, BY0 - 12, BX1 + 12, BY1 + 6), b + 1, 1.4);
          roughPoly(g, [[BX0, BY0], [BX0, BY1], [BX1, BY1], [BX1, BY0]], b + 2, 1.3);
          g.fill("nonzero");

          // sound stripes: squeezed bands, carved as fat black cuts, moving up from the transducer
          if (lv > 0.01) {
            // stripe j leaves the transducer when phi = j and then climbs at VS: y = BY1 - VS (t - t_j);
            // y falls with t (away from the transducer), and j (seed, wobble) stays with its stripe
            const yAt = (c: number): number => BY1 - VS * (tq - launch(c, fa));
            const reach = BY1 - (BY1 - BY0 + 40) * lv; // burst front climbs from the bottom when switched on
            const jLo = Math.floor(phase(tq - (BY1 - BY0 + 4) / VS, fa)) - 1;
            const jHi = Math.ceil(phase(tq - 8 / VS, fa)) + 1;
            const sid = (j: number) => ((j % 97) + 97) % 97;
            g.beginPath();
            for (let j = jLo; j <= jHi; j++) {
              const y = yAt(j);
              if (y > BY1 - 8 || y < BY0 - 4 || y < reach) continue;
              const pts: Pt[] = [];
              for (let x = BX0 + 10; x <= BX1 - 10; x += 12) pts.push([x, y + 3 * Math.sin(x / 37 + j)]);
              gouge(g, pts, 17, { taper: 0.9, rough: 1.4, seed: b + 10 + sid(j) * 7 });
            }
            g.fill();
            // stretched bands between: thin cuts, half a wavelength behind each squeezed band
            g.beginPath();
            for (let j = jLo; j <= jHi; j++) {
              const y = yAt(j + 0.5);
              if (y > BY1 - 8 || y < BY0 - 4 || y < reach) continue;
              const xa = BX0 + 40 + hash(j, 3) * 60;
              gouge(g, [[xa, y], [BX1 - 40 - hash(j, 4) * 60, y]], 2.2, { taper: 1, rough: 0.5, seed: b + 500 + sid(j) });
            }
            g.fill();
          }

          // transducer bar under the crystal and its wire to the red source ring
          g.beginPath();
          roughPoly(g, rect(372, BY1 + 6, 628, BY1 + 34), b + 30, 1.2);
          gouge(g, [[500, BY1 + 30], [500, 612]], 6, { taper: 0, rough: 0.6, seed: b + 31 });
          g.fill();
          g.fillStyle = PAL.paperInk;
          g.beginPath();
          gouge(g, [[386, BY1 + 15], [600, BY1 + 15]], 2.6, { taper: 1, rough: 0.4, seed: b + 32 });
          g.fill();
          g.fillStyle = PAL.ink;
          g.beginPath();
          blob(g, 500, 652, 46, b + 33, 1.2);
          g.fill();
          g.fillStyle = PAL.paper;
          g.beginPath();
          blob(g, 500, 652, 35, b + 34, 1);
          g.fill();
          g.fillStyle = PAL.red;
          g.beginPath();
          const wp: Pt[] = [];
          for (let i = 0; i <= 36; i++) {
            const s = i / 36;
            wp.push([475 + 50 * s, 652 - 13 * lv * Math.sin(TAU * 2 * rIn * (s - 0.5) - TAU * phase(tq, fa)) * Math.sin(Math.PI * s) ** 0.5]);
          }
          gouge(g, wp, 6, { taper: 0.7, rough: 0.5, seed: b + 35, step: 2.5 });
          g.fill();

          g.restore();

          // light: in level from the left, straight on, and (with sound) turned aside by 2 TH f/F0 of the
          // stripes it crosses; slightly fainter off the centre frequency (Bragg mismatch)
          const inA: Pt = [120, HIT[1]];
          const outS: Pt = [1000, HIT[1]];
          const L = 560 * side;
          const ang = 2 * TH * rHit;
          const outD: Pt = [HIT[0] + L * Math.cos(ang), HIT[1] - L * Math.sin(ang)];
          const mis = FA > 0 ? (rHit - 1) / FA : 0;
          g.fillStyle = PAL.red;
          g.beginPath();
          beam(g, inA, HIT, 3, 8, 13, b + 60);
          beam(g, HIT, outS, 3, 8 - 3 * side, 13, b + 70);
          if (side > 0.02) beam(g, HIT, outD, 3, 5.5 * (1 - 0.18 * mis * mis), 11, b + 80);
          g.fill();
          // lamp at the left edge: black box, cut highlight, red mouth
          g.fillStyle = PAL.ink;
          g.beginPath();
          roughPoly(g, rect(30, HIT[1] - 38, 124, HIT[1] + 38), b + 95, 1.2);
          g.fill();
          g.fillStyle = PAL.paperInk;
          g.beginPath();
          gouge(g, [[52, HIT[1] - 24], [108, HIT[1] - 24]], 3, { taper: 1, rough: 0.4, seed: b + 96 });
          g.fill();
        },
      };
    },
    P4_RED_FROM,
  );
}


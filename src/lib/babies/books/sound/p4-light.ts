// p4: acousto-optics. A transducer under the crystal sends sound up; its squeezed bands are carved
// black stripes that move. A red light beam crosses at a (much exaggerated) Bragg angle: part goes
// straight on, part is turned aside, mirror-like off the moving stripes. Tap: sound off / on.

import type { Scene, SceneHost } from "../../types";
import { PAL, TAU, blob, boil, easeIO, gouge, hash, makeScene, q10, rect, roughPoly, seg, type Ctx, type Pt } from "./kit";

export const P4_TEXT = "Sound makes moving stripes. They turn some light aside. Now you know sound!";
export const P4_RED_FROM = 9; // "Now you know sound!" cut in red

const BX0 = 336;
const BX1 = 664;
const BY0 = 104;
const BY1 = 548;
const LAMS = 58; // sound wavelength (stripe period)
const VS = 34; // sound speed, units per second (upward)
const HIT: Pt = [500, 330]; // where the beam meets the stripes
const TH = 0.13; // Bragg angle as drawn, radians (much exaggerated); the block is tilted by it

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
            // stripe j sits at y = BY1 + j*LAMS - VS*t: y falls with t (away from the transducer),
            // and j (seed, wobble) stays with its stripe while it travels
            const travel = VS * tq;
            const reach = BY1 - (BY1 - BY0 + 40) * lv; // burst front climbs from the bottom when switched on
            const jLo = Math.ceil((BY0 - 4 - BY1 + travel) / LAMS) - 1;
            const jHi = Math.floor((BY1 - 8 - BY1 + travel) / LAMS) + 1;
            const sid = (j: number) => ((j % 97) + 97) % 97;
            g.beginPath();
            for (let j = jLo; j <= jHi; j++) {
              const y = BY1 + j * LAMS - travel;
              if (y > BY1 - 8 || y < BY0 - 4 || y < reach) continue;
              const pts: Pt[] = [];
              for (let x = BX0 + 10; x <= BX1 - 10; x += 12) pts.push([x, y + 3 * Math.sin(x / 37 + j)]);
              gouge(g, pts, 17, { taper: 0.9, rough: 1.4, seed: b + 10 + sid(j) * 7 });
            }
            g.fill();
            // stretched bands between: thin cuts, half a wavelength behind each squeezed band
            g.beginPath();
            for (let j = jLo; j <= jHi; j++) {
              const y = BY1 + j * LAMS + LAMS / 2 - travel;
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
            wp.push([475 + 50 * s, 652 - 13 * lv * Math.sin(TAU * 2 * s - TAU * (VS / LAMS) * tq) * Math.sin(Math.PI * s) ** 0.5]);
          }
          gouge(g, wp, 6, { taper: 0.7, rough: 0.5, seed: b + 35, step: 2.5 });
          g.fill();

          g.restore();

          // light: in level from the left, straight on, and (with sound) turned aside by 2 TH
          const inA: Pt = [120, HIT[1]];
          const outS: Pt = [1000, HIT[1]];
          const L = 560 * side;
          const outD: Pt = [HIT[0] + L * Math.cos(2 * TH), HIT[1] - L * Math.sin(2 * TH)];
          g.fillStyle = PAL.red;
          g.beginPath();
          beam(g, inA, HIT, 3, 8, 13, b + 60);
          beam(g, HIT, outS, 3, 8 - 3 * side, 13, b + 70);
          if (side > 0.02) beam(g, HIT, outD, 3, 5.5, 11, b + 80);
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


// p2: a surface ripple (Rayleigh-type SAW) runs along the top of the crystal; white cuts follow the
// displaced layers, their swing and width fall as exp(-z/delta), so the motion is confined to about one
// wavelength. Red dots: one near the surface rides a small loop, one deep down barely moves.
// Tap: a bigger ripple runs across.

import type { Scene, SceneHost } from "../../types";
import { PAL, TAU, blob, boil, gouge, hash, makeScene, q10, type Pt } from "./kit";

export const P2_TEXT = "A ripple runs along the surface. Deep down, it fades.";

const Y0 = 262; // rest surface
const LAM = 300; // wavelength, logical units
const K = TAU / LAM;
const DELTA = LAM / 2.6; // decay length: exp(-z/delta) = 0.07 at one wavelength
const V = 110; // phase velocity, units per second
const AZ = 32; // vertical swing at the surface
const AX = 18; // horizontal swing at the surface
const DEPTHS = [16, 34, 55, 79, 106, 137, 172, 213, 262, 322, 392];

export function p2Scene(host: SceneHost): Scene {
  return makeScene(host, P2_TEXT, 3201, (k) => {
    let t1 = -1e6;
    // dash breaks of each cut, in rest coordinates (the cuts belong to the material and only swing)
    const dashes: [number, number][][] = DEPTHS.map((z, j) => {
      const out: [number, number][] = [];
      let x = 20 + hash(j, 5) * 40;
      const fade = Math.exp(-z / DELTA);
      while (x < 980) {
        const len = 70 + hash(j, Math.floor(x)) * (fade > 0.3 ? 220 : 120);
        out.push([x, Math.min(980, x + len)]);
        x += len + 10 + hash(Math.floor(x), j + 9) * (fade > 0.3 ? 18 : 60);
      }
      return out;
    });
    const amp = (x: number, t: number): number => {
      const xc = -110 + 520 * (t - t1);
      return 1 + 1.25 * Math.exp(-(((x - xc) / 120) ** 2));
    };
    const disp = (x: number, z: number, t: number): Pt => {
      const ph = K * x - K * V * t;
      const e = Math.exp(-z / DELTA) * amp(x, t);
      return [x + AX * e * Math.sin(ph), Y0 + z - AZ * e * Math.cos(ph)];
    };
    return {
      settle: Infinity,
      key: (t) => `${q10(t)}`,
      down(_x, _y, t) {
        if (k.reduced) return 0;
        t1 = t;
        return 2.8;
      },
      draw(g, t) {
        const tq = q10(t);
        const b = boil(t) * 1000;

        // air: a few long thin cuts in the sky, thinning toward the surface
        g.fillStyle = PAL.ink;
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          const y = 70 + i * 26;
          const inset = 60 + i * 70 + hash(i, 3) * 40;
          gouge(g, [[46 + inset * 0.4, y], [954 - inset, y + 2]], 3.6 - i * 0.55, { taper: 1, rough: 0.7, seed: b + 10 + i });
        }
        g.fill();

        // crystal: black mass under the moving surface
        const surf: Pt[] = [];
        for (let x = 20; x <= 980; x += 6) surf.push(disp(x, 0, tq));
        g.fillStyle = PAL.ink;
        g.beginPath();
        surf.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.lineTo(980, 1000);
        g.lineTo(20, 1000);
        g.closePath();
        g.fill();

        // white layer cuts: width and swing fall with depth
        g.fillStyle = PAL.paperInk;
        g.beginPath();
        DEPTHS.forEach((z, j) => {
          const fade = Math.exp(-z / DELTA);
          const w = 1.3 + 7.2 * fade;
          for (const [xa, xb] of dashes[j]) {
            const pts: Pt[] = [];
            for (let x = xa; x <= xb; x += 6) pts.push(disp(x, z, tq));
            pts.push(disp(xb, z, tq));
            gouge(g, pts, w, { taper: 1, rough: 0.5 + 0.6 * fade, seed: b + 100 + j * 31 + Math.floor(xa) });
          }
        });
        g.fill();

        // red markers: a near-surface dot on its loop, a deep dot almost still
        const mark = (x: number, z: number, r: number, seed: number) => {
          const e = Math.exp(-z / DELTA);
          g.strokeStyle = PAL.red;
          g.lineWidth = 3;
          g.beginPath();
          g.ellipse(x, Y0 + z, AX * e * 1.0 + 0.1, AZ * e + 0.1, 0, 0, TAU);
          g.stroke();
          const [px, py] = disp(x, z, tq);
          g.fillStyle = PAL.red;
          g.beginPath();
          blob(g, px, py, r, seed);
          g.fill();
        };
        mark(600, 40, 13, b + 900);
        mark(600, 330, 13, b + 901);
      },
    };
  });
}

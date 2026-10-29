// Devices p2: two red light bits (squares with a long-wave tail) meet at a striped crystal and leave as one
// black bit with twice the energy (square of twice the area, wave tail of half the wavelength). Below, the
// reverse: one black bit splits into two red bits whose areas add up to it (energy kept). Tap a row to replay it.
import type { Scene, SceneHost } from "../../types";
import { PAL, el, polyD, zigzag, prog, easeOut, easeInOut, lerp, r1, makeStage, MISREG, D2R, type Pt } from "./kit";
import { letterLine } from "./letters";

// photon sizes: area is energy (64^2 * 2 ~ 90^2 ~ 70^2 + 57^2, within 1.2 %)
const S_RED = 64;
const S_BLK = 90;
const S_SIG = 70;
const S_IDL = 57;
// wave periods: inverse to energy (wavelength)
const P_BLK = 24;
const P_RED = 48;
const P_SIG = (P_BLK * S_BLK * S_BLK) / (S_SIG * S_SIG);
const P_IDL = (P_BLK * S_BLK * S_BLK) / (S_IDL * S_IDL);
const ROW_ROT = -7;
const END = 3;

interface Photon {
  g: SVGGElement;
}

/** A light bit: square plus a wave tail pointing back along -x; place with transform. */
function photon(parent: Element, color: string, s: number, period: number): Photon {
  const g = el("g", {}, parent);
  const inner = el("g", color === PAL.red ? { transform: MISREG } : {}, g);
  const len = Math.max(2.5 * period, 100);
  el("path", { d: polyD(zigzag(-s / 2 - len, -s / 2 + 2, 0, period, 13, 0.25), false), fill: "none", stroke: color, "stroke-width": 9, "stroke-linejoin": "miter" }, inner);
  el("rect", { x: -s / 2, y: -s / 2, width: s, height: s, fill: color }, inner);
  return { g };
}

const place = (ph: Photon, p: Pt, deg: number, vis = 1) => {
  ph.g.setAttribute("transform", `translate(${r1(p[0])} ${r1(p[1])}) rotate(${r1(deg)})`);
  ph.g.setAttribute("opacity", String(vis));
};

/** Striped crystal (flipped-arrow stripes: gray / cream) from x0 to x1 centred on y. */
function crystal(parent: Element, x0: number, x1: number, y: number, h: number) {
  const g = el("g", {}, parent);
  el("rect", { x: x0, y: y - h / 2, width: x1 - x0, height: h, fill: PAL.gray }, g);
  let d = "";
  for (let x = x0 + 16; x + 16 <= x1; x += 36) d += `M${x} ${y - h / 2}h14v${h}h-14Z`;
  el("path", { d, fill: PAL.cream }, g);
  return g;
}

const along = (a: Pt, b: Pt, u: number): Pt => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const ang = (a: Pt, b: Pt) => Math.atan2(b[1] - a[1], b[0] - a[0]) / D2R;

export function colorsScene(host: SceneHost): Scene {
  const st = makeStage(host, 62);
  const art = st.art;

  letterLine(art, "Two bits of light join", { x: 54, y: 118, cap: 48, rot: -5 });
  const rl = el("g", { transform: MISREG }, art);
  letterLine(rl, "into one new color.", { x: 120, y: 192, cap: 48, rot: -5, fill: PAL.red });
  letterLine(art, "Or one splits into two!", { x: 54, y: 590, cap: 48, rot: -5 });

  const guide = { fill: "none", stroke: PAL.black, "stroke-width": 5 };
  const dir = (deg: number, d: number, o: Pt): Pt => [o[0] + Math.cos(deg * D2R) * d, o[1] + Math.sin(deg * D2R) * d];

  // ---- row 1: joining ----
  const C1: Pt = [500, 345];
  const r1g = el("g", { transform: `rotate(${ROW_ROT} ${C1[0]} ${C1[1]})` }, art);
  const in1: Pt = [330, C1[1]];
  const out1: Pt = [620, C1[1]];
  const srcA = dir(202, 700, in1);
  const srcB = dir(158, 700, in1);
  const parkA = dir(202, 190, in1);
  const parkB = dir(158, 190, in1);
  el("path", { ...guide, d: polyD([dir(202, 300, in1), in1, dir(158, 300, in1)], false) }, r1g);
  el("path", { ...guide, d: polyD([out1, [900, C1[1]]], false) }, r1g);
  crystal(r1g, in1[0], out1[0], C1[1], 70);
  const pa = photon(r1g, PAL.red, S_RED, P_RED);
  const pb = photon(r1g, PAL.red, S_RED, P_RED);
  const pk = photon(r1g, PAL.black, S_BLK, P_BLK);
  const park1: Pt = [790, C1[1]];

  // ---- row 2: splitting ----
  const C2: Pt = [500, 815];
  const r2g = el("g", { transform: `rotate(${ROW_ROT} ${C2[0]} ${C2[1]})` }, art);
  const in2: Pt = [330, C2[1]];
  const out2: Pt = [620, C2[1]];
  const dstS = dir(-22, 700, out2);
  const dstI = dir(22, 700, out2);
  const park2: Pt = [200, C2[1]];
  const parkS = dir(-22, 215, out2);
  const parkI = dir(22, 215, out2);
  el("path", { ...guide, d: polyD([[60, C2[1]], in2], false) }, r2g);
  el("path", { ...guide, d: polyD([dir(-22, 320, out2), out2, dir(22, 320, out2)], false) }, r2g);
  crystal(r2g, in2[0], out2[0], C2[1], 70);
  const qp = photon(r2g, PAL.black, S_BLK, P_BLK);
  const qs = photon(r2g, PAL.red, S_SIG, P_SIG);
  const qi = photon(r2g, PAL.red, S_IDL, P_IDL);

  // ---- replay on tap, per row ----
  let lastT = 0;
  const start = [0, 1.25];
  const mk = (row: number, y: number, h: number) => {
    const r = el("rect", { x: 0, y, width: 1000, height: h, fill: "transparent", "pointer-events": "all", style: "cursor:pointer" }, st.hit);
    const fn = () => {
      if (host.reduced) return;
      start[row] = lastT;
      host.wake(2.2);
    };
    r.addEventListener("pointerdown", fn);
    return [r, fn] as const;
  };
  const hits = [mk(0, 210, 330), mk(1, 600, 400)];

  const draw = (t: number) => {
    // row 1: the two red bits fly in along their diagonals, then the black bit runs through the crystal
    const a = host.reduced ? 1 : t - start[0];
    const u = easeOut(prog(host, a, 0, 0.8));
    place(pa, along(srcA, parkA, u), ang(srcA, in1), u > 0 ? 1 : 0);
    place(pb, along(srcB, parkB, u), ang(srcB, in1), u > 0 ? 1 : 0);
    const k = easeInOut(prog(host, a, 0.75, 0.6));
    place(pk, along(in1, park1, k), 0, a >= 0.75 || host.reduced ? 1 : 0);
    // row 2: the black bit flies in, then two red bits leave on the diverging paths
    const b = host.reduced ? 2 : t - start[1];
    const v = easeOut(prog(host, b, 0, 0.6));
    place(qp, along([-160, C2[1]], park2, v), 0, b >= 0 ? 1 : 0);
    const w = easeInOut(prog(host, b, 0.55, 0.7));
    const vis = b >= 0.55 || host.reduced ? 1 : 0;
    place(qs, along(out2, parkS, w), ang(out2, dstS), vis);
    place(qi, along(out2, parkI, w), ang(out2, dstI), vis);
  };

  return {
    settle: END,
    frame(t: number) {
      lastT = t;
      draw(t);
    },
    destroy() {
      for (const [r, fn] of hits) r.removeEventListener("pointerdown", fn);
      st.destroy();
    },
  };
}

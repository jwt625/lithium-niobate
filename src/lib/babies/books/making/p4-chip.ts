// Making p4: on the thin film, three manual panels. (1) Accent argon balls knock bits off around a masked stripe:
// a ridge is left. (2) Gold bars come down beside the ridge. (3) A gold comb and a bar on the film; a zap flips
// the arrows in the stripes under the teeth. Tap: zap again (the stripes flip back and forth).
import type { Scene, SceneHost } from "../../types";
import { ACC, DARK, GOLD, INK, Iso, MID, TOP, bigArrow, box, easeInOut, easeOut, el, layer, lerp, line, makeStage, pathArrow, poly, seg, stepDisc, type Pt } from "./kit";

const END = 2.6;
const GLASS = "#CFE3EA";
const GOLD_S = "#F0D58F";
const LX = 210; // block length (world x)
const WY = 190; // block width (world y)
const Z_SI = 34;
const Z_OX = 18;
const Z_SLAB = 16; // film left after etching
const Z_RIB = 26; // etch depth = ridge height
const RW = 22; // ridge half width

/** Film block: silicon, glass, film slab, ridge (if e > 0, the film outside the ridge is etched down by e). */
function chipBlock(g: Element, io: Iso, e: number, mask: number, gold: number, goldBack = true): void {
  const y0 = -WY / 2;
  box(g, io, [0, y0, 0], [LX, WY, Z_SI], { top: DARK, x: MID, y: MID });
  box(g, io, [0, y0, Z_SI], [LX, WY, Z_OX], { top: GLASS, x: GLASS, y: GLASS });
  const zf = Z_SI + Z_OX;
  const zTop = zf + Z_SLAB + Z_RIB;
  box(g, io, [0, y0, zf], [LX, WY, Z_SLAB + Z_RIB - e]);
  const bar = (yc: number) => box(g, io, [0, yc - 26, zf + Z_SLAB + gold], [LX, 52, 14], { top: GOLD, x: GOLD_S, y: GOLD_S });
  const backAbove = zf + Z_SLAB + gold > zTop;
  if (gold >= 0 && goldBack && !backAbove) bar(-62);
  if (e > 0) box(g, io, [0, -RW, zf + Z_SLAB + Z_RIB - e], [LX, 2 * RW, e]);
  if (gold >= 0 && goldBack && backAbove) bar(-62);
  if (mask > 0) box(g, io, [0, -RW, zTop], [LX, 2 * RW, 7], { top: INK, x: DARK, y: DARK }, { opacity: mask.toFixed(2) });
  if (gold >= 0) bar(62);
}

export function chipScene(host: SceneHost, text: string): Scene {
  const st = makeStage(host, text, ["Carve a ridge. Add gold.", "Zap to flip stripes.", "Now you know how it is made!"]);
  const io1 = new Iso(170, 265, 0.92);
  const io2 = new Iso(640, 265, 0.92);
  const io3 = new Iso(330, 545, 0.92);
  const dyn = layer(st.art);
  const rnd = host.rng(41);
  const ar: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1;
    ar.push([25 + (i >> 1) * 48 + rnd() * 12, side * (52 + rnd() * 26), (i * 0.05) % 0.3]);
  }
  const chips: [number, number, number, number][] = [];
  for (let i = 0; i < 10; i++) chips.push([20 + rnd() * 170, (i % 2 ? 1 : -1) * (40 + rnd() * 45), (rnd() - 0.5) * 2, 0.4 + rnd()]);

  // zaps: each tap toggles the striped domains
  const zaps: number[] = [1.65];
  let lastT = 0;
  const onDown = () => {
    const tz = Math.max(lastT, zaps[zaps.length - 1] + 0.7);
    zaps.push(host.reduced ? 0 : tz);
    host.wake(tz - lastT + 0.9);
  };
  st.svg.addEventListener("pointerdown", onDown);

  const draw = (tau: number) => {
    const g = dyn.clear();
    // ---- panel 1: etch ----
    const e = Z_RIB * easeInOut(seg(tau, 0.15, 0.85));
    const mask = 1 - seg(tau, 0.85, 1.05);
    chipBlock(g, io1, e, mask, -1);
    const zTop = Z_SI + Z_OX + Z_SLAB + Z_RIB;
    for (const [x, y, d] of ar) {
      const f = tau < END ? (tau - d) / 0.35 : 9;
      const ph = f > 0 ? Math.min(f % 1, 1) : 0;
      const z = f > 2.6 ? zTop + 70 : lerp(zTop + 190, zTop + 10 - e, ph);
      const [bx, by] = io1.p(x, y, z);
      line(g, [[bx, by - 48], [bx, by - 16]], { stroke: ACC, "stroke-width": 4 });
      el("circle", { cx: bx.toFixed(1), cy: by.toFixed(1), r: 11, fill: ACC, stroke: INK, "stroke-width": 2.5 }, g);
    }
    // knocked-off bits flying away
    const kb = seg(tau, 0.25, 1.1);
    if (kb > 0) {
      for (const [x, y, dir, sp] of chips) {
        const f = tau < END ? ((kb * 2.5 * sp) % 1) : 0.7 * sp;
        const [px, py] = io1.p(x + dir * 60 * f, y + Math.sign(y) * 40 * f, zTop - 6 + 90 * f);
        poly(g, [[px - 6, py - 4], [px + 5, py - 6], [px + 7, py + 4], [px - 4, py + 6]], TOP, { "stroke-width": 2 });
      }
    }
    stepDisc(g, 60, 110, 1);

    // ---- arrow 1 -> 2 ----
    const a12 = easeOut(seg(tau, 0.75, 1.0));
    if (a12 > 0) bigArrow(g, [455, 290], [lerp(455, 555, a12), 290], 28, "#fff");

    // ---- panel 2: gold ----
    const dropT = easeOut(seg(tau, 0.95, 1.5));
    const gz = lerp(150, 0, dropT);
    chipBlock(g, io2, Z_RIB, 0, tau >= 0.9 ? gz : -1);
    if (tau >= 0.9 && dropT < 1) {
      for (const yc of [-62, 62]) {
        const top = io2.p(LX + 30, yc, Z_SI + Z_OX + Z_SLAB + gz + 120);
        pathArrow(g, [top, [top[0], top[1] + 60]], INK, 6, 22);
      }
    }
    stepDisc(g, 935, 110, 2);

    // ---- arrow 2 -> 3 ----
    const a23 = easeOut(seg(tau, 1.35, 1.6));
    if (a23 > 0) bigArrow(g, [660, 395], [lerp(660, 600, a23), lerp(395, 455, a23)], 28, "#fff");

    // ---- panel 3: comb + zap ----
    const L3 = 330;
    const W3 = 220;
    box(g, io3, [0, -W3 / 2, 0], [L3, W3, 22], { top: GLASS, x: GLASS, y: GLASS });
    box(g, io3, [0, -W3 / 2, 22], [L3, W3, 16], {});
    const zs = 38;
    // straight bar (back) and comb (front) with teeth toward the middle
    box(g, io3, [0, -W3 / 2 + 8, zs], [L3, 34, 10], { top: GOLD, x: GOLD_S, y: GOLD_S });
    const pitch = L3 / 6;
    // arrows in stripes: even stripes sit under a tooth and flip on each zap
    let n = 0;
    let f = 0;
    for (const z0 of zaps) {
      if (tau < z0) break;
      const k = easeInOut(seg(tau, z0 + 0.1, z0 + 0.5));
      if (k >= 1) n++;
      else {
        f = k;
        break;
      }
    }
    for (let s = 0; s < 6; s++) {
      const xc = (s + 0.5) * pitch;
      const flips = s % 2 === 0;
      let dir = 1;
      if (flips) dir = (n % 2 ? -1 : 1) * Math.cos(Math.PI * f);
      if (Math.abs(dir) < 0.12) continue;
      const y0 = -26 - 36 * dir;
      const y1 = -26 + 36 * dir;
      pathArrow(g, [io3.p(xc, y0, zs), io3.p(xc, y1, zs)], INK, 7, 26);
    }
    // stripe boundaries
    for (let s = 1; s < 6; s++) {
      const x = s * pitch;
      line(g, [io3.p(x, -W3 / 2 + 44, zs), io3.p(x, W3 / 2 - 44, zs)], { "stroke-width": 2, "stroke-dasharray": "6 7", stroke: DARK });
    }
    box(g, io3, [0, W3 / 2 - 42, zs], [L3, 34, 10], { top: GOLD, x: GOLD_S, y: GOLD_S });
    for (let s = 0; s < 6; s += 2) box(g, io3, [(s + 0.5) * pitch - 14, 16, zs], [28, W3 / 2 - 42 - 16, 10], { top: GOLD, x: GOLD_S, y: GOLD_S });
    // zap bolt (accent), flashing at each zap, small when idle
    let flash = 0;
    for (const z0 of zaps) flash = Math.max(flash, Math.sin(Math.PI * seg(tau, z0, z0 + 0.45)));
    const [zx, zy] = [800, 625];
    const sc = 1 + 0.45 * flash;
    const bolt: Pt[] = [[-10, -46], [18, -46], [4, -10], [22, -10], [-14, 46], [-2, 4], [-20, 4]];
    poly(g, bolt.map(([x, y]) => [zx + x * sc * 1.3, zy + y * sc * 1.3] as Pt), ACC, { "stroke-width": 3 });
    stepDisc(g, 200, 600, 3);
  };

  return {
    settle: END,
    frame(t: number) {
      lastT = t;
      const tau = host.reduced ? 1e3 : t;
      draw(tau);
    },
    destroy() {
      st.svg.removeEventListener("pointerdown", onDown);
      st.destroy();
    },
  };
}

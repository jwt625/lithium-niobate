// Light p3 (second-harmonic generation, quasi-phase matching): an infrared lamp (dark red glass, dashed beam: false
// colour) sends a train of IR bit pairs along its beam through a striped crystal bar. Along the bar each pair dims while
// a green bit above it brightens (shown IR fraction = 1 - green fraction, per stripe); leftover IR runs on to the edge,
// the green bits run along an emerald lane to the green roundel. The IR beam glow dims downstream with the pairs.
// With flipped stripes (arrows up, down, ...) green grows and IR fades steadily; tap to remove the stripes and the
// two trade back and forth stripe by stripe (green rises and fades, IR dims and recovers). Tap again: stripes back.
import type { Scene, SceneHost } from "../../types";
import { G, GREEN, IRGLOW, arrowPts, blob, circlePts, clamp01, easeIO, frameAndField, glowFill, lerp, makeWindow, movePts, pane, polyPath, rectPts, seg, strokeLead, type Ctx, type Pane } from "./kit";
import { banner } from "./letters";

export const TEXT3 = "Two infrared bits join into one green bit. Stripes keep the green growing.";
const LINES = ["Two infrared bits join", "into one green bit.", "Stripes keep the green growing."];

const BX0 = 250;
const NS = 8;
const SW = 70; // stripe width = one coherence length in the drawing
const BX1 = BX0 + NS * SW;
const BY0 = 214;
const BY1 = 528;
const YIR = 488;
const YGR = 420;
const LX = 96;
const OX = 904;
const FLIP = 0.4;
const T_BITS = 0.2;
const T_END = 2.45; // last pair leaves the right edge
const NP = 3; // IR pairs in the train
const PP = 170; // pair pitch
const PD = 24; // half spacing of the two bits in a pair
const XR = 950; // right edge of the IR beam
const V = (XR + PD + (NP - 1) * PP - LX) / (T_END - T_BITS); // train speed, units/s
const CONV = 0.7; // displayed conversion at full green (leftover IR stays visible)

/** Second-harmonic amplitude after distance x (units of SW): |integral of s(z) exp(i pi z) dz|, s = +-1 per stripe. */
function amp(x: number, striped: boolean): number {
  let re = 0;
  let im = 0;
  const dz = 0.02;
  for (let z = 0; z < x; z += dz) {
    const s = striped && Math.floor(z) % 2 === 1 ? -1 : 1;
    re += s * Math.cos(Math.PI * (z + dz / 2)) * dz;
    im += s * Math.sin(Math.PI * (z + dz / 2)) * dz;
  }
  return Math.hypot(re, im);
}

export function greenScene(host: SceneHost): Scene {
  return makeWindow(host, 23, (w) => {
    frameAndField(w, 654);
    // crystal bar: one pane per stripe
    for (let i = 0; i < NS; i++) w.add(pane(rectPts(BX0 + i * SW, BY0, BX0 + (i + 1) * SW, BY1), i % 2 ? "#9A88C8" : "#8C79BD", 0.55));
    // IR lamp and dashed IR beam (dark red dashes, smoky gaps)
    w.add(pane(circlePts(LX, YIR, 46), G.ir, 0.5));
    w.add(pane(circlePts(LX, YIR, 26), "#8A2230", 0.6));
    const irPanes: Pane[] = [];
    for (let x = LX + 46, j = 0; x < 950; x += 34, j++) irPanes.push(pane(rectPts(x, YIR - 12, Math.min(950, x + 34), YIR + 12), j % 2 ? "#4A4650" : G.ir, 0.45, 7));
    w.addAll(irPanes);
    // green lane: one pane per stripe, then out to the green roundel
    const grPanes: Pane[] = [];
    for (let i = 0; i < NS; i++) grPanes.push(pane(rectPts(BX0 + i * SW, YGR - 15, BX0 + (i + 1) * SW, YGR + 15), "#2D5A3E", 0.4, 8));
    const grOut = pane(rectPts(BX1, YGR - 15, OX - 40, YGR + 15), "#2D5A3E", 0.4, 8);
    w.addAll([...grPanes, grOut]);
    w.add(pane(circlePts(OX, YGR, 44), "#2F5E40", 0.5));
    w.add(pane(circlePts(OX, YGR, 22), "#3A6A4A", 0.5));
    w.leadLine([[BX0, BY0], [BX1, BY0], [BX1, BY1], [BX0, BY1], [BX0, BY0]], 11);
    banner(w, LINES);

    // amplitude tables per stripe (5 samples each) for both states
    const S = 6;
    const tab = (striped: boolean) => {
      const a: number[] = [];
      for (let k = 0; k <= NS * S; k++) a.push(amp(k / S, striped));
      return a;
    };
    const aOn = tab(true);
    const aOff = tab(false);
    const aMax = aOn[aOn.length - 1];
    const offMax = Math.max(...aOff);
    // displayed brightness: not to scale (unstriped peak boosted, striped growth compressed)
    const dispOn = aOn.map((a) => (a / aMax) ** 1.3);
    const dispOff = aOff.map((a) => 0.42 * (a / offMax) ** 2);
    /** Displayed green fraction at x on the active table (0 before the bar, held after it); IR fraction = 1 - this. */
    const frac = (disp: number[], x: number) => {
      if (x <= BX0) return 0;
      const u = Math.min(NS * S, ((x - BX0) / SW) * S);
      const k = Math.min(NS * S - 1, Math.floor(u));
      return CONV * lerp(disp[k], disp[k + 1], u - k);
    };

    let striped = true;
    let tFlip = -10; // time of last toggle
    let t0 = 0; // start of the current run (bits leave the lamp)
    const roundIR = polyPath(circlePts(LX, YIR, 26));
    const roundG = polyPath(circlePts(OX, YGR, 44));
    const arrow = arrowPts(112);

    /** Bits of the current run at r: IR pairs on the beam, a green bit above each pair; a = shown fraction. */
    const train = (r: number) => {
      const out: { x: number; ir: boolean; a: number }[] = [];
      if (r < T_BITS) return out;
      const disp = striped ? dispOn : dispOff;
      const c0 = LX + V * (r - T_BITS);
      for (let p = 0; p < NP; p++) {
        const c = c0 - p * PP;
        for (const x of [c - PD, c + PD])
          if (x >= LX && x <= XR) out.push({ x, ir: true, a: (1 - frac(disp, x)) * seg(x, LX + 10, LX + 60) * (1 - seg(x, XR - 45, XR)) });
        if (c > BX0 && c < OX) out.push({ x: c, ir: false, a: frac(disp, c) * (1 - seg(c, OX - 50, OX)) });
      }
      return out;
    };

    const bit = (g: Ctx, x: number, y: number, r: number, fill: string, dashed: boolean, a: number) => {
      if (a <= 0) return;
      g.save();
      g.globalAlpha = a;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      gr.addColorStop(0, "rgba(255,255,255,0.55)");
      gr.addColorStop(0.5, fill);
      gr.addColorStop(1, fill);
      g.fillStyle = gr;
      g.fill();
      strokeLead(g, (() => {
        const p = new Path2D();
        p.arc(x, y, r, 0, Math.PI * 2);
        return p;
      })(), 6);
      if (dashed) {
        g.setLineDash([5, 5]);
        g.strokeStyle = "rgba(255,190,190,0.9)";
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(x, y, r * 0.55, 0, Math.PI * 2);
        g.stroke();
      }
      g.restore();
    };

    return {
      settle: T_END + 0.5,
      glow(g, t) {
        const r = host.reduced ? 99 : t - t0;
        const lamp = clamp01((t - Math.min(t0, 0)) / 0.3);
        const disp = striped ? dispOn : dispOff;
        const c0 = LX + V * Math.max(0, r - T_BITS); // lead pair centre
        glowFill(g, roundIR, IRGLOW, 0.5 * lamp);
        blob(g, LX, YIR, 80, 0.12 * lamp);
        // IR beam: full before the bar; behind the lead pair it carries the IR fraction left at each pane
        for (const p of irPanes) {
          const px = (p.box[0] + p.box[2]) / 2;
          glowFill(g, p.path, IRGLOW, 0.3 * lamp * (1 - (px <= c0 ? frac(disp, px) : 0)));
        }
        // halo under each bit, same shown fraction
        for (const b of train(r)) {
          const y = b.ir ? YIR : YGR;
          const k = b.ir ? 0.8 * b.a : 0.7 * b.a;
          if (k <= 0.003) continue;
          const hg = g.createRadialGradient(b.x, y, 8, b.x, y, 44);
          hg.addColorStop(0, `rgba(${b.ir ? IRGLOW : GREEN},${k})`);
          hg.addColorStop(1, `rgba(${b.ir ? IRGLOW : GREEN},0)`);
          g.fillStyle = hg;
          g.fillRect(b.x - 44, y - 44, 88, 88);
        }
        // green lane up to the lead green bit's position
        const fx = Math.min(OX, Math.max(BX0, c0));
        for (let i = 0; i < NS; i++) {
          const xa = BX0 + i * SW;
          if (fx <= xa) break;
          const gr = g.createLinearGradient(xa, 0, xa + SW, 0);
          for (let k = 0; k <= S; k++) {
            const x = xa + (k / S) * SW;
            const v = x <= fx ? disp[i * S + k] : 0;
            gr.addColorStop(k / S, `rgba(${GREEN},${0.95 * v})`);
          }
          g.fillStyle = gr;
          g.fill(grPanes[i].path);
          blob(g, xa + SW * 0.85, YGR, 36, 0.2 * disp[i * S + S] * (fx > xa + SW ? 1 : 0));
        }
        const end = disp[NS * S];
        const outA = clamp01((fx - BX1) / 60) * end;
        glowFill(g, grOut.path, GREEN, 0.85 * outA);
        const reach = seg(c0, OX - 50, OX) * end;
        // output lamp: same green as the growing line, fill plus a green halo (no white sprite)
        glowFill(g, roundG, GREEN, 0.6 * reach);
        if (reach > 0.003) {
          const hg = g.createRadialGradient(OX, YGR, 20, OX, YGR, 120);
          hg.addColorStop(0, `rgba(${GREEN},${0.45 * reach})`);
          hg.addColorStop(1, `rgba(${GREEN},0)`);
          g.fillStyle = hg;
          g.fillRect(OX - 120, YGR - 120, 240, 240);
        }
      },
      over(g, t) {
        // arrows on the stripes (flip animation on toggle)
        const p = host.reduced ? 1 : easeIO((t - tFlip) / FLIP);
        for (let i = 0; i < NS; i++) {
          const want = striped && i % 2 === 1 ? -1 : 1;
          const was = !striped && i % 2 === 1 ? -1 : 1;
          const sy = i % 2 === 1 ? lerp(was, want, p) : 1;
          const pts = movePts(arrow, BX0 + i * SW + SW / 2, 300, sy);
          if (Math.abs(sy) < 0.06) continue;
          const path = polyPath(pts);
          g.fillStyle = sy > 0 ? G.amber : "#D8951A";
          g.fill(path);
          const hl = g.createLinearGradient(0, 300 - 56, 0, 300 + 56);
          hl.addColorStop(0, "rgba(255,240,190,0.45)");
          hl.addColorStop(1, "rgba(120,60,0,0.25)");
          g.fillStyle = hl;
          g.fill(path);
          strokeLead(g, path, 7);
        }
        // bits: a train of IR pairs on the beam; above each pair a green bit that brightens as the pair dims
        for (const b of train(host.reduced ? 99 : t - t0)) {
          if (b.ir) bit(g, b.x, YIR, 19, G.ir, true, b.a);
          else bit(g, b.x, YGR, 22, G.emerald, false, b.a);
        }
      },
      tap(_x, _y, t) {
        striped = !striped;
        tFlip = t;
        t0 = host.reduced ? -99 : t + FLIP - T_BITS;
        return FLIP + T_END + 0.4;
      },
    };
  });
}

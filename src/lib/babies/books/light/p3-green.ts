// Light p3 (second-harmonic generation, quasi-phase matching): an infrared lamp (dark red glass, dashed beam: false
// colour) sends two bits into a striped crystal bar; they join into one green bit, which runs along an emerald lane.
// With flipped stripes (arrows up, down, ...) the green lane brightens steadily; tap to remove the stripes and the
// green rises and fades back stripe by stripe. Tap again: stripes back.
import type { Scene, SceneHost } from "../../types";
import { G, GREEN, IRGLOW, arrowPts, blob, circlePts, clamp01, ease, easeIO, frameAndField, glowFill, lerp, makeWindow, movePts, pane, polyPath, rectPts, seg, strokeLead, type Ctx, type Pane } from "./kit";
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
const T_MERGE = 1.05;
const T_END = 2.45;

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

    let striped = true;
    let tFlip = -10; // time of last toggle
    let t0 = 0; // start of the current run (bits leave the lamp)
    const roundIR = polyPath(circlePts(LX, YIR, 26));
    const roundG = polyPath(circlePts(OX, YGR, 44));
    const arrow = arrowPts(112);

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
        glowFill(g, roundIR, IRGLOW, 0.5 * lamp);
        blob(g, LX, YIR, 80, 0.12 * lamp);
        for (const p of irPanes) glowFill(g, p.path, IRGLOW, 0.3 * lamp);
        // green lane up to the green bit's position
        const fx = r < T_MERGE ? BX0 : lerp(BX0, OX, ease((r - T_MERGE) / (T_END - T_MERGE)) ** 0.85);
        const disp = striped ? dispOn : dispOff;
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
        const reach = seg(r, T_END - 0.1, T_END + 0.2) * end;
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
        // bits
        const r = host.reduced ? 99 : t - t0;
        for (let j = 0; j < 2; j++) {
          // two bits side by side along the beam, converging where the green lane starts
          const k = easeIO((r - T_BITS) / (T_MERGE - T_BITS));
          if (r < T_BITS || k >= 1) continue;
          const x = lerp(LX + 20, BX0 + 26, k);
          const spread = (j ? 1 : -1) * 30 * (1 - seg(k, 0.55, 1));
          const y = lerp(YIR, YGR, seg(k, 0.55, 1)) + spread;
          bit(g, x, y, 21, G.ir, true, seg(r, T_BITS, T_BITS + 0.12));
        }
        if (r >= T_MERGE - 0.05 && r < T_END) {
          const x = lerp(BX0 + 26, OX, ease((r - T_MERGE) / (T_END - T_MERGE)) ** 0.85);
          const pop = 0.7 + 0.3 * ease((r - T_MERGE + 0.05) / 0.25);
          bit(g, x, YGR, 23 * pop, G.emerald, false, seg(r, T_MERGE - 0.05, T_MERGE + 0.08));
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

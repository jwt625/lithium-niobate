// p2 MgO doping: one beam crosses two crystals. The plain one keeps a scraped mark; the one sprinkled with
// magnesium lets it leak back to black (charges slip back). Tap: sprinkle magnesium into the plain one too (its
// mark heals); tap again: take it out (the mark is written again).
import type { Scene, SceneHost } from "../../types";
import { bakeAll, bakeText, drawAll, lampParts } from "./common";
import { arrowScratches, blockScratches, circle, drawBatch, drawScratch, ease, easeIO, hatchLines, lerp, makeScene, rectPts, scratch, seg, type Block, type Pt, type Scratch } from "./kit";
import { labelScratches } from "./letters";

export const TEXT2 = "Add a little magnesium. Now the mark leaks away.";

const A: Block = { x0: 226, y0: 262, x1: 492, y1: 610, d: 36 };
const B: Block = { x0: 600, y0: 262, x1: 866, y1: 610, d: 36 };
const BEAM_Y = 418, LAMP_X = 172, HALF = 40, ROW = 7;
const JAR_Y = 104;
const JAR_X = { A: 372, B: 746 };

interface Dot { x: number; y: number; s: Scratch[] }

export function magnesiumScene(host: SceneHost): Scene {
  return makeScene(host, 4201, (k) => {
    const rng = host.rng(4202);
    const lamp = lampParts(rng);
    const beam: Scratch[] = [-15, -7.5, 0, 7.5, 15].map((dy) => scratch([[LAMP_X + 4, BEAM_Y + dy], [992, BEAM_Y + dy]], dy ? 3.4 : 4.6, rng, 0.5));
    const rowsY: number[] = [];
    for (let y = BEAM_Y - HALF; y <= BEAM_Y + HALF; y += ROW) rowsY.push(y);
    const markRows = (blk: Block, x1: number): Scratch[] =>
      rowsY.map((y, i) => {
        const pts: Pt[] = [];
        const ph = rng() * 6.3;
        for (let x = blk.x0 + 12; x <= x1; x += 10) pts.push([x, y + 2.6 * Math.sin(x * 0.07 + ph + i * 0.9)]);
        return scratch(pts, 3.2, rng, 0.6);
      });
    const markA = markRows(A, A.x1 - 58), markB = markRows(B, B.x1 - 58);
    // magnesium grains: small scraped rings with a dot, placed off the beam band
    const grains = (blk: Block): Dot[] => {
      const out: Dot[] = [];
      let guard = 0;
      while (out.length < 14 && guard++ < 400) {
        const x = lerp(blk.x0 + 26, blk.x1 - 70, rng()), y = lerp(blk.y0 + 26, blk.y1 - 26, rng());
        if (Math.abs(y - BEAM_Y) < HALF + 18) continue;
        if (out.some((d) => Math.hypot(d.x - x, d.y - y) < 46)) continue;
        out.push({ x, y, s: [scratch(circle(0, 0, 9), 5, rng, 0.4), scratch([[-1.5, 0], [1.5, 0]], 6, rng, 0.2)] });
      }
      return out;
    };
    const mgA = grains(A), mgB = grains(B);
    // the jar: cap with holes at the bottom, "Mg" on the body
    const jarBody: Scratch[] = [scratch(rectPts(-52, -66, 52, 34), 7, rng), ...hatchLines([[-52, -66], [52, -66], [52, -48], [-52, -48]], 0, 7, 3, rng, 0.3)];
    const jarCap: Scratch[] = [scratch([[-44, 34], [-30, 58], [30, 58], [44, 34]], 7, rng)];
    for (const hx of [-16, 0, 16]) jarCap.push(scratch([[hx - 1, 46], [hx + 1, 46]], 6, rng, 0.2));
    const jarLabel = labelScratches("Mg", 0, -10, 34, rng, 0.24);
    // slipping-back charges: tiny dots that run from the band edges back to the beam axis
    const slips: { x: number; side: number; ph: number }[] = [];
    for (let i = 0; i < 8; i++) slips.push({ x: 26 + rng() * 150, side: i % 2 ? 1 : -1, ph: rng() });
    const slipDot = scratch([[-2, 0], [2, 0]], 6, rng, 0.2);

    // A's magnesium toggles on tap: event times, odd count = magnesium in
    const ev: number[] = [];
    const aIn = (): boolean => ev.length % 2 === 1;
    const tEv = (): number => ev[ev.length - 1] ?? -1e9;
    const R = host.reduced;

    const fall = (d: Dot, i: number, t0: number, t: number, jx: number): Pt | null => {
      const ts = t0 + 0.3 + i * 0.045, u = seg(t, ts, ts + 0.42);
      if (R) return [d.x, d.y];
      if (t < ts) return null;
      const x0 = jx + ((i % 3) - 1) * 16, y0 = JAR_Y + 58;
      return [lerp(x0, d.x, ease(u)), lerp(y0, d.y, u * u)];
    };
    const drawGrains = (g: CanvasRenderingContext2D, ds: Dot[], t0: number, t: number, jx: number, alpha = 1): void => {
      const ink = k.ink("yellow");
      g.globalAlpha = alpha;
      ds.forEach((d, i) => {
        const p = fall(d, i, t0, t, jx);
        if (!p) return;
        g.save();
        g.translate(p[0], p[1]);
        drawAll(g, d.s, ink, 1, false);
        g.restore();
      });
      g.globalAlpha = 1;
    };
    const drawMark = (g: CanvasRenderingContext2D, rows: Scratch[], e: number): void => {
      if (e < 0.02) return;
      const ink = k.ink("sun");
      g.globalAlpha = e;
      drawBatch(g, rows, ink);
      g.globalAlpha = 1;
    };
    const drawSlips = (g: CanvasRenderingContext2D, blk: Block, t: number, t0: number, t1: number): void => {
      if (R || t < t0 || t > t1) return;
      const env = Math.sin(Math.PI * seg(t, t0, t1));
      const ink = k.ink("sun");
      for (const s of slips) {
        const u = ((t - t0) * 1.6 + s.ph) % 1;
        const y = BEAM_Y + s.side * (HALF + 14) * (1 - u);
        g.globalAlpha = env * (1 - u);
        g.save();
        g.translate(blk.x0 + s.x, y);
        drawScratch(g, slipDot, ink, 1, false);
        g.restore();
      }
      g.globalAlpha = 1;
    };

    return {
      settle: 2.7,
      bake(g, r) {
        bakeAll(g, blockScratches(A, r), k.ink("purple"), r);
        bakeAll(g, blockScratches(B, r), k.ink("purple"), r);
        bakeAll(g, arrowScratches(A.x1 - 32, A.y1 - 30, A.y0 + 28, r, 10), k.ink("green"), r);
        bakeAll(g, arrowScratches(B.x1 - 32, B.y1 - 30, B.y0 + 28, r, 10), k.ink("green"), r);
        bakeText(g, k.ink, TEXT2, r);
      },
      draw(g, t) {
        // beam on from 0.85 s
        const grow = R ? 1 : seg(t, 0.85, 1.15);
        // crystal B: magnesium from the start; its mark flickers up a little and leaks away
        drawGrains(g, mgB, 0, t, JAR_X.B);
        const eB = R ? 0.08 : 0.08 + 0.3 * seg(t, 1.0, 1.3) * (1 - seg(t, 1.3, 2.2)) - 0.08 * (1 - seg(t, 1.0, 1.3));
        drawMark(g, markB, eB);
        drawSlips(g, B, t, 1.0, 2.4);
        // crystal A: written from 1.0 s; heals when magnesium goes in, is written again when it comes out
        const te = tEv();
        const written = R ? 1 : seg(t, 1.0, 2.0);
        let eA = written;
        if (aIn()) {
          eA = Math.max(0.08, written * (1 - (R ? 1 : easeIO(seg(t, te + 0.8, te + 1.8)))));
          drawGrains(g, mgA, te, t, JAR_X.A);
          drawSlips(g, A, t, te + 0.8, te + 2.0);
        } else if (ev.length) {
          const out = R ? 1 : seg(t, te, te + 0.4);
          drawGrains(g, mgA, -1e9, t, JAR_X.A, 1 - out);
          eA = Math.min(written, 0.08 + 0.92 * (R ? 1 : seg(t, te + 0.4, te + 1.4)));
        }
        drawMark(g, markA, eA);
        // beam over the marks
        drawAll(g, beam, k.ink("teal"), grow, false);
        // lamp
        g.save();
        g.translate(LAMP_X, BEAM_Y);
        drawAll(g, lamp.glow.ss, k.ink("yellow"), grow > 0 ? 1 : 0);
        drawAll(g, lamp.body.ss, k.ink("red"));
        drawAll(g, lamp.lens.ss, k.ink("yellow"));
        g.restore();
        // jar: over B for the intro, travels to A (shakes) or back to B on taps
        let jx = JAR_X.B, sh = R ? 0 : Math.sin(seg(t, 0.25, 1.0) * Math.PI * 6) * 14 * (1 - seg(t, 0.85, 1.0));
        if (ev.length) {
          const from = aIn() ? JAR_X.B : JAR_X.A, to = aIn() ? JAR_X.A : JAR_X.B;
          jx = lerp(from, to, R ? 1 : easeIO(seg(t, te, te + 0.35)));
          sh = aIn() && !R ? Math.sin(seg(t, te + 0.3, te + 1.0) * Math.PI * 6) * 14 * (1 - seg(t, te + 0.85, te + 1.0)) : 0;
        }
        g.save();
        g.translate(jx + sh, JAR_Y);
        g.rotate(sh * 0.006);
        drawAll(g, jarBody, k.ink("blue"));
        drawAll(g, jarCap, k.ink("blue"));
        drawAll(g, jarLabel, k.ink("white"));
        g.restore();
      },
      down(_x, _y, t) {
        ev.push(Math.max(t, 1.2));
        return Math.max(t, 1.2) - t + 2.2;
      },
    };
  });
}

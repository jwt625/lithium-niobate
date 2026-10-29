// p1 photorefraction: a lamp's blue-green beam crosses the crystal and scrapes a wavy mark that stays after the
// beam goes dark. Drag up/down: the lamp follows, the beam shines while pressed and writes where it dwells.
import type { Scene, SceneHost } from "../../types";
import { bakeAll, bakeText, drawAll, lampParts } from "./common";
import { arrowScratches, blockScratches, clamp, drawBatch, makeScene, scratch, seg, type Block, type Pt, type Scratch } from "./kit";

export const TEXT1 = "Shine light in. It writes a mark inside the crystal.";

const BLK: Block = { x0: 300, y0: 196, x1: 830, y1: 650, d: 44 };
const LAMP_X = 196;
const Y_MIN = 238, Y_MAX = 610, Y0 = 330;
const ROW = 7, HALF = 34; // mark row pitch, half height of the written band
const ARROW_X = 790;

export function writeScene(host: SceneHost): Scene {
  return makeScene(host, 4101, (k) => {
    const rng = host.rng(4102);
    const lamp = lampParts(rng);
    // beam: five straight scratches through the page, drawn relative to the beam axis
    const beam: Scratch[] = [-15, -7.5, 0, 7.5, 15].map((dy) => scratch([[LAMP_X + 4, dy], [992, dy]], dy ? 3.4 : 4.6, rng, 0.5));
    // mark rows: wavy hair-scratches across the crystal, one per row
    const rowsY: number[] = [];
    for (let y = BLK.y0 + 12; y <= BLK.y1 - 12; y += ROW) rowsY.push(y);
    const rows: Scratch[] = rowsY.map((y, i) => {
      const pts: Pt[] = [];
      const ph = rng() * 6.3;
      for (let x = BLK.x0 + 14; x <= ARROW_X - 34; x += 10) pts.push([x, y + 2.6 * Math.sin(x * 0.07 + ph + i * 0.9)]);
      return scratch(pts, 3.2, rng, 0.6);
    });
    const user = new Float32Array(rows.length);
    let pressed = false, y = Y0, touched = false, tUp = -1e9, lastT = 0;

    const band = (yc: number, amt: number): void => {
      rowsY.forEach((ry, i) => {
        if (Math.abs(ry - yc) <= HALF) user[i] = Math.min(1, user[i] + amt);
      });
    };
    const intro = (t: number): number => (host.reduced ? 1 : seg(t, 0.45, 1.45));
    const beamAlpha = (t: number): number => {
      if (pressed) return 1;
      if (touched) return host.reduced ? 0 : 1 - seg(t, tUp, tUp + 0.3);
      return host.reduced ? 0 : seg(t, 0.12, 0.2) * (1 - seg(t, 1.75, 2.05));
    };
    const setY = (py: number): void => {
      y = clamp(py, Y_MIN, Y_MAX);
    };

    return {
      settle: 2.1,
      drag: true,
      bake(g, r) {
        bakeAll(g, blockScratches(BLK, r), k.ink("purple"), r);
        bakeAll(g, arrowScratches(ARROW_X, BLK.y1 - 34, BLK.y0 + 30, r), k.ink("green"), r);
        // lamp rail with up/down chevrons (drag affordance)
        const rail: Scratch[] = [scratch([[86, Y_MIN - 50], [86, Y_MAX + 50]], 3, r, 0.5)];
        rail.push(scratch([[64, Y_MIN - 64], [86, Y_MIN - 88], [108, Y_MIN - 64]], 6, r));
        rail.push(scratch([[64, Y_MAX + 64], [86, Y_MAX + 88], [108, Y_MAX + 64]], 6, r));
        bakeAll(g, rail, k.ink("white"), r);
        bakeText(g, k.ink, TEXT1, r);
      },
      draw(g, t) {
        const dt = clamp(t - lastT, 0, 0.1);
        lastT = t;
        if (pressed && !host.reduced) band(y, dt * 1.1);
        const e0 = touched ? 1 : intro(t);
        // the mark (stays)
        // rows batched by alpha level (8 levels) so a frame strokes at most 16 paths
        const levels: Scratch[][] = Array.from({ length: 8 }, () => []);
        rows.forEach((s, i) => {
          const e = Math.min(1, user[i] + (Math.abs(rowsY[i] - Y0) <= HALF ? e0 : 0));
          if (e >= 0.02) levels[Math.min(7, Math.floor(e ** 0.8 * 8))].push(s);
        });
        const ink = k.ink("sun");
        levels.forEach((ls, l) => {
          g.globalAlpha = (l + 1) / 8;
          drawBatch(g, ls, ink);
        });
        g.globalAlpha = 1;
        // beam (only while the light is on)
        const a = beamAlpha(t);
        const grow = touched || host.reduced ? 1 : seg(t, 0.12, 0.42);
        g.save();
        g.translate(0, y);
        if (a > 0.01) {
          g.globalAlpha = a;
          drawAll(g, beam, k.ink("teal"), grow, false);
          g.globalAlpha = 1;
        }
        g.translate(LAMP_X, 0);
        g.fillStyle = "#111111";
        g.fillRect(-154, -62, 126, 106);
        if (a > 0.01) {
          g.globalAlpha = a;
          drawAll(g, lamp.glow.ss, k.ink(lamp.glow.ink));
          g.globalAlpha = 1;
        }
        drawAll(g, lamp.body.ss, k.ink(lamp.body.ink));
        drawAll(g, lamp.lens.ss, k.ink(lamp.lens.ink));
        g.restore();
      },
      down(_x, py, t) {
        touched = true;
        pressed = true;
        setY(py);
        band(y, host.reduced ? 1 : 0.15);
        lastT = t;
        return 1;
      },
      move(_x, py) {
        if (!pressed) return 0;
        setY(py);
        band(y, host.reduced ? 1 : 0.04);
        return 1;
      },
      up(t) {
        pressed = false;
        tUp = t;
        return 0.5;
      },
    };
  });
}

// p3 pyroelectricity: the hotplate warms the crystal, the thermometer climbs, charge appears on the top and bottom
// faces (warming: minus on the arrow-head face, plus on the tail face), then a spark jumps. Tap: cool / warm again;
// cooling flips the signs.
import type { Scene, SceneHost } from "../../types";
import { bakeAll, bakeText, drawAll } from "./common";
import { arrowScratches, blockScratches, circle, easeIO, hatchLines, lerp, makeScene, rectPts, scratch, seg, type Block, type Pt, type Scratch } from "./kit";

export const TEXT3 = "Warm it up. Charges pop up on top and bottom. Zap!";

const BLK: Block = { x0: 350, y0: 268, x1: 690, y1: 546, d: 46 };
const PLATE = { x0: 318, x1: 770, y0: 546, y1: 596 };
const TH = { x: 150, top: 196, bot: 560, bulbY: 606, r: 40, warm: 262, cold: 470 };
const N_SIGN = 5;

export function warmScene(host: SceneHost): Scene {
  return makeScene(host, 4301, (k) => {
    const rng = host.rng(4302);
    const R = host.reduced;
    // signs: top face row (on the parallelogram) and bottom row (inside the front face, by the bottom edge)
    const topY = BLK.y0 - BLK.d / 2, botY = BLK.y1 - 30;
    const xs = (top: boolean): number[] =>
      Array.from({ length: N_SIGN }, (_, i) => lerp(BLK.x0 + 44 + (top ? BLK.d / 2 : 0), BLK.x1 - 70 + (top ? BLK.d / 2 : 0), i / (N_SIGN - 1)));
    const sign = (x: number, y: number, plus: boolean): Scratch[] => {
      const out = [scratch([[x - 17, y], [x + 17, y]], 8, rng, 0.5)];
      if (plus) out.push(scratch([[x, y - 17], [x, y + 17]], 8, rng, 0.5));
      return out;
    };
    const signs = (top: boolean, plus: boolean): Scratch[][] => xs(top).map((x) => sign(x, top ? topY : botY, plus));
    const S = { topMinus: signs(true, false), topPlus: signs(true, true), botMinus: signs(false, false), botPlus: signs(false, true) };
    // heat waves rising on the right; cold wiggles sinking on the right
    const waves: Scratch[] = [770, 822, 874].map((x, i) => {
      const pts: Pt[] = [];
      for (let y = PLATE.y0 - 18; y >= 250 + i * 18; y -= 8) pts.push([x + 12 * Math.sin(y * 0.045 + i * 1.7), y]);
      return scratch(pts, 6, rng, 0.5);
    });
    const colds: Scratch[] = [780, 832, 884].map((x, i) => {
      const pts: Pt[] = [];
      for (let y = 300 + i * 14; y <= 470; y += 8) pts.push([x + 8 * Math.sin(y * 0.09 + i), y]);
      return scratch(pts, 5, rng, 0.5);
    });
    const coil: Scratch[] = [];
    {
      const pts: Pt[] = [];
      for (let x = PLATE.x0 + 30, j = 0; x <= PLATE.x1 - 80; x += 22, j++) pts.push([x, j % 2 ? PLATE.y0 + 16 : PLATE.y1 - 16]);
      coil.push(scratch(pts, 6, rng, 0.5));
    }
    // the spark: zig-zag from the top face corner round the left side to the bottom corner, with burst ticks
    const x = BLK.x0;
    const boltPts: Pt[] = [[x - 6, BLK.y0 + 6], [x - 58, BLK.y0 + 58], [x - 34, BLK.y0 + 70], [x - 96, BLK.y0 + 138], [x - 62, BLK.y0 + 150], [x - 100, BLK.y0 + 206], [x - 10, BLK.y1 - 18]];
    const bolt: Scratch[] = [scratch(boltPts, 11, rng, 0.6)];
    for (const [x, y, a] of [[BLK.x0 - 6, BLK.y0 + 6, -2.3], [BLK.x0 - 10, BLK.y1 - 18, 2.4]] as [number, number, number][])
      for (const da of [-0.6, 0, 0.6]) bolt.push(scratch([[x + 16 * Math.cos(a + da), y + 16 * Math.sin(a + da)], [x + 40 * Math.cos(a + da), y + 40 * Math.sin(a + da)]], 5, rng, 0.4));
    const merc = scratch([[TH.x, TH.bulbY - 20], [TH.x, TH.top]], 20, rng, 0.3);
    const mercFrac = (yl: number): number => (TH.bulbY - 20 - yl) / (TH.bulbY - 20 - TH.top);

    // events: [time, warming?]; the intro is a warming step at 0
    const ev: [number, boolean][] = [[R ? -1e9 : 0, true]];
    const levelAt = (t: number): number => {
      let lv = TH.cold;
      for (const [te, w] of ev) lv = lerp(lv, w ? TH.warm : TH.cold, R ? 1 : easeIO(seg(t, te + 0.2, te + 1.4)));
      return lv;
    };

    return {
      settle: 2.4,
      bake(g, r) {
        bakeAll(g, blockScratches(BLK, r, 7, false), k.ink("purple"), r);
        bakeAll(g, arrowScratches((BLK.x0 + BLK.x1) / 2 - 20, BLK.y1 - 70, BLK.y0 + 36, r, 11), k.ink("green"), r);
        // hotplate
        const plate: Scratch[] = [scratch(rectPts(PLATE.x0, PLATE.y0, PLATE.x1, PLATE.y1), 7, r)];
        plate.push(scratch([[PLATE.x0 + 26, PLATE.y1], [PLATE.x0 + 26, PLATE.y1 + 40]], 8, r));
        plate.push(scratch([[PLATE.x1 - 26, PLATE.y1], [PLATE.x1 - 26, PLATE.y1 + 40]], 8, r));
        plate.push(scratch(circle(PLATE.x1 - 42, (PLATE.y0 + PLATE.y1) / 2, 13), 6, r));
        bakeAll(g, plate, k.ink("blue"), r);
        // thermometer: tube, bulb ring, ticks
        const th: Scratch[] = [
          scratch([[TH.x - 22, TH.bot], [TH.x - 22, TH.top], ...circle(TH.x, TH.top, 22, 22, Math.PI, Math.PI * 2).slice(1), [TH.x + 22, TH.bot]], 6, r),
          scratch(circle(TH.x, TH.bulbY, TH.r + 6, TH.r + 6, -1.2, Math.PI * 2 - 1.95), 6, r),
        ];
        for (let y = TH.top + 34; y <= TH.bot - 20; y += 34) th.push(scratch([[TH.x + 30, y], [TH.x + 46, y]], 4, r, 0.4));
        bakeAll(g, th, k.ink("white"), r);
        bakeAll(g, hatchLines(circle(TH.x, TH.bulbY, TH.r - 4), -0.6, 7, 3.4, r, 0.3), k.ink("red"), r);
        bakeText(g, k.ink, TEXT3, r);
      },
      draw(g, t) {
        const [te, warm] = ev[ev.length - 1];
        const prev = ev.length > 1 ? ev[ev.length - 2][1] : null;
        // thermometer column
        drawAll(g, [merc], k.ink(warm ? "red" : "blue"), mercFrac(levelAt(t)), false);
        // hotplate coil glows while warming
        const on = R ? 1 : seg(t, te + 0.05, te + 0.4);
        g.globalAlpha = warm ? on : 1 - on;
        drawAll(g, coil, k.ink("orange"), 1, false);
        // heat waves (warming) or cold wiggles (cooling)
        g.globalAlpha = 1;
        const wv = R ? 1 : seg(t, te + 0.1, te + 0.9);
        if (warm) drawAll(g, waves, k.ink("orange"), wv, false);
        else drawAll(g, colds, k.ink("blue"), wv, false);
        if (prev !== null && !R) {
          g.globalAlpha = 1 - seg(t, te, te + 0.3);
          if (prev) drawAll(g, waves, k.ink("orange"), 1, false);
          else drawAll(g, colds, k.ink("blue"), 1, false);
          g.globalAlpha = 1;
        }
        // charges: old signs leave, new ones appear one by one (warming: minus on top; cooling: plus on top)
        const grow = R ? 1 : seg(t, te + 0.4, te + 1.4);
        const n = Math.round(N_SIGN * grow);
        const top = warm ? S.topMinus : S.topPlus, bot = warm ? S.botPlus : S.botMinus;
        // the spark carries part of the charge away (two signs per face, the ones by the spark)
        const gone = R || t >= te + 1.6 ? 2 : 0;
        for (let i = gone; i < n; i++) {
          drawAll(g, top[i], k.ink(warm ? "blue" : "red"), 1, false);
          drawAll(g, bot[i], k.ink(warm ? "red" : "blue"), 1, false);
        }
        if (prev !== null && !R) {
          const left = Math.round(N_SIGN * (1 - seg(t, te, te + 0.4)));
          const ot = prev ? S.topMinus : S.topPlus, ob = prev ? S.botPlus : S.botMinus;
          for (let i = N_SIGN - left; i < N_SIGN; i++) {
            drawAll(g, ot[i], k.ink(prev ? "blue" : "red"), 1, false);
            drawAll(g, ob[i], k.ink(prev ? "red" : "blue"), 1, false);
          }
        }
        // zap: a bright flash, then the scraped bolt stays a little dimmer
        const z0 = te + 1.5;
        const flash = R ? 0 : seg(t, z0, z0 + 0.08) * (1 - seg(t, z0 + 0.25, z0 + 0.7));
        const zb = R ? 1 : seg(t, z0, z0 + 0.12);
        if (zb > 0) {
          g.globalAlpha = 0.75 + 0.25 * flash;
          drawAll(g, bolt, k.ink("yellow"), zb, false);
          g.globalAlpha = 1;
          if (flash > 0.01) {
            g.globalAlpha = 0.45 * flash;
            g.lineWidth = 26;
            g.strokeStyle = k.ink("yellow");
            g.lineJoin = "round";
            g.beginPath();
            boltPts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
            g.stroke();
            g.globalAlpha = 1;
          }
        }
      },
      down(_x, _y, t) {
        const last = ev[ev.length - 1];
        const at = R ? -1e9 : Math.max(t, last[0] + 1.6);
        ev.push([at, !last[1]]);
        return R ? 0.01 : at - t + 2.4;
      },
    };
  });
}

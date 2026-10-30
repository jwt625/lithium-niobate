// Light p2 (Pockels effect in a Mach-Zehnder): a leaded channel splits into two arms and joins again into a round
// lamp pane. Amber electrodes beside the upper arm, fed from a roundel with a painted spark. Voltage on: the upper
// arm's crests slide by half a wave (exaggerated), so at the join crest meets dip and the lamp pane goes dark there.
// The beam never bends. One closed cycle: on at AUTO, hold dark HOLD, off again (bright). Tap: replay the cycle from
// the current voltage. Reduced motion: voltage held on (tap toggles).
import type { Scene, SceneHost } from "../../types";
import { G, LIGHT, blob, circlePts, clamp01, easeIO, frameAndField, glowFill, makeWindow, pane, rectPts, type Pt } from "./kit";
import { banner } from "./letters";
import { channel } from "./wave";

export const TEXT2 = "A voltage changes the speed. Two paths meet again: bright or dark here.";
const LINES = ["A voltage changes the speed.", "Two paths meet again:", "bright or dark here."];

const Y0 = 388;
const YU = 256;
const YL = 520;
const XS = 280; // split
const XA = 372; // arm start
const XB = 688; // arm end
const XJ = 780; // join
const XO = 862; // output end
const EL0 = 404;
const EL1 = 656;
const LAM = 92;
const AMP = 13;
const VF = 1100; // light front speed (units/s)
const VC = 110; // crest drift speed
const T0 = 0.3;
const AUTO = 2.0; // the cycle starts by itself
const RAMP = 0.7;
const HOLD = 1.5; // dark at the join, long enough to read
const CYCLE = 2 * RAMP + HOLD;

const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

function armPts(y: number): Pt[] {
  const pts: Pt[] = [];
  for (let x = XS; x <= XA; x += 6) pts.push([x, Y0 + (y - Y0) * smooth((x - XS) / (XA - XS))]);
  pts.push([XB, y]);
  for (let x = XB + 6; x <= XJ; x += 6) pts.push([x, y + (Y0 - y) * smooth((x - XB) / (XJ - XB))]);
  return pts;
}
function sampler(pts: Pt[]): { len: number; at: (s: number) => Pt; sAtX: (x: number) => number } {
  const acc: number[] = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = (s: number): Pt => {
    let i = 1;
    while (i < acc.length - 1 && acc[i] < s) i++;
    const k = clamp01((s - acc[i - 1]) / (acc[i] - acc[i - 1] || 1));
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
  };
  const sAtX = (x: number) => {
    for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) return acc[i - 1] + ((x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1)) * (acc[i] - acc[i - 1]);
    return acc[acc.length - 1];
  };
  return { len: acc[acc.length - 1], at, sAtX };
}

export function switchScene(host: SceneHost): Scene {
  return makeWindow(host, 22, (w) => {
    frameAndField(w, 654);
    const LX = 98;
    w.add(pane(circlePts(LX, Y0, 48), G.amber, 0.7));
    w.add(pane(circlePts(LX, Y0, 28), G.warm, 0.9));
    const cols = ["#6F7C86", "#647079"];
    const input = channel([[146, Y0], [XS, Y0]], 21, 67, cols);
    const upPts = armPts(YU);
    const loPts = armPts(YL);
    const up = channel(upPts, 21, 80, cols);
    const lo = channel(loPts, 21, 80, cols);
    const out = channel([[XJ, Y0], [XO, Y0]], 21, 82, cols);
    // electrodes (gold strips) and the spark roundel with its lead strap
    const elTop = pane(rectPts(EL0, YU - 62, EL1, YU - 30), G.amber, 0.6);
    const elBot = pane(rectPts(EL0, YU + 30, EL1, YU + 62), G.amber, 0.6);
    const SX = 530;
    const SY = 122;
    const strap = pane(rectPts(SX - 9, SY + 30, SX + 9, YU - 60), "#3a3a3a", 0.2, 6);
    w.addAll([strap, elTop, elBot]);
    w.add(pane(circlePts(SX, SY, 38), G.amber, 0.75));
    w.addAll([...input.panes, ...lo.panes, ...up.panes, ...out.panes]);
    const OX = 906;
    w.add(pane(circlePts(OX, Y0, 46), "#8E856B", 0.6));
    w.add(pane(circlePts(OX, Y0, 24), "#9C9377", 0.6));
    // painted spark on the roundel
    const g0 = w.glass;
    g0.save();
    g0.fillStyle = G.paint;
    g0.beginPath();
    const bolt: Pt[] = [[SX + 6, SY - 27], [SX - 15, SY + 4], [SX - 2, SY + 4], [SX - 8, SY + 28], [SX + 15, SY - 5], [SX + 2, SY - 5]];
    bolt.forEach(([x, y], i) => (i ? g0.lineTo(x, y) : g0.moveTo(x, y)));
    g0.closePath();
    g0.fill();
    g0.restore();
    banner(w, LINES);

    // geometry for the glow
    const S_IN = XS - 146;
    const U = sampler(upPts);
    const e0 = U.sAtX(EL0);
    const e1 = U.sAtX(EL1);
    const outRound = new Path2D();
    outRound.arc(OX, Y0, 46, 0, Math.PI * 2);
    const elPaths = [elTop.path, elBot.path];
    const L2 = sampler(loPts);
    const all = new Path2D();
    for (const p of [...input.panes, ...up.panes, ...lo.panes, ...out.panes]) all.addPath(p.path);
    /** Glowing wave along a route: at(local s) gives the centerline; y(s) the offset along the normal. */
    const wave = (g: CanvasRenderingContext2D, at: (s: number) => Pt, nrm: Pt | null, s0: number, s1: number, front: number, y: (s: number) => number, alpha = 1) => {
      const end = Math.min(s1, front);
      if (end <= s0) return;
      const path = new Path2D();
      for (let s = s0; s <= end; s += 4) {
        const [x, yy] = at(s - s0);
        let n = nrm;
        if (!n) {
          const a = at(Math.max(0, s - s0 - 2));
          const b = at(s - s0 + 2);
          const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          n = [(b[1] - a[1]) / l, -(b[0] - a[0]) / l];
        }
        const o = y(s);
        if (s === s0) path.moveTo(x + n[0] * o, yy + n[1] * o);
        else path.lineTo(x + n[0] * o, yy + n[1] * o);
      }
      g.lineCap = "round";
      g.lineJoin = "round";
      if (alpha <= 0.01) return;
      for (const [lw, a] of [[22, 0.16], [11, 0.32], [5.5, 0.95]]) {
        g.strokeStyle = `rgba(${LIGHT},${a * alpha})`;
        g.lineWidth = lw;
        g.stroke(path);
      }
    };

    // interaction state: cycle start and the voltage there (ramp up from it, hold, ramp down to 0)
    let c0 = AUTO;
    let from = 0;
    let rv = 1; // reduced motion: voltage shown
    let tapEnd = 0;
    const vAt = (t: number) => {
      if (host.reduced) return rv;
      const u = t - c0;
      return u < RAMP + HOLD ? from + (1 - from) * easeIO(u / RAMP) : 1 - easeIO((u - RAMP - HOLD) / RAMP);
    };

    return {
      settle: AUTO + CYCLE + 0.4,
      glow(g, t) {
        const tc = Math.min(t, Math.max(AUTO + CYCLE + 0.4, tapEnd));
        const front = (t - T0) * VF; // arc length reached from the lamp
        const lamp = clamp01(t / T0);
        const v = vAt(t);
        const D = Math.PI * v;
        const B = Math.cos(D / 2) ** 2;
        g.fillStyle = `rgba(${LIGHT},${0.55 * lamp})`;
        g.beginPath();
        g.arc(LX, Y0, 28, 0, Math.PI * 2);
        g.fill();
        blob(g, LX, Y0, 110, 0.55 * lamp);
        // electrodes and spark
        for (const p of elPaths) glowFill(g, p, "255,214,120", 0.45 * v);
        blob(g, SX, SY, 80, 0.5 * v);
        // the light: a glowing wave inside the clear cames (glass stays put, light moves). Voltage slides the upper
        // arm's crests; the joined wave is the sum of both arms, so it flattens when crest meets dip.
        const k = (2 * Math.PI) / LAM;
        const sOut = S_IN + U.len;
        const dU = (s: number) => D * clamp01((s - e0) / (e1 - e0));
        const ph = (s: number) => k * s - k * VC * tc;
        g.save();
        g.clip(all);
        wave(g, (s) => [146 + s, Y0], [0, -1], 0, S_IN, front, (s) => AMP * Math.sin(ph(s)));
        wave(g, U.at, null, S_IN, S_IN + U.len, front, (s) => AMP * 0.8 * Math.sin(ph(s) + dU(s - S_IN)));
        wave(g, L2.at, null, S_IN, S_IN + L2.len, front, (s) => AMP * 0.8 * Math.sin(ph(s)));
        wave(g, (s) => [XJ + s, Y0], [0, -1], sOut, sOut + (XO - XJ) + 40, front, (s) => AMP * Math.cos(D / 2) * Math.sin(ph(s) + D / 2), Math.abs(Math.cos(D / 2)));
        g.restore();
        // the lamp pane at the join
        const reach = clamp01((front - sOut - (XO - XJ)) / 50);
        glowFill(g, outRound, LIGHT, 0.7 * B * reach);
        blob(g, OX, Y0, 120, 0.6 * B * reach);
      },
      tap(_x, _y, t) {
        if (host.reduced) {
          rv = 1 - rv;
          return 1;
        }
        from = vAt(t);
        c0 = t;
        tapEnd = t + CYCLE + 0.4;
        return CYCLE + 0.4;
      },
    };
  });
}

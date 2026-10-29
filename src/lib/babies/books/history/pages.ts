// The four stretches of the one strip. Page p covers world x [1000 (p - 1), 1000 p].
// Each builder returns stitched items (world coordinates) and an optional dynamic layer
// (moving parts drawn live: the flipping arrow, the growing crystal, light pulses, rack lights).

import { inscription, lineWidth } from "./letters";
import { Parts, Y, figure, ground, roof, rot, tree } from "./motifs";
import { Emb, W, arcPts, bez, clamp, drawItem, ease, easeIO, ellipse, item, limb, lerp, type Ctx, type Item, type Pt, type Rng } from "./stitch";

export const LINES: string[][] = [
  ["1949. Two scientists find", "the crystal's arrow.", "A push flips it."],
  ["1965. Bell Labs pulls", "a crystal out of", "a hot melt."],
  ["1985. A crystal light switch", "goes on sale. It sends", "messages down cables."],
  ["2018. Thin crystal chips.", "2026. For AI data centers.", "Now you know the history!"],
];
export const TEXT = LINES.map((l) => l.join(" "));

const MAXW = 920;
export const CAP = Math.min(46, ...LINES.flat().map((l) => Math.floor((MAXW / lineWidth(l.toUpperCase(), 1)) * 10) / 10));
const LH = CAP * 1.42;
const INS_Y0 = 222 - (2 * LH + CAP) / 2;

export const FINAL = 1e6;
export interface St {
  taps: number;
  tapT: number;
  reduced: boolean;
  rng: (seed: number) => Rng;
}
export interface Art {
  items: Item[];
  dyn?(g: Ctx, t: number, st: St): void;
  tap?(t: number, st: St): number; // returns seconds to keep the loop awake
}

/** Tap progress: 0..1 over [tapT + a, tapT + a + d]; 1 when reduced. */
const tk = (t: number, st: St, a: number, d: number): number => (st.taps === 0 ? 0 : st.reduced ? 1 : clamp((t - st.tapT - a) / d));

function words(P: Parts, p: number): void {
  inscription(P.e, LINES[p - 1], 1000 * (p - 1) + 500, INS_Y0, CAP, LH, W.teal, W.terra);
  P.cut(0.12, 1.3);
  P.items[P.items.length - 1].free = true;
}

// ---------------------------------------------------------------- p1 1949

function page1(rng: Rng): Art {
  const e = new Emb(rng), P = new Parts(e);
  words(P, 1);
  ground(e, -240, 1000, 3);
  P.cut(0.2, 0.6);
  figure(P, { x: 165, dir: 1, tunic: W.terra, hose: W.sage, hair: W.brown, armF: [[222, 582], [272, 540]], armB: [[150, 680], [160, 736]] }, 0.3, 1.0);
  // bench
  const top: Pt[] = [[300, 690], [680, 690], [676, 712], [304, 712]];
  e.shape(top, W.rust, W.teal, 0, 5);
  for (const [a, b] of [[[332, 712], [318, 832]], [[648, 712], [664, 832]]] as [Pt, Pt][]) e.shape(limb([a, b], 16, 12), W.rust, W.teal, 90, 4.5, { couch: null });
  P.cut(0.5, 0.6);
  // electrode plates and the crystal prism
  const plate = (y: number): Pt[] => [[380, y], [620, y], [620, y + 17], [380, y + 17]];
  e.shape(plate(430), W.ochre, W.teal, 0, 4.5, { couch: W.rust });
  e.shape(plate(673), W.ochre, W.teal, 0, 4.5, { couch: W.rust });
  const yt = 447, yb = 673;
  const L: Pt[] = [[404, yt], [452, yt], [452, yb], [404, yb]];
  const C: Pt[] = [[452, yt], [548, yt], [548, yb], [452, yb]];
  const R: Pt[] = [[548, yt], [596, yt], [596, yb], [548, yb]];
  e.laid(L, W.sage, 90, { w: 6, cg: 26 });
  e.laid(R, W.indigo, 90, { w: 6, cg: 26 });
  e.laid(C, W.buff, 90, { w: 6, couch: W.olive, cg: 26 });
  e.outline([[404, yt], [596, yt], [596, yb], [404, yb]], W.teal, 5.5);
  e.stem([[452, yt], [452, yb]], W.teal, 4.5);
  e.stem([[548, yt], [548, yb]], W.teal, 4.5);
  P.cut(0.6, 0.7);
  // push box with its big button, wires to the plates
  const box: Pt[] = [[690, 744], [770, 744], [770, 836], [690, 836]];
  e.shape(box, W.indigo, W.teal, 0, 5, { couch: W.ochre });
  e.stem(bez([700, 760], [662, 700], [656, 450], [620, 439]), W.brown, 4.5, 10);
  e.stem(bez([692, 800], [650, 800], [648, 690], [620, 682]), W.brown, 4.5, 10);
  P.cut(0.95, 0.5);
  figure(P, { x: 842, dir: -1, tunic: W.sage, hose: W.terra, hair: W.rust, armF: [[796, 662], [744, 704]], armB: [[858, 690], [852, 742]] }, 1.0, 0.95);
  tree(P, 968, 1.5, 0.6, 300);
  // strip start: tree before the first scene
  tree(P, -110, 0, 0.01, 300);

  // dynamic: arrow (stitched in local coords), button, sparks
  const ea = new Emb(rng);
  const arrow: Pt[] = [[-15, 92], [15, 92], [15, -44], [37, -44], [0, -98], [-37, -44], [-15, -44]];
  ea.laid(arrow, W.terra, 90, { w: 6, couch: W.maroon, cg: 22 });
  ea.outline(arrow, W.maroon, 5);
  const arrowIt = item(ea.take(), 0.95, 0.5);
  ea.shape(ellipse(0, 0, 26, 15, 18), W.terra, W.teal, 0, 4.5, { couch: null });
  ea.stem([[-8, 8], [-8, 22], [8, 22], [8, 8]], W.teal, 4, 6);
  const btn = item(ea.take(), 0.95, 0.4);
  const sparks: Pt[][] = [];
  for (const [sx, sy, dir] of [[380, 438, -1], [620, 438, 1], [380, 681, -1], [620, 681, 1]] as [number, number, number][]) {
    for (let k = -1; k <= 1; k++) {
      const a = (k * 32 * Math.PI) / 180, l = 30;
      sparks.push([[sx + dir * 6, sy], [sx + dir * (6 + l * 0.5 * Math.cos(a)) + 4, sy + l * 0.5 * Math.sin(a) - 5], [sx + dir * (6 + l * Math.cos(a)), sy + l * Math.sin(a)]]);
    }
  }
  sparks.forEach((s) => ea.stem(s, W.ochre, 5, 9));
  const sparkIt = item(ea.take(), 0, 0);
  const AUTO = 2.05;

  return {
    items: P.items,
    dyn(g, t, st) {
      const auto = st.reduced || t >= FINAL ? 1 : ease((t - AUTO - 0.12) / 0.6);
      const last = tk(t, st, 0.12, 0.6);
      const ang = 180 - 180 * auto - 180 * Math.max(0, st.taps - 1) - 180 * last;
      const press = Math.max(clamp(1 - Math.abs(t - AUTO - 0.08) / 0.14), st.taps && !st.reduced ? clamp(1 - Math.abs(t - st.tapT - 0.08) / 0.14) : 0);
      g.save();
      g.translate(730, 728 + press * 10);
      drawItem(g, btn, clamp((t - btn.t0) / btn.dur));
      g.restore();
      const sp = Math.max(clamp(1 - Math.abs(t - AUTO - 0.25) / 0.2), st.taps && !st.reduced ? clamp(1 - Math.abs(t - st.tapT - 0.25) / 0.2) : 0);
      if (sp > 0.05 && t < FINAL) {
        g.globalAlpha = sp;
        drawItem(g, sparkIt, 1);
        g.globalAlpha = 1;
      }
      g.save();
      g.translate(500, 560);
      g.rotate((ang * Math.PI) / 180);
      drawItem(g, arrowIt, t >= FINAL ? 1 : clamp((t - arrowIt.t0) / arrowIt.dur));
      g.restore();
    },
    tap: () => 1.2,
  };
}

// ---------------------------------------------------------------- p2 1965

function page2(rng: Rng): Art {
  const ox = 1000;
  const e = new Emb(rng), P = new Parts(e);
  words(P, 2);
  ground(e, ox, ox + 1000, 41);
  P.cut(0.2, 0.6);
  const X = (x: number): number => ox + x;
  // puller frame: two posts, beam, little gable, pulley
  for (const px of [104, 336]) e.shape(limb([[X(px), 838], [X(px), 452]], 20, 18), W.rust, W.teal, 90, 4.5, { cg: 28 });
  const beam: Pt[] = [[X(80), 430], [X(360), 430], [X(360), 454], [X(80), 454]];
  e.shape(beam, W.rust, W.teal, 0, 5);
  const gable: Pt[] = [[X(70), 432], [X(220), 372], [X(370), 432]];
  e.shape(gable, W.terra, W.teal, 0, 5, { couch: W.maroon });
  P.cut(0.25, 0.6);
  // furnace with arched mouth and flames, crucible
  const furn: Pt[] = [[X(128), 838], [X(128), 742], [X(312), 742], [X(312), 838]];
  e.laid(furn, W.indigo, 0, { w: 6, couch: W.buff, cg: 18 });
  const mouth: Pt[] = [[X(170), 838], ...arcPts(X(220), 800, 50, 44, 180, 360, 15), [X(270), 838]];
  e.laid(mouth, W.maroon, 0, { w: 6, couch: null });
  for (const [fx, fh, col] of [[196, 52, W.ochre], [220, 72, W.terra], [244, 52, W.ochre]] as [number, number, string][]) {
    const fl: Pt[] = [[X(fx - 14), 838], ...bez([X(fx - 14), 838], [X(fx - 16), 838 - fh * 0.6], [X(fx), 838 - fh]), ...bez([X(fx), 838 - fh], [X(fx + 16), 838 - fh * 0.6], [X(fx + 14), 838])];
    e.shape(fl, col, W.maroon, 90, 3.5, { w: 5, couch: null });
  }
  e.outline(furn, W.teal, 5);
  e.stem(mouth.slice(0, -1), W.teal, 4.5);
  const cru: Pt[] = [[X(160), 694], [X(280), 694], ...arcPts(X(220), 700, 60, 42, 0, 180, 15)];
  e.shape(cru, W.teal, W.brown, 0, 5, { couch: W.olive });
  P.cut(0.4, 0.7);
  // crank wheel on the right post (spokes drawn live)
  e.outline(ellipse(X(336), 640, 34, 34, 26), W.teal, 6);
  P.cut(0.6, 0.3);
  figure(P, { x: X(438), dir: -1, tunic: W.indigo, hose: W.ochre, hair: W.brown, armF: [[X(400), 650], [X(362), 616]], armB: [[X(420), 690], [X(372), 676]] }, 0.6, 0.9);
  // second worker carries a finished crystal toward the lab
  const boulePoly = (cx: number, top: number, L: number, hw: number): Pt[] => [
    [cx - 4, top], [cx + 4, top], [cx + 5, top + 12],
    ...bez([cx + 5, top + 12], [cx + hw * 0.7, top + 26], [cx + hw, top + 52]),
    [cx + hw, top + L - 22],
    ...arcPts(cx, top + L - 22, hw, 22, 0, 180, 18),
    [cx - hw, top + 52],
    ...bez([cx - hw, top + 52], [cx - hw * 0.7, top + 26], [cx - 5, top + 12]),
  ];
  const carried = rot(boulePoly(X(668), 452, 178, 34), X(668), 542, 72);
  figure(P, { x: X(660), dir: 1, tunic: W.terra, hose: W.indigo, hair: W.rust, armF: [[X(706), 618], [X(722), 566]], armB: [[X(636), 618], [X(626), 570]] }, 1.0, 0.8);
  e.laid(carried, W.buff, 0, { w: 6, couch: W.olive, cg: 24 });
  e.outline(carried, W.indigo, 5.5);
  e.stem([[X(640), 554], [X(700), 534]], W.olive, 3.5, 9);
  P.cut(1.5, 0.5);
  // the lab: arcaded house with a tower
  const wall: Pt[] = [[X(770), 838], [X(770), 600], [X(900), 600], [X(900), 838]];
  e.laid(wall, W.olive, 90, { w: 6, couch: W.rust, cg: 24 });
  const door: Pt[] = [[X(810), 838], ...arcPts(X(835), 760, 25, 30, 180, 360, 20), [X(860), 838]];
  e.laid(door, W.indigo, 90, { w: 6, couch: null });
  e.outline(wall, W.teal, 5);
  e.stem(door.slice(0, -1), W.teal, 4.5);
  roof(e, [[X(756), 604], [X(835), 520], [X(914), 604]], X(756), X(914), 520, 604, W.terra);
  P.cut(1.6, 0.6);
  tree(P, ox + 952, 1.9, 0.5, 300);

  // live: rope, growing boule, crank spokes
  const MT = 694, LF = 196, HW = 30;
  const ea = new Emb(rng);
  ea.laid(boulePoly(0, 0, LF, HW), W.buff, 0, { w: 6, couch: W.olive, cg: 24 });
  ea.outline(boulePoly(0, 0, LF, HW), W.indigo, 5.5);
  ea.stem([[-HW * 0.5, 60], [-HW * 0.5, LF - 30]], W.olive, 3.5, 9);
  const bouleIt = item(ea.take(), 0, 0);
  ea.outline(ellipse(0, 0, 20, 20, 20), W.brown, 5);
  ea.laid(ellipse(0, 0, 16, 16, 16), W.ochre, 0, { w: 5, couch: null });
  const pulley = item(ea.take(), 0, 0);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 4;
    ea.stem([[-30 * Math.cos(a), -30 * Math.sin(a)], [30 * Math.cos(a), 30 * Math.sin(a)]], W.rust, 5, 10);
  }
  ea.stem([[30, 0], [30, -16]], W.brown, 6, 8);
  const spokes = item(ea.take(), 0, 0);
  const G0 = 0.9, G1 = 2.8;

  return {
    items: P.items,
    dyn(g, t, st) {
      const vis = clamp((t - 0.5) / 0.4);
      let k = t >= FINAL || st.reduced ? 1 : lerp(0.08, 1, easeIO((t - G0) / (G1 - G0)));
      if (st.taps && !st.reduced) k = Math.min(k, lerp(0.15, 1, easeIO((t - st.tapT) / 1.6)));
      const L = LF * k;
      const top = MT - L;
      // rope from pulley to seed
      const live = new Emb(st.rng(91));
      live.stem([[X(220) + 20, 470], [X(336) + 20 * Math.cos(k * 9), 640 + 20 * Math.sin(k * 9)]], W.brown, 3.5, 10);
      live.stem([[X(220), 490], [X(220), top]], W.brown, 3.5, 10);
      g.save();
      g.globalAlpha = vis;
      for (const r of live.runs) drawItem(g, item([r], 0, 0), 1);
      g.translate(X(220), 470);
      drawItem(g, pulley, 1);
      g.restore();
      g.save();
      g.globalAlpha = vis;
      g.translate(X(336), 640);
      g.rotate(k * 9);
      drawItem(g, spokes, 1);
      g.restore();
      g.save();
      g.globalAlpha = vis;
      g.beginPath();
      g.rect(X(150), 300, 140, MT + 4 - 300);
      g.clip();
      g.translate(X(220), top);
      drawItem(g, bouleIt, 1);
      g.restore();
      // melt glow line
      g.save();
      g.globalAlpha = vis;
      const gl = new Emb(st.rng(92));
      gl.stem([[X(172), MT + 6], [X(268), MT + 6]], W.ochre, 6, 12);
      drawItem(g, item(gl.runs, 0, 0), 1);
      g.restore();
    },
    tap: () => 1.9,
  };
}

// ---------------------------------------------------------------- p3 1985

/** Cable path: from the modulator on its stand, up onto poles, span by span overland into page 4. */
const POLE_TOP = 566;
const SPANS = [2730, 2880, 3030, 3180];
export const CABLE: Pt[] = [
  ...bez([2622, 712], [2680, 712], [2702, 600], [2730, POLE_TOP]),
  ...SPANS.slice(1).flatMap((b, i) => bez([SPANS[i], POLE_TOP], [(SPANS[i] + b) / 2, POLE_TOP + 70], [b, POLE_TOP]).slice(1)),
  [3184, 780],
  [3200, 800],
  [3500, 800],
];

/** Wooden poles with a cross-arm, carrying the cable. */
function poles(e: Emb, xs: number[]): void {
  for (const x of xs) {
    e.shape(limb([[x, 838], [x, POLE_TOP - 14]], 14, 11), W.rust, W.teal, 90, 4.5, { couch: null });
    e.shape([[x - 26, POLE_TOP - 6], [x + 26, POLE_TOP - 6], [x + 26, POLE_TOP + 6], [x - 26, POLE_TOP + 6]], W.ochre, W.teal, 0, 4, { couch: null });
  }
}

function pathAt(p: Pt[], cum: number[], d: number): Pt {
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const a = p[i - 1], b = p[i];
  const k = clamp((d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1));
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
}
function cumLen(p: Pt[]): number[] {
  const c = [0];
  for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  return c;
}

function page3(rng: Rng): Art {
  const ox = 2000, X = (x: number): number => ox + x;
  const e = new Emb(rng), P = new Parts(e);
  words(P, 3);
  ground(e, ox, ox + 1000, 77);
  P.cut(0.2, 0.5);
  // shop: arcade with tiled roof, counter
  for (const cx of [52, 300]) e.shape(limb([[X(cx), 838], [X(cx), 512]], 18, 16), W.ochre, W.teal, 90, 4.5, { cg: 26 });
  e.stem(arcPts(X(176), 528, 116, 30, 180, 360, 15), W.teal, 5);
  roof(e, [[X(24), 512], [X(70), 428], [X(282), 428], [X(330), 512]], X(24), X(330), 428, 512, W.terra);
  P.cut(0.25, 0.6);
  figure(P, { x: X(150), dir: 1, tunic: W.sage, hose: W.indigo, hair: W.brown, armF: [[X(206), 650], [X(262), 636]], armB: [[X(132), 690], [X(146), 730]] }, 0.4, 0.8);
  const counter: Pt[] = [[X(64), 716], [X(290), 716], [X(290), 838], [X(64), 838]];
  e.laid(counter, W.indigo, 90, { w: 6, couch: W.ochre, cg: 22 });
  e.outline(counter, W.teal, 5);
  e.stem([[X(64), 738], [X(290), 738]], W.ochre, 5);
  P.cut(0.6, 0.5);
  // the modulator: a long crystal bar with gold electrodes (one sold, one on the stand)
  const bar = (x: number, y: number, l: number): void => {
    const b: Pt[] = [[x, y], [x + l, y], [x + l, y + 20], [x, y + 20]];
    e.laid(b, W.buff, 0, { w: 5.5, couch: null });
    e.outline(b, W.teal, 4.5, 9);
    e.stem([[x + 8, y + 6], [x + l - 8, y + 6]], W.ochre, 5, 10);
    e.stem([[x + 8, y + 14], [x + l - 8, y + 14]], W.ochre, 5, 10);
  };
  bar(X(266), 626, 78);
  P.cut(0.75, 0.3);
  figure(P, { x: X(416), dir: -1, tunic: W.terra, hose: W.sage, hair: W.rust, armF: [[X(380), 660], [X(350), 640]], armB: [[X(430), 690], [X(400), 700]] }, 0.75, 0.8);
  // stand with a lamp (laser) and the modulator feeding the cable
  const stand: Pt[] = [[X(470), 732], [X(640), 732], [X(640), 750], [X(470), 750]];
  e.shape(stand, W.rust, W.teal, 0, 4.5, { couch: null });
  for (const lx of [486, 624]) e.shape(limb([[X(lx), 750], [X(lx), 838]], 12, 10), W.rust, W.teal, 90, 4, { couch: null });
  const lamp: Pt[] = [[X(474), 684], [X(530), 684], [X(530), 732], [X(474), 732]];
  e.shape(lamp, W.teal, W.brown, 0, 4.5, { couch: W.ochre });
  e.knot(X(520), 708, W.ochre, 5);
  bar(X(542), 702, 80);
  e.stem([[X(530), 712], [X(542), 712]], W.ochre, 4, 6);
  P.cut(1.1, 0.5);
  // cable on poles across the land toward page 4
  poles(e, [2730, 2880]);
  e.stem(CABLE.filter((q) => q[0] <= 3005), W.indigo, 8, 13);
  P.cut(1.3, 0.6);

  // live: light blinks along the cable
  const cab = CABLE.filter((q) => q[0] <= 3020);
  const cum = cumLen(cab), tot = cum[cum.length - 1];
  const PAT = [0, 28, 44, 52, 80, 108, 124, 132];
  const blink = (g: Ctx, head: number, alpha: number, live: Emb): void => {
    for (const o of PAT) {
      const d0 = head - o;
      if (d0 < 6 || d0 > tot - 4) continue;
      const len = o % 28 === 0 ? 22 : 8;
      const a = pathAt(cab, cum, d0), b = pathAt(cab, cum, Math.max(0, d0 - len));
      live.stem([b, a], W.ochre, 7.5, 12);
    }
    g.globalAlpha = alpha;
    for (const r of live.runs) drawItem(g, item([r], 0, 0), 1);
    g.globalAlpha = 1;
    live.runs = [];
  };
  return {
    items: P.items,
    dyn(g, t, st) {
      const live = new Emb(st.rng(93));
      // a burst of blinks runs along the poles, then one stitched burst rests on the first span
      const fin = t >= FINAL || st.reduced;
      const intro = fin ? 1 : clamp((t - 1.5) / 1.3);
      if (intro > 0 && intro < 1) blink(g, lerp(0, tot + 140, intro), 1, live);
      const rest = fin ? 1 : clamp((t - 2.7) / 0.3);
      if (rest > 0) blink(g, 330, rest, live);
      if (st.taps && !st.reduced) {
        const k = clamp((t - st.tapT) / 1.4);
        if (k < 1) blink(g, lerp(0, tot + 140, k), 1, live);
      }
    },
    tap: () => 1.6,
  };
}

// ---------------------------------------------------------------- p4 2018, 2026

function page4(rng: Rng): Art {
  const ox = 3000, X = (x: number): number => ox + x;
  const e = new Emb(rng), P = new Parts(e);
  words(P, 4);
  ground(e, ox, ox + 1000, 77);
  P.cut(0.15, 0.4);
  poles(e, [3030, 3180]);
  e.stem(CABLE.filter((q) => q[0] >= 2995), W.indigo, 8, 13);
  e.stem([[X(500), 800], [X(560), 800]], W.indigo, 8, 13);
  P.cut(0.3, 0.4);
  figure(P, { x: X(320), dir: 1, tunic: W.ochre, hose: W.terra, hair: W.brown, armF: [[X(366), 584], [X(394), 540]], armB: [[X(304), 690], [X(312), 742]] }, 0.4, 0.8);
  // thin chip held up: a flat slab with gold electrode lines
  const chip: Pt[] = [[X(344), 520], [X(452), 500], [X(458), 518], [X(350), 538]];
  e.shape(chip, W.buff, W.teal, -10, 4.5, { w: 5, couch: null });
  e.stem([[X(360), 524], [X(446), 508]], W.ochre, 4, 8);
  e.stem([[X(362), 532], [X(448), 516]], W.ochre, 4, 8);
  P.cut(1.0, 0.3);
  // data hall: towers, tiled roof, arches, four racks
  const hall: Pt[] = [[X(510), 838], [X(510), 560], [X(930), 560], [X(930), 838]];
  e.laid(hall, W.buff, 90, { w: 6, couch: W.olive, cg: 30 });
  e.outline(hall, W.teal, 5);
  roof(e, [[X(494), 566], [X(560), 474], [X(880), 474], [X(946), 566]], X(494), X(946), 474, 566, W.terra);
  for (const tx of [520, 920]) {
    const tw: Pt[] = [[X(tx - 26), 566], [X(tx - 26), 450], [X(tx + 26), 450], [X(tx + 26), 566]];
    e.shape(tw, W.sage, W.teal, 90, 5, { cg: 24 });
    const dome: Pt[] = [[X(tx - 30), 452], ...arcPts(X(tx), 452, 30, 34, 180, 360, 15)];
    e.shape(dome, W.indigo, W.teal, 0, 5, { couch: W.ochre });
  }
  for (const cx of [626, 812]) e.stem(arcPts(X(cx), 616, 86, 40, 180, 360, 15), W.teal, 5);
  P.cut(1.1, 0.6);
  const RX = [552, 632, 732, 812];
  for (const rx of RX) {
    const rk: Pt[] = [[X(rx), 836], [X(rx), 628], [X(rx + 62), 628], [X(rx + 62), 836]];
    e.laid(rk, W.teal, 90, { w: 6, couch: W.indigo, cg: 20 });
    e.outline(rk, W.brown, 5);
  }
  P.cut(1.4, 0.5);

  // live: rack lights switch on row by row; tap runs a chase
  const lights: Pt[] = [];
  for (let row = 0; row < 7; row++) for (const rx of RX) for (const c of [0, 1]) lights.push([X(rx + 18 + c * 26), 650 + row * 22]);
  return {
    items: P.items,
    dyn(g, t, st) {
      const live = new Emb(st.rng(94));
      const on = t >= FINAL || st.reduced ? 1 : clamp((t - 1.8) / 1.0);
      const chase = st.taps && !st.reduced ? clamp((t - st.tapT) / 1.2) : 1;
      const show = t >= FINAL || st.reduced || t >= 1.85;
      lights.forEach(([x, y], i) => {
        if (!show) return;
        const row = Math.floor(i / 8);
        const lit = on * 7 > 6 - row;
        let col = lit ? ((i * 5) % 7 === 0 ? W.terra : W.ochre) : W.indigo;
        if (chase < 1) col = Math.floor(chase * 14 + row) % 3 === 0 ? W.buff : col;
        live.knot(x, y, col, 4);
      });
      // a little sparkle on the thin chip
      const sp = t >= FINAL || st.reduced ? 1 : clamp((t - 1.3) / 0.3);
      if (sp > 0) {
        const cx = X(470), cy = 492, r = 16 * sp;
        live.stem([[cx - r, cy], [cx + r, cy]], W.ochre, 4, 8);
        live.stem([[cx, cy - r], [cx, cy + r]], W.ochre, 4, 8);
      }
      for (const r of live.runs) drawItem(g, item([r], 0, 0), 1);
    },
    tap: () => 1.4,
  };
}

export const BUILD: ((rng: Rng) => Art)[] = [page1, page2, page3, page4];

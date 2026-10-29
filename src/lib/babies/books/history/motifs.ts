// Strip motifs in the Bayeux manner (own designs): flat profile figures with bare-linen faces,
// stylized trees as scene dividers, arcaded buildings, ground line, and the two borders.

import { Emb, W, arcPts, ellipse, inside, item, limb, type Item, type Pt } from "./stitch";

export const Y = {
  bTop: [26, 114] as const, // upper border band
  bBot: [886, 974] as const, // lower border band
  ground: 838,
};

/** Collects parts of one element as consecutive items (each part stitched outline -> fill). */
export class Parts {
  items: Item[] = [];
  e: Emb;
  constructor(e: Emb) {
    this.e = e;
  }
  /** Close the runs pushed since the last cut into an item starting at t0. */
  cut(t0: number, dur: number): void {
    const r = this.e.take();
    if (r.length) this.items.push(item(r, t0, dur));
  }
}

export interface Fig {
  x: number;
  dir: 1 | -1;
  h?: number;
  gy?: number;
  tunic: string;
  hose: string;
  hair: string;
  armF: Pt[]; // elbow and hand, absolute
  armB?: Pt[];
  stride?: number;
}

const rot = (p: Pt[], cx: number, cy: number, deg: number): Pt[] => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return p.map(([x, y]): Pt => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
};
export { rot };

/** A Bayeux-proportioned figure in profile. Pushes items into `P` over [t0, t0 + dur]. */
export function figure(P: Parts, f: Fig, t0: number, dur: number): void {
  const e = P.e;
  const h = f.h ?? 320, u = h / 100, gy = f.gy ?? Y.ground, d = f.dir, x = f.x;
  const ink = W.teal;
  const hem = gy - 33 * u, waist = gy - 55 * u, sh = gy - 75 * u, hc = gy - 86 * u, r = 8.2 * u;
  const stride = f.stride ?? 1;
  const step = dur / 6;
  const shoulder: Pt = [x + d * 1.5 * u, sh + 3 * u];
  // back arm
  if (f.armB) {
    const a = limb([shoulder, ...f.armB], 5.6 * u, 4.4 * u);
    e.shape(a, f.tunic, ink, 0, 4.5, { w: 5.5, cg: 22 });
    const hd = f.armB[f.armB.length - 1];
    e.outline(ellipse(hd[0], hd[1], 2.8 * u, 2.6 * u, 12), ink, 4);
    P.cut(t0, step * 1.5);
  }
  // legs (back, then front) with pointed shoes
  const feet: [number, number][] = [
    [x - d * 7 * u * stride, -1],
    [x + d * 8 * u * stride, 1],
  ];
  for (const [fx] of feet) {
    const top: Pt = [x + (fx > x ? 2.5 : -2.5) * u, hem - 3 * u];
    const leg = limb([top, [fx, gy - 5 * u]], 6.4 * u, 4.6 * u);
    e.laid(leg, f.hose, 0, { w: 5.5, gap: 4.6, couch: W.brown, cg: 13 });
    e.outline(leg, ink, 4.5);
    const shoe: Pt[] = [
      [fx - d * 3 * u, gy - 6 * u],
      [fx + d * 2.6 * u, gy - 6 * u],
      [fx + d * 8 * u, gy - 0.5 * u],
      [fx - d * 3.4 * u, gy],
    ];
    e.shape(shoe, W.brown, ink, 0, 4, { w: 5, couch: null });
  }
  P.cut(t0 + step, step * 1.6);
  // tunic
  const tun: Pt[] = [
    [x - 7 * u, sh],
    [x + 7 * u, sh],
    [x + 6 * u, waist],
    [x + 14 * u, hem],
    [x + 4 * u, hem + 2.5 * u],
    [x - 4 * u, hem + 2.5 * u],
    [x - 14 * u, hem],
    [x - 6 * u, waist],
  ];
  e.laid(tun, f.tunic, 90, { w: 6.5, cg: 26 });
  e.outline(tun, ink, 5);
  e.stem([[x - 6.6 * u, waist], [x + 6.6 * u, waist]], W.ochre, 6.5, 10);
  e.stem([[x - 13.2 * u, hem - 2 * u], [x + 13.2 * u, hem - 2 * u]], W.ochre, 4.5, 10);
  P.cut(t0 + step * 2, step * 1.8);
  // head: bare linen face in outline, hair cap laid, eye knot
  const loc: Pt[] = [
    ...arcPts(0, 0, r, r * 1.08, -62, -298, 14),
    [r * 0.72, r * 0.82],
    [r * 0.9, r * 0.42],
    [r * 1.32, r * 0.08],
    [r * 0.94, -r * 0.3],
  ];
  const head = loc.map(([a, b]): Pt => [x + d * a, hc + b]);
  const hairL: Pt[] = [...arcPts(0, 0, r * 1.08, r * 1.16, -40, -235, 14), [-r * 0.5, r * 0.15], [-r * 0.1, -r * 0.55], [r * 0.55, -r * 0.62]];
  const hair = hairL.map(([a, b]): Pt => [x + d * a, hc + b]);
  e.stem([[x, hc + r], [x, sh + 1]], ink, 4.5, 8);
  e.laid(hair, f.hair, 0, { w: 5, gap: 4.4, couch: null });
  e.outline(head, ink, 4.5, 9);
  e.knot(x + d * r * 0.42, hc - r * 0.12, ink, 3);
  P.cut(t0 + step * 3, step * 1.6);
  // front arm
  const a = limb([shoulder, ...f.armF], 5.8 * u, 4.4 * u);
  e.shape(a, f.tunic, ink, 0, 4.5, { w: 5.5, cg: 22 });
  const hd = f.armF[f.armF.length - 1];
  e.outline(ellipse(hd[0], hd[1], 2.8 * u, 2.6 * u, 12), ink, 4);
  P.cut(t0 + step * 4.2, step * 1.8);
}

/** Stylized tree used as a scene divider. */
export function tree(P: Parts, x: number, t0: number, dur: number, h = 330): void {
  const e = P.e, gy = Y.ground;
  const trunk = limb([[x, gy], [x - 6, gy - h * 0.45], [x + 4, gy - h * 0.8]], 30, 14);
  e.shape(trunk, W.rust, W.teal, 90, 5, { w: 6, cg: 24 });
  P.cut(t0, dur * 0.35);
  const lobes: [number, number, number, string][] = [
    [-1, 0.42, 1, W.sage],
    [1, 0.5, 1, W.olive],
    [-1, 0.68, 0.85, W.olive],
    [1, 0.76, 0.85, W.sage],
  ];
  for (const [sd, k, sc, col] of lobes) {
    const by = gy - h * k;
    const br: Pt[] = [
      [x, by],
      [x + sd * 34 * sc, by - 26 * sc],
      [x + sd * 56 * sc, by - 18 * sc],
    ];
    e.stem(br, W.teal, 6, 11);
    const cx = x + sd * 62 * sc, cy = by - 40 * sc;
    const leaf = rot(ellipse(cx, cy, 20 * sc, 36 * sc, 22), cx, cy, sd * 38);
    e.shape(leaf, col, W.teal, sd * 38 + 90, 4.5, { w: 5.5, cg: 16 });
    e.stem(rot([[cx, cy + 28 * sc], [cx, cy - 26 * sc]], cx, cy, sd * 38), W.terra, 3.5, 9);
  }
  const cx = x + 4, cy = gy - h * 0.9;
  const crown = ellipse(cx, cy, 30, 40, 24);
  e.shape(crown, W.terra, W.teal, 90, 4.5, { w: 5.5, cg: 16 });
  e.stem([[cx, cy + 30], [cx, cy - 32]], W.ochre, 3.5, 9);
  P.cut(t0 + dur * 0.3, dur * 0.7);
}

/** Tiled roof: laid fill with rows of scale arcs. */
export function roof(e: Emb, poly: Pt[], x0: number, x1: number, y0: number, y1: number, col: string): void {
  e.laid(poly, col, 0, { w: 6, couch: null });
  for (let y = y0 + 16, row = 0; y < y1 - 4; y += 18, row++) {
    for (let x = x0 + 10 + (row % 2) * 11; x < x1 - 14; x += 22) {
      if (!inside([x, y - 8], poly) || !inside([x + 22, y - 8], poly)) continue;
      e.stem(arcPts(x + 11, y - 6, 11, 9, 180, 0, 30), W.maroon, 3.2, 8);
    }
  }
  e.outline(poly, W.teal, 5);
}

/** Ground line: a gently rolling stem line with small tufts. */
export function ground(e: Emb, x0: number, x1: number, seed: number): void {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1; x += 8) pts.push([x, Y.ground + 4 + Math.sin((x + seed) / 61) * 3 + Math.sin((x + seed) / 23) * 1.5]);
  e.stem(pts, W.rust, 6, 13);
  for (let x = x0 + 30; x < x1 - 20; x += 70 + ((x * 7 + seed) % 40)) {
    const y = Y.ground + 6;
    e.stem([[x, y], [x - 6, y - 14]], W.sage, 4, 8);
    e.stem([[x + 4, y], [x + 6, y - 16]], W.sage, 4, 8);
  }
}

/** Small crystal prism with its arrow (border motif). */
function bCrystal(e: Emb, cx: number, cy: number, s: number): void {
  const w = 16 * s, h = 28 * s;
  const body: Pt[] = [[cx - w, cy - h * 0.6], [cx, cy - h], [cx + w, cy - h * 0.6], [cx + w, cy + h * 0.6], [cx, cy + h], [cx - w, cy + h * 0.6]];
  e.laid(body, W.indigo, 90, { w: 5, gap: 4.2, couch: null });
  e.outline(body, W.teal, 4, 9);
  e.stem([[cx, cy + h * 0.55], [cx, cy - h * 0.45]], W.ochre, 4.5, 8);
  e.stem([[cx - 6 * s, cy - h * 0.22], [cx, cy - h * 0.5], [cx + 6 * s, cy - h * 0.22]], W.ochre, 4.5, 8);
}

/** Wave motif. */
function bWave(e: Emb, cx: number, cy: number): void {
  const pts: Pt[] = [];
  for (let x = -34; x <= 34; x += 4) pts.push([cx + x, cy + Math.sin((x / 34) * Math.PI * 1.5) * 10]);
  e.stem(pts, W.terra, 5, 10);
  e.knot(cx - 22, cy + 18, W.sage, 3);
  e.knot(cx + 22, cy - 18, W.sage, 3);
}

export const PANEL = 125;

/**
 * Border stitches for the panels overlapping world x [x0, x1]. Each panel is stitched from its own
 * seeded Emb (mk(i)), so a panel looks the same whichever stretch range is baked.
 */
export function borders(mk: (i: number) => Emb, x0: number, x1: number): Emb[] {
  const out: Emb[] = [];
  const i0 = Math.floor(x0 / PANEL) - 1, i1 = Math.ceil(x1 / PANEL) + 1;
  for (let i = i0; i <= i1; i++) {
    const e = mk(i);
    const px = i * PANEL;
    for (const [top, bot] of [Y.bTop, Y.bBot]) {
      for (const y of [top, bot]) e.stem([[px - 3, y], [px + PANEL + 3, y]], W.teal, 5.5, 14);
    }
    for (const [band, flip] of [[Y.bTop, 1], [Y.bBot, -1]] as const) {
      const [top, bot] = band;
      const yt = top + 5, yb = bot - 5;
      const sl = 22 * flip;
      const b1: Pt[] = [[px - sl - 7, yt], [px - sl + 5, yt], [px + sl + 5, yb], [px + sl - 7, yb]];
      const b2: Pt[] = b1.map(([x, y]): Pt => [x + 15, y]);
      e.laid(b1, W.terra, 90, { w: 5, gap: 4.2, couch: null });
      e.laid(b2, W.ochre, 90, { w: 5, gap: 4.2, couch: null });
      const cx = px + PANEL / 2 + 8, cy = (top + bot) / 2;
      const k = (((i % 2) + 2) % 2) ^ (flip < 0 ? 1 : 0);
      if (k === 0) bCrystal(e, cx, cy, 1);
      else bWave(e, cx, cy);
    }
    out.push(e);
  }
  return out;
}

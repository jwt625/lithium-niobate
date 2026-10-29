// Own pictograms for the Industry book, drawn for this site (no Arntz glyphs copied): flat, stroke-less
// silhouettes in a 100 x 100 box, y down. Each is a list of [path, colour] layers; holes use evenodd.
import { PAL, r1, type Layer } from "./kit";

type Layers = Layer[];

export const poly = (...p: number[]) => {
  let d = "";
  for (let i = 0; i < p.length; i += 2) d += (i ? "L" : "M") + r1(p[i]) + " " + r1(p[i + 1]);
  return d + "Z";
};
const rect = (x: number, y: number, w: number, h: number) => poly(x, y, x + w, y, x + w, y + h, x, y + h);
/** Thin quad along a segment (a cut line). */
const bar = (x0: number, y0: number, x1: number, y1: number, w: number) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * (w / 2);
  const ny = (dx / L) * (w / 2);
  return poly(x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny);
};
const circ = (cx: number, cy: number, r: number) => `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0Z`;
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0Z`;
/** Annular sector, angles in degrees (0 = right, 90 = up). */
function sector(cx: number, cy: number, r0: number, r1_: number, a0: number, a1: number): string {
  const p: number[] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    p.push(cx + r1_ * Math.cos(a), cy - r1_ * Math.sin(a));
  }
  for (let i = n; i >= 0; i--) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    p.push(cx + r0 * Math.cos(a), cy - r0 * Math.sin(a));
  }
  return poly(...p);
}

/** Niobium ore: a faceted lump with two cut facet lines. */
export const ROCK: Layers = [
  [poly(4, 88, 9, 60, 24, 40, 42, 25, 62, 22, 80, 31, 93, 52, 97, 88) + bar(42, 27, 50, 52, 3.4) + bar(50, 52, 80, 58, 3.4) + bar(50, 52, 34, 86, 3.4), PAL.ink],
];

/** Powder: a heap on a dish with falling grains. */
export const POWDER: Layers = [
  [
    "M4 86C22 86 30 50 50 48C70 50 78 86 96 86Z" + rect(0, 88, 100, 7) + rect(46.5, 36, 7, 7) + rect(42, 24, 6, 6) + rect(52, 20, 6, 6) + rect(46, 9, 6, 6) + rect(38, 2, 5, 5) + rect(56, 3, 5, 5) + rect(30, 34, 5, 5) + rect(65, 30, 5, 5),
    PAL.ink,
  ],
];

/** A grown crystal (Czochralski boule) hanging from its pull rod; colour set per use. */
export function boule(c: string): Layers {
  return [
    [rect(46.5, 0, 7, 14), PAL.ink],
    [poly(44, 12, 56, 12, 56, 17, 78, 32, 78, 76, 50, 100, 22, 76, 22, 32, 44, 17) + poly(30, 37, 35, 34, 35, 76, 30, 72) + poly(41, 31, 45, 29, 45, 84, 41, 81), c],
  ];
}
export const CRYSTAL = boule(PAL.red);

/** Wafer with its flat and a light die grid. */
export const WAFER: Layers = [
  ["M28.2 88A44 44 0 1 1 71.8 88Z", PAL.red],
  [rect(12, 34, 76, 3) + rect(8, 57, 84, 3) + rect(35, 10, 3, 76) + rect(62, 10, 3, 76), PAL.paper, "nz"],
];

/** Chip: square die with pins and a gold Mach-Zehnder waveguide. */
export const CHIP: Layers = [
  [[24, 40, 56, 72].map((x) => rect(x - 3.5, 6, 7, 10) + rect(x - 3.5, 84, 7, 10)).join(""), PAL.ink],
  [rect(14, 16, 72, 68), PAL.red],
  [rect(14, 47, 18, 5) + bar(30, 49.5, 40, 36.5, 5) + bar(30, 49.5, 40, 62.5, 5) + rect(40, 34, 20, 5) + rect(40, 60, 20, 5) + bar(60, 36.5, 70, 49.5, 5) + bar(60, 62.5, 70, 49.5, 5) + rect(68, 47, 18, 5), PAL.gold, "nz"],
];

/** Fat flow arrow. */
export const ARROW: Layers = [[poly(0, 40, 54, 40, 54, 22, 96, 50, 54, 78, 54, 60, 0, 60), PAL.ink]];

/** Phone: body, screen cut out, speaker slot, button. */
export const PHONE: Layers = [[`M30 4H70Q78 4 78 12V88Q78 96 70 96H30Q22 96 22 88V12Q22 4 30 4Z` + rect(27, 13, 46, 72) + rect(42, 7.5, 16, 2.4) + circ(50, 90.5, 3), PAL.ink]];

/** Acoustic filter: a slab with two interleaved gold combs; slab colour set per use. */
export function filter(slab: string, comb: string): Layers {
  let f = rect(10, 28, 80, 6) + rect(10, 66, 80, 6);
  for (const x of [16, 34, 52, 70]) f += rect(x, 34, 6, 24);
  for (const x of [25, 43, 61, 79]) f += rect(x - 1, 42, 6, 24);
  return [
    [rect(4, 22, 92, 56), slab],
    [f, comb],
  ];
}

/** Wi-Fi: a dot and three arcs. */
export const WIFI: Layers = [[circ(50, 80, 8) + sector(50, 80, 20, 31, 45, 135) + sector(50, 80, 41, 52, 45, 135) + sector(50, 80, 62, 73, 45, 135), PAL.ink]];

/** Satellite: body, two ribbed panels, a dish. */
export const SATELLITE: Layers = [
  [
    rect(40, 36, 20, 28) +
      rect(2, 40, 32, 20) +
      rect(66, 40, 32, 20) +
      rect(34, 47, 6, 6) +
      rect(60, 47, 6, 6) +
      "M38 72Q50 86 62 72Z" +
      rect(48, 64, 4, 8),
    PAL.ink,
  ],
  [rect(12.5, 40, 2.5, 20) + rect(22.5, 40, 2.5, 20) + rect(76, 40, 2.5, 20) + rect(86, 40, 2.5, 20), PAL.paper],
];

/** Radio tower: lattice mast with an antenna ball. */
export const TOWER: Layers = [
  [
    poly(47, 20, 53, 20, 76, 98, 66, 98, 50, 42, 34, 98, 24, 98) + bar(41, 58, 59, 58, 4) + bar(36, 76, 64, 76, 4) + bar(40, 58, 62, 76, 4) + bar(60, 58, 38, 76, 4) + circ(50, 13, 7),
    PAL.ink,
    "nz",
  ],
];

/** Globe: blue disc with paper meridian and parallels. */
export const GLOBE: Layers = [
  [circ(50, 50, 46), PAL.blue],
  [ell(50, 50, 20, 46) + ell(50, 50, 16.5, 42.5), PAL.paper],
  [rect(4, 48.5, 92, 3) + rect(13, 26, 74, 3) + rect(13, 71, 74, 3) + rect(48.5, 4, 3, 92), PAL.paper, "nz"],
];

/** Server rack: tall cabinet with slots. LEDs are a separate symbol so they can light up. */
export const RACK: Layers = [
  [rect(20, 4, 60, 92), PAL.ink],
  [[14, 30, 46, 62, 78].map((y) => rect(28, y, 44, 8)).join(""), PAL.paper],
];
export const RACK_LEDS = (c: string): Layers => [[[14, 30, 46, 62, 78].map((y) => rect(31, y + 2, 6, 4) + rect(40, y + 2, 6, 4)).join(""), c]];

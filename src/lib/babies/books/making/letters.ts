// Procedural manual-style lettering: a monoline geometric sans (round caps, circle bowls), condensed a little so a
// read-aloud line fits the caption band. Glyphs are SVG path strings in letter units, y down from the baseline:
// x-height 5, cap 7, ascender 7.2, descender 2. Commands M L H V C A Z, absolute only.

type Glyph = { w: number; d: string };

const O5 = "M5 -2.5A2.5 2.5 0 1 0 0 -2.5A2.5 2.5 0 1 0 5 -2.5";
const ARCH = (x: number, w: number) => `M${x} -2.7A${w / 2} ${w / 2} 0 0 1 ${x + w} -2.7V0`;

const G: Record<string, Glyph> = {
  a: { w: 5, d: O5 + "M5 -5V0" },
  b: { w: 5, d: "M0 -7.2V0" + O5 },
  c: { w: 4.6, d: "M4.42 -4.11A2.5 2.5 0 1 0 4.42 -0.89" },
  d: { w: 5, d: O5 + "M5 -7.2V0" },
  e: { w: 5, d: "M0.1 -2.5H5A2.5 2.5 0 1 0 4.42 -0.89" },
  f: { w: 3.4, d: "M3.4 -7.2A1.6 1.6 0 0 0 1.8 -5.6V0M0.2 -5H3.2" },
  g: { w: 5, d: O5 + "M5 -5V0.2A1.8 1.8 0 0 1 3.2 2H1" },
  h: { w: 4.6, d: "M0 -7.2V0" + ARCH(0, 4.6) },
  i: { w: 0, d: "M0 -5V0M0 -6.75V-6.74" },
  k: { w: 4.2, d: "M0 -7.2V0M4 -5L0 -1.6M1.5 -2.9L4.2 0" },
  l: { w: 0, d: "M0 -7.2V0" },
  m: { w: 7.6, d: "M0 -5V0M0 -3.1A1.9 1.9 0 0 1 3.8 -3.1V0M3.8 -3.1A1.9 1.9 0 0 1 7.6 -3.1V0" },
  n: { w: 4.6, d: "M0 -5V0" + ARCH(0, 4.6) },
  o: { w: 5, d: O5 },
  p: { w: 5, d: "M0 -5V2" + O5 },
  r: { w: 3, d: "M0 -5V0M0 -2.5A2.5 2.5 0 0 1 2.5 -5H3" },
  s: { w: 4.2, d: "M4 -4.3C3.6 -4.9 3 -5.1 2.2 -5.1C1 -5.1 0.3 -4.6 0.3 -3.8C0.3 -2.2 4.3 -2.9 4.3 -1.3C4.3 -0.4 3.5 0.1 2.2 0.1C1.2 0.1 0.5 -0.2 0 -0.8" },
  t: { w: 3.2, d: "M1.4 -6.6V-1.2A1.2 1.2 0 0 0 2.6 0H3.2M0 -5H3.2" },
  u: { w: 4.6, d: "M0 -5V-2.3A2.3 2.3 0 0 0 4.6 -2.3M4.6 -5V0" },
  v: { w: 4.6, d: "M0 -5L2.3 0L4.6 -5" },
  w: { w: 6.8, d: "M0 -5L1.7 0L3.4 -5L5.1 0L6.8 -5" },
  x: { w: 4.4, d: "M0 -5L4.4 0M4.4 -5L0 0" },
  y: { w: 4.8, d: "M0 -5L2.4 0.1M4.8 -5L1.4 2" },
  z: { w: 4.4, d: "M0.2 -5H4.4L0 0H4.4" },
  A: { w: 6, d: "M0 0L3 -7L6 0M1.1 -2.5H4.9" },
  C: { w: 6.2, d: "M6.18 -5.75A3.5 3.5 0 1 0 6.18 -1.25" },
  D: { w: 6, d: "M0 0V-7H2.5A3.5 3.5 0 0 1 2.5 0Z" },
  F: { w: 4.4, d: "M4.4 -7H0V0M0 -3.7H3.7" },
  I: { w: 0, d: "M0 -7V0" },
  M: { w: 6.6, d: "M0 0V-7L3.3 -2.2L6.6 -7V0" },
  N: { w: 5, d: "M0 0V-7L5 0V-7" },
  O: { w: 7, d: "M7 -3.5A3.5 3.5 0 1 0 0 -3.5A3.5 3.5 0 1 0 7 -3.5" },
  S: { w: 5.2, d: "M4.9 -6.1C4.4 -6.9 3.6 -7.2 2.6 -7.2C1.2 -7.2 0.3 -6.4 0.3 -5.3C0.3 -2.6 5.2 -4.3 5.2 -1.8C5.2 -0.6 4.2 0.1 2.7 0.1C1.6 0.1 0.6 -0.3 0 -1.1" },
  T: { w: 5.6, d: "M0 -7H5.6M2.8 -7V0" },
  Z: { w: 5, d: "M0.3 -7H5L0 0H5" },
  W: { w: 8.4, d: "M0 -7L2 0L4.2 -6.4L6.4 0L8.4 -7" },
  "1": { w: 2.4, d: "M0 -5.4L2.4 -7V0" },
  "2": { w: 5, d: "M0.3 -5.5C0.6 -6.6 1.6 -7.2 2.6 -7.2C3.9 -7.2 4.8 -6.3 4.8 -5.1C4.8 -3.4 2.6 -2.2 0 0H5" },
  "3": { w: 5, d: "M0.4 -6.6C1 -7 1.8 -7.2 2.6 -7.2C3.9 -7.2 4.7 -6.4 4.7 -5.4C4.7 -4.3 3.8 -3.7 2.4 -3.7C4 -3.7 5 -2.9 5 -1.8C5 -0.6 4 0.1 2.6 0.1C1.6 0.1 0.8 -0.2 0.1 -0.8" },
  "4": { w: 5.2, d: "M3.8 0V-7L0 -2.1H5.2" },
  ".": { w: 0, d: "M0 -0.01V0" },
  ",": { w: 0.6, d: "M0.6 -0.3L-0.2 1.5" },
  ":": { w: 0, d: "M0 -0.01V0M0 -4.3V-4.29" },
  "!": { w: 0, d: "M0 -7V-2.3M0 -0.01V0" },
};

/** Stroke width, tracking, space, horizontal condense, in letter units. */
export const STROKE = 0.95;
const TRACK = 0.95;
const SPACE = 2.5;
const SX = 0.86;

const ARGS: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, A: 7, Z: 0 };

/** Scales one glyph path to logical units: X = x0 + x*u*SX, Y = y0 + y*u. */
function place(d: string, x0: number, y0: number, u: number): string {
  const tok = d.match(/[MLHVCAZ]|-?\d*\.?\d+/g) ?? [];
  let out = "";
  let i = 0;
  const f = (n: number) => String(Math.round(n * 10) / 10);
  while (i < tok.length) {
    const c = tok[i++];
    const n = ARGS[c];
    const a = tok.slice(i, i + n).map(Number);
    i += n;
    if (c === "H") out += "H" + f(x0 + a[0] * u * SX);
    else if (c === "V") out += "V" + f(y0 + a[0] * u);
    else if (c === "A") out += `A${f(a[0] * u * SX)} ${f(a[1] * u)} 0 ${a[3]} ${a[4]} ${f(x0 + a[5] * u * SX)} ${f(y0 + a[6] * u)}`;
    else if (c === "Z") out += "Z";
    else {
      out += c;
      for (let k = 0; k < n; k += 2) out += (k ? " " : "") + f(x0 + a[k] * u * SX) + " " + f(y0 + a[k + 1] * u);
    }
  }
  return out;
}

const adv = (ch: string) => (ch === " " ? SPACE : (G[ch]?.w ?? 4) * SX + STROKE + TRACK);

/** Width of a string in logical units at x-height xh (ink edge to ink edge). */
export function measure(s: string, xh: number): number {
  let w = 0;
  for (const ch of s) w += adv(ch);
  return (w - TRACK) * (xh / 5);
}

/** Path data for one line; x = left ink edge, y = baseline. */
export function lineD(s: string, x: number, y: number, xh: number): string {
  const u = xh / 5;
  let cx = x + (STROKE / 2) * u;
  let d = "";
  for (const ch of s) {
    const g = G[ch];
    if (g) d += place(g.d, cx, y, u);
    cx += adv(ch) * u;
  }
  return d;
}

/** Greedy word wrap to maxW logical units. */
export function wrap(text: string, maxW: number, xh: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const t = cur ? cur + " " + w : w;
    if (cur && measure(t, xh) > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** True if every character of s has a glyph (dev check). */
export const covered = (s: string) => [...s].every((ch) => ch === " " || ch in G);

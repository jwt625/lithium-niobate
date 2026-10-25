// VISUAL card glyphs for the flagship instruments (code-drawn SVG, 160 x 96 view box). Geometry from data, not decoration:
// F1 isochromes at the exact z-cut ring angles for d = 1 mm, 632.8 nm (11.09, 15.75, 19.38 deg, chapter 02 acceptance values)
// inside NA 0.55; F2 poled stripes at the motif scale 2 px per um with the 1064 -> 532 nm QPM period; F6 the hexagonal prism
// with c/a = 13.863 / 5.148. F5 draws empty axes (no atlas rows are embedded here).
import { qpmPeriodSHG } from "../optics.ts";

const f = (v: number): string => v.toFixed(2);

function conoscope(): string {
  const cx = 80, cy = 48, R = 44, na = 0.55;
  const rings = [11.09, 15.75, 19.38].map((d) => (Math.sin((d * Math.PI) / 180) / na) * R);
  return `<circle cx="${cx}" cy="${cy}" r="${R}" class="g-fill"/>` + rings.map((r) => `<circle cx="${cx}" cy="${cy}" r="${f(r)}" class="g-ln"/>`).join("") +
    `<path d="M${cx - R} ${cy}H${cx + R}M${cx} ${cy - R}V${cy + R}" class="g-ink" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${R}" class="g-ln"/>`;
}

function poled(): string {
  const p = qpmPeriodSHG(1.064) * 2; // px at 2 px per um
  let d = "";
  for (let x = 8; x + p / 2 <= 152; x += p) d += `M${f(x)} 62h${f(p / 2)}v22h${f(-p / 2)}Z`;
  let c = "";
  for (let i = 0; i <= 60; i++) { const u = (i / 60 - 0.5) * 4 * Math.PI; const s = Math.abs(u) < 1e-9 ? 1 : (Math.sin(u) / u) ** 2; c += `${i ? "L" : "M"}${f(20 + i * 2)} ${f(52 - 40 * s)}`; }
  return `<path d="${d}" class="g-acc-fill"/><rect x="8" y="62" width="144" height="22" class="g-ln"/><path d="${c}" class="g-acc"/>`;
}

function mzi(): string {
  return `<rect x="34" y="16" width="92" height="10" class="g-au"/><rect x="34" y="43" width="92" height="10" class="g-au"/><rect x="34" y="70" width="92" height="10" class="g-au"/>` +
    `<path d="M4 48H24C30 48 30 34 36 34H124C130 34 130 48 136 48H156M24 48C30 48 30 62 36 62H124C130 62 130 48 136 48" class="g-ir"/>`;
}

function axes(): string {
  // crystal axes after a (YXl)128 deg rotation, orthographic view; global z = wafer normal (up), x = propagation (right)
  const t = (128 * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
  const X = [1, 0, 0], Y = [0, s, c], Z = [0, -c, s];
  const P = (v: number[]): [number, number] => [80 + 34 * (v[0] + 0.45 * v[1]), 52 - 34 * (v[2] + 0.3 * v[1])];
  const arrow = (v: number[], cls: string, lab: string): string => { const [x, y] = P(v); return `<path d="M80 52L${f(x)} ${f(y)}" class="${cls}"/><circle cx="${f(x)}" cy="${f(y)}" r="2.4" class="${cls}-dot"/><text x="${f(x + (x >= 80 ? 4 : -10))}" y="${f(y - 3)}">${lab}</text>`; };
  return `<path d="M20 70L60 86H150L110 70Z" class="g-fill g-ln"/>` + arrow(X, "g-ink", "X") + arrow(Y, "g-ink", "Y") + arrow(Z, "g-acc", "Z");
}

function scatter(): string {
  return `<path d="M20 10V82H152" class="g-ln"/>` + [0, 1, 2, 3].map((k) => `<path d="M${20 + k * 44} 82v4M16 ${82 - k * 24}h4" class="g-ln"/>`).join("") +
    `<text x="24" y="16">V&#960;L</text><text x="112" y="76">bandwidth</text>`;
}

function prism(): string {
  const a = 22, c = a * (13.863 / 5.148) * 0.62; // c/a to scale, vertical foreshortening 0.62 for the oblique view
  const cx = 80, top = 48 - c / 2, bot = 48 + c / 2, ry = 0.32;
  const hex = (y: number): [number, number][] => [0, 1, 2, 3, 4, 5].map((k) => [cx + a * Math.cos((k * Math.PI) / 3), y + a * ry * Math.sin((k * Math.PI) / 3)]);
  const T = hex(top), B = hex(bot);
  const poly = (pts: [number, number][]): string => pts.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join("") + "Z";
  const edges = [0, 1, 2, 3].map((k) => `M${f(T[k][0])} ${f(T[k][1])}L${f(B[k][0])} ${f(B[k][1])}`).join("");
  return `<path d="${poly(T)}" class="g-fill g-ln"/><path d="${edges}" class="g-ln"/><path d="${poly(B).replace(/Z$/, "")}" class="g-ln g-half"/><path d="M${cx} ${f(top - 10)}V${f(bot + 10)}" class="g-acc"/><text x="${cx + 4}" y="${f(top - 4)}">c</text>`;
}

const G: Record<string, () => string> = { F1: conoscope, F2: poled, F3: mzi, F4: axes, F5: scatter, F6: prism };
export const flagGlyph = (id: string): string => `<svg viewBox="0 0 160 96" class="p9-g">${G[id]?.() ?? ""}</svg>`;

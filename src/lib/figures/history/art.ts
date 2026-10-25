// Chapter 07 History: period-art vignettes, one per history chapter (figures.md F7.0 "Period art directions";
// DevLog-003b sec. 5 row 07). Procedural SVG (no copied figures), deterministic, drawn in a 300 x 160 viewBox.
// Colors come from CSS classes in history.css (.a-ink, .a-ink2, .a-faint, .a-spot, .a-l532, .a-ir, .a-au, .a-yel...),
// so the same markup follows theme and mode. Geometry is true where it carries physics (fringe period from the drawn
// beam angle; QPM phasor arcs; MZM eye from T = cos^2(pi V / 2 V_pi)); sizes are not to scale unless stated.
import { mzmTransmission } from "$lib/physics/modulator.ts";
import { phasorPath } from "./qpm";

const f = (v: number): string => (Math.round(v * 10) / 10).toString();
const W = 300, H = 160;
let seed = 1;
const rnd = (): number => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

/** h01: copperplate family tree (Tantalus, Niobe, Pelops; Ta, Nb) beside a 1949 drafting figure (P-E hysteresis loop). */
function h01(): string {
  let s = "";
  // engraved cartouches with hatching
  const node = (x: number, y: number, rx: number, label: string, sym = false): string => {
    let h = `<ellipse class="a-ink" cx="${x}" cy="${y}" rx="${rx}" ry="10"/>`;
    for (let k = -rx + 4; k < rx - 3; k += 3) { const dy = 10 * Math.sqrt(Math.max(0, 1 - (k / rx) ** 2)) - 1.5; h += `<line class="a-faint" x1="${f(x + k)}" y1="${f(y - dy)}" x2="${f(x + k + 2)}" y2="${f(y + dy)}"/>`; }
    return h + `<text class="${sym ? "a-sym" : "a-lab"}" x="${x}" y="${y + 3.5}" text-anchor="middle">${label}</text>`;
  };
  s += `<path class="a-ink" d="M70 34 V48 M70 48 H38 V64 M70 48 H102 V64 M38 84 V100 M70 34 C 120 40 130 90 120 108" fill="none"/>`;
  s += node(70, 24, 30, "Tantalus") + node(38, 74, 24, "Niobe") + node(102, 74, 24, "Pelops");
  s += node(38, 112, 14, "Nb", true) + node(120, 118, 14, "Ta", true);
  // drafting sheet, ruled border, title strip, hysteresis loop
  s += `<rect class="a-ink" x="160" y="14" width="128" height="132" fill="none"/><rect class="a-ink2" x="164" y="18" width="120" height="124" fill="none"/>`;
  s += `<line class="a-ink2" x1="164" y1="128" x2="284" y2="128"/><line class="a-ink2" x1="240" y1="128" x2="240" y2="142"/>`;
  const cx = 224, cy = 72, ax = 48, ay = 38;
  s += `<path class="a-ink2" d="M${cx - ax - 6} ${cy} H${cx + ax + 6} M${cx} ${cy + ay + 6} V${cy - ay - 6}" fill="none"/>`;
  let up = "", dn = "";
  for (let i = 0; i <= 40; i++) { const e = -1 + i / 20; up += `${i ? "L" : "M"}${f(cx + e * ax)} ${f(cy - ay * Math.tanh(3 * (e + 0.35)))}`; dn += `${i ? "L" : "M"}${f(cx - e * ax)} ${f(cy - ay * Math.tanh(3 * (-e - 0.35)))}`; }
  s += `<path class="a-spot" d="${up}" fill="none"/><path class="a-spot" d="${dn}" fill="none"/>`;
  s += `<text class="a-sten" x="${cx + ax + 2}" y="${cy - 4}">E</text><text class="a-sten" x="${cx + 4}" y="${cy - ay - 2}">P</text>`;
  return s;
}

/** h02: two-color line art: Czochralski puller cross-section; OPO resonator with pump and two outputs. */
function h02(): string {
  let s = "";
  // crucible, melt, boule on seed, pull rod, coil
  s += `<path class="a-ink" d="M22 96 V138 H112 V96" fill="none"/><path class="a-ink" d="M18 92 V142 H116 V92" fill="none"/>`;
  s += `<rect class="a-hatch" x="23" y="112" width="88" height="25"/><line class="a-ink" x1="23" y1="112" x2="111" y2="112"/>`;
  s += `<path class="a-spotf" d="M67 112 C 52 112 48 104 48 96 V70 C 48 62 58 56 64 50 H70 C 76 56 86 62 86 70 V96 C 86 104 82 112 67 112 Z"/>`;
  s += `<path class="a-ink" d="M67 112 C 52 112 48 104 48 96 V70 C 48 62 58 56 64 50 H70 C 76 56 86 62 86 70 V96 C 86 104 82 112 67 112 Z" fill="none"/>`;
  s += `<rect class="a-ink" x="64" y="40" width="6" height="10" fill="none"/><line class="a-ink" x1="67" y1="8" x2="67" y2="40"/><path class="a-ink" d="M60 16 L67 8 L74 16" fill="none"/>`;
  for (let y = 100; y <= 136; y += 9) s += `<circle class="a-ink2" cx="10" cy="${y}" r="3.2" fill="none"/><circle class="a-ink2" cx="124" cy="${y}" r="3.2" fill="none"/>`;
  // resonator
  s += `<path class="a-ink" d="M168 50 Q 162 80 168 110 M276 50 Q 282 80 276 110" fill="none"/>`;
  s += `<rect class="a-ink" x="204" y="68" width="36" height="24" fill="none"/>`;
  for (let k = 0; k < 6; k++) s += `<line class="a-faint" x1="${206 + k * 6}" y1="70" x2="${210 + k * 6}" y2="90"/>`;
  s += `<path class="a-spot" d="M140 80 H272" fill="none"/><path class="a-spot" d="M266 76 L274 80 L266 84" fill="none"/>`;
  s += `<path class="a-ink a-dash" d="M276 78 L296 66 M276 82 L296 94" fill="none"/>`;
  return s;
}

/** h03: computed two-beam fringes in a crystal block: period = lambda_d / (2 sin theta) for the drawn half-angle theta. */
function h03(): string {
  let s = "";
  const th = (11 * Math.PI) / 180, lamD = 2.6, P = lamD / (2 * Math.sin(th)); // drawing units; P = 6.81
  const x0 = 96, x1 = 216, y0 = 34, y1 = 130;
  for (let x = x0; x < x1; x += 1.2) { const I = Math.cos((Math.PI * (x - x0)) / P) ** 2; s += `<rect class="a-l532f" x="${f(x)}" y="${y0}" width="1.25" height="${y1 - y0}" opacity="${(0.08 + 0.72 * I).toFixed(2)}"/>`; }
  s += `<rect class="a-ink" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none"/><path class="a-ink2" d="M${x1} ${y0} l14 -12 h-120 l-14 12 M${x1 + 14} ${y0 - 12} V${y1 - 12} L${x1} ${y1}" fill="none"/>`;
  // writing beams crossing at 2 theta (drawn), reconstructed beam to the right
  const cy = (y0 + y1) / 2, t = Math.tan(th) * 80;
  s += `<path class="a-l532" d="M18 ${f(cy - t)} L${x0 + 60} ${cy} M18 ${f(cy + t)} L${x0 + 60} ${cy}" fill="none"/>`;
  s += `<path class="a-l532 a-dash" d="M${x0 + 60} ${cy} L290 ${f(cy + Math.tan(th) * 134)}" fill="none"/>`;
  s += `<path class="a-ink2" d="M40 ${f(cy - t * 0.72)} A 24 24 0 0 1 40 ${f(cy + t * 0.72)}" fill="none"/>`;
  return s;
}

/** h04: ukiyo-e ripple lines launched from IDT fingers on a 128 Y-X plate; X axis labeled. */
function h04(): string {
  let s = `<rect class="a-ink2" x="8" y="18" width="284" height="124" fill="none"/>`;
  // IDT: two bus bars, interleaved fingers (gold)
  s += `<rect class="a-auf" x="24" y="30" width="44" height="6"/><rect class="a-auf" x="24" y="124" width="44" height="6"/>`;
  for (let k = 0; k < 6; k++) { const x = 27 + k * 7; s += `<rect class="a-auf" x="${x}" y="${k % 2 ? 36 : 44}" width="2.6" height="80"/>`; }
  // ripples: crests with curls
  for (let k = 0; k < 10; k++) {
    const x = 84 + k * 20;
    s += `<path class="a-au" d="M${x} 36 C ${x + 8} 60 ${x - 6} 100 ${x + 4} 124" fill="none" opacity="${(1 - k * 0.075).toFixed(2)}"/>`;
    if (k % 3 === 0) s += `<path class="a-au" d="M${x + 1} 46 q 5 -6 9 -1 q -4 1 -3 5" fill="none" opacity="${(1 - k * 0.075).toFixed(2)}"/>`;
  }
  s += `<path class="a-ink" d="M84 150 H200 M194 146 L200 150 L194 154" fill="none"/><text class="a-lab" x="206" y="153">X</text>`;
  return s;
}

/** h05: 1970s hand-inked graph: index increase vs depth, out-diffused skin beside a Ti stripe profile; mode dashed (IR). */
function h05(): string {
  let s = "";
  const X = (d: number): number => 40 + d * 12, Y = (n: number): number => 132 - n * 92; // depth 0-20 (drawing), n 0-1
  s += `<path class="a-ink" d="M40 18 V132 H290" fill="none"/>`;
  for (let d = 0; d <= 20; d += 5) s += `<line class="a-ink" x1="${X(d)}" y1="132" x2="${X(d)}" y2="136"/>`;
  let o = "", ti = "", m = "";
  for (let i = 0; i <= 100; i++) {
    const d = i / 5, j = (rnd() - 0.5) * 0.6; // hand-inked wobble (display)
    o += `${i ? "L" : "M"}${f(X(d) + j)} ${f(Y(0.55 * Math.exp(-((d / 9) ** 2))) + j)}`;
    ti += `${i ? "L" : "M"}${f(X(d) - j)} ${f(Y(0.95 * Math.exp(-((d / 2.2) ** 2))) - j)}`;
    m += `${i ? "L" : "M"}${f(X(d))} ${f(Y(0.7 * Math.exp(-(((d - 4) / 4) ** 2))))}`;
  }
  s += `<path class="a-ink" d="${o}" fill="none"/><path class="a-ink" d="${ti}" fill="none"/><path class="a-ir a-dash" d="${m}" fill="none"/>`;
  s += `<text class="a-sten" x="46" y="26">&#916;n</text><text class="a-sten" x="250" y="150">DEPTH</text>`;
  return s;
}

/** h06: lab-notebook graph paper; domain stripe strip with the QPM phasor staircase above it. */
function h06(): string {
  let s = "";
  for (let x = 0; x <= W; x += 10) s += `<line class="a-grid" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 0; y <= H; y += 10) s += `<line class="a-grid" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  const n = 12, lc = 22, x0 = 18;
  for (let k = 0; k < n; k++) s += `<rect class="${k % 2 ? "a-domb" : "a-doma"}" x="${x0 + k * lc}" y="118" width="${lc}" height="22"/>`;
  s += `<rect class="a-ink" x="${x0}" y="118" width="${n * lc}" height="22" fill="none"/>`;
  // SH phasor: each coherence length adds a half circle; with sign reversal the half circles stack (staircase).
  // Drawn with growth (imaginary part) along the strip, one coherence length per domain width.
  const ph = phasorPath(n, true, 12);
  let p = "";
  for (let k = 0; k < ph.re.length; k++) p += `${k ? "L" : "M"}${f(x0 + (ph.im[k] / 2) * lc)} ${f(96 - ph.re[k] * 9)}`;
  s += `<path class="a-l532" d="${p}" fill="none"/><line class="a-ink2" x1="${x0}" y1="96" x2="${x0 + n * lc}" y2="96"/>`;
  return s;
}

/** h07: telecom data sheet: boxed spec table, butterfly-package outline, eye diagram from T = cos^2(pi V / 2 V_pi). */
function h07(): string {
  let s = `<rect class="a-ink" x="10" y="14" width="96" height="76" fill="none"/>`;
  for (let k = 1; k < 6; k++) s += `<line class="a-ink2" x1="10" y1="${14 + k * 12.7}" x2="106" y2="${14 + k * 12.7}"/>`;
  s += `<line class="a-ink2" x1="58" y1="14" x2="58" y2="90"/>`;
  // butterfly package
  s += `<rect class="a-ink" x="22" y="106" width="74" height="32" fill="none"/>`;
  for (let k = 0; k < 7; k++) s += `<line class="a-ink" x1="${28 + k * 10}" y1="100" x2="${28 + k * 10}" y2="106"/><line class="a-ink" x1="${28 + k * 10}" y1="138" x2="${28 + k * 10}" y2="144"/>`;
  s += `<path class="a-ir a-dash" d="M4 122 H22 M96 122 H118" fill="none"/>`;
  // eye: drive V(t) with raised-cosine transitions between levels -/+ V_pi/2 about quadrature, T from the MZM transfer
  const ex = 132, ew = 156, ey = 28, eh = 104;
  s += `<rect class="a-ink2" x="${ex}" y="${ey}" width="${ew}" height="${eh}" fill="none"/>`;
  const lv = (b: number): number => (b ? 0.5 : -0.5); // V / V_pi
  for (let pat = 0; pat < 8; pat++) {
    const b = [(pat >> 2) & 1, (pat >> 1) & 1, pat & 1];
    let d = "";
    for (let i = 0; i <= 60; i++) {
      const t = i / 30; // 0..2 bit periods, centered on bit 1
      const seg = t < 0.5 ? [b[0], b[1], t + 0.5] : t < 1.5 ? [b[1], b[1], 0] : [b[1], b[2], t - 1.5];
      const w = seg[2] as number, v = lv(seg[0] as number) + (lv(seg[1] as number) - lv(seg[0] as number)) * (0.5 - 0.5 * Math.cos(Math.PI * w));
      const T = mzmTransmission(v, 1, -Math.PI / 2);
      d += `${i ? "L" : "M"}${f(ex + (t / 2) * ew)} ${f(ey + eh - 8 - T * (eh - 16))}`;
    }
    s += `<path class="a-ink" d="${d}" fill="none" opacity="0.8"/>`;
  }
  return s;
}

/** h08: process-flow cross sections in flat cleanroom-yellow fills: implant, bond, split. */
function h08(): string {
  let s = "";
  const panel = (x: number, k: number): string => {
    let p = `<rect class="a-yel0" x="${x}" y="16" width="88" height="128"/>`;
    if (k === 0) {
      p += `<rect class="a-yel2" x="${x + 10}" y="66" width="68" height="56"/><line class="a-ink a-dash" x1="${x + 10}" y1="76" x2="${x + 78}" y2="76"/>`;
      for (let j = 0; j < 5; j++) p += `<path class="a-ink" d="M${x + 18 + j * 13} 30 V58 M${x + 15 + j * 13} 53 L${x + 18 + j * 13} 59 L${x + 21 + j * 13} 53" fill="none"/>`;
    } else if (k === 1) {
      p += `<rect class="a-yel2" x="${x + 10}" y="40" width="68" height="44"/><line class="a-ink a-dash" x1="${x + 10}" y1="74" x2="${x + 78}" y2="74"/>`;
      p += `<rect class="a-yel1" x="${x + 10}" y="84" width="68" height="8"/><rect class="a-yel3" x="${x + 10}" y="92" width="68" height="34"/>`;
    } else {
      p += `<rect class="a-yel2" x="${x + 10}" y="30" width="68" height="34"/>`;
      p += `<rect class="a-yel2" x="${x + 10}" y="80" width="68" height="4"/><rect class="a-yel1" x="${x + 10}" y="84" width="68" height="8"/><rect class="a-yel3" x="${x + 10}" y="92" width="68" height="34"/>`;
      p += `<path class="a-ink" d="M${x + 44} 66 V76 M${x + 40} 70 L${x + 44} 66 L${x + 48} 70" fill="none"/>`;
    }
    return p + `<rect class="a-ink" x="${x}" y="16" width="88" height="128" fill="none"/>`;
  };
  s += panel(8, 0) + panel(106, 1) + panel(204, 2);
  s += `<path class="a-ink" d="M97 80 h7 M101 77 l3 3 l-3 3 M195 80 h7 M199 77 l3 3 l-3 3" fill="none"/>`;
  return s;
}

/** h09: SEM false color render: grayscale procedural rib on SiO2 with one false-color (IR) mode overlay. */
function h09(): string {
  let s = `<rect class="a-sem0" x="0" y="0" width="${W}" height="${H}"/>`;
  for (let i = 0; i < 520; i++) { const x = rnd() * W, y = rnd() * H, g = rnd(); s += `<rect x="${f(x)}" y="${f(y)}" width="1.4" height="1.4" class="a-semn" opacity="${(0.15 + 0.5 * g).toFixed(2)}"/>`; }
  s += `<rect class="a-sem1" x="0" y="104" width="${W}" height="56"/>`; // oxide
  s += `<path class="a-sem2" d="M0 104 V92 H112 L124 62 H176 L188 92 H${W} V104 Z"/>`; // LN slab + rib
  s += `<path class="a-sem3" d="M112 92 L124 62 H176 L188 92" fill="none"/>`;
  s += `<ellipse class="a-irf" cx="150" cy="84" rx="40" ry="17" opacity="0.35"/><ellipse class="a-ir a-dash" cx="150" cy="84" rx="40" ry="17" fill="none"/><ellipse class="a-ir a-dash" cx="150" cy="84" rx="22" ry="9" fill="none"/>`;
  return s;
}

/** h10: 8-inch wafer map with a die grid and a flat (geometry illustrative; die count not data). */
function h10(): string {
  let s = "";
  const cx = 150, cy = 80, R = 72, d = 8;
  s += `<circle class="a-ink" cx="${cx}" cy="${cy}" r="${R}" fill="none"/><line class="a-bgline" x1="${cx - 20}" y1="${cy + R}" x2="${cx + 20}" y2="${cy + R}"/>`;
  for (let y = cy - R; y < cy + R; y += d) for (let x = cx - R; x < cx + R; x += d) {
    if ([[x, y], [x + d, y], [x, y + d], [x + d, y + d]].every(([a, b]) => (a - cx) ** 2 + (b - cy) ** 2 < (R - 3) ** 2)) s += `<rect class="a-ink2" x="${x + 0.8}" y="${y + 0.8}" width="${d - 1.6}" height="${d - 1.6}" fill="none"/>`;
  }
  return s;
}

const ART: Record<number, () => string> = { 1: h01, 2: h02, 3: h03, 4: h04, 5: h05, 6: h06, 7: h07, 8: h08, 9: h09, 10: h10 };
const LABEL: Record<number, string> = {
  1: "Family tree of the names (copperplate) and a 1949 ferroelectric hysteresis loop (drafting)",
  2: "Czochralski puller cross-section and an OPO resonator (two-color line art)",
  3: "Two-beam interference fringes written in a crystal, period from the drawn beam angle",
  4: "Interdigital transducer on a 128 Y-X plate launching surface ripples",
  5: "Index increase versus depth: out-diffused skin and Ti stripe profiles, guided mode dashed (IR, false color)",
  6: "Periodically reversed domains with the second-harmonic phasor staircase above",
  7: "Data-sheet table, butterfly package and an eye diagram from the MZM transfer function",
  8: "Implant, bond and split cross-sections",
  9: "Thin-film rib on silicon dioxide with a guided-mode overlay (IR false color)",
  10: "Wafer map with a die grid",
};

/** Full SVG element for chapter n (1-10). */
export function artSVG(n: number, cls = "hx-art"): string {
  seed = 1949 + n; // deterministic per chapter
  return `<svg class="${cls} hx-art-${n}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${LABEL[n]}">${ART[n]()}</svg>`;
}

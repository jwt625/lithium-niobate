// VISUAL specimen-sheet glyphs (port of mockup/visual.js glyphs()): static SVG strings, drawn to scale where stated.
// Pure functions of the listed values, so pages render them at build time ({@html}); no layout change on hydration.
import { spectral } from "../spectral.ts";
import { nCLN } from "../optics.ts";

const TC: Record<number, string> = { 1: "--v-text", 2: "--v-text2", 3: "--v-text3" };
const T = (x: number | string, y: number | string, s: string | number, cls = 3, extra = ""): string => `<text x="${x}" y="${y}" ${extra} fill="var(${TC[cls] || TC[3]})" font-size="13">${s}</text>`;

/** 3m stereogram, projection along c; x perpendicular to a mirror plane, so mirror traces lie along y and at +/-120 deg. */
export function glyphSym(): string {
  const cx = 74, cy = 74, R = 62, P = (deg: number, r: number): [number, number] => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
  let m = "";
  [90, 210, 330].forEach((a) => { const [x1, y1] = P(a, R), [x2, y2] = P(a + 180, R); m += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--v-text2)" stroke-width="2"/>`; });
  const poles = [65, 185, 305, 115, 235, 355].map((a) => { const [x, y] = P(a, R * 0.62); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="var(--v-text)"/>`; }).join("");
  return `<svg viewBox="0 0 280 150" role="img" aria-label="Stereogram of point group 3m"><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--v-text3)" stroke-width="1.2"/>${m}<path d="M${cx} ${cy - 8}L${cx + 7} ${cy + 4.5}H${cx - 7}Z" fill="var(--v-text)"/>${poles}
        <line x1="${cx + R + 4}" y1="${cy}" x2="${cx + R + 16}" y2="${cy}" stroke="var(--v-text3)"/>${T(cx + R + 18, cy + 4, "x")}${T(cx + 6, 10, "y")}
        <line x1="160" y1="30" x2="176" y2="30" stroke="var(--v-text2)" stroke-width="2"/>${T(184, 34, "mirror plane", 2)}
        <path d="M168 54l6 10h-12z" fill="var(--v-text)"/>${T(184, 64, "threefold axis", 2)}
        <circle cx="168" cy="90" r="4" fill="var(--v-text)"/>${T(184, 94, "6 equivalent", 2)}${T(184, 110, "directions;", 2)}${T(184, 126, "no inversion", 2)}</svg>`;
}

/** Conventional hexagonal cell to scale: a = 5.148, c = 13.863 Angstrom; rotated 28 deg about c, viewed 18 deg from the basal plane. */
export function glyphLat(): string {
  const k = 8.4, a = 5.148 * k, c = 13.863 * k, ph = (-28 * Math.PI) / 180, tl = (18 * Math.PI) / 180, o = [70, 140];
  const pr = ([x, y, z]: number[]): number[] => { const X = x * Math.cos(ph) - y * Math.sin(ph), D = x * Math.sin(ph) + y * Math.cos(ph); return [o[0] + X, o[1] - z * Math.cos(tl) - D * Math.sin(tl), D]; };
  const b = [[0, 0], [a, 0], [0, 0], [-a / 2, (a * Math.sqrt(3)) / 2]];
  b[2] = [b[1][0] + b[3][0], b[1][1] + b[3][1]];
  const P = (i: number, z: number): number[] => pr([b[i][0], b[i][1], z]);
  const far = [0, 1, 2, 3].reduce((m, i) => (P(i, 0)[2] > P(m, 0)[2] ? i : m), 0); // vertex farthest from the viewer: its edges are hidden
  const L = (p: number[], q: number[], hid: boolean): string => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="var(--v-text${hid ? 3 : 2})" stroke-width="${hid ? 1 : 1.6}"${hid ? ' stroke-dasharray="3 3"' : ""}/>`;
  let e = "";
  for (let i = 0; i < 4; i++) { const n = (i + 1) % 4; e += L(P(i, 0), P(n, 0), i === far || n === far) + L(P(i, c), P(n, c), false) + L(P(i, 0), P(i, c), i === far); }
  const p0 = P(0, 0), p1 = P(1, 0), pt = P(0, c);
  return `<svg viewBox="0 0 280 150" role="img" aria-label="Conventional hexagonal cell drawn to scale">${e}
        ${T(((p0[0] + p1[0]) / 2).toFixed(1), (Math.max(p0[1], p1[1]) + 16).toFixed(1), "a", 3, 'text-anchor="middle"')}${T((p0[0] - 10).toFixed(1), ((p0[1] + pt[1]) / 2).toFixed(1), "c", 3, 'text-anchor="end"')}
        ${T(160, 40, "c / a = 2.693", 2)}${T(160, 60, "γ = 120°", 2)}${T(160, 80, "Z = 6", 2)}${T(160, 100, "drawn to scale", 3)}</svg>`;
}

/** Temperature axis 0..1300 C: Curie 1140 C and melting 1255 C (congruent). */
export function glyphTh(): string {
  const X = (t: number): number => 16 + (t / 1300) * 510, y = 70;
  let tk = "";
  for (let t = 0; t <= 1200; t += 200) tk += `<line x1="${X(t)}" y1="${y + 4}" x2="${X(t)}" y2="${y + 10}" stroke="var(--v-text3)"/>${T(X(t), y + 26, t === 0 ? "0 °C" : t, 3, t === 0 ? 'dx="-4"' : 'text-anchor="middle"')}`;
  const mk = (t: number, lab: string, left: boolean): string => `<path d="M${X(t)} ${y - 8}l6 8-6 8-6-8z" fill="var(--v-text)"/><line x1="${X(t)}" y1="30" x2="${X(t)}" y2="${y - 9}" stroke="var(--v-text3)"/>${T(X(t), 40, lab, 1, `text-anchor="${left ? "end" : "start"}" dx="${left ? -6 : 6}"`)}`;
  const sw = (x: number, fill: string, lab: string): string => `<rect x="${x}" y="4" width="16" height="6" fill="${fill}"/>${T(x + 22, 11, lab, 3)}`;
  return `<svg viewBox="0 0 560 104" role="img" aria-label="Temperature axis with Curie and melting points">
        <defs><pattern id="g-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="var(--v-text2)" stroke-width="1.2"/></pattern></defs>
        <rect x="${X(0)}" y="${y - 3}" width="${X(1140) - X(0)}" height="6" fill="var(--v-line2)"/><rect x="${X(1140)}" y="${y - 3}" width="${X(1255) - X(1140)}" height="6" fill="url(#g-hatch)"/><rect x="${X(1255)}" y="${y - 3}" width="${X(1300) - X(1255)}" height="6" fill="var(--v-text3)"/>
        ${tk}${mk(1140, 'T<tspan baseline-shift="sub" font-size="9">c</tspan>', true)}${mk(1255, 'T<tspan baseline-shift="sub" font-size="9">m</tspan>', false)}
        ${sw(16, "var(--v-line2)", "ferroelectric")}${sw(186, "url(#g-hatch)", "paraelectric")}${sw(356, "var(--v-text3)", "melt")}</svg>`;
}

/** Transparency window 0.32-5 um on a log axis 0.2-10 um; visible part in spectral color, IR marks in declared false color. */
export function glyphTr(): string {
  const X = (l: number): number => 16 + (Math.log10(l / 0.2) / Math.log10(50)) * 520, y0 = 52, y1 = 70;
  let stops = "";
  for (let nm = 380; nm <= 780; nm += 10) stops += `<stop offset="${((X(nm / 1000) - X(0.38)) / (X(0.78) - X(0.38))).toFixed(4)}" stop-color="${spectral(nm, 1, 0.02)}"/>`;
  let tk = "";
  [0.2, 0.5, 1, 2, 5, 10].forEach((l) => { tk += `<line x1="${X(l).toFixed(1)}" y1="${y1}" x2="${X(l).toFixed(1)}" y2="${y1 + 6}" stroke="var(--v-text3)"/>${T(X(l).toFixed(1), y1 + 22, l === 10 ? "10 µm" : l, 3, `text-anchor="${l === 10 ? "end" : "middle"}"${l === 10 ? ' dx="8"' : ""}`)}`; });
  const mk = (l: number, lab: string, col: string, ir: boolean, row: number): string => `<g${ir ? ' class="ir-el"' : ""}><line x1="${X(l).toFixed(1)}" y1="${row ? 10 : 34}" x2="${X(l).toFixed(1)}" y2="${y1}" stroke="${col}" stroke-width="2"${ir ? ' stroke-dasharray="4 3"' : ""}/>${T(X(l).toFixed(1), row ? 4 : 29, lab, 2, `text-anchor="${row ? "start" : "end"}" dx="${row ? 4 : -4}"`)}</g>`;
  return `<svg viewBox="0 0 560 104" role="img" aria-label="Transparency window 0.32 to 5 micrometers on a logarithmic wavelength axis">
        <defs><linearGradient id="g-vis" gradientUnits="userSpaceOnUse" x1="${X(0.38).toFixed(1)}" x2="${X(0.78).toFixed(1)}" y1="0" y2="0">${stops}</linearGradient></defs>
        <rect x="${X(0.2)}" y="${y0}" width="${X(10) - X(0.2)}" height="${y1 - y0}" fill="var(--v-ink2)"/>
        <rect x="${X(0.32).toFixed(1)}" y="${y0}" width="${(X(5) - X(0.32)).toFixed(1)}" height="${y1 - y0}" fill="var(--v-line2)"/>
        <rect x="${X(0.38).toFixed(1)}" y="${y0}" width="${(X(0.78) - X(0.38)).toFixed(1)}" height="${y1 - y0}" fill="url(#g-vis)"/>
        ${tk}
        ${mk(0.532, "532", "var(--v-l532)", false, 0)}${mk(0.6328, "633", "var(--v-l633)", false, 1)}${mk(1.064, "1064", "var(--v-ir1064)", true, 0)}${mk(1.55, "1550", "var(--v-ir1550)", true, 1)}
        ${T(X(0.32).toFixed(1), y0 - 4, "0.32", 2, 'text-anchor="end" dx="-3"')}${T(X(5).toFixed(1), y0 - 4, "5", 2, 'dx="3"')}</svg>`;
}

/** r33 clamped (Turner 1966) vs free (Zook et al. 1967), 633 nm, one pm/V axis. */
export function glyphR33(): string {
  const X = (v: number): number => 16 + (v / 35) * 230;
  const bar = (y: number, v: number, lab: string): string => `<rect x="${X(0)}" y="${y}" width="${(X(v) - X(0)).toFixed(1)}" height="14" fill="var(--v-text2)"/>${T(X(0), y - 5, lab, 2)}${T(X(v) + 6, y + 12, v.toFixed(1), 1)}`;
  let tk = "";
  [0, 10, 20, 30].forEach((v) => { tk += `<line x1="${X(v)}" y1="84" x2="${X(v)}" y2="89" stroke="var(--v-text3)"/>${T(X(v), 104, v, 3, 'text-anchor="middle"')}`; });
  return `<svg viewBox="0 0 280 110" role="img" aria-label="r33 clamped and free">${bar(22, 30.8, "clamped (S), Turner 1966")}${bar(62, 32.2, "free (T), Zook et al. 1967")}<line x1="${X(0)}" y1="84" x2="${X(35)}" y2="84" stroke="var(--v-text3)"/>${tk}${T(X(35), 104, "pm/V", 3, 'dx="2"')}</svg>`;
}

/** Coercive field 21 kV/mm against the conoscope field range 0-5 kV/mm. */
export function glyphEc(): string {
  const X = (v: number): number => 16 + (v / 25) * 240;
  let tk = "";
  [0, 5, 10, 15, 20, 25].forEach((v) => { tk += `<line x1="${X(v)}" y1="60" x2="${X(v)}" y2="65" stroke="var(--v-text3)"/>${T(X(v), 80, v, 3, 'text-anchor="middle"')}`; });
  return `<svg viewBox="0 0 280 104" role="img" aria-label="Coercive field compared with the conoscope field range">
        <rect x="${X(0)}" y="40" width="${X(5) - X(0)}" height="14" fill="var(--v-l532)" fill-opacity="0.35"/><line x1="${X(0)}" y1="60" x2="${X(25)}" y2="60" stroke="var(--v-text3)"/>${tk}
        <path d="M${X(21)} 30l6 8-6 8-6-8z" fill="var(--v-text)"/>${T(X(21), 22, 'E<tspan baseline-shift="sub" font-size="9">c</tspan>', 1, 'text-anchor="middle"')}
        ${T(X(0), 32, 'conoscope range, 24% of E<tspan baseline-shift="sub" font-size="9">c</tspan>', 2)}${T(X(25), 98, "kV/mm", 3, 'text-anchor="end"')}</svg>`;
}

/** Density: 1 cm^3 = 4.643 g (derived from 4642.8 kg/m^3). */
export function glyphRho(): string {
  const s = 54, o = [40, 88], d = [22, -16];
  const qp = (x: number, y: number): string => `${(o[0] + x).toFixed(1)} ${(o[1] + y).toFixed(1)}`;
  return `<svg viewBox="0 0 280 104" role="img" aria-label="One cubic centimeter of LN">
        <path d="M${qp(0, 0)}L${qp(s, 0)}L${qp(s, -s)}L${qp(0, -s)}Z" fill="var(--v-ln)" fill-opacity="0.22" stroke="var(--v-text2)" stroke-width="1.4"/>
        <path d="M${qp(0, -s)}L${qp(d[0], -s + d[1])}L${qp(s + d[0], -s + d[1])}L${qp(s, -s)}M${qp(s + d[0], -s + d[1])}L${qp(s + d[0], d[1])}L${qp(s, 0)}" fill="none" stroke="var(--v-text2)" stroke-width="1.4"/>
        ${T(o[0] + s / 2, o[1] + 16, "1 cm", 3, 'text-anchor="middle"')}${T(150, 50, "1 cm³ = 4.643 g", 1)}${T(150, 70, "derived", 3)}</svg>`;
}

/** Thermal conductivity: heat flux for 1 K across 1 mm, q = k dT / L = 3.92 kW/m^2 (derived). */
export function glyphK(): string {
  return `<svg viewBox="0 0 280 104" role="img" aria-label="Heat flux through a 1 mm LN slab with 1 K difference">
        <rect x="56" y="18" width="34" height="70" fill="var(--v-ln)" fill-opacity="0.22" stroke="var(--v-text2)" stroke-width="1.4"/>
        ${[30, 53, 76].map((y) => `<path d="M20 ${y}H120M120 ${y}l-6-3.5M120 ${y}l-6 3.5" stroke="var(--v-text3)" stroke-width="1.2" fill="none"/>`).join("")}
        ${T(73, 102, "1 mm", 3, 'text-anchor="middle"')}${T(150, 36, "1 K across 1 mm:", 2)}${T(150, 56, "q = 3.92 kW/m²", 1)}${T(150, 76, "q = k ΔT / L, derived", 3)}</svg>`;
}

/** JSON twin of the data record (n_e at 1550 nm, CLN), HTML with key spans. `multiline` = TECH layout. */
export function recordJSON(multiline: boolean): string {
  const ne = nCLN("e", 1.55);
  const J = (k: string, v: string): string => `  <span class="k">"${k}"</span>: ${v}`;
  const cond = multiline ? ["{", '    <span class="k">"wavelength_nm"</span>: 1550,', '    <span class="k">"temperature_C"</span>: 21', "  },"].join("\n") : '{"wavelength_nm": 1550, "temperature_C": 21},';
  return ["{", J("property", '"refractive_index_extraordinary"') + ",", J("variant", '"cln"') + ",", J("value", ne.toFixed(4)) + ",", J("unit", '{"ucum": "1"}') + ",",
    multiline ? J("conditions", cond) : J("conditions", cond), J("model", '"zelmon1997-cln-e"') + ",", J("doi", '"10.1364/JOSAB.14.003319"') + ",", J("status", '"P-db"') + ",", J("role", '"derived"'), "}"].join("\n");
}

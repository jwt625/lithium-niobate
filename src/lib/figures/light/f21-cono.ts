// F2-01 Conoscope, chapter 2.1 L1: z-cut LN plate between crossed polarizers (P along x, A along y), NA 0.55, field E
// along crystal x or y with the full 3m Pockels tensor of the chosen coefficient set (r22 splits the in-plane indices, r51
// tilts the axes). Every frame uses the exact plane-wave retardance (crystaloptics.conoscope, "exact"): a quick frame at
// reduced resolution on input, the full frame in a worker once input settles. Readouts: ellipsoid.opticAxisTilt (exact
// eigen-decomposition plus first-order checks) and ellipsoid.ringAngle (exact dark-ring angles), all at 632.8 nm.
// TECH: grayscale eyepiece with a 5-degree reticle, dark-ring ticks and optic-axis marks; VISUAL: optical bench + eyepiece.
import { conoscope, impermeability, mockupSpectrum } from "$lib/physics/crystaloptics.ts";
import { opticAxisTilt, ringAngle, ringAngles } from "$lib/physics/ellipsoid.ts";
import { r3m } from "$lib/physics/tensors.ts";
import type { Vec3 } from "$lib/physics/linalg.ts";
import { nCLN } from "../optics.ts";
import { FS, pad } from "../fmt.ts";
import { SETS21, SET_LABEL, e3, fw, type SetKey } from "./f21-common.ts";
import { spectral, spectralLin } from "../spectral.ts";

export const NA = 0.55;
export const LAM = 0.6328;
export interface Cono21 { d: number; E: number; dir: "x" | "y"; src: "mono" | "white" | null; set: SetKey; lam: number }
/** Shared state of both variants (thickness mm, field kV/mm, direction, source: null = mode default, coefficient set,
 *  monochromatic source wavelength um). */
export const c21: Cono21 = { d: 1.0, E: 0, dir: "x", src: null, set: "kaminow", lam: LAM };
export const LAM_MIN = 0.4, LAM_MAX = 0.7;

const SPECTRUM = mockupSpectrum();
const WSUM = [0, 1, 2].map((c) => SPECTRUM.reduce((a, s) => a + s.w[c], 0));

export interface FrameOpts { d: number; E: number; dir: "x" | "y"; white: boolean; mono: boolean; set: SetKey; lam: number }

/** RGBA pixels of the figure (size x size). Tone mapping as the landing conoscope (gamma 0.8, gain 1.6, rim 55%). */
export function cono21RGBA(size: number, o: FrameOpts): Uint8ClampedArray<ArrayBuffer> {
  const S = SETS21[o.set];
  const r = r3m({ r13: S.r13 * 1e-12, r22: S.r22 * 1e-12, r33: S.r33 * 1e-12, r51: S.r51 * 1e-12 });
  const E: Vec3 = o.dir === "x" ? [o.E * 1e6, 0, 0] : [0, o.E * 1e6, 0];
  // monochromatic source: display weights = computed spectral color of the source wavelength (gray in TECH)
  const wl = (o.mono ? [1, 1, 1] : spectralLin(o.lam * 1000)) as [number, number, number];
  const samples = o.white ? SPECTRUM : [{ lam: o.lam, w: wl }];
  const wm = Math.max(...wl, 1e-6), sw = o.white ? WSUM : [wm, wm, wm]; // keep the hue: normalize by the largest channel
  const N = size * size, acc = new Float64Array(N * 3), I = new Float32Array(N);
  for (const s of samples) {
    const no = nCLN("o", s.lam), ne = nCLN("e", s.lam);
    conoscope({ size, thickness_um: o.d * 1e3, lam_um: s.lam, NA, B: impermeability(no, ne, r, E), retardance: "exact" }, I);
    for (let p = 0; p < N; p++) { const v = I[p]; acc[3 * p] += v * s.w[0]; acc[3 * p + 1] += v * s.w[1]; acc[3 * p + 2] += v * s.w[2]; }
  }
  const out = new Uint8ClampedArray(N * 4), half = size / 2;
  for (let y = 0; y < size; y++) {
    const v = (half - y - 0.5) / half;
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5 - half) / half, r2 = u * u + v * v, p = y * size + x, i = 4 * p;
      out[i + 3] = 255;
      if (r2 > 1) continue;
      const edge = r2 > 0.985 ? 0.55 : 1;
      let R = 255 * Math.pow(acc[3 * p] / sw[0], 0.8) * edge * 1.6, G = 255 * Math.pow(acc[3 * p + 1] / sw[1], 0.8) * edge * 1.6, B = 255 * Math.pow(acc[3 * p + 2] / sw[2], 0.8) * edge * 1.6;
      if (o.mono && o.white) { const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B; R = G = B = Y; }
      out[i] = Math.min(255, R); out[i + 1] = Math.min(255, G); out[i + 2] = Math.min(255, B);
    }
  }
  return out;
}

// ---------- readouts ----------
export interface Cono21Ro { dn: string; ret: string; tilt: string; tiltFO: string; state: string; ring: string; axis: string }
export function cono21Numbers(st: Cono21) {
  const no = nCLN("o", st.lam), ne = nCLN("e", st.lam);
  const t = opticAxisTilt({ E_V_per_m: st.E * 1e6, dir: st.dir, eo: SETS21[st.set], no, ne, lam_um: st.lam, d_mm: st.d });
  const ring = ringAngle(st.d, st.lam, 1, no, ne);
  return { t, ring, no, ne };
}
export function cono21Readout(st: Cono21): Cono21Ro {
  const { t, ring } = cono21Numbers(st);
  const on = st.E > 0;
  return {
    dn: e3(t.dn_z),
    ret: `${fw(t.retardance_z, 3, 6)} rad`,
    tilt: `${(on ? "+" : "") + t.tiltExt_deg.toFixed(2)}°`.padStart(7, FS),
    tiltFO: `${(on ? "+" : "") + t.tiltExt_firstOrder_deg.toFixed(2)}°`.padStart(7, FS),
    state: on ? "biaxial " : "uniaxial",
    ring: `${fw(ring, 2, 5)}°`,
    axis: on ? `${fw(t.inPlaneAxis_deg, 1, 5)}°` : `${pad("–", 5)}°`,
  };
}

// ---------- TECH overlay: reticle, ring ticks (E = 0 exact angles), optic-axis marks ----------
const R0 = 46; // eyepiece radius in the 100 x 100 overlay
const rOf = (s: number): number => (s / NA) * R0;
/** Source wavelength label, fixed width ("632.8 nm"). */
export const lamLabel = (lam: number): string => `${(lam * 1000).toFixed(1)} nm`;

export function cono21Overlay(st: Cono21): string {
  const no = nCLN("o", st.lam), ne = nCLN("e", st.lam);
  let g = `<circle class="rc" cx="50" cy="50" r="${R0}"/><line class="rx" x1="${50 - R0}" x2="${50 + R0}" y1="50" y2="50"/><line class="rx" x1="50" x2="50" y1="${50 - R0}" y2="${50 + R0}"/>`;
  for (let a = 5; a <= 33; a += 5) {
    const rr = rOf(Math.sin((a * Math.PI) / 180)), L = a % 10 === 0 ? 2.4 : 1.4;
    g += `<line class="rt" x1="${(50 + rr).toFixed(2)}" x2="${(50 + rr).toFixed(2)}" y1="${(50 - L).toFixed(2)}" y2="${(50 + L).toFixed(2)}"/><line class="rt" y1="${(50 - rr).toFixed(2)}" y2="${(50 - rr).toFixed(2)}" x1="${(50 - L).toFixed(2)}" x2="${(50 + L).toFixed(2)}"/>`;
    if (a % 10 === 0) g += `<text class="rl" x="${(50 + rr).toFixed(2)}" y="${(50 + 6).toFixed(2)}" text-anchor="middle">${a}°</text>`;
  }
  // exact dark-ring angles at E = 0 for this thickness, ticks below the axis on the -x side
  for (const a of ringAngles(st.d, st.lam, 12, no, ne)) {
    const s = Math.sin((a * Math.PI) / 180);
    if (s > NA) break;
    const rr = rOf(s);
    g += `<line class="rg" x1="${(50 - rr).toFixed(2)}" x2="${(50 - rr).toFixed(2)}" y1="51" y2="54"/>`;
  }
  if (st.E > 0) {
    const t = opticAxisTilt({ E_V_per_m: st.E * 1e6, dir: st.dir, eo: SETS21[st.set], no, ne, lam_um: st.lam, d_mm: st.d });
    const a = t.axes[0], h = Math.hypot(a[0], a[1]) || 1, sx = Math.sin((t.tiltExt_deg * Math.PI) / 180);
    const ux = (a[0] / h) * rOf(sx), uy = (a[1] / h) * rOf(sx);
    for (const k of [1, -1]) {
      const x = 50 + k * ux, y = 50 - k * uy;
      g += `<path class="oa" d="M${(x - 2).toFixed(2)} ${y.toFixed(2)}H${(x + 2).toFixed(2)}M${x.toFixed(2)} ${(y - 2).toFixed(2)}V${(y + 2).toFixed(2)}"/>`;
    }
  }
  return g;
}

// ---------- VISUAL bench drawing (state-driven: beam color = source, plate width = d, E arrow length/direction) ----------
export function bench21SVG(st: Cono21, compact: boolean): string {
  const src = st.src || "white";
  const C = src === "white" ? "var(--v-text)" : spectral(st.lam * 1000, 1, 0.04);
  const w = 8 + ((st.d - 0.2) / 1.8) * 30, px = 360;
  const eLen = (st.E / 5) * 15, ex = st.dir === "x" ? [eLen, 0] : [0, -eLen];
  const beam = (pts: number[][], o: number): string => `<path d="M${pts.map((p) => p.join(" ")).join("L")}Z" fill="${C}" fill-opacity="${o}"/>`;
  const up = (x: number, y: number): number[] => [x, 150 - y], dn = (x: number, y: number): number[] => [x, 150 + y];
  const seg = (xs: number[][]): number[][] => [...xs.map(([x, y]) => up(x, y)), ...[...xs].reverse().map(([x, y]) => dn(x, y))];
  const lens = (x: number, hh: number, k: number): string => `<path d="M${x} ${150 - hh}Q${x + k} 150 ${x} ${150 + hh}Q${x - k} 150 ${x} ${150 - hh}Z" fill="var(--v-sio2)" stroke="var(--v-text2)" stroke-width="1.2"/>`;
  const inset = (x: number, lab: string, body: string): string => `<g transform="translate(${x} 46)"><circle r="19" fill="var(--v-ink0)" stroke="var(--v-line2)" stroke-width="1.2"/>${body}<text x="25" y="-10" class="lb3">${lab}</text></g>`;
  const dbl = (dx: number, dy: number): string => `<path d="M${-dx} ${-dy}L${dx} ${dy}" stroke="var(--v-text)" stroke-width="1.6"/>`;
  const arrowE = st.E > 0
    ? `<path d="M${-ex[0]} ${-ex[1]}L${ex[0]} ${ex[1]}" stroke="var(--v-au)" stroke-width="2"/><path d="M${ex[0]} ${ex[1]}l${st.dir === "x" ? "-5 -3.5" : "-3.5 5"}M${ex[0]} ${ex[1]}l${st.dir === "x" ? "-5 3.5" : "3.5 5"}" stroke="var(--v-au)" stroke-width="2" fill="none"/>`
    : `<circle r="2" fill="var(--v-text3)"/>`;
  const labels: [number, string, string][] = [[50, "Lamp", src === "white" ? "white" : `${(st.lam * 1000).toFixed(1)} nm`], [150, "Polarizer", "P along x"], [250, "Condenser", `NA ${NA}`], [px, "LN plate", `z-cut, ${st.d.toFixed(2)} mm`], [470, "Objective", ""], [570, "Analyzer", "A along y"], [670, "Bertrand lens", ""]];
  const lab = labels.map(([x, a, b], k) => {
    const y = compact ? (k % 2 ? 282 : 252) : 252;
    return `<text x="${x}" y="${y}" text-anchor="middle" class="lb">${a}</text>${!compact && b ? `<text x="${x}" y="${y + 20}" text-anchor="middle" class="lb2">${b}</text>` : ""}`;
  }).join("");
  return `<style>.lb{font:500 ${compact ? 24 : 15}px var(--v-ui);fill:var(--v-text2)}.lb2{font:400 13px var(--v-ui);fill:var(--v-text3)}.lb3{font:500 ${compact ? 22 : 14}px var(--v-ui);fill:var(--v-text2)}</style>
    <line x1="20" y1="150" x2="860" y2="150" stroke="var(--v-line)" stroke-dasharray="4 4"/>
    ${beam(seg([[72, 20], [146, 34]]), 0.2)}${beam(seg([[154, 35], [250, 46], [px, 3], [470, 46], [566, 46]]), 0.13)}${beam(seg([[574, 46], [670, 46], [800, 6]]), 0.07)}
    <circle cx="50" cy="150" r="22" fill="${C}" fill-opacity="0.18" stroke="var(--v-text2)" stroke-width="1.2"/><path d="M38 150l4-6 4 12 4-12 4 12 4-6" fill="none" stroke="${C}" stroke-width="1.4"/>
    <rect x="146" y="92" width="8" height="116" fill="var(--v-ink2)" stroke="var(--v-text2)" stroke-width="1.2"/>
    ${lens(250, 52, 13)}
    <rect x="${(px - w / 2 - 6).toFixed(1)}" y="84" width="${(w + 12).toFixed(1)}" height="13" fill="var(--v-au)"/><rect x="${(px - w / 2 - 6).toFixed(1)}" y="203" width="${(w + 12).toFixed(1)}" height="13" fill="var(--v-au)"/>
    <rect x="${(px - w / 2).toFixed(1)}" y="98" width="${w.toFixed(1)}" height="104" fill="var(--v-ln)" fill-opacity="0.28" stroke="var(--v-ln)" stroke-width="1.2"/>
    <path d="M${px - 30} 226H${px + 30}M${px + 30} 226l-6-3.5M${px + 30} 226l-6 3.5" stroke="var(--v-text3)" stroke-width="1.2" fill="none"/><text x="${px + 36}" y="230" class="lb2" style="font-style:italic">c</text>
    ${lens(470, 52, 13)}
    <rect x="566" y="92" width="8" height="116" fill="var(--v-ink2)" stroke="var(--v-text2)" stroke-width="1.2"/>
    ${lens(670, 40, 9)}
    <path d="M806 150H856M856 150l-8-5M856 150l-8 5" stroke="var(--v-text2)" stroke-width="1.6" fill="none"/>
    ${inset(150, "P", dbl(12, 0))}${inset(px, "E", arrowE)}${inset(570, "A", dbl(0, 12))}
    ${lab}`;
}

export const SET_HEAD = (k: SetKey): string => `${SET_LABEL[k]}: r<sub>22</sub> ${SETS21[k].r22} pm/V, r<sub>51</sub> ${SETS21[k].r51} pm/V`;

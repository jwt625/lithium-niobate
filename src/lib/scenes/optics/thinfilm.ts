// Thin-film interference colour of an LNOI stack (air / LN film / SiO2 / Si), pure and deterministic.
//
// Model: characteristic-matrix (Abeles) transfer matrix, s and p, coherent in every layer, Si handle semi-infinite.
// Uniaxial LN film with its optic axis along a principal direction (exact for these cases):
//   z-cut (c normal to the film): s sees n_o; p sees eps_t = n_o^2, eps_n = n_e^2.
//   x-cut, plane of incidence containing c ("par"): s (E along y) sees n_o; p sees eps_t = n_e^2 (along c), eps_n = n_o^2.
//   x-cut, plane of incidence perpendicular to c ("perp"): s (E along c) sees n_e; p sees n_o (isotropic in that plane).
// Normal wave-vector and admittance (units of k0 and of the vacuum admittance):
//   s: q = sqrt(eps_s - sin^2 th), eta = q;   p: q = sqrt(eps_t (1 - sin^2 th / eps_n)), eta = eps_t / q.
// Unpolarized reflectance R = (R_s + R_p) / 2. Other azimuths are interpolated, R(phi) = cos^2 phi R_par + sin^2 phi R_perp
// (exact at normal incidence; a 4x4 Berreman solution is not implemented).
//
// Colour: R(lambda) on 400-780 nm (2 nm) against the CIE 1931 2-degree colour-matching functions (multi-lobe fit,
// Wyman, Sloan, Shirley, JCGT 2(2), 1 (2013), the same fit as src/lib/figures/spectral.ts), equal-energy illuminant,
// XYZ -> linear sRGB, each channel divided by its value for R = 1 (site convention, DevLog-003b sec. 3.2), sRGB gamma.
// 400 nm is the lower limit of the Zelmon fit; the colour-matching weight below 400 nm is small and is omitted.
import { nkSi, nLN, nSiO2 } from "./nk.ts";
import type { LnMaterial } from "./nk.ts";

export type Cut = "x" | "z";
export type Azimuth = "par" | "perp";
export type RGB = [number, number, number];

export const LAM0_NM = 400;
export const LAM1_NM = 780;
export const DLAM_NM = 2;
export const NLAM = (LAM1_NM - LAM0_NM) / DLAM_NM + 1;

export interface Tables {
  material: LnMaterial;
  lam: Float64Array; // nm
  no: Float64Array;
  ne: Float64Array;
  nox: Float64Array;
  siRe: Float64Array; // Re(eps_Si)
  siIm: Float64Array; // Im(eps_Si)
  cmf: Float64Array; // 3 per lambda, x y z
  white: RGB; // linear sRGB of R = 1 (before normalization)
}

const cache = new Map<LnMaterial, Tables>();

const lobe = (x: number, mu: number, s1: number, s2: number): number => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
/** CIE 1931 2-degree colour-matching functions, Wyman-Sloan-Shirley 2013 multi-lobe fit. */
export function cmf1931(nm: number): RGB {
  return [
    1.056 * lobe(nm, 599.8, 37.9, 31.0) + 0.362 * lobe(nm, 442.0, 16.0, 26.7) - 0.065 * lobe(nm, 501.1, 20.4, 26.2),
    0.821 * lobe(nm, 568.8, 46.9, 40.5) + 0.286 * lobe(nm, 530.9, 16.3, 31.1),
    1.217 * lobe(nm, 437.0, 11.8, 36.0) + 0.681 * lobe(nm, 459.0, 26.0, 13.8),
  ];
}
const xyzToLin = (X: number, Y: number, Z: number): RGB => [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
export const encodeSrgb = (c: number): number => { c = Math.min(1, Math.max(0, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
export const hexOf = (lin: RGB): string => "#" + lin.map((c) => Math.round(encodeSrgb(c) * 255).toString(16).padStart(2, "0")).join("");

/** Wavelength tables for one LN material (cached). */
export function tables(material: LnMaterial = "CLN"): Tables {
  const hit = cache.get(material);
  if (hit) return hit;
  const lam = new Float64Array(NLAM), no = new Float64Array(NLAM), ne = new Float64Array(NLAM), nox = new Float64Array(NLAM);
  const siRe = new Float64Array(NLAM), siIm = new Float64Array(NLAM), cmf = new Float64Array(3 * NLAM);
  let X = 0, Y = 0, Z = 0;
  for (let i = 0; i < NLAM; i++) {
    const L = LAM0_NM + i * DLAM_NM;
    lam[i] = L;
    const ln = nLN(material, L / 1000);
    no[i] = ln.o; ne[i] = ln.e; nox[i] = nSiO2(L / 1000);
    const [n, k] = nkSi(L);
    siRe[i] = n * n - k * k; siIm[i] = 2 * n * k;
    const c = cmf1931(L);
    cmf[3 * i] = c[0]; cmf[3 * i + 1] = c[1]; cmf[3 * i + 2] = c[2];
    X += c[0]; Y += c[1]; Z += c[2];
  }
  const t: Tables = { material, lam, no, ne, nox, siRe, siIm, cmf, white: xyzToLin(X, Y, Z) };
  cache.set(material, t);
  return t;
}

export interface Stack {
  cut: Cut;
  film_nm: number;
  box_nm: number;
}

// complex principal square root of (a + i b), Im >= 0 when b >= 0
function csqrt(a: number, b: number): [number, number] {
  const m = Math.hypot(a, b);
  const re = Math.sqrt(Math.max(0, (m + a) / 2));
  const im = Math.sqrt(Math.max(0, (m - a) / 2));
  return [re, b < 0 ? -im : im];
}

/** Reflectance (power) at sample i of the tables for polarization s or p, incidence sine s0 (in air), azimuth. */
export function reflectance(T: Tables, i: number, stack: Stack, s0: number, pol: "s" | "p", az: Azimuth): number {
  const s2 = s0 * s0, c0 = Math.sqrt(Math.max(0, 1 - s2));
  const no2 = T.no[i] ** 2, ne2 = T.ne[i] ** 2, ox2 = T.nox[i] ** 2;
  const k0 = (2 * Math.PI) / T.lam[i]; // 1/nm
  // ambient admittance
  const eta0 = pol === "s" ? c0 : 1 / Math.max(c0, 1e-9);
  // LN film principal permittivities seen by this polarization
  let qf: number, etaf: number;
  if (pol === "s") {
    const es = T_cutS(stack.cut, az, no2, ne2);
    qf = Math.sqrt(Math.max(0, es - s2)); etaf = qf;
  } else {
    const [et, en] = T_cutP(stack.cut, az, no2, ne2);
    qf = Math.sqrt(Math.max(0, et * (1 - s2 / en))); etaf = et / qf;
  }
  // oxide (isotropic)
  const qo = Math.sqrt(Math.max(0, ox2 - s2)), etao = pol === "s" ? qo : ox2 / qo;
  // substrate (complex)
  const [qr, qi] = csqrt(T.siRe[i] - s2, T.siIm[i]);
  let er: number, ei: number;
  if (pol === "s") { er = qr; ei = qi; } else { const d = qr * qr + qi * qi; er = (T.siRe[i] * qr + T.siIm[i] * qi) / d; ei = (T.siIm[i] * qr - T.siRe[i] * qi) / d; }
  // layer matrices (real delta, real eta): [[c, i s/eta], [i eta s, c]]
  const df = k0 * qf * stack.film_nm, dox = k0 * qo * stack.box_nm;
  const cf = Math.cos(df), sf = Math.sin(df), co = Math.cos(dox), so = Math.sin(dox);
  // M = Mf * Mo; entries written as complex (re, im)
  // Mf = [[cf, i sf/etaf], [i etaf sf, cf]], Mo = [[co, i so/etao], [i etao so, co]]
  const m11r = cf * co - (sf / etaf) * (etao * so), m11i = 0;
  const m12r = 0, m12i = (cf * so) / etao + (sf / etaf) * co;
  const m21r = 0, m21i = etaf * sf * co + cf * etao * so;
  const m22r = cf * co - etaf * sf * (so / etao), m22i = 0;
  // B = M11 + M12 eta_s, C = M21 + M22 eta_s
  const Br = m11r + (m12r * er - m12i * ei), Bi = m11i + (m12r * ei + m12i * er);
  const Cr = m21r + (m22r * er - m22i * ei), Ci = m21i + (m22r * ei + m22i * er);
  // r = (eta0 B - C) / (eta0 B + C)
  const nr = eta0 * Br - Cr, ni = eta0 * Bi - Ci, dr = eta0 * Br + Cr, di = eta0 * Bi + Ci;
  return (nr * nr + ni * ni) / (dr * dr + di * di);
}
function T_cutS(cut: Cut, az: Azimuth, no2: number, ne2: number): number {
  return cut === "x" && az === "perp" ? ne2 : no2;
}
function T_cutP(cut: Cut, az: Azimuth, no2: number, ne2: number): [number, number] {
  if (cut === "z") return [no2, ne2];
  return az === "par" ? [ne2, no2] : [no2, no2];
}

/** Unpolarized reflectance spectrum at incidence angle theta (rad) and azimuth weight w = sin^2(phi) (0 = par, 1 = perp). */
export function spectrum(stack: Stack, theta: number, w = 0.5, material: LnMaterial = "CLN", out?: Float64Array): Float64Array {
  const T = tables(material), R = out ?? new Float64Array(NLAM), s0 = Math.sin(theta);
  for (let i = 0; i < NLAM; i++) {
    const par = 0.5 * (reflectance(T, i, stack, s0, "s", "par") + reflectance(T, i, stack, s0, "p", "par"));
    const perp = stack.cut === "z" ? par : 0.5 * (reflectance(T, i, stack, s0, "s", "perp") + reflectance(T, i, stack, s0, "p", "perp"));
    R[i] = (1 - w) * par + w * perp;
  }
  return R;
}

/** Linear sRGB of a reflectance spectrum (white-normalized, unclamped; negative = out of gamut). */
export function colorOf(R: Float64Array, material: LnMaterial = "CLN"): RGB {
  const T = tables(material);
  let X = 0, Y = 0, Z = 0;
  for (let i = 0; i < NLAM; i++) { X += R[i] * T.cmf[3 * i]; Y += R[i] * T.cmf[3 * i + 1]; Z += R[i] * T.cmf[3 * i + 2]; }
  const l = xyzToLin(X, Y, Z);
  return [l[0] / T.white[0], l[1] / T.white[1], l[2] / T.white[2]];
}

/** Luminous reflectance (CIE Y weighted mean of R). */
export function luminousR(R: Float64Array, material: LnMaterial = "CLN"): number {
  const T = tables(material);
  let Y = 0, W = 0;
  for (let i = 0; i < NLAM; i++) { Y += R[i] * T.cmf[3 * i + 1]; W += T.cmf[3 * i + 1]; }
  return Y / W;
}

export interface Lut {
  nFilm: number;
  nAngle: number;
  filmMin: number;
  filmMax: number;
  maxAngle: number; // rad
  /** linear sRGB, layout [az (0 par, 1 perp)][film][angle][rgb], clamped to [0, 1] */
  data: Float32Array;
}

/** Colour lookup table over film thickness and incidence angle, for both principal azimuths. */
export function buildLut(o: { cut: Cut; box_nm: number; filmMin: number; filmMax: number; nFilm: number; nAngle: number; maxAngleDeg: number; material?: LnMaterial }): Lut {
  const mat = o.material ?? "CLN", T = tables(mat), maxAngle = (o.maxAngleDeg * Math.PI) / 180;
  const data = new Float32Array(2 * o.nFilm * o.nAngle * 3), R = new Float64Array(NLAM);
  const st: Stack = { cut: o.cut, film_nm: 0, box_nm: o.box_nm };
  for (let a = 0; a < 2; a++) {
    const az: Azimuth = a === 0 ? "par" : "perp";
    for (let f = 0; f < o.nFilm; f++) {
      st.film_nm = o.nFilm === 1 ? o.filmMin : o.filmMin + ((o.filmMax - o.filmMin) * f) / (o.nFilm - 1);
      for (let g = 0; g < o.nAngle; g++) {
        const s0 = Math.sin((maxAngle * g) / Math.max(1, o.nAngle - 1));
        for (let i = 0; i < NLAM; i++) R[i] = 0.5 * (reflectance(T, i, st, s0, "s", az) + reflectance(T, i, st, s0, "p", az));
        const c = colorOf(R, mat), k = 3 * ((a * o.nFilm + f) * o.nAngle + g);
        data[k] = Math.min(1, Math.max(0, c[0])); data[k + 1] = Math.min(1, Math.max(0, c[1])); data[k + 2] = Math.min(1, Math.max(0, c[2]));
      }
    }
  }
  return { nFilm: o.nFilm, nAngle: o.nAngle, filmMin: o.filmMin, filmMax: o.filmMax, maxAngle, data };
}

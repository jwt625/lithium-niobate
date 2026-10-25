// Crystal optics: index ellipsoid with the full 3m r tensor and an arbitrary field; exact principal indices and axes;
// eigen-indices for any wave-normal direction; optic-axis angle 2V; walk-off; conoscope figures.
//
// Model (Yariv and Yeh 1984, ch. 7; Born and Wolf, crystal optics):
//   B = B0 + dB, B0 = diag(1/no^2, 1/no^2, 1/ne^2), dB_I = sum_k r_Ik E_k (I = xx, yy, zz, yz, xz, xy).
//   Principal indices n_i = 1/sqrt(eig_i(B)) (exact symmetric eigen-decomposition, Jacobi).
//   For wave normal k, the D eigenpolarizations and indices come from the 2x2 projection of B onto the plane
//   normal to k (exact for the wave-normal index surface).
// Pockels coefficients are taken as wavelength independent inside one call (633 nm sets; no 1550 nm data, R14 sec. 2.5).
import { cross3, dot3, eigSym2, eigSym3, matMul3, matVec3, normalize3, transpose3 } from "./linalg.ts";
import type { Mat3, Vec3 } from "./linalg.ts";
import type { Matrix } from "./tensors.ts";

/** Impermeability tensor (dimensionless) for indices no, ne, EO matrix r (6x3, m/V) and field E (V/m), crystal frame. */
export function impermeability(no: number, ne: number, r?: Matrix, E?: Vec3): Mat3 {
  const b = [1 / (no * no), 1 / (no * no), 1 / (ne * ne)];
  const d = [0, 0, 0, 0, 0, 0];
  if (r && E) for (let I = 0; I < 6; I++) d[I] = r[I][0] * E[0] + r[I][1] * E[1] + r[I][2] * E[2];
  return [
    [b[0] + d[0], d[5], d[4]],
    [d[5], b[1] + d[1], d[3]],
    [d[4], d[3], b[2] + d[2]],
  ];
}

/** Principal indices (ascending) and principal axes (unit vectors, axes[i] for n[i]). */
export function principalIndices(B: Mat3): { n: Vec3; axes: Mat3 } {
  const { values, vectors } = eigSym3(B);
  // values ascending -> indices descending; return indices ascending
  return {
    n: [1 / Math.sqrt(values[2]), 1 / Math.sqrt(values[1]), 1 / Math.sqrt(values[0])],
    axes: [vectors[2], vectors[1], vectors[0]],
  };
}

/** Orthonormal basis (e1, e2) of the plane normal to unit k; e1 lies in the plane of k and z when possible. */
export function transverseBasis(k: Vec3): [Vec3, Vec3] {
  const kz = normalize3(k);
  const ref: Vec3 = Math.abs(kz[2]) < 0.999999 ? [0, 0, 1] : [1, 0, 0];
  const e2 = normalize3(cross3(ref, kz));
  const e1 = cross3(kz, e2);
  return [e1, e2];
}

/** Eigen-indices for wave normal k (any length). nLo <= nHi; dLo, dHi are the unit D polarization vectors. */
export function eigenIndices(B: Mat3, k: Vec3): { nLo: number; nHi: number; dLo: Vec3; dHi: Vec3 } {
  const [e1, e2] = transverseBasis(k);
  const B1 = matVec3(B, e1);
  const B2 = matVec3(B, e2);
  const a = dot3(e1, B1);
  const b = dot3(e1, B2);
  const c = dot3(e2, B2);
  const { lo, hi, thetaHi } = eigSym2(a, b, c);
  // eigenvector of the larger impermeability (smaller index)
  const ch = Math.cos(thetaHi);
  const sh = Math.sin(thetaHi);
  const dBig: Vec3 = [ch * e1[0] + sh * e2[0], ch * e1[1] + sh * e2[1], ch * e1[2] + sh * e2[2]];
  const dSmall: Vec3 = [-sh * e1[0] + ch * e2[0], -sh * e1[1] + ch * e2[1], -sh * e1[2] + ch * e2[2]];
  return { nLo: 1 / Math.sqrt(hi), nHi: 1 / Math.sqrt(lo), dLo: dBig, dHi: dSmall };
}

/** Optic axes of B. V is the half-angle from the largest-index principal axis (tan^2 V = (b_max - b_mid)/(b_mid - b_min),
 *  b = principal impermeabilities; Born and Wolf). twoV = 2V; acute2V = min(2V, pi - 2V). Uniaxial when two indices
 *  coincide to 1e-14 relative. */
export function opticAxes(B: Mat3): { V: number; twoV: number; acute2V: number; axes: [Vec3, Vec3]; uniaxial: boolean } {
  const { values, vectors } = eigSym3(B); // b ascending
  const [bmin, bmid, bmax] = values;
  const uNmax = vectors[0]; // largest index
  const uNmin = vectors[2]; // smallest index
  const tol = 1e-14 * bmax;
  if (bmid - bmin <= tol || bmax - bmid <= tol) {
    const ax = bmid - bmin <= tol ? uNmin : uNmax; // the non-degenerate axis
    return { V: bmid - bmin <= tol ? Math.PI / 2 : 0, twoV: bmid - bmin <= tol ? Math.PI : 0, acute2V: 0, axes: [ax, ax], uniaxial: true };
  }
  const V = Math.atan(Math.sqrt((bmax - bmid) / (bmid - bmin)));
  const c = Math.cos(V);
  const s = Math.sin(V);
  const a1: Vec3 = [c * uNmax[0] + s * uNmin[0], c * uNmax[1] + s * uNmin[1], c * uNmax[2] + s * uNmin[2]];
  const a2: Vec3 = [c * uNmax[0] - s * uNmin[0], c * uNmax[1] - s * uNmin[1], c * uNmax[2] - s * uNmin[2]];
  return { V, twoV: 2 * V, acute2V: Math.min(2 * V, Math.PI - 2 * V), axes: [a1, a2], uniaxial: false };
}

/** Extraordinary index for a wave normal at angle theta from the optic axis: 1/n^2 = cos^2/no^2 + sin^2/ne^2. */
export function extraordinaryIndex(theta: number, no: number, ne: number): number {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return 1 / Math.sqrt((c * c) / (no * no) + (s * s) / (ne * ne));
}

/** Extraordinary walk-off angle rho (rad): tan rho = (n_e(theta)^2 / 2)(1/ne^2 - 1/no^2) sin 2theta (Dmitriev et al. 1999).
 *  Positive rho: the Poynting vector lies farther from the optic axis than k (negative uniaxial). */
export function walkoffAngle(theta: number, no: number, ne: number): number {
  const n = extraordinaryIndex(theta, no, ne);
  return Math.atan(((n * n) / 2) * (1 / (ne * ne) - 1 / (no * no)) * Math.sin(2 * theta));
}

/** Exact z-cut retardance (rad) at external sine s for a uniaxial plate of thickness d (um), wavelength lam (um):
 *  Gamma = k0 d [sqrt(no^2 - s^2) - (no/ne) sqrt(ne^2 - s^2)] (o and e wave-normal z components). */
export function zcutRetardanceExact(s: number, no: number, ne: number, d_um: number, lam_um: number): number {
  return ((2 * Math.PI) / lam_um) * d_um * (Math.sqrt(no * no - s * s) - (no / ne) * Math.sqrt(ne * ne - s * s));
}

// =====================================================================================
// Conoscope (crossed or arbitrary polarizers; Fresnel transmission differences neglected)
// =====================================================================================

/** Port of the approved mockup model (mockup/ln.js renderConoscope), one wavelength, crossed polarizers x/y.
 *  Weak-birefringence: uniaxial term (no - ne) sin^2(theta_int), slow axis tangential, plus Pockels term no^3 r22 E for an
 *  in-plane field, added as doubled-angle vectors; Gamma = 2 pi d |B| / (lambda cos theta_int); I = sin^2(2 psi) sin^2(Gamma/2).
 *  Pixel (x, y): u = (x + 0.5 - size/2)/(size/2), v = (size/2 - y - 0.5)/(size/2); outside the unit disk I = 0. */
export interface ConoscopeZcutWeakOpts {
  size: number;
  thickness_um: number;
  lam_um: number;
  NA: number;
  no: number;
  ne: number;
  /** Index used for refraction of every ray (the mockup uses n_o at 0.55 um). */
  nRefract: number;
  r22_m_per_V?: number;
  E_V_per_m?: number;
  fieldDir?: "x" | "y";
}
export function conoscopeZcutWeak(o: ConoscopeZcutWeakOpts, out?: Float32Array): Float32Array {
  const { size, thickness_um: d, lam_um: lam, NA, no, ne, nRefract } = o;
  const I = out ?? new Float32Array(size * size);
  const dn = no - ne;
  const dE = no ** 3 * (o.r22_m_per_V ?? 0) * (o.E_V_per_m ?? 0);
  const half = size / 2;
  const k = (2 * Math.PI * d) / lam;
  for (let y = 0; y < size; y++) {
    const v = (half - y - 0.5) / half;
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5 - half) / half;
      const r2 = u * u + v * v;
      const p = y * size + x;
      if (r2 > 1) {
        I[p] = 0;
        continue;
      }
      const s2 = (NA * NA * r2) / (nRefract * nRefract);
      const cosT = Math.sqrt(1 - s2);
      const c2 = r2 > 0 ? (u * u - v * v) / r2 : 1;
      const s2p = r2 > 0 ? (2 * u * v) / r2 : 0;
      const du = dn * s2;
      let bx = -du * c2;
      let by = -du * s2p;
      if (o.fieldDir === "x") by += dE;
      else bx += dE;
      const mag = Math.hypot(bx, by);
      const s2psi = mag > 0 ? by / mag : 0;
      const g = (k * mag) / cosT;
      const sg = Math.sin(g / 2);
      I[p] = s2psi * s2psi * sg * sg;
    }
  }
  return I;
}

/** Display-only spectral weights used by the mockup for white light (smooth Gaussians, not CIE colour matching).
 *  Reproduces mockup/ln.js SPECTRUM: 0.42 um to 0.681 um in 0.026 um steps. */
export function mockupSpectrum(): { lam: number; w: [number, number, number] }[] {
  const out: { lam: number; w: [number, number, number] }[] = [];
  for (let lam = 0.42; lam <= 0.681; lam += 0.026) {
    const g = (mu: number, s: number) => Math.exp(-0.5 * ((lam - mu) / s) ** 2);
    out.push({ lam, w: [g(0.6, 0.042) + 0.3 * g(0.445, 0.02), g(0.55, 0.04), g(0.455, 0.028)] });
  }
  return out;
}

/** General conoscope: plate of arbitrary cut (R maps crystal -> lab, lab z = plate normal), arbitrary B (crystal frame,
 *  including any applied field), thickness, wavelength, NA, polarizer and analyzer azimuths (lab, from x).
 *  retardance "exact": each eigenwave's wave normal is refracted with its own direction-dependent index (fixed point of
 *    n = n(theta(n)), sin theta = s / n), so Gamma = k0 d (kz_slow - kz_fast) is exact for plane waves (Fresnel-free).
 *  retardance "weak": first-order model, one refraction with nRefract and Gamma = k0 d dn / cos(theta) (mockup class).
 *  Intensity: I = cos^2(A - P) - sin 2(psi - P) sin 2(psi - A) sin^2(Gamma/2), psi = lab azimuth of the slow D vector. */
export interface ConoscopeOpts {
  size: number;
  thickness_um: number;
  lam_um: number;
  NA: number;
  B: Mat3;
  R?: Mat3;
  nRefract?: number;
  polarizer_rad?: number;
  analyzer_rad?: number;
  retardance?: "exact" | "weak";
}
export function conoscope(o: ConoscopeOpts, out?: Float32Array, gammaOut?: Float32Array): Float32Array {
  const { size, thickness_um: d, lam_um: lam, NA } = o;
  const R = o.R ?? ([[1, 0, 0], [0, 1, 0], [0, 0, 1]] as Mat3);
  const Bl = matMul3(matMul3(R, o.B), transpose3(R)); // lab frame
  const P = o.polarizer_rad ?? 0;
  const A = o.analyzer_rad ?? Math.PI / 2;
  const cAP = Math.cos(A - P) ** 2;
  const nR = o.nRefract ?? Math.sqrt(3 / (Bl[0][0] + Bl[1][1] + Bl[2][2]));
  const exact = (o.retardance ?? "exact") === "exact";
  const I = out ?? new Float32Array(size * size);
  const k0d = ((2 * Math.PI) / lam) * d;
  const half = size / 2;
  // projected 2x2 in the (p, s) basis of a wave normal with internal angle theta at azimuth phi
  // projected impermeability in the (p, s) basis of a wave normal (internal angle theta, azimuth phi), allocation-free:
  // ep = (cos t cos f, cos t sin f, -sin t), es = (-sin f, cos f, 0); pr = [ep.B.ep, ep.B.es, es.B.es]
  const b00 = Bl[0][0], b01 = Bl[0][1], b02 = Bl[0][2], b11 = Bl[1][1], b12 = Bl[1][2], b22 = Bl[2][2];
  const pr = new Float64Array(3);
  const proj = (st: number, cp: number, sp: number): void => {
    const ct = Math.sqrt(1 - st * st);
    const px = ct * cp, py = ct * sp, pz = -st;
    const Bpx = b00 * px + b01 * py + b02 * pz;
    const Bpy = b01 * px + b11 * py + b12 * pz;
    const Bpz = b02 * px + b12 * py + b22 * pz;
    pr[0] = px * Bpx + py * Bpy + pz * Bpz;
    pr[1] = -sp * Bpx + cp * Bpy;
    pr[2] = -sp * (-b00 * sp + b01 * cp) + cp * (-b01 * sp + b11 * cp);
  };
  const half2 = () => {
    const h = 0.5 * (pr[0] - pr[2]);
    return Math.sqrt(h * h + pr[1] * pr[1]);
  };
  for (let y = 0; y < size; y++) {
    const v = (half - y - 0.5) / half;
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5 - half) / half;
      const r2 = u * u + v * v;
      const p = y * size + x;
      if (r2 > 1) {
        I[p] = 0;
        if (gammaOut) gammaOut[p] = 0;
        continue;
      }
      const r = Math.sqrt(r2);
      const s = NA * r; // external sine = tangential index
      const cp = r > 0 ? u / r : 1;
      const sp = r > 0 ? v / r : 0;
      let st = s / nR;
      proj(st, cp, sp);
      let gamma: number;
      if (exact) {
        // slow wave (larger index = smaller impermeability), fast wave (larger impermeability)
        const m = 0.5 * (pr[0] + pr[2]);
        const d2 = half2();
        let nS = 1 / Math.sqrt(m - d2);
        let nF = 1 / Math.sqrt(m + d2);
        for (let it = 0; it < 12; it++) {
          proj(s / nS, cp, sp);
          const nS2 = 1 / Math.sqrt(0.5 * (pr[0] + pr[2]) - half2());
          proj(s / nF, cp, sp);
          const nF2 = 1 / Math.sqrt(0.5 * (pr[0] + pr[2]) + half2());
          const conv = Math.abs(nS2 - nS) + Math.abs(nF2 - nF) < 1e-13;
          nS = nS2;
          nF = nF2;
          if (conv) break;
        }
        gamma = k0d * (Math.sqrt(nS * nS - s * s) - Math.sqrt(nF * nF - s * s));
        st = (2 * s) / (nS + nF);
        proj(st, cp, sp);
      } else {
        const ct0 = Math.sqrt(1 - st * st);
        const m = 0.5 * (pr[0] + pr[2]);
        const d2 = half2();
        gamma = (k0d * (1 / Math.sqrt(m - d2) - 1 / Math.sqrt(m + d2))) / ct0;
      }
      // slow D vector: eigenvector of the smaller impermeability = thetaHi + 90 deg in the (p, s) basis
      const thetaHi = 0.5 * Math.atan2(2 * pr[1], pr[0] - pr[2]);
      const ct = Math.sqrt(1 - st * st);
      const ang = thetaHi + Math.PI / 2;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      // xy projection of ca*ep + sa*es
      const dx = ca * ct * cp - sa * sp;
      const dy = ca * ct * sp + sa * cp;
      const psi = Math.atan2(dy, dx);
      const sg = Math.sin(gamma / 2);
      I[p] = cAP - Math.sin(2 * (psi - P)) * Math.sin(2 * (psi - A)) * sg * sg;
      if (gammaOut) gammaOut[p] = gamma;
    }
  }
  return I;
}

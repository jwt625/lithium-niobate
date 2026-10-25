// Index-ellipsoid helpers for chapter 2 figures (F2-01 conoscope readouts, F2-03 ellipsoid, F2-04 bulk Pockels, F2-15 ring
// anisotropy). Thin layer over crystaloptics.ts (exact eigen-decomposition) with closed forms used as acceptance checks.
// Formulas: manuscript 02-light eqs. 2.2, 2.4, 2.5 and sec. 2.1 L3 (field-induced biaxiality); Yariv and Yeh 1984 ch. 7;
// Born and Wolf (crystal optics). Units: lam_um in um, fields in V/m, r in m/V unless suffixed _pm_per_V, angles in rad
// unless suffixed _deg.
import { bisect } from "./linalg.ts";
import type { Vec3 } from "./linalg.ts";
import { eigenIndices, extraordinaryIndex, impermeability, opticAxes, walkoffAngle, zcutRetardanceExact } from "./crystaloptics.ts";
import { r3m } from "./tensors.ts";
import type { EOSet } from "./constants.ts";

const DEG = Math.PI / 180;

/** Section indices for wave normal k (alias of crystaloptics.eigenIndices, the exact 2x2 projection of B). */
export const sectionIndices = eigenIndices;

/** External angle (deg) of the m-th dark ring (Gamma = 2 pi m) of a z-cut plate between crossed polarizers, from the exact
 *  plane-wave retardance Gamma(s) = k0 d [sqrt(no^2 - s^2) - (no/ne) sqrt(ne^2 - s^2)] (manuscript 2.1 L3). Solved by
 *  bisection on the external sine s in (0, 1). NaN when the m-th ring lies outside s < 1. */
export function ringAngle(d_mm: number, lam_um: number, m: number, no: number, ne: number): number {
  const d_um = d_mm * 1e3;
  const f = (s: number) => zcutRetardanceExact(s, no, ne, d_um, lam_um) - 2 * Math.PI * m;
  if (f(1 - 1e-12) < 0) return Number.NaN;
  return Math.asin(bisect(f, 0, 1 - 1e-12, 1e-14)) / DEG;
}

/** First nRings dark-ring external angles (deg); stops at the first ring beyond grazing incidence. */
export function ringAngles(d_mm: number, lam_um: number, nRings: number, no: number, ne: number): number[] {
  const out: number[] = [];
  for (let m = 1; m <= nRings; m++) {
    const a = ringAngle(d_mm, lam_um, m, no, ne);
    if (Number.isNaN(a)) break;
    out.push(a);
  }
  return out;
}

/** Small-angle ring estimate (deg), for comparison only: Gamma ~ (2 pi d / lam)(no - ne) theta_int^2 = 2 pi m with theta_int = s / no
 *  (factor fixed 2026-10-25 after the PHY2 audit). */
export function ringAngleSmall(d_mm: number, lam_um: number, m: number, no: number, ne: number): number {
  const th = Math.sqrt((m * lam_um) / (d_mm * 1e3 * (no - ne)));
  return Math.asin(Math.min(1, no * th)) / DEG;
}

export interface FieldBiaxiality {
  /** induced birefringence for propagation along z (exact eigen-indices) */
  dn_z: number;
  /** retardance along z for plate thickness d (rad) */
  retardance_z: number;
  /** optic-axis tilt from c inside the crystal (deg), exact */
  tiltInt_deg: number;
  /** tilt in air (deg): asin(n_axis sin tiltInt), n_axis = eigen-index along the optic axis */
  tiltExt_deg: number;
  /** first-order forms (manuscript 2.1 L3): dn = no^3 r22 E, (no - ne) sin^2 theta = no^3 r22 E. The tilt form replaces the
   *  impermeability difference 1/ne^2 - 1/no^2 by 2 (no - ne)/no^3, about 6% low for LN, so it overstates the tilt by about 3%
   *  and ignores the r51 shear term (B_yz or B_xz = r51 E). */
  dn_z_firstOrder: number;
  tiltInt_firstOrder_deg: number;
  tiltExt_firstOrder_deg: number;
  /** first order in E but exact in the birefringence, r51 ignored: tan^2 theta = 2 r22 E / (1/ne^2 - 1/no^2) */
  tiltInt_biaxial_deg: number;
  /** principal-axis azimuth of the larger in-plane index, measured from crystal x (deg) */
  inPlaneAxis_deg: number;
  /** optic axes (unit vectors, crystal frame) */
  axes: [Vec3, Vec3];
}

/** Optic-axis tilt and induced birefringence of a z-cut plate under a transverse field E along crystal x or y
 *  (exact: crystaloptics.impermeability + opticAxes; first-order checks from manuscript 2.1 L3). */
export function opticAxisTilt(p: { E_V_per_m: number; dir: "x" | "y"; eo: EOSet; no: number; ne: number; lam_um: number; d_mm?: number }): FieldBiaxiality {
  const r = r3m(p.eo).map((row) => row.map((v) => v * 1e-12));
  const E: Vec3 = p.dir === "x" ? [p.E_V_per_m, 0, 0] : [0, p.E_V_per_m, 0];
  const B = impermeability(p.no, p.ne, r, E);
  const ez = eigenIndices(B, [0, 0, 1]);
  const dn = ez.nHi - ez.nLo;
  const ax = opticAxes(B);
  const a0 = ax.axes[0];
  const tilt = Math.acos(Math.min(1, Math.abs(a0[2])));
  const nAxis = eigenIndices(B, a0).nHi;
  const firstDn = p.no ** 3 * p.eo.r22 * 1e-12 * Math.abs(p.E_V_per_m);
  const s1 = Math.sqrt(firstDn / (p.no - p.ne));
  const d_um = (p.d_mm ?? 1) * 1e3;
  const dHi = ez.dHi;
  return {
    dn_z: dn,
    retardance_z: (2 * Math.PI * d_um * dn) / p.lam_um,
    tiltInt_deg: tilt / DEG,
    tiltExt_deg: Math.asin(Math.min(1, nAxis * Math.sin(tilt))) / DEG,
    dn_z_firstOrder: firstDn,
    tiltInt_firstOrder_deg: Math.asin(s1) / DEG,
    tiltExt_firstOrder_deg: Math.asin(Math.min(1, p.no * s1)) / DEG,
    tiltInt_biaxial_deg: Math.atan(Math.sqrt((2 * p.eo.r22 * 1e-12 * Math.abs(p.E_V_per_m)) / (1 / p.ne ** 2 - 1 / p.no ** 2))) / DEG,
    inPlaneAxis_deg: ((Math.atan2(dHi[1], dHi[0]) / DEG) % 180 + 180) % 180,
    axes: ax.axes,
  };
}

/** Maximum extraordinary walk-off over theta in (0, pi/2): golden-section search on crystaloptics.walkoffAngle.
 *  Closed form check: tan rho_max = |no^2 - ne^2| / (2 no ne) at tan theta = ne / no (derived from the walk-off formula). */
export function maxWalkoff(no: number, ne: number): { rho_deg: number; theta_deg: number } {
  const g = (Math.sqrt(5) - 1) / 2;
  let a = 0;
  let b = Math.PI / 2;
  const f = (t: number) => -Math.abs(walkoffAngle(t, no, ne));
  let c = b - g * (b - a);
  let d = a + g * (b - a);
  for (let i = 0; i < 200 && b - a > 1e-14; i++) {
    if (f(c) < f(d)) b = d;
    else a = c;
    c = b - g * (b - a);
    d = a + g * (b - a);
  }
  const t = 0.5 * (a + b);
  return { rho_deg: Math.abs(walkoffAngle(t, no, ne)) / DEG, theta_deg: t / DEG };
}
export const maxWalkoffClosedForm = (no: number, ne: number): { rho_deg: number; theta_deg: number } => ({
  rho_deg: Math.atan(Math.abs(no * no - ne * ne) / (2 * no * ne)) / DEG,
  theta_deg: Math.atan(ne / no) / DEG,
});

/** Bulk Pockels index change along the field (eq. 2.4): dn = -(1/2) n^3 r E, r in pm/V. */
export const pockelsDn = (n: number, r_pm_per_V: number, E_V_per_m: number): number => -0.5 * n ** 3 * r_pm_per_V * 1e-12 * E_V_per_m;

/** Field-length product (V) for a pi phase shift in bulk (eq. 2.4): E L = lam / (n^3 r). */
export const piFieldLength = (lam_um: number, n: number, r_pm_per_V: number): number => (lam_um * 1e-6) / (n ** 3 * r_pm_per_V * 1e-12);

/** In-plane TE index around an x-cut ring in the bulk approximation (manuscript 2.7 L2): 1/n^2 = cos^2(phi)/no^2 +
 *  sin^2(phi)/ne^2, phi measured from crystal z in the film plane. Mode confinement ignored. */
export const xcutRingIndex = (phi: number, no: number, ne: number): number => extraordinaryIndex(phi, no, ne);

// Unit conversions. Pure functions, SI underneath. Suffixes name the unit (lam_um, f_THz, E_eV).
import { C0, H, QE } from "./constants.ts";

// ---------- wavelength / frequency / energy ----------
export const umToM = (x_um: number): number => x_um * 1e-6;
export const nmToUm = (x_nm: number): number => x_nm * 1e-3;
export const umToNm = (x_um: number): number => x_um * 1e3;

/** Vacuum wavelength (um) to frequency (THz). */
export const umToTHz = (lam_um: number): number => C0 / (lam_um * 1e-6) / 1e12;
/** Frequency (THz) to vacuum wavelength (um). */
export const THzToUm = (f_THz: number): number => C0 / (f_THz * 1e12) / 1e-6;
/** Photon energy (eV) of a vacuum wavelength (um). */
export const umToEV = (lam_um: number): number => (H * C0) / (lam_um * 1e-6) / QE;
export const eVToUm = (E_eV: number): number => (H * C0) / (E_eV * QE) / 1e-6;
/** Wavenumber (1/cm) of a vacuum wavelength (um). */
export const umToWavenumber = (lam_um: number): number => 1e4 / lam_um;
export const wavenumberToUm = (k_cm: number): number => 1e4 / k_cm;
/** Angular frequency (rad/s) of a vacuum wavelength (um). */
export const umToOmega = (lam_um: number): number => (2 * Math.PI * C0) / (lam_um * 1e-6);
/** Linewidth conversion: delta-lambda (nm) at lambda (nm) to delta-f (GHz). |df| = c dl / l^2. */
export const dlNmToDfGHz = (dl_nm: number, lam_nm: number): number => ((C0 * dl_nm * 1e-9) / (lam_nm * 1e-9) ** 2) / 1e9;
export const dfGHzToDlNm = (df_GHz: number, lam_nm: number): number => ((df_GHz * 1e9 * (lam_nm * 1e-9) ** 2) / C0) / 1e-9;

// ---------- decibels ----------
/** Power ratio to dB. */
export const toDb = (ratio: number): number => 10 * Math.log10(ratio);
export const fromDb = (dB: number): number => 10 ** (dB / 10);
/** Field (amplitude) ratio to dB. */
export const fieldToDb = (ratio: number): number => 20 * Math.log10(ratio);
export const dbToField = (dB: number): number => 10 ** (dB / 20);
export const wToDbm = (P_W: number): number => 10 * Math.log10(P_W / 1e-3);
export const dbmToW = (P_dBm: number): number => 1e-3 * 10 ** (P_dBm / 10);
/** 1 Np (field) = 20/ln(10) dB = 8.6859 dB. */
export const NP_TO_DB = 20 / Math.LN10;
/** Power attenuation coefficient alpha (1/m, P = P0 exp(-alpha z)) to dB/cm. */
export const alphaPerMToDbPerCm = (alpha_per_m: number): number => (10 / Math.LN10) * alpha_per_m * 1e-2;
export const dbPerCmToAlphaPerM = (dB_per_cm: number): number => (dB_per_cm * 1e2 * Math.LN10) / 10;
export const dbPerMToAlphaPerM = (dB_per_m: number): number => (dB_per_m * Math.LN10) / 10;
export const alphaPerMToDbPerM = (alpha_per_m: number): number => (10 / Math.LN10) * alpha_per_m;

// ---------- electro-optic and field units ----------
export const vcmToVm = (x_Vcm: number): number => x_Vcm * 1e-2;
export const vmToVcm = (x_Vm: number): number => x_Vm * 1e2;
export const pmPerVToMPerV = (r_pm: number): number => r_pm * 1e-12;
export const kVPerMmToVPerM = (E: number): number => E * 1e6;
export const vPerUmToVPerM = (E: number): number => E * 1e6;
export const kVPerCmToVPerM = (E: number): number => E * 1e5;

// ---------- resonators ----------
/** Loaded Q from center wavelength and FWHM (same units). */
export const qFromLinewidth = (lam: number, fwhm: number): number => lam / fwhm;
/** Intrinsic Q from power loss alpha (1/m), group index and wavelength (um): Q = 2 pi n_g / (lambda alpha). */
export const qFromAlpha = (alpha_per_m: number, ng: number, lam_um: number): number => (2 * Math.PI * ng) / (lam_um * 1e-6 * alpha_per_m);
export const alphaFromQ = (Q: number, ng: number, lam_um: number): number => (2 * Math.PI * ng) / (lam_um * 1e-6 * Q);

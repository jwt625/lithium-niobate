// F7.3 Write, fix, erase: photorefractive plate. Reduced single-center model from the physics core
// (src/lib/physics/photorefractive.ts, PR_TEMPLATE): each cell's space-charge field relaxes toward
// E_ss(I) = -k_pv I / (sigma_d + k_ph M I) with tau(I) = eps0 eps_r / (sigma_d + k_ph M I); M = 1 congruent, about 100
// above the MgO threshold (bryan1984). Rate coefficients are template values (tau = 1 s at 1e4 W/m^2), so every time
// constant here is a display value. The index pattern is Delta n_e proportional to E; a uniform offset is no pattern,
// so the image shows the contrast E - E_border, normalized to the congruent write saturation, on a log scale.
// Fixing (amodei1971b): the electronic pattern is copied into a fixed (ionic) layer that illumination does not erase.
import { PR_TEMPLATE, relaxationTime, saturationField, type PRParams } from "$lib/physics/photorefractive.ts";
import { MGO_THRESHOLD } from "$lib/physics/constants.ts";
import { fft } from "$lib/physics/fft.ts";

export const G = 110; // cells per side
export const I_WRITE = 2e4, I_READ = 1e3; // W/m^2 (template intensities: tau 0.5 s writing, about 10 s reading)
const BRUSH = 4.2; // cells, 1/e radius (display)

export const params = (mgo: boolean): PRParams => ({ ...PR_TEMPLATE.params, cMg: mgo ? MGO_THRESHOLD.value + 1 : 0 });
const ESS_W = saturationField(params(false), I_WRITE);

export class Plate {
  e = new Float32Array(G * G); // unfixed field / ESS_W
  f = new Float32Array(G * G); // fixed layer
  mgo = false;
  reading = false;
  brush: { x: number; y: number } | null = null;
  get p(): PRParams { return params(this.mgo); }
  tauWrite(): number { return relaxationTime(this.p, I_WRITE); }
  tauRead(): number { return relaxationTime(this.p, I_READ); }
  /** Advance by dt seconds (exact exponential relaxation per cell). Returns true when anything still changes. */
  step(dt: number): boolean {
    const p = this.p, b = this.brush;
    if (!b && !this.reading) return false;
    const Ir = this.reading ? I_READ : 0;
    // cache relaxation for the uniform background intensity
    const tau0 = relaxationTime(p, Ir), ess0 = saturationField(p, Ir) / ESS_W, a0 = Ir > 0 ? Math.exp(-dt / tau0) : 1;
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = j * G + i;
      let I = Ir;
      if (b) { const r2 = (i - b.x) ** 2 + (j - b.y) ** 2; if (r2 < 36 * BRUSH * BRUSH) I += I_WRITE * Math.exp(-r2 / (BRUSH * BRUSH)); }
      if (I === Ir) { if (a0 !== 1) this.e[k] = ess0 + (this.e[k] - ess0) * a0; continue; }
      const t = relaxationTime(p, I), ess = saturationField(p, I) / ESS_W;
      this.e[k] = ess + (this.e[k] - ess) * Math.exp(-dt / t);
    }
    return true;
  }
  /** Jump to the steady state under uniform reading (reduced motion). */
  settleRead(): void { const m = this.mean(this.e); this.e.fill(m); }
  fix(): void { const m = this.ref(this.e); for (let k = 0; k < G * G; k++) { this.f[k] += this.e[k] - m; this.e[k] = m; } }
  reset(): void { this.e.fill(0); this.f.fill(0); this.reading = false; this.mgo = false; }
  mean(a: Float32Array): number { let s = 0; for (let k = 0; k < a.length; k++) s += a[k]; return s / a.length; }
  /** Background reference: mean over the plate border (the unwritten field around a trace). */
  ref(a: Float32Array): number { let s = 0; for (let i = 0; i < G; i++) s += a[i] + a[(G - 1) * G + i] + a[i * G] + a[i * G + G - 1]; return s / (4 * G); }
  /** Pattern (contrast) per cell: e - <e> + f, with |Delta n| / Delta n_sat(congruent) on a 1e-3..1 log scale. */
  pattern(out: Float32Array): { peak: number; fixedShare: number } {
    const m = this.ref(this.e);
    let peak = 0, pf = 0, pu = 0;
    for (let k = 0; k < G * G; k++) {
      const u = this.e[k] - m, v = u + this.f[k];
      out[k] = v; const a = Math.abs(v); if (a > peak) peak = a;
      pf += Math.abs(this.f[k]); pu += Math.abs(u);
    }
    return { peak, fixedShare: pf + pu > 1e-9 ? pf / (pf + pu) : 0 };
  }
}

/** Gray level 0..1 from a pattern value (log scale over three decades). */
export const level = (v: number): number => { const a = Math.abs(v); return a < 1e-3 ? 0 : Math.min(1, Math.log10(a) / 3 + 1); };

/** Far-field preview: |FFT(exp(i pi v))|^2 on N x N, DC removed, log scale, centered. Returns values 0..1. */
export function farField(pat: Float32Array, N = 64): Float32Array {
  const re = new Float64Array(N * N), im = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const v = pat[Math.floor(((j + 0.5) / N) * G) * G + Math.floor(((i + 0.5) / N) * G)];
    const ph = Math.PI * Math.max(-1, Math.min(1, v));
    re[j * N + i] = Math.cos(ph); im[j * N + i] = Math.sin(ph);
  }
  const rr = new Float64Array(N), ri = new Float64Array(N);
  for (let j = 0; j < N; j++) { for (let i = 0; i < N; i++) { rr[i] = re[j * N + i]; ri[i] = im[j * N + i]; } fft(rr, ri); for (let i = 0; i < N; i++) { re[j * N + i] = rr[i]; im[j * N + i] = ri[i]; } }
  for (let i = 0; i < N; i++) { for (let j = 0; j < N; j++) { rr[j] = re[j * N + i]; ri[j] = im[j * N + i]; } fft(rr, ri); for (let j = 0; j < N; j++) { re[j * N + i] = rr[j]; im[j * N + i] = ri[j]; } }
  re[0] = 0; im[0] = 0;
  const out = new Float32Array(N * N);
  let mx = 0;
  for (let k = 0; k < N * N; k++) { const v = Math.log10(1 + re[k] ** 2 + im[k] ** 2); if (v > mx) mx = v; re[k] = v; }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) out[j * N + i] = mx > 0.3 ? re[((j + N / 2) % N) * N + ((i + N / 2) % N)] / mx : 0;
  return out;
}

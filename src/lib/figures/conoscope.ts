// Conoscope figure of a z-cut LN plate between crossed polarizers (P along x, A along y), as RGBA pixels.
// Physics: src/lib/physics/crystaloptics.ts.
//   "weak":  conoscopeZcutWeak, the approved mockup model (byte-equal to mockup/ln.js per lane PHY tests); 2.9 ms at 400x400
//            per wavelength. Used while a control is being dragged and for small sprites (logo, door art, legend).
//   "exact": conoscope() with B = impermeability(no, ne, r22 only, E), each eigenwave refracted with its own index; about
//            10x slower, computed in a worker after input settles, so the resting frame is exact. The weak model refracts
//            every ray with n_o(550 nm) and linearizes dn (about 6% retardance error at NA 0.55, lane PHY).
// Tone mapping and white-light weights are the mockup's (display only): 11 Gaussian-weighted samples 420-680 nm, gamma 0.8,
// gain 1.6, rim at r^2 > 0.985 darkened to 55%.
import { conoscope, conoscopeZcutWeak, impermeability, mockupSpectrum } from "$lib/physics/crystaloptics.ts";
import { r3m } from "$lib/physics/tensors.ts";
import type { Vec3 } from "$lib/physics/linalg.ts";
import { nCLN, R22_T } from "./optics.ts";

export interface ConoOpts {
  thicknessMm: number;
  fieldKVmm: number;
  fieldDir: "x" | "y";
  white: boolean;
  /** 633 nm drawn as gray instead of red (TECH). */
  mono: boolean;
  NA: number;
}
export type Retardance = "weak" | "exact";

const SPECTRUM = mockupSpectrum();
const WSUM = [0, 1, 2].map((c) => SPECTRUM.reduce((a, s) => a + s.w[c], 0));
const R22_ONLY = r3m({ r13: 0, r22: R22_T, r33: 0, r51: 0 });

/** RGBA pixels (size x size) of the conoscopic figure. */
export function conoscopeRGBA(size: number, o: ConoOpts, ret: Retardance = "weak"): Uint8ClampedArray<ArrayBuffer> {
  const d_um = o.thicknessMm * 1e3, E = o.fieldKVmm * 1e6;
  const samples = o.white ? SPECTRUM : [{ lam: 0.6328, w: (o.mono ? [1, 1, 1] : [1, 0.12, 0.08]) as [number, number, number] }];
  const sw = o.white ? WSUM : o.mono ? [1, 1, 1] : [1, 0.12, 0.08];
  const N = size * size, acc = new Float64Array(N * 3), I = new Float32Array(N);
  const nR = nCLN("o", 0.55);
  const Evec: Vec3 = o.fieldDir === "x" ? [E, 0, 0] : [0, E, 0];
  for (const s of samples) {
    const no = nCLN("o", s.lam), ne = nCLN("e", s.lam);
    if (ret === "weak") conoscopeZcutWeak({ size, thickness_um: d_um, lam_um: s.lam, NA: o.NA, no, ne, nRefract: nR, r22_m_per_V: R22_T, E_V_per_m: E, fieldDir: o.fieldDir }, I);
    else conoscope({ size, thickness_um: d_um, lam_um: s.lam, NA: o.NA, B: impermeability(no, ne, R22_ONLY, Evec), retardance: "exact" }, I);
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
      out[i] = Math.min(255, 255 * Math.pow(acc[3 * p] / sw[0], 0.8) * edge * 1.6);
      out[i + 1] = Math.min(255, 255 * Math.pow(acc[3 * p + 1] / sw[1], 0.8) * edge * 1.6);
      out[i + 2] = Math.min(255, 255 * Math.pow(acc[3 * p + 2] / sw[2], 0.8) * edge * 1.6);
    }
  }
  return out;
}

/** Draw the figure into a 2D context (size x size device pixels), as the mockup's LN.renderConoscope. */
export function renderConoscope(ctx: CanvasRenderingContext2D, size: number, o: ConoOpts, ret: Retardance = "weak"): void {
  ctx.putImageData(new ImageData(conoscopeRGBA(size, o, ret), size, size), 0, 0);
}

/** Luminance of an RGBA buffer in place (TECH shows the white-light figure as luminance). */
export function toLuminance(p: Uint8ClampedArray): void {
  for (let i = 0; i < p.length; i += 4) { const y = 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]; p[i] = p[i + 1] = p[i + 2] = y; }
}

// ---------- exact frames off the main thread ----------
interface Job { id: number; size: number; o: ConoOpts; lum: boolean }
let worker: Worker | null = null, nextId = 1, broken = false;
const jobs = new Map<number, Job>();
const pending = new Map<number, (px: Uint8ClampedArray<ArrayBuffer>) => void>();
function getWorker(): Worker | null {
  if (worker || broken || typeof Worker === "undefined") return worker;
  try {
    worker = new Worker(new URL("./conoscope.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<{ id: number; px: Uint8ClampedArray<ArrayBuffer> }>) => { pending.get(e.data.id)?.(e.data.px); pending.delete(e.data.id); };
    worker.onerror = () => { // the worker failed (load or runtime): finish pending jobs on the main thread, stop using it
      worker = null; broken = true;
      for (const [id, job] of jobs) { const px = conoscopeRGBA(job.size, job.o, "exact"); if (job.lum) toLuminance(px); pending.get(id)?.(px); }
      pending.clear(); jobs.clear();
    };
  } catch { worker = null; }
  return worker;
}
/** Exact frame computed in a worker; resolves with RGBA pixels (luminance applied when lum). Falls back to the main thread. */
export function exactRGBA(size: number, o: ConoOpts, lum: boolean): Promise<Uint8ClampedArray<ArrayBuffer>> {
  const w = getWorker();
  if (!w) { const px = conoscopeRGBA(size, o, "exact"); if (lum) toLuminance(px); return Promise.resolve(px); }
  const id = nextId++;
  return new Promise((res) => { const job: Job = { id, size, o, lum }; pending.set(id, (px) => { jobs.delete(id); res(px); }); jobs.set(id, job); w.postMessage(job); });
}

/** Weak frame now, exact frame after the input has been idle for `idleMs`; stale exact results are dropped. */
export function makeConoPainter(idleMs = 140): (ctx: CanvasRenderingContext2D, size: number, o: ConoOpts, lum: boolean) => void {
  let timer = 0, gen = 0;
  return (ctx, size, o, lum) => {
    const g = ++gen;
    const px = conoscopeRGBA(size, o, "weak");
    if (lum) toLuminance(px);
    ctx.putImageData(new ImageData(px, size, size), 0, 0);
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      void exactRGBA(size, o, lum).then((ex) => { if (g === gen && ctx.canvas.width === size) ctx.putImageData(new ImageData(ex, size, size), 0, 0); });
    }, idleMs);
  };
}

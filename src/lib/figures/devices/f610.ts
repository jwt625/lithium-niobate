// F6.10 Resonant EO comb: ring with a lumped phase modulator driven at one FSR (ring.ts eoCombThrough, round-trip model,
// zero dispersion) or the coupled-mode sideband model with dispersion (ring.ts eoCombCMT). Through port, critical
// coupling from the intrinsic Q (devices.ts ringFromQ). FSR 10 GHz and the dispersion value are templates.
import { eoCombCMT, eoCombThrough } from "$lib/physics/ring.ts";
import { combLinesAbove, combSpanNm, ringFromQ } from "$lib/physics/devices.ts";
import { C0 } from "$lib/physics/constants.ts";
import { Plot, type Look } from "./svgplot.ts";
import { pad } from "../fmt.ts";

export interface CombState { [k: string]: number | string | boolean; beta: number; Qi: number; disp: boolean }
export const COMB_DEFAULT: CombState = { beta: 1, Qi: 1.5e6, disp: false };
const FSR = 10e9, NG = 2.3, LAM = 1550, K = 600, D2 = 2 * Math.PI * 10e3; // D2/2pi = 10 kHz (template)
let memo: { k: string; kk: Int32Array; P: Float64Array } | null = null;
export function comb(s: CombState): { kk: Int32Array; P: Float64Array } {
  const key = [s.beta, s.Qi, s.disp].join("|");
  if (memo?.k === key) return memo;
  const L = C0 / (NG * FSR) * 1e6; // um
  const g = ringFromQ({ lambda_nm: LAM, ng: NG, R_um: L / (2 * Math.PI), QL: s.Qi / 2, regime: "critical" });
  let r: { k: Int32Array; P: Float64Array };
  if (s.beta <= 0) { r = { k: Int32Array.from({ length: 2 * K + 1 }, (_, i) => i - K), P: new Float64Array(2 * K + 1) }; r.P[K] = 1; }
  else if (!s.disp) r = eoCombThrough({ r: g.r, a: g.a, beta: s.beta, N: 8192, K });
  else { const T = 1 / FSR; r = eoCombCMT({ kappaEx_per_s: (1 - g.r ** 2) / T, kappa0_per_s: (1 - g.a ** 2) / T, beta: s.beta, Trt_s: T, D2_rad_per_s: D2, K }); }
  memo = { k: key, kk: r.k, P: r.P };
  return memo;
}
/** Lines within 60 dB of the strongest; span between the outermost such lines. */
export function combStats(s: CombState): { n: number; span: number } {
  const c = comb(s);
  let mx = 0;
  for (const v of c.P) mx = Math.max(mx, v);
  const lim = mx * 1e-6;
  let lo = 0, hi = 0;
  for (let i = 0; i < c.P.length; i++) if (c.P[i] >= lim && c.P[i] > 0) { lo = Math.min(lo, c.kk[i]); hi = Math.max(hi, c.kk[i]); }
  return { n: combLinesAbove(c.P, -60), span: combSpanNm(lo, hi, FSR, LAM) };
}
/** True when lines at the window edge are within 60 dB of the peak. */
function combWide(s: CombState): boolean { const c = comb(s); let mx = 0; for (const v of c.P) mx = Math.max(mx, v); return c.P[0] >= mx * 1e-6 || c.P[c.P.length - 1] >= mx * 1e-6; }
export function combOuts(s: CombState): Record<string, string> {
  const st = combStats(s);
  return { n: pad(String(st.n), 5), span: `${pad(st.span.toFixed(1), 6)} nm`, beta: `${pad(s.beta.toFixed(2), 4)} rad`, Qi: pad(s.Qi.toExponential(2).replace("e+", "e"), 7), edge: combWide(s) ? "comb wider than ±6 THz window" : "" };
}
export function combPlot(s: CombState, w: number, h: number, look: Look): string {
  const c = comb(s), X = (K * FSR) / 1e12;
  const p = new Plot({ w, h, look, x: { min: -X, max: X, label: "offset from the pump (THz)" }, y: { min: -100, max: 0, label: "line power (dB, re input)", ticks: [-100, -80, -60, -40, -20, 0] } }).axes();
  p.hline(-60, "ref");
  let d = "";
  for (let i = 0; i < c.P.length; i++) {
    const db = 10 * Math.log10(Math.max(1e-30, c.P[i]));
    if (db < -100) continue;
    const x = p.sx((c.kk[i] * FSR) / 1e12).toFixed(1);
    d += `M${x} ${p.y0}V${p.sy(db).toFixed(1)}`;
  }
  p.add(`<path class="stem" d="${d}"/>`);
  // zhang2019nat: > 900 lines at about 10 GHz (reported reference, not a fit)
  const a = p.sx(-4.5), b = p.sx(4.5), y = p.y1 + (look === "tech" ? 10 : 14);
  p.add(`<path class="bd" d="M${a.toFixed(1)} ${y}H${b.toFixed(1)}M${a.toFixed(1)} ${y - 4}v8M${b.toFixed(1)} ${y - 4}v8"/><rect class="hit" data-id="zhang2019nat" tabindex="0" x="${a.toFixed(1)}" y="${y - 8}" width="${(b - a).toFixed(1)}" height="16"/>`);
  p.text((a + b) / 2, y + (look === "tech" ? 14 : 18), w < 600 ? "Zhang 2019: &gt; 900 lines" : "Zhang 2019: &gt; 900 lines at about 10 GHz (reported)", "lab", "middle");
  return p.svg(`dv-plot ${look}`, "EO comb line powers");
}
/** VISUAL ring with microwave electrodes; comb drawn around it as stems in 1550 nm false color. */
export function combArt(s: CombState, w: number, h: number): string {
  const st = combStats(s);
  const R = Math.min(h * 0.28, w * 0.16), cx = w * 0.3, cy = h * 0.45;
  const n = Math.min(61, st.n), x0 = w * 0.55, x1 = w - 24, base = h * 0.8;
  const c = comb(s);
  let stems = "";
  for (let j = 0; j < n; j++) {
    const k = j - (n - 1) / 2, idx = K + Math.round(k * Math.max(1, st.n / n));
    const db = 10 * Math.log10(Math.max(1e-30, c.P[Math.max(0, Math.min(c.P.length - 1, idx))]));
    const x = x0 + ((x1 - x0) * j) / Math.max(1, n - 1), y = base - (Math.max(-100, db) + 100) / 100 * (h * 0.6);
    stems += `<path class="ir" d="M${x.toFixed(1)} ${base}V${y.toFixed(1)}" style="stroke-dasharray:3 2"/>`;
  }
  return `<svg class="dv-art visual" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img" aria-label="Ring with microwave electrodes and its comb">`
    + `<path class="au" d="M${cx - R - 20} ${cy - R - 14}h${2 * R + 40}v9h${-(2 * R + 40)}z" opacity="0.9"/><circle class="au" cx="${cx}" cy="${cy}" r="${(R * 0.6).toFixed(1)}" opacity="0.85"/>`
    + `<circle class="wg" cx="${cx}" cy="${cy}" r="${R.toFixed(1)}"/><circle class="ir" cx="${cx}" cy="${cy}" r="${R.toFixed(1)}"/>`
    + `<path class="wg" d="M16 ${(cy + R + 10).toFixed(1)}H${(cx + R + 30).toFixed(1)}"/>`
    + `<text x="16" y="${(cy + R + 32).toFixed(1)}">${w < 600 ? "drive at the FSR" : "microwave drive at the FSR (10 GHz, template)"}</text>`
    + stems + `<path class="dim" d="M${x0} ${base}H${x1}"/><text x="${x0}" y="${base + 20}">${w < 600 ? `${st.n} lines` : `comb envelope, ${st.n} lines within 60 dB (sampled)`}</text></svg>`;
}

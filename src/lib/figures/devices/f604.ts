// F6.04 Traveling-wave EO response: forward + reflected line voltage integrated along the light's transit
// (modulator.ts twResponse via devices.ts s21Curve), loss alpha(f) = alpha_ref (f/f_ref)^e (rf.ts twParamsFromLoss),
// single-effect limits f_vel = 0.443 c / (L |n_RF - n_g|) (modulator.ts f3dBVelocityMismatch) and the 6.4 dB loss limit
// (rf.ts f3dBLossOnly).
import { s21Curve } from "$lib/physics/devices.ts";
import { f3dBVelocityMismatch } from "$lib/physics/modulator.ts";
import { f3dBLossOnly, twParamsFromLoss } from "$lib/physics/rf.ts";
import { C0 } from "$lib/physics/constants.ts";
import { Plot, arrow, type Look } from "./svgplot.ts";
import { pad } from "../fmt.ts";
import type { Dev } from "./atlas.ts";

export interface TWState { [k: string]: number | string | boolean; L: number; nRF: number; ng: number; loss: number; fref: number; expo: string; Z0: number; ZL: number; match: boolean; logf: boolean; preset: string; ph: number }
export const TW_DEFAULT: TWState = { L: 10, nRF: 2.25, ng: 2.25, loss: 3, fref: 67, expo: "0.5", Z0: 50, ZL: 50, match: true, logf: false, preset: "", ph: 0 };
export interface TWPreset { id: string; lb?: string; nRF: number; ng: number; Z0?: number; loss?: number; fref?: number; L?: number; bw?: number; gt: boolean; et: string; pl: string }
export function twPresets(devs: Dev[]): TWPreset[] {
  return devs.filter((d) => (d.platform === "TFLN" || d.platform === "TFLT") && d.n_rf != null && d.ng_opt != null)
    .map((d) => ({ id: d.device_id, nRF: d.n_rf as number, ng: d.ng_opt as number, Z0: d.z0_ohm, loss: d.rf_loss_db_per_cm, fref: d.rf_loss_freq_ghz, L: d.length_mm, bw: d.bw3db_ghz, gt: /bw3db_ghz:gt/.test(d.qualifiers ?? ""), et: d.electrode_type ?? "", pl: d.platform }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
const FMAX = 300;
const params = (s: TWState) => twParamsFromLoss({ L_m: s.L / 1000, nRF: s.nRF, ng: s.ng, lossRef_dB_per_cm: s.loss, fRef_GHz: s.fref, exponent: s.expo === "1" ? 1 : 0.5, Z0: s.Z0, Zs: 50, ZL: s.match ? s.Z0 : s.ZL });
let memo: { k: string; f: Float64Array; dB: Float64Array; fc: number | null } | null = null;
export function curve(s: TWState): { f: Float64Array; dB: Float64Array; fc: number | null } {
  const k = [s.L, s.nRF, s.ng, s.loss, s.fref, s.expo, s.Z0, s.ZL, s.match, s.logf].join("|");
  if (memo?.k === k) return memo;
  const n = 721, f = new Float64Array(n);
  for (let i = 0; i < n; i++) f[i] = s.logf ? 0.1 * (FMAX / 0.1) ** (i / (n - 1)) : (FMAX * i) / (n - 1);
  const r = s21Curve(Array.from(f, (x) => x * 1e9), params(s), 3);
  memo = { k, f, dB: r.dB, fc: r.fCross_Hz == null ? null : r.fCross_Hz / 1e9 };
  return memo;
}
export const fVel = (s: TWState): number => (Math.abs(s.nRF - s.ng) < 1e-12 ? Infinity : f3dBVelocityMismatch(s.L / 1000, s.nRF - s.ng) / 1e9);
export const fLoss = (s: TWState): number => (s.loss <= 0 ? Infinity : f3dBLossOnly(s.L / 1000, s.loss, s.fref, s.expo === "1" ? 1 : 0.5));
const ghz = (v: number): string => (Number.isFinite(v) ? (v > 9999 ? "&gt;9999 GHz" : `${pad(v.toFixed(1), 6)} GHz`) : "  none    ");
export function twOuts(s: TWState): Record<string, string> {
  const c = curve(s), e = s.expo === "1" ? 1 : 0.5;
  return {
    f3: c.fc == null ? "&gt; 300.0 GHz" : `${pad(c.fc.toFixed(1), 6)} GHz`, dn: pad(Math.abs(s.nRF - s.ng).toFixed(3), 5),
    lossf3: c.fc == null ? "    –   " : `${pad((s.loss * (c.fc / s.fref) ** e * (s.L / 10)).toFixed(2), 5)} dB`,
    fvel: ghz(fVel(s)), floss: ghz(fLoss(s)), L: `${pad(s.L.toFixed(1), 4)} mm`, nRF: pad(s.nRF.toFixed(2), 4), ng: pad(s.ng.toFixed(2), 4),
    loss: `${pad(s.loss.toFixed(2), 5)} dB/cm`, Z0: `${pad(s.Z0.toFixed(1), 5)} Ω`, ZL: s.match ? "  = Z0" : `${pad(s.ZL.toFixed(1), 5)} Ω`, fref: `${s.fref.toFixed(0)} GHz`,
  };
}
export function twPlot(s: TWState, presets: TWPreset[], w: number, h: number, look: Look): string {
  const c = curve(s);
  const p = new Plot({ w, h, look, x: s.logf ? { min: 0.1, max: FMAX, log: true, label: "frequency (GHz)" } : { min: 0, max: FMAX, label: "frequency (GHz)" }, y: { min: -15, max: 3, label: "EO response (dB)", ticks: [-15, -12, -9, -6, -3, 0, 3] } }).axes();
  p.hline(-3, "ref");
  const fv = fVel(s), fl = fLoss(s);
  if (Number.isFinite(fv)) { p.vline(fv, "iso"); if (p.inX(fv)) p.text(p.sx(fv) + 3, p.y1 + (look === "tech" ? 10 : 14), "f<tspan dy='3' font-size='0.8em'>vel</tspan>", "lab"); }
  if (Number.isFinite(fl)) { p.vline(fl, "iso"); if (p.inX(fl)) p.text(p.sx(fl) + 3, p.y1 + (look === "tech" ? 22 : 30), "f<tspan dy='3' font-size='0.8em'>loss</tspan>", "lab"); }
  const pts: [number, number][] = [];
  for (let i = 0; i < c.f.length; i++) pts.push([c.f[i], Math.max(-40, c.dB[i])]);
  p.line(pts, "cur");
  if (c.fc != null) p.add(`<circle class="pt0" cx="${p.sx(c.fc).toFixed(1)}" cy="${p.sy(-3).toFixed(1)}" r="${look === "tech" ? 3.5 : 6}"/>`);
  const pr = presets.find((x) => x.id === s.preset);
  if (pr?.bw != null && p.inX(pr.bw)) {
    const x = p.sx(pr.bw), y = p.sy(-3), r = look === "tech" ? 4 : 6;
    p.add(`<path class="mk pl-${pr.pl.toLowerCase()} ho" d="M${x} ${y - r * 1.25}L${x + r} ${y}L${x} ${y + r * 1.25}L${x - r} ${y}Z"/>`);
    if (pr.gt) p.add(arrow(x + r, y, 1, 0, look === "tech" ? 12 : 16, "bd"));
    p.text(x, y + (look === "tech" ? 16 : 22), `reported ${pr.gt ? "&gt;" : ""}${pr.bw} GHz`, "lab", "middle");
  }
  return p.svg(`dv-plot ${look}`, "Traveling-wave EO response versus frequency");
}
/** VISUAL strip: electrode (Au) of length L to a 40 mm scale, and the RF voltage seen by co-moving light,
 *  cos(2 pi f z (n_RF - n_g)/c) e^{-alpha z} at f = 100 GHz, drawn on the dashed 1550 nm path. */
export function twArt(s: TWState, w: number, h: number): string {
  const k = (w - 48) / 40, x0 = 24, Lp = s.L * k;
  const f = 100e9, e = s.expo === "1" ? 1 : 0.5;
  const a = ((s.loss * 100) / 8.686) * (100 / s.fref) ** e; // Np/m at 100 GHz
  const yE = h * 0.3, yO = h * 0.7, A = h * 0.2;
  const pts: string[] = [];
  const pts2: string[] = [];
  const lamRF = C0 / (f * s.nRF) * 1000; // mm
  for (let i = 0; i <= 400; i++) {
    const z = (s.L * i) / 400; // mm
    const seen = Math.cos((2 * Math.PI * f * (z / 1000) * (s.nRF - s.ng)) / C0 + s.ph) * Math.exp(-a * (z / 1000));
    pts.push(`${(x0 + z * k).toFixed(1)},${(yO - A * seen).toFixed(1)}`);
    const rf = Math.cos((2 * Math.PI * z) / lamRF - s.ph * 3) * Math.exp(-a * (z / 1000));
    pts2.push(`${(x0 + z * k).toFixed(1)},${(yE - 0.45 * A * rf).toFixed(1)}`);
  }
  const xs = x0 + 40 * k;
  return `<svg class="dv-art visual" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img" aria-label="Electrode and the RF voltage seen by the light">`
    + `<text x="${x0}" y="20">${w < 600 ? `100 GHz, n_RF ${s.nRF.toFixed(2)}: λ = ${lamRF.toFixed(2)} mm` : `electrode (Au), RF wave at 100 GHz, n_RF ${s.nRF.toFixed(2)}: λ = ${lamRF.toFixed(2)} mm`}</text>`
    + `<rect class="au" x="${x0}" y="${(yE - 4).toFixed(1)}" width="${Lp.toFixed(1)}" height="8" opacity="0.55"/>`
    + `<polyline class="fl" points="${pts2.join(" ")}"/>`
    + `<path class="dim" d="M${x0} ${yO}H${xs.toFixed(1)}" stroke-dasharray="2 3"/><text x="${xs.toFixed(1)}" y="${(yO - A - 4).toFixed(1)}" text-anchor="end">+1</text><text x="${xs.toFixed(1)}" y="${(yO - 4).toFixed(1)}" text-anchor="end">0</text>`
    + `<polyline class="ir" points="${pts.join(" ")}"/>`
    + `<text x="${x0}" y="${h - 10}">${w < 600 ? "voltage seen by the light" : "voltage seen by one light pulse along the electrode (1 = DC)"}</text>`
    + `<path class="dim" d="M${(xs - 10 * k).toFixed(1)} ${h - 8}H${xs.toFixed(1)}"/><text x="${xs.toFixed(1)}" y="${h - 14}" text-anchor="end">10 mm</text>`
    + `</svg>`;
}

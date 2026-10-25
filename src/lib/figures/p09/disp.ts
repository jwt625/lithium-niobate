// Dispersion model viewer: n(lambda) from the stored coefficients of /api/v1/dispersion.json (src/lib/generated), evaluated
// with src/lib/physics/sellmeier.ts (coefficients mapped onto its Zelmon and Jundt/Gayer forms). Curves are drawn only
// inside each model's validity window; the windows are drawn as bars under the plot.
import { refractiveIndexOrNaN, groupIndex, type DispersionCoefficients } from "$lib/physics/sellmeier.ts";
import { ticks, tfmt } from "./pm.ts";
import { pad } from "../fmt.ts";

export interface DModel {
  id: string; name: string; axis: "o" | "e"; variant: string; status: string; form: string; coefficients: Record<string, number>;
  valid_lambda_um: [number, number]; valid_T_C: [number, number] | null; reference_T_C: number; tdep: boolean;
  errata: { citation?: string; doi?: string; effect?: string; issued?: string; applied?: boolean }[]; caveats: string[];
  checks: { T_C: number; lambda_nm: number; n: number; source: string; tolerance: number }[]; src: string; doi?: string; locator: string;
}

export function physModel(m: DModel): DispersionCoefficients {
  const c = m.coefficients;
  const common = { id: m.id, material: "CLN" as const, axis: m.axis, lambda_um: m.valid_lambda_um, T_ref_C: m.reference_T_C, prov: { source: "", status: "P" as const }, errata: [], isDefault: false, flags: [] };
  if (m.form === "sellmeier-3term") return { ...common, form: "zelmon", coef: [c.B1, c.C1, c.B2, c.C2, c.B3, c.C3], T_range_C: null } as unknown as DispersionCoefficients;
  return { ...common, form: "jundt", a: [c.a1, c.a2, c.a3, c.a4, c.a5, c.a6], b: [c.b1, c.b2, c.b3, c.b4], T_range_C: m.valid_T_C ?? [m.reference_T_C, m.reference_T_C] } as unknown as DispersionCoefficients;
}
export const tFor = (m: DModel, T: number): number => (m.tdep ? T : m.reference_T_C);
export function nAt(m: DModel, lam: number, T: number): number { return refractiveIndexOrNaN(physModel(m), lam, tFor(m, T)); }
export function ngAt(m: DModel, lam: number, T: number): number {
  const pm = physModel(m), t = tFor(m, T);
  if (!Number.isFinite(refractiveIndexOrNaN(pm, lam, t))) return NaN;
  try { return groupIndex(pm, lam, t); } catch { return NaN; }
}

export const X_RANGE: readonly [number, number] = [0.35, 5.2];
const DASH = ["", "6 3", "2 3", "8 3 2 3", "1 2", "10 4", "4 2 1 2"];
const PAD = { l: 56, r: 16, t: 12, b: 32 };

/** SVG inner markup: curves of the selected models, cursor, validity bars below. */
export function dispSVG(models: DModel[], on: string[], T: number, lam: number, log: boolean, W = 1000, H = 420): string {
  const sel = models.filter((m) => on.includes(m.id));
  const barH = 12, bars = models.length * (barH + 4), plotH = H - PAD.t - PAD.b - bars - 18;
  const W0 = W - PAD.l - PAD.r;
  const xv = (l: number): number => (log ? Math.log(l / X_RANGE[0]) / Math.log(X_RANGE[1] / X_RANGE[0]) : (l - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]));
  const X = (l: number): number => PAD.l + xv(l) * W0;
  const curves = sel.map((m) => {
    const xs: number[] = [], ys: number[] = [];
    for (let i = 0; i <= 300; i++) { const u = i / 300; const l = log ? X_RANGE[0] * (X_RANGE[1] / X_RANGE[0]) ** u : X_RANGE[0] + u * (X_RANGE[1] - X_RANGE[0]); xs.push(l); ys.push(nAt(m, l, T)); }
    return { m, xs, ys };
  });
  const all = curves.flatMap((c) => c.ys).filter(Number.isFinite);
  let y0 = all.length ? Math.min(...all) : 2, y1 = all.length ? Math.max(...all) : 2.4;
  const dy = (y1 - y0) * 0.05 || 0.01; y0 -= dy; y1 += dy;
  const Y = (n: number): number => PAD.t + plotH - ((n - y0) / (y1 - y0)) * plotH;
  let g = `<rect x="${PAD.l}" y="${PAD.t}" width="${W0}" height="${plotH}" class="pf-frame"/>`;
  const xt = log ? [0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 3, 4, 5] : ticks(X_RANGE[0], X_RANGE[1], 8).v;
  for (const t of xt) g += `<path d="M${X(t).toFixed(1)} ${PAD.t}V${PAD.t + plotH}" class="pf-grid"/><text x="${X(t).toFixed(1)}" y="${PAD.t + plotH + 15}" text-anchor="middle" class="pf-t">${t}</text>`;
  const yt = ticks(y0, y1, 6);
  for (const t of yt.v) g += `<path d="M${PAD.l} ${Y(t).toFixed(1)}h${W0}" class="pf-grid"/><text x="${PAD.l - 7}" y="${(Y(t) + 3.5).toFixed(1)}" text-anchor="end" class="pf-t">${tfmt(t, yt.d)}</text>`;
  curves.forEach(({ m, xs, ys }) => {
    const k = models.indexOf(m);
    let d = "", pen = false;
    xs.forEach((x, i) => { const y = ys[i]; if (!Number.isFinite(y)) { pen = false; return; } d += `${pen ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`; pen = true; });
    g += `<path d="${d}" class="dp-c dp-${m.axis}" stroke-dasharray="${DASH[k % DASH.length]}"/>`;
  });
  if (lam >= X_RANGE[0] && lam <= X_RANGE[1]) g += `<path d="M${X(lam).toFixed(1)} ${PAD.t}V${PAD.t + plotH}" class="pf-cur"/>`;
  g += `<text x="${PAD.l + W0}" y="${PAD.t + plotH + 29}" text-anchor="end" class="pf-l">wavelength (µm)${log ? ", log axis" : ""}</text><text x="${PAD.l + 6}" y="${PAD.t + 14}" class="pf-l">n</text>`;
  // validity bars
  const by = PAD.t + plotH + 40;
  models.forEach((m, k) => {
    const y = by + k * (barH + 4), on2 = on.includes(m.id);
    g += `<rect x="${X(m.valid_lambda_um[0]).toFixed(1)}" y="${y}" width="${(X(m.valid_lambda_um[1]) - X(m.valid_lambda_um[0])).toFixed(1)}" height="${barH}" class="dp-bar dp-${m.axis}${on2 ? " on" : ""}"/>`;
    g += `<path d="M${X(m.valid_lambda_um[0]).toFixed(1)} ${y + barH / 2}H${X(m.valid_lambda_um[1]).toFixed(1)}" class="dp-c dp-${m.axis}${on2 ? "" : " off"}" stroke-dasharray="${DASH[k % DASH.length]}"/>`;
    g += `<text x="${PAD.l - 7}" y="${y + barH - 2}" text-anchor="end" class="pf-t">${k + 1}</text>`;
  });
  return g;
}


export function readRows(models: DModel[], T: number, lam: number): { id: string; n: string; ng: string; t: string }[] {
  return models.map((m) => ({ id: m.id, n: pad(fmt(nAt(m, lam, T), 5), 7), ng: pad(fmt(ngAt(m, lam, T), 4), 6), t: m.tdep ? `${pad(T.toFixed(1), 5)} °C` : `${pad(m.reference_T_C.toFixed(1), 5)} °C` }));
}
const fmt = (v: number, d: number): string => (Number.isFinite(v) ? v.toFixed(d) : "–");
export const lamFromSl = (v: number): number => +(X_RANGE[0] * (X_RANGE[1] / X_RANGE[0]) ** (v / 1000)).toFixed(4);
export const slFromLam = (l: number): number => Math.round((Math.log(l / X_RANGE[0]) / Math.log(X_RANGE[1] / X_RANGE[0])) * 1000);

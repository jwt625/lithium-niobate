// Spread figure for one property: every record as a mark on a local value axis per group (variant, unit, wavelength for
// scalars; independent component for tensors). Alternatives stay separate marks; no mean or fit is drawn.
import { tfmt, ticks } from "./pm.ts";

export interface SpreadPt { v: number; lo?: number; hi?: number; unc?: number; st: string; label: string }
export interface SpreadRow { label: string; unit: string; pts: SpreadPt[] }

const tick = (v: number, d: number, ref: number): string => (ref !== 0 && (Math.abs(ref) < 1e-3 || Math.abs(ref) >= 1e5) ? (v === 0 ? "0" : v.toExponential(2).replace("-", "−")) : tfmt(v, d));
const gradeCls = (st: string): string => (st === "P" ? "g-p" : st === "P-comp" || st === "P-db" ? "g-pc" : st === "C" ? "g-c" : st === "V" ? "g-v" : "g-s");
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function spreadSVG(rows: SpreadRow[]): string {
  const W = 1100, L = 190, R = 150, RH = 38, H = rows.length * RH + 8;
  let g = "";
  rows.forEach((row, i) => {
    const y = 8 + i * RH + RH / 2;
    const vals = row.pts.flatMap((p) => [p.v, p.lo ?? p.v, p.hi ?? p.v, p.unc !== undefined ? p.v - p.unc : p.v, p.unc !== undefined ? p.v + p.unc : p.v]).filter(Number.isFinite);
    let lo = Math.min(...vals), hi = Math.max(...vals);
    const single = hi - lo < 1e-12 * Math.max(1, Math.abs(hi));
    if (single) { const d = Math.abs(hi) * 0.01 || 1; lo -= d; hi += d; } else { const d = (hi - lo) * 0.12; lo -= d; hi += d; }
    const X = (v: number): number => L + ((v - lo) / (hi - lo)) * (W - L - R);
    g += `<text x="0" y="${y + 4}" class="sp-lab">${esc(row.label)}</text><path d="M${L} ${y}H${W - R}" class="sp-axis"/>`;
    const t = ticks(lo, hi, 4);
    for (const v of t.v) g += `<path d="M${X(v).toFixed(1)} ${y - 3}v6" class="sp-tick"/><text x="${X(v).toFixed(1)}" y="${y + 15}" text-anchor="middle" class="sp-t">${tick(v, t.d, hi)}</text>`;
    for (const p of row.pts) {
      const x = X(p.v), c = gradeCls(p.st);
      if (p.lo !== undefined && p.hi !== undefined) g += `<path d="M${X(p.lo).toFixed(1)} ${y - 6}H${X(p.hi).toFixed(1)}" class="sp-range ${c}"><title>${esc(p.label)}</title></path>`;
      else {
        if (p.unc !== undefined) g += `<path d="M${X(p.v - p.unc).toFixed(1)} ${y}H${X(p.v + p.unc).toFixed(1)}" class="sp-unc"/>`;
        g += `<rect x="${(x - 4).toFixed(1)}" y="${y - 4}" width="8" height="8" transform="rotate(45 ${x.toFixed(1)} ${y})" class="sp-pt ${c}"><title>${esc(p.label)}</title></rect>`;
      }
    }
    const span = Math.max(...row.pts.map((p) => p.hi ?? p.v)) - Math.min(...row.pts.map((p) => p.lo ?? p.v));
    g += `<text x="${W}" y="${y + 4}" text-anchor="end" class="sp-sum">${row.pts.length === 1 ? "1 record" : `${row.pts.length} records, span ${tick(span, Math.max(0, t.d + 1), hi)}`}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="p9-spread" role="img" aria-label="Values of every record on a local axis per group">${g}</svg>`;
}

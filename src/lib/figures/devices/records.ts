// A6 records strip (chart-specs A6): the 20 rows of manuscript 6.12, joined by DOI to src/lib/generated/records.json
// (records dataset id, date, as_of). Each row is drawn on its own log-axis segment (no cross-metric axis).
import { esc } from "./svgplot.ts";

export interface RecRow { metric: string; value: string; cond: string; platform: string; who: string; doi: string; ver: string; num: number; unit: string; q: "" | ">" | "~"; lowerBetter: boolean; id?: string; date: string; asOf?: string }
/** Numeric value, unit and qualifier per DOI, re-keyed from the manuscript Value column. */
export const NUM: Record<string, [number, string, "" | ">" | "~", boolean?]> = {
  "10.1364/prj.521172": [29e6, "intrinsic Q", ""],
  "10.3788/col202220.011902": [1e8, "Q", ">"],
  "10.1063/5.0095146": [1.6e8, "material Q", "~"],
  "10.1364/oe.401959": [0.27, "dB/cm", "", true],
  "10.1364/prj.468518": [170, "GHz", ""],
  "10.1002/lpor.202401092": [0.21, "V cm", "", true],
  "10.1364/oe.572384": [0.33, "V cm", "", true],
  "10.1364/ofc.2025.th4b.7": [440, "GBd", ""],
  "10.1364/OPTICA.449691": [1.96, "Tb/s", ""],
  "10.1364/ofc.2026.th4a.2": [768, "Gb/s", ""],
  "10.1117/1.APN.3.6.066009": [9600, "%/W/cm²", ""],
  "10.1364/OPTICA.403931": [5e6, "%/W", ""],
  "10.1364/OPTICA.442550": [71, "dB", ""],
  "10.1088/1367-2630/ac3d52": [19.6, "µW", "", true],
  "10.1126/science.abo6213": [4.9, "dB", ""],
  "10.1038/s41586-024-08354-4": [450, "nm", ">"],
  "10.1038/s41467-021-24809-y": [1.02, "%", ""],
  "10.1038/s41377-022-00840-6": [0.03, "V cm", "", true],
  "10.1038/s41377-025-01821-1": [140, "GHz", ""],
  "10.1002/lpor.71753": [28, "dB", ">"],
};
interface GenRec { id: string; doi?: string; date?: string; as_of?: string }
export function recordsFromManuscript(md: string, gen: GenRec[]): RecRow[] {
  const s = md.slice(md.indexOf("## 6.12"));
  const byDoi = new Map(gen.filter((g) => g.doi).map((g) => [String(g.doi).toLowerCase(), g]));
  const rows: RecRow[] = [];
  for (const l of s.split("\n")) {
    const c = l.split(" | ").map((x) => x.replace(/^\|\s*|\s*\|$/g, "").trim());
    if (c.length < 7 || !/^10\./.test(c[5])) continue;
    const n = NUM[c[5]];
    if (!n) throw new Error(`records: no numeric value for ${c[5]}`);
    const g = byDoi.get(c[5].toLowerCase());
    const yr = [...c[4].matchAll(/\b(19|20)\d{2}\b/g)].pop()?.[0] ?? "";
    rows.push({ metric: c[0], value: c[1], cond: c[2], platform: c[3], who: c[4], doi: c[5], ver: c[6], num: n[0], unit: n[1], q: n[2], lowerBetter: !!n[3], id: g?.id, date: g?.date ?? yr, asOf: g?.as_of });
  }
  return rows;
}
/** HTML to plain text for aria labels: drop tags, decode the entities the typesetter emits. */
const ENT: Record<string, string> = { micro: "µ", pi: "π", gt: ">", lt: "<", ge: "≥", le: "≤", times: "×", nbsp: " ", minus: "−", Gamma: "Γ", lambda: "λ", eta: "η", nu: "ν", tau: "τ", chi: "χ", amp: "&", plusmn: "±", radic: "√", Delta: "Δ", phi: "φ", omega: "ω", alpha: "α", kappa: "κ", beta: "β", gamma: "γ" };
const plain = (s: string): string => s.replace(/<sup>/g, "^").replace(/<[^>]+>/g, "").replace(/&([a-zA-Z]+);/g, (m, k: string) => ENT[k] ?? m);
const sup = (e: number): string => (e === 0 ? "1" : e === 1 ? "10" : `10<tspan dy="-4" font-size="0.75em">${e < 0 ? "−" : ""}${Math.abs(e)}</tspan>`);
/** One row's log-axis segment: decades floor(log v) - 1 .. + 2, marker at v, arrow for ">" in the increasing direction. */
export function strip(r: RecRow, w: number, h: number, vis: boolean): string {
  const e0 = Math.floor(Math.log10(r.num)) - 1, e1 = e0 + 3;
  const x = (v: number): number => 8 + ((Math.log10(v) - e0) / (e1 - e0)) * (w - 16);
  const y = vis ? h * 0.42 : h * 0.4;
  let t = `<path class="ax" d="M8 ${y}H${w - 8}"/>`;
  for (let e = e0; e <= e1; e++) t += `<path class="ax" d="M${x(10 ** e).toFixed(1)} ${y - 3}V${y + 3}"/><text class="tk" x="${x(10 ** e).toFixed(1)}" y="${h - 1}" text-anchor="middle">${sup(e)}</text>`;
  const X = x(r.num), R = vis ? 6 : 4;
  t += `<path class="rm" d="M${X.toFixed(1)} ${y - R * 1.25}L${(X + R).toFixed(1)} ${y}L${X.toFixed(1)} ${y + R * 1.25}L${(X - R).toFixed(1)} ${y}Z"/>`;
  if (r.q === ">") t += `<path class="bd" d="M${(X + R).toFixed(1)} ${y}h${vis ? 16 : 12}m-4 -3l4 3l-4 3"/>`;
  return `<svg class="dv-strip" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img" aria-label="${esc(plain(`${r.metric}: ${r.value}`))}">${t}</svg>`;
}

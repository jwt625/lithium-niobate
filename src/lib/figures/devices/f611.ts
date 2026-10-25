// F6.11 Microwave-optical transducer efficiency vs year (manuscript 6.7 table, values as reported). No model.
// Year = Crossref issued year of the paper (refs.yaml). Definition classes follow the manuscript wording; where the
// abstract does not name the definition the row is "not stated".
import { Plot, esc, type Look } from "./svgplot.ts";

export interface TxRow { id: string; ref: string; v: number; def: "total" | "internal" | "on-chip" | "not stated"; mech: "cavity EO" | "piezo-optomechanical" | "bulk LN EO"; temp: "cryogenic" | "room" | "not stated"; yr: number; label: string; cond: string; link?: string }
export const TX_BASE: Omit<TxRow, "yr">[] = [
  { id: "holzgrafe2020", ref: "holzgrafe2020", v: 2.7e-5, def: "not stated", mech: "cavity EO", temp: "not stated", label: "TFLN cavity EO", cond: "2.7e-5; definition and temperature not listed in the manuscript table" },
  { id: "mckenna2020", ref: "mckenna2020", v: 6.6e-6, def: "on-chip", mech: "cavity EO", temp: "cryogenic", label: "triply resonant LN on sapphire", cond: "6.6e-6 on chip, cryogenic" },
  { id: "xu2021nc", ref: "xu2021nc", v: 1.02e-2, def: "total", mech: "cavity EO", temp: "cryogenic", label: "TFLN + superconducting resonator", cond: "1.02% total, bidirectional, cryogenic" },
  { id: "xu2021nc-int", ref: "xu2021nc", v: 0.152, def: "internal", mech: "cavity EO", temp: "cryogenic", label: "same device, internal", cond: "15.2% internal" },
  { id: "jiang2020nc", ref: "jiang2020nc", v: 0.055, def: "not stated", mech: "piezo-optomechanical", temp: "room", label: "piezo-optomechanical, room temperature", cond: "5.5% with 323 µW blue-detuned pump; acousto-optic Vπ 0.02 V" },
  { id: "jiang2023np", ref: "jiang2023np", v: 0.05, def: "not stated", mech: "piezo-optomechanical", temp: "cryogenic", label: "optically heralded microwave photon addition", cond: "5% CW conversion; 15 Hz heralding; cryogenic" },
  { id: "weaver2024nn", ref: "weaver2024nn", v: 0.009, def: "not stated", mech: "piezo-optomechanical", temp: "cryogenic", label: "LN-on-Si mechanics interface", cond: "0.9% at 1 µW; 14.8 MHz bandwidth; cryogenic" },
  { id: "warner2025np", ref: "warner2025np", v: 0.0118, def: "not stated", mech: "cavity EO", temp: "cryogenic", label: "optical control of a superconducting qubit", cond: "up to 1.18%; cryogenic" },
  { id: "sahu2022nc", ref: "sahu2022nc", v: 0.087, def: "not stated", mech: "bulk LN EO", temp: "cryogenic", label: "bulk LN (not thin film) whispering-gallery EO", cond: "8.7% at 0.16 added noise photons; cryogenic" },
];
export interface TxState { [k: string]: number | string | boolean; hide: boolean; log: boolean }
export const TX_DEFAULT: TxState = { hide: false, log: true };
const SHAPE: Record<TxRow["mech"], string> = { "cavity EO": "circle", "piezo-optomechanical": "square", "bulk LN EO": "diamond" };
const shown = (s: TxState, r: TxRow): boolean => !(s.hide && (r.def === "internal" || r.def === "on-chip"));
/** VISUAL glyphs: ring resonator, phononic crystal (beam with holes), whispering-gallery disk. */
function glyph(r: TxRow, x: number, y: number, look: Look): string {
  const cls = `mk tx ${r.temp === "room" ? "ho room" : r.temp === "cryogenic" ? "cryo" : "ho ns"}`, a = `data-id="${esc(r.id)}" tabindex="0" aria-label="${esc(r.label)}"`;
  const s = look === "tech" ? 4 : 7;
  if (look === "tech") {
    if (SHAPE[r.mech] === "circle") return `<circle class="${cls}" ${a} cx="${x}" cy="${y}" r="${s}"/>`;
    if (SHAPE[r.mech] === "square") return `<rect class="${cls}" ${a} x="${x - s}" y="${y - s}" width="${2 * s}" height="${2 * s}"/>`;
    return `<path class="${cls}" ${a} d="M${x} ${y - s * 1.3}L${x + s} ${y}L${x} ${y + s * 1.3}L${x - s} ${y}Z"/>`;
  }
  if (r.mech === "cavity EO") return `<g ${a} class="gl-g"><circle class="${cls}" cx="${x}" cy="${y}" r="${s}" style="fill:none;stroke-width:2.5"/><circle class="${cls}" cx="${x}" cy="${y}" r="2"/></g>`;
  if (r.mech === "piezo-optomechanical") return `<g ${a} class="gl-g"><rect class="${cls}" x="${x - s * 1.4}" y="${y - s * 0.55}" width="${s * 2.8}" height="${s * 1.1}"/>${[-0.8, 0, 0.8].map((k) => `<circle cx="${x + k * s}" cy="${y}" r="1.6" class="hole"/>`).join("")}</g>`;
  return `<g ${a} class="gl-g"><ellipse class="${cls}" cx="${x}" cy="${y}" rx="${s * 1.3}" ry="${s * 0.6}"/></g>`;
}
export function txPlot(rows: TxRow[], s: TxState, w: number, h: number, look: Look): string {
  const p = new Plot({ w, h, look, x: { min: 2019.5, max: 2025.5, label: "year (Crossref issued)", ticks: [2020, 2021, 2022, 2023, 2024, 2025], fmt: (v) => String(v) }, y: s.log ? { min: 1e-6, max: 1, log: true, label: "conversion efficiency" } : { min: 0, max: 0.2, label: "conversion efficiency", ticks: [0, 0.05, 0.1, 0.15, 0.2] } }).axes();
  const tot = rows.find((r) => r.id === "xu2021nc"), int = rows.find((r) => r.id === "xu2021nc-int");
  if (tot && int && shown(s, int)) p.add(`<path class="ref" d="M${p.sx(tot.yr)} ${p.sy(tot.v).toFixed(1)}V${p.sy(int.v).toFixed(1)}"/>`);
  // jitter rows sharing a year so markers do not overlap (display only; x is the year)
  const seen = new Map<number, number>();
  for (const r of rows) {
    if (!shown(s, r)) continue;
    const n = seen.get(r.yr) ?? 0; seen.set(r.yr, n + 1);
    const x = p.sx(r.yr) + (n % 2 ? 1 : -1) * Math.ceil(n / 2) * (look === "tech" ? 9 : 14);
    p.add(glyph(r, Math.round(x), Math.round(p.sy(r.v)), look));
  }
  return p.svg(`dv-plot ${look}`, "Transducer efficiency versus year");
}
export function txHover(rows: TxRow[], id: string): string | null {
  const r = rows.find((x) => x.id === id);
  if (!r) return null;
  return `<div class="hc-id">${esc(r.label)}</div><div class="hc-kv"><span>efficiency</span><b>${r.v >= 0.001 ? `${(r.v * 100).toPrecision(3)}%` : r.v.toExponential(1)}</b><span>definition</span><b>${r.def}</b><span>mechanism</span><b>${r.mech}</b><span>temperature</span><b>${r.temp}</b><span>year</span><b>${r.yr}</b></div><div class="hc-n">${esc(r.cond)}</div>${r.link ? `<div class="hc-l"><a href="${esc(r.link)}" target="_blank" rel="noopener">${esc(r.link.replace("https://doi.org/", "doi:"))}</a> · reported</div>` : ""}`;
}

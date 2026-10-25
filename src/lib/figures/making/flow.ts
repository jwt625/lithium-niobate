// Process-flow data shipped to the Process viewer (shared by server and client). Built on the server from
// content/chapters/05-making/process-flow.yaml by flow-build.ts; this file holds the types, route navigation, timing and
// fixed-width readout formats (figures.md F05-01 "Fixed readout formats").
import type { Geom, Route } from "./xsec.ts";

export type PStatus = "reported" | "derived" | "template" | "na";
export interface PD {
  k: string; // parameter key
  v: string; // display value (HTML, fixed format)
  u: string; // unit (HTML)
  st: PStatus;
  an: boolean; // analog (value from a paper other than the route anchor, or LiTaO3)
  src: string | null; // source key
  loc: string | null;
  note: string | null;
  f: string | null; // formula of a derived value
  r: string[] | null; // routes the parameter applies to (null = all)
  pop: string; // popup key
}
export interface StepD {
  id: string; phase: string; name: string; routes: string[];
  primary: string; inset: string | null; tool: string; part: string;
  retarget: boolean; reason: string | null;
  params: PD[]; dur: PD; physics: string; note: string | null;
  /** real process time of the step for the HUD: minutes per unit t (null = not reported) and its label */
  tmin: number | null; tlabel: string; tst: PStatus;
  weight: number;
}
export interface FlowData {
  routes: { id: Route; label: string; anchor: string }[];
  steps: StepD[];
  order: Record<Route, string[]>;
  geom: Geom;
  counts: Record<Route, { reported: number; analog: number; derived: number; template: number; na: number; total: number }>;
}

export const STEP_SECONDS = 6; // playback seconds per step at 1x (E2)
export const SPEEDS = [0.5, 1, 2, 4] as const;
export const PHASES = ["crystal", "wafer", "lnoi", "device", "backend"] as const;

export const FS = " "; // figure space
export const padL = (s: string, n: number): string => s.padStart(n, FS);

/** Steps of a route in order. */
export const routeSteps = (F: FlowData, r: Route): StepD[] => F.order[r].map((id) => F.steps.find((s) => s.id === id) as StepD);

/** Route switch (E9): keep the step when it exists in both routes, else jump to the nearest shared step. */
export function switchRoute(F: FlowData, from: Route, to: Route, id: string): string {
  if (F.order[to].includes(id)) return id;
  const a = F.order[from], k = a.indexOf(id);
  let best = F.order[to][0], bd = Infinity;
  a.forEach((sid, i) => { if (F.order[to].includes(sid)) { const d = Math.abs(i - k) + (i > k ? 0.5 : 0); if (d < bd) { bd = d; best = sid; } } });
  return best;
}

/** Status mix "3r 1d 0t 1n a2" of a step for a route (fixed width). */
export function mix(s: StepD, r: Route): { r: number; d: number; t: number; n: number; a: number } {
  const ps = s.params.filter((p) => !p.r || p.r.includes(r));
  return { r: ps.filter((p) => p.st === "reported").length, d: ps.filter((p) => p.st === "derived").length, t: ps.filter((p) => p.st === "template").length, n: ps.filter((p) => p.st === "na").length, a: ps.filter((p) => p.an).length };
}

/** Real elapsed process time at t (fixed 8 ch "####.# u"), or n/a. */
export function procTime(s: StepD, t: number): string {
  if (s.tmin === null) return padL("n/a", 8);
  let m = s.tmin * t;
  let u = "min";
  if (m >= 120) { m /= 60; u = "h"; } else if (m < 1) { m *= 60; u = "s"; }
  return padL(m.toFixed(1), 6) + " " + u.padEnd(3, FS);
}

export interface Profile { label: string; unit: string; x: number[]; y: number[]; st: PStatus; note: string }
/** Mini profile of a step (E8): quantity vs normalized step time; null when the step has none. Values from the flow. */
export function profileOf(F: FlowData, s: StepD, r: Route): Profile | null {
  const g = F.geom;
  const p = (k: string): PD | undefined => s.params.find((x) => x.k === k);
  switch (s.id) {
    case "s03_pull": return { label: "L(t)", unit: "mm", x: [0, 1], y: [0, g.boule.L_mm], st: "derived", note: "body length at the 1.5 mm/h midpoint; time axis 0 to 73.3 h" };
    case "s07_handle": return { label: "oxide(t)", unit: "µm", x: [0, 1], y: [0, g.ox], st: "template", note: "growth law not drawn; end value reported" };
    case "s08_implant": return { label: "fluence(t)", unit: "10<sup>16</sup> cm<sup>−2</sup>", x: [0, 1], y: [0, 4], st: "template", note: "linear in playback time; end value reported (analog)" };
    case "s10_split": return { label: "T(t)", unit: "°C", x: [0, 0.3, 0.55, 0.62, 1], y: [25, 200, 200, 230, 230], st: "template", note: "time axis template; strengthening drawn at its < 200 °C bound, split about 230 °C (analog)" };
    case "s11_cmp": return { label: "thickness(t)", unit: "nm", x: [0, 1], y: [g.split * 1000, g.target * 1000], st: "derived", note: "end points from the flow; removal rate template (no LN Preston coefficient)" };
    case "s13r_hardmask": return { label: "SiO<sub>2</sub>(t)", unit: "nm", x: [0, 1], y: [0, g.hmSio2 * 1000], st: "template", note: "deposition rate not reported; end value reported" };
    case "s13s_hardmask": return { label: "DLC(t)", unit: "nm", x: [0, 1], y: [0, g.dlc * 1000], st: "template", note: "deposition rate not reported; end value reported" };
    case "s17r_ln_etch": return { label: "depth(t)", unit: "nm", x: [0, 0.1, 0.9, 1], y: [0, 0, g.etchRidge * 1000, g.etchRidge * 1000], st: "derived", note: `etch over 12.5 min at the analog rate ${p("etch_rate")?.v ?? ""} nm/min` };
    case "s16s_ln_etch": return { label: "depth(t)", unit: "nm", x: [0, 0.1, 0.9, 1], y: [0, 0, g.etchStrip * 1000, g.etchStrip * 1000], st: "template", note: "etch rate not reported: time axis normalized" };
    case "s19r_clad": return { label: "cladding(t)", unit: "nm", x: [0, 0.1, 0.9, 1], y: [0, 0, g.clad * 1000, g.clad * 1000], st: "template", note: "deposition rate not reported; end value reported" };
    case "s20r_electrodes": case "s18s_electrodes": {
      const au = r === "ridge_duv" ? g.auRidge : g.auStrip + g.tiStrip;
      return { label: "metal(t)", unit: "nm", x: [0, 0.15, 0.85, 1], y: [0, 0, au * 1000, au * 1000], st: "template", note: "evaporation rate not reported; end value reported" };
    }
    default: return null;
  }
}

/** Hash state "#route=ridge_duv&step=s17r_ln_etch&t=0.40". */
export function parseHash(h: string): { route?: Route; step?: string; t?: number } | null {
  if (!h.includes("route=") && !h.includes("step=")) return null;
  const p = new URLSearchParams(h.replace(/^#/, ""));
  const route = p.get("route");
  const t = Number(p.get("t"));
  return { route: route === "ridge_duv" || route === "strip_dlc" ? route : undefined, step: p.get("step") ?? undefined, t: Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : undefined };
}
export const hashOf = (r: Route, id: string, t: number): string => `#route=${r}&step=${id}&t=${t.toFixed(2)}`;

/** F05-09 row (built on the server from manuscript 5.7 and refs.yaml). */
export interface LossRow { key: string; who: string; year: number; issued: string; route: string; metric: string; dbm: number; bound: "" | "<"; viaQ: boolean; status: string; doi: string | null; pop: string }

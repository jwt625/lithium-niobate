// Process viewer core model: the scene state is a pure function of (route, step index, t in [0, 1]) (research/R13,
// figures.md F05-01 E1). No DOM, no three.js, no clock, no randomness, so forward play, reverse play and scrubbing are
// evaluations at other (step, t) and can be hashed and compared (check P1).
// Steps and parameters (PDims) come from content/chapters/05-making/process-flow.yaml via the generated FLOW; bodies,
// tools and the illustrative z-map from assets3d/process.toml (DIMS.process). Covered: LNOI formation and lithography,
// s07 handle oxidation, s08 implant, s09 bond, s10 split, s11 CMP, s12 recovery anneal, s13 hard mask, s14r coat,
// s15r / s14s exposure.
import { DIMS, FLOW } from "../generated/scene-data.ts";
import type { PDim } from "../types.ts";

export type Route = "ridge_duv" | "strip_dlc";
export type Phase = "approach" | "ops" | "retract";
export type ToolKind = "furnace" | "implanter" | "bonder" | "oven" | "cmp" | "pecvd" | "spin" | "stepper";

export interface StepDef {
  id: string;
  phase: string;
  name: string;
  routes: readonly string[];
  scale: { primary: string; inset: string | null };
  tool: { id: string; involved_part: string };
  camera: { retarget: boolean; reason?: string };
  params: Record<string, PDim & { routes?: readonly string[] }>;
  duration: PDim;
  physics?: string;
  note?: string;
}

const P = DIMS.process;
const num = (d: { value: unknown }): number => d.value as number;
const STEP_BY_ID = new Map<string, StepDef>((FLOW.steps as unknown as StepDef[]).map((s) => [s.id, s]));

/** Steps of a route in viewer order. */
export function routeSteps(route: Route): StepDef[] {
  const ids = (route === "ridge_duv" ? P.meta.steps_ridge_duv : P.meta.steps_strip_dlc) as readonly string[];
  return ids.map((id) => STEP_BY_ID.get(id)!).filter(Boolean);
}

export const WAFER_D = num(P.bodies.wafer_diameter); // mm
export const EDGE_EXCL = num(P.bodies.edge_exclusion); // mm
export const FIELD = (P.bodies.reticle_field.value as unknown as number[])[0]; // mm

const pv = (step: StepDef | undefined, key: string): unknown => step?.params[key]?.value;
const S = (id: string): StepDef | undefined => STEP_BY_ID.get(id);

// physical thicknesses (true scale), with provenance in the YAML / TOML
export const TH = {
  si_ridge_um: pv(S("s07_handle"), "handle_si_thickness_ridge") as number, // 500, luke2020
  si_strip_um: pv(S("s07_handle"), "handle_si_thickness_strip") as number, // 525, li2023nc
  oxide_um: pv(S("s07_handle"), "thermal_oxide") as number, // 4.7, luke2020
  donor_um: num(P.bodies.donor_thickness), // 500, R09:S3 (analog)
  split_um: pv(S("s08_implant"), "projected_peak_depth") as number, // 0.68, guarino2007 (analog)
  target_nm: pv(S("s11_cmp"), "target_film") as number, // 600, luke2020
  hm_sio2_nm: pv(S("s13r_hardmask"), "thickness") as number, // 650, luke2020
  hm_dlc_nm: pv(S("s13s_hardmask"), "dlc_thickness") as number, // 300, li2023nc
  arc_nm: pv(S("s14r_coat"), "arc") as number, // 60, luke2020
  resist_nm: pv(S("s14r_coat"), "resist") as number, // 600, luke2020
};

export interface Field { cx: number; cy: number }
/** Full reticle fields inside the wafer minus the edge exclusion; best of the four half-field grid offsets (derived). */
export function fieldLayout(waferD = WAFER_D, excl = EDGE_EXCL, field = FIELD): { fields: Field[]; offset: [number, number] } {
  const R = waferD / 2 - excl;
  let best: Field[] = [], bo: [number, number] = [0, 0];
  for (const ox of [0, 0.5]) for (const oy of [0, 0.5]) {
    const f: Field[] = [];
    const n = Math.ceil(R / field) + 1;
    for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
      const x0 = (i - ox) * field, y0 = (j - oy) * field, x1 = x0 + field, y1 = y0 + field;
      const far = Math.max(Math.hypot(x0, y0), Math.hypot(x1, y0), Math.hypot(x0, y1), Math.hypot(x1, y1));
      if (far <= R + 1e-9) f.push({ cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });
    }
    if (f.length > best.length) { best = f; bo = [ox, oy]; }
  }
  // serpentine exposure order (template): rows by y, alternating x direction
  const rows = [...new Set(best.map((f) => f.cy))].sort((a, b) => b - a);
  const ordered: Field[] = [];
  rows.forEach((y, r) => { const row = best.filter((f) => f.cy === y).sort((a, b) => (r % 2 ? b.cx - a.cx : a.cx - b.cx)); ordered.push(...row); });
  return { fields: ordered, offset: bo };
}

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const smooth = (x: number): number => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const PH = P.timing.phases.value as unknown as [number, number];

export interface ProcState {
  route: Route;
  stepIndex: number;
  stepId: string;
  t: number;
  phase: Phase;
  u: number; // progress through ops, 0-1
  handle: { x: number; siUm: number; oxideUm: number; oxideFrac: number };
  donor: { present: boolean; x: number; y: number; flip: number; implant: number; peel: number; split: boolean; tilt: number };
  film: { present: boolean; nm: number; rough: number; rim: boolean };
  bondWave: number; // contact radius fraction, 0-1
  hardmask: { kind: "sio2" | "dlc" | null; nm: number; frac: number };
  resist: { nm: number; frac: number; radius: number }; // radius fraction of the spread puddle
  exposed: number; // number of exposed fields (fractional while exposing)
  tool: { kind: ToolKind; x: number; y: number; z: number; spin: number; active: number; lift: number };
  frame: string; // camera frame id (changes only at retarget steps)
}

/** Camera frame id at a step: the frame of the most recent retarget step at or before it (E5). */
export function frameAt(route: Route, stepIndex: number): string {
  const steps = routeSteps(route);
  let f = steps[0]?.id ?? "";
  for (let i = 0; i <= stepIndex && i < steps.length; i++) if (i === 0 || steps[i].camera.retarget) f = steps[i].id;
  return f;
}

/** Scene state at (route, step, t). Pure. */
export function evaluate(route: Route, stepIndex: number, tIn: number): ProcState {
  const steps = routeSteps(route);
  const k = Math.max(0, Math.min(steps.length - 1, Math.floor(stepIndex)));
  const t = clamp01(tIn), id = steps[k].id;
  const phase: Phase = t < PH[0] ? "approach" : t <= PH[1] ? "ops" : "retract";
  const u = clamp01((t - PH[0]) / (PH[1] - PH[0]));
  const idx = (sid: string): number => steps.findIndex((s) => s.id === sid);
  const done = (sid: string): boolean => { const i = idx(sid); return i >= 0 && k > i; };
  const at = (sid: string): boolean => id === sid;
  const siUm = route === "ridge_duv" ? TH.si_ridge_um : TH.si_strip_um;

  // ---- handle: oxide grows in s07 (linear in ops; template rate)
  const oxideFrac = done("s07_handle") ? 1 : at("s07_handle") ? u : 0;
  const pairStage = !done("s08_implant"); // s07, s08: handle and donor side by side
  const handle = { x: pairStage ? 62 : 0, siUm, oxideUm: TH.oxide_um * oxideFrac, oxideFrac };

  // ---- donor
  const implant = done("s08_implant") ? 1 : at("s08_implant") ? u : 0;
  let flip = 0, dx = -62, dy = 0, peel = 0, tilt = 0;
  if (done("s09_bond")) { flip = 1; dx = 0; dy = 0; }
  else if (at("s09_bond")) {
    // approach: flip about the donor's in-plane Y axis while moving over the handle; ops: descend to contact
    const a = smooth(t / PH[0]);
    flip = a; dx = -62 + 62 * a; dy = 40 * (1 - smooth((t - PH[0]) / (PH[1] - PH[0]) * 1.4));
  }
  const split = done("s10_split") || (at("s10_split") && u >= 0.62);
  if (at("s10_split") && u >= 0.62) { const w = smooth((u - 0.62) / 0.38 + (phase === "retract" ? 1 : 0)); peel = w; tilt = 0.5 * w; }
  if (done("s10_split")) peel = 1;
  const donorPresent = k >= idx("s08_implant") && !done("s10_split");
  const donor = { present: donorPresent, x: dx, y: dy + (peel > 0 ? 70 * peel : 0), flip, implant, peel, split, tilt };

  // ---- film after split; CMP thins it
  let nm = TH.split_um * 1000;
  if (at("s11_cmp")) nm = TH.split_um * 1000 + (TH.target_nm - TH.split_um * 1000) * u;
  if (done("s11_cmp")) nm = TH.target_nm;
  const film = { present: split, nm, rough: done("s11_cmp") ? 0 : at("s11_cmp") ? 1 - u : 1, rim: split };

  // ---- bonding wave
  const bondWave = done("s09_bond") ? 1 : at("s09_bond") ? clamp01((u - 0.55) / 0.45) : 0;

  // ---- hard mask, resist, exposure
  const hmStep = route === "ridge_duv" ? "s13r_hardmask" : "s13s_hardmask";
  const hmFrac = done(hmStep) ? 1 : at(hmStep) ? u : 0;
  const hardmask = { kind: hmFrac > 0 ? (route === "ridge_duv" ? "sio2" as const : "dlc" as const) : null, nm: (route === "ridge_duv" ? TH.hm_sio2_nm : TH.hm_dlc_nm) * hmFrac, frac: hmFrac };
  const coat = route === "ridge_duv" ? (done("s14r_coat") ? 1 : at("s14r_coat") ? u : 0) : (k >= idx("s14s_expose") ? 1 : 0);
  const resist = { nm: (TH.arc_nm + TH.resist_nm) * (coat > 0 ? 1 : 0), frac: coat, radius: coat };
  const expStep = route === "ridge_duv" ? "s15r_expose" : "s14s_expose";
  const nF = fieldLayout().fields.length;
  const exposed = done(expStep) ? nF : at(expStep) ? nF * u : 0;

  // ---- tool pose (only the most involved part; template geometry)
  const tool = toolPose(id, t, phase, u, exposed);
  return { route, stepIndex: k, stepId: id, t, phase, u, handle, donor, film, bondWave, hardmask, resist, exposed, tool, frame: frameAt(route, k) };
}

function toolPose(id: string, t: number, phase: Phase, u: number, exposed: number): ProcState["tool"] {
  const lift = phase === "approach" ? 1 - smooth(t / PH[0]) : phase === "retract" ? smooth((t - PH[1]) / (1 - PH[1])) : 0;
  const active = phase === "ops" ? 1 : 0;
  const spin = t * 6 * 2 * Math.PI * 0.5; // display rotation: 0.5 turn per second at 1x over the 6 s step (template)
  const base = { x: 0, y: 0, z: 0, spin, active, lift };
  if (id === "s07_handle" || id === "s12_recovery_anneal") return { kind: "furnace", ...base, x: id === "s07_handle" ? 62 : 0 };
  if (id === "s08_implant") {
    // raster scan over the donor (template order): 8 lines, back and forth
    const lines = 8, s = u * lines, line = Math.min(lines - 1, Math.floor(s)), f = s - line;
    const xr = (line % 2 ? 1 - f : f) * 2 - 1, zr = (line / (lines - 1)) * 2 - 1;
    return { kind: "implanter", ...base, x: -62 + xr * 40, z: zr * 40 };
  }
  if (id === "s09_bond") return { kind: "bonder", ...base };
  if (id === "s10_split") return { kind: "oven", ...base };
  if (id === "s11_cmp") return { kind: "cmp", ...base, x: 18 * Math.sin(2 * Math.PI * u * 2), z: 10 * Math.cos(2 * Math.PI * u * 2) };
  if (id === "s13r_hardmask" || id === "s13s_hardmask") return { kind: "pecvd", ...base };
  if (id === "s14r_coat") return { kind: "spin", ...base };
  // stepper: lens over the field being exposed
  const L = fieldLayout().fields, i = Math.min(L.length - 1, Math.floor(exposed));
  const f = L[Math.max(0, i)] ?? { cx: 0, cy: 0 };
  return { kind: "stepper", ...base, x: f.cx, z: -f.cy };
}

// ------------------------------------------------------------------ HUD
export interface HudParam { key: string; value: string; unit: string; status: string; analog: boolean; source: string | null; locator: string | null; note: string | null; formula: string | null }
export interface Hud {
  step: { n: number; N: number; id: string; name: string; route: Route; phaseGroup: string; tool: string; involvedPart: string; scale: { primary: string; inset: string | null } };
  phase: Phase;
  t: number;
  processTime: HudParam; // real process time of the step (status from the YAML; often na)
  params: HudParam[];
  profile: { kind: string; unit: string; x: number[]; y: number[]; cursor: number; status: string; note: string } | null;
  derived: { fieldsPerWafer: number; fieldOffset: [number, number]; filmNm: number };
  notes: string[];
}

function fmtValue(v: unknown): string {
  if (v === null || v === undefined) return "n/a";
  if (Array.isArray(v)) return v.map((x) => fmtValue(x)).join("-");
  if (typeof v === "number") return Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(1) : String(v);
  return String(v);
}
function hudParam(key: string, d: PDim & { routes?: readonly string[] }): HudParam {
  return { key, value: fmtValue(d.value), unit: d.unit ?? "", status: String(d.status), analog: !!d.analog, source: d.source ?? null, locator: d.locator ?? null, note: d.note ?? null, formula: d.formula ?? null };
}

/** HUD data for the page lane (the scene draws no text). */
export function hud(route: Route, stepIndex: number, t: number): Hud {
  const s = evaluate(route, stepIndex, t), steps = routeSteps(route), st = steps[s.stepIndex];
  const params = Object.entries(st.params).filter(([, d]) => !d.routes || d.routes.includes(route)).map(([k, d]) => hudParam(k, d));
  const { fields, offset } = fieldLayout();
  if (st.id === "s15r_expose" || st.id === "s14s_expose") params.push({ key: "fields_per_wafer (computed)", value: String(fields.length).padStart(3, "0"), unit: "", status: "derived", analog: false, source: null, locator: null, note: null, formula: `full ${FIELD} x ${FIELD} mm fields inside ${WAFER_D} mm minus ${EDGE_EXCL} mm edge exclusion, best of four half-field grid offsets` });
  let profile: Hud["profile"] = null;
  const cursor = s.u;
  if (st.id === "s11_cmp") profile = { kind: "thickness(t)", unit: "nm", x: [0, 1], y: [TH.split_um * 1000, TH.target_nm], cursor, status: "derived", note: "linear in playback time; the removal rate is template (no LN Preston coefficient)" };
  if (st.id === "s07_handle") profile = { kind: "oxide(t)", unit: "um", x: [0, 1], y: [0, TH.oxide_um], cursor, status: "template", note: "growth law not drawn (oxidation temperature n/a); end value reported" };
  if (st.id === "s08_implant") profile = { kind: "fluence(t)", unit: "cm^-2", x: [0, 1], y: [0, pv(st, "fluence") as number], cursor, status: "template", note: "linear in playback time; end value reported (analog)" };
  if (st.id === "s10_split") profile = { kind: "T(t)", unit: "C", x: [0, 0.3, 0.55, 0.62, 1], y: [25, 200, 200, 230, 230], cursor, status: "template", note: "time axis template; '< 200 C' strengthening drawn at its bound, ~230 C split (er_smartcut2022, analog)" };
  return {
    step: { n: s.stepIndex + 1, N: steps.length, id: st.id, name: st.name, route, phaseGroup: st.phase, tool: st.tool.id, involvedPart: st.tool.involved_part, scale: st.scale },
    phase: s.phase, t: s.t,
    processTime: hudParam("duration", st.duration),
    params, profile,
    derived: { fieldsPerWafer: fields.length, fieldOffset: offset, filmNm: s.film.present ? s.film.nm : 0 },
    notes: noteFor(st.id),
  };
}

function noteFor(id: string): string[] {
  const n: string[] = [];
  if (id === "s11_cmp") n.push("drawn face-up so the film stays visible; production CMP holds the wafer face-down on the pad");
  if (id === "s09_bond") n.push("donor flipped about its in-plane Y axis: the implanted +X face goes down into the bond (check P8)");
  if (id === "s10_split") n.push("split surface drawn rough until CMP (template roughness)");
  if (id === "s15r_expose" || id === "s14s_expose") n.push("serpentine field order is template");
  if (id === "s12_recovery_anneal") n.push("anneal temperature not public (n/a): no temperature colour is drawn");
  return n;
}

/** Stable hash of a state (FNV-1a over canonical JSON with 6-digit numbers). */
export function stateHash(s: ProcState): string {
  const j = JSON.stringify(s, (_k, v) => (typeof v === "number" ? Number(v.toFixed(6)) : v));
  let h = 0x811c9dc5;
  for (let i = 0; i < j.length; i++) { h ^= j.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

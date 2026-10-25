// Footer MZM bias meter parameters (lane FIX-S). The 4.7 drift simulator (/quirks/dc-bias-drift/, F08Drift.svelte) writes
// the reader's stack here (setBiasParams, debounced); the footer meter evaluates the layered relaxation (physics/drift.ts)
// from getBiasParams(). Persisted in localStorage ("ln-bias"); every access in try/catch (private windows, blocked storage).
// Absent or invalid stored data -> BIAS_DEFAULT, the simulator's own start state (preset "TFLN clad", 295 K, 0.5 eV, V/Vpi 0.5).
import { DRIFT_PRESETS } from "$lib/physics/pyro.ts";
import { driftModel } from "$lib/physics/drift.ts";

export interface BiasLayer { name: string; epsR: number; sigma: number; thickness_m: number }
/** Shape written by the 4.7 simulator. layers[0] is the LN film; sigma values are already at T_K (Arrhenius applied). */
export interface BiasParams {
  source: string;
  preset: string;
  layers: BiasLayer[];
  T_K: number;
  Ea_eV: number;
  vOverVpi: number;
  taus: number[];
}

const KEY = "ln-bias";
const EVT = "ln-bias";
export const BIAS_SOURCE_PAGE = "/quirks/dc-bias-drift/";

const clad = DRIFT_PRESETS.find((p) => p.id === "clad") ?? DRIFT_PRESETS[0];
const defLayers: BiasLayer[] = clad.layers.map((l, i) => ({ name: l.name ?? `layer ${i}`, epsR: l.epsR, sigma: l.sigma, thickness_m: l.thickness_m }));
export const BIAS_DEFAULT: Readonly<BiasParams> = Object.freeze({
  source: "default",
  preset: clad.id,
  layers: defLayers,
  T_K: 295,
  Ea_eV: 0.5,
  vOverVpi: 0.5,
  taus: driftModel(defLayers.map((l) => ({ name: l.name, thickness_m: l.thickness_m, eps_r: l.epsR, sigma_S_per_m: l.sigma }))).taus,
});

/** Preset id -> label used on 4.7. */
export const presetLabel = (id: string): string => DRIFT_PRESETS.find((p) => p.id === id)?.label ?? id;

const num = (v: unknown, lo: number, hi: number): v is number => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
const str = (v: unknown): v is string => typeof v === "string" && v.length <= 80;

/** Validated copy, or null when the object does not have the simulator's shape and physical ranges. */
export function validBiasParams(p: unknown): BiasParams | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (!str(o.source) || !str(o.preset) || !Array.isArray(o.layers) || o.layers.length < 1 || o.layers.length > 8) return null;
  if (!num(o.T_K, 1, 2000) || !num(o.Ea_eV, 0, 5) || !num(o.vOverVpi, 1e-3, 10)) return null;
  const layers: BiasLayer[] = [];
  for (const l of o.layers as unknown[]) {
    if (!l || typeof l !== "object") return null;
    const r = l as Record<string, unknown>;
    if (!num(r.epsR, 1, 1e4) || !num(r.sigma, 0, 1e3) || !num(r.thickness_m, 1e-10, 1e-1)) return null;
    layers.push({ name: str(r.name) ? r.name : "", epsR: r.epsR, sigma: r.sigma, thickness_m: r.thickness_m });
  }
  const taus = Array.isArray(o.taus) ? (o.taus as unknown[]).filter((t): t is number => num(t, 0, 1e30)).slice(0, 16) : [];
  return { source: o.source, preset: o.preset, layers, T_K: o.T_K, Ea_eV: o.Ea_eV, vOverVpi: o.vOverVpi, taus };
}

const copy = (p: Readonly<BiasParams>): BiasParams => ({ ...p, layers: p.layers.map((l) => ({ ...l })), taus: [...p.taus] });

/** Last parameters the reader chose on 4.7, else the defaults. */
export function getBiasParams(): BiasParams {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch { raw = null; }
  if (raw) {
    try { const v = validBiasParams(JSON.parse(raw)); if (v) return v; } catch { /* corrupt entry: defaults */ }
  }
  return copy(BIAS_DEFAULT);
}

/** Store parameters (validated). Returns false and keeps the previous value when p is invalid. */
export function setBiasParams(p: unknown): boolean {
  const v = validBiasParams(p);
  if (!v) return false;
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage blocked: still notify this page */ }
  try { window.dispatchEvent(new CustomEvent<BiasParams>(EVT, { detail: v })); } catch { /* no window (SSR) */ }
  return true;
}

/** Subscribe to changes (this tab and other tabs). Returns the unsubscribe function. */
export function onBiasParams(cb: (p: BiasParams) => void): () => void {
  const own = (e: Event): void => cb((e as CustomEvent<BiasParams>).detail);
  const other = (e: StorageEvent): void => { if (e.key === KEY) cb(getBiasParams()); };
  window.addEventListener(EVT, own);
  window.addEventListener("storage", other);
  return () => { window.removeEventListener(EVT, own); window.removeEventListener("storage", other); };
}

// Chapter 02 landing: shell overrides and the static door drawings (computed at prerender).
import type { PageMeta } from "$lib/content/site";
import { qpmPeriodSHG, nCLN } from "$lib/figures/optics";
import { maxWalkoff } from "$lib/physics/ellipsoid.ts";
import { lightContent } from "$lib/figures/light/content.server";
import type { StatusCode } from "$lib/content/site";

const RAW = import.meta.glob(["./+page.server.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/** Section overview rows: depth keywords (manuscript sections 2.1-2.7) and headline numbers with status and source. */
export interface KeyNum { v: string; what: string; code: StatusCode; pop: string }
function overview(): Record<string, { l1: string; l2: string; l3: string; keys: KeyNum[] }> {
  const no = nCLN("o", 1.55), ne = nCLN("e", 1.55), wo = maxWalkoff(no, ne);
  return {
    birefringence: { l1: "negative uniaxial; conoscope rings and isogyres; a transverse field makes the crystal biaxial", l2: "index ellipsoid, n<sub>e</sub>(&theta;), walk-off; Sellmeier models and the 5 mol% MgO erratum; dn/dT", l3: "exact plane-wave retardance; eigen-decomposition of the impermeability; model-to-model error budget",
      keys: [{ v: `${no.toFixed(4)} / ${ne.toFixed(4)}`, what: "n<sub>o</sub> / n<sub>e</sub>, 1550 nm, 21 &deg;C", code: "derived", pop: "r:zelmon1997" }, { v: `${wo.rho_deg.toFixed(3)}&deg;`, what: "largest walk-off, 1550 nm", code: "derived", pop: "r:zelmon1997" }] },
    "pockels-effect": { l1: "&Delta;n = &minus;&frac12;n<sup>3</sup>rE; a TFLN MZM", l2: "3m r tensor, clamped and free sets, device mapping", l3: "power-normalized FEM overlap of a real modulator cross-section",
      keys: [{ v: "28.8 / 30.8 pm/V", what: "r<sub>33</sub>, clamped, Kaminow 1980 / Turner 1966, 633 nm", code: "P-comp", pop: "r:weis1985" }, { v: "2.90 V", what: "V<sub>&pi;</sub> of a 9 mm TFLN MZM, Li et al. 2026", code: "reported", pop: "r:li2026aa" }] },
    "second-order": { l1: "SHG, SFG, DFG; coherence length; periodic poling", l2: "3m d tensor, QPM, &eta;<sub>norm</sub>, acceptance bandwidths", l3: "normalizations (%/W/cm<sup>2</sup>, %/W, absolute), overlap, coupled modes",
      keys: [{ v: `${qpmPeriodSHG(1.55).toFixed(3)} &micro;m`, what: "first-order period, SHG 1550 &rarr; 775 nm, bulk CLN", code: "derived", pop: "r:zelmon1997" }, { v: "9600 %/W/cm<sup>2</sup>", what: "highest normalized TFLN SHG efficiency in the held table", code: "reported", pop: "r:li2024apn" }] },
    parametric: { l1: "gain from a pump; oscillation above threshold", l2: "phase-sensitive gain, resonator threshold, tuning", l3: "coupling conventions, on-chip vs fiber-coupled thresholds",
      keys: [{ v: "~30 &micro;W", what: "OPO threshold, TFLN PPLN ring", code: "reported", pop: "r:lu2021" }, { v: "118 dB/cm", what: "unsaturated parametric gain, dispersion-engineered PPLN", code: "reported", pop: "r:jankowski2022" }] },
    "third-order": { l1: "optical Kerr effect, soliton combs", l2: "&gamma;, cascaded &chi;<sup>(2)</sup>, Lugiato-Lefever equation", l3: "Z-scan conditions, Raman, photorefraction in solitons",
      keys: [{ v: "9.33&times;10<sup>&minus;20</sup> m<sup>2</sup>/W", what: "n<sub>2</sub>, 1064 nm, Z-scan", code: "P-db", pop: "r:desalvo1996" }] },
    "eo-combs": { l1: "a modulator in a ring at the FSR; photonic molecule", l2: "line slope vs &beta;F; coupled-mode frequency shifter", l3: "modulation-index conventions, line-count thresholds",
      keys: [{ v: "&gt; 900 lines", what: "resonant EO comb, about 10 GHz spacing", code: "reported", pop: "r:zhang2019" }, { v: "28 GHz, ~90%", what: "frequency shift and on-chip efficiency", code: "reported", pop: "r:hu2021" }] },
    "tfln-waveguides": { l1: "sub-micrometre LN film on oxide; tight confinement", l2: "x-cut vs z-cut, ring anisotropy, mode lattice, loss vs Q", l3: "loss mechanisms, full-vector FEM, loss measurement",
      keys: [{ v: "0.27 dB/cm", what: "wafer-scale DUV-patterned waveguides", code: "reported", pop: "r:luke2020" }, { v: "1.3 dB/m", what: "dry-etched ring, Q<sub>i</sub> 29 million", code: "reported", pop: "r:zhu2024" }] },
  };
}

/** Door drawings (VISUAL), one physical motif per section, 320 x 200 user units. Geometry only, no text. */
function doors(): Record<string, string> {
  const L = qpmPeriodSHG(1.55) * 2; // poled strip at 2 px per um
  let strip = "";
  for (let x = 20, k = 0; x < 300; x += L / 2, k++) strip += `<rect x="${x.toFixed(1)}" y="86" width="${(L / 2).toFixed(1)}" height="28" fill="${k % 2 ? "var(--v-ink2)" : "var(--v-ln)"}" fill-opacity="${k % 2 ? 1 : 0.35}"/>`;
  let rings = "";
  for (let r = 14; r < 96; r += 11) rings += `<circle cx="160" cy="100" r="${r}" fill="none" stroke="var(--v-text2)" stroke-opacity="${(1 - r / 110).toFixed(2)}" stroke-width="3"/>`;
  rings += `<path d="M160 0V200M60 100H260" stroke="var(--v-ink0)" stroke-width="16"/>`;
  let comb = "";
  for (let k = -14; k <= 14; k++) { const h = 150 * Math.exp(-Math.abs(k) * 0.16); comb += `<line x1="${160 + k * 9}" x2="${160 + k * 9}" y1="180" y2="${(180 - h).toFixed(1)}" stroke="var(--v-ir1550)" stroke-width="2" stroke-dasharray="4 3"/>`; }
  let sol = "";
  for (let i = 0; i <= 120; i++) { const a = (i / 120) * 2 * Math.PI, d = Math.atan2(Math.sin(a - 0.9), Math.cos(a - 0.9)), r = 62 + 22 / Math.cosh(d * 6); sol += `${i ? "L" : "M"}${(160 + r * Math.cos(a)).toFixed(1)} ${(100 - r * Math.sin(a)).toFixed(1)}`; }
  return {
    birefringence: rings,
    "pockels-effect": `<path d="M20 100H80C100 100 100 70 120 70H200C220 70 220 100 240 100H300M80 100C100 100 100 130 120 130H200C220 130 220 100 240 100" fill="none" stroke="var(--v-ir1550)" stroke-width="2.5" stroke-dasharray="6 4"/><rect x="118" y="44" width="84" height="16" fill="var(--v-au)"/><rect x="118" y="88" width="84" height="24" fill="var(--v-au)"/><rect x="118" y="140" width="84" height="16" fill="var(--v-au)"/>`,
    "second-order": `${strip}<line x1="10" x2="310" y1="100" y2="100" stroke="var(--v-ir1550)" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M20 100Q160 96 300 92" stroke="var(--lt-l775)" stroke-width="4" fill="none"/>`,
    parametric: `<circle cx="160" cy="100" r="62" fill="none" stroke="var(--v-text3)" stroke-width="10"/><circle cx="160" cy="100" r="62" fill="none" stroke="var(--v-ir1550)" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M40 176H280" stroke="var(--v-text3)" stroke-width="8"/><path d="M40 176H280" stroke="var(--v-ir1064)" stroke-width="2.5" stroke-dasharray="6 4"/>`,
    "third-order": `<path d="${sol}Z" fill="none" stroke="var(--v-ir1550)" stroke-width="2.5" stroke-dasharray="6 4"/>`,
    "eo-combs": comb,
    "tfln-waveguides": `<rect x="10" y="150" width="300" height="40" fill="var(--v-si)" fill-opacity="0.6"/><rect x="10" y="118" width="300" height="32" fill="var(--v-sio2)"/><rect x="10" y="106" width="300" height="12" fill="var(--v-ln)" fill-opacity="0.55"/><path d="M118 106L130 76H190L202 106Z" fill="var(--v-ln)" fill-opacity="0.55"/><rect x="10" y="62" width="70" height="20" fill="var(--v-au)"/><rect x="240" y="62" width="70" height="20" fill="var(--v-au)"/><ellipse cx="160" cy="96" rx="40" ry="16" fill="none" stroke="var(--v-ir1550)" stroke-width="2" stroke-dasharray="5 3"/>`,
  };
}

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Light",
    description: "Lithium niobate, chapter 02: light. Birefringence, the Pockels effect, second-order nonlinear optics and QPM, parametric amplification and OPOs, Kerr and EO combs, thin-film waveguides.",
    keys: ["P-comp", "P-db", "reported", "derived"],
  };
  const content = await lightContent(Object.values(RAW));
  return { meta, doors: doors(), ov: overview(), content };
};

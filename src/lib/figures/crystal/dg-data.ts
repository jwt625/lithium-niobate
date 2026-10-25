// FIG-01-04 Defect and polaron gallery: catalogue data and pure renderers shared by the server load (prerendered default
// state) and the client controller (dg.ts). Catalogue only, no simulation.
// Values: content/chapters/01-crystal/manuscript.md Sec. 5 (volk2008 pp. 10-26, herth2005 via volk2008 p. 22; P-comp).
// Band peaks are drawn as markers only. The only sourced band width is the congruent OH stretch FWHM (about 32 cm^-1,
// volk2008 p. 24); polaron band shapes wait for schirmer2009 (open question C1), so no polaron band shape is drawn.
// eV <-> nm <-> cm^-1 conversions: src/lib/physics/units.ts (exact hc/e). Display colour of a wavelength: spectral.ts.
// Kroeger-Vink strings: charge of the occupant relative to the host site (prime = -1, bullet = +1; volk2008 p. 12), with
// host valences Li+, Nb5+, O2- and occupant valences as named in the source (derived).
import { eVToUm, umToEV, wavenumberToUm } from "../../physics/units.ts";
import { spectral } from "../spectral.ts";

export type CentreId = "nbli" | "vli" | "vnb" | "nbli4" | "nbnb4" | "bip" | "hole" | "oh" | "b740";
export type Vig = "antisite" | "vli" | "vnb" | "bound" | "free" | "bip" | "hole" | "oh";
export interface Centre {
  id: CentreId;
  no: string;
  /** ASCII row label, <= 9 characters */
  tag: string;
  /** notation as written in the source (HTML) */
  sym: string;
  name: string;
  /** lattice location (HTML) */
  site: string;
  /** band peak (eV) or null when no optical band is listed */
  E: number | null;
  /** how the source states the peak (HTML) */
  given: string;
  /** other signature (HTML) */
  sig: string;
  /** lifetime where sourced (HTML) */
  life: string;
  /** Kroeger-Vink form (HTML) and its note */
  kv: string;
  kvNote: string;
  /** TECH readout, three lines, each <= 48 characters (plain text, rendered escaped) */
  ro: [string, string, string];
  /** source popup key (literal, found by sources.server.ts) and short source line */
  pop: string;
  src: string;
  vig: Vig;
}

export const E_MIN = 0.3, E_MAX = 4.0;
/** Pump marker: 532 nm. */
export const PUMP_NM = 532;
/** Display rule (template, not material data): a centre is marked "near the pump" when its listed peak lies within this
 *  photon-energy window of the pump. Peak proximity only; band widths are not sourced. */
export const PUMP_WIN_EV = 0.3;
export const nmOfEV = (E: number): number => eVToUm(E) * 1e3;
export const eVOfNm = (nm: number): number => umToEV(nm / 1e3);
export const eVOfK = (k_cm: number): number => umToEV(wavenumberToUm(k_cm));
export const PUMP_EV = eVOfNm(PUMP_NM);
/** OH stretch, wavenumbers (volk2008 p. 24 congruent; p. 25 and Table 2.4 near-stoichiometric) */
export const OH = { cln: [3482, 3467] as const, sln: 3466, fwhm: 32 };
const E_OH = eVOfK(OH.cln[0]);
const E_HOLE = eVOfNm(500);
const E_740 = eVOfNm(740);

const f2 = (E: number): string => E.toFixed(2);
const nm0 = (E: number): string => nmOfEV(E).toFixed(0);

export const CENTRES: readonly Centre[] = [
  {
    id: "nbli", no: "01", tag: "Nb_Li", sym: "Nb<sub>Li</sub>", name: "Nb antisite", site: "Nb<sup>5+</sup> on a Li site",
    E: null, given: "none listed", sig: "about 1% of Li sites in congruent crystal (Li-site model)", life: "",
    kv: "Nb<sub>Li</sub><sup>&bull;&bull;&bull;&bull;</sup>", kvNote: "Nb5+ on Li+: +4",
    ro: ["Nb_Li     Nb antisite, Nb5+ on a Li site", "~1% of Li sites, CLN (Li-site model); no band", "KV  Nb_Li^••••    Nb5+ on Li+ site, +4"],
    pop: "r:volk2008|p. 12, orig. Iyi et al. 1992;iyi1992|original, values via Volk & Wöhlecke 2008", src: "Volk & Wöhlecke 2008 p. 12 (Iyi et al. 1992)", vig: "antisite",
  },
  {
    id: "vli", no: "02", tag: "V_Li", sym: "V<sub>Li</sub>", name: "Li vacancy", site: "empty Li site",
    E: null, given: "none listed", sig: "about 4% of Li sites in congruent crystal (Li-site model)", life: "",
    kv: "V<sub>Li</sub><sup>&prime;</sup>", kvNote: "empty Li+ site: &minus;1",
    ro: ["V_Li      Li vacancy, empty Li site", "~4% of Li sites, CLN (Li-site model); no band", "KV  V_Li'           empty Li+ site, -1"],
    pop: "r:volk2008|p. 12, orig. Iyi et al. 1992;iyi1992|original, values via Volk & Wöhlecke 2008", src: "Volk & Wöhlecke 2008 p. 12 (Iyi et al. 1992)", vig: "vli",
  },
  {
    id: "vnb", no: "03", tag: "V_Nb", sym: "V<sub>Nb</sub>", name: "Nb vacancy (Nb-site model only)", site: "empty Nb site",
    E: null, given: "none listed", sig: "4 V<sub>Nb</sub> compensate 5 Nb<sub>Li</sub>; Nb on 4.9% of Li sites (X-ray)", life: "",
    kv: "V<sub>Nb</sub><sup>&prime;&prime;&prime;&prime;&prime;</sup>", kvNote: "empty Nb5+ site: &minus;5",
    ro: ["V_Nb      Nb vacancy, Nb-site model only", "4 V_Nb per 5 Nb_Li; Nb on 4.9% Li sites; no band", "KV  V_Nb'''''       empty Nb5+ site, -5"],
    pop: "r:volk2008|pp. 12-13, Eq. (2.6), orig. Abrahams & Marsh 1986;abrahams1986|original, values via Volk & Wöhlecke 2008", src: "Volk & Wöhlecke 2008 pp. 12-13 (Abrahams & Marsh 1986)", vig: "vnb",
  },
  {
    id: "nbli4", no: "04", tag: "Nb_Li4+", sym: "Nb<sub>Li</sub><sup>4+</sup>", name: "bound small polaron", site: "electron on an antisite",
    E: 1.6, given: "about 1.6 eV", sig: "10-line <sup>93</sup>Nb hyperfine EPR, g<sub>&perp;</sub> = 1.72, g<sub>&par;</sub> = 1.9",
    life: "room temperature: &micro;s (congruent), 10&ndash;100 ms (near-stoichiometric), up to s (Li-enriched, Mg-doped); forms within 400 fs",
    kv: "Nb<sub>Li</sub><sup>&bull;&bull;&bull;</sup>", kvNote: "Nb4+ on Li+: +3",
    ro: [`Nb_Li^4+  bound small polaron   ${f2(1.6)} eV  ${nm0(1.6)} nm`, "EPR 10-line 93Nb, g_perp 1.72, g_par 1.9", "KV  Nb_Li^•••     Nb4+ on Li+ site, +3"],
    pop: "r:volk2008|pp. 14-23, lifetimes p. 21, 400 fs p. 22", src: "Volk & Wöhlecke 2008 pp. 14-23", vig: "bound",
  },
  {
    id: "nbnb4", no: "05", tag: "Nb_Nb4+", sym: "Nb<sub>Nb</sub><sup>4+</sup>", name: "free small polaron", site: "electron on a regular Nb",
    E: 0.95, given: "about 0.95 eV", sig: "seen in reduced crystals with Mg above threshold; no EPR under low-temperature illumination", life: "",
    kv: "Nb<sub>Nb</sub><sup>&prime;</sup>", kvNote: "Nb4+ on Nb5+: &minus;1",
    ro: [`Nb_Nb^4+  free small polaron    ${f2(0.95)} eV ${nm0(0.95)} nm`, "reduced, Mg > threshold; no EPR at low T", "KV  Nb_Nb'          Nb4+ on Nb5+ site, -1"],
    pop: "r:volk2008|pp. 14-23", src: "Volk & Wöhlecke 2008 pp. 14-23", vig: "free",
  },
  {
    id: "bip", no: "06", tag: "bipolaron", sym: "(Nb<sub>Li</sub>&ndash;Nb<sub>Nb</sub>)<sup>2&minus;</sup>", name: "bipolaron", site: "electron pair on Nb<sub>Li</sub> and Nb<sub>Nb</sub>",
    E: 2.5, given: "about 2.5 eV", sig: "diamagnetic; dissociation energy about 0.3 eV; the band behind the colour of chemically reduced crystal", life: "",
    kv: "Nb<sub>Li</sub><sup>&bull;&bull;&bull;</sup>&ndash;Nb<sub>Nb</sub><sup>&prime;</sup>", kvNote: "pair Nb4+ on Li+ (+3) and Nb4+ on Nb5+ (&minus;1): net +2",
    ro: [`(Nb_Li-Nb_Nb)^2-  bipolaron     ${f2(2.5)} eV  ${nm0(2.5)} nm`, "diamagnetic; dissociation energy ~0.3 eV", "KV  Nb_Li^•••-Nb_Nb'  pair, net +2"],
    pop: "r:volk2008|pp. 14-23, photodissociation p. 17", src: "Volk & Wöhlecke 2008 pp. 14-23", vig: "bip",
  },
  {
    id: "hole", no: "07", tag: "O- hole", sym: "O<sup>&minus;</sup>", name: "bound hole polaron", site: "O<sup>&minus;</sup> next to a Li vacancy",
    E: E_HOLE, given: "broad, peak about 500 nm", sig: "EPR, trapped-hole g between 2.002 and 2.047", life: "",
    kv: "O<sub>O</sub><sup>&bull;</sup>", kvNote: "O&minus; on O2&minus;: +1",
    ro: [`O^-       bound hole polaron ~${f2(E_HOLE)} eV ~500 nm`, "next to V_Li; broad; EPR g 2.002 to 2.047", "KV  O_O^•           O- on O2- site, +1"],
    pop: "r:volk2008|pp. 14-23", src: "Volk & Wöhlecke 2008 pp. 14-23", vig: "hole",
  },
  {
    id: "oh", no: "08", tag: "OH-", sym: "OH<sup>&minus;</sup>", name: "hydroxyl (O&ndash;H stretch)", site: "H on an oxygen site, O&ndash;H bond &perp; c",
    E: E_OH, given: "3482 cm<sup>&minus;1</sup> (strong), 3467 cm<sup>&minus;1</sup> (weak), FWHM about 32 cm<sup>&minus;1</sup>; near-stoichiometric 3466 cm<sup>&minus;1</sup>",
    sig: "absorbs ordinary light much more than extraordinary: the bond vibrates in the plane &perp; c", life: "",
    kv: "(OH)<sub>O</sub><sup>&bull;</sup>", kvNote: "OH&minus; on O2&minus;: +1",
    ro: [`OH^-      O-H stretch 3482/3467 cm-1 ${E_OH.toFixed(3)} eV`, "SLN 3466 cm-1; FWHM ~32 cm-1 (CLN); o >> e", "KV  (OH)_O^•        OH- on O2- site, +1"],
    pop: "r:volk2008|pp. 24-25, Table 2.4 p. 49", src: "Volk & Wöhlecke 2008 pp. 24-25", vig: "oh",
  },
  {
    id: "b740", no: "09", tag: "740 nm", sym: "740 nm band", name: "laser-pulse-induced IR band", site: "assigned to Nb<sub>Li</sub><sup>4+</sup>",
    E: E_740, given: "740 nm, composition independent", sig: "pump-probe absorption after a laser pulse", life: "",
    kv: "Nb<sub>Li</sub><sup>&bull;&bull;&bull;</sup>", kvNote: "as assigned: Nb4+ on Li+, +3",
    ro: [`740 nm band  laser-pulse-induced  ${E_740.toFixed(3)} eV`, "assigned to Nb_Li^4+; composition independent", "KV  Nb_Li^•••     as assigned, +3"],
    pop: "r:herth2005|via Volk & Wöhlecke 2008 p. 22;volk2008|p. 22", src: "Herth et al. 2005 via Volk & Wöhlecke 2008 p. 22", vig: "bound",
  },
];
export const byId = (id: string): Centre => CENTRES.find((c) => c.id === id) ?? CENTRES[3];
export const nearPump = (c: Centre): boolean => c.E !== null && Math.abs(c.E - PUMP_EV) <= PUMP_WIN_EV;
/** Peak position of a centre in the current state: illuminated below 80 K the bipolaron band moves to the bound polaron. */
export const peakOf = (c: Centre, cold: boolean): number | null => (c.id === "bip" && cold ? 1.6 : c.E);
/** Band column of the TECH table / VISUAL card value. */
export function bandText(c: Centre): string {
  if (c.E === null) return "none listed";
  if (c.id === "oh") return `${OH.cln[0]} cm<sup>&minus;1</sup> = ${c.E.toFixed(3)} eV`;
  if (c.id === "b740") return `740 nm = ${c.E.toFixed(3)} eV`;
  if (c.id === "hole") return `~500 nm = ${f2(c.E)} eV`;
  return `${f2(c.E)} eV = ${nm0(c.E)} nm`;
}

export interface DgState { sel: CentreId; pump: boolean; cold: boolean }
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------------------------------------------------------------- TECH ----------------------------------------------
export const ASCII_W = 50;
const AX0 = 10, AXN = 40;
const colE = (E: number): number => AX0 + Math.round(((E - E_MIN) / (E_MAX - E_MIN)) * (AXN - 1));
const KX0 = 12, K0 = 3440, KSTEP = 2;
const colK = (k: number): number => KX0 + Math.round((k - K0) / KSTEP);

/** ASCII photon-energy axis with one row per centre, | at the listed peak; the OH wavenumber inset below. */
export function techAscii(st: DgState, hover: CentreId | null = null): string {
  const rows: { ch: string[]; cls: string[] }[] = [];
  const line = (): { ch: string[]; cls: string[] } => { const l = { ch: Array(ASCII_W).fill(" "), cls: Array(ASCII_W).fill("") }; rows.push(l); return l; };
  const put = (l: { ch: string[]; cls: string[] }, c: number, s: string, cls = ""): void => { [...s].forEach((ch, i) => { if (c + i >= 0 && c + i < ASCII_W) { l.ch[c + i] = ch; l.cls[c + i] = cls; } }); };
  const pc = colE(PUMP_EV);
  const head = line();
  put(head, 0, "centre");
  put(head, AX0, "band peak", "dim");
  if (st.pump) put(head, pc - 1, "532", "hi");
  const rule = (): void => {
    const l = line();
    for (let c = AX0; c < AX0 + AXN; c++) l.ch[c] = "-";
    for (let E = 0.5; E <= E_MAX + 1e-9; E += 0.5) l.ch[colE(E)] = "+";
  };
  rule();
  const sel = st.sel;
  for (const c of CENTRES) {
    const l = line();
    const on = c.id === sel, hv = c.id === hover && !on;
    put(l, 0, c.tag.padEnd(9), on ? "inv" : hv ? "hi" : "");
    if (st.pump) { for (let k = 0; k < 1; k++) if (l.ch[pc] === " ") put(l, pc, ":", "dim"); if (nearPump(c)) put(l, 9, "*", "hi"); }
    if (c.E === null) { put(l, AX0 + 1, "no band listed", "dim"); continue; }
    const E = peakOf(c, st.cold) as number, x = colE(E);
    if (c.id === "bip" && st.cold) {
      const x0 = colE(c.E);
      put(l, x + 1, "<" + "-".repeat(Math.max(0, x0 - x - 2)), "dim");
      put(l, x0, "o", "dim");
    }
    put(l, x, "|", on ? "inv" : hv ? "hi" : "");
  }
  rule();
  const ev = line();
  put(ev, 0, "E (eV)");
  put(ev, AX0, "0.3");
  for (const E of [1, 2, 3]) put(ev, colE(E) - 1, E.toFixed(1));
  put(ev, ASCII_W - 3, "4.0");
  const nm = line();
  put(nm, 0, "lambda nm", "dim");
  put(nm, AX0, nm0(E_MIN), "dim");
  for (const E of [1, 2, 3]) { const s = nm0(E); put(nm, colE(E) - Math.floor(s.length / 2), s, "dim"); }
  put(nm, ASCII_W - 3, nm0(E_MAX), "dim");
  line();
  const oh = sel === "oh", ohh = hover === "oh" && !oh;
  const ohc = oh ? "inv" : ohh ? "hi" : "";
  const kh = line();
  put(kh, 0, "OH- stretch, wavenumber (cm-1)");
  const kl = line();
  for (const k of [3440, 3460, 3480, 3500]) put(kl, colK(k) - 2, String(k), "dim");
  const kr = line();
  for (let c = KX0; c < ASCII_W; c++) kr.ch[c] = "-";
  for (const k of [3440, 3460, 3480, 3500]) kr.ch[colK(k)] = "+";
  const cl = line();
  put(cl, 0, "CLN", ohc);
  put(cl, colK(OH.cln[1]), "|", ohc); put(cl, colK(OH.cln[0]), "|", ohc);
  put(cl, 37, "3467 w 3482 s", "dim");
  const fw = line();
  put(fw, 0, "FWHM", ohc);
  const a = colK(OH.cln[0] - OH.fwhm / 2), b = colK(OH.cln[0] + OH.fwhm / 2);
  put(fw, a, "[" + "=".repeat(b - a - 1) + "]", ohc);
  put(fw, colK(OH.cln[0]), "+", ohc);
  put(fw, b + 2, "~32", "dim");
  const sl = line();
  put(sl, 0, "SLN", ohc);
  put(sl, colK(OH.sln), "|", ohc);
  put(sl, 37, "3466", "dim");
  return rows.map((l) => {
    let out = "", cur = "", buf = "";
    const flush = (): void => { if (buf) out += cur ? `<span class="${cur}">${esc(buf)}</span>` : esc(buf); buf = ""; };
    l.ch.forEach((ch, i) => { if (l.cls[i] !== cur) { flush(); cur = l.cls[i]; } buf += ch; });
    flush();
    return out.replace(/\s+$/, "");
  }).join("\n");
}

/** Selected-centre box, 3 lines x 48 characters. */
export function techReadout(st: DgState, hover: CentreId | null = null): string {
  const c = byId(hover ?? st.sel);
  let ro = [...c.ro];
  if (c.id === "bip" && st.cold) ro = [`(Nb_Li-Nb_Nb)^2- lit <80 K -> ${f2(1.6)} eV  ${nm0(1.6)} nm`, "photodissociated into Nb_Li^4+ (bound polaron)", ro[2]];
  return ro.map((s) => esc(s.slice(0, 48).padEnd(48))).join("\n");
}

// ---------------------------------------------------------------- VISUAL --------------------------------------------
export const STRIP_H = 214;
export interface StripGeom { W: number; L: number; R: number; x: (E: number) => number }
export function stripGeom(W: number): StripGeom {
  const L = 16, R = 16;
  return { W, L, R, x: (E) => L + ((E - E_MIN) / (E_MAX - E_MIN)) * (W - L - R) };
}
const BAR_Y = 104, BAR_H = 30, LANE_Y = [30, 56, 82];
/** Label lane and anchor per centre (chosen so labels do not collide at 358 px width). */
const LANES: Partial<Record<CentreId, [number, "start" | "end"]>> = { oh: [2, "start"], nbnb4: [1, "start"], nbli4: [0, "end"], b740: [2, "start"], hole: [1, "start"], bip: [0, "start"] };
const LABEL: Partial<Record<CentreId, string>> = { oh: "OH&#8315;", nbnb4: "Nb<tspan dy='3' font-size='0.75em'>Nb</tspan><tspan dy='-7' font-size='0.75em'>4+</tspan>", nbli4: "Nb<tspan dy='3' font-size='0.75em'>Li</tspan><tspan dy='-7' font-size='0.75em'>4+</tspan>", b740: "740 nm", hole: "O&#8315; hole", bip: "bipolaron" };
export const VIS_LO = 380, VIS_HI = 750;
/** Display colour of a visible wavelength. Local guard (physics gap): spectral.ts (Wyman 2013 multi-lobe CMF fit) turns
 *  yellow-green above about 700 nm and cyan near 380 nm because the fit tails are not accurate there, so the hue is taken at
 *  the nearest wavelength inside 410-680 nm and the luminance falls linearly to 45% at 380 and 750 nm. */
export function specCol(nm: number, k = 1): string {
  const h = Math.min(680, Math.max(410, nm));
  const fall = nm > 680 ? 1 - 0.55 * Math.min(1, (nm - 680) / 70) : nm < 410 ? 1 - 0.55 * Math.min(1, (410 - nm) / 30) : 1;
  return spectral(h, k * fall);
}
const IR_EV = eVOfNm(VIS_HI), UV_EV = eVOfNm(VIS_LO);

/** Marker colour: spectral colour inside 380-750 nm, declared IR false colour (dashed) below. */
export function markColour(E: number, light: boolean): { col: string; ir: boolean } {
  const nm = nmOfEV(E);
  if (nm > VIS_HI) return { col: "var(--v-ir1550)", ir: true };
  return { col: specCol(nm, light ? 0.62 : 1), ir: false };
}
export function markerX(g: StripGeom, c: Centre, cold: boolean): number { return g.x(peakOf(c, cold) as number); }

/** Spectrum strip SVG (width W px, height STRIP_H px): energy axis 0.3-4 eV to scale, visible part in spectral colour,
 *  IR hatched in declared false colour, UV hatched neutral; one marker group per centre with a band. */
export function stripSVG(W: number, light: boolean, st: DgState): string {
  const g = stripGeom(W), f = (v: number): string => v.toFixed(1);
  const xIR = g.x(IR_EV), xUV = g.x(UV_EV);
  let stops = "";
  for (let nm = VIS_HI; nm >= VIS_LO; nm -= 10) { const E = eVOfNm(nm); stops += `<stop offset="${((g.x(E) - xIR) / (xUV - xIR)).toFixed(4)}" stop-color="${specCol(nm, light ? 0.85 : 0.9)}"/>`; }
  let s = `<defs><linearGradient id="dg-vis" x1="0" x2="1" y1="0" y2="0">${stops}</linearGradient>`;
  s += `<pattern id="dg-irh" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="irh"/></pattern>`;
  s += `<pattern id="dg-uvh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="6" class="uvh"/></pattern></defs>`;
  // bar
  s += `<rect class="ir" x="${f(g.L)}" y="${BAR_Y}" width="${f(xIR - g.L)}" height="${BAR_H}" fill="url(#dg-irh)"/>`;
  s += `<rect class="vis" x="${f(xIR)}" y="${BAR_Y}" width="${f(xUV - xIR)}" height="${BAR_H}" fill="url(#dg-vis)"/>`;
  s += `<rect class="uv" x="${f(xUV)}" y="${BAR_Y}" width="${f(W - g.R - xUV)}" height="${BAR_H}" fill="url(#dg-uvh)"/>`;
  s += `<rect class="frame" x="${f(g.L)}" y="${BAR_Y}" width="${f(W - g.L - g.R)}" height="${BAR_H}"/>`;
  const irw = xIR - g.L;
  s += `<text class="reg" x="${f(g.L + 6)}" y="${BAR_Y + BAR_H + 14}">${irw > 150 ? "IR, false colour (dashed)" : "IR, false col."}</text>`;
  s += `<text class="reg" x="${f(xUV - 4)}" y="${BAR_Y + BAR_H + 14}" text-anchor="end">visible</text>`;
  s += `<text class="reg" x="${f(W - g.R - 4)}" y="${BAR_Y + BAR_H + 14}" text-anchor="end">UV</text>`;
  // ticks: eV every 0.5 (labels every 1 at narrow widths), wavelength at round values
  const narrow = W < 600;
  let tk = "";
  for (let E = 0.5; E <= E_MAX + 1e-9; E += 0.5) {
    const x = g.x(E), lab = narrow ? Math.abs(E - Math.round(E)) < 1e-9 : true;
    tk += `<line class="tk" x1="${f(x)}" x2="${f(x)}" y1="${BAR_Y + BAR_H}" y2="${BAR_Y + BAR_H + 4}"/>`;
    if (lab) tk += `<text class="tl" x="${f(x)}" y="${BAR_Y + BAR_H + 32}" text-anchor="middle">${E.toFixed(1)}</text>`;
  }
  tk += `<text class="tl ax" x="${f(g.L)}" y="${BAR_Y + BAR_H + 32}">eV</text>`;
  for (const nm of narrow ? [1000, 500, 400] : [3000, 2000, 1500, 1000, 750, 600, 500, 400, 350]) {
    const x = g.x(eVOfNm(nm));
    tk += `<line class="tk" x1="${f(x)}" x2="${f(x)}" y1="${BAR_Y - 4}" y2="${BAR_Y}"/>`;
    tk += `<text class="tl nm" x="${f(x)}" y="${BAR_Y + BAR_H + 50}" text-anchor="middle">${nm}</text>`;
  }
  tk += `<text class="tl ax" x="${f(g.L)}" y="${BAR_Y + BAR_H + 50}">nm</text>`;
  s += tk;
  // pump
  const xp = g.x(PUMP_EV);
  s += `<g class="pump"><line x1="${f(xp)}" x2="${f(xp)}" y1="${BAR_Y - 10}" y2="${BAR_Y + BAR_H + 6}" stroke="${specCol(PUMP_NM, light ? 0.62 : 1)}"/>`;
  s += `<text x="${f(xp)}" y="${STRIP_H - 6}" text-anchor="middle" fill="${specCol(PUMP_NM, light ? 0.55 : 1)}">pump 532 nm, ${f2(PUMP_EV)} eV</text></g>`;
  // reduced-crystal colour chip at the bipolaron peak (shown on bipolaron hover/selection)
  const xb = g.x(2.5);
  s += `<g class="redchip"><rect x="${f(xb - 7)}" y="${BAR_Y - 2}" width="14" height="${BAR_H + 4}" fill="${specCol(nmOfEV(2.5), 1)}"/></g>`;
  // markers
  for (const c of CENTRES) {
    if (c.E === null) continue;
    const [lane, anchor] = LANES[c.id] ?? [0, "start"];
    const E0 = c.E, x0 = g.x(E0), { col, ir } = markColour(peakOf(c, st.cold) as number, light);
    const yl = LANE_Y[lane];
    const lab = LABEL[c.id] ?? c.tag;
    const cls = `mk${ir ? " irm" : ""}${c.id === st.sel ? " on" : ""}${nearPump(c) ? " np" : ""}`;
    const tx = anchor === "start" ? 5 : -5;
    s += `<g class="${cls}" data-id="${c.id}" style="transform:translateX(${f(c.id === "bip" && st.cold ? g.x(1.6) - x0 : 0)}px)">`;
    s += `<line class="st" x1="${f(x0)}" x2="${f(x0)}" y1="${yl + 4}" y2="${BAR_Y + BAR_H}" stroke="${col}"${ir ? ' stroke-dasharray="4 3"' : ""}/>`;
    s += `<rect class="hd" x="${f(x0 - 5)}" y="${BAR_Y + BAR_H / 2 - 5}" width="10" height="10" transform="rotate(45 ${f(x0)} ${BAR_Y + BAR_H / 2})" fill="${col}"/>`;
    s += `<circle class="ring" cx="${f(x0)}" cy="${BAR_Y + BAR_H / 2}" r="11"/>`;
    s += `<text class="lb" x="${f(x0 + tx)}" y="${yl}" text-anchor="${anchor}">${lab}</text></g>`;
  }
  // bipolaron hop trail (cold)
  s += `<g class="trail"><line x1="${f(g.x(1.6) + 8)}" x2="${f(xb - 8)}" y1="${BAR_Y - 12}" y2="${BAR_Y - 12}"/><path d="M${f(g.x(1.6) + 8)} ${BAR_Y - 12} l7 -4 v8 z"/></g>`;
  return s;
}

/** VISUAL selected-centre box: three lines (HTML). */
export function visHud(st: DgState, hover: CentreId | null = null): string {
  const c = byId(hover ?? st.sel);
  const peak = peakOf(c, st.cold);
  const band = c.id === "bip" && st.cold ? `illuminated below 80 K: band at ${f2(1.6)} eV (${nm0(1.6)} nm), bound polaron` : c.E === null ? "no optical band listed" : bandText(c);
  void peak;
  return `<span class="l1"><b>${c.sym}</b> ${c.name} <span class="bd">${band}</span></span><span class="l2">${c.sig}</span><span class="l3">Kroeger-Vink ${c.kv} <span class="kn">${c.kvNote}</span></span>`;
}

// ---------------------------------------------------------------- vignettes -----------------------------------------
type P2 = [number, number];
/** Octahedron with its threefold axis vertical (c up): top and bottom triangular faces, edge a, tilt t (view from above). */
function octa(cx: number, cy: number, a: number, site: "Li" | "Nb", t = 0.5, az = 18): { top: P2[]; bot: P2[]; svg: string; front: P2 } {
  const r = a / Math.sqrt(3), h = a * Math.sqrt(2 / 3) / 2, rad = Math.PI / 180;
  const tops = [90, 210, 330].map((d) => d + az), bots = [30, 150, 270].map((d) => d + az);
  const top: P2[] = tops.map((d) => [cx + r * Math.cos(d * rad), cy - h + r * Math.sin(d * rad) * t]);
  const bot: P2[] = bots.map((d) => [cx + r * Math.cos(d * rad), cy + h + r * Math.sin(d * rad) * t]);
  const depth = (d: number): number => Math.sin(d * rad);
  const f = (v: number): string => v.toFixed(1);
  // convex hull of the six projected vertices (monotone chain)
  const pts = [...top, ...bot].slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cr = (o: P2, p: P2, q: P2): number => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const lo: P2[] = [], up: P2[] = [];
  for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of [...pts].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  const hull = [...lo.slice(0, -1), ...up.slice(0, -1)];
  let s = `<polygon class="of ${site}" points="${hull.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")}"/>`;
  const edge = (p: P2, q: P2, back: boolean): string => `<line class="oe ${site}${back ? " bk" : ""}" x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}"/>`;
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
    s += edge(top[i], top[j], (depth(tops[i]) + depth(tops[j])) / 2 < -0.2);
    s += edge(bot[i], bot[j], (depth(bots[i]) + depth(bots[j])) / 2 < -0.2);
  }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const dd = Math.abs(((tops[i] - bots[j] + 540) % 360) - 180);
    if (dd > 61) continue;
    s += edge(top[i], bot[j], (depth(tops[i]) + depth(bots[j])) / 2 < -0.2);
  }
  // front-most bottom vertex (largest depth) for attachments
  const fi = bots.map(depth).reduce((m, v, i, arr) => (v > arr[m] ? i : m), 0);
  return { top, bot, svg: s, front: bot[fi] };
}
const ox = (pts: P2[], skip: P2[] = []): string => pts.filter((p) => !skip.includes(p)).map((p) => `<circle class="ox" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.2"/>`).join("");
const ion = (x: number, y: number, kind: "Nb" | "Li" | "empty", r = 9): string =>
  kind === "empty" ? `<circle class="vac" cx="${x}" cy="${y}" r="${r}"/>` : `<circle class="ion ${kind}" cx="${x}" cy="${y}" r="${r}"/>`;
const cloud = (id: string, x: number, y: number, rx: number, ry: number, cls = "cl"): string => `<ellipse class="${cls}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#dg-e-${id})"/>`;
const grad = (id: string): string => `<defs><radialGradient id="dg-e-${id}"><stop offset="0" class="e0"/><stop offset="0.55" class="e1"/><stop offset="1" class="e2"/></radialGradient></defs>`;
const caxis = `<g class="cax"><line x1="16" y1="132" x2="16" y2="22"/><path d="M16 16 l-4 9 h8 z"/><text x="24" y="24">c</text></g>`;
const lab = (x: number, y: number, s: string, anchor = "middle"): string => `<text class="vl" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;

/** 2D vignette of a centre (viewBox 240 x 150). Display drawing: regular octahedra, threefold axis along c; sizes not to scale. */
export function vignette(c: Centre): string {
  const id = c.id;
  let s = grad(id) + caxis;
  const one = (site: "Li" | "Nb", occ: "Nb" | "Li" | "empty", e: boolean, siteLab: string): void => {
    const o = octa(120, 76, 60, site);
    s += o.svg + ox([...o.top, ...o.bot]) + (e ? cloud(id, 120, 76, 24, 20) : "") + ion(120, 76, occ) + (e ? lab(160, 84, "e&#8315;", "start") : "") + lab(120, 142, siteLab);
  };
  switch (c.vig) {
    case "antisite": one("Li", "Nb", false, "Li site, Nb inside"); break;
    case "vli": one("Li", "empty", false, "Li site, empty"); break;
    case "vnb": one("Nb", "empty", false, "Nb site, empty"); break;
    case "bound": one("Li", "Nb", true, "Li site, Nb + e&#8315;"); break;
    case "free": one("Nb", "Nb", true, "Nb site, Nb + e&#8315;"); break;
    case "bip": {
      const a = 48, h = a * Math.sqrt(2 / 3) / 2;
      const lo = octa(120, 76 + h, a, "Li"), hi = octa(120, 76 - h, a, "Nb");
      s += lo.svg + hi.svg + ox([...lo.top, ...lo.bot, ...hi.top]);
      s += `<g class="pair">${cloud(id, 120, 76, 22, 40)}${lab(88, 62, "2e&#8315;", "end")}</g>`;
      s += `<g class="split">${cloud(id, 120, 76 + h, 20, 17)}${lab(148, 76 + h + 18, "e&#8315;", "start")}</g>`;
      s += ion(120, 76 + h, "Nb", 8) + ion(120, 76 - h, "Nb", 8);
      s += lab(178, 76 + h + 4, "Nb<tspan dy='3' font-size='0.75em'>Li</tspan>", "start") + lab(178, 76 - h + 4, "Nb<tspan dy='3' font-size='0.75em'>Nb</tspan>", "start");
      break;
    }
    case "hole": {
      const o = octa(120, 76, 60, "Li");
      const hp = o.front;
      s += o.svg + ox([...o.top, ...o.bot], [hp]) + ion(120, 76, "empty");
      s += `<circle class="hole" cx="${hp[0].toFixed(1)}" cy="${hp[1].toFixed(1)}" r="13"/><circle class="ox big" cx="${hp[0].toFixed(1)}" cy="${hp[1].toFixed(1)}" r="5.5"/>`;
      s += lab(hp[0] + 18, hp[1] + 4, "O&#8315; (h&#8314;)", "start") + lab(120, 142, "next to an empty Li site");
      break;
    }
    case "oh": {
      const o = octa(64, 76, 52, "Li");
      const op = o.front, hx = op[0] + 16, hy = op[1];
      s += o.svg + ox([...o.top, ...o.bot]) + ion(64, 76, "Li", 7.5);
      s += `<line class="bond" x1="${op[0].toFixed(1)}" y1="${hy.toFixed(1)}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}"/><circle class="hyd" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="3.6"/>`;
      s += `<g class="str"><path d="M${(op[0] + 1).toFixed(1)} ${(hy + 9).toFixed(1)} H${(hx + 4).toFixed(1)} M${(op[0] + 4).toFixed(1)} ${(hy + 6).toFixed(1)} l-3 3 l3 3 M${(hx + 1).toFixed(1)} ${(hy + 6).toFixed(1)} l3 3 l-3 3"/></g>`;
      s += lab(64, 142, "O&#8211;H &perp; c");
      // wavenumber inset: 3440-3510 cm^-1
      const X0 = 132, X1 = 232, k0 = 3440, k1 = 3510, kx = (k: number): number => X0 + ((k - k0) / (k1 - k0)) * (X1 - X0), Y = 104;
      s += `<g class="inset"><rect class="ib" x="${X0 - 6}" y="20" width="${X1 - X0 + 12}" height="${Y - 2}"/>`;
      const a = kx(OH.cln[0] - OH.fwhm / 2), b = kx(OH.cln[0] + OH.fwhm / 2);
      s += `<line class="fw" x1="${a.toFixed(1)}" x2="${b.toFixed(1)}" y1="44" y2="44"/><line class="fw" x1="${a.toFixed(1)}" x2="${a.toFixed(1)}" y1="40" y2="48"/><line class="fw" x1="${b.toFixed(1)}" x2="${b.toFixed(1)}" y1="40" y2="48"/>`;
      s += `<text class="it" x="${((a + b) / 2).toFixed(1)}" y="36" text-anchor="middle">FWHM ~${OH.fwhm}</text>`;
      for (const [k, cls, y0] of [[OH.cln[0], "m", 52], [OH.cln[1], "m w", 62], [OH.sln, "m s", 78]] as const) s += `<line class="${cls}" x1="${kx(k).toFixed(1)}" x2="${kx(k).toFixed(1)}" y1="${y0}" y2="${Y}"/>`;
      s += `<text class="it" x="${(kx(OH.cln[0]) + 3).toFixed(1)}" y="60">${OH.cln[0]}</text><text class="it" x="${(kx(OH.cln[1]) - 3).toFixed(1)}" y="70" text-anchor="end">${OH.cln[1]}</text><text class="it s" x="${(kx(OH.sln) - 3).toFixed(1)}" y="86" text-anchor="end">SLN ${OH.sln}</text>`;
      s += `<line class="ia" x1="${X0}" x2="${X1}" y1="${Y}" y2="${Y}"/>`;
      for (const k of [3440, 3470, 3500]) s += `<line class="ia" x1="${kx(k).toFixed(1)}" x2="${kx(k).toFixed(1)}" y1="${Y}" y2="${Y + 3}"/><text class="it" x="${kx(k).toFixed(1)}" y="${Y + 13}" text-anchor="middle">${k}</text>`;
      s += `<text class="it" x="${X1}" y="${Y + 25}" text-anchor="end">cm&#8315;&#185;, CLN dashed, SLN dotted</text></g>`;
      break;
    }
  }
  return s;
}

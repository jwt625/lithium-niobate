// Provenance-tagged constants for the physics core.
// Every number here carries a source id (research/R06, research/R14 registers) and a status code.
// Status codes (DevLog-004 rule 3, R06, R14):
//   P       primary document read at the locator
//   P-comp  read in a compilation (weis1985, volk2008) that names the original measurement
//   P-db    CC0 transcription of a primary (refractiveindex.info YAML)
//   P(abs)  only the abstract of the primary was read
//   S       secondary (review, Wikipedia, another paper quoting the primary)
//   V       vendor datasheet
//   C       computed in the research notes from P/S inputs
//   U       unverified; never a default
//   reported / derived / template   (R11, R13 tags for simulation inputs)
// Tensor components are in the IEEE Std 176-1987 crystal-physics frame for class 3m (FRAME below).

export type Status =
  | "P"
  | "P-comp"
  | "P-db"
  | "P(abs)"
  | "S"
  | "V"
  | "C"
  | "U"
  | "reported"
  | "derived"
  | "template";

export interface Source {
  id: string;
  citation: string;
  doi?: string;
  url?: string;
}

export interface Provenance {
  source: string; // key into SOURCES
  status: Status;
  locator?: string;
  note?: string;
}

export interface Quantity {
  value: number;
  unit: string;
  prov: Provenance;
  uncertainty?: number;
}

export interface Range {
  min: number;
  max: number;
  unit: string;
  prov: Provenance;
}

// ---------------------------------------------------------------------------------------------
// Source register (ids follow R06 sec. 1.2 and R14 sec. 1)
// ---------------------------------------------------------------------------------------------
export const SOURCES: Readonly<Record<string, Source>> = {
  zelmon1997: { id: "zelmon1997", citation: "D.E. Zelmon, D.L. Small, D. Jundt, JOSA B 14, 3319 (1997)", doi: "10.1364/JOSAB.14.003319" },
  zelmon2026erratum: { id: "zelmon2026erratum", citation: "Erratum to Zelmon et al. 1997, JOSA B 43(11), 2788 (2026-10-22): MgO5 o/e headings of Table 2 switched", doi: "10.1364/JOSAB.616304" },
  rii: { id: "rii", citation: "M.N. Polyanskiy, refractiveindex.info database (CC0); Sci. Data 11, 94 (2024)", url: "https://refractiveindex.info" },
  jundt1997: { id: "jundt1997", citation: "D.H. Jundt, Opt. Lett. 22, 1553 (1997)", doi: "10.1364/OL.22.001553" },
  gayer2008: { id: "gayer2008", citation: "O. Gayer, Z. Sacks, E. Galun, A. Arie, Appl. Phys. B 91, 343 (2008); erratum Appl. Phys. B 94, 367 (2009) (replaces Fig. 3 only)", doi: "10.1007/s00340-008-2998-2" },
  weis1985: { id: "weis1985", citation: "R.S. Weis, T.K. Gaylord, Appl. Phys. A 37, 191 (1985)", doi: "10.1007/BF00614817" },
  volk2008: { id: "volk2008", citation: "T. Volk, M. Wohlecke, Lithium Niobate: Defects, Photorefraction and Ferroelectric Switching, Springer (2008)", doi: "10.1007/978-3-540-70766-0" },
  kushibiki1999: { id: "kushibiki1999", citation: "J. Kushibiki, I. Takanaga, M. Arakawa, T. Sannomiya, IEEE TUFFC 46, 1315 (1999)", doi: "10.1109/58.796136" },
  ogi2002: { id: "ogi2002", citation: "H. Ogi, Y. Kawasaki, M. Hirao, H. Ledbetter, J. Appl. Phys. 92, 2451 (2002)", doi: "10.1063/1.1497702" },
  ieee176: { id: "ieee176", citation: "IEEE Std 176-1987, IEEE Standard on Piezoelectricity", doi: "10.1109/IEEESTD.1988.79638" },
  si2019: { id: "si2019", citation: "BIPM, The International System of Units (SI Brochure), 9th ed. (2019): exact defining constants" },
  codata2018: { id: "codata2018", citation: "E. Tiesinga et al., CODATA 2018, Rev. Mod. Phys. 93, 025010 (2021)", doi: "10.1103/RevModPhys.93.025010" },
  bryan1984: { id: "bryan1984", citation: "D.A. Bryan, R. Gerson, H.E. Tomaschke, Appl. Phys. Lett. 44, 847 (1984)", doi: "10.1063/1.94946" },
  glass1974: { id: "glass1974", citation: "A.M. Glass, D. von der Linde, T.J. Negran, Appl. Phys. Lett. 25, 233 (1974)", doi: "10.1063/1.1655453" },
  fejer1992: { id: "fejer1992", citation: "M.M. Fejer, G.A. Magel, D.H. Jundt, R.L. Byer, IEEE JQE 28, 2631 (1992)", doi: "10.1109/3.161322" },
  armstrong1962: { id: "armstrong1962", citation: "J.A. Armstrong, N. Bloembergen, J. Ducuing, P.S. Pershan, Phys. Rev. 127, 1918 (1962)", doi: "10.1103/PhysRev.127.1918" },
  boyd2008: { id: "boyd2008", citation: "R.W. Boyd, Nonlinear Optics, 3rd ed., Academic Press (2008)" },
  yariv1989: { id: "yariv1989", citation: "A. Yariv, Quantum Electronics, 3rd ed., Wiley (1989)" },
  yarivyeh1984: { id: "yarivyeh1984", citation: "A. Yariv, P. Yeh, Optical Waves in Crystals, Wiley (1984)" },
  bornwolf: { id: "bornwolf", citation: "M. Born, E. Wolf, Principles of Optics, Cambridge University Press (crystal optics chapter)" },
  dmitriev1999: { id: "dmitriev1999", citation: "V.G. Dmitriev, G.G. Gurzadyan, D.N. Nikogosyan, Handbook of Nonlinear Optical Crystals, 3rd ed., Springer (1999)" },
  alferness1982: { id: "alferness1982", citation: "R.C. Alferness, IEEE Trans. Microwave Theory Tech. 30, 1121 (1982)", doi: "10.1109/TMTT.1982.1131213" },
  zhu2021: { id: "zhu2021", citation: "D. Zhu et al., Adv. Opt. Photon. 13, 242 (2021)", doi: "10.1364/AOP.411024" },
  bogaerts2012: { id: "bogaerts2012", citation: "W. Bogaerts et al., Laser Photon. Rev. 6, 47 (2012)", doi: "10.1002/lpor.201100017" },
  kourogi1993: { id: "kourogi1993", citation: "M. Kourogi, K. Nakagawa, M. Ohtsu, IEEE JQE 29, 2693 (1993)", doi: "10.1109/3.250392" },
  zhang2019: { id: "zhang2019", citation: "M. Zhang et al., Nature 568, 373 (2019)", doi: "10.1038/s41586-019-1008-7" },
  buscaino2020: { id: "buscaino2020", citation: "B. Buscaino, M. Zhang, M. Loncar, J.M. Kahn, J. Lightwave Technol. 38, 1400 (2020)", doi: "10.1109/JLT.2020.2973884" },
  kukhtarev1978: { id: "kukhtarev1978", citation: "N.V. Kukhtarev et al., Ferroelectrics 22, 949 (1978/1979)", doi: "10.1080/00150197908239450" },
  salvestrini2011: { id: "salvestrini2011", citation: "J.P. Salvestrini et al., J. Lightwave Technol. 29, 1522 (2011)", doi: "10.1109/JLT.2011.2136322" },
  holzgrafe2024: { id: "holzgrafe2024", citation: "J. Holzgrafe et al., Opt. Express 32, 3619 (2024)", doi: "10.1364/OE.507536" },
  auld1973: { id: "auld1973", citation: "B.A. Auld, Acoustic Fields and Waves in Solids, Vol. 1, Wiley (1973)" },
  itu_o150: { id: "itu_o150", citation: "ITU-T Recommendation O.150: PRBS generator polynomials" },
  marsaglia2003: { id: "marsaglia2003", citation: "G. Marsaglia, Xorshift RNGs, J. Stat. Softw. 8(14) (2003)", doi: "10.18637/jss.v008.i14" },
  r02: { id: "r02", citation: "research/R02 sec. 2.2 (author's 2018 notes on COMSOL rotated systems, Voigt maps and export ordering)" },
  r11: { id: "r11", citation: "research/R11 (browser simulation kernels, validation references)" },
  mockup: { id: "mockup", citation: "mockup/ln.js (approved mockup conoscope model)" },
  // registered by lane PHY2 (2026-10-25); citations from src/lib/generated/sources.json or content/chapters/*/refs.yaml
  cti1999: { id: "cti1999", citation: "Crystal Technology Inc., LiNbO3 material properties, data sheet DC-12 8/99 (vendor, V)" },
  gopalan1998: { id: "gopalan1998", citation: "V. Gopalan et al., The role of nonstoichiometry in 180 deg domain switching of LiNbO3 crystals, Appl. Phys. Lett. (1998)", doi: "10.1063/1.121491" },
  guarino2007: { id: "guarino2007", citation: "A. Guarino et al., Electro-optically tunable microring resonators in lithium niobate, Nat. Photon. (2007)", doi: "10.1038/nphoton.2007.93" },
  inbar1996: { id: "inbar1996", citation: "I. Inbar, R.E. Cohen, Comparison of the electronic structures and energetics of ferroelectric LiNbO3 and LiTaO3, Phys. Rev. B 53, 1193 (1996)", doi: "10.1103/PhysRevB.53.1193" },
  jackel1982: { id: "jackel1982", citation: "J.L. Jackel, C.E. Rice, J.J. Veselka, Proton exchange for high-index waveguides in LiNbO3, Appl. Phys. Lett. (1982)", doi: "10.1063/1.93615" },
  li2026photonics: { id: "li2026photonics", citation: "Low-Frequency Time-Domain Response of Thin-Film Lithium Niobate Electro-Optic Modulator, Photonics 13, 339 (2026)", doi: "10.3390/photonics13040339" },
  schwesyg2011: { id: "schwesyg2011", citation: "J.R. Schwesyg, Interaction of light with impurities in lithium niobate crystals (2011)" },
  carmon2004: { id: "carmon2004", citation: "T. Carmon, L. Yang, K.J. Vahala, Opt. Express 12, 4742 (2004)", doi: "10.1364/OPEX.12.004742" },
  lin2021: { id: "lin2021", citation: "Z. Lin, Z. Kang, P. Xu, Y. Tian, S. He, Opt. Express 29, 42932 (2021)", doi: "10.1364/OE.446527" },
  popescu2013: { id: "popescu2013", citation: "S.T. Popescu, A. Petris, V.I. Vlad, J. Appl. Phys. 113, 043101 (2013)", doi: "10.1063/1.4788696" },
  p05: { id: "p05", citation: "W. Jiang et al., Efficient bidirectional piezo-optomechanical transduction between microwave and optical frequency, Nat. Commun. 11, 1166 (2020); CC BY 4.0", doi: "10.1038/s41467-020-14863-3" },
  ciaaw: { id: "ciaaw", citation: "IUPAC CIAAW, abridged standard atomic weights; T. Prohaska et al., Pure Appl. Chem. 94, 573 (2022)", doi: "10.1515/pac-2019-0603" },
  "iupac-ciaaw": { id: "iupac-ciaaw", citation: "IUPAC CIAAW, abridged standard atomic weights; T. Prohaska et al., Pure Appl. Chem. 94, 573 (2022)", doi: "10.1515/pac-2019-0603" },
  "cie018-2019": { id: "cie018-2019", citation: "CIE, CIE 1931 colour-matching functions, 2 degree observer (data table, CC BY-SA 4.0)", doi: "10.25039/CIE.DS.xvudnb9b" },
  "cie-s014-2": { id: "cie-s014-2", citation: "ISO/CIE 11664-2 (CIE S 014-2), CIE standard illuminants: D65 relative spectral power distribution (CIE data table)" },
  green2008: { id: "green2008", citation: "M.A. Green, Sol. Energy Mater. Sol. Cells 92, 1305 (2008) (Si optical constants, 300 K; via refractiveindex.info)", doi: "10.1016/j.solmat.2008.06.009" },
  malitson1965: { id: "malitson1965", citation: "I.H. Malitson, JOSA 55, 1205 (1965) (fused silica dispersion)", doi: "10.1364/JOSA.55.001205" },
  "iec61966-2-1": { id: "iec61966-2-1", citation: "IEC 61966-2-1:1999, Multimedia systems and equipment - Colour measurement and management - Part 2-1: Default RGB colour space - sRGB" },
  campbell1968: { id: "campbell1968", citation: "J.J. Campbell, W.R. Jones, IEEE Trans. Sonics Ultrason. 15, 209 (1968) (partial-wave SAW method; C03 refs)", doi: "10.1109/T-SU.1968.29477" },
  ingebrigtsen1969: { id: "ingebrigtsen1969", citation: "K.A. Ingebrigtsen, J. Appl. Phys. 40, 2681 (1969) (k^2 = 2 dv/v; C03 refs, relation as cited in R11 S10)", doi: "10.1063/1.1658060" },
  c03calc: { id: "c03-calc", citation: "Lane C03 scratch computation 2026-10-25 (content/chapters/03-sound/manuscript.md, derived (calc))" },
};

// ---------------------------------------------------------------------------------------------
// Physical constants
// ---------------------------------------------------------------------------------------------
export const PHYS = {
  c: { value: 299792458, unit: "m/s", prov: { source: "si2019", status: "P", note: "exact" } },
  h: { value: 6.62607015e-34, unit: "J s", prov: { source: "si2019", status: "P", note: "exact" } },
  e: { value: 1.602176634e-19, unit: "C", prov: { source: "si2019", status: "P", note: "exact" } },
  kB: { value: 1.380649e-23, unit: "J/K", prov: { source: "si2019", status: "P", note: "exact" } },
  eps0: { value: 8.8541878128e-12, unit: "F/m", prov: { source: "codata2018", status: "reported" } },
  mu0: { value: 1.25663706212e-6, unit: "N/A^2", prov: { source: "codata2018", status: "reported" } },
  Z0: { value: 376.730313668, unit: "ohm", prov: { source: "codata2018", status: "reported" } },
} as const satisfies Record<string, Quantity>;

export const C0 = PHYS.c.value;
export const H = PHYS.h.value;
export const HBAR = PHYS.h.value / (2 * Math.PI);
export const QE = PHYS.e.value;
export const KB = PHYS.kB.value;
export const EPS0 = PHYS.eps0.value;

// ---------------------------------------------------------------------------------------------
// Crystal frame
// ---------------------------------------------------------------------------------------------
export const FRAME = {
  id: "IEEE176-1987/3m",
  x: "perpendicular to a mirror plane (along an a axis)",
  y: "in the mirror plane",
  z: "polar c axis",
  plusZ: "+Z face becomes negative on compression (positive d33); positive on cooling",
  plusY: "positive d22",
  handedness: "right",
  voigt: ["xx", "yy", "zz", "yz", "xz", "xy"],
  shearStrain: "engineering (S4 = 2 S23)",
  prov: { source: "ieee176", status: "P", locator: "Table 5 p. 18; Sec. 3.2.5; R14 rows 76-81" },
} as const;

// ---------------------------------------------------------------------------------------------
// Dispersion model coefficients
// ---------------------------------------------------------------------------------------------
export type Material = "CLN" | "MgO5-CLN" | "MgO1-SLN";
export type Axis = "o" | "e";

/** Zelmon form: n^2 - 1 = sum B_i L^2 / (L^2 - C_i), L in um, C in um^2. [B1, C1, B2, C2, B3, C3]. */
export interface SellmeierCoefficients {
  id: string;
  material: Material;
  axis: Axis;
  form: "zelmon";
  coef: readonly [number, number, number, number, number, number];
  lambda_um: readonly [number, number];
  T_ref_C: number;
  T_range_C: null;
  prov: Provenance;
  errata: readonly string[];
  isDefault: boolean;
  flags: readonly string[];
}

/** Jundt form: n^2 = a1 + b1 f + (a2 + b2 f)/(L^2 - (a3 + b3 f)^2) + (a4 + b4 f)/(L^2 - a5^2) - a6 L^2,
 *  f = (T - 24.5)(T + 570.82), T in C, L in um. a = [a1..a6], b = [b1..b4]. */
export interface JundtCoefficients {
  id: string;
  material: Material;
  axis: Axis;
  form: "jundt";
  a: readonly [number, number, number, number, number, number];
  b: readonly [number, number, number, number];
  lambda_um: readonly [number, number];
  T_ref_C: number;
  T_range_C: readonly [number, number];
  prov: Provenance;
  errata: readonly string[];
  isDefault: boolean;
  flags: readonly string[];
}

export type DispersionCoefficients = SellmeierCoefficients | JundtCoefficients;

const ZELMON_PROV: Provenance = { source: "zelmon1997", status: "P-db", locator: "Table 2 via rii YAML; re-checked in R06 sec. 2.3" };

export const ZELMON_CLN_O: SellmeierCoefficients = {
  id: "zelmon1997-cln-o", material: "CLN", axis: "o", form: "zelmon",
  coef: [2.6734, 0.01764, 1.229, 0.05914, 12.614, 474.6],
  lambda_um: [0.4, 5.0], T_ref_C: 21, T_range_C: null, prov: ZELMON_PROV, errata: [], isDefault: true, flags: [],
};
export const ZELMON_CLN_E: SellmeierCoefficients = {
  id: "zelmon1997-cln-e", material: "CLN", axis: "e", form: "zelmon",
  coef: [2.9804, 0.02047, 0.5981, 0.0666, 8.9543, 416.08],
  lambda_um: [0.4, 5.0], T_ref_C: 21, T_range_C: null, prov: ZELMON_PROV, errata: [], isDefault: true, flags: [],
};
const ZELMON_MGO_ERRATA = [
  "zelmon2026erratum (doi:10.1364/JOSAB.616304): the o and e headings for 5 mol% MgO in Table 2 are switched; applied here (o row has the larger index)",
  "gayer2008 p. 348 already noted the swap in print (R14 row 36d)",
] as const;
export const ZELMON_MGO5_O: SellmeierCoefficients = {
  id: "zelmon1997-mgo5-o", material: "MgO5-CLN", axis: "o", form: "zelmon",
  coef: [2.4272, 0.01478, 1.4617, 0.05612, 9.6536, 371.216],
  lambda_um: [0.4, 5.0], T_ref_C: 21, T_range_C: null,
  prov: { source: "zelmon1997", status: "P-db", locator: "Table 2 via rii YAML (rows swapped by rii, consistent with the 2026 erratum)" },
  errata: ZELMON_MGO_ERRATA, isDefault: true, flags: ["erratum-applied"],
};
export const ZELMON_MGO5_E: SellmeierCoefficients = {
  id: "zelmon1997-mgo5-e", material: "MgO5-CLN", axis: "e", form: "zelmon",
  coef: [2.2454, 0.01242, 1.3005, 0.05313, 6.8972, 331.33],
  lambda_um: [0.4, 5.0], T_ref_C: 21, T_range_C: null,
  prov: { source: "zelmon1997", status: "P-db", locator: "Table 2 via rii YAML (rows swapped by rii, consistent with the 2026 erratum)" },
  errata: ZELMON_MGO_ERRATA, isDefault: true, flags: ["erratum-applied"],
};

/** Jundt 1997, CLN extraordinary only. Coefficients via en.wikipedia (status S, primary not read: R06 sec. 2.3, R14 sec. 5 item 4).
 *  Excluded from defaults until checked against the primary. */
export const JUNDT_CLN_E: JundtCoefficients = {
  id: "jundt1997-cln-e", material: "CLN", axis: "e", form: "jundt",
  a: [5.35583, 0.100473, 0.20692, 100, 11.34927, 1.5334e-2],
  b: [4.629e-7, 3.862e-8, -0.89e-8, 2.657e-5],
  lambda_um: [0.4, 5.0], T_ref_C: 24.5, T_range_C: [20, 250],
  prov: { source: "jundt1997", status: "S", note: "coefficients via en.wikipedia; R06 C-checks: ne(1064, 24.5 C) = 2.1558, dne/dT(1550, 25 C) = 3.75e-5 /K" },
  errata: [], isDefault: false, flags: ["secondary-transcription"],
};

const GAYER_PROV: Provenance = { source: "gayer2008", status: "P", locator: "Table 1 p. 345; validity p. 348 (R14 row 36)" };
const GAYER_ERRATA = ["Appl. Phys. B 94, 367 (2009) replaces Fig. 3 only; Table 1 unchanged (R14 row 36a)"] as const;
const GAYER_FLAGS = [
  "dndT-anomalous: dn/dT from the published b coefficients is 2.65e-4 (MgO5 ne), 1.11e-4 (MgO5 no), -7.1e-5 (MgO1-SLN ne) /K at 1550 nm, 24.5 C, about 7x Jundt CLN; do not use for absolute dn/dT (R14 row 36c)",
] as const;

export const GAYER_MGO5_E: JundtCoefficients = {
  id: "gayer2008-mgo5-e", material: "MgO5-CLN", axis: "e", form: "jundt",
  a: [5.756, 0.0983, 0.202, 189.32, 12.52, 1.32e-2],
  b: [2.86e-6, 4.7e-8, 6.113e-8, 1.516e-4],
  lambda_um: [0.5, 4.0], T_range_C: [20, 200], T_ref_C: 24.5,
  prov: { ...GAYER_PROV, note: "lambda range from rii (0.5-4.0 um); T range 20-200 C from the primary" },
  errata: GAYER_ERRATA, isDefault: false, flags: GAYER_FLAGS,
};
export const GAYER_MGO5_O: JundtCoefficients = {
  id: "gayer2008-mgo5-o", material: "MgO5-CLN", axis: "o", form: "jundt",
  a: [5.653, 0.1185, 0.2091, 89.61, 10.85, 1.97e-2],
  b: [7.941e-7, 3.134e-8, -4.641e-9, -2.188e-6],
  lambda_um: [0.5, 1.62], T_range_C: [20, 100], T_ref_C: 24.5,
  prov: { ...GAYER_PROV, note: "primary: no reliable only to 1620 nm and about 20-100 C; lower lambda bound 0.5 um from rii" },
  errata: GAYER_ERRATA, isDefault: false, flags: GAYER_FLAGS,
};
export const GAYER_MGO1SLN_E: JundtCoefficients = {
  id: "gayer2008-mgo1sln-e", material: "MgO1-SLN", axis: "e", form: "jundt",
  a: [5.078, 0.0964, 0.2065, 61.16, 10.55, 1.59e-2],
  b: [4.677e-7, 7.822e-8, -2.653e-8, 1.096e-4],
  lambda_um: [0.5, 4.0], T_range_C: [20, 200], T_ref_C: 24.5,
  prov: { ...GAYER_PROV, note: "1% MgO doped stoichiometric LN (Table 1 caption, R14 row 36b); lambda range from rii" },
  errata: GAYER_ERRATA, isDefault: false, flags: GAYER_FLAGS,
};

export const DISPERSION_MODELS: readonly DispersionCoefficients[] = [
  ZELMON_CLN_O, ZELMON_CLN_E, ZELMON_MGO5_O, ZELMON_MGO5_E, JUNDT_CLN_E, GAYER_MGO5_E, GAYER_MGO5_O, GAYER_MGO1SLN_E,
];

// ---------------------------------------------------------------------------------------------
// Electro-optic coefficients (pm/V), 633 nm, IEEE 176 frame. All via weis1985 Table 4 p. 199 (P-comp).
// ---------------------------------------------------------------------------------------------
export interface EOSet {
  id: string;
  label: string;
  clamping: "S" | "T"; // S = clamped (constant strain), T = free (constant stress)
  lambda_nm: number;
  r13: number;
  r22: number;
  r33: number;
  r51: number;
  unit: "pm/V";
  prov: Provenance;
}
export const EO_TURNER1966_S: EOSet = {
  id: "turner1966-S", label: "Turner 1966, clamped", clamping: "S", lambda_nm: 633,
  r13: 8.6, r22: 3.4, r33: 30.8, r51: 28, unit: "pm/V",
  prov: { source: "weis1985", status: "P-comp", locator: "Table 4 p. 199 (Turner, APL 8, 303 (1966))" },
};
export const EO_KAMINOW1980_S: EOSet = {
  id: "kaminow1980-S", label: "Kaminow et al. 1980, clamped", clamping: "S", lambda_nm: 633,
  r13: 7.7, r22: 3.4, r33: 28.8, r51: 18.2, unit: "pm/V",
  prov: { source: "weis1985", status: "P-comp", locator: "Table 4 p. 199 (Kaminow et al., J. Appl. Phys. 51, 4379 (1980)); weis1985 calls these probably the most accurate" },
};
export const EO_ZOOK1967_T: EOSet = {
  id: "zook1967-bernal1966-T", label: "Zook et al. 1967 + Bernal 1966 (r51), free", clamping: "T", lambda_nm: 633,
  r13: 10.0, r22: 6.81, r33: 32.2, r51: 32, unit: "pm/V",
  prov: { source: "weis1985", status: "P-comp", locator: "Table 4 p. 199 (Zook, Chen, Otto 1967; r51 Bernal 1966)" },
};
/** Default EO set: Turner 1966 clamped (the eo-modulator-atlas library value and the mockup default). No 1550 nm values exist in any source held (R14 sec. 2.5). */
export const EO_DEFAULT = EO_TURNER1966_S;
export const EO_SETS: readonly EOSet[] = [EO_TURNER1966_S, EO_KAMINOW1980_S, EO_ZOOK1967_T];

// ---------------------------------------------------------------------------------------------
// Elastic, piezoelectric, dielectric (kushibiki1999 = default self-consistent set; R06 sec. 5 item 2)
// ---------------------------------------------------------------------------------------------
export interface Elastic3m { c11: number; c12: number; c13: number; c14: number; c33: number; c44: number; unit: "GPa"; prov: Provenance }
export interface Piezo3m { e15: number; e22: number; e31: number; e33: number; unit: "C/m^2"; prov: Provenance }
export interface Dielectric3m { eps11: number; eps33: number; boundary: "S" | "T"; unit: "1"; prov: Provenance }

export const CE_KUSHIBIKI1999: Elastic3m = {
  c11: 198.86, c12: 54.67, c13: 67.99, c14: 7.83, c33: 234.18, c44: 59.85, unit: "GPa",
  prov: { source: "kushibiki1999", status: "P", locator: "Table V; re-checked R06 sec. 2.9" },
};
export const CE_OGI2002: Elastic3m = {
  c11: 199.5, c12: 55.27, c13: 67.67, c14: 8.7, c33: 235.2, c44: 59.48, unit: "GPa",
  prov: { source: "ogi2002", status: "P", locator: "RUS, 30 C; R06 sec. 2.9" },
};
export const E_KUSHIBIKI1999: Piezo3m = {
  e15: 3.655, e22: 2.407, e31: 0.328, e33: 1.894, unit: "C/m^2",
  prov: { source: "kushibiki1999", status: "P", locator: "R06 sec. 2.10" },
};
export const E_OGI2002: Piezo3m = {
  e15: 3.65, e22: 2.39, e31: 0.31, e33: 1.72, unit: "C/m^2",
  prov: { source: "ogi2002", status: "P", locator: "R06 sec. 2.10" },
};
export const EPS_S_KUSHIBIKI1999: Dielectric3m = {
  eps11: 44.9, eps33: 26.7, boundary: "S", unit: "1",
  prov: { source: "kushibiki1999", status: "P", locator: "Table V (clamped, from the fit)" },
};
export const EPS_T_KUSHIBIKI1999: Dielectric3m = {
  eps11: 83.3, eps33: 28.5, boundary: "T", unit: "1",
  prov: { source: "kushibiki1999", status: "P", locator: "Table IV (free, measured)" },
};
export const DENSITY_KUSHIBIKI1999: Quantity = {
  value: 4642.8, unit: "kg/m^3", uncertainty: 0.2,
  prov: { source: "kushibiki1999", status: "P", locator: "Table IV (Archimedes, SAW-grade CLN)" },
};
export const DENSITY_OGI2002: Quantity = { value: 4636, unit: "kg/m^3", prov: { source: "ogi2002", status: "P", locator: "30 C" } };

/** Measured bulk velocities, kushibiki1999 Table II (P). Direction labels as printed (hexagonal plane indices). */
export const VELOCITIES_KUSHIBIKI1999 = [
  { mode: "L", dir: "Z", plane: "(006)", v: 7328.2, u: 0.32 },
  { mode: "S", dir: "Z", plane: "(006)", v: 3590.41, u: 0.23 },
  { mode: "L", dir: "X", plane: "(110)", v: 6544.53, u: 0.3 },
  { mode: "L", dir: "Y", plane: "(300)", v: 6806.55, u: 0.26 },
  { mode: "S", dir: "Y", plane: "(300)", v: 3940.49, u: 0.21 },
  { mode: "S", dir: "X", plane: "(110)", v: 4750.67, u: 0.59, note: "resonance method" },
] as const;
export const VELOCITIES_PROV: Provenance = { source: "kushibiki1999", status: "P", locator: "Table II; R06 sec. 2.12" };

// ---------------------------------------------------------------------------------------------
// Photoelastic (strain-optic), 633 nm: Avakyants et al. 1976 via weis1985 Table 7 (P-comp, signed)
// ---------------------------------------------------------------------------------------------
export const P_AVAKYANTS1976 = {
  p11: -0.026, p12: 0.09, p13: 0.133, p14: -0.075, p31: 0.179, p33: 0.071, p41: -0.151, p44: 0.146,
  prov: { source: "weis1985", status: "P-comp", locator: "Table 7 p. 201 (Avakyants, Kiselev, Shchitkov 1976)", note: "frame of the original not confirmed; see R14 row 75 before pairing with c14 > 0" } as Provenance,
} as const;

// ---------------------------------------------------------------------------------------------
// Second-order nonlinear d (pm/V): legacy-scale compilation values. Not a default anywhere.
// ---------------------------------------------------------------------------------------------
export const D_NLO_VOLK2008_LEGACY = {
  d33: 34, d31: 6, d22: 3, lambda_nm: 1064, unit: "pm/V", scale: "legacy (pre-Shoji 1997)",
  prov: { source: "volk2008", status: "P-comp", locator: "Table 1.2 p. 4 (ref. Nikogosyan 2005)", note: "about 35% above Shoji 1997 d33 = 25.2 pm/V (abstract only, U)" } as Provenance,
} as const;

// ---------------------------------------------------------------------------------------------
// Thermal, transport, photorefractive
// ---------------------------------------------------------------------------------------------
export const THERMAL_EXPANSION_CLN = {
  alpha_a: { value: 14.1e-6, unit: "1/K", prov: { source: "volk2008", status: "P-comp", locator: "Table 1.1 (300 K)" } },
  alpha_c: { value: 4.1e-6, unit: "1/K", prov: { source: "volk2008", status: "P-comp", locator: "Table 1.1 (300 K)" } },
} as const satisfies Record<string, Quantity>;

export const DARK_CONDUCTIVITY_CLN: Range = {
  min: 1e-16, max: 1e-14, unit: "S/m",
  prov: { source: "volk2008", status: "P-comp", locator: "Sec. 3.2.1 pp. 59-60 (1e-18 to 1e-16 1/(Ohm cm), room temperature, extrapolated)" },
};
export const MGO_THRESHOLD: Quantity = {
  value: 4.5, unit: "at.% MgO",
  prov: { source: "bryan1984", status: "P(abs)", note: "photorefractive resistance at >= 4.5 at.% MgO in congruent LN" },
};
export const MGO_PHOTOCONDUCTIVITY_FACTOR: Quantity = {
  value: 100, unit: "1",
  prov: { source: "bryan1984", status: "P(abs)", note: "about 100x photoconductivity increase above threshold; Glass current not reduced (R08 sec. 3.1)" },
};
export const PHOTOVOLTAIC_FIELD_ORDER: Quantity = {
  value: 1e7, unit: "V/m",
  prov: { source: "glass1974", status: "reported", note: "bulk photovoltaic saturation > 1000 V, about 1e5 V/cm (R08 sec. 3.1); order of magnitude only" },
};

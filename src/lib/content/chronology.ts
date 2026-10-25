// Landing chronology: ten dated events with DOI-linked references (DevLog-003 landing spec; research/R07).
// Shared by the TECH log table, the VISUAL time axis and cards, and the History door art.
export interface ChronEvent { date: string; event: string; ref: string; doi: string }
export const CHRONOLOGY: readonly ChronEvent[] = [
  { date: "1949-12-15", event: "Ferroelectricity in LiNbO<sub>3</sub> reported", ref: "Matthias & Remeika, Phys. Rev. 76, 1886", doi: "10.1103/PhysRev.76.1886.2" },
  { date: "1965-06-14", event: "Tunable optical parametric oscillation in LiNbO<sub>3</sub>", ref: "Giordmaine & Miller, PRL 14, 973", doi: "10.1103/PhysRevLett.14.973" },
  { date: "1965-12-15", event: "Interdigital transducer couples directly to surface elastic waves", ref: "White & Voltmer, APL 7, 314", doi: "10.1063/1.1754276" },
  { date: "1966-07-01", event: "Optically induced index inhomogeneities (optical damage) in LiNbO<sub>3</sub> and LiTaO<sub>3</sub>", ref: "Ashkin et al., APL 9, 72", doi: "10.1063/1.1754607" },
  { date: "1968-10-01", event: "Holographic storage in LiNbO<sub>3</sub>", ref: "Chen, LaMacchia & Fraser, APL 13, 223", doi: "10.1063/1.1652580" },
  { date: "1974-10-15", event: "Ti-indiffused LiNbO<sub>3</sub> waveguides", ref: "Schmidt & Kaminow, APL 25, 458", doi: "10.1063/1.1655547" },
  { date: "1993-02-01", event: "Field-poled first-order QPM waveguide for blue SHG", ref: "Yamada et al., APL 62, 435", doi: "10.1063/1.108925" },
  { date: "1998-10-19", event: "Single-crystal LiNbO<sub>3</sub> films by crystal ion slicing", ref: "Levy et al., APL 73, 2293", doi: "10.1063/1.121801" },
  { date: "2017-12-20", event: "Monolithic ultra-high-Q thin-film LiNbO<sub>3</sub> microring", ref: "Zhang et al., Optica 4, 1536", doi: "10.1364/OPTICA.4.001536" },
  { date: "2018-10", event: "Thin-film LiNbO<sub>3</sub> modulators at CMOS-compatible voltages", ref: "Wang et al., Nature 562, 101", doi: "10.1038/s41586-018-0551-y" },
];
/** Decimal year of an ISO date (missing month or day: mid-year, first of month). */
export const yearOf = (d: string): number => { const [y, m = 7, dd = 1] = d.split("-").map(Number); return y + (m - 1 + (dd - 1) / 31) / 12; };
export const escAmp = (s: string): string => s.replace(/&/g, "&amp;");

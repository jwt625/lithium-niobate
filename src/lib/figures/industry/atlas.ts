// Chapter 08 atlas statistics (charts B1-B6, F8.04 research series, F8.10 platform cards, 8.2 fab counts). Pure functions
// over the rows of static/data/industry/atlas-ln.json; rules from content/chapters/08-industry/chart-specs.md sec. 1-2.
// Every number on the page that comes from the atlas is computed here at prerender (no hand-copied counts).

export interface Dev {
  device_id: string; paper_id: string; year: number | null; platform: string; eo_material: string; device_class: string; row_kind: string;
  band: string; wavelength_nm: number | null; length_mm: number | null; integration: string; waveguide_platform: string; vpi_convention: string;
  vpil_best: number | null; vpil_source: string; vpil_q: string; bw3db_ghz: number | null; bw_q: string; bw_method: string;
  max_baud_gbd: number | null; max_line_rate_gbps: number | null; max_net_rate_gbps: number | null; modulation_format: string;
  length_q: string; evidence_ref: string; notes: string;
}
export interface Paper {
  paper_id: string; title: string; first_author: string; n_authors: number; year: number; venue: string; doi: string; url: string; countries: string; foundry_or_fab: string;
  wafer_supplier: string; discovered_via: string; redistribution: string;
}
export interface Atlas { source: { repo: string; commit: string; commit_date: string; fetched: string }; devices: Dev[]; papers: Paper[] }

export const TELECOM = new Set(["o_band", "c_band", "l_band", "cl_band"]);
export const MOD = new Set(["mzm", "iq_mzm"]);
export const PLATFORMS = ["TFLN", "TFLT", "SiPh", "InP", "BTO", "Polymer", "Other"] as const;
export type Plat = (typeof PLATFORMS)[number];
/** Chart platform label: the six named platforms, everything else (incl. Bulk Ti:LN, AlGaAs, Graphene/2D, GeSi EAM) as Other. */
export const plat = (p: string): Plat => ((PLATFORMS as readonly string[]).includes(p) ? (p as Plat) : "Other");
const LNLT = new Set(["TFLN", "TFLT"]);

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ---------- B1 ----------
export interface B1Opts { allBands: boolean; allConv: boolean; design: boolean }
export interface B1Point { d: Dev; x: number; y: number; gt: boolean; hollow: boolean; design: boolean }
export function b1Points(a: Atlas, o: B1Opts): B1Point[] {
  return a.devices.filter((d) => MOD.has(d.device_class) && (d.row_kind === "device" || (o.design && d.row_kind === "design"))
    && (o.allBands || TELECOM.has(d.band)) && (o.allConv || d.vpi_convention === "mzm_push_pull") && d.vpil_best !== null && d.bw3db_ghz !== null)
    .map((d) => ({ d, x: d.bw3db_ghz as number, y: d.vpil_best as number, gt: d.bw_q === "gt", hollow: d.vpi_convention !== "mzm_push_pull", design: d.row_kind === "design" }));
}

// ---------- B2 / F8.04 ----------
export type Metric = "max_baud_gbd" | "max_line_rate_gbps" | "max_net_rate_gbps";
export const isCoherent = (d: Dev): boolean => d.device_class === "iq_mzm" || /QAM|QPSK|DP-/i.test(d.modulation_format);
export function b2Rows(a: Atlas, m: Metric, scheme: "all" | "imdd" | "coh"): Dev[] {
  return a.devices.filter((d) => d.row_kind === "device" && d[m] !== null && d.year !== null && (scheme === "all" || (scheme === "coh") === isCoherent(d)));
}
/** Yearly maximum per platform: Map<platform, [year, value, device_id][]> sorted by year. */
export function yearlyMax(rows: Dev[], m: Metric): Map<Plat, [number, number, string][]> {
  const out = new Map<Plat, Map<number, [number, string]>>();
  for (const d of rows) {
    const p = plat(d.platform), y = d.year as number, v = d[m] as number;
    const mp = out.get(p) ?? new Map(); out.set(p, mp);
    const cur = mp.get(y);
    if (!cur || v > cur[0]) mp.set(y, [v, d.device_id]);
  }
  return new Map([...out].map(([p, mp]) => [p, [...mp].sort((x, y) => x[0] - y[0]).map(([y, [v, id]]) => [y, v, id] as [number, number, string])]));
}

// ---------- B3 ----------
/** Platforms of each paper (from its device rows, all row kinds); a paper counts once per platform. */
export function paperPlatforms(a: Atlas): Map<string, Set<Plat>> {
  const m = new Map<string, Set<Plat>>();
  for (const d of a.devices) { const s = m.get(d.paper_id) ?? new Set(); s.add(plat(d.platform)); m.set(d.paper_id, s); }
  return m;
}
export const isOFC = (p: Paper): boolean => p.discovered_via.split(";").includes("ofc2026");
export function b3Counts(a: Atlas, exclOFC: boolean): Map<Plat, Map<number, number>> {
  const pp = paperPlatforms(a), out = new Map<Plat, Map<number, number>>();
  for (const p of a.papers) {
    if (exclOFC && isOFC(p)) continue;
    for (const pl of pp.get(p.paper_id) ?? []) { const m = out.get(pl) ?? new Map(); m.set(p.year, (m.get(p.year) ?? 0) + 1); out.set(pl, m); }
  }
  return out;
}

// ---------- B4 ----------
export interface B4 { total: number; stated: number; nanoln: number; other: { paper_id: string; supplier: string; plat: string }[]; tfln: [number, number]; tflt: [number, number]; papers: { paper_id: string; nanoln: boolean; plat: string }[] }
export function b4(a: Atlas): B4 {
  const pp = paperPlatforms(a);
  const lnlt = a.papers.filter((p) => [...(pp.get(p.paper_id) ?? [])].some((x) => LNLT.has(x)));
  const isNano = (s: string): boolean => /nanoln|jingzheng/i.test(s);
  const st = lnlt.filter((p) => p.wafer_supplier.trim());
  const pl = (p: Paper): string => ((pp.get(p.paper_id) ?? new Set()).has("TFLN") ? "TFLN" : "TFLT");
  const cnt = (k: string): [number, number] => { const s = st.filter((p) => pl(p) === k); return [s.filter((p) => isNano(p.wafer_supplier)).length, s.length]; };
  return {
    total: lnlt.length, stated: st.length, nanoln: st.filter((p) => isNano(p.wafer_supplier)).length,
    other: st.filter((p) => !isNano(p.wafer_supplier)).map((p) => ({ paper_id: p.paper_id, supplier: p.wafer_supplier, plat: pl(p) })),
    tfln: cnt("TFLN"), tflt: cnt("TFLT"),
    papers: st.map((p) => ({ paper_id: p.paper_id, nanoln: isNano(p.wafer_supplier), plat: pl(p) })).sort((x, y) => Number(y.nanoln) - Number(x.nanoln) || x.plat.localeCompare(y.plat)),
  };
}

// ---------- B5 ----------
export const B5_SERIES = ["monolithic", "bonded_heterogeneous", "micro_transfer_printed", "foundry_native", "loaded", "o_band"] as const;
export type B5Key = (typeof B5_SERIES)[number] | "total";
const LOADED = new Set(["lnoi_loaded_sin", "lnoi_loaded_si", "ltoi_loaded_sin", "lnoi_loaded_oxide"]);
export function b5(a: Atlas): Map<number, Record<B5Key, number>> {
  const sets = new Map<number, Record<B5Key, Set<string>>>();
  for (const d of a.devices) {
    if (!LNLT.has(d.platform) || d.year === null) continue;
    const r = sets.get(d.year) ?? (Object.fromEntries([...B5_SERIES, "total"].map((k) => [k, new Set<string>()])) as Record<B5Key, Set<string>>);
    sets.set(d.year, r);
    r.total.add(d.paper_id);
    if ((B5_SERIES as readonly string[]).includes(d.integration)) r[d.integration as B5Key].add(d.paper_id);
    if (LOADED.has(d.waveguide_platform)) r.loaded.add(d.paper_id);
    if (d.band === "o_band") r.o_band.add(d.paper_id);
  }
  return new Map([...sets].sort((x, y) => x[0] - y[0]).map(([y, r]) => [y, Object.fromEntries(Object.entries(r).map(([k, s]) => [k, s.size])) as Record<B5Key, number>]));
}

// ---------- B6 / F8.10 ----------
export const telecomMod = (a: Atlas): Dev[] => a.devices.filter((d) => d.row_kind === "device" && MOD.has(d.device_class) && TELECOM.has(d.band));
export function b6(a: Atlas): Map<Plat, Dev[]> {
  const m = new Map<Plat, Dev[]>();
  for (const d of telecomMod(a)) if (d.length_mm !== null) { const p = plat(d.platform); m.set(p, [...(m.get(p) ?? []), d]); }
  return m;
}
export interface PlatStats { plat: Plat; papers: number; rows: number; vpil: { n: number; med: number | null; min: number | null }; bw: { n: number; med: number | null; max: number | null; lb: number }; len: { n: number; med: number | null } }
export function platStats(a: Atlas, p: Plat): PlatStats {
  const rows = telecomMod(a).filter((d) => plat(d.platform) === p);
  const v = rows.filter((d) => d.vpi_convention === "mzm_push_pull" && d.vpil_best !== null).map((d) => d.vpil_best as number);
  const b = rows.filter((d) => d.bw3db_ghz !== null);
  const L = rows.filter((d) => d.length_mm !== null).map((d) => d.length_mm as number);
  return {
    plat: p, papers: new Set(rows.map((d) => d.paper_id)).size, rows: rows.length,
    vpil: { n: v.length, med: median(v), min: v.length ? Math.min(...v) : null },
    bw: { n: b.length, med: median(b.map((d) => d.bw3db_ghz as number)), max: b.length ? Math.max(...b.map((d) => d.bw3db_ghz as number)) : null, lb: b.length ? b.filter((d) => d.bw_q === "gt").length / b.length : 0 },
    len: { n: L.length, med: median(L) },
  };
}

// ---------- 8.2: fabs and countries over TFLN/TFLT papers ----------
export function fabCounts(a: Atlas): { papers: number; fabs: [string, number][]; countries: [string, number][] } {
  const pp = paperPlatforms(a);
  const lnlt = a.papers.filter((p) => [...(pp.get(p.paper_id) ?? [])].some((x) => LNLT.has(x)));
  const tally = (f: (p: Paper) => string[]): [string, number][] => {
    const m = new Map<string, number>();
    for (const p of lnlt) for (const k of new Set(f(p))) m.set(k, (m.get(k) ?? 0) + 1);
    return [...m].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
  };
  const split = (s: string): string[] => s.split(";").map((x) => x.trim()).filter(Boolean);
  return { papers: lnlt.length, fabs: tally((p) => split(p.foundry_or_fab)), countries: tally((p) => split(p.countries)) };
}

export function atlasTotals(a: Atlas): { rows: number; device: number; design: number; papers: number; withRows: number; open: number; restricted: number; yMin: number; yMax: number } {
  const withRows = new Set(a.devices.map((d) => d.paper_id));
  const ys = a.papers.map((p) => p.year);
  return {
    rows: a.devices.length, device: a.devices.filter((d) => d.row_kind === "device").length, design: a.devices.filter((d) => d.row_kind === "design").length,
    papers: a.papers.length, withRows: a.papers.filter((p) => withRows.has(p.paper_id)).length,
    open: a.papers.filter((p) => p.redistribution === "open_license_ok").length, restricted: a.papers.filter((p) => p.redistribution !== "open_license_ok").length,
    yMin: Math.min(...ys), yMax: Math.max(...ys),
  };
}

// ---------- hover cards (chart-specs 1.7) ----------
export interface Card { id: string; who: string; title: string; year: number | null; venue: string; vals: string; meta: string; notes: string; link: string; ev: string }
const q = (op: string): string => (op === "gt" ? "> " : op === "lt" ? "< " : op === "approx" ? "about " : "");
export function cardsFor(a: Atlas, ids: Iterable<string>): Card[] {
  const P = new Map(a.papers.map((p) => [p.paper_id, p]));
  const D = new Map(a.devices.map((d) => [d.device_id, d]));
  const out: Card[] = [];
  for (const id of new Set(ids)) {
    const d = D.get(id); if (!d) continue;
    const p = P.get(d.paper_id);
    const vals = [
      d.vpil_best !== null ? `V&pi;L ${q(d.vpil_q)}${+d.vpil_best.toPrecision(3)} V cm (${d.vpil_source.replace("_", " ")}, ${d.vpi_convention || "convention not stated"})` : "",
      d.bw3db_ghz !== null ? `f<sub>3dB</sub> ${q(d.bw_q)}${d.bw3db_ghz} GHz${d.bw_method ? ` (${d.bw_method})` : ""}` : "",
      d.length_mm !== null ? `electrode ${q(d.length_q)}${d.length_mm} mm` : "",
      d.max_baud_gbd !== null ? `${d.max_baud_gbd} GBd` : "", d.max_line_rate_gbps !== null ? `line ${d.max_line_rate_gbps} Gb/s` : "", d.max_net_rate_gbps !== null ? `net ${d.max_net_rate_gbps} Gb/s` : "",
    ].filter(Boolean).join("; ");
    const t = p?.title ?? "";
    const who = p ? (p.n_authors > 2 ? `${p.first_author} et al.` : p.n_authors === 2 ? `${p.first_author} and coauthor` : p.first_author) : "";
    out.push({ id, who, title: t.length > 90 ? t.slice(0, 89) + "…" : t, year: d.year, venue: p?.venue ?? "", vals,
      meta: `${d.platform}, ${d.device_class}, ${d.band || "band not stated"}${d.row_kind === "design" ? ", design (simulated)" : ""}`,
      notes: d.notes, link: p?.url || (p?.doi ? `https://doi.org/${p.doi}` : ""), ev: d.evidence_ref });
  }
  return out;
}

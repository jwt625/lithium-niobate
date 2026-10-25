// Dev-time extractor (not imported by the app): copies the subsets of eo-modulator-atlas and photonics-atlas that the
// chapter 08 charts need into static/data/industry/, with a provenance sidecar. Pins and rules: content/chapters/
// 08-industry/chart-specs.md sec. 1 (platform map 1.2, derived fields 1.3, qualifiers 1.4, fields 1.6).
//
//   node src/lib/figures/industry/atlas-extract.ts <eo-modulator-atlas checkout> <photonics-atlas checkout>
//
// The input files must hash to the pinned SHA-256 values (the checkouts must sit at the pinned commits); the script
// stops otherwise. Only the listed fields are written; free-text notes are cut to 240 characters (hover card, 1.7).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const EO = { repo: "https://github.com/jwt625/eo-modulator-atlas", commit: "eb97f961165a331599e8191c62e15b5a52ba1d51", commit_date: "2026-10-20" };
const PA = { repo: "https://github.com/jwt625/photonics-atlas", commit: "26aa34093fde4b588cc92f5bf250ef58f74044a9", commit_date: "2026-10-23" };
const PIN: Record<string, string> = {
  "data/devices.csv": "0dd95c55abdf711b9511e561c5efa60db657f23553690dd211421f4036b987f7",
  "data/papers.csv": "62d5ddf8325cd88f0a4995c62021cefafd9683e72b820ea6044e10585dad1b67",
  "data/supply/product_usage.csv": "241e1c65b1058c8aeffc715d7fed14b6208806438ce2b8eefcfc0dc99abe1790",
};
const FETCHED = "2026-10-25";
const OUT = "static/data/industry";

function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [h, ...body] = rows.filter((r) => r.length > 1 || r[0]);
  return body.map((r) => Object.fromEntries(h.map((k, j) => [k, r[j] ?? ""])));
}

function load(root: string, rel: string): { rows: Record<string, string>[]; sha256: string; bytes: number } {
  const buf = readFileSync(join(root, rel));
  const sha256 = createHash("sha256").update(buf).digest("hex");
  if (sha256 !== PIN[rel]) throw new Error(`${rel}: SHA-256 ${sha256} does not match the pin ${PIN[rel]}`);
  return { rows: parseCSV(buf.toString("utf8")), sha256, bytes: buf.length };
}

const num = (s: string): number | null => (s === "" ? null : Number(s));
function platform(d: Record<string, string>): string {
  const m = d.eo_material, tags = d.tags.split(";");
  if (m === "lithium_niobate") return tags.includes("titanium_indiffused") ? "Bulk Ti:LN" : "TFLN";
  return ({ lithium_tantalate: "TFLT", silicon_plasma_dispersion: "SiPh", inp_mqw: "InP", barium_titanate: "BTO", eo_polymer: "Polymer",
    graphene_2d: "Graphene/2D", germanium_silicon_eam: "GeSi EAM", algaas_gaas: "AlGaAs" } as Record<string, string>)[m] ?? "Other";
}
/** Family name of "Given Family"; an all-capital trailing initial ("Anjali A R") falls back to the first token. */
function famName(a: string): string { const t = a.trim().split(/\s+/); const last = t[t.length - 1] ?? ""; return /^[A-Z]\.?$/.test(last) ? t[0] : last; }
const cut = (s: string, n: number): string => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

const [eoRoot, paRoot] = process.argv.slice(2);
if (!eoRoot || !paRoot) throw new Error("usage: node atlas-extract.ts <eo-modulator-atlas> <photonics-atlas>");
const dev = load(eoRoot, "data/devices.csv");
const pap = load(eoRoot, "data/papers.csv");
const use = load(paRoot, "data/supply/product_usage.csv");
const year = new Map(pap.rows.map((p) => [p.paper_id, Number(p.year)]));

const devices = dev.rows.map((d) => {
  const q = Object.fromEntries(d.qualifiers.split(";").filter(Boolean).map((s) => s.split(":") as [string, string]));
  const vdc = num(d.vpil_dc_vcm), vpi = num(d.vpi_dc_v), L = num(d.length_mm), vrf = num(d.vpil_rf_vcm);
  let vpil_best: number | null = null, vpil_source = "", vpil_q = "";
  if (vdc !== null) { vpil_best = vdc; vpil_source = "reported_dc"; vpil_q = q.vpil_dc_vcm ?? ""; }
  else if (vpi !== null && L !== null) { vpil_best = (vpi * L) / 10; vpil_source = "derived_dc"; vpil_q = q.vpi_dc_v ?? q.length_mm ?? ""; }
  else if (vrf !== null) { vpil_best = vrf; vpil_source = "reported_rf"; vpil_q = q.vpil_rf_vcm ?? ""; }
  return {
    device_id: d.device_id, paper_id: d.paper_id, year: year.get(d.paper_id) ?? null, platform: platform(d), eo_material: d.eo_material,
    device_class: d.device_class, row_kind: d.row_kind, band: d.band, wavelength_nm: num(d.wavelength_nm), length_mm: L,
    integration: d.integration, waveguide_platform: d.waveguide_platform, vpi_convention: d.vpi_convention,
    vpil_best, vpil_source, vpil_q, bw3db_ghz: num(d.bw3db_ghz), bw_q: q.bw3db_ghz ?? "", bw_method: d.bw_method,
    max_baud_gbd: num(d.max_baud_gbd), max_line_rate_gbps: num(d.max_line_rate_gbps), max_net_rate_gbps: num(d.max_net_rate_gbps),
    modulation_format: cut(d.modulation_format, 120), length_q: q.length_mm ?? "", evidence_ref: d.evidence_ref, notes: cut(d.notes, 240),
  };
});
const papers = pap.rows.map((p) => ({
  paper_id: p.paper_id, title: p.title, first_author: famName(p.authors.split(";")[0] ?? ""), n_authors: p.authors.split(";").filter((x) => x.trim()).length, year: Number(p.year), venue: p.venue, doi: p.doi, url: p.url, countries: p.countries,
  foundry_or_fab: p.foundry_or_fab, wafer_supplier: p.wafer_supplier, discovered_via: p.discovered_via, redistribution: p.redistribution,
}));
const lnoi = use.rows.filter((u) => u.category_id === "A2.1").map((u) => ({ usage_id: u.usage_id, source_id: u.source_id, org_id: u.org_id,
  category_id: u.category_id, role: u.role, locator: u.locator, basis: u.basis, verified_on: u.verified_on }));

mkdirSync(OUT, { recursive: true });
const src = { repo: EO.repo, commit: EO.commit, commit_date: EO.commit_date, fetched: FETCHED };
writeFileSync(join(OUT, "atlas-ln.json"), JSON.stringify({ source: src, devices, papers }) + "\n");
writeFileSync(join(OUT, "photonics-atlas-lnoi.json"), JSON.stringify({ source: { repo: PA.repo, commit: PA.commit, commit_date: PA.commit_date, fetched: FETCHED }, usage: lnoi }, null, 1) + "\n");
const sha = (f: string): string => createHash("sha256").update(readFileSync(join(OUT, f))).digest("hex");
writeFileSync(join(OUT, "provenance.json"), JSON.stringify({
  note: "Subsets of public atlas files, copied for the chapter 08 charts. Upstream has no LICENSE file (data license pending, author question 8); facts are shown with attribution and locators.",
  extractor: "src/lib/figures/industry/atlas-extract.ts",
  inputs: [
    { repo: EO.repo, commit: EO.commit, commit_date: EO.commit_date, file: "data/devices.csv", sha256: dev.sha256, bytes: dev.bytes, rows: dev.rows.length, fetched: FETCHED },
    { repo: EO.repo, commit: EO.commit, commit_date: EO.commit_date, file: "data/papers.csv", sha256: pap.sha256, bytes: pap.bytes, rows: pap.rows.length, fetched: FETCHED },
    { repo: PA.repo, commit: PA.commit, commit_date: PA.commit_date, file: "data/supply/product_usage.csv", sha256: use.sha256, bytes: use.bytes, rows: use.rows.length, fetched: FETCHED },
  ],
  outputs: [
    { file: "atlas-ln.json", sha256: sha("atlas-ln.json"), from: ["data/devices.csv", "data/papers.csv"], rows: { devices: devices.length, papers: papers.length },
      derived: "platform (chart-specs 1.2), vpil_best / vpil_source (1.3, as atlas scripts/build_views.py), bw_q / vpil_q / length_q from qualifiers (1.4), year from papers.csv; notes cut to 240 characters, modulation_format to 120" },
    { file: "photonics-atlas-lnoi.json", sha256: sha("photonics-atlas-lnoi.json"), from: ["data/supply/product_usage.csv"], rows: { usage: lnoi.length }, filter: "category_id = A2.1 (LNOI)" },
  ],
}, null, 1) + "\n");
console.log(`devices ${devices.length}, papers ${papers.length}, lnoi usage ${lnoi.length}`);

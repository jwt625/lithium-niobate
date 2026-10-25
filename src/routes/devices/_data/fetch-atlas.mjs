#!/usr/bin/env node
// Vendors the eo-modulator-atlas rows that chapter 06 charts read (A1-A7, F6.02-F6.07) into
// static/data/devices/atlas-ln.json with a provenance sidecar atlas-ln.provenance.json.
// Source: eo-modulator-atlas (public, github.com/jwt625/eo-modulator-atlas) pinned at commit eb97f961165a331599e8191c62e15b5a52ba1d51.
// Conventions: content/chapters/08-industry/chart-specs.md sec. 1 (platform mapping 1.2, vpil_best 1.3, qualifiers 1.4,
// fields 1.6). The full CSVs are never copied; only the listed fields, notes truncated to 240 characters.
//
// Usage (from the repo root):
//   node src/routes/devices/_data/fetch-atlas.mjs            # read a local checkout (ATLAS_DIR, default ../eo-modulator-atlas)
//   node src/routes/devices/_data/fetch-atlas.mjs --remote   # fetch the pinned files from raw.githubusercontent.com
//   node src/routes/devices/_data/fetch-atlas.mjs --check    # verify only, write nothing
// Exits non-zero when a SHA-256 differs from the pinned value.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const SHA = "eb97f961165a331599e8191c62e15b5a52ba1d51";
const COMMIT_DATE = "2026-10-20";
const PINNED = {
  "devices.csv": { sha256: "0dd95c55abdf711b9511e561c5efa60db657f23553690dd211421f4036b987f7", bytes: 772730 },
  "papers.csv": { sha256: "62d5ddf8325cd88f0a4995c62021cefafd9683e72b820ea6044e10585dad1b67", bytes: 416422 },
};
const REPO = "https://github.com/jwt625/eo-modulator-atlas";
const RAW = (f) => `https://raw.githubusercontent.com/jwt625/eo-modulator-atlas/${SHA}/data/${f}`;
const OUT_DIR = resolve("static/data/devices");
const args = new Set(process.argv.slice(2));

/** RFC 4180 CSV parser (quoted fields, doubled quotes, newlines inside quotes). */
function parseCSV(text) {
  const rows = [];
  let row = [], f = "", i = 0, q = false;
  while (i < text.length) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i += 2; continue; } q = false; i++; continue; }
      f += c; i++; continue;
    }
    if (c === '"') { q = true; i++; continue; }
    if (c === ",") { row.push(f); f = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; i++; continue; }
    f += c; i++;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, j) => [h, r[j] ?? ""])));
}

async function load(name) {
  let buf;
  if (args.has("--remote")) {
    const res = await fetch(RAW(name));
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
  } else {
    const dir = resolve(process.env.ATLAS_DIR ?? "../eo-modulator-atlas");
    buf = readFileSync(join(dir, "data", name));
  }
  const sha256 = createHash("sha256").update(buf).digest("hex");
  if (sha256 !== PINNED[name].sha256 || buf.length !== PINNED[name].bytes) {
    console.error(`SHA-256 mismatch for ${name}: got ${sha256} (${buf.length} bytes), pinned ${PINNED[name].sha256} (${PINNED[name].bytes} bytes)`);
    process.exit(1);
  }
  return { rows: parseCSV(buf.toString("utf8")), sha256, bytes: buf.length };
}

const PLATFORM = {
  lithium_tantalate: "TFLT", silicon_plasma_dispersion: "SiPh", inp_mqw: "InP", barium_titanate: "BTO", eo_polymer: "Polymer",
  graphene_2d: "Graphene/2D", germanium_silicon_eam: "GeSi EAM", algaas_gaas: "AlGaAs",
};
const platformOf = (r) =>
  r.eo_material === "lithium_niobate" ? (r.tags.split(";").includes("titanium_indiffused") ? "Bulk Ti:LN" : "TFLN") : PLATFORM[r.eo_material] ?? "Other";
const num = (s) => (s === "" || s == null ? null : Number.isFinite(Number(s)) ? Number(s) : null);
const TELECOM = new Set(["o_band", "c_band", "l_band", "cl_band"]);

const NUMERIC = ["wavelength_nm", "length_mm", "vpi_dc_v", "vpi_rf_v", "vpil_dc_vcm", "vpil_rf_vcm", "bw3db_ghz", "bw_measured_to_ghz",
  "max_baud_gbd", "max_line_rate_gbps", "max_net_rate_gbps", "il_onchip_db", "prop_loss_db_per_cm", "rf_loss_db_per_cm", "rf_loss_freq_ghz",
  "z0_ohm", "n_rf", "ng_opt", "q_loaded", "eo_film_thickness_nm", "electrode_gap_um", "tuning_nm_per_v"];
const TEXT = ["device_id", "paper_id", "platform", "eo_material", "waveguide_platform", "integration", "electrode_type", "device_class", "row_kind",
  "tags", "band", "vpi_convention", "bw3db_reference", "bw_method", "modulation_format", "il_onchip_scope", "crystal_cut", "qualifiers", "evidence_ref", "notes"];
const PAPER = ["paper_id", "title", "year", "venue", "doi", "url"];

const dev = await load("devices.csv");
const pap = await load("papers.csv");
const papers = new Map(pap.rows.map((p) => [p.paper_id, p]));

const devices = dev.rows.map((r) => {
  const o = {};
  for (const k of TEXT) { const v = k === "platform" ? platformOf(r) : r[k]; if (v !== "" && v != null) o[k] = k === "notes" && v.length > 240 ? `${v.slice(0, 239)}…` : v; }
  for (const k of NUMERIC) { const v = num(r[k]); if (v !== null) o[k] = v; }
  // vpil_best (chart-specs 08 sec. 1.3, atlas build_views.py)
  const dc = num(r.vpil_dc_vcm), v = num(r.vpi_dc_v), L = num(r.length_mm), rf = num(r.vpil_rf_vcm);
  if (dc !== null) { o.vpil_best = dc; o.vpil_source = "reported_dc"; }
  else if (v !== null && L !== null) { o.vpil_best = (v * L) / 10; o.vpil_source = "derived_dc"; }
  else if (rf !== null) { o.vpil_best = rf; o.vpil_source = "reported_rf"; }
  o.year = num(papers.get(r.paper_id)?.year);
  o.telecom = TELECOM.has(r.band);
  return o;
});
const used = new Set(devices.map((d) => d.paper_id));
const paperOut = pap.rows.filter((p) => used.has(p.paper_id)).map((p) => {
  const o = {};
  for (const k of PAPER) { const v = k === "year" ? num(p[k]) : p[k]; if (v !== "" && v != null) o[k] = v; }
  // first author's family name for short citations: the token span of the first author's name that spells the paper_id
  // prefix (e.g. "Arab Juneghani" for arabjuneghani2022), else the capitalized prefix
  const pre = (p.paper_id.match(/^[a-z]+/) ?? [""])[0];
  const toks = (p.authors ?? "").split(";")[0].trim().split(/\s+/).filter(Boolean);
  const flat = (t) => t.normalize("NFD").replace(/[^A-Za-z]/g, "").toLowerCase();
  let fam = "";
  for (let i = 0; i < toks.length && !fam; i++) for (let j = i + 1; j <= toks.length && !fam; j++) if (flat(toks.slice(i, j).join("")) === pre) fam = toks.slice(i, j).join(" ");
  o.first_author = fam || pre.charAt(0).toUpperCase() + pre.slice(1);
  return o;
});

// ---------- acceptance counts (chart-specs 06 A1-A7); printed, and failures exit non-zero ----------
const q = (d, f) => new Set((d.qualifiers ?? "").split(";").filter((s) => s.startsWith(`${f}:`)).map((s) => s.split(":")[1]));
const isDev = (d) => d.row_kind === "device";
const mzm = (d) => d.device_class === "mzm" || d.device_class === "iq_mzm";
const pp = (d) => d.vpi_convention === "mzm_push_pull";
const tally = (a) => { const m = a.reduce((m, d) => ((m[d.platform] = (m[d.platform] ?? 0) + 1), m), {}); return Object.fromEntries(Object.entries(m).sort()); };
const checks = [];
const expect = (name, got, want) => { if (want && typeof want === "object" && !Array.isArray(want)) want = Object.fromEntries(Object.entries(want).sort()); const ok = JSON.stringify(got) === JSON.stringify(want); checks.push({ name, ok, got }); if (!ok) console.error(`FAIL ${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); };
const a1 = devices.filter((d) => isDev(d) && mzm(d) && d.telecom && pp(d) && d.vpil_best != null && d.bw3db_ghz != null);
expect("A1 default points", a1.length, 71);
expect("A1 platforms", tally(a1), { TFLN: 56, TFLT: 9, Polymer: 3, InP: 1, AlGaAs: 1, Other: 1 });
expect("A1 bounds", a1.filter((d) => q(d, "bw3db_ghz").has("gt")).length, 30);
expect("A1 all bands/conventions", devices.filter((d) => isDev(d) && mzm(d) && d.vpil_best != null && d.bw3db_ghz != null).length, 146);
const lnlt = (d) => d.platform === "TFLN" || d.platform === "TFLT";
const a2 = devices.filter((d) => lnlt(d) && d.n_rf != null && d.ng_opt != null);
expect("A2 points", a2.length, 28);
expect("A2 within 0.1", a2.filter((d) => Math.abs(d.n_rf - d.ng_opt) <= 0.1 + 1e-9).length, 23);
const a3 = devices.filter((d) => d.platform === "TFLN" && isDev(d) && mzm(d) && pp(d) && /^x/i.test(d.crystal_cut ?? "") && d.electrode_gap_um != null && d.wavelength_nm != null && d.vpil_best != null);
expect("A3 points", a3.length, 71);
const a4 = devices.filter((d) => isDev(d) && mzm(d) && d.telecom && pp(d) && d.length_mm != null && d.vpi_dc_v != null);
expect("A4 points", a4.length, 91);
expect("A4 platforms", tally(a4), { TFLN: 60, TFLT: 14, Polymer: 8, InP: 3, Other: 3, BTO: 2, AlGaAs: 1 });
const a5 = devices.filter((d) => lnlt(d) && isDev(d) && pp(d) && d.wavelength_nm != null && d.vpil_best != null);
expect("A5 points", a5.length, 117);
expect("A5 platforms", tally(a5), { TFLN: 95, TFLT: 22 });
const a7 = devices.filter((d) => lnlt(d) && isDev(d) && (d.device_class === "ring" || d.device_class === "resonator") && d.q_loaded != null && d.bw3db_ghz != null);
expect("A7 points", a7.length, 13);
expect("rows (all, device, papers referenced; 233 papers in papers.csv)", [devices.length, devices.filter(isDev).length, paperOut.length, pap.rows.length], [519, 486, 215, 233]);

const failed = checks.filter((c) => !c.ok).length;
console.log(`${checks.length - failed}/${checks.length} acceptance counts match chart-specs`);
if (failed) process.exit(2);
if (args.has("--check")) process.exit(0);

const fetchedOn = new Date().toISOString().slice(0, 10);
const source = { repo: REPO, sha: SHA, commit_date: COMMIT_DATE, fetched_on: fetchedOn, mode: args.has("--remote") ? "raw.githubusercontent.com" : "local checkout at the pinned commit",
  files: { "data/devices.csv": PINNED["devices.csv"], "data/papers.csv": PINNED["papers.csv"] }, license: "none upstream at the pin (open question Q6.1); facts with locators and attribution",
  conventions: "content/chapters/08-industry/chart-specs.md sec. 1" };
// chapter 06 subset: every MZM / IQ row (any platform; A1, A4) and every TFLN / TFLT row (A2, A3, A5, A7, 6.1 counts)
const keep = devices.filter((d) => mzm(d) || lnlt(d));
const keepP = new Set(keep.map((d) => d.paper_id));
const json = JSON.stringify({ source: { ...source, subset: "rows with device_class in {mzm, iq_mzm} (any platform) or platform in {TFLN, TFLT}" }, devices: keep, papers: paperOut.filter((p) => keepP.has(p.paper_id)) });
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "atlas-ln.json"), json);
const outSha = createHash("sha256").update(json).digest("hex");
writeFileSync(join(OUT_DIR, "atlas-ln.provenance.json"), JSON.stringify({ ...source, output: { file: "atlas-ln.json", sha256: outSha, bytes: Buffer.byteLength(json), devices: keep.length, papers: keepP.size },
  generator: "src/routes/devices/_data/fetch-atlas.mjs", acceptance: checks.map((c) => ({ name: c.name, ok: c.ok, got: c.got })) }, null, 1));
console.log(`wrote atlas-ln.json (${Buffer.byteLength(json)} bytes, sha256 ${outSha})`);

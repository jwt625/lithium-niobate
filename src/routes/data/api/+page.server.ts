// /data/api/: documentation generated from static/api/openapi.json, with example responses read from the static files,
// curl lines, llms.txt and CITATION.cff pointers, license.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { PageMeta } from "$lib/content/site";
import INDEX from "$lib/generated/index.json";

interface Param { name: string; schema: { enum?: string[] } }
interface Op { summary?: string; parameters?: Param[]; responses: Record<string, { content: Record<string, unknown> }> }
const PREF: Record<string, string> = { model_id: "zelmon1997-cln-e", property: "refractive-index-e", variant: "cln", tensor: "elastic-stiffness-cE", source_id: "kushibiki1999", type: "scalar", temperature: "T21C" };
const SITE = "https://lithium-niobate.com";

function trimJSON(v: unknown, depth = 0): unknown {
  if (Array.isArray(v)) { const head = v.slice(0, 2).map((x) => trimJSON(x, depth + 1)); return v.length > 2 ? [...head, `... ${v.length - 2} more`] : head; }
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).slice(0, depth > 1 ? 6 : 14).map(([k, x]) => [k, trimJSON(x, depth + 1)]));
  if (typeof v === "string" && v.length > 110) return `${v.slice(0, 107)}...`;
  return v;
}
function example(file: string): { text: string; lines: number; bytes: number } {
  const raw = readFileSync(file, "utf8");
  let text: string;
  if (file.endsWith(".json")) text = JSON.stringify(trimJSON(JSON.parse(raw)), null, 1);
  else text = raw.split("\n").slice(0, 10).map((l) => (l.length > 140 ? `${l.slice(0, 137)}...` : l)).join("\n");
  const lines = text.split("\n");
  return { text: lines.slice(0, 40).join("\n") + (lines.length > 40 ? "\n..." : ""), lines: raw.split("\n").length, bytes: Buffer.byteLength(raw) };
}

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Data API",
    description: "Static, path-parameterized JSON/CSV API for lithium niobate properties, tensors, dispersion models, events and sources: every endpoint with an example response and a curl line. Data CC BY 4.0.",
  };
  const root = process.cwd();
  const spec = JSON.parse(readFileSync(join(root, "static/api/openapi.json"), "utf8")) as { openapi: string; info: { title: string; version: string }; paths: Record<string, { get: Op }> };
  const eps = Object.entries(spec.paths).map(([path, { get }]) => {
    const params = (get.parameters ?? []).map((p) => ({ name: p.name, n: p.schema.enum?.length ?? 0, sample: p.schema.enum?.slice(0, 4) ?? [] }));
    let url = path;
    for (const p of get.parameters ?? []) {
      const choice = p.schema.enum?.includes(PREF[p.name]) || !p.schema.enum?.length ? PREF[p.name] : p.schema.enum[0];
      url = url.replace(`{${p.name}}`, choice ?? p.schema.enum?.[0] ?? "");
    }
    const file = join(root, "static", url);
    const ex = existsSync(file) ? example(file) : null;
    const type = Object.keys(get.responses["200"]?.content ?? {})[0] ?? "";
    const group = /^\/llms/.test(path) ? "Agents" : /properties/.test(path) ? "Scalar properties" : /tensors/.test(path) ? "Tensors" : /dispersion|grids/.test(path) ? "Dispersion" : /events|records|publications|glossary/.test(path) ? "Events, records, glossary" : /unverified/.test(path) ? "Unverified" : "Catalog and metadata";
    return { path, summary: get.summary ?? "", params, url, curl: `curl -s ${SITE}${url}`, type, ex, group };
  });
  const groups = ["Catalog and metadata", "Scalar properties", "Tensors", "Dispersion", "Events, records, glossary", "Agents", "Unverified"].filter((g) => eps.some((e) => e.group === g));
  const cff = readFileSync(join(root, "CITATION.cff"), "utf8");
  const pick = (k: string): string => new RegExp(`^${k}:\\s*"?([^"\\n]*)"?`, "m").exec(cff)?.[1] ?? "";
  const citation = { title: pick("title"), version: pick("version"), date: pick("date-released"), url: pick("url"), licenses: [...cff.matchAll(/^\s+- (GPL-3\.0|CC-BY-4\.0)$/gm)].map((m) => m[1]) };
  const llms = readFileSync(join(root, "static/llms.txt"), "utf8").split("\n").slice(0, 3).join("\n");
  const counts = (INDEX as { counts: { unverified: number } }).counts;
  const unv = JSON.parse(readFileSync(join(root, "static/api/v1/unverified.json"), "utf8")) as Record<string, unknown[]>;
  const unvParts = Object.entries(unv).filter(([, v]) => v.length).map(([k, v]) => `${v.length} ${k}`);
  return { meta, openapi: spec.openapi, version: spec.info.version, eps, groups, citation, llms, unverified: counts.unverified, unvParts };
};

// /data/<property>/: every public record of one property or tensor, its spread, endpoints, and Dataset JSON-LD.
import { error } from "@sveltejs/kit";
import type { PageMeta } from "$lib/content/site";
import JSONLD from "$lib/generated/jsonld.json";
import TENSORS from "$lib/generated/tensors.json";
import { dataRows, endpointVariants, VARIANT_NAMES } from "$lib/figures/p09/data.server";
import { spreadSVG, type SpreadRow } from "$lib/figures/p09/spread";

export const entries = () => dataRows().props.map((p) => ({ property: p.id }));

const SITE = "https://lithium-niobate.com";
export const load = ({ params }: { params: { property: string } }) => {
  const { rows: all, props } = dataRows();
  const prop = props.find((p) => p.id === params.property);
  if (!prop) error(404, "no such property");
  const rows = all.filter((r) => r.prop === prop.id);
  const short = (r: (typeof rows)[number]): string => `${r.src.split(",")[0]} [${r.st}]`;
  let spread: SpreadRow[] = [];
  if (prop.kind === "scalar") {
    const groups = new Map<string, SpreadRow>();
    for (const r of rows) {
      if (!r.num) continue;
      const key = `${r.v}|${r.ucum}|${r.wl ?? ""}`;
      const label = `${VARIANT_NAMES[r.v]?.match(/\(([^)]+)\)$/)?.[1] ?? r.v}${r.wl ? `, ${r.wl} nm` : ""}`;
      if (!groups.has(key)) groups.set(key, { label, unit: r.ucum, pts: [] });
      (groups.get(key) as SpreadRow).pts.push(r.num.length === 2 ? { v: (r.num[0] + r.num[1]) / 2, lo: r.num[0], hi: r.num[1], st: r.st, label: short(r) } : { v: r.num[0], unc: r.unc, st: r.st, label: short(r) });
    }
    spread = [...groups.values()];
  } else {
    const recs = (TENSORS as unknown as { id: string; tensor: string; independent: Record<string, { value: number; uncertainty?: { value?: number } }>; provenance: { status: string } }[]).filter((t) => t.tensor === prop.id);
    const comps = [...new Set(recs.flatMap((t) => Object.keys(t.independent)))];
    spread = comps.map((k) => ({ label: k, unit: "", pts: recs.filter((t) => t.independent[k]).map((t) => ({ v: t.independent[k].value, unc: t.independent[k].uncertainty?.value, st: t.provenance.status, label: `${rows.find((r) => r.id === t.id)?.src.split(",")[0] ?? t.id} [${t.provenance.status}]` })) }));
  }
  const vars = endpointVariants(prop.id);
  const base = prop.kind === "tensor" ? `/api/v1/tensors/${prop.id}` : `/api/v1/properties/${prop.id}`;
  const endpoints = [{ label: "all records", href: `${base}.json` }, ...vars.map((v) => ({ label: v, href: `${base}/${v}.json` })), { label: "CSV, all properties", href: prop.kind === "tensor" ? "/api/v1/tensors.csv" : "/api/v1/properties.csv" }];
  let jsonld = (JSONLD as Record<string, unknown>)[prop.id];
  if (!jsonld) {
    const dois = [...new Set(rows.map((r) => r.doi).filter(Boolean))];
    jsonld = {
      "@context": "https://schema.org", "@type": "Dataset", name: `LiNbO3 ${prop.name}`,
      description: `${prop.name} of lithium niobate (LiNbO3): ${rows.length} provenance-tagged tensor record(s) in the 3m crystal-physics frame with independent components, Voigt matrix and full Cartesian tensor; variants ${prop.variants.join(", ")}. Each record carries conditions, frame and sign convention, the source locator and a status code.`,
      about: { "@type": "ChemicalSubstance", name: "lithium niobate", chemicalComposition: "LiNbO3" }, creator: { "@type": "Person", name: "Wentao Jiang" },
      license: "https://creativecommons.org/licenses/by/4.0/", isAccessibleForFree: true, url: `${SITE}${base}.json`, identifier: `${SITE}${base}.json`,
      citation: dois.map((d) => `https://doi.org/${d}`), keywords: ["lithium niobate", "LiNbO3", prop.name],
      distribution: [{ "@type": "DataDownload", contentUrl: `${SITE}${base}.json`, encodingFormat: "application/json" }, { "@type": "DataDownload", contentUrl: `${SITE}/api/v1/tensors.csv`, encodingFormat: "text/csv" }],
      variableMeasured: [{ "@type": "PropertyValue", name: prop.name, unitText: rows[0]?.ucum ?? "" }], version: "0.1.0",
    };
  }
  const meta: Partial<PageMeta> = { title: prop.name.replace(/_/g, ""), description: `${prop.name} of lithium niobate: ${rows.length} records with sources, conditions and status; JSON and CSV endpoints.`, keys: ["P", "P-comp", "P-db", "S", "V", "derived"] };
  return { meta, prop, rows, spread: spread.length ? spreadSVG(spread) : "", nSpread: spread.length, endpoints, jsonld: JSON.stringify(jsonld).replace(/</g, "\\u003c") };
};

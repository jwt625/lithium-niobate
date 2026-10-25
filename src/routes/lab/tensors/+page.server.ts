// F4 full screen: public tensor records (src/lib/generated/tensors.json) trimmed for the explorer; default-state markup.
import type { PageMeta } from "$lib/content/site";
import TENSORS from "$lib/generated/tensors.json";
import { cite, condText, frameText, stripNotes, replaceKeys, keyShort } from "$lib/figures/p09/sources.server";
import { TX_KINDS, computeTx, matrixHTML, glyphGridSVG, orientSVG, exportComsol, exportJSON, kindOf, type TxRecord } from "$lib/figures/p09/tensorx";
import { TX_DEFAULT } from "$lib/stores/p09";

interface Raw { id: string; tensor: string; name: string; symbol: string; unit: { display: string }; provenance: { status: string; source_id: string; locator?: string }; voigt: number[][]; conditions?: Record<string, unknown>; frame?: Record<string, unknown>; notes?: string; default?: boolean; public?: boolean }

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Tensors and Frame Conventions",
    description: "Lithium niobate tensors and frame conventions: rotate stored 3m tensors (c, s, e, d, r, SHG d, p, permittivity) into any cut with Euler angles, see which components flip sign with the frame choice, export COMSOL-ordered and JSON.",
    keys: ["P", "P-comp", "S", "V", "derived"],
  };
  const records: TxRecord[] = (TENSORS as unknown as Raw[]).filter((r) => r.public !== false && TX_KINDS.some((k) => k.tensor === r.tensor)).map((r) => {
    const c = cite(r.provenance.source_id);
    const rk = r.id.split("/")[2] ?? "", via = rk.split("-").slice(1);
    return { id: r.id, tensor: r.tensor, name: r.name, symbol: r.symbol, unit: r.unit.display, status: r.provenance.status, source: c.text, label: `${c.short}${via.length ? `, quoting ${via.map((k) => (cite(k).year ? cite(k).short : k === "coquin" ? "Coquin" : keyShort(k))).join(", ")}` : ""} [${r.provenance.status}]`, doi: c.doi, locator: replaceKeys(stripNotes(r.provenance.locator ?? "")), voigt: r.voigt, conditions: condText(r.conditions), frame: replaceKeys(stripNotes(frameText(r.frame))), notes: replaceKeys(stripNotes(r.notes ?? "")), isDefault: !!r.default };
  });
  // default record per tensor: flagged default, else primary, else the first
  const rank = (s: string): number => ["P", "P-comp", "C", "P-db", "S", "V"].indexOf(s) + (s ? 0 : 9);
  const pick: Record<string, string> = {};
  for (const k of TX_KINDS) { const rs = records.filter((r) => r.tensor === k.tensor).sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || rank(a.status) - rank(b.status)); if (rs[0]) pick[k.tensor] = rs[0].id; }
  const s = { ...TX_DEFAULT };
  const rec = records.find((r) => r.id === pick["piezo-stress-e"]) as TxRecord;
  const r = computeTx(s, rec);
  const k = kindOf(rec.tensor);
  return { meta, records, pick, init: { mx: matrixHTML(r, k.sym), grid: glyphGridSVG(r), orient: orientSVG(r.R), comsol: exportComsol(k, r.M), json: exportJSON(k, rec, r, s), euler: r.euler } };
};

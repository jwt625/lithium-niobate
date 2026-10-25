// /data/ explorer binding: filter state in src/lib/stores/p09.ts dataFilter, shared by the TECH table and the VISUAL cards.
// Rows: [data-row] with data-prop, data-var, data-st, data-kind. Controls: select[data-df], button[data-dfv="key:value"].
// Filtering toggles `hidden` inside fixed-height scroll boxes, so nothing outside the boxes moves.
import { dataFilter, type DataFilter } from "$lib/stores/p09";
import { Disposer } from "../dom.ts";
import { registerPops, type Pop } from "$lib/content/pops";
import { STATUS_DEF, statusCls } from "./status.ts";

export interface PopRow { id: string; name: string; sym: string; val: string; unit: string; cond: string; frame: string; src: string; doi?: string; url?: string; loc: string; orig: string; olab: string; st: string; notes: string; vname: string; vnote: string; transcribed: string; def: boolean }
const esc = (s: string): string => s.replace(/&(?![a-z]+;|#\d+;)/g, "&amp;").replace(/</g, "&lt;");

export function rowPop(r: PopRow): Pop {
  const lines = [
    `<span class="v">${r.val}${r.unit ? ` ${r.unit}` : ""}</span>`,
    `Variant: ${esc(r.vname)}${r.vnote ? ` (${esc(r.vnote)})` : ""}${r.def ? "; default record" : ""}`,
    r.cond && `Conditions: ${esc(r.cond)}`,
    r.frame && `Frame: ${esc(r.frame)}`,
    r.notes && esc(r.notes),
    `${esc(r.st)}: ${STATUS_DEF[r.st] ?? ""}`,
  ].filter(Boolean);
  const link = r.doi ? `, <a href="https://doi.org/${esc(r.doi)}">doi:${esc(r.doi)}</a>` : r.url ? `, <a href="${esc(r.url)}">${esc(r.url.replace(/^https?:\/\//, ""))}</a>` : "";
  return {
    h: `${esc(r.name)}${r.sym ? ` <span class="v">${r.sym}</span>` : ""}`,
    body: lines.join("<br>"),
    badges: [[statusCls(r.st), r.st]],
    src: `${esc(r.src)}${link}${r.loc ? `, ${esc(r.loc)}` : ""}${r.orig ? `. ${r.olab === "derived" ? "Derived" : "Original"}: ${esc(r.orig)}` : ""}${r.transcribed ? `. Transcribed ${r.transcribed}` : ""}.`,
  };
}

export function mountExplorer(root: HTMLElement, rows: PopRow[]): () => void {
  const dis = new Disposer();
  dis.add(registerPops(Object.fromEntries(rows.map((r) => [`r:${r.id}`, rowPop(r)]))));
  const els = [...root.querySelectorAll<HTMLElement>("[data-row]")];
  const total = rows.length;
  const apply = (): void => {
    const f = dataFilter;
    let n = 0;
    const seen = new Set<string>();
    for (const el of els) {
      const d = el.dataset;
      const ok = (!f.prop || d.prop === f.prop) && (!f.variant || d.var === f.variant) && (!f.status || d.st === f.status) && (f.kind === "all" || d.kind === f.kind);
      el.hidden = !ok;
      if (ok && !seen.has(d.row ?? "")) { seen.add(d.row ?? ""); n++; }
    }
    for (const o of root.querySelectorAll<HTMLElement>("[data-dfo=count]")) o.textContent = `${String(n).padStart(3, " ")} of ${total} records`;
    for (const o of root.querySelectorAll<HTMLElement>("[data-dfo=empty]")) o.hidden = n > 0;
    for (const s of root.querySelectorAll<HTMLSelectElement>("select[data-df]")) s.value = String(f[s.dataset.df as keyof DataFilter]);
    for (const b of root.querySelectorAll<HTMLButtonElement>("button[data-dfv]")) { const [k, v] = (b.dataset.dfv ?? "").split(":"); b.classList.toggle("on", String(f[k as keyof DataFilter]) === v); }
  };
  dis.on(root, "input", (e: Event) => {
    const t = e.target as HTMLSelectElement;
    const k = t.dataset?.df as keyof DataFilter | undefined;
    if (!k) return;
    (dataFilter as unknown as Record<string, string>)[k] = t.value;
    apply();
  });
  dis.on(root, "click", (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-dfv]");
    if (!b || !root.contains(b)) return;
    const [k, v] = (b.dataset.dfv ?? "").split(":");
    (dataFilter as unknown as Record<string, string>)[k] = v;
    apply();
  });
  apply();
  return dis.run;
}

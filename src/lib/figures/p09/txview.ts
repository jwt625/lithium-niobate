// F4 browser binding: both variants read and write src/lib/stores/p09.ts tx. Controls: [data-tx] (select / range),
// buttons [data-txv="key:value"], [data-txt="rot180|flipZ"] (toggle), [data-copy="comsol|json"]. Outputs: [data-txo].
import { computeTx, matrixHTML, glyphGridSVG, orientSVG, exportComsol, exportJSON, kindOf, eulerOf, fnum, type TxRecord } from "./tensorx.ts";
import { tx, TX_DEFAULT } from "$lib/stores/p09";
import { Disposer, onUi, isVisual } from "../dom.ts";
import { fillAll } from "../visual/range.ts";
import { registerPops } from "$lib/content/pops";
import { pad } from "../fmt.ts";

/** Record label: citation, the record key when one source holds several records (e.g. ogi2002-kovacs1990), status. */
export const recLabel = (r: TxRecord): string => r.label.replace(/&/g, "&amp;");

export function mountTx(root: HTMLElement, records: TxRecord[], pick: Record<string, string>): () => void {
  const dis = new Disposer();
  const all = <T extends Element = HTMLElement>(sel: string): T[] => [...root.querySelectorAll<T>(sel)];
  let recId = pick["piezo-stress-e"] ?? records[0].id;
  const rec = (): TxRecord => records.find((r) => r.id === recId) ?? records[0];
  let last = { comsol: "", json: "" };

  const popOff = registerPops({
    "tx-rec": { h: "Record", body: () => { const r = rec(); return `${r.name} (${r.symbol}), ${r.unit}. ${r.conditions ? `Conditions: ${r.conditions}. ` : ""}${r.frame ? `Frame: ${r.frame}. ` : ""}${r.notes}`; }, src: "" },
    "tx-cell": { h: "Component", body: "Rotated value in the wafer frame (global x = propagation, z = wafer normal). Solid box: the value changes sign when the crystal frame is turned 180&deg; about z. Dashed underline: it changes sign when +z is reversed. Either way its sign depends on the frame convention of the source." },
  });

  const fillRecordSelects = (): void => {
    const t = rec().tensor;
    for (const sel of all<HTMLSelectElement>("select[data-tx=record]")) {
      const opts = records.filter((r) => r.tensor === t).map((r) => `<option value="${r.id}"${r.id === recId ? " selected" : ""}>${recLabel(r)}</option>`).join("");
      if (sel.dataset.t !== t) { sel.innerHTML = opts; sel.dataset.t = t; }
      sel.value = recId;
    }
  };
  const sync = (): void => {
    const e = eulerOf(tx);
    for (const el of all<HTMLSelectElement>("select[data-tx=tensor]")) el.value = rec().tensor;
    for (const el of all<HTMLSelectElement>("select[data-tx=cut]")) el.value = tx.cut;
    fillRecordSelects();
    for (const el of all<HTMLInputElement>("input[data-tx]")) { const k = el.dataset.tx as "alpha" | "beta" | "gamma"; const v = k === "alpha" ? e[0] : k === "beta" ? e[1] : e[2]; if (Math.abs(+el.value - v) > 1e-6) el.value = String(Math.round(v * 10) / 10); }
    for (const o of all("[data-txf]")) { const k = o.dataset.txf; const v = k === "alpha" ? e[0] : k === "beta" ? e[1] : e[2]; o.textContent = `${pad((Math.abs(v) < 0.05 ? "" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1), 6)}°`; }
    for (const b of all<HTMLButtonElement>("button[data-txt]")) { const on = tx[b.dataset.txt as "rot180" | "flipZ"]; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); }
    if (isVisual()) fillAll(root);
  };
  const render = (): void => {
    const r0 = rec(), k = kindOf(r0.tensor), r = computeTx(tx, r0);
    last = { comsol: exportComsol(k, r.M), json: exportJSON(k, r0, r, tx) };
    const nR = r.flipR.flat().filter(Boolean).length, nZ = r.flipZ.flat().filter(Boolean).length, nNZ = r.M.flat().filter((v) => v !== 0).length;
    for (const o of all("[data-txo]")) {
      switch (o.dataset.txo) {
        case "mx": o.innerHTML = matrixHTML(r, k.sym); break;
        case "grid": if (isVisual()) o.innerHTML = glyphGridSVG(r); break;
        case "orient": if (isVisual()) o.innerHTML = orientSVG(r.R); break;
        case "comsol": o.textContent = last.comsol; break;
        case "json": o.textContent = last.json; break;
        case "comsol-name": o.textContent = k.comsolName + `, SI (${k.siUnit})`; break;
        case "unit": o.textContent = r0.unit; break;
        case "R": o.innerHTML = r.R.map((row, i) => `<tr><td>${["x", "y", "z"][i]}</td>${row.map((v) => `<td class="v">${fnum(v, 7)}</td>`).join("")}</tr>`).join(""); break;
        case "nfl": o.textContent = `of ${String(nNZ).padStart(2, " ")} nonzero: ${String(nR).padStart(2, " ")} flip under 180° about z, ${String(nZ).padStart(2, " ")} under +z reversal`; break;
        case "status": o.textContent = r0.status; o.className = `b ${r0.status === "P" ? "p" : r0.status === "P-comp" || r0.status === "P-db" ? "pc" : r0.status === "C" ? "d" : r0.status === "V" ? "v" : "s"}`; break;
        case "cond": o.textContent = [r0.conditions, r0.notes].filter(Boolean).join(". "); break;
        case "src": o.innerHTML = `${r0.source.replace(/&/g, "&amp;").replace(/</g, "&lt;")}${r0.doi ? `, <a class="u" href="https://doi.org/${r0.doi}">doi:${r0.doi}</a>` : ""}${r0.locator ? `, ${r0.locator.replace(/</g, "&lt;")}` : ""}`; break;
      }
    }
  };
  const update = (): void => { sync(); render(); };
  dis.on(root, "input", (ev: Event) => {
    const t = ev.target as HTMLInputElement | HTMLSelectElement, k = t.dataset?.tx;
    if (!k) return;
    if (k === "tensor") recId = pick[t.value] ?? records.find((r) => r.tensor === t.value)?.id ?? recId;
    else if (k === "record") recId = t.value;
    else if (k === "cut") tx.cut = t.value;
    else if (k === "alpha" || k === "beta" || k === "gamma") { const e = eulerOf(tx); tx.alpha = e[0]; tx.beta = e[1]; tx.gamma = e[2]; tx.cut = "Euler"; tx[k] = +t.value; }
    update();
  });
  dis.on(root, "click", (ev: Event) => {
    const b = (ev.target as Element).closest<HTMLButtonElement>("button[data-txt], button[data-copy], button[data-txreset]");
    if (!b || !root.contains(b)) return;
    if (b.dataset.txt) { const k = b.dataset.txt as "rot180" | "flipZ"; tx[k] = !tx[k]; update(); }
    else if (b.dataset.txreset !== undefined) { Object.assign(tx, TX_DEFAULT); recId = pick["piezo-stress-e"] ?? recId; update(); }
    else if (b.dataset.copy) {
      const text = b.dataset.copy === "json" ? last.json : last.comsol;
      void navigator.clipboard?.writeText(text).then(() => { b.textContent = "copied"; setTimeout(() => { b.textContent = "copy"; }, 1200); }).catch(() => { b.textContent = "error"; });
    }
  });
  dis.add(onUi(update));
  dis.add(popOff);
  update();
  return dis.run;
}

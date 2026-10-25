// Dispersion viewer binding (both variants): state src/lib/stores/p09.ts disp. Controls: input[data-dp="lam|T"],
// button[data-dpm="<model id>"] (toggle), button[data-dpv="log:1|0"]. Outputs: [data-dpo].
import { dispSVG, readRows, lamFromSl, slFromLam, type DModel } from "./disp.ts";
import { disp } from "$lib/stores/p09";
import { Disposer, onUi, isVisual } from "../dom.ts";
import { fillAll } from "../visual/range.ts";
import { pad } from "../fmt.ts";

export function mountDisp(root: HTMLElement, models: DModel[]): () => void {
  const dis = new Disposer();
  const all = <T extends Element = HTMLElement>(s: string): T[] => [...root.querySelectorAll<T>(s)];
  const update = (): void => {
    for (const i of all<HTMLInputElement>("input[data-dp]")) { const v = i.dataset.dp === "lam" ? slFromLam(disp.lam) : disp.T; if (+i.value !== v) i.value = String(v); }
    for (const o of all("[data-dpf=lam]")) o.textContent = `${pad(disp.lam.toFixed(3), 5)} µm`;
    for (const o of all("[data-dpf=T]")) o.textContent = `${pad(disp.T.toFixed(1), 5)} °C`;
    for (const b of all<HTMLButtonElement>("button[data-dpm]")) { const on = disp.on.includes(b.dataset.dpm ?? ""); b.setAttribute("aria-pressed", String(on)); b.classList.toggle("on", on); }
    for (const b of all<HTMLButtonElement>("button[data-dpv]")) b.classList.toggle("on", (b.dataset.dpv === "log:1") === disp.log);
    const svg = dispSVG(models, disp.on, disp.T, disp.lam, disp.log);
    for (const o of all("[data-dpo=svg]")) o.innerHTML = svg;
    const rows = readRows(models, disp.T, disp.lam);
    for (const r of rows) {
      for (const o of all(`[data-dpn="${r.id}"]`)) o.textContent = r.n;
      for (const o of all(`[data-dpg="${r.id}"]`)) o.textContent = r.ng;
      for (const o of all(`[data-dpt="${r.id}"]`)) o.textContent = r.t;
    }
    if (isVisual()) fillAll(root);
  };
  dis.on(root, "input", (e: Event) => {
    const t = e.target as HTMLInputElement, k = t.dataset?.dp;
    if (k === "lam") disp.lam = lamFromSl(+t.value); else if (k === "T") disp.T = +t.value; else return;
    update();
  });
  dis.on(root, "click", (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-dpm], button[data-dpv]");
    if (!b || !root.contains(b)) return;
    if (b.dataset.dpm) { const id = b.dataset.dpm; disp.on = disp.on.includes(id) ? disp.on.filter((x) => x !== id) : [...disp.on, id]; }
    else disp.log = b.dataset.dpv === "log:1";
    update();
  });
  dis.add(onUi(update));
  update();
  return dis.run;
}

// F2-02 client: TECH plot + readout table and VISUAL plot over the spectrum bar + HUD, one shared state (f21-disp.ts d21).
// VISUAL with effects on: flipping the erratum toggle animates the 5 mol% MgO Zelmon o and e curves into their swapped
// (as-printed) positions (CSS transition of the path geometry, 240 ms) before the figure is redrawn.
import { d21, disp21Rows, disp21SVG, lamOf, sOfLam, series, type Qty, type Variant } from "./f21-disp.ts";
import { STATUS, type StatusCode } from "$lib/content/site";
import { Disposer, fxOn, isVisual, onUi, q, qa, rafQueue } from "../dom.ts";
import { bindRange, bindSeg } from "./ctl.ts";
import { FS } from "../fmt.ts";

export function rowsHTML(visual: boolean): string {
  const { rows } = disp21Rows(d21);
  const badge = (s: string, pop: string): string => (s ? `<span class="b ${STATUS[s as StatusCode].cls}" data-pop="${pop}">${s}</span>` : "");
  if (visual) return rows.map((r) => `<dt>${r.label ? `<i class="sw ${r.cls}"></i>${r.label}, ${r.axis}` : FS}</dt><dd>${r.v}</dd>`).join("");
  return rows.map((r) => `<tr><td title="${r.label}">${r.label ? `<i class="sw ${r.cls}"></i>${r.label}` : FS}</td><td>${r.axis || FS}</td><td class="s">${badge(r.status, r.pop)}</td><td class="v">${r.v}</td><td class="nt">${r.note || FS}</td></tr>`).join("");
}

export function mountDisp21(root: HTMLElement): () => void {
  const dis = new Disposer();
  const T = q(root, "#d21"), V = q(root, "#v-d21");
  const syncs: (() => void)[] = [];
  function draw(): void {
    const vis = isVisual(), scope = vis ? V : T, pre = vis ? "v-d21" : "d21";
    if (scope) {
      const svg = q(scope, `#${pre}-svg`); if (svg) svg.innerHTML = disp21SVG(d21, vis);
      const tb = q(scope, `#${pre}-rows`); if (tb) tb.innerHTML = rowsHTML(vis);
      const r = disp21Rows(d21);
      const sp = q(scope, `#${pre}-spread`); if (sp) sp.textContent = r.spread;
      const fl = q(scope, `#${pre}-flag`); if (fl) { fl.textContent = r.flag; fl.classList.toggle("bad", r.flag.startsWith("nₑ > nₒ")); }
    }
    syncs.forEach((f) => f());
  }
  const req = rafQueue(draw);
  function animateSwap(after: () => void): void {
    if (!isVisual() || !fxOn() || d21.v !== "mgo5" || d21.q !== "n" || !V) { after(); return; }
    const svg = q(V, "#v-d21-svg"); if (!svg) { after(); return; }
    const tmp = document.createElementNS("http://www.w3.org/2000/svg", "svg"); tmp.innerHTML = disp21SVG(d21, true);
    for (const cls of ["s1", "s2"]) {
      const cur = svg.querySelector<SVGPathElement>(`#v-d21-${cls}`), nxt = tmp.querySelector<SVGPathElement>(`#v-d21-${cls}`);
      if (cur && nxt) { cur.style.transition = "d 240ms cubic-bezier(0.2, 0.7, 0.2, 1)"; cur.style.setProperty("d", `path("${nxt.getAttribute("d")}")`); }
    }
    window.setTimeout(after, 260);
  }
  for (const [scope, pre] of [[T, "d21"], [V, "v-d21"]] as const) {
    if (!scope) continue;
    const a = bindRange(dis, q<HTMLInputElement>(scope, `#${pre}-lam-in`), q(scope, `#${pre}-lam-o`), { read: lamOf, write: sOfLam, get: () => d21.lam, set: (v) => { d21.lam = v; }, fmt: (v) => `${String(Math.round(v * 1000)).padStart(4, FS)} nm`, aria: (v) => `${Math.round(v * 1000)} nanometers` }, req);
    const b = bindRange(dis, q<HTMLInputElement>(scope, `#${pre}-t-in`), q(scope, `#${pre}-t-o`), { read: (s) => s, write: (v) => v, get: () => d21.T, set: (v) => { d21.T = v; }, fmt: (v) => `${String(Math.round(v)).padStart(3, FS)} °C`, aria: (v) => `${Math.round(v)} degrees Celsius` }, req);
    const c1 = bindSeg(dis, q(scope, `#${pre}-q`), () => d21.q, (v) => { d21.q = v as Qty; }, req);
    const c2 = bindSeg(dis, q(scope, `#${pre}-v`), () => d21.v, (v) => { d21.v = v as Variant; }, req);
    const c4 = bindSeg(dis, q(scope, `#${pre}-log`), () => (d21.log ? "log" : "lin"), (v) => { d21.log = v === "log"; }, req);
    // erratum: switching to "as printed" selects the 5 mol% MgO variant (the only one the erratum concerns)
    const eg = q(scope, `#${pre}-err`);
    const c3 = (): void => { for (const btn of eg ? qa<HTMLButtonElement>(eg, "button[data-v]") : []) { const on = (btn.dataset.v === "printed") === d21.printed; btn.classList.toggle("on", on); btn.setAttribute("aria-pressed", String(on)); } };
    for (const btn of eg ? qa<HTMLButtonElement>(eg, "button[data-v]") : []) dis.on(btn, "click", () => {
      const pr = btn.dataset.v === "printed";
      if (pr === d21.printed) return;
      const go = (): void => { d21.printed = pr; if (pr) d21.v = "mgo5"; req(); };
      if (d21.v === "mgo5") { d21.printed = pr; animateSwap(() => req()); syncs.forEach((f) => f()); } else go();
    });
    a(); b();
    syncs.push(() => { a(); b(); }, c1, c2, c3, c4);
  }
  dis.add(onUi(req));
  void series;
  draw();
  return dis.run;
}

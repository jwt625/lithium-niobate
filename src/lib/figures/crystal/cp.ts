// Browser side of 1.3 "Temperature axis" and 1.4 FIG-01-03 "Composition dial" (prefix cp). Both variants (TECH, VISUAL) are
// in the DOM; they bind by data attributes to one state object (`comp` in src/lib/stores/crystal.ts), so a mode switch or a
// visit to the other section keeps c, the defect model and the Tc input:
//   input[data-cp="c"|"tc"]   sliders          button[data-model]  defect model     button[data-c]  composition presets
//   [data-o=key]              text readouts    [data-a=ax|uv|li|nb] ASCII blocks    [data-s=ax|uv|li|nb] VISUAL SVG hosts
//   [data-anchor=cln|sln]     Ec / Eint anchor elements (class "on" while c is inside the anchor's span)
// Markup builders are the pure functions of cpaxis.ts / cpmodel.ts, also used by the server load for the prerendered state.
import { comp } from "$lib/stores/crystal";
import { Disposer, isVisual, onUi, rafQueue } from "../dom.ts";
import { rangeFill } from "../visual/range.ts";
import { asciiAxis, svgAxis } from "./cpaxis.ts";
import { dialReadouts, axisReadouts, asciiFields, asciiUv, svgTile, svgUv, tileCounts, anchorAt, type DialRo } from "./cpmodel.ts";

type Kind = "axis" | "dial";

export function mountCp(root: HTMLElement, kind: Kind): () => void {
  const dis = new Disposer();
  const qa = <T extends Element = HTMLElement>(sel: string): T[] => [...root.querySelectorAll<T>(sel)];
  const inputs = qa<HTMLInputElement>("input[data-cp]");
  const setText = (ro: DialRo): void => qa("[data-o]").forEach((el) => { const v = ro[el.dataset.o as string]; if (v !== undefined && el.textContent !== v) el.textContent = v; });
  const setHtml = (sel: string, key: string, html: string): void => qa(`[${sel}="${key}"]`).forEach((el) => { if (el.innerHTML !== html) el.innerHTML = html; });
  const svgHosts = (key: string): HTMLElement[] => qa(`[data-s="${key}"]`).filter((el) => el.offsetParent !== null);

  function draw(): void {
    const { c, model, tcIn } = comp;
    inputs.forEach((inp) => {
      const v = inp.dataset.cp === "tc" ? tcIn : c;
      if (+inp.value !== v) { inp.value = String(v); }
      inp.setAttribute("aria-valuetext", inp.dataset.cp === "tc" ? `${tcIn.toFixed(1)} degrees Celsius` : `${c.toFixed(2)} mol% Li2O`);
      if (isVisual()) rangeFill(inp);
    });
    if (kind === "axis") {
      setText(axisReadouts(c, tcIn));
      setHtml("data-a", "ax", asciiAxis({ c, tcIn }));
      if (isVisual()) svgHosts("ax").forEach((h) => { h.innerHTML = svgAxis(Math.round(h.clientWidth) || 960, { c, tcIn }, "cpa"); });
      return;
    }
    const ro = dialReadouts(c, model);
    const F = asciiFields(c, model);
    ro.count = F.count;
    ro.vcount = tileCounts(c, model);
    setText(ro);
    setHtml("data-a", "ax", asciiAxis({ c }));
    setHtml("data-a", "uv", asciiUv(c));
    setHtml("data-a", "li", F.li);
    setHtml("data-a", "nb", F.nb);
    if (isVisual()) {
      svgHosts("ax").forEach((h) => { h.innerHTML = svgAxis(Math.round(h.clientWidth) || 960, { c }, "cpd"); });
      svgHosts("uv").forEach((h) => { h.innerHTML = svgUv(Math.round(h.clientWidth) || 960, c, "cpu"); });
      setHtml("data-s", "li", svgTile(c, model, "li"));
      setHtml("data-s", "nb", svgTile(c, model, "nb"));
    }
    const a = anchorAt(c);
    qa("[data-anchor]").forEach((el) => { el.classList.toggle("on", el.dataset.anchor === a); el.classList.toggle("off", a !== null && el.dataset.anchor !== a); });
    qa<HTMLButtonElement>("button[data-model]").forEach((b) => { const on = b.dataset.model === model; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    qa<HTMLButtonElement>("button[data-c]").forEach((b) => { const on = Math.abs(+(b.dataset.c as string) - c) < 1e-6; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    qa("[data-uvok]").forEach((el) => el.classList.toggle("cp-invalid", ro.u20 === "not applied"));
  }
  const request = rafQueue(draw);

  inputs.forEach((inp) => dis.on(inp, "input", () => {
    const v = +inp.value;
    if (inp.dataset.cp === "tc") comp.tcIn = Math.round(v * 10) / 10; else comp.c = Math.round(v * 100) / 100;
    request();
  }));
  qa<HTMLButtonElement>("button[data-model]").forEach((b) => dis.on(b, "click", () => { comp.model = b.dataset.model === "Nb-site" ? "Nb-site" : "Li-site"; request(); }));
  qa<HTMLButtonElement>("button[data-c]").forEach((b) => dis.on(b, "click", () => { comp.c = +(b.dataset.c as string); request(); }));
  qa("[data-s]").forEach((h) => { let w = h.clientWidth; dis.observe(h, () => { if (h.clientWidth !== w) { w = h.clientWidth; request(); } }); });
  dis.add(onUi(request));
  void document.fonts?.ready.then(request);
  draw();
  return dis.run;
}

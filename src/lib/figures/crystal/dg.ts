// FIG-01-04 Defect and polaron gallery: client controller for both variants. State (selected centre, pump marker,
// low-temperature illumination) lives in src/lib/stores/crystal.ts `defects`, so a mode switch keeps it; hover is a
// transient preview. TECH: boxed table + ASCII energy axis + 3 x 48 readout. VISUAL: spectrum strip (SVG redrawn at the
// box width; markers persist so the bipolaron hop can transition), selected-centre box, specimen cards.
import { defects } from "$lib/stores/crystal";
import { Disposer, isLight, isVisual, onUi } from "../dom.ts";
import { spectral } from "../spectral.ts";
import { CENTRES, STRIP_H, byId, markerX, stripGeom, stripSVG, techAscii, techReadout, visHud, nmOfEV, markColour, type CentreId } from "./dg-data.ts";

export function mountDg(figT: HTMLElement | null, figV: HTMLElement | null): () => void {
  const dis = new Disposer();
  let hover: CentreId | null = null, queued = false, stripKey = "";
  const st = defects as { sel: CentreId; pump: boolean; cold: boolean };

  const roots = [figT, figV].filter(Boolean) as HTMLElement[];
  const ax = figT?.querySelector<HTMLElement>(".dg-ax") ?? null;
  const ro = figT?.querySelector<HTMLElement>(".dg-ro") ?? null;
  const strip = figV?.querySelector<HTMLElement>(".dg-strip") ?? null;
  const svg = strip?.querySelector<SVGSVGElement>("svg") ?? null;
  const hud = figV?.querySelector<HTMLElement>(".dg-hud") ?? null;
  const j1 = figV?.querySelector<HTMLElement>(".dg-j1") ?? null;
  const j2 = figV?.querySelector<HTMLElement>(".dg-j2") ?? null;

  function paintStrip(): void {
    if (!strip || !svg) return;
    const W = Math.round(strip.clientWidth);
    if (!W) return;
    const key = `${W}|${isLight() ? "l" : "d"}`;
    if (key !== stripKey) {
      stripKey = key;
      svg.setAttribute("viewBox", `0 0 ${W} ${STRIP_H}`);
      svg.innerHTML = stripSVG(W, isLight(), st);
    }
    const g = stripGeom(W), show = hover ?? st.sel;
    svg.querySelectorAll<SVGGElement>("g.mk").forEach((m) => {
      const c = byId(m.dataset.id ?? "");
      const dx = markerX(g, c, st.cold) - g.x(c.E as number);
      m.style.transform = `translateX(${dx.toFixed(1)}px)`;
      m.classList.toggle("on", c.id === st.sel);
      m.classList.toggle("hv", c.id === hover && c.id !== st.sel);
      if (c.id === "bip") {
        const t = m.querySelector("text.lb"); if (t) t.textContent = st.cold ? "bipolaron, lit < 80 K" : "bipolaron";
        const { col, ir } = markColour(st.cold ? 1.6 : 2.5, isLight());
        const ln = m.querySelector("line.st"), hd = m.querySelector("rect.hd");
        ln?.setAttribute("stroke", col); hd?.setAttribute("fill", col);
        if (ir) ln?.setAttribute("stroke-dasharray", "4 3"); else ln?.removeAttribute("stroke-dasharray");
      }
    });
    svg.classList.toggle("red", show === "bip" && !st.cold);
  }

  function paint(): void {
    queued = false;
    const show = hover ?? st.sel;
    for (const r of roots) {
      r.classList.toggle("pump", st.pump);
      r.classList.toggle("cold", st.cold);
      r.querySelectorAll<HTMLElement>("[data-row]").forEach((el) => {
        el.classList.toggle("on", el.dataset.row === st.sel);
        el.classList.toggle("hv", el.dataset.row === hover && el.dataset.row !== st.sel);
      });
      r.querySelectorAll<HTMLButtonElement>("button.dg-pick").forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === st.sel ? "true" : "false"));
      r.querySelectorAll<HTMLButtonElement>("button[data-dg]").forEach((b) => {
        const on = b.dataset.dg === "pump" ? st.pump : st.cold;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    if (!isVisual()) {
      if (ax) ax.innerHTML = techAscii(st, hover);
      if (ro) ro.innerHTML = techReadout(st, hover);
    } else {
      paintStrip();
      if (hud) hud.innerHTML = visHud(st, hover);
      if (j1) j1.innerHTML = st.cold && (show === "bip" || show === "nbli4")
        ? "Illuminated below 80 K: the bipolaron band at 2.50 eV gives way to the 1.60 eV band of Nb<sub>Li</sub><sup>4+</sup>."
        : show === "bip" ? `<i class='sw' style='background:${spectral(nmOfEV(2.5))}'></i>2.50 eV = 496 nm: the band behind the colour of chemically reduced crystal.` : "";
      if (j2) j2.innerHTML = st.pump ? "Pump 532 nm = 2.33 eV. Ringed: listed peak within 0.3 eV of the pump (peak proximity only, qualitative)." : "";
    }
  }
  const request = (): void => { if (!queued) { queued = true; requestAnimationFrame(paint); } };

  for (const r of roots) {
    r.querySelectorAll<HTMLButtonElement>("button.dg-pick").forEach((b) => dis.on(b, "click", () => { st.sel = (b.dataset.id ?? "nbli4") as CentreId; request(); }));
    r.querySelectorAll<HTMLButtonElement>("button[data-dg]").forEach((b) => dis.on(b, "click", () => {
      if (b.dataset.dg === "pump") st.pump = !st.pump; else st.cold = !st.cold;
      request();
    }));
    // hover preview: rows, cards (by the element under the pointer) and the strip (nearest marker)
    r.querySelectorAll<HTMLElement>("[data-sweep]").forEach((z) => {
      dis.on(z, "pointermove", (e: PointerEvent) => {
        let id: CentreId | null = null;
        if (z.classList.contains("dg-strip")) {
          const rc = z.getBoundingClientRect(), g = stripGeom(rc.width), x = e.clientX - rc.left;
          let bd = 22;
          for (const c of CENTRES) if (c.E !== null) { const d = Math.abs(markerX(g, c, st.cold) - x); if (d < bd) { bd = d; id = c.id; } }
        } else {
          const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-row]");
          id = el && z.contains(el) ? (el.dataset.row as CentreId) : null;
        }
        if (id !== hover) { hover = id; request(); }
      });
      dis.on(z, "pointerleave", () => { if (hover) { hover = null; request(); } });
    });
  }
  if (strip) dis.observe(strip, request);
  dis.add(onUi(() => { stripKey = ""; request(); }));
  void document.fonts?.ready.then(request);
  request();
  return dis.run;
}

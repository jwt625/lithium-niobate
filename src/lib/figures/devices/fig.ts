// Figure binding for chapter 06 (browser only). One state object per figure drives both variants (TECH and VISUAL):
//   [data-fig="<id>"][data-look="tech|visual"]   figure container (one per variant)
//   input[data-k] / select[data-k]              controls; input[data-log] holds log10 of the value
//   .seg[data-k] button[data-v], .v-seg[data-k] segmented controls (button.on = active)
//   [data-o="<key>"]                            readout slots (fixed width in CSS), innerHTML from spec.outs
//   [data-p="<name>"]                           plot boxes (fixed height in CSS), innerHTML from spec.plots at measured size
//   canvas[data-c="<name>"]                     canvases drawn by spec.canvas
//   [data-id] inside a plot                     hoverable / focusable marks; the card is .dv-hc inside the plot's .dv-pw
// Only visible containers render; a mode or theme change renders the newly visible variant. Nothing changes box sizes.
import { isVisual, onUi, rafQueue } from "../dom.ts";
import { rangeFill } from "../visual/range.ts";
import type { Look } from "./svgplot.ts";

export type Val = number | string | boolean;
export interface FigSpec<S extends Record<string, Val>> {
  id: string;
  state: S;
  plots?: Record<string, (s: S, w: number, h: number, look: Look) => string>;
  canvas?: Record<string, (c: HTMLCanvasElement, s: S, look: Look) => void>;
  outs?: (s: S, look: Look) => Record<string, string>;
  /** called after every state change (both looks), e.g. to drive a 3D scene */
  after?: (s: S, changed: string | null) => void;
  /** hover card HTML for a mark id (may be async); null hides */
  hover?: (id: string, look: Look) => Promise<string | null> | string | null;
  /** click / Enter on a mark */
  pick?: (id: string) => void;
  /** derive dependent state after a control changes (e.g. preset -> parameters) */
  onChange?: (s: S, k: string) => void;
}
export interface FigHandle<S> { state: S; set: (p: Partial<S>) => void; render: () => void; dispose: () => void }

const lookOf = (el: Element): Look => ((el as HTMLElement).dataset.look === "visual" ? "visual" : "tech");
const visible = (el: HTMLElement): boolean => el.offsetParent !== null || el.getClientRects().length > 0;

export function mountFig<S extends Record<string, Val>>(root: ParentNode, spec: FigSpec<S>): FigHandle<S> {
  const boxes = (): HTMLElement[] => [...root.querySelectorAll<HTMLElement>(`[data-fig="${spec.id}"]`)];
  const s = spec.state;
  const offs: (() => void)[] = [];

  const parse = (k: string, el: HTMLInputElement | HTMLSelectElement | HTMLElement, raw: string): Val => {
    const cur = s[k];
    if (typeof cur === "boolean") return raw === "1" || raw === "true";
    if (typeof cur === "number") return el instanceof HTMLInputElement && el.dataset.log !== undefined ? 10 ** Number(raw) : Number(raw);
    return raw;
  };
  const syncControls = (): void => {
    for (const box of boxes()) {
      box.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[data-k], select[data-k]").forEach((el) => {
        const v = s[el.dataset.k as string];
        if (v === undefined) return;
        const str = el instanceof HTMLInputElement && el.dataset.log !== undefined ? String(Math.log10(Number(v))) : typeof v === "boolean" ? (v ? "1" : "0") : String(v);
        if (el instanceof HTMLInputElement && el.type === "checkbox") el.checked = !!v;
        else if (el.value !== str) el.value = str;
        if (el instanceof HTMLInputElement && el.type === "range" && isVisual()) rangeFill(el);
      });
      box.querySelectorAll<HTMLElement>("button[data-t]").forEach((b) => {
        const on = !!s[b.dataset.t as string];
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      box.querySelectorAll<HTMLElement>("[data-k] > button[data-v]").forEach((b) => {
        const k = (b.parentElement as HTMLElement).dataset.k as string;
        const v = s[k];
        const on = typeof v === "boolean" ? (b.dataset.v === "1") === v : String(v) === b.dataset.v;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
  };
  const draw = (all = false): void => {
    for (const box of boxes()) {
      if (!all && !visible(box)) continue;
      const look = lookOf(box);
      if (spec.plots) box.querySelectorAll<HTMLElement>("[data-p]").forEach((el) => {
        const f = spec.plots?.[el.dataset.p as string];
        if (!f || !visible(el)) return;
        const w = Math.round(el.clientWidth), h = Math.round(el.clientHeight);
        if (w < 10 || h < 10) return;
        const keep = el.querySelector(".dv-hc");
        el.innerHTML = f(s, w, h, look);
        if (keep) el.appendChild(keep);
      });
      if (spec.canvas) box.querySelectorAll<HTMLCanvasElement>("canvas[data-c]").forEach((c) => {
        const f = spec.canvas?.[c.dataset.c as string];
        if (f && visible(c)) f(c, s, look);
      });
      if (spec.outs) {
        const o = spec.outs(s, look);
        box.querySelectorAll<HTMLElement>("[data-o]").forEach((el) => {
          const v = o[el.dataset.o as string];
          if (v !== undefined && el.innerHTML !== v) el.innerHTML = v;
        });
      }
    }
  };
  const queue = rafQueue(() => draw());
  let lastK: string | null = null;
  const changed = (k: string | null): void => {
    lastK = k;
    if (k) spec.onChange?.(s, k);
    syncControls();
    spec.after?.(s, lastK);
    queue();
  };

  const onInput = (e: Event): void => {
    const el = e.target as HTMLElement;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement) || !el.dataset.k) return;
    const box = el.closest(`[data-fig="${spec.id}"]`);
    if (!box) return;
    const k = el.dataset.k;
    const raw = el instanceof HTMLInputElement && el.type === "checkbox" ? (el.checked ? "1" : "0") : el.value;
    (s as Record<string, Val>)[k] = parse(k, el, raw);
    changed(k);
  };
  const onClick = (e: Event): void => {
    const t = e.target as HTMLElement;
    const b = t.closest<HTMLElement>("[data-k] > button[data-v]");
    if (b && b.closest(`[data-fig="${spec.id}"]`)) {
      const k = (b.parentElement as HTMLElement).dataset.k as string;
      (s as Record<string, Val>)[k] = parse(k, b, b.dataset.v as string);
      changed(k);
      return;
    }
    const tb = t.closest<HTMLElement>("button[data-t]");
    if (tb && tb.closest(`[data-fig="${spec.id}"]`)) {
      const k = tb.dataset.t as string;
      (s as Record<string, Val>)[k] = !s[k];
      changed(k);
      return;
    }
    const m = t.closest<HTMLElement>("[data-id]");
    if (m && spec.pick && m.closest(`[data-fig="${spec.id}"]`)) spec.pick(m.dataset.id as string);
  };
  // hover cards
  let hoverTok = 0;
  const showCard = async (m: HTMLElement): Promise<void> => {
    if (!spec.hover) return;
    const pw = m.closest<HTMLElement>(".dv-pw");
    const box = m.closest<HTMLElement>(`[data-fig="${spec.id}"]`);
    if (!pw || !box) return;
    let card = pw.querySelector<HTMLElement>(":scope > .dv-hc");
    if (!card) { card = document.createElement("div"); card.className = "dv-hc"; card.setAttribute("role", "tooltip"); pw.appendChild(card); }
    const tok = ++hoverTok;
    const html = await spec.hover(m.dataset.id as string, lookOf(box));
    if (tok !== hoverTok || !html) return;
    card.innerHTML = html;
    const pr = pw.getBoundingClientRect(), mr = m.getBoundingClientRect();
    const cw = Math.min(360, pr.width - 8), ch = card.offsetHeight;
    let x = mr.left - pr.left + mr.width / 2 + 12, y = mr.top - pr.top - ch / 2;
    if (x + cw > pr.width - 4) x = mr.left - pr.left - cw - 12;
    x = Math.max(4, Math.min(pr.width - cw - 4, x));
    y = Math.max(4, Math.min(Math.max(4, pr.height - ch - 4), y));
    card.style.width = `${cw}px`;
    card.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    card.classList.add("show");
  };
  const hideCard = (): void => { hoverTok++; root.querySelectorAll<HTMLElement>(`[data-fig="${spec.id}"] .dv-hc.show`).forEach((c) => c.classList.remove("show")); };
  const onOver = (e: Event): void => { const m = (e.target as HTMLElement).closest<HTMLElement>("[data-id]"); if (m && m.closest(`[data-fig="${spec.id}"]`)) void showCard(m); };
  const onOut = (e: Event): void => { const m = (e.target as HTMLElement).closest<HTMLElement>("[data-id]"); if (m && m.closest(`[data-fig="${spec.id}"]`)) hideCard(); };
  const onKey = (e: KeyboardEvent): void => {
    const m = (e.target as HTMLElement).closest<HTMLElement>("[data-id]");
    if (m && spec.pick && (e.key === "Enter" || e.key === " ") && m.closest(`[data-fig="${spec.id}"]`)) { e.preventDefault(); spec.pick(m.dataset.id as string); }
    if (e.key === "Escape") hideCard();
  };
  const host = root as HTMLElement;
  host.addEventListener("input", onInput);
  host.addEventListener("change", onInput);
  host.addEventListener("click", onClick);
  host.addEventListener("pointerover", onOver);
  host.addEventListener("pointerout", onOut);
  host.addEventListener("focusin", onOver);
  host.addEventListener("focusout", onOut);
  host.addEventListener("keydown", onKey);
  offs.push(() => {
    host.removeEventListener("input", onInput); host.removeEventListener("change", onInput); host.removeEventListener("click", onClick);
    host.removeEventListener("pointerover", onOver); host.removeEventListener("pointerout", onOut); host.removeEventListener("focusin", onOver);
    host.removeEventListener("focusout", onOut); host.removeEventListener("keydown", onKey);
  });
  offs.push(onUi(() => { syncControls(); draw(); }));
  // re-render plots at their measured size whenever a plot box resizes (first layout, viewport change)
  const ro = new ResizeObserver(() => queue());
  boxes().forEach((b) => b.querySelectorAll("[data-p], canvas[data-c]").forEach((el) => ro.observe(el)));
  offs.push(() => ro.disconnect());
  syncControls();
  spec.after?.(s, null);
  draw();
  return {
    state: s,
    set: (p) => { Object.assign(s, p); changed(Object.keys(p)[0] ?? null); },
    render: () => draw(),
    dispose: () => offs.splice(0).forEach((f) => f()),
  };
}

/** Size a canvas backing store to its CSS box (DPR capped at 2); returns the 2D context and CSS size. */
export function fitCanvas(c: HTMLCanvasElement): { g: CanvasRenderingContext2D; w: number; h: number; k: number } {
  const k = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(c.clientWidth)), h = Math.max(1, Math.round(c.clientHeight));
  if (c.width !== Math.round(w * k) || c.height !== Math.round(h * k)) { c.width = Math.round(w * k); c.height = Math.round(h * k); }
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  g.setTransform(k, 0, 0, k, 0, 0);
  return { g, w, h, k };
}

// Isotype kit for the Industry book: SVG helpers, the four-colour palette on paper, pictogram symbols
// placed with <use>, pointer-to-logical mapping and timing helpers.
import type { SceneHost } from "../../types";

export const NS = "http://www.w3.org/2000/svg";
export type Attrs = Record<string, string | number | undefined>;

export function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, parent?: Element | null): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v !== undefined) e.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(e);
  return e;
}

/** DevLog-007b recipe: ink, red, blue, gold on paper. Red = lithium niobate, blue = its sister LT, gold = light. */
export const PAL = { ink: "#1E1E1E", red: "#C8372D", blue: "#2D5DA8", gold: "#D9A441", paper: "#F4F0E6", rule: "#D8D0BE" };

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - (1 - x) ** 3;
/** Small overshoot for a pictogram dropping into its grid cell. */
export const easeBack = (x: number) => {
  const c = 1.9;
  return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2;
};
export const r1 = (n: number) => Math.round(n * 10) / 10;

let uid = 0;

export interface Stage {
  host: SceneHost;
  svg: SVGSVGElement;
  defs: SVGDefsElement;
  art: SVGGElement;
  /** Registers a pictogram (path data in a 100 x 100 box, one layer per colour) and returns its symbol id. */
  sym: (name: string, layers: Layer[]) => string;
  /** Places a registered pictogram in a wrapper group (for pop-in transforms). */
  use: (parent: Element, id: string, x: number, y: number, s: number, attrs?: Attrs) => { g: SVGGElement; u: SVGUseElement };
  /** Pointer position in logical units (0..1000). */
  toLogical: (e: PointerEvent) => [number, number];
  destroy: () => void;
}

/** [path, colour, rule]: rule "nz" = nonzero (overlapping parts merge); default evenodd (inner paths cut holes). */
export type Layer = [string, string] | [string, string, "nz"];

export function makeStage(host: SceneHost): Stage {
  const pre = `iso${++uid}-`;
  const svg = el("svg", { viewBox: "0 0 1000 1000", width: "100%", height: "100%", style: "display:block;touch-action:manipulation;user-select:none;-webkit-user-select:none" });
  const defs = el("defs", {}, svg);
  el("rect", { width: 1000, height: 1000, fill: PAL.paper, "aria-hidden": "true" }, svg);
  const art = el("g", { "aria-hidden": "true" }, svg);
  const st: Stage = {
    host,
    svg,
    defs,
    art,
    sym(name, layers) {
      const id = pre + name;
      const s = el("symbol", { id, viewBox: "0 0 100 100", overflow: "visible" }, defs);
      for (const [d, fill, rule] of layers) el("path", { d, fill, "fill-rule": rule === "nz" ? "nonzero" : "evenodd" }, s);
      return id;
    },
    use(parent, id, x, y, s, attrs = {}) {
      const g = el("g", attrs, parent);
      const u = el("use", { href: `#${id}`, x: r1(x), y: r1(y), width: r1(s), height: r1(s) }, g);
      return { g, u };
    },
    toLogical(e) {
      const r = svg.getBoundingClientRect();
      return [((e.clientX - r.left) / (r.width || 1)) * 1000, ((e.clientY - r.top) / (r.height || 1)) * 1000];
    },
    destroy: () => svg.remove(),
  };
  host.el.appendChild(svg);
  return st;
}

/** Pop-in of one pictogram: drop from 26 units above with a small overshoot, fade in. Returns [dy, opacity]. */
export function pop(t: number, t0: number, dur = 0.32): [number, number] {
  const x = seg(t, t0, t0 + dur);
  return [-26 * (1 - easeBack(x)), clamp01(x * 2.2)];
}

export function setPop(g: SVGGElement, t: number, t0: number, extraDy = 0): void {
  const [dy, o] = pop(t, t0);
  g.setAttribute("transform", `translate(0 ${r1(dy + extraDy)})`);
  g.setAttribute("opacity", String(r1(o * 100) / 100));
}

/** A hop (tap feedback): 0 -> up -> 0 over dur seconds. */
export function hop(t: number, t0: number, h = 30, dur = 0.42): number {
  if (t0 < 0 || t < t0 || t > t0 + dur) return 0;
  const x = (t - t0) / dur;
  return -h * 4 * x * (1 - x);
}

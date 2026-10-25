// Minimal SVG plot builder for chapter 06 figures. Pure string output, so the same code renders the prerendered default
// state on the server and the live state in the browser. Geometry in CSS px (the browser re-renders at the box's measured
// size, so ticks and labels stay at true size); styling by class names (devices.css: TECH monochrome, VISUAL colour).
import { MINUS } from "../fmt.ts";

export interface Axis {
  min: number;
  max: number;
  log?: boolean;
  label: string;
  ticks?: number[];
  fmt?: (v: number) => string;
}
export type Look = "tech" | "visual";
export interface PlotOpts {
  w: number;
  h: number;
  x: Axis;
  y: Axis;
  look: Look;
  /** margins t, r, b, l (px); defaults depend on look */
  m?: [number, number, number, number];
}

export const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const r1 = (v: number): string => (Math.round(v * 10) / 10).toString();

/** Tick label: 0.01, 0.1, 1, 10, 100, 1k ... with a typographic minus. */
export function tickFmt(v: number): string {
  if (v === 0) return "0";
  const a = Math.abs(v);
  let s: string;
  if (a >= 1e6 || a < 1e-3) {
    const e = Math.round(Math.log10(a));
    s = Math.abs(a / 10 ** e - 1) < 1e-9 ? `10^${e}` : a.toExponential(0);
  } else s = a >= 1 ? String(Math.round(a * 1000) / 1000) : String(Number(a.toPrecision(3)));
  return (v < 0 ? MINUS : "") + s;
}
/** Superscript HTML-free tick text for powers of ten (SVG tspan). */
function tickSVG(s: string): string {
  const m = /^(-|−)?10\^(-?\d+)$/.exec(s);
  if (!m) return esc(s);
  return `${m[1] ?? ""}10<tspan dy="-0.45em" font-size="0.75em">${m[2].replace("-", MINUS)}</tspan>`;
}

export function logTicks(min: number, max: number): { major: number[]; minor: number[] } {
  const major: number[] = [], minor: number[] = [];
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) {
    for (let k = 1; k < 10; k++) {
      const v = k * 10 ** e;
      if (v < min * (1 - 1e-9) || v > max * (1 + 1e-9)) continue;
      (k === 1 ? major : minor).push(v);
    }
  }
  return { major, minor };
}
export function linTicks(min: number, max: number, n = 6): number[] {
  const span = max - min, raw = span / n, p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * p).find((s) => span / s <= n) ?? 10 * p;
  const out: number[] = [];
  for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9 * span; v += step) out.push(Math.round(v / step) * step);
  return out;
}

export class Plot {
  readonly w: number;
  readonly h: number;
  readonly m: [number, number, number, number];
  readonly x: Axis;
  readonly y: Axis;
  readonly look: Look;
  private parts: string[] = [];
  constructor(o: PlotOpts) {
    this.w = Math.max(120, o.w);
    this.h = Math.max(80, o.h);
    this.look = o.look;
    this.m = o.m ?? (o.look === "tech" ? [10, 14, 34, 50] : [14, 18, 46, 62]);
    this.x = o.x;
    this.y = o.y;
  }
  get x0(): number { return this.m[3]; }
  get x1(): number { return this.w - this.m[1]; }
  get y0(): number { return this.h - this.m[2]; }
  get y1(): number { return this.m[0]; }
  private map(a: Axis, v: number, p0: number, p1: number): number {
    const t = a.log ? (Math.log10(v) - Math.log10(a.min)) / (Math.log10(a.max) - Math.log10(a.min)) : (v - a.min) / (a.max - a.min);
    return p0 + t * (p1 - p0);
  }
  sx(v: number): number { return this.map(this.x, v, this.x0, this.x1); }
  sy(v: number): number { return this.map(this.y, v, this.y0, this.y1); }
  /** Inverse x mapping (pointer -> data). */
  ix(px: number): number {
    const t = (px - this.x0) / (this.x1 - this.x0);
    return this.x.log ? 10 ** (Math.log10(this.x.min) + t * (Math.log10(this.x.max) - Math.log10(this.x.min))) : this.x.min + t * (this.x.max - this.x.min);
  }
  inX(v: number): boolean { return v >= this.x.min * (this.x.log ? 1 - 1e-9 : 1) - (this.x.log ? 0 : 1e-9) && v <= this.x.max * (1 + 1e-9) + (this.x.log ? 0 : 1e-9); }
  inY(v: number): boolean { return v >= this.y.min * (this.y.log ? 1 - 1e-9 : 1) - (this.y.log ? 0 : 1e-9) && v <= this.y.max * (1 + 1e-9) + (this.y.log ? 0 : 1e-9); }
  add(s: string): this { this.parts.push(s); return this; }

  /** Grid, frame, ticks and axis labels. */
  axes(): this {
    const { x0, x1, y0, y1 } = this;
    const out: string[] = [];
    const ax = (a: Axis, horiz: boolean): void => {
      const t = a.ticks ? { major: a.ticks, minor: [] as number[] } : a.log ? logTicks(a.min, a.max) : { major: linTicks(a.min, a.max, horiz ? Math.max(4, Math.round((x1 - x0) / 90)) : Math.max(3, Math.round((y0 - y1) / 50))), minor: [] };
      for (const v of t.minor) {
        const p = horiz ? this.sx(v) : this.sy(v);
        out.push(horiz ? `<line class="gm" x1="${r1(p)}" x2="${r1(p)}" y1="${y1}" y2="${y0}"/>` : `<line class="gm" x1="${x0}" x2="${x1}" y1="${r1(p)}" y2="${r1(p)}"/>`);
      }
      for (const v of t.major) {
        const p = horiz ? this.sx(v) : this.sy(v);
        const s = tickSVG(a.fmt ? a.fmt(v) : tickFmt(v));
        if (horiz) out.push(`<line class="gl" x1="${r1(p)}" x2="${r1(p)}" y1="${y1}" y2="${y0}"/><text class="tk" x="${r1(p)}" y="${y0 + (this.look === "tech" ? 13 : 18)}" text-anchor="middle">${s}</text>`);
        else out.push(`<line class="gl" x1="${x0}" x2="${x1}" y1="${r1(p)}" y2="${r1(p)}"/><text class="tk" x="${x0 - 5}" y="${r1(p + (this.look === "tech" ? 3.5 : 4.5))}" text-anchor="end">${s}</text>`);
      }
    };
    ax(this.x, true);
    ax(this.y, false);
    out.push(`<rect class="fr" x="${x0}" y="${y1}" width="${r1(x1 - x0)}" height="${r1(y0 - y1)}"/>`);
    out.push(`<text class="al" x="${r1((x0 + x1) / 2)}" y="${this.h - (this.look === "tech" ? 6 : 8)}" text-anchor="middle">${this.x.label}</text>`);
    const yl = this.look === "tech" ? 11 : 15;
    out.push(`<text class="al" transform="translate(${yl} ${r1((y0 + y1) / 2)}) rotate(-90)" text-anchor="middle">${this.y.label}</text>`);
    this.parts.unshift(out.join(""));
    return this;
  }
  /** Polyline through data points (skips non-finite; clips to the plot rectangle via clip-path). */
  line(pts: [number, number][], cls: string, extra = ""): this {
    const segs: string[] = [];
    let cur: string[] = [];
    for (const [a, b] of pts) {
      if (!Number.isFinite(a) || !Number.isFinite(b) || (this.x.log && a <= 0) || (this.y.log && b <= 0)) { if (cur.length > 1) segs.push(cur.join(" ")); cur = []; continue; }
      cur.push(`${r1(this.sx(a))},${r1(this.sy(b))}`);
    }
    if (cur.length > 1) segs.push(cur.join(" "));
    for (const s of segs) this.parts.push(`<polyline class="${cls}" points="${s}" ${extra} clip-path="url(#CLIP)"/>`);
    return this;
  }
  hline(v: number, cls: string): this { if (this.inY(v)) this.parts.push(`<line class="${cls}" x1="${this.x0}" x2="${this.x1}" y1="${r1(this.sy(v))}" y2="${r1(this.sy(v))}"/>`); return this; }
  vline(v: number, cls: string): this { if (this.inX(v)) this.parts.push(`<line class="${cls}" y1="${this.y1}" y2="${this.y0}" x1="${r1(this.sx(v))}" x2="${r1(this.sx(v))}"/>`); return this; }
  /** Shaded band between y = a and y = b (data units) across the plot. */
  hband(a: number, b: number, cls: string): this {
    const ya = this.sy(Math.max(this.y.min, Math.min(this.y.max, a))), yb = this.sy(Math.max(this.y.min, Math.min(this.y.max, b)));
    this.parts.push(`<rect class="${cls}" x="${this.x0}" y="${r1(Math.min(ya, yb))}" width="${r1(this.x1 - this.x0)}" height="${r1(Math.abs(ya - yb))}"/>`);
    return this;
  }
  text(px: number, py: number, s: string, cls = "an", anchor = "start"): this { this.parts.push(`<text class="${cls}" x="${r1(px)}" y="${r1(py)}" text-anchor="${anchor}">${s}</text>`); return this; }
  svg(cls: string, label: string): string {
    const id = `c${Math.random().toString(36).slice(2, 8)}`;
    const body = this.parts.join("").replace(/url\(#CLIP\)/g, `url(#${id})`);
    return `<svg class="${cls}" viewBox="0 0 ${this.w} ${this.h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(label)}"><defs><clipPath id="${id}"><rect x="${this.x0}" y="${this.y1}" width="${r1(this.x1 - this.x0)}" height="${r1(this.y0 - this.y1)}"/></clipPath></defs>${body}</svg>`;
  }
}

export type Shape = "diamond" | "diamondo" | "square" | "tri" | "trid" | "circle" | "cross" | "plus" | "dot";
/** Marker path centred at (x, y), radius r. Hollow shapes get class "ho". */
export function marker(shape: Shape, x: number, y: number, r: number, cls: string, attrs = ""): string {
  const X = r1(x), Y = r1(y);
  const a = `class="${cls}${shape === "diamondo" ? " ho" : ""}${shape === "cross" || shape === "plus" ? " cr" : ""}" ${attrs}`;
  switch (shape) {
    case "diamond": case "diamondo": return `<path ${a} d="M${X} ${r1(y - r * 1.25)}L${r1(x + r)} ${Y}L${X} ${r1(y + r * 1.25)}L${r1(x - r)} ${Y}Z"/>`;
    case "square": return `<rect ${a} x="${r1(x - r * 0.85)}" y="${r1(y - r * 0.85)}" width="${r1(1.7 * r)}" height="${r1(1.7 * r)}"/>`;
    case "tri": return `<path ${a} d="M${X} ${r1(y - r * 1.15)}L${r1(x + r)} ${r1(y + r * 0.75)}L${r1(x - r)} ${r1(y + r * 0.75)}Z"/>`;
    case "trid": return `<path ${a} d="M${X} ${r1(y + r * 1.15)}L${r1(x + r)} ${r1(y - r * 0.75)}L${r1(x - r)} ${r1(y - r * 0.75)}Z"/>`;
    case "circle": return `<circle ${a} cx="${X}" cy="${Y}" r="${r1(r * 0.95)}"/>`;
    case "cross": return `<path ${a} d="M${r1(x - r)} ${r1(y - r)}L${r1(x + r)} ${r1(y + r)}M${r1(x + r)} ${r1(y - r)}L${r1(x - r)} ${r1(y + r)}"/>`;
    case "plus": return `<path ${a} d="M${r1(x - r)} ${Y}H${r1(x + r)}M${X} ${r1(y - r)}V${r1(y + r)}"/>`;
    default: return `<circle ${a} cx="${X}" cy="${Y}" r="${r1(r * 0.6)}"/>`;
  }
}
/** Bound arrow from (x, y) of fixed pixel length in direction dx, dy (unit), with a small head. */
export function arrow(x: number, y: number, dx: number, dy: number, len: number, cls: string): string {
  const ex = x + dx * len, ey = y + dy * len, h = Math.max(3, len * 0.32), px = -dy, py = dx;
  return `<path class="${cls}" d="M${r1(x)} ${r1(y)}L${r1(ex)} ${r1(ey)}M${r1(ex - dx * h + px * h * 0.6)} ${r1(ey - dy * h + py * h * 0.6)}L${r1(ex)} ${r1(ey)}L${r1(ex - dx * h - px * h * 0.6)} ${r1(ey - dy * h - py * h * 0.6)}"/>`;
}

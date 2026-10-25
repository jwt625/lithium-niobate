// Chapter 07 History: event records (public set of src/lib/generated/events-history.json, trimmed for the page) and the
// deterministic layouts shared by server and client: ASCII year strip, counts, proportional axis with a break.
import type { HStatus } from "./status";

export interface Ev {
  id: string; date: string; prec: "D" | "M" | "Y"; ch: number; title: string; hook: string; people: string[]; org: string;
  st: HStatus; doi?: string; url?: string; cite: string; notes: string; regions: string[];
}

export const REGIONS = ["USSR", "JP", "EU", "CN", "TI:LN"] as const;
export type Region = (typeof REGIONS)[number];
export const REGION_NAME: Readonly<Record<Region, string>> = { USSR: "USSR / Russia", JP: "Japan", EU: "Europe", CN: "China", "TI:LN": "Commercial Ti:LN" };

/** Decimal year (missing month or day: mid-year, first of month). */
export const yearOf = (d: string): number => { const [y, m = 7, dd = 1] = d.split("-").map(Number); return y + (m - 1 + (dd - 1) / 31) / 12; };

export const Y0 = 1801, YB = 1949, Y1 = 2026;
/** ASCII strip: one character per year 1801-1948, "//", one per year 1949-2026 (figures.md F7.0). */
export function asciiStrip(all: readonly Ev[], sel: readonly Ev[] | null): string {
  const has = new Set(all.map((e) => +e.date.slice(0, 4)));
  const on = sel ? new Set(sel.map((e) => +e.date.slice(0, 4))) : null;
  let s = "";
  for (let y = Y0; y <= Y1; y++) {
    if (y === YB) s += "//";
    s += on && on.has(y) ? "#" : has.has(y) ? "|" : ".";
  }
  return s;
}
/** Year labels aligned under the strip (same character grid). */
export function asciiLabels(): string {
  const col = (y: number): number => (y < YB ? y - Y0 : y - Y0 + 2);
  const chars = Array.from({ length: Y1 - Y0 + 3 }, () => " ");
  const put = (y: number, align: "l" | "r" = "l"): void => { const t = String(y); const c = align === "l" ? col(y) : col(y) - t.length + 1; for (let i = 0; i < t.length; i++) if (chars[c + i] !== undefined) chars[c + i] = t[i]; };
  [1801, 1850, 1900, 1949, 1980, 2000].forEach((y) => put(y));
  put(2026, "r");
  return chars.join("");
}

const p3 = (n: number): string => String(n).padStart(3, " ");
/** Count line, zero-width-stable: each count padded to 3 characters. */
export function countLine(sel: readonly Ev[]): string {
  const c = { V: 0, P: 0, S: 0, derived: 0 } as Record<HStatus, number>;
  sel.forEach((e) => { c[e.st]++; });
  return `${p3(sel.length)} EVENTS  V ${p3(c.V)}  P ${p3(c.P)}  S ${p3(c.S)}  D ${p3(c.derived)}`;
}

// ---------- proportional axis with one break (VISUAL overview) ----------
/** x in [0, 1]: 1801-1948 compressed to the first 15%, 1949-2026 linear over the remaining 85%. */
export function axisX(y: number): number {
  if (y < YB) return (0.15 * (y - Y0)) / (YB - Y0);
  return 0.15 + (0.85 * (y - YB)) / (Y1 + 1 - YB);
}
export interface Tick { id: string; x: number; lane: number; st: HStatus; ch: number }
/** Ticks placed by date; events closer than `minPx` share a stack of up to 4 lanes (sorted by date then id). */
export function layoutTicks(evs: readonly Ev[], width: number, minPx = 3): Tick[] {
  const sorted = [...evs].sort((a, b) => (a.date === b.date ? (a.id < b.id ? -1 : 1) : a.date < b.date ? -1 : 1));
  const out: Tick[] = [];
  let lastX = -1e9, lane = 0;
  for (const e of sorted) {
    let x = axisX(yearOf(e.date)) * width;
    if (x - lastX < minPx) { lane = (lane + 1) % 4; if (lane === 0) x = lastX + minPx; } else lane = 0;
    if (lane === 0) lastX = x;
    out.push({ id: e.id, x: lane === 0 ? x : lastX, lane, st: e.st, ch: e.ch });
  }
  return out;
}

/** Short date for cards: year in display numerals, the rest as suffix. */
export const dateParts = (d: string): [string, string] => [d.slice(0, 4), d.length > 4 ? d.slice(4) : ""];

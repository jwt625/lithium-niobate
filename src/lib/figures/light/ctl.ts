// Chapter 02 control helpers: range inputs with fixed-format outputs and aria-valuetext, log-mapped sliders, segmented
// button groups. Both design variants bind to one shared state object; the figure repaints on its own rAF queue.
import { Disposer, qa } from "../dom.ts";
import { rangeFill } from "../visual/range.ts";

/** Log mapping for a slider with integer steps 0..N: value = lo (hi/lo)^(s/N). */
export const logMap = (lo: number, hi: number, N = 1000) => ({
  to: (s: number): number => lo * (hi / lo) ** (s / N),
  from: (v: number): number => Math.round((Math.log(v / lo) / Math.log(hi / lo)) * N),
  N,
});

export interface RangeSpec {
  /** slider value (as typed in the input) -> state value */
  read: (s: number) => number;
  /** state value -> slider value */
  write: (v: number) => number;
  /** fixed-width output text */
  fmt: (v: number) => string;
  /** aria-valuetext with units */
  aria: (v: number) => string;
  get: () => number;
  set: (v: number) => void;
  /** output receives HTML instead of text */
  html?: boolean;
}

/** Bind a range input and its output element; returns sync() (state -> input and output). */
export function bindRange(dis: Disposer, inp: HTMLInputElement | null, out: HTMLElement | null, spec: RangeSpec, onChange: () => void): () => void {
  const show = (): void => {
    const v = spec.get();
    if (out) { if (spec.html) out.innerHTML = spec.fmt(v); else out.textContent = spec.fmt(v); }
    if (inp) { inp.setAttribute("aria-valuetext", spec.aria(v)); rangeFill(inp); }
  };
  if (inp) dis.on(inp, "input", () => { spec.set(spec.read(+inp.value)); show(); onChange(); });
  return () => { if (inp) inp.value = String(spec.write(spec.get())); show(); };
}

/** Bind a segmented button group (buttons carry data-v); returns sync() (marks the active button). */
export function bindSeg(dis: Disposer, group: Element | null, get: () => string, set: (v: string) => void, onChange: () => void): () => void {
  const btns = group ? qa<HTMLButtonElement>(group, "button[data-v]") : [];
  const sync = (): void => { const cur = get(); for (const b of btns) { const on = b.dataset.v === cur; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); } };
  for (const b of btns) dis.on(b, "click", () => { set(b.dataset.v ?? ""); sync(); onChange(); });
  return sync;
}

/** Toggle button (aria-pressed); returns sync(). */
export function bindToggle(dis: Disposer, btn: HTMLButtonElement | null, get: () => boolean, set: (v: boolean) => void, onChange: () => void): () => void {
  const sync = (): void => { if (!btn) return; btn.setAttribute("aria-pressed", String(get())); btn.classList.toggle("on", get()); };
  if (btn) dis.on(btn, "click", () => { set(!get()); sync(); onChange(); });
  return sync;
}

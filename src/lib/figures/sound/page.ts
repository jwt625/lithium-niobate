// Page-level helpers for chapter 03 routes: VISUAL range fill on every mode or theme change, and a canvas repaint hook
// that fires on mode/theme changes and container resizes.
import { onUi, Disposer } from "../dom.ts";
import { fillAll } from "../visual/range.ts";
import { installRangeFill } from "../visual/lifecycle.ts";

export function mountSound(): () => void {
  const off1 = installRangeFill();
  const off2 = onUi(() => requestAnimationFrame(() => fillAll()));
  requestAnimationFrame(() => fillAll());
  void document.fonts?.ready.then(() => fillAll());
  return () => { off1(); off2(); };
}

/** Repaint `draw` on resize of `el`, on mode/theme changes, and once fonts are ready. Returns the teardown. */
export function canvasHooks(el: HTMLElement, draw: () => void): () => void {
  const d = new Disposer();
  let q = false;
  const req = (): void => { if (q) return; q = true; requestAnimationFrame(() => { q = false; draw(); }); };
  d.observe(el, req);
  d.add(onUi(req));
  void document.fonts?.ready.then(req);
  req();
  return d.run;
}

/** CSS custom property of the root element (VISUAL tokens). */
export const tok = (name: string): string => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

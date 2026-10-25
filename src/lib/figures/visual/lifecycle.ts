// VISUAL component lifecycle (mockup visual.js "lifecycle"): initialize on the first VISUAL display, repaint on later mode
// or theme changes while VISUAL, repaint once the web fonts are ready; idle in TECH.
import { isVisual, onUi } from "../dom.ts";
import { fillAll, rangeFill } from "./range.ts";

export interface Part { repaint: () => void; dispose?: () => void }

export function whenVisual(init: () => Part | null): () => void {
  let part: Part | null = null, alive = true;
  const run = (): void => {
    if (!isVisual()) return;
    if (!part) part = init(); else part.repaint();
    fillAll();
  };
  const off = onUi(run);
  run();
  void document.fonts?.ready.then(() => { if (alive && part && isVisual()) part.repaint(); });
  return () => { alive = false; off(); part?.dispose?.(); };
}

/** VISUAL-only: refill any range input the reader moves (TECH markup shown in VISUAL included). Install once per page. */
export function installRangeFill(): () => void {
  const h = (e: Event): void => { const t = e.target; if (isVisual() && t instanceof HTMLInputElement && t.type === "range") rangeFill(t); };
  document.addEventListener("input", h);
  return () => document.removeEventListener("input", h);
}

// VISUAL range inputs: track filled from the minimum (unipolar) or from zero (bipolar), as CSS vars --p and --z.
const TH = 20; // thumb box, px (visual.css)
export function rangeFill(inp: HTMLInputElement): void {
  const lo = +inp.min, hi = +inp.max, f = (+inp.value - lo) / (hi - lo), z = lo < 0 && hi > 0 ? -lo / (hi - lo) : 0;
  const at = (u: number): string => `calc(${TH / 2}px + ${u.toFixed(4)} * (100% - ${TH}px))`;
  inp.style.setProperty("--p", at(f));
  inp.style.setProperty("--z", at(z));
}
export const fillAll = (root: ParentNode = document): void => root.querySelectorAll<HTMLInputElement>('input[type="range"]').forEach(rangeFill);

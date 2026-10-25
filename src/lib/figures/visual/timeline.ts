// VISUAL chronology (port of mockup/visual.js initTimeline): proportional time axis 1945-2025 with markers, plus a
// snap-scroll row of event cards; marker and card highlight each other. Cards are rendered by the page at build time.
import { CHRONOLOGY as EV, yearOf } from "$lib/content/chronology";
import { Disposer, fxOn, need, qa } from "../dom.ts";
import type { Part } from "./lifecycle.ts";

export const eraOf = (d: string): string => { const y = +d.slice(0, 4); return y < 1960 ? "drawing" : y < 1970 ? "mid" : y < 2000 ? "sheet" : "sem"; };

export function initTimeline(root: HTMLElement): Part {
  const dis = new Disposer();
  const box = need(root, "#v-tl-axis"), list = need(root, "#v-tl-cards");
  const cards = qa<HTMLElement>(list, ".v-tl-card");
  let marks: SVGGElement[] = [];
  const hl = (k: number, on: boolean): void => { cards[k]?.classList.toggle("hl", on); marks[k]?.classList.toggle("hl", on); };
  const go = (k: number): void => { const c = cards[k]; list.scrollTo({ left: c.offsetLeft - cards[0].offsetLeft, behavior: fxOn() ? "smooth" : "auto" }); cards.forEach((_, j) => hl(j, j === k)); };
  const mdis = new Disposer();
  function render(): void {
    mdis.run();
    const W = box.clientWidth, H = 120, ay = 86, X = (y: number): number => 8 + ((y - 1945) / 80) * (W - 16);
    let s = `<line x1="${X(1945)}" y1="${ay}" x2="${X(2025)}" y2="${ay}" stroke="var(--v-text3)" stroke-width="1.2"/>`;
    for (let y = 1945; y <= 2025; y += 5) { const big = y % 10 === 0; s += `<line x1="${X(y).toFixed(1)}" y1="${ay}" x2="${X(y).toFixed(1)}" y2="${ay + (big ? 9 : 4)}" stroke="var(--v-text3)"/>`; if (big && (W > 640 || y % 20 === 10)) s += `<text x="${X(y).toFixed(1)}" y="${ay + 26}" text-anchor="middle" font-size="13" fill="var(--v-text3)">${y}</text>`; }
    const lanes: number[] = [];
    const pos = EV.map((e, k) => { const x = X(yearOf(e.date)); let l = 0; while (lanes[l] !== undefined && x - lanes[l] < 18) l++; lanes[l] = x; return { x, l, k }; });
    pos.forEach(({ x, l, k }) => {
      const y = ay - 26 - l * 24, d = EV[k].date;
      s += `<g class="mk" data-k="${k}" tabindex="0" role="button" aria-label="${d}: ${EV[k].event.replace(/<[^>]+>/g, "")}"><line x1="${x.toFixed(1)}" y1="${ay}" x2="${x.toFixed(1)}" y2="${y + 7}" stroke="var(--v-line2)"/><path d="M${x.toFixed(1)} ${y - 7}l7 7-7 7-7-7z" fill="var(--v-text)" stroke="var(--v-ink0)" stroke-width="1"/><rect x="${(x - 12).toFixed(1)}" y="${y - 12}" width="24" height="24" fill="transparent"/><title>${d}</title></g>`;
    });
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Chronology, 1945 to 2025">${s}</svg>`;
    marks = [];
    qa<SVGGElement>(box, ".mk").forEach((m) => {
      const k = +(m.dataset.k ?? 0); marks[k] = m;
      mdis.on(m, "click", () => go(k));
      mdis.on(m, "keydown", (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(k); } });
      mdis.on(m, "pointerenter", () => hl(k, true)); mdis.on(m, "pointerleave", () => hl(k, false));
    });
  }
  cards.forEach((c, k) => { dis.on(c, "pointerenter", () => hl(k, true)); dis.on(c, "pointerleave", () => hl(k, false)); dis.on(c, "focusin", () => hl(k, true)); dis.on(c, "focusout", () => hl(k, false)); });
  render();
  dis.observe(box, render);
  dis.add(mdis.run);
  return { repaint: render, dispose: dis.run };
}

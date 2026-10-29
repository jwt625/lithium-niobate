// Test fixture for the BABY runtime (not registered: leading underscore). Dev only, via ?babyfixture=1, it stands in for
// books that do not exist yet (runtime/registry.ts). Exercises: settle, an idle loop (settle = Infinity), wake on tap,
// a page without a note. Page secs mirror the cover plan (DevLog-007 sec. 7) so the route mapping can be tested.
import type { BabyBook, BabyPage, SceneHost } from "../types";

const NS = "http://www.w3.org/2000/svg";

function page(text: string, sec: string, note: string | undefined, settle: number, tap: boolean): BabyPage {
  return {
    text, sec, note,
    scene(host: SceneHost) {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 1000 1000");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.display = "block";
      const r = host.rng(7), dots = Array.from({ length: 12 }, () => [r() * 1000, r() * 600 + 300]);
      svg.innerHTML = `<rect width="1000" height="1000" fill="#efe6d2"/>${dots.map(([x, y]) => `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="18" height="18" fill="#c9b994"/>`).join("")}`
        + `<text x="500" y="160" font-size="64" text-anchor="middle" fill="#2b2418" font-family="serif">${text}</text>`;
      const ball = document.createElementNS(NS, "circle");
      ball.setAttribute("r", "60"); ball.setAttribute("fill", "#b2352b"); ball.setAttribute("cy", "560");
      svg.appendChild(ball);
      host.el.appendChild(svg);
      let tapT = -1, last = 0;
      const onTap = (): void => { tapT = last; host.wake(1); };
      if (tap) svg.addEventListener("pointerdown", onTap);
      return {
        settle,
        frame(t: number) {
          last = t;
          const s = !Number.isFinite(settle) ? 0.5 + 0.5 * Math.sin(t * 2) : settle > 0 ? Math.min(1, t / settle) : 1;
          const kick = tapT >= 0 ? Math.max(0, 1 - (t - tapT)) * 200 : 0;
          ball.setAttribute("cx", (200 + 600 * s).toFixed(1));
          ball.setAttribute("cy", (560 - kick).toFixed(1));
        },
        destroy() { svg.removeEventListener("pointerdown", onTap); },
      };
    },
  };
}

const book: BabyBook = {
  slug: "_fixture", title: "Fixture", style: "test",
  pages: [
    page("Page one", "/", "Fixture note one (no source).", 1.5, false),
    page("Page two", "/crystal/", "Fixture note two (no source).", Infinity, false),
    page("Page three", "/crystal/polarization/", "Fixture note three (no source).", 1, true),
    page("Page four", "/", undefined, 0, false),
  ],
};
export default book;

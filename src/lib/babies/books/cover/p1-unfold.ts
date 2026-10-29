// Cover p1: a folded 60 deg wedge of red paper unfolds (thirds, then the half) into LiNbO3 seen down c (holes = atom
// columns, cation-column holes backed with gold once open); title lettered below.
// Tap the rosette: it folds up and unfolds again.
import type { Scene, SceneHost } from "../../types";
import { I, easeInOut, el, lerp, mstr, mul, polyD, seg, makePaper, type M } from "./kit";
import { C_HOLE, flip, wedge } from "./motif";
import { letterBlock } from "./letters";

const END = 2.45;

export function unfoldScene(host: SceneHost): Scene {
  const p = makePaper(host, 11);
  const { paper, crease, cations } = wedge();
  const wid = p.id("w");
  el("path", { id: wid, d: paper, "fill-rule": "evenodd" }, p.defs);
  const cp = el("clipPath", { id: p.id("wc") }, p.defs);
  el("path", { d: paper, "clip-rule": "evenodd" }, cp);

  // gold under-pieces behind the cation-column holes; they show once the sheet is open
  let gd = "";
  for (const [x, y] of cations) {
    const r = C_HOLE + 8;
    gd += polyD([0, 1, 2, 3, 4, 5].map((k) => [x + r * Math.sin((k * Math.PI) / 3), y - r * Math.cos((k * Math.PI) / 3)] as [number, number]));
  }
  const gold = el("path", { d: gd, fill: p.gold, opacity: 0, transform: "translate(500 362) scale(1.08)", "aria-hidden": "true" }, p.svg);
  const fig = p.sheet(p.svg, { transform: "translate(500 362) scale(1.08)", "aria-hidden": "true" });
  const copy = (parent: Element, m: M) => {
    const g = el("g", { transform: mstr(m) }, parent);
    el("use", { href: "#" + wid, fill: p.red }, g);
    const shade = el("use", { href: "#" + wid, fill: "#2a0404", opacity: 0 }, g);
    el("path", { d: crease, fill: "none", stroke: "#ffd9c8", "stroke-width": 2.2, opacity: 0.32, "clip-path": p.url("wc") }, g);
    el("path", { d: crease, fill: "none", stroke: "#3a0606", "stroke-width": 1, opacity: 0.35, transform: "translate(1.4 1.4)", "clip-path": p.url("wc") }, g);
    return shade;
  };
  const F0 = flip(0, -1);
  const F60 = flip(60, -1);
  const F120 = flip(120, -1);
  // bottom half (sectors 300-360, 240-300, 180-240) folds under the top half across the 0/180 crease
  const gD = el("g", {}, fig);
  const s5 = copy(gD, F0);
  const gB2 = el("g", {}, gD);
  const s4 = copy(gB2, mul(F120, F0));
  const gC2 = el("g", {}, gB2);
  const s3 = copy(gC2, mul(F60, mul(F120, F0)));
  // top half: sector 0-60 fixed, 60-120 hinged at the 60 crease, 120-180 hinged at the 120 crease
  copy(fig, I);
  const gB = el("g", {}, fig);
  const s1 = copy(gB, F60);
  const gC = el("g", {}, gB);
  const s2 = copy(gC, mul(F120, F60));
  const hit = el("circle", { cx: 500, cy: 362, r: 320, fill: "none", "pointer-events": "all", style: "cursor:pointer" }, p.svg);

  letterBlock(p.svg, p, "Lithium Niobate for Babies", { cx: 500, base: 768, xh: 52, lines: ["Lithium Niobate", "for Babies"], lineH: 128 });

  let lastT = 0;
  let replay = -1;
  const onTap = () => {
    if (host.reduced) return;
    replay = lastT;
    host.wake(END / 3 + END + 0.3);
  };
  hit.addEventListener("pointerdown", onTap);

  const draw = (tau: number) => {
    const cB = lerp(-1, 1, easeInOut(seg(tau, 0.25, 0.95)));
    const cC = lerp(-1, 1, easeInOut(seg(tau, 0.55, 1.25)));
    const cD = lerp(-1, 1, easeInOut(seg(tau, 1.35, 2.1)));
    gB.setAttribute("transform", mstr(flip(60, cB)));
    gB2.setAttribute("transform", mstr(flip(120, cB)));
    gC.setAttribute("transform", mstr(flip(120, cC)));
    gC2.setAttribute("transform", mstr(flip(60, cC)));
    gD.setAttribute("transform", mstr(flip(0, cD)));
    const sh = (c: number) => String(Math.round(0.42 * (1 - Math.abs(c)) * 100) / 100);
    const bc = Math.min(Math.abs(cB), Math.abs(cC));
    s1.setAttribute("opacity", sh(cB));
    s2.setAttribute("opacity", sh(bc));
    s5.setAttribute("opacity", sh(cD));
    s4.setAttribute("opacity", sh(Math.min(Math.abs(cB), Math.abs(cD))));
    s3.setAttribute("opacity", sh(Math.min(bc, Math.abs(cD))));
    gold.setAttribute("opacity", seg(tau, 2.0, 2.4).toFixed(2));
  };

  return {
    settle: END,
    frame(t: number) {
      lastT = t;
      let tau = host.reduced ? END : t;
      if (replay >= 0) {
        const l = t - replay;
        tau = l < END / 3 ? END - 3 * l : Math.min(END, l - END / 3);
      }
      draw(tau);
    },
    destroy() {
      hit.removeEventListener("pointerdown", onTap);
      p.destroy();
    },
  };
}

// Cover p3: a red crystal with its built-in electric polarization cut out as an arrow (gold sheet behind shows through);
// a gold light ray wiggles across it and red sound ripples spread out from it. Tap: they wiggle again.
import type { Scene, SceneHost } from "../../types";
import { el, polyD, r1, makePaper, type Pt } from "./kit";
import { letterBlock } from "./letters";

const END = 5;
const D2R = Math.PI / 180;

export function arrowScene(host: SceneHost): Scene {
  const p = makePaper(host, 37);
  const svg = p.svg;
  const art = el("g", { "aria-hidden": "true" }, svg);

  // ripples (behind the crystal): annular arcs left and right of the crystal
  const rip = p.sheet(art);
  const arcs = [0, 1, 2].flatMap(() => [el("path", { fill: p.red }, rip), el("path", { fill: p.red }, rip)]);
  const RC: Pt = [500, 482];
  const arcD = (r: number, side: 1 | -1) => {
    const pts: Pt[] = [];
    const n = 14;
    const span = 22;
    for (let i = 0; i <= n; i++) {
      const a = (-span + (2 * span * i) / n) * D2R;
      pts.push([RC[0] + side * (r + 7) * Math.cos(a), RC[1] + (r + 7) * Math.sin(a)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (-span + (2 * span * i) / n) * D2R;
      pts.push([RC[0] + side * (r - 7) * Math.cos(a), RC[1] + (r - 7) * Math.sin(a)]);
    }
    return polyD(pts);
  };

  // crystal: gold backing + red hexagon with arrow, sawtooth rows and diamonds cut out
  el("path", { d: polyD([[500, 80], [625, 152], [625, 508], [500, 580], [375, 508], [375, 152]]), fill: p.gold }, p.sheet(art));
  let cd = polyD([[500, 55], [645, 140], [645, 520], [500, 605], [355, 520], [355, 140]]);
  cd += polyD([[500, 135], [578, 264], [528, 264], [528, 482], [472, 482], [472, 264], [422, 264]]);
  for (let y = 182; y <= 482; y += 30) {
    cd += polyD([[374, y - 9], [400, y], [374, y + 9]]);
    cd += polyD([[626, y - 9], [600, y], [626, y + 9]]);
  }
  cd += polyD([[500, 84], [513, 104], [500, 124], [487, 104]]);
  cd += polyD([[500, 520], [516, 544], [500, 568], [484, 544]]);
  const crystal = p.sheet(art, { style: "cursor:pointer" });
  el("path", { d: cd, fill: p.red, "fill-rule": "evenodd", "pointer-events": "all" }, crystal);

  // light ray (in front): gold wavy strip with an arrowhead
  const ray = p.sheet(art);
  const rayP = el("path", { fill: p.gold }, ray);
  const k = (2 * Math.PI) / 112;
  const yc = (x: number, ph: number) => 300 + 24 * Math.sin(k * x - ph);

  letterBlock(svg, p, "It has an arrow inside. The arrow lets it play with light and sound.", { cx: 500, base: 762, xh: 36, lines: ["It has an arrow inside.", "The arrow lets it play", "with light and sound."] });

  const hit = el("rect", { width: 1000, height: 690, fill: "none", "pointer-events": "all", style: "cursor:pointer" }, svg);
  let lastT = 0;
  let replay = -1;
  let base = 0;
  const eff = (l: number) => (l >= END ? END / 2 : l - (l * l) / (2 * END));
  const onTap = () => {
    if (host.reduced) return;
    base += eff(lastT - (replay >= 0 ? replay : 0));
    replay = lastT;
    host.wake(END + 0.2);
  };
  hit.addEventListener("pointerdown", onTap);

  const draw = (tau: number) => {
    const ph = 2 * Math.PI * 1.1 * tau;
    const top: Pt[] = [];
    const bot: Pt[] = [];
    for (let x = 22; x <= 930; x += 8) {
      const y = yc(x, ph);
      top.push([x, y - 8]);
      bot.push([x, y + 8]);
    }
    const ye = yc(930, ph);
    const d = polyD(top.concat([[930, ye - 24], [980, ye], [930, ye + 24]], bot.reverse()));
    rayP.setAttribute("d", d);
    for (let i = 0; i < 3; i++) {
      const r = 172 + ((i * 56 + 20 + 70 * tau) % 168);
      const o = Math.min(1, (r - 172) / 30, (340 - r) / 40);
      for (const side of [0, 1]) {
        const a = arcs[i * 2 + side];
        a.setAttribute("d", arcD(r, side ? 1 : -1));
        a.setAttribute("opacity", String(r1(Math.max(0, o))));
      }
    }
  };

  return {
    settle: END,
    frame(t: number) {
      lastT = t;
      if (host.reduced) return draw(END / 2);
      const l = replay >= 0 ? t - replay : t;
      draw(base + eff(l));
    },
    destroy() {
      hit.removeEventListener("pointerdown", onTap);
      p.destroy();
    },
  };
}

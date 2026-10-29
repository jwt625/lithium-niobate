// Cover p2: three cut-paper balls (Li gold, Nb red with petal cuts, O larger red with crescent cuts) hop into a pot of
// gold melt; a seed rod dips in and pulls the grown crystal up out of it. Tap: it happens again.
import type { Scene, SceneHost } from "../../types";
import { circlePts, easeInOut, easeOut, el, lerp, polyD, seg, makePaper, type Pt } from "./kit";
import { letterBlock } from "./letters";
import { P, crescent } from "./motif";

const END = 3.3;
const D2R = Math.PI / 180;

function ring(n: number, f: (a: number) => Pt[]): string {
  let d = "";
  for (let i = 0; i < n; i++) d += polyD(f((i / n) * 360));
  return d;
}
const rot = (pts: Pt[], deg: number): Pt[] => pts.map(([x, y]) => [x * Math.cos(deg * D2R) - y * Math.sin(deg * D2R), x * Math.sin(deg * D2R) + y * Math.cos(deg * D2R)]);

/** Ball paths centred on the origin. */
function ballD(kind: "Li" | "Nb" | "O", r: number): string {
  let d = polyD(circlePts(0, 0, r, 64));
  if (kind === "Li") {
    d += ring(10, (a) => rot([[-6, -r + 12], [0, -r + 30], [6, -r + 12]], a));
    d += polyD(circlePts(0, 0, 13, 24));
  } else if (kind === "Nb") {
    d += ring(3, (a) => rot([[0, -9], [11, -22], [8, -38], [0, -46], [-8, -38], [-11, -22]], a));
    d += ring(3, (a) => rot(circlePts(0, -r + 15, 5.5, 14), a + 60));
  } else {
    for (let i = 0; i < 6; i++) d += polyD(crescent(P(r - 30, i * 60 + 30), 15, 0.3, i * 60 + 30));
    d += polyD(circlePts(0, 0, 15, 24));
  }
  return d;
}

export function growScene(host: SceneHost): Scene {
  const p = makePaper(host, 23);
  const svg = p.svg;
  const art = el("g", { "aria-hidden": "true" }, svg);
  const meltTop = "M345 575Q500 538 655 575";
  // melt (gold), glow layer
  const melt = p.sheet(art);
  el("path", { d: meltTop + "Q500 600 345 575Z", fill: p.gold }, melt);
  const glow = el("path", { d: meltTop + "Q500 600 345 575Z", fill: "#fff4c4", opacity: 0 }, melt);

  // balls
  const specs = [
    { kind: "Li" as const, x: 230, y: 180, r: 62, fill: p.gold, t0: 0.35 },
    { kind: "Nb" as const, x: 500, y: 165, r: 62, fill: p.red, t0: 0.5 },
    { kind: "O" as const, x: 765, y: 180, r: 80, fill: p.red, t0: 0.65 },
  ];
  const balls = specs.map((s) => {
    const g = el("g", {}, art);
    el("path", { d: ballD(s.kind, s.r), fill: s.fill, "fill-rule": "evenodd" }, p.sheet(g));
    const lab = letterBlock(g, p, s.kind, { cx: 0, base: s.r + 70, xh: 34 }).g;
    return { s, g, lab };
  });

  // crystal boule pulled from the melt (clipped above the melt surface), gold backing shows through lattice holes
  const cl = el("clipPath", { id: p.id("melt") }, p.defs);
  el("path", { d: "M0 -1200H1000V575H655Q500 538 345 575H0Z" }, cl);
  const clipG = el("g", { "clip-path": p.url("melt") }, art);
  const boule = el("g", {}, clipG);
  el("rect", { x: 404, y: 282, width: 192, height: 256, fill: p.gold }, boule);
  const outline: Pt[] = [[492, 150], [508, 150], [606, 262], [602, 540], [585, 562], [500, 574], [415, 562], [398, 540], [394, 262]];
  let bd = polyD(outline);
  for (let row = 0; row < 6; row++) {
    const y = 302 + row * 44;
    const off = row % 2 ? 18.75 : 0;
    for (let col = 0; col < 5; col++) {
      const x = 425 + off + col * 37.5;
      if (x > 582) continue;
      bd += polyD(circlePts(x, y, (col + row) % 2 ? 6 : 11, 18));
    }
  }
  const bouleSheet = p.sheet(boule);
  el("path", { d: bd, fill: p.red, "fill-rule": "evenodd" }, bouleSheet);
  const rod = p.sheet(clipG);
  el("path", { d: "M492 -620H508V158H492Z", fill: p.red }, rod);

  // pot: one connected red sheet with diamond and dot cuts
  let pd = polyD([[318, 566], [682, 566], [682, 598], [660, 598], [634, 674], [366, 674], [340, 598], [318, 598]]);
  for (let i = 0; i < 6; i++) {
    const x = 395 + i * 42;
    pd += polyD([[x, 618], [x + 13, 636], [x, 654], [x - 13, 636]]);
  }
  for (let i = 0; i < 11; i++) pd += polyD(circlePts(338 + i * 32.4, 582, 5, 12));
  const pot = p.sheet(art);
  el("path", { d: pd, fill: p.red, "fill-rule": "evenodd" }, pot);

  letterBlock(svg, p, "Lithium, niobium and oxygen make this crystal. People grow it.", { cx: 500, base: 762, xh: 36, lines: ["Lithium, niobium and oxygen", "make this crystal.", "People grow it."] });

  const hit = el("rect", { width: 1000, height: 690, fill: "none", "pointer-events": "all", style: "cursor:pointer" }, svg);
  let lastT = 0;
  let replay = -1;
  const onTap = () => {
    if (host.reduced) return;
    replay = lastT;
    host.wake(END + 0.3);
  };
  hit.addEventListener("pointerdown", onTap);

  const draw = (tau: number) => {
    for (const b of balls) {
      const s = seg(tau, b.s.t0, b.s.t0 + 0.65);
      const x = lerp(b.s.x, 500, easeInOut(s));
      const y = b.s.y - 70 * Math.sin(Math.PI * s) + (620 - b.s.y) * s * s;
      const k = 1 - 0.5 * s;
      b.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})`);
      b.g.setAttribute("display", s >= 1 ? "none" : "inline");
      const lo = 1 - seg(s, 0.55, 0.8);
      b.lab.setAttribute("opacity", lo.toFixed(2));
      b.lab.setAttribute("display", lo <= 0 ? "none" : "inline");
    }
    glow.setAttribute("opacity", (0.7 * Math.sin(Math.PI * seg(tau, 1.0, 1.7))).toFixed(2));
    const a = easeOut(seg(tau, 1.2, 1.7));
    const b = easeInOut(seg(tau, 1.8, 3.2));
    const rodY = a < 1 ? lerp(-800, 418, a) : lerp(418, 0, b);
    rod.setAttribute("transform", `translate(0 ${rodY.toFixed(1)})`);
    boule.setAttribute("transform", `translate(0 ${lerp(424, 0, b).toFixed(1)})`);
  };

  return {
    settle: END,
    frame(t: number) {
      lastT = t;
      let tau = host.reduced ? END : t;
      if (replay >= 0) tau = Math.min(END, t - replay);
      draw(tau);
    },
    destroy() {
      hit.removeEventListener("pointerdown", onTap);
      p.destroy();
    },
  };
}

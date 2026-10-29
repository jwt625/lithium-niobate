// Cover p4: a paper-cut street. Eight chapter doors in five buildings (lab: Crystal, Light, Sound, Quirks; factory:
// Making; workshop: Devices; museum: History; data center: Industry). Each door is a real link; its red leaf swings open
// on hover / keyboard focus / data-open="1" set by the runtime (CSS transition --door-leaf-dur, none under reduced
// motion); the gold doorway is the [data-aperture] path. Stop-motion street life at 7 steps/s, every moving piece
// jittered per step (seeded): a worker carries a boule from the factory to the lab, a phone talks to the mast, light
// pulses hop along the cable to the data center, the chimney puffs. Reduced motion: one still step, no jitter.
import type { Scene, SceneHost } from "../../types";
import { circlePts, el, polyD, r1, makePaper, type Pt } from "./kit";
import { letterBlock, measure } from "./letters";

const FPS = 7;
const W = 72;
const H = 108;
const XH = 25;
const U = XH / 5;
const SH = 56;

const arch = (x: number, y: number, w: number, h: number) => `M${x} ${y}V${y - h + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y - h + w / 2}V${y}Z`;
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;

interface DoorSpec { label: string; slug: string; cx: number; fy: number }
const DOORS: DoorSpec[] = [
  { label: "Crystal", slug: "crystal", cx: 122, fy: 630 },
  { label: "Light", slug: "light", cx: 318, fy: 630 },
  { label: "Sound", slug: "sound", cx: 122, fy: 840 },
  { label: "Quirks", slug: "quirks", cx: 318, fy: 840 },
  { label: "Making", slug: "making", cx: 578, fy: 840 },
  { label: "Devices", slug: "devices", cx: 770, fy: 840 },
  { label: "History", slug: "history", cx: 585, fy: 510 },
  { label: "Industry", slug: "industry", cx: 856, fy: 520 },
];
const signW = (d: DoorSpec) => measure(d.label) * U + 14;
const signTop = (d: DoorSpec) => d.fy - H - 10 - SH;
/** Facade holes for a door: frame (door + 6 gap) and the sign window above it. */
const doorHoles = (d: DoorSpec) => arch(d.cx - W / 2 - 6, d.fy, W + 12, H + 6) + rect(r1(d.cx - signW(d) / 2), signTop(d), r1(signW(d)), SH);
const holesOf = (...slugs: string[]) => DOORS.filter((d) => slugs.includes(d.slug)).map(doorHoles).join("");

const CABLE_A: Pt = [428, 162];
const CABLE_B: Pt = [955, 232];
const cableAt = (s: number): Pt => [CABLE_A[0] + (CABLE_B[0] - CABLE_A[0]) * s, CABLE_A[1] + (CABLE_B[1] - CABLE_A[1]) * s + 80 * s * (1 - s)];

export function doorsScene(host: SceneHost): Scene {
  const p = makePaper(host, 41);
  const svg = p.svg;
  const c = (n: string) => p.id(n);
  el("style", {}, svg).textContent =
    `.${c("leaf")}{transition:transform var(--door-leaf-dur,.4s) cubic-bezier(.2,.8,.3,1);transform-box:fill-box;transform-origin:0 50%}` +
    `.${c("door")}{outline:none;--door-leaf-dur:.4s}.${c("door")}:hover .${c("leaf")},.${c("door")}:focus-visible .${c("leaf")},.${c("door")}[data-open="1"] .${c("leaf")}{transform:scaleX(.58) skewY(-8deg)}` +
    `.${c("fb")}{opacity:0}.${c("door")}:focus-visible .${c("fb")}{opacity:1}` +
    (host.reduced ? `.${c("leaf")}{transition:none}` : `@media (prefers-reduced-motion:reduce){.${c("leaf")}{transition:none}}`);

  // jittered pieces: translate(base + jitter) rotate(jitter about its centre)
  type Piece = { g: SVGGElement; x: number; y: number; cx: number; cy: number; amp: number; rot: number; on: boolean };
  const pieces: Piece[] = [];
  const piece = (parent: Element, cx: number, cy: number, amp = 1.5, rot = 1.5): Piece => {
    const pc = { g: el("g", {}, parent), x: 0, y: 0, cx, cy, amp, rot, on: true };
    pieces.push(pc);
    return pc;
  };
  const art = el("g", { "aria-hidden": "true" }, svg);
  const red = (d: string, parent: Element, rule = "evenodd") => el("path", { d, fill: p.red, "fill-rule": rule }, p.sheet(parent));
  const gold = (d: string, parent: Element) => el("path", { d, fill: p.gold, "fill-rule": "evenodd" }, p.sheet(parent));

  // sun
  const rays: Pt[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 40 : 54;
    rays.push([92 + r * Math.cos(a), 172 + r * Math.sin(a)]);
  }
  const sun = polyD(rays) + polyD(circlePts(92, 172, 22, 28));
  gold(sun, piece(art, 92, 172, 1, 1.5).g);

  // gold hill behind the factory and workshop; museum and data center stand on it
  gold("M425 840V580Q428 522 482 520H1000V840Z", piece(art, 700, 680, 0.6, 0.2).g);

  // pole + cable, mast
  const pole = piece(art, 600, 300, 0.8, 0.2).g;
  red(`M425 160h7v680h-7Z M404 170h48v6h-48Z`, pole);
  el("path", { d: `M${CABLE_A[0]} ${CABLE_A[1]}Q${(CABLE_A[0] + CABLE_B[0]) / 2} ${(CABLE_A[1] + CABLE_B[1]) / 2 + 80} ${CABLE_B[0]} ${CABLE_B[1]}`, fill: "none", stroke: p.red, "stroke-width": 4 }, p.sheet(pole));
  red("M945 322L955 226L965 322H959L955 276L951 322Z M949 288H961V294H949Z", piece(art, 955, 280, 0.8, 0.5).g);

  // chimney and puffs
  red(rect(448, 548, 28, 94) + rect(452, 566, 20, 5) + rect(452, 584, 20, 5), piece(art, 462, 600, 0.8, 0.3).g);
  const puffs = [0, 1, 2].map(() => {
    const pc = piece(art, 0, 0, 1.5, 1.5);
    const d = polyD(circlePts(0, 0, 1, 18));
    const path = red(d, pc.g);
    path.setAttribute("transform", "scale(10)");
    return { pc, path };
  });

  // data center server lights (gold behind the facade, blinking per step)
  const blink = el("path", { fill: p.gold }, art);
  const servers: Pt[] = [];
  for (const x0 of [735, 905]) for (let ci = 0; ci < 4; ci++) for (let ri = 0; ri < 5; ri++) servers.push([x0 + ci * 17, 420 + ri * 17]);

  // buildings (one connected red sheet each)
  const lab = piece(art, 220, 600, 0.8, 0.3).g;
  let ld = polyD([[25, 840], [25, 446], [14, 446], [220, 352], [420, 446], [415, 446], [415, 840]]) + holesOf("crystal", "light", "sound", "quirks");
  ld += polyD([[212, 396], [228, 396], [228, 408], [246, 434], [194, 434], [212, 408]]); // flask in the gable
  for (let x = 40; x < 400; x += 24) ld += rect(x, 640, 12, 8); // balcony rail
  for (const y of [540, 750]) ld += rect(196, y, 22, 26) + rect(222, y, 22, 26) + rect(196, y + 30, 22, 26) + rect(222, y + 30, 22, 26);
  red(ld, lab);

  const fac = piece(art, 550, 720, 0.8, 0.3).g;
  let fd = polyD([[440, 840], [440, 600], [513, 640], [513, 600], [587, 640], [587, 600], [660, 640], [660, 840]]) + holesOf("making");
  fd += "M452 790V722A16 16 0 0 1 484 722V790Z" + "M624 790V722A12 12 0 0 1 648 722V790Z";
  red(fd, fac);

  const ws = piece(art, 770, 720, 0.8, 0.3).g;
  let wd = polyD([[675, 840], [675, 630], [665, 630], [770, 572], [875, 630], [865, 630], [865, 840]]) + holesOf("devices");
  const gear: Pt[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    gear.push([770 + (i % 4 < 2 ? 15 : 10) * Math.cos(a), 606 + (i % 4 < 2 ? 15 : 10) * Math.sin(a)]);
  }
  wd += polyD(gear);
  red(wd, ws);

  const mus = piece(art, 585, 400, 0.8, 0.3).g;
  let md = polyD([[460, 520], [710, 520], [710, 510], [700, 510], [700, 326], [712, 326], [712, 314], [585, 264], [458, 314], [458, 326], [470, 326], [470, 510], [460, 510]]) + holesOf("history");
  md += rect(480, 338, 10, 162) + rect(680, 338, 10, 162) + rect(512, 404, 10, 96) + rect(648, 404, 10, 96);
  md += polyD(circlePts(585, 296, 9, 18));
  red(md, mus);

  const dc = piece(art, 856, 420, 0.8, 0.3).g;
  let dd = rect(722, 320, 268, 200) + holesOf("industry");
  for (const [x, y] of servers) dd += rect(x, y, 10, 10);
  red(dd, dc);

  // street
  const street = piece(art, 500, 900, 0.5, 0.1).g;
  let sd = rect(0, 840, 1000, 12);
  for (let x = 20; x < 1000; x += 64) sd += rect(x, 986, 34, 6);
  red(sd, street);

  // doors: links with the gold aperture, the swinging leaf and the lettered sign
  let leafD = arch(0, 0, W, H);
  leafD += arch(W * 0.24, -H * 0.6, W * 0.52, H * 0.28);
  leafD += rect(W * 0.18, -H * 0.5, W * 0.26, H * 0.38) + rect(W * 0.56, -H * 0.5, W * 0.26, H * 0.38);
  leafD += polyD(circlePts(W - 8, -H * 0.56, 3, 12));
  for (const d of DOORS) {
    const sw = signW(d);
    const a = el("a", { href: `/${d.slug}/`, "aria-label": d.label, class: c("door") }, svg);
    const x0 = Math.min(d.cx - sw / 2, d.cx - W / 2 - 10) - 6;
    const x1 = Math.max(d.cx + sw / 2, d.cx + W / 2 + 10) + 6;
    el("rect", { x: r1(x0), y: signTop(d) - 6, width: r1(x1 - x0), height: d.fy - signTop(d) + 10, fill: "none", stroke: "#3a1206", "stroke-width": 3, "stroke-dasharray": "8 5", "pointer-events": "all", class: c("fb") }, a);
    const g = el("g", { transform: `translate(${d.cx - W / 2} ${d.fy})` }, a);
    el("path", { d: arch(0, 0, W, H), fill: p.gold, "data-aperture": "" }, p.sheet(g));
    el("path", { d: leafD, fill: p.red, "fill-rule": "evenodd" }, p.sheet(g, { class: c("leaf") }));
    letterBlock(a, p, d.label, { cx: d.cx, base: signTop(d) + SH - 15, xh: XH, strip: false });
  }

  letterBlock(svg, p, "Pick a door!", { cx: 500, base: 88, xh: 40 });

  // figures (drawn facing right, feet at the origin)
  const fig = el("g", { "aria-hidden": "true" }, svg);
  const head = (cx: number) => polyD(circlePts(cx, -100, 12, 24)) + polyD(circlePts(cx + 5, -102, 2.2, 10));
  const worker = piece(fig, 0, -50, 1.5, 1.5);
  const wInner = el("g", { transform: "scale(-1 1)" }, worker.g);
  const wSheet = p.sheet(wInner);
  el("path", { d: head(0) + polyD([[-4, -90], [4, -90], [4, -85], [13, -85], [12, -44], [-12, -44], [-13, -85], [-4, -85]]) + rect(-8, -57, 16, 3) + polyD([[6, -84], [12, -86], [30, -70], [26, -64], [6, -74]]), fill: p.red, "fill-rule": "evenodd" }, wSheet);
  const legA = el("path", { d: "M-5 -46L-14 -3H-22M5 -46L12 -3H20", fill: "none", stroke: p.red, "stroke-width": 9 }, wSheet);
  const legB = el("path", { d: "M-4 -46L-4 -3H-12M4 -46L6 -3H14", fill: "none", stroke: p.red, "stroke-width": 9 }, wSheet);
  gold("M-14 -103A14 14 0 0 1 14 -103H18V-99H-14Z", wInner);
  gold(polyD([[36, -98], [47, -88], [47, -58], [36, -48], [25, -58], [25, -88]]) + rect(33, -90, 6, 26), wInner);

  const caller = piece(fig, 0, -50, 1.2, 1.2);
  red(head(0) + polyD([[-4, -90], [4, -90], [4, -86], [10, -86], [20, -30], [-20, -30], [-10, -86], [-4, -86]]) + polyD([[-9, -44], [-5, -36], [-13, -36]]) + polyD([[0, -44], [4, -36], [-4, -36]]) + polyD([[9, -44], [13, -36], [5, -36]]) + "M-10 -31h6l-1 29h-7Z M4 -31h6l2 29h-7Z" + polyD([[6, -84], [11, -86], [22, -104], [17, -107]]), caller.g);
  gold(rect(16, -122, 10, 16), caller.g);
  const arcD = (cx: number, cy: number, r: number, a0: number, a1: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = ((a0 + ((a1 - a0) * i) / 8) * Math.PI) / 180;
      pts.push([cx + (r + 2.5) * Math.cos(a), cy - (r + 2.5) * Math.sin(a)]);
    }
    for (let i = 8; i >= 0; i--) {
      const a = ((a0 + ((a1 - a0) * i) / 8) * Math.PI) / 180;
      pts.push([cx + (r - 2.5) * Math.cos(a), cy - (r - 2.5) * Math.sin(a)]);
    }
    return polyD(pts);
  };
  const phoneArcs = [16, 28, 40].map((r) => gold(arcD(21, -114, r, 15, 80), caller.g));
  const mastArcs = [16, 28].map((r) => gold(arcD(955, 226, r, 200, 340), piece(art, 955, 226, 1, 1.5).g));

  // light pulses on the cable
  const pulses = [0, 1, 2].map(() => {
    const pc = piece(art, 0, 0, 1, 1.5);
    gold("M0 -12L9 0L0 12L-9 0Z", pc.g);
    return pc;
  });

  let lastStep = -1;
  const draw = (step: number, jitter: boolean) => {
    const w = step % 84;
    worker.on = w < 72;
    worker.x = 560 - 6 * w;
    worker.y = 972;
    legA.setAttribute("display", w % 2 ? "none" : "inline");
    legB.setAttribute("display", w % 2 ? "inline" : "none");
    caller.x = 905;
    caller.y = 972;
    const k = step % 14;
    phoneArcs.forEach((a, i) => a.setAttribute("display", k >= 1 + 2 * i && k < 12 ? "inline" : "none"));
    mastArcs.forEach((a, i) => a.setAttribute("display", k >= 7 + i && k < 12 ? "inline" : "none"));
    pulses.forEach((pc, i) => {
      const [x, y] = cableAt((((step % 30) / 30) + i / 3) % 1);
      pc.x = x;
      pc.y = y;
    });
    puffs.forEach(({ pc, path }, i) => {
      const age = (step + 8 * i) % 24;
      pc.x = 462 - 1.4 * age;
      pc.y = 538 - 6 * age;
      path.setAttribute("transform", `scale(${r1(9 + 0.7 * age)})`);
      path.setAttribute("opacity", age < 18 ? "1" : r1((24 - age) / 6).toString());
    });
    const rb = host.rng(9000 + step);
    let bd = "";
    for (const [x, y] of servers) if (rb() < 0.4) bd += rect(x, y, 10, 10);
    blink.setAttribute("d", bd || "M0 0");
    const rj = host.rng(5000 + step);
    for (const pc of pieces) {
      const jx = jitter ? (rj() - 0.5) * 2 * pc.amp : 0;
      const jy = jitter ? (rj() - 0.5) * 2 * pc.amp : 0;
      const jr = jitter ? (rj() - 0.5) * 2 * pc.rot : 0;
      pc.g.setAttribute("display", pc.on ? "inline" : "none");
      pc.g.setAttribute("transform", `translate(${r1(pc.x + jx)} ${r1(pc.y + jy)}) rotate(${r1(jr)} ${pc.cx} ${pc.cy})`);
    }
  };

  return {
    settle: host.reduced ? 0 : Infinity,
    frame(t: number) {
      const step = host.reduced ? 40 : Math.floor(t * FPS);
      if (step === lastStep) return;
      lastStep = step;
      draw(step, !host.reduced);
    },
    destroy() {
      p.destroy();
    },
  };
}

// Devices p3: one color (a single red line) goes into a black ring that a microwave (black wave from a
// generator) taps once per trip of the light around it (red dot). Each trip adds the next pair of evenly
// spaced lines: a comb of colors comes out. Tap: microwave off (comb shrinks to one line) / on (it regrows).
import type { Scene, SceneHost } from "../../types";
import { PAL, el, red, polyD, zigzag, prog, fly, easeOut, r1, makeStage, MISREG, type Pt } from "./kit";
import { letterLine } from "./letters";

const ROT = -9;
const CEN: Pt = [500, 590];
const BASE = 676;
const RING: Pt = [395, 536];
const RR = 112;
const TRIP = 0.3;
const PAIRS = 7;
const PITCH = 24;
const COMB_C = 772;
const HMAX = 230;
const END = 3;

export function combScene(host: SceneHost): Scene {
  const st = makeStage(host, 63);
  const art = st.art;

  letterLine(art, "One color goes in.", { x: 54, y: 122, cap: 50, rot: -6 });
  letterLine(art, "A comb of many", { x: 330, y: 872, cap: 50, rot: -6 });
  const rl = el("g", { transform: MISREG }, art);
  letterLine(rl, "colors comes out!", { x: 214, y: 958, cap: 50, rot: -6, fill: PAL.red });

  const dev = el("g", { transform: `rotate(${ROT} ${CEN[0]} ${CEN[1]})` }, art);

  // one color in: a short black baseline with a single red line
  const gIn = el("g", {}, dev);
  el("rect", { x: 28, y: BASE, width: 170, height: 12, fill: PAL.black }, gIn);
  red("rect", { x: 104, y: BASE - HMAX, width: 16, height: HMAX }, gIn);

  // bus waveguide (red) under the ring, from the input to the comb
  const gBus = el("g", {}, dev);
  red("rect", { x: 198, y: BASE - 1, width: 394, height: 10 }, gBus);

  // ring
  const gRing = el("g", {}, dev);
  el("circle", { cx: RING[0], cy: RING[1], r: RR, fill: "none", stroke: PAL.black, "stroke-width": 28 }, gRing);
  const dot = red("circle", { r: 15 }, gRing);

  // microwave generator and its wave down to the ring
  const gGen = el("g", {}, dev);
  const GEN: Pt = [RING[0] + 170, RING[1] - 250];
  el("rect", { x: GEN[0] - 44, y: GEN[1] - 44, width: 88, height: 88, fill: PAL.black }, gGen);
  const wave = el("path", { fill: "none", stroke: PAL.black, "stroke-width": 8, "stroke-linejoin": "miter" }, gGen);
  const wa: Pt = [GEN[0] - 30, GEN[1] + 44];
  const wb: Pt = [RING[0] + 70, RING[1] - 104];
  const wlen = Math.hypot(wb[0] - wa[0], wb[1] - wa[1]);
  const wang = (Math.atan2(wb[1] - wa[1], wb[0] - wa[0]) * 180) / Math.PI;

  // comb out: baseline + lines
  const gOut = el("g", {}, dev);
  el("rect", { x: 592, y: BASE, width: 362, height: 12, fill: PAL.black }, gOut);
  const lines = red("path", {}, gOut);

  // ---- drive state ----
  let lastT = 0;
  let on = true;
  let tT = 0.55;
  let n0 = 0;
  const pairsAt = (t: number) => {
    if (host.reduced) return t >= tT ? (on ? PAIRS : 0) : n0;
    const dt = Math.max(0, t - tT);
    return on ? Math.min(PAIRS + 0.999, n0 + dt / TRIP) : Math.max(0, n0 - dt / 0.1);
  };
  const tap = () => {
    n0 = Math.min(PAIRS, pairsAt(lastT));
    if (on) n0 = Math.floor(n0);
    on = !on;
    tT = lastT;
    host.wake(on ? PAIRS * TRIP + 0.8 : 1.2);
  };
  const hit = el("rect", { x: 0, y: 160, width: 1000, height: 650, fill: "transparent", "pointer-events": "all", style: "cursor:pointer" }, st.hit);
  hit.addEventListener("pointerdown", tap);

  const draw = (t: number) => {
    gIn.setAttribute("transform", fly(prog(host, t, 0, 0.6), 171, 400));
    gRing.setAttribute("transform", fly(prog(host, t, 0.1, 0.6), -99, 600));
    gGen.setAttribute("transform", fly(prog(host, t, 0.2, 0.6), -40, 500));
    gBus.setAttribute("opacity", r1(prog(host, t, 0.3, 0.3)).toString());

    // light circling the ring, one trip per TRIP seconds
    const a = (host.reduced ? 0.25 : (t / TRIP) % 1) * Math.PI * 2 + Math.PI / 2;
    dot.setAttribute("cx", r1(RING[0] + RR * Math.cos(a)).toString());
    dot.setAttribute("cy", r1(RING[1] + RR * Math.sin(a)).toString());

    // microwave: a wave moving toward the ring while on
    if (on || host.reduced) {
      const ph = host.reduced ? 0 : -t * 2.2;
      const z = zigzag(0, wlen, 0, 34, 15, ph).map(([x, y]) => {
        const c = Math.cos((wang * Math.PI) / 180);
        const s = Math.sin((wang * Math.PI) / 180);
        return [wa[0] + x * c - y * s, wa[1] + x * s + y * c] as Pt;
      });
      wave.setAttribute("d", polyD(z, false));
    }
    wave.setAttribute("opacity", on ? "1" : "0");

    // comb lines: carrier always; pair k appears after k trips while driven
    const n = t < 0.55 && !host.reduced ? 0 : pairsAt(t);
    let d = "";
    const bar = (x: number, h: number) => {
      if (h < 1) return;
      d += `M${r1(x - 7)} ${BASE}v${r1(-h)}h14v${r1(h)}Z`;
    };
    const showC = host.reduced || t >= 0.4 ? easeOut(prog(host, t, 0.4, 0.3)) : 0;
    bar(COMB_C, HMAX * showC);
    for (let k = 1; k <= PAIRS; k++) {
      const g = Math.max(0, Math.min(1, n - k + 1));
      const h = HMAX * Math.exp(-k / 4.2) * easeOut(g);
      bar(COMB_C - k * PITCH, h);
      bar(COMB_C + k * PITCH, h);
    }
    lines.setAttribute("d", d);
  };

  return {
    settle: END,
    frame(t: number) {
      lastT = t;
      draw(t);
    },
    destroy() {
      hit.removeEventListener("pointerdown", tap);
      st.destroy();
    },
  };
}

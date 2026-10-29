// Devices p4: a black phone with a round home button. In its window, a gray crystal chip with two black comb electrodes.
// Three radio waves (zigzags of different rhythm) wait outside; the chosen one enters. Only the wave whose
// rhythm matches the comb fingers makes strong sound ripples (red bars) that reach the second comb; then the
// red disc lights: the phone hears it. Tap a wave to choose it.
import type { Scene, SceneHost } from "../../types";
import { PAL, el, polyD, zigzag, prog, fly, r1, makeStage, MISREG, type Pt } from "./kit";
import { letterLine } from "./letters";

const ROT = -7;
const CEN: Pt = [560, 540];
const PH = { x: 586, y: 262, w: 284, h: 548 };
const WIN = { x: 606, y: 318, w: 244, h: 382 };
const CHIP = { x: 618, y: 332, w: 220, h: 354 };
const LAM = 40; // acoustic wavelength = period of same-polarity fingers
const IDT_T = [348, 444];
const IDT_B = [574, 670];
const WAVES = [
  { y: 336, P: 26, color: PAL.black },
  { y: 428, P: LAM, color: PAL.red },
  { y: 520, P: 66, color: PAL.gray },
];
const MATCH = 1;
const END = 3;
const SPEED = 120; // ripple speed, logical units per second

export function filterScene(host: SceneHost): Scene {
  const st = makeStage(host, 64);
  const art = st.art;

  letterLine(art, "Tiny sound ripples", { x: 54, y: 104, cap: 44, rot: -5 });
  letterLine(art, "help a phone hear", { x: 54, y: 170, cap: 44, rot: -5 });
  letterLine(art, "the right radio.", { x: 54, y: 236, cap: 44, rot: -5 });
  const rl = el("g", { transform: MISREG }, art);
  letterLine(rl, "Now you know", { x: 54, y: 880, cap: 54, rot: -5, fill: PAL.red });
  letterLine(rl, "the devices!", { x: 260, y: 966, cap: 54, rot: -5, fill: PAL.red });

  const all = el("g", { transform: `rotate(${ROT} ${CEN[0]} ${CEN[1]})` }, art);

  // radio waves outside the phone
  const gWaves = el("g", {}, all);
  const wavePaths = WAVES.map((w) => el("path", { fill: "none", stroke: w.color, "stroke-width": 9, "stroke-linejoin": "miter", transform: w.color === PAL.red ? MISREG : undefined }, gWaves));

  // phone body (black slab), window, chip, combs, ripples, home button
  const gPhone = el("g", {}, all);
  el("rect", { x: PH.x, y: PH.y, width: PH.w, height: PH.h, fill: PAL.black }, gPhone);
  el("rect", { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, fill: PAL.cream }, gPhone);
  el("rect", { x: PH.x + PH.w / 2 - 34, y: PH.y + 24, width: 68, height: 10, fill: PAL.cream }, gPhone);
  el("rect", { x: CHIP.x, y: CHIP.y, width: CHIP.w, height: CHIP.h, fill: PAL.gray }, gPhone);
  const ripples = el("path", { fill: PAL.red, transform: MISREG }, gPhone);
  const weak = el("path", { fill: PAL.cream, opacity: 0.85 }, gPhone);
  let comb = "";
  const lft = CHIP.x + 14;
  const rgt = CHIP.x + CHIP.w - 14;
  for (const [a, b] of [IDT_T, IDT_B]) {
    comb += `M${lft} ${a}V${b}H${lft + 16}V${a}Z M${rgt - 16} ${a}V${b}H${rgt}V${a}Z`;
    let i = 0;
    for (let y = a + 4; y + 10 <= b; y += LAM / 2, i++) {
      comb += i % 2 === 0 ? `M${lft + 16} ${y}v10H${rgt - 40}v-10Z` : `M${rgt - 16} ${y}v10H${lft + 40}v-10Z`;
    }
  }
  el("path", { d: comb, fill: PAL.black }, gPhone);
  const lamp = el("circle", { cx: PH.x + PH.w / 2, cy: PH.y + PH.h - 55, r: 34 }, gPhone);
  // feed from the antenna side into the first comb
  el("rect", { x: PH.x - 4, y: WAVES[MATCH].y - 4, width: lft - PH.x + 6, height: 8, fill: PAL.black }, gPhone);

  // ---- choice ----
  let lastT = 0;
  let sel = MATCH;
  let tSel = 0.9;
  const hits = WAVES.map((w, i) => {
    const r = el("rect", { x: 0, y: 0, width: 1, height: 1, fill: "transparent", "pointer-events": "all", style: "cursor:pointer" }, st.hit);
    // hit boxes follow the rotated wave rows (screen frame)
    const a: Pt = [20, w.y];
    const c = Math.cos((ROT * Math.PI) / 180);
    const s = Math.sin((ROT * Math.PI) / 180);
    const yy = CEN[1] + (a[0] - CEN[0]) * s + (a[1] - CEN[1]) * c;
    r.setAttribute("transform", `rotate(${ROT} 20 ${r1(yy)})`);
    r.setAttribute("x", "0");
    r.setAttribute("y", String(r1(yy - 40)));
    r.setAttribute("width", String(PH.x - 10));
    r.setAttribute("height", "80");
    const fn = () => {
      if (sel === i) return;
      sel = i;
      tSel = lastT;
      host.wake(2.6);
    };
    r.addEventListener("pointerdown", fn);
    return [r, fn] as const;
  });

  const draw = (t: number) => {
    gPhone.setAttribute("transform", fly(prog(host, t, 0, 0.75), -50, 560));
    gWaves.setAttribute("transform", fly(prog(host, t, 0.3, 0.6), 180, 420));

    // waves: chosen one moves toward the phone and is full strength
    WAVES.forEach((w, i) => {
      const on = i === sel;
      const ph = on && !host.reduced ? -(t * SPEED) / w.P : 0;
      wavePaths[i].setAttribute("d", polyD(zigzag(24, PH.x - 4, w.y, w.P, on ? 17 : 12, ph), false));
      wavePaths[i].setAttribute("opacity", on ? "1" : "0.55");
      wavePaths[i].setAttribute("stroke-width", on ? "10" : "7");
    });

    // ripples launched at the top comb since tSel; strong and reaching the bottom comb only when matched
    const age = host.reduced ? 99 : Math.max(0, t - tSel);
    const front = IDT_T[1] + age * SPEED;
    const match = sel === MATCH;
    let d = "";
    let dw = "";
    const y0 = IDT_T[1] + 6;
    const yEnd = match ? IDT_B[0] - 4 : y0 + 60;
    const off = host.reduced ? 12 : (t * SPEED) % LAM;
    for (let y = y0 + off; y < Math.min(front, yEnd); y += LAM) {
      if (match) d += `M${CHIP.x + 22} ${r1(y)}v12H${CHIP.x + CHIP.w - 22}v-12Z`;
      else {
        const f = 1 - (y - y0) / 60;
        const ww = (CHIP.w - 44) * 0.6 * f;
        dw += `M${r1(CHIP.x + CHIP.w / 2 - ww / 2)} ${r1(y)}v6h${r1(ww)}v-6Z`;
      }
    }
    ripples.setAttribute("d", d);
    weak.setAttribute("d", dw);
    const heard = match && (host.reduced || front >= IDT_B[0]);
    lamp.setAttribute("fill", heard ? PAL.red : "#3a3a3a");
    lamp.setAttribute("transform", heard ? MISREG : "");
  };

  return {
    settle: END,
    frame(t: number) {
      lastT = t;
      draw(t);
    },
    destroy() {
      for (const [r, fn] of hits) r.removeEventListener("pointerdown", fn);
      st.destroy();
    },
  };
}

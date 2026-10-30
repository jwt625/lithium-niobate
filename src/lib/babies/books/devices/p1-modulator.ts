// Devices p1: a laser (black body, red wedge) feeds a two-path interferometer between black electrode bars.
// A voltage on the lower bar shifts the wave in the lower path by half a wave; where the paths rejoin the light
// is then dark. Keys ON / OFF send bits; each bit leaves as a red (light) or black (dark) square.
// Cue: a flat pointing hand (black, cream outline, red cuff) plays the three intro presses, returns once after a pause
// to nudge ON then OFF (no bits), then leaves for good; the first real key press removes it. Reduced: static over ON.
import type { Scene, SceneHost } from "../../types";
import { PAL, el, red, polyD, zigzag, prog, fly, easeOut, easeInOut, lerp, rot, r1, D2R, makeStage, type Pt, MISREG } from "./kit";
import { letterLine } from "./letters";

const ROT = -12;
const CEN: Pt = [500, 520];
const ARM_T = 462;
const ARM_B = 578;
const AX0 = 300;
const AX1 = 600;
const MID = (ARM_T + ARM_B) / 2;
const SQ = 66;
const PITCH = 86;
const OUT_X = 700;
const SHIFT = 0.42;
const INTRO: [number, boolean][] = [[1.15, true], [1.75, false], [2.35, true]];
const END = 3;
// hand cue: hint cycle start and end (= settle)
const H0 = 4.3;
const H1 = H0 + 2;
const HANG = 20; // screen degrees: finger points down-left, hand body up-right
const HLIFT = 26; // hover height of the fingertip above its press point, along the hand axis

// Pointing hand, fingertip at the origin, finger along +y, body toward -y (local units, scaled 0.92 at use).
const HAND: { d: string; fill: string }[] = [
  { d: polyD([[-8, -48], [-8, -6], [-4, 0], [4, 0], [8, -6], [8, -48]]), fill: PAL.black },
  { d: polyD([[-13, -40], [-24, -56], [-14, -74], [-6, -74], [-6, -44]]), fill: PAL.black },
  { d: polyD([[-12, -44], [-12, -86], [36, -86], [36, -48], [32, -42], [12, -42], [10, -44]]), fill: PAL.black },
  { d: polyD([[-14, -89], [-14, -104], [38, -116], [38, -89]]), fill: PAL.red },
];
// cream cuts: thumb seam and folded-finger knuckles
const HAND_CUTS = "M-7 -44L-7 -72M17 -42L17 -60M26 -42L26 -60";

export function modulatorScene(host: SceneHost): Scene {
  const st = makeStage(host, 61);
  const art = st.art;

  // ---- text (static; legible at once) ----
  letterLine(art, "A modulator blinks", { x: 56, y: 128, cap: 50, rot: -6 });
  const rl = el("g", { transform: MISREG }, art);
  letterLine(rl, "laser light:", { x: 56, y: 212, cap: 50, rot: -6, fill: PAL.red });
  letterLine(art, "on, off, on.", { x: 370, y: 268, cap: 50, rot: -6 });
  letterLine(art, "That is a message!", { x: 500, y: 958, cap: 50, rot: -4, anchor: "middle" });

  // ---- device, in a frame rotated onto the diagonal ----
  const dev = el("g", { transform: `rotate(${ROT} ${CEN[0]} ${CEN[1]})` }, art);
  const gLaser = el("g", {}, dev);
  el("rect", { x: 6, y: MID - 70, width: 104, height: 140, fill: PAL.black }, gLaser);
  red("path", { d: polyD([[106, MID - 52], [222, MID - 10], [222, MID + 10], [106, MID + 52]]) }, gLaser);

  const gGuide = el("g", {}, dev);
  const guideA = { fill: "none", stroke: PAL.red, "stroke-width": 13, "stroke-linejoin": "miter", transform: MISREG };
  el("path", { ...guideA, d: polyD([[220, MID], [244, MID], [AX0, ARM_T], [AX0 + 2, ARM_T]], false) }, gGuide);
  el("path", { ...guideA, d: polyD([[244, MID], [AX0, ARM_B], [AX0 + 2, ARM_B]], false) }, gGuide);
  el("path", { ...guideA, d: polyD([[AX1 - 2, ARM_T], [AX1, ARM_T], [656, MID], [OUT_X - 4, MID]], false) }, gGuide);
  el("path", { ...guideA, d: polyD([[AX1 - 2, ARM_B], [AX1, ARM_B], [656, MID]], false) }, gGuide);
  const armT = el("path", { ...guideA }, gGuide);
  const armB = el("path", { ...guideA }, gGuide);

  // electrodes: ground bar between the paths, signal bar below the lower path
  const gEl = el("g", {}, dev);
  el("rect", { x: AX0 + 6, y: MID - 21, width: AX1 - AX0 - 12, height: 42, fill: PAL.black }, gEl);
  const sig = el("rect", { x: AX0 + 6, width: AX1 - AX0 - 12, fill: PAL.black }, gEl);

  // message squares leave where the paths rejoin
  const gMsg = el("g", {}, dev);

  // ---- keys (screen frame) wired to the signal bar ----
  const wireTop = rot([AX0 + 90, ARM_B + 56], CEN, ROT);
  const keyY = 744;
  const keys = { on: { x: 296, fill: PAL.red, label: "on" }, off: { x: 480, fill: PAL.black, label: "off" } };
  const KS = 124;
  el("path", { d: polyD([wireTop, [wireTop[0], keyY - 34], [keys.off.x + KS / 2, keyY - 34], [keys.off.x + KS / 2, keyY]], false), fill: "none", stroke: PAL.black, "stroke-width": 7 }, art);
  el("path", { d: polyD([[keys.on.x + KS / 2, keyY], [keys.on.x + KS / 2, keyY - 34], [wireTop[0], keyY - 34]], false), fill: "none", stroke: PAL.black, "stroke-width": 7 }, art);
  const keyG: Record<string, SVGGElement> = {};
  for (const k of ["on", "off"] as const) {
    const K = keys[k];
    const g = el("g", { style: "cursor:pointer" }, art);
    const sq = el("rect", { x: K.x, y: keyY, width: KS, height: KS, fill: K.fill }, g);
    if (k === "on") sq.setAttribute("transform", MISREG);
    letterLine(g, K.label, { x: K.x + KS / 2, y: keyY + KS / 2 + 17, cap: 34, anchor: "middle", fill: PAL.cream });
    keyG[k] = g;
  }

  // ---- hand cue (art layer, never a hit target) ----
  const hand = el("g", { "pointer-events": "none", opacity: 0 }, art);
  const handIn = el("g", { transform: "scale(0.92)" }, hand);
  for (const p of HAND) el("path", { d: p.d, fill: PAL.cream, stroke: PAL.cream, "stroke-width": 9, "stroke-linejoin": "miter" }, handIn);
  for (const p of HAND) el("path", { d: p.d, fill: p.fill, transform: p.fill === PAL.red ? MISREG : undefined }, handIn);
  el("path", { d: HAND_CUTS, fill: "none", stroke: PAL.cream, "stroke-width": 3.5 }, handIn);
  const tipOf = (k: "on" | "off"): Pt => [keys[k].x + KS / 2 - 4, keyY + 28];

  // ---- state ----
  const bits: { t: number; on: boolean }[] = INTRO.map(([t, on]) => ({ t, on }));
  let lastT = 0;
  let cueOff = Infinity; // time of the first real key press: the cue leaves for good
  const send = (on: boolean) => {
    const T = Math.max(lastT, END);
    bits.push({ t: host.reduced ? lastT : T, on });
    if (bits.length > 12) bits.shift();
    host.wake(1.4);
  };
  const hits = (["on", "off"] as const).map((k) => {
    const r = el("rect", { x: keys[k].x - 14, y: keyY - 14, width: KS + 28, height: KS + 28, fill: "transparent", "pointer-events": "all", style: "cursor:pointer" }, st.hit);
    const fn = (e: Event) => {
      e.preventDefault();
      if (cueOff === Infinity) cueOff = lastT;
      send(k === "on");
    };
    r.addEventListener("pointerdown", fn);
    return [r, fn] as const;
  });

  // hand pose at t: position between the keys (0 = on, 1 = off), lift above the press point, opacity
  const handPose = (t: number): { u: number; lift: number; op: number } => {
    if (host.reduced) return { u: 0, lift: 8, op: cueOff === Infinity ? 1 : 0 };
    const gone = 1 - prog(host, t, cueOff, 0.12);
    const bump = (t0: number, dur: number) => Math.sin(Math.PI * prog(host, t, t0, dur));
    if (t < H0) {
      // intro: fade in over ON, press with each intro bit (same window as the key pulse), travel between keys
      const fin = easeOut(prog(host, t, 0.8, 0.22));
      const op = fin * (1 - prog(host, t, 2.55, 0.25)) * gone;
      const a = easeInOut(prog(host, t, 1.32, 0.3));
      const b = easeInOut(prog(host, t, 1.92, 0.3));
      let dip = 0;
      for (const [bt] of INTRO) dip = Math.max(dip, bump(bt - 0.1, 0.24));
      const lift = HLIFT * (1 - dip) + 30 * (1 - fin) + 14 * (bump(1.32, 0.3) + bump(1.92, 0.3));
      return { u: a - b, lift, op };
    }
    // hint: fade in over ON, nudge, glide to OFF, nudge, fade out (no press, no bits)
    const fin = easeOut(prog(host, t, H0, 0.25));
    const op = fin * (1 - prog(host, t, H1 - 0.3, 0.3)) * gone;
    const u = easeInOut(prog(host, t, H0 + 0.85, 0.35));
    const lift = HLIFT + 30 * (1 - fin) - 14 * (bump(H0 + 0.35, 0.42) + bump(H0 + 1.25, 0.42)) + 12 * bump(H0 + 0.85, 0.35);
    return { u, lift, op };
  };

  const draw = (t: number) => {
    // intro fly-ins along diagonals
    gLaser.setAttribute("transform", fly(prog(host, t, 0, 0.8), 168, 420));
    gGuide.setAttribute("opacity", r1(prog(host, t, 0.15, 0.4)).toString());
    gEl.setAttribute("transform", fly(prog(host, t, 0.25, 0.8), -12, 520));
    const keyS = { on: 1, off: 1 };
    for (const k of ["on", "off"] as const) {
      const pk = prog(host, t, k === "on" ? 0.45 : 0.55, 0.6);
      let tp = -9;
      for (const b of bits) if (b.t <= t && b.on === (k === "on") && b.t > tp) tp = b.t - 0.1;
      const pr = prog(host, t, tp, 0.24);
      const s = 1 - 0.1 * Math.sin(Math.PI * pr);
      keyS[k] = s;
      const K = keys[k];
      const c = [K.x + KS / 2, keyY + KS / 2];
      keyG[k].setAttribute("transform", `${fly(pk, 58, 380)} translate(${c[0]} ${c[1]}) scale(${r1(s * 100) / 100}) translate(${-c[0]} ${-c[1]})`);
    }

    // hand cue: the press point follows the pulsing key face
    const hp = handPose(t);
    hand.setAttribute("opacity", hp.op.toFixed(2));
    if (hp.op > 0) {
      const c: Pt = [0, keyY + KS / 2];
      const P = (k: "on" | "off"): Pt => {
        const q = tipOf(k);
        c[0] = keys[k].x + KS / 2;
        return [c[0] + keyS[k] * (q[0] - c[0]), c[1] + keyS[k] * (q[1] - c[1])];
      };
      const p0 = P("on");
      const p1 = P("off");
      const x = lerp(p0[0], p1[0], hp.u) + hp.lift * Math.sin(HANG * D2R);
      const y = lerp(p0[1], p1[1], hp.u) - hp.lift * Math.cos(HANG * D2R);
      hand.setAttribute("transform", `translate(${r1(x)} ${r1(y)}) rotate(${HANG})`);
    }

    // voltage state: the latest bit that has started (bright = no voltage, dark = voltage on the signal bar)
    let v = 0;
    for (const b of bits) {
      if (b.t > t) continue;
      const p = easeInOut(prog(host, t, b.t - 0.18, 0.18));
      v = lerp(v, b.on ? 0 : 1, p);
    }
    const h = lerp(34, 54, v);
    sig.setAttribute("y", r1(ARM_B + 24).toString());
    sig.setAttribute("height", r1(h).toString());
    armT.setAttribute("d", polyD(zigzag(AX0, AX1, ARM_T, 50, 13, 0), false));
    armB.setAttribute("d", polyD(zigzag(AX0, AX1, ARM_B, 50, 13, 0.5 * v), false));

    // message squares: newest at the output, older ones pushed along the beam
    let d1 = "";
    let d0 = "";
    let acc = 0;
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      const p = easeOut(prog(host, t, b.t, SHIFT));
      if (b.t > t) continue;
      acc += p;
      const x = OUT_X + 58 + PITCH * (acc - 1);
      if (x > 1300) continue;
      const s = SQ * (0.35 + 0.65 * p);
      const q = `M${r1(x - s / 2)} ${r1(MID - s / 2)}h${r1(s)}v${r1(s)}h${r1(-s)}Z`;
      if (b.on) d1 += q;
      else d0 += q;
    }
    gMsg.replaceChildren();
    if (d0) el("path", { d: d0, fill: PAL.black }, gMsg);
    if (d1) red("path", { d: d1 }, gMsg);
  };

  return {
    settle: H1,
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

// The four page scenes of the Industry book (Isotype counting book): one pictogram = one fixed unit,
// pictograms appear one at a time so a child can count along; tap feedback never scales a pictogram.
import type { Scene, SceneHost } from "../../types";
import { ARROW, CHIP, CRYSTAL, GLOBE, PHONE, POWDER, RACK, RACK_LEDS, ROCK, SATELLITE, TOWER, WAFER, WIFI, boule, filter } from "./glyphs";
import { PAL, clamp01, easeOut, el, hop, makeStage, r1, seg, setPop, type Attrs, type Stage } from "./kit";
import { letter, measure } from "./letters";

export const TEXT = [
  "Rock to powder. Powder to crystal. Crystal to wafer. Wafer to chip.",
  "Count the rocks. Nearly all come from Brazil!",
  "Phones pick radio with tiny filters. Many sit on this crystal or its sister.",
  "Crystal chips help light carry the internet to big computers. Now you know the industry!",
];

const XH = 34;
const LH = 76;
const LAST_BASE = 928;

/** Greedy wrap to maxW logical units at x-height XH. */
function wrap(text: string, maxW = 900): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    const t = cur ? cur + " " + w : w;
    if (cur && measure(t) * XH > maxW) {
      out.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

/** The page text, bottom-aligned in a fixed band; returns the top of the band. */
function pageText(st: Stage, text: string, lines = wrap(text)): number {
  if (lines.join(" ") !== text) lines = wrap(text);
  const base = LAST_BASE - (lines.length - 1) * LH;
  letter(st.svg, { x: 500, base, xh: XH, lineH: LH, lines, attrs: { "aria-hidden": "true" } });
  return base - 1.45 * XH;
}

/** Shared tap plumbing: maps a pointerdown to logical coordinates and the loop clock. */
function onTap(st: Stage, fn: (x: number, y: number) => void) {
  const h = (e: PointerEvent) => {
    const [x, y] = st.toLogical(e);
    fn(x, y);
  };
  st.svg.addEventListener("pointerdown", h);
  return () => st.svg.removeEventListener("pointerdown", h);
}

const inBox = (x: number, y: number, bx: number, by: number, s: number, pad = 10) => x >= bx - pad && x <= bx + s + pad && y >= by - pad && y <= by + s + pad;

// ---------------------------------------------------------------------------------------------
// p1: rock -> powder -> crystal -> wafer -> chip along an arch; tap: a hop runs down the chain.

function rockToChip(host: SceneHost): Scene {
  const st = makeStage(host);
  const ids = [st.sym("rock", ROCK), st.sym("powder", POWDER), st.sym("crystal", CRYSTAL), st.sym("wafer", WAFER), st.sym("chip", CHIP)];
  const arrowId = st.sym("arrow", ARROW);
  pageText(st, TEXT[0], ["Rock to powder.", "Powder to crystal.", "Crystal to wafer.", "Wafer to chip."]);

  const S = 204;
  const C = [500, 600];
  const RA = 388;
  const ang = [167, 127, 90, 53, 13];
  const at = (a: number, r = RA): [number, number] => [C[0] + r * Math.cos((a * Math.PI) / 180), C[1] - r * Math.sin((a * Math.PI) / 180)];
  const arrows = [147, 108.5, 71.5, 33].map((a) => {
    const [x, y] = at(a, RA - 40);
    const rot = (Math.atan2(Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)) * 180) / Math.PI;
    const g = el("g", { opacity: 0 }, st.art);
    const inner = el("g", { transform: `translate(${r1(x)} ${r1(y)}) rotate(${r1(rot)})` }, g);
    el("use", { href: `#${arrowId}`, x: -29, y: -29, width: 58, height: 58 }, inner);
    return g;
  });
  const items = ang.map((a, i) => {
    const [cx, cy] = at(a);
    const x = cx - S / 2;
    const y = cy - S / 2;
    return { ...st.use(st.art, ids[i], x, y, S), x, y };
  });

  const T0 = 0.15;
  const DT = 0.46;
  const END = T0 + DT * 4 + 0.5;
  let lastT = 0;
  let tap = -1;
  const off = onTap(st, (_x, y) => {
    if (y > 630) return;
    tap = lastT;
    host.wake(2);
  });

  const draw = (t: number, intro: number) => {
    items.forEach((it, i) => {
      const h = tap >= 0 ? hop(t, tap + i * 0.17, 34) : 0;
      setPop(it.g, intro, T0 + i * DT, h);
    });
    arrows.forEach((g, i) => g.setAttribute("opacity", String(r1(seg(intro, T0 + i * DT + 0.26, T0 + i * DT + 0.46) * 100) / 100)));
  };

  return {
    settle: END,
    frame(t) {
      lastT = t;
      draw(host.reduced ? -1 : t, host.reduced ? END : t);
    },
    destroy() {
      off();
      st.destroy();
    },
  };
}

// ---------------------------------------------------------------------------------------------
// p2: 14 rocks, one rock = 8,000 t niobium (USGS 2025e): 13 from Brazil, 1 from everywhere else.
// Tap a rock: it gets the next counting number.

function countRocks(host: SceneHost): Scene {
  const st = makeStage(host);
  const rockId = st.sym("rock", ROCK);
  const rockGold = st.sym("rockg", [[ROCK[0][0], PAL.gold]]);
  const plain = ROCK[0][0].slice(0, ROCK[0][0].indexOf("Z") + 1);
  const rockPlain = st.sym("rockp", [[plain, PAL.ink]]);
  const rockGoldPlain = st.sym("rockgp", [[plain, PAL.gold]]);
  pageText(st, TEXT[1], ["Count the rocks.", "Nearly all come", "from Brazil!"]);

  const S = 112;
  const P = 126;
  const X0 = 500 - (7 * P - (P - S)) / 2;
  letter(st.art, { x: X0, base: 108, xh: 24, lines: ["BRAZIL"], align: "left", fill: PAL.ink });
  letter(st.art, { x: X0, base: 470, xh: 24, lines: ["EVERYWHERE ELSE"], align: "left", fill: PAL.ink });
  el("rect", { x: X0, y: 410, width: 7 * P - (P - S), height: 5, fill: PAL.ink }, st.art);
  const cells: { x: number; y: number; id: string }[] = [];
  for (let i = 0; i < 13; i++) cells.push({ x: X0 + (i % 7) * P, y: 136 + Math.floor(i / 7) * 136, id: rockId });
  cells.push({ x: X0, y: 496, id: rockGold });
  const rocks = cells.map((c) => {
    const u = st.use(st.art, c.id, c.x, c.y, S);
    const num = el("g", {}, u.g);
    return { ...u, ...c, num, n: 0, hopT: -1 };
  });
  let count = 0;

  const T0 = 0.15;
  const DT = 0.16;
  const END = T0 + DT * 13 + 0.5;
  let lastT = 0;
  const off = onTap(st, (x, y) => {
    const r = rocks.find((k) => inBox(x, y, k.x, k.y, S, 8));
    if (!r) return;
    if (!r.n && count < rocks.length) {
      r.n = ++count;
      const s = String(r.n);
      const xh = 32;
      r.u.setAttribute("href", `#${r.id === rockGold ? rockGoldPlain : rockPlain}`);
      letter(r.num, { x: r.x + S * 0.53, base: r.y + S * 0.6 + 0.7 * xh, xh, lines: [s], fill: r.id === rockGold ? PAL.ink : PAL.paper });
    }
    r.hopT = lastT;
    host.wake(0.8);
  });

  return {
    settle: END,
    frame(t) {
      lastT = t;
      const intro = host.reduced ? END : t;
      rocks.forEach((r, i) => setPop(r.g, intro, T0 + i * DT, host.reduced ? 0 : hop(t, r.hopT, 26, 0.36)));
    },
    destroy() {
      off();
      st.destroy();
    },
  };
}

// ---------------------------------------------------------------------------------------------
// p3: three radios (Wi-Fi, satellite, tower) -> three filters in a phone; red crystal OR blue sister.
// Tap a radio (or its filter): its wave runs into the phone and that filter lights up.

function inYourPhone(host: SceneHost): Scene {
  const st = makeStage(host);
  const src = [st.sym("wifi", WIFI), st.sym("sat", SATELLITE), st.sym("tower", TOWER)];
  const fil = st.sym("filter", filter(PAL.ink, PAL.paper));
  const filLit = st.sym("filterlit", filter(PAL.ink, PAL.gold));
  const phone = st.sym("phone", PHONE);
  const ln = st.sym("ln", CRYSTAL);
  const lt = st.sym("lt", boule(PAL.blue));
  pageText(st, TEXT[2], ["Phones pick radio", "with tiny filters.", "Many sit on this crystal", "or its sister."]);

  // phone glyph box at (282, 32), 500 units: body x 392..672, y 52..512
  const PS = 500;
  const PX = 282;
  const PY = 32;
  st.use(st.art, phone, PX, PY, PS);
  const rowY = [176, 296, 416];
  const FS = 132;
  const FX = PX + PS / 2 - FS / 2;
  const SS = 124;
  const SX = 48;
  const waves = rowY.map((cy) => {
    const p = el("path", { fill: "none", stroke: PAL.gold, "stroke-width": 11, "stroke-linecap": "butt", "stroke-linejoin": "round" }, st.art);
    let d = "";
    const x0 = SX + SS + 14;
    const x1 = PX + PS * 0.22 - 10;
    for (let x = x0; x <= x1; x += 4) d += (x === x0 ? "M" : "L") + r1(x) + " " + r1(cy + 17 * Math.sin(((x - x0) / 46) * Math.PI));
    p.setAttribute("d", d);
    const len = x1 - x0;
    p.setAttribute("stroke-dasharray", `${r1(len * 1.6)} ${r1(len * 1.6)}`);
    return { p, len: len * 1.6 };
  });
  const sources = rowY.map((cy, i) => ({ ...st.use(st.art, src[i], SX, cy - SS / 2, SS), x: SX, y: cy - SS / 2 }));
  const filters = rowY.map((cy) => {
    const g = el("g", {}, st.art);
    const a = el("use", { href: `#${fil}`, x: FX, y: cy - FS / 2, width: FS, height: FS }, g);
    const b = el("use", { href: `#${filLit}`, x: FX, y: cy - FS / 2, width: FS, height: FS, opacity: 0 }, g);
    return { g, a, b, x: FX, y: cy - FS / 2 };
  });
  // the crystal and its sister, right of the phone
  const CS = 146;
  const CX = 800;
  const cr = [st.use(st.art, ln, CX, 96, CS), st.use(st.art, lt, CX, 340, CS)];
  const orL = letter(st.art, { x: CX + CS / 2, base: 300, xh: 26, lines: ["OR"], fill: PAL.ink });

  const T0 = 0.15;
  const END = 2.9;
  const tapT = [-1, -1, -1];
  let lastT = 0;
  const off = onTap(st, (x, y) => {
    let k = sources.findIndex((s) => inBox(x, y, s.x, s.y, SS, 14));
    if (k < 0) k = filters.findIndex((f) => inBox(x, y, f.x, f.y, FS, 4) && Math.abs(y - (f.y + FS / 2)) < 50);
    if (k < 0) return;
    tapT[k] = lastT;
    host.wake(1.4);
  });

  const draw = (t: number, intro: number) => {
    for (let i = 0; i < 3; i++) {
      // intro: radio i pops, its wave runs, its filter pops and blinks
      const ts = T0 + i * 0.55;
      setPop(sources[i].g, intro, ts, tapT[i] >= 0 ? hop(t, tapT[i], 22, 0.36) : 0);
      const wIntro = easeOut(seg(intro, ts + 0.2, ts + 0.7));
      const wTap = tapT[i] >= 0 ? easeOut(seg(t, tapT[i], tapT[i] + 0.5)) : 1;
      const w = Math.min(wIntro, tapT[i] >= 0 && t >= tapT[i] ? wTap : wIntro);
      waves[i].p.setAttribute("stroke-dashoffset", String(r1(waves[i].len * (1 - w * 0.625))));
      setPop(filters[i].g, intro, ts + 0.55);
      // a filter lights up when its wave arrives; a tap re-sends the wave and the filter lights again
      const on = tapT[i] >= 0 && t >= tapT[i] ? seg(t, tapT[i] + 0.4, tapT[i] + 0.55) : seg(intro, ts + 0.75, ts + 0.95);
      filters[i].b.setAttribute("opacity", String(r1(on * 100) / 100));
    }
    const tc = T0 + 3 * 0.55 + 0.25;
    setPop(cr[0].g, intro, tc);
    setPop(cr[1].g, intro, tc + 0.3);
    orL.p.setAttribute("opacity", String(r1(clamp01((intro - tc - 0.15) / 0.3) * 100) / 100));
  };

  return {
    settle: END,
    frame(t) {
      lastT = t;
      if (host.reduced) {
        tapT.fill(-1);
        return draw(END, END);
      }
      draw(t, t);
    },
    destroy() {
      off();
      st.destroy();
    },
  };
}

// ---------------------------------------------------------------------------------------------
// p4: the transmitter. A rack sends: a blue electrical wire carries pulses up into its red crystal chip, the
// chip flashes, and light runs out along the ink fibre into the internet (globe). Tap a rack or chip: that
// column sends again; tap the globe: all four send. Electrical = blue, light = gold; the wire changes at the chip.

function internet(host: SceneHost): Scene {
  const st = makeStage(host);
  const globe = st.sym("globe", GLOBE);
  const rack = st.sym("rack", RACK);
  const leds = st.sym("leds", RACK_LEDS(PAL.gold));
  const chip = st.sym("chip", CHIP);
  pageText(st, TEXT[3], ["Crystal chips help light", "carry the internet", "to big computers.", "Now you know the industry!"]);

  const GS = 170;
  const GX = 36;
  const GY = 52;
  const TRUNK = GY + GS / 2;
  const RS = 182;
  const RY = 384;
  const CS = 96;
  const CY = 216;
  const cols = [318, 500, 682, 864];
  const line = (d: string, stroke: string, w: number, extra: Attrs = {}) =>
    el("path", { d, fill: "none", stroke, "stroke-width": w, "stroke-linejoin": "miter", ...extra }, st.art);
  // electrical: rack top -> chip (ends inside the chip body); optical: chip -> up the drop -> trunk -> globe
  const routes = cols.map((cx) => {
    const eD = `M${cx} ${RY + 10}V${CY + CS * 0.6}`;
    const eLen = RY + 10 - (CY + CS * 0.6);
    const oD = `M${cx} ${CY + CS * 0.4}V${TRUNK}H${GX + GS - 6}`;
    const oLen = CY + CS * 0.4 - TRUNK + (cx - (GX + GS - 6));
    line(eD, PAL.blue, 8);
    line(oD, PAL.ink, 8);
    const pulse = line(eD, PAL.blue, 16, { opacity: 0 });
    const light = line(oD, PAL.gold, 16, { opacity: 0 });
    return { pulse, light, eLen, oLen };
  });
  st.use(st.art, globe, GX, GY, GS);
  const chips = cols.map((cx) => ({ ...st.use(st.art, chip, cx - CS / 2, CY, CS), x: cx - CS / 2 }));
  // conversion cue: a gold outline round the chip body flashes (the pictogram itself never scales)
  const rings = chips.map((c) => el("rect", { x: r1(c.x + CS * 0.14 - 9), y: r1(CY + CS * 0.16 - 9), width: r1(CS * 0.72 + 18), height: r1(CS * 0.68 + 18), fill: "none", stroke: PAL.gold, "stroke-width": 7, opacity: 0 }, c.g));
  const racks = cols.map((cx) => {
    const u = st.use(st.art, rack, cx - RS / 2, RY, RS);
    const l = el("use", { href: `#${leds}`, x: cx - RS / 2, y: RY, width: RS, height: RS, opacity: 0 }, u.g);
    return { ...u, l, x: cx - RS / 2 };
  });
  el("rect", { x: 200, y: RY + RS - 2, width: 760, height: 6, fill: PAL.ink }, st.art);

  const T0 = 0.15;
  const DT = 0.3;
  const TS = T0 + DT * 4 + 0.15; // first rack starts sending
  const STAG = 0.12;
  // per column, relative to its send time: LEDs on at 0; electrical run; chip flash; optical run
  const E0 = 0.1;
  const E1 = 0.5;
  const F1 = 0.85;
  const O0 = 0.55;
  const O1 = 1.45;
  const END = TS + 3 * STAG + O1 + 0.5;
  const tapT = [-1, -1, -1, -1];
  let lastT = 0;
  const off = onTap(st, (x, y) => {
    let k = racks.findIndex((r) => inBox(x, y, r.x + RS * 0.15, RY, RS * 0.7, 16));
    if (k < 0) k = chips.findIndex((c) => inBox(x, y, c.x, CY, CS, 14));
    if (k >= 0) {
      tapT[k] = lastT;
      host.wake(O1 + 0.4);
    } else if (y < TRUNK + 60 && x < GX + GS + 20) {
      for (let i = 0; i < 4; i++) tapT[i] = lastT + i * STAG;
      host.wake(3 * STAG + O1 + 0.4);
    }
  });

  const draw = (t: number, intro: number) => {
    for (let i = 0; i < 4; i++) {
      const r = routes[i];
      const tt = tapT[i];
      const tapRun = tt >= 0 && t >= tt && t < tt + O1 + 0.2;
      const s0 = tapRun ? tt : TS + i * STAG;
      const c = (tapRun ? t : intro) - s0;
      const xe = seg(c, E0, E1);
      const xo = seg(c, O0, O1);
      // each dash train is anchored to its front, so the dashes travel rack -> chip -> globe
      r.pulse.setAttribute("opacity", xe > 0 ? "1" : "0");
      r.pulse.setAttribute("stroke-dasharray", train(xe * r.eLen, r.eLen, 12, 14));
      r.light.setAttribute("opacity", xo > 0 ? "1" : "0");
      r.light.setAttribute("stroke-dasharray", train(xo * r.oLen, r.oLen, 22, 26));
      const f = c >= E1 && c <= F1 ? Math.sin(((c - E1) / (F1 - E1)) * Math.PI) : 0;
      rings[i].setAttribute("opacity", String(r1(f * 100) / 100));
      setPop(chips[i].g, intro, T0 + i * DT + 0.12);
      setPop(racks[i].g, intro, T0 + i * DT, tt >= 0 ? hop(t, tt, 20, 0.36) : 0);
      racks[i].l.setAttribute("opacity", c >= (tapRun ? 0.08 : 0) ? "1" : "0");
    }
  };

  return {
    settle: END,
    frame(t) {
      lastT = t;
      if (host.reduced) {
        tapT.fill(-1);
        return draw(END, END);
      }
      draw(t, t);
    },
    destroy() {
      off();
      st.destroy();
    },
  };
}

/** Dash pattern for a path of length `len` drawn up to `front`, with an on/off train whose head sits at the front. */
function train(front: number, len: number, on: number, gap: number): string {
  const back: number[] = [];
  let s = 0;
  for (let k = 0; s < front; k++) {
    const w = Math.min(k % 2 ? gap : on, front - s);
    back.push(w);
    s += w;
  }
  const out = back.reverse();
  if (out.length % 2 === 0) out.unshift(0); // the array must start with a dash; the head (last) is a dash
  out.push(len + 100);
  return out.map(r1).join(" ");
}

export const pages = [rockToChip, countRocks, inYourPhone, internet];

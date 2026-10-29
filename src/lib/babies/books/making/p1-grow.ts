// Making p1: Czochralski growth as a manual plate. (1) white powder goes into the pot, (2) heat melts it,
// (3) a seed on a rod dips into the melt, turns, and rises while the boule grows from the melt surface.
// Drag up: pull the crystal further. Tap: replay.
import type { Scene, SceneHost } from "../../types";
import {
  ACC_T,
  INK,
  Iso,
  DARK,
  MID,
  SIDE,
  TOP,
  bigArrow,
  box,
  easeInOut,
  easeOut,
  el,
  heat,
  hull,
  layer,
  line,
  makeStage,
  pathArrow,
  poly,
  ring,
  seg,
  stepDisc,
  type Pt,
} from "./kit";

const END = 3.0;
const RC = 165; // crucible outer radius (world)
const RI = 150; // inner radius
const HC = 95; // crucible height
const ZM = 68; // melt level
const LMAX = 400; // full pull length
const L_INTRO = 290;

/** Boule radius at distance s below the seed: thin neck, rounded shoulder, straight body. */
function rad(s: number): number {
  if (s < 24) return 10;
  if (s < 140) return 10 + 72 * Math.sin(((s - 24) / 116) * (Math.PI / 2));
  return 82;
}

export function growScene(host: SceneHost, text: string): Scene {
  const st = makeStage(host, text, ["Melt powder in a hot pot.", "Dip a seed. Turn, pull slowly.", "A crystal grows!"]);
  const iso = new Iso(560, 650, 0.95);
  const A = 1.2247 * iso.k; // screen semi-axes of a horizontal circle, per unit radius
  const B = 0.7071 * iso.k;
  const [cx, cyM] = iso.p(0, 0, ZM);

  // ---- static: inset powder heap (step 1) ----
  const stat = el("g", {}, st.art);
  const ins = new Iso(185, 300, 0.8);
  const heap = (g: Element, io: Iso, z0: number, r: number, h: number, seed: number) => {
    const base = ring(io, [0, 0, z0], r, "z", 40);
    poly(g, hull(base.concat([io.p(0, 0, z0 + h)])), SIDE);
    const rr = host.rng(seed);
    let d = "";
    for (let i = 0; i < 26; i++) {
      const f = rr();
      const a = rr() * Math.PI * 2;
      const rad0 = r * Math.sqrt(rr()) * 0.85;
      const hz = z0 + h * (1 - rad0 / r) * f * 0.9;
      const p = io.p(Math.cos(a) * rad0 * (1 - f * 0.3), Math.sin(a) * rad0 * (1 - f * 0.3), hz);
      d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}h0.1`;
    }
    el("path", { d, stroke: DARK, "stroke-width": 8, "stroke-linecap": "round" }, g);
  };
  box(stat, ins, [-100, -100, -12], [200, 200, 12]);
  heap(stat, ins, 0, 78, 150, 7);
  stepDisc(stat, 70, 110, 1);

  // ---- static: crucible body, rim, interior back ----
  const ring0 = ring(iso, [0, 0, 0], RC, "z", 56);
  const ringT = ring(iso, [0, 0, HC], RC, "z", 56);
  const inner = ring(iso, [0, 0, HC], RI, "z", 56);
  poly(stat, hull(ring0.concat(ringT)), SIDE);
  poly(stat, ringT, TOP);
  poly(stat, inner, "#EEEEEE");
  // front arc of the opening (lower half on screen): everything inside the pot is clipped above it
  const [ox, oy] = iso.p(0, 0, HC);
  const front: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const th = (i / 40) * Math.PI;
    front.push([ox + A * RI * Math.cos(th), oy + B * RI * Math.sin(th)]);
  }
  const clipId = st.id("in");
  const cp = el("clipPath", { id: clipId }, stat);
  el("path", { d: `M${ox + A * RI} ${oy}` + front.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("") + `L${ox - A * RI} -100H${ox + A * RI}Z` }, cp);

  // dynamic layers: heat (behind), inside-the-pot (clipped), front rim, rod/arrows
  const heatL = layer(st.art);
  const inside = layer(el("g", { "clip-path": `url(#${clipId})` }, st.art));
  const rimG = el("g", {}, st.art);
  // front half of the rim annulus drawn over the interior
  const fo: Pt[] = [];
  const fi: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const th = (i / 40) * Math.PI;
    fo.push([ox + A * RC * Math.cos(th), oy + B * RC * Math.sin(th)]);
    fi.push([ox + A * RI * Math.cos(th), oy + B * RI * Math.sin(th)]);
  }
  const rimFront = fo.concat(fi.slice().reverse());
  poly(rimG, rimFront, TOP);
  const top = layer(st.art);

  // step 3 arrow and disc (static)
  const s3 = el("g", {}, st.art);
  bigArrow(s3, [820, 400], [820, 225], 34, "#fff");
  stepDisc(s3, 900, 300, 3);
  stepDisc(s3, 235, 610, 2);

  // ---- interaction state ----
  let lastT = 0;
  let replay = -1;
  let pulled = L_INTRO; // length after drags (>= L_INTRO)
  let drag: { y: number; L: number; moved: boolean } | null = null;
  const onDown = (e: PointerEvent) => {
    drag = { y: st.pos(e)[1], L: pulled, moved: false };
    st.svg.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const dy = drag.y - st.pos(e)[1];
    if (Math.abs(dy) > 12) drag.moved = true;
    if (!drag.moved) return;
    const L = host.reduced ? LMAX : Math.min(LMAX, Math.max(pulled, drag.L + dy * 0.8));
    if (L !== pulled) {
      pulled = L;
      host.wake(0.4);
    }
  };
  const onUp = () => {
    if (drag && !drag.moved) {
      // tap: replay the plate from the start
      pulled = L_INTRO;
      replay = host.reduced ? -1 : lastT;
      host.wake(END + 0.2);
    }
    drag = null;
  };
  st.svg.addEventListener("pointerdown", onDown);
  st.svg.addEventListener("pointermove", onMove);
  st.svg.addEventListener("pointerup", onUp);
  st.svg.addEventListener("pointercancel", onUp);

  const draw = (tau: number) => {
    const melt = easeInOut(seg(tau, 0.25, 1.0));
    const dip = easeOut(seg(tau, 0.8, 1.3));
    const grow = easeInOut(seg(tau, 1.3, END));
    const L = tau < END ? L_INTRO * grow : pulled;
    const phase = (L / LMAX) * Math.PI * 5; // turns while it rises
    const hot = seg(tau, 0.2, 0.6);

    // heat squiggles beside the pot
    const hg = heatL.clear();
    if (hot > 0) {
      const ph = tau < END ? tau * 7 : 0;
      for (const [x, y, h] of [[300, 690, 130], [340, 735, 110], [780, 735, 110], [820, 690, 130]] as const) heat(hg, x, y, h * hot, ph, { opacity: hot.toFixed(2) });
    }

    // inside the pot: melt surface, powder heap, meniscus, boule
    const ig = inside.clear();
    const meltR = ring(iso, [0, 0, ZM], RI, "z", 56);
    poly(ig, meltR, "#FFFFFF");
    if (melt > 0) poly(ig, meltR, ACC_T, { opacity: melt.toFixed(2), stroke: "none" });
    if (melt < 1) {
      const h = 95 * (1 - melt);
      const base = ring(iso, [0, 0, ZM], 120 * (1 - 0.35 * melt), "z", 40);
      poly(ig, hull(base.concat([iso.p(0, 0, ZM + h)])), SIDE);
      let d = "";
      const rr = host.rng(9);
      for (let i = 0; i < 30; i++) {
        const a = rr() * Math.PI * 2;
        const q = rr();
        const rq = 110 * Math.sqrt(rr()) * (1 - 0.35 * melt);
        const p = iso.p(Math.cos(a) * rq, Math.sin(a) * rq, ZM + h * (1 - rq / 120) * q * 0.85);
        d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}h0.1`;
      }
      el("path", { d, stroke: MID, "stroke-width": 7, "stroke-linecap": "round", opacity: (1 - melt).toFixed(2) }, ig);
    }

    const tg = top.clear();
    // rod position: comes down during dip, then rises with the crystal
    const seedZ = ZM + L + (1 - dip) * 520;
    const showBoule = dip >= 1 && L > 0.5;
    if (showBoule) {
      const rb = rad(L);
      // meniscus ring on the melt
      const men = ring(iso, [0, 0, ZM], rb + 14, "z", 40);
      poly(ig, men, "#F2A88E", { "stroke-width": 2 });
      // boule silhouette: right side down, front of the bottom ellipse, left side up
      const n = 34;
      const R: Pt[] = [];
      const Lf: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const s = (i / n) * L;
        const y = iso.p(0, 0, ZM + L - s)[1];
        R.push([cx + A * rad(s), y]);
        Lf.push([cx - A * rad(s), y]);
      }
      const bot: Pt[] = [];
      for (let i = 1; i < 30; i++) {
        const th = (i / 30) * Math.PI;
        bot.push([cx + A * rb * Math.cos(th), cyM + B * rb * Math.sin(th)]);
      }
      const sil = R.concat(bot, Lf.reverse());
      {
        const g = tg;
        poly(g, sil, SIDE);
        // shaded right flank
        const sh: Pt[] = [];
        for (let i = 0; i <= n; i++) {
          const s = (i / n) * L;
          sh.push([cx + A * rad(s) * 0.55, iso.p(0, 0, ZM + L - s)[1] + B * rad(s) * 0.83]);
        }
        const shade = R.concat(bot.slice(0, 9), sh.reverse());
        poly(g, shade, "#EDEDED", { stroke: "none" });
        poly(g, sil, "none");
        // growth ridges that turn with the crystal
        for (let k = 0; k < 3; k++) {
          const ph = phase + (k * Math.PI * 2) / 3;
          const c = Math.cos(ph);
          const s0 = Math.sin(ph);
          if (c + s0 < 0.15) continue;
          const pts: Pt[] = [];
          for (let i = 0; i <= n; i++) {
            const s = Math.max(30, (i / n) * L);
            if (s > L) break;
            const r = rad(s);
            const [x, y] = iso.p(r * c, r * s0, ZM + L - s);
            pts.push([x, y]);
          }
          if (pts.length > 1) line(g, pts, { "stroke-width": 2.2 });
        }
        if (L > 150) {
          const zb = ZM + L - 140;
          const ring2: Pt[] = [];
          for (let i = 0; i <= 24; i++) {
            const th = (i / 24) * Math.PI;
            ring2.push([cx + A * 82 * Math.cos(th), iso.p(0, 0, zb)[1] + B * 82 * Math.sin(th)]);
          }
          line(g, ring2, { "stroke-width": 2.2 });
        }
      }
    }
    // the boule's foot sits inside the pot: redraw the rim's front over it
    if (showBoule) poly(tg, rimFront, TOP);

    // rod, seed holder and rotation arrow
    const yS = iso.p(0, 0, seedZ)[1];
    const yH = yS - 150;
    poly(tg, [[cx - 7, yS + 2], [cx + 7, yS + 2], [cx + 7, yH], [cx - 7, yH]], SIDE);
    if (!showBoule) {
      // bare seed
      poly(tg, [[cx - 12, yS + 26], [cx + 12, yS + 26], [cx + 12, yS], [cx - 12, yS]], TOP);
    }
    box(tg, iso, [-38, -38, seedZ + 150], [76, 76, 46]);
    if (dip >= 1) {
      const yr = yS - 70;
      const pts: Pt[] = [];
      for (let i = 0; i <= 30; i++) {
        const th = Math.PI * (0.05 + (i / 30) * 1.15);
        pts.push([cx + A * 52 * Math.cos(th), yr + B * 52 * Math.sin(th)]);
      }
      pathArrow(tg, pts.reverse(), INK, 6, 24);
    }
    // step 1 pour arrow (inset -> pot)
    pathArrow(tg, [[300, 250], [372, 240], [408, 300], [415, 430]], INK, 7, 28, easeOut(seg(tau, 0, 0.5)));
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
      st.svg.removeEventListener("pointerdown", onDown);
      st.svg.removeEventListener("pointermove", onMove);
      st.svg.removeEventListener("pointerup", onUp);
      st.svg.removeEventListener("pointercancel", onUp);
      st.destroy();
    },
  };
}

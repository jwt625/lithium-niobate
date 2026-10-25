// VISUAL chapter doors (port of mockup/visual.js ART + initDoors): procedural art per chapter (R12 sec. 6), painted at
// init; 600 ms signature motion on hover or focus, effects only. Geometry stays true; the style changes rendering only.
import { CHRONOLOGY as EV, yearOf } from "$lib/content/chronology";
import { renderConoscope } from "../conoscope.ts";
import { Disposer, cssVar, dpr, fxOn, qa } from "../dom.ts";
import type { Part } from "./lifecycle.ts";

type G = CanvasRenderingContext2D;
interface Pal { ink0: string; ink1: string; ink2: string; line: string; line2: string; text: string; text2: string; text3: string; au: string; l532: string; ir1550: string; nb: string; ln: string }
const ease = (t: number): number => 1 - (1 - t) ** 3;
const palette = (): Pal => ({
  ink0: cssVar("--v-ink0"), ink1: cssVar("--v-ink1"), ink2: cssVar("--v-ink2"), line: cssVar("--v-line"), line2: cssVar("--v-line2"),
  text: cssVar("--v-text"), text2: cssVar("--v-text2"), text3: cssVar("--v-text3"), au: cssVar("--v-au"), l532: cssVar("--v-l532"),
  ir1550: cssVar("--v-ir1550"), nb: cssVar("--nb"), ln: cssVar("--v-ln"),
});
const conoImg: Record<string, HTMLCanvasElement> = {};
function conoSprite(E: number): HTMLCanvasElement {
  const key = `${E}`;
  if (conoImg[key]) return conoImg[key];
  const c = document.createElement("canvas"); c.width = c.height = 220;
  renderConoscope(c.getContext("2d") as G, 220, { thicknessMm: 0.6, fieldKVmm: E, fieldDir: "x", white: true, mono: false, NA: 0.55 });
  return (conoImg[key] = c);
}

const ART: Record<string, (g: G, w: number, h: number, t: number, C: Pal) => void> = {
  crystal(g, w, h, t, C) { // Gothic tracery from the 3m stereogram; octahedra column Nb, empty, Li along +c
    const cx = w * 0.38, cy = h * 0.5, R = h * 0.38, rot = (ease(t) * 2 * Math.PI) / 3;
    g.lineWidth = 1.2; g.strokeStyle = C.text3; g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.stroke();
    g.beginPath(); g.arc(cx, cy, R * 1.06, 0, 2 * Math.PI); g.strokeStyle = C.line2; g.stroke();
    for (let k = 0; k < 3; k++) {
      const a = Math.PI / 2 + (k * 2 * Math.PI) / 3 + rot;
      g.strokeStyle = C.au; g.lineWidth = 1.6; g.beginPath(); g.arc(cx + R * 0.45 * Math.cos(a), cy - R * 0.45 * Math.sin(a), R * 0.45, 0, 2 * Math.PI); g.stroke();
      g.strokeStyle = C.line2; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - R * Math.cos(a), cy + R * Math.sin(a)); g.lineTo(cx + R * Math.cos(a), cy - R * Math.sin(a)); g.stroke();
    }
    g.fillStyle = C.text; g.beginPath();
    for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + (k * 2 * Math.PI) / 3 + rot, r = R * 0.1; if (k) g.lineTo(cx + r * Math.cos(a), cy - r * Math.sin(a)); else g.moveTo(cx + r * Math.cos(a), cy - r * Math.sin(a)); }
    g.fill();
    const s = h * 0.085, x = w * 0.8;
    ["Nb", "empty", "Li", "Nb", "empty"].forEach((kd, k) => {
      const y = h * 0.86 - k * s * 2.05;
      g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath();
      if (kd === "empty") { g.setLineDash([3, 2.5]); g.strokeStyle = C.text3; g.lineWidth = 1.2; g.stroke(); g.setLineDash([]); }
      else { g.fillStyle = kd === "Nb" ? C.nb : C.au; g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; }
    });
    g.strokeStyle = C.text3; g.lineWidth = 1; g.beginPath(); g.moveTo(x + s * 1.8, h * 0.9); g.lineTo(x + s * 1.8, h * 0.1); g.lineTo(x + s * 1.8 - 4, h * 0.1 + 7); g.moveTo(x + s * 1.8, h * 0.1); g.lineTo(x + s * 1.8 + 4, h * 0.1 + 7); g.stroke();
  },
  light(g, w, h, t) { // live white-light conoscope; hover applies E = 3 kV/mm along x
    const d = h * 0.86, x = (w - d) / 2, y = (h - d) / 2;
    g.save(); g.beginPath(); g.arc(w / 2, h / 2, d / 2, 0, 2 * Math.PI); g.clip();
    g.drawImage(conoSprite(0), x, y, d, d);
    if (t > 0) { g.globalAlpha = ease(t); g.drawImage(conoSprite(3), x, y, d, d); g.globalAlpha = 1; }
    g.restore();
  },
  sound(g, w, h, t, C) { // ukiyo-e ripple lines launched from IDT fingers
    const p = h * 0.11, x0 = w * 0.07, top = h * 0.2, bot = h * 0.8;
    g.fillStyle = C.au; g.fillRect(x0, top - 6, p * 4.2, 5); g.fillRect(x0, bot + 1, p * 4.2, 5);
    for (let k = 0; k < 9; k++) { const x = x0 + 2 + k * p * 0.5; g.fillRect(x, k % 2 ? top + h * 0.12 : top, 2.5, bot - top - h * 0.12); }
    const lam = p, shift = ease(t) * lam;
    for (let k = 0; k < 14; k++) {
      const xc = x0 + p * 4.8 + k * lam + shift;
      if (xc > w - 6) break;
      g.strokeStyle = C.text2; g.globalAlpha = Math.max(0.12, 0.9 - k * 0.06); g.lineWidth = 1.5; g.beginPath();
      for (let y = top; y <= bot; y += 3) { const xx = xc + Math.sin((y / h) * 9 + k * 0.6) * 2.4; if (y === top) g.moveTo(xx, y); else g.lineTo(xx, y); }
      g.stroke(); g.beginPath(); g.arc(xc + 4, top + 3, 4, Math.PI, 1.8 * Math.PI); g.stroke();
    }
    g.globalAlpha = 1;
  },
  quirks(g, w, h, t, C) { // kintsugi crack in Au over a photorefractive trace
    g.lineCap = "round";
    const tr = (lw: number, a: number): void => { g.strokeStyle = C.l532; g.globalAlpha = a; g.lineWidth = lw; g.beginPath(); for (let i = 0; i <= 60; i++) { const x = w * 0.08 + (i / 60) * w * 0.84, y = h * (0.62 + 0.18 * Math.sin(i / 9) - 0.1 * Math.sin(i / 3.7)); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); };
    tr(14, 0.08); tr(5, 0.16); tr(1.5, 0.6); g.globalAlpha = 1;
    let s = 7;
    const rnd = (): number => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
    const path: [number, number][] = [[w * 0.18, 0]];
    let x = w * 0.18, y = 0;
    while (y < h) { x += (rnd() - 0.45) * w * 0.09; y += h * (0.06 + rnd() * 0.06); path.push([x, y]); }
    const draw = (pts: [number, number][], col: string, lw: number, frac: number): void => { const n = Math.max(1, Math.floor((pts.length - 1) * frac)); g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.slice(0, n + 1).forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke(); };
    const branch: [number, number][] = path.slice(4, 5).concat([[path[4][0] + w * 0.12, path[4][1] + h * 0.1], [path[4][0] + w * 0.22, path[4][1] + h * 0.08], [path[4][0] + w * 0.3, path[4][1] + h * 0.18]]);
    const f = t > 0 ? ease(t) : 1;
    draw(path, C.line2, 2.6, 1); draw(branch, C.line2, 2, 1);
    draw(path, C.au, 2.6, f); draw(branch, C.au, 2, f);
  },
  making(g, w, h, t, C) { // engraving of a Czochralski boule on its seed above the melt
    const cx = w * 0.5, lift = ease(t) * h * 0.06, top = h * 0.14 - lift, bw = w * 0.13;
    const sil = new Path2D();
    sil.moveTo(cx - 3, top); sil.lineTo(cx + 3, top); sil.lineTo(cx + 3, top + h * 0.08); sil.lineTo(cx + bw, top + h * 0.2); sil.lineTo(cx + bw, top + h * 0.56); sil.lineTo(cx + bw * 0.6, top + h * 0.64); sil.lineTo(cx - bw * 0.6, top + h * 0.64); sil.lineTo(cx - bw, top + h * 0.56); sil.lineTo(cx - bw, top + h * 0.2); sil.lineTo(cx - 3, top + h * 0.08); sil.closePath();
    g.save(); g.clip(sil); g.strokeStyle = C.text2; g.lineWidth = 1;
    for (let y = top; y < top + h * 0.66; y += 3) { g.beginPath(); g.moveTo(cx - bw, y); g.lineTo(cx + bw, y); g.stroke(); }
    g.strokeStyle = C.text3;
    for (let x = cx + bw * 0.2; x < cx + bw; x += 2.2 + (cx + bw - x) * 0.05) { g.beginPath(); g.moveTo(x, top); g.lineTo(x, top + h * 0.7); g.stroke(); }
    g.restore(); g.strokeStyle = C.text; g.lineWidth = 1.2; g.stroke(sil);
    g.strokeStyle = C.text2; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, top); g.stroke();
    const my = h * 0.84; g.strokeStyle = C.au; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - w * 0.3, my); g.lineTo(cx + w * 0.3, my); g.stroke();
    g.strokeStyle = C.text3; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx - w * 0.32, my - h * 0.06); g.lineTo(cx - w * 0.32, h * 0.95); g.lineTo(cx + w * 0.32, h * 0.95); g.lineTo(cx + w * 0.32, my - h * 0.06); g.stroke();
    g.strokeStyle = C.au; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(cx - bw * 0.6, top + h * 0.64); g.quadraticCurveTo(cx, my + 2, cx + bw * 0.6, top + h * 0.64); g.stroke(); g.globalAlpha = 1;
  },
  devices(g, w, h, t, C) { // MZI with Au G-S-G electrodes; arm phases shift in opposite directions on hover
    const y0 = h * 0.5, ya = h * 0.36, yb = h * 0.64, x1 = w * 0.22, x2 = w * 0.78;
    g.fillStyle = C.au; g.globalAlpha = 0.8; g.fillRect(x1, h * 0.12, x2 - x1, ya - h * 0.05 - h * 0.12); g.fillRect(x1, ya + h * 0.05, x2 - x1, yb - ya - h * 0.1); g.fillRect(x1, yb + h * 0.05, x2 - x1, h * 0.88 - yb - h * 0.05); g.globalAlpha = 1;
    g.strokeStyle = C.ir1550; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath();
    g.moveTo(0, y0); g.lineTo(w * 0.1, y0); g.bezierCurveTo(w * 0.16, y0, w * 0.16, ya, x1, ya); g.lineTo(x2, ya); g.bezierCurveTo(w * 0.84, ya, w * 0.84, y0, w * 0.9, y0); g.lineTo(w, y0);
    g.moveTo(w * 0.1, y0); g.bezierCurveTo(w * 0.16, y0, w * 0.16, yb, x1, yb); g.lineTo(x2, yb); g.bezierCurveTo(w * 0.84, yb, w * 0.84, y0, w * 0.9, y0); g.stroke(); g.setLineDash([]);
    const sp = w * 0.04, off = ease(t) * sp * 0.5;
    g.strokeStyle = C.ir1550; g.lineWidth = 1.5;
    for (let x = x1 + sp / 2; x < x2; x += sp) { ([[ya, off], [yb, -off]] as [number, number][]).forEach(([yy, o]) => { const xx = x + o; if (xx > x1 && xx < x2) { g.beginPath(); g.moveTo(xx, yy - 5); g.lineTo(xx, yy + 5); g.stroke(); } }); }
  },
  history(g, w, h, t, C) { // ruler 1945..2025 with the ten chronology events
    const X = (y: number): number => w * 0.06 + ((y - 1945) / 80) * w * 0.88, ay = h * 0.48;
    g.strokeStyle = C.text3; g.lineWidth = 1; g.beginPath(); g.moveTo(X(1945), ay); g.lineTo(X(2025), ay); g.stroke();
    g.fillStyle = C.text3; g.font = `500 ${Math.round(h * 0.075)}px Inter, sans-serif`; g.textAlign = "center";
    for (let y = 1945; y <= 2025; y += 5) { const big = y % 20 === 10; g.beginPath(); g.moveTo(X(y), ay); g.lineTo(X(y), ay + (big ? 9 : 4)); g.stroke(); if (big) g.fillText(String(y), X(y), ay + 10 + h * 0.08); }
    EV.forEach((e, k) => {
      const x = X(yearOf(e.date)), lane = k === 2 || k === 4 ? 1 : 0, y = ay - h * (0.14 + lane * 0.14), s = h * 0.04, on = ease(t) * EV.length > k;
      g.strokeStyle = C.line2; g.beginPath(); g.moveTo(x, ay); g.lineTo(x, y + s); g.stroke();
      g.fillStyle = on && t > 0 ? C.l532 : C.text; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.fill();
    });
  },
  industry(g, w, h, t, C) { // wafer pictogram, no quantities
    const cx = w / 2, cy = h * 0.5, R = h * 0.4, p = R / 4.6, lit = Math.floor(ease(t) * 40);
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 2 * Math.PI); g.rect(cx - R, cy + R * 0.86, 2 * R, R); g.clip("evenodd");
    g.fillStyle = C.ink2; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    let k = 0;
    for (let j = -5; j < 5; j++) for (let i = -5; i < 5; i++) { const x = cx + i * p, y = cy + j * p; if (Math.hypot(x + p / 2 - cx, y + p / 2 - cy) > R - p * 0.7) continue; g.fillStyle = t > 0 && k < lit ? C.l532 : C.line2; g.globalAlpha = t > 0 && k < lit ? 0.5 : 1; g.fillRect(x + 1.5, y + 1.5, p - 3, p - 3); g.globalAlpha = 1; k++; }
    g.restore(); g.strokeStyle = C.text2; g.lineWidth = 1.2; g.beginPath(); const a = Math.acos(0.86); g.arc(cx, cy, R, Math.PI / 2 + a, Math.PI / 2 - a + 2 * Math.PI); g.closePath(); g.stroke();
  },
};

export function initDoors(root: HTMLElement): Part {
  const dis = new Disposer();
  interface Door { cv: HTMLCanvasElement; fn: (g: G, w: number, h: number, t: number, C: Pal) => void; t: number; anim: number; paint: (C?: Pal) => void }
  const doors: Door[] = [];
  qa<HTMLElement>(root, ".v-door").forEach((door) => {
    const cv = door.querySelector("canvas"), fn = ART[door.dataset.art ?? ""];
    if (!cv || !fn) return;
    const D: Door = { cv, fn, t: 0, anim: 0, paint: () => {} };
    D.paint = (C = palette()) => {
      const r = cv.getBoundingClientRect(), d = dpr(), W = Math.round(r.width * d), H = Math.round(r.height * d);
      if (!W || !H) return;
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      const g = cv.getContext("2d") as G;
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = C.ink0; g.fillRect(0, 0, W, H); g.setTransform(d, 0, 0, d, 0, 0);
      fn(g, r.width, r.height, D.t, C);
    };
    const run = (): void => { // 600 ms signature motion, then stop
      if (!fxOn()) return;
      const t0 = performance.now(), C = palette();
      cancelAnimationFrame(D.anim);
      const step = (now: number): void => { D.t = Math.min(1, (now - t0) / 600); D.paint(C); if (D.t < 1) D.anim = requestAnimationFrame(step); else { D.t = 0; D.paint(C); } };
      D.anim = requestAnimationFrame(step);
    };
    dis.on(door, "pointerenter", run); dis.on(door, "focus", run);
    dis.add(() => cancelAnimationFrame(D.anim));
    doors.push(D);
  });
  const paintAll = (): void => { const C = palette(); doors.forEach((D) => D.paint(C)); };
  paintAll();
  const grid = root.querySelector(".v-doors");
  if (grid) dis.observe(grid, paintAll);
  return { repaint: paintAll, dispose: dis.run };
}

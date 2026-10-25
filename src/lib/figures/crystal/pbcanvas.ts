// FIG-01-09 Poling bench, VISUAL stage (browser only): top view of the +z face as a grey microscope image.
// Display choices (declared on the page): "SHG" view = both domain signs at one grey level with walls drawn dark (the wall
// contrast of SHG microscopy rendered as a dark line of fixed width plus a soft halo; no optics computed); "etched" view = the
// -z face (reversed domains) darker, after volk2008 p. 168 (-c end etches faster). Electrode fingers in --v-au as outlines
// with a light tint, bus bar above the image, Ps glyphs per stripe below it (dot = +z up, cross = reversed), 5 um scale bar.
// Geometry: site (col, row) of the ferro.ts odd-q lattice at x = (col + 1/2) sqrt(3)/2, y = row + (col odd)/2 (lattice units);
// each site drawn as its flat-top Voronoi hexagon (circumradius 1/sqrt(3)); walls = shared hexagon edges between reversed and
// original neighbours.
import { siteXY, type PolingParams } from "../../physics/ferro.ts";
import { cssVar, dpr } from "../dom.ts";

const SQ3 = Math.sqrt(3);
export const STAGE = { top: 6, bottom: 10 }; // lattice units above / below the 64-row image
export const stageAspect = (nx: number, ny: number): number => ((nx * SQ3) / 2) / (ny + STAGE.top + STAGE.bottom);

interface Geo { nx: number; ny: number; x: Float32Array; y: Float32Array; dir: Float32Array }
let geo: Geo | null = null;
function geometry(p: PolingParams, nbr: Int32Array): Geo {
  if (geo && geo.nx === p.nx && geo.ny === p.ny) return geo;
  const N = p.nx * p.ny, W = (p.nx * SQ3) / 2, H = p.ny;
  const x = new Float32Array(N), y = new Float32Array(N), dir = new Float32Array(12 * N);
  for (let i = 0; i < N; i++) { const [a, b] = siteXY(p, i); x[i] = a + SQ3 / 4; y[i] = b; }
  for (let i = 0; i < N; i++)
    for (let k = 0; k < 6; k++) {
      const j = nbr[6 * i + k];
      let dx = x[j] - x[i], dy = y[j] - y[i];
      if (dx > W / 2) dx -= W; else if (dx < -W / 2) dx += W;
      if (dy > H / 2) dy -= H; else if (dy < -H / 2) dy += H;
      const L = Math.hypot(dx, dy) || 1;
      dir[12 * i + 2 * k] = dx / L; dir[12 * i + 2 * k + 1] = dy / L;
    }
  geo = { nx: p.nx, ny: p.ny, x, y, dir };
  return geo;
}

export function sizeCanvas(cv: HTMLCanvasElement): void {
  const r = cv.getBoundingClientRect(), d = dpr();
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
}

export function paintStage(cv: HTMLCanvasElement, p: PolingParams, nbr: Int32Array, s: Uint8Array, view: "shg" | "etch"): void {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const G = geometry(p, nbr);
  const N = p.nx * p.ny, Wl = (p.nx * SQ3) / 2, H = p.ny;
  const sc = cv.width / Wl; // device px per lattice unit
  const y0 = STAGE.top * sc;
  const X = (x: number): number => x * sc, Y = (y: number): number => y0 + (H - y) * sc; // +y up
  const au = cssVar("--v-au") || "#dcaa4a", ink = cssVar("--v-ink1") || "#0a0d13", tx = cssVar("--v-text") || "#efe9db", tx2 = cssVar("--v-text2") || "#bdb7a8";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, cv.width, cv.height);
  // image
  ctx.save();
  ctx.beginPath(); ctx.rect(0, y0, Wl * sc, H * sc); ctx.clip();
  ctx.fillStyle = view === "shg" ? "#a6a6a6" : "#c4c4c4";
  ctx.fillRect(0, y0, Wl * sc, H * sc);
  const R = 1 / SQ3;
  if (view === "etch") {
    ctx.fillStyle = "#5c5c5c";
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      if (!s[i]) continue;
      const cx = G.x[i], cy = G.y[i];
      ctx.moveTo(X(cx + R), Y(cy));
      for (let v = 1; v < 6; v++) ctx.lineTo(X(cx + R * Math.cos((v * Math.PI) / 3)), Y(cy + R * Math.sin((v * Math.PI) / 3)));
      ctx.closePath();
    }
    ctx.fill();
  }
  const walls = new Path2D();
  for (let i = 0; i < N; i++) {
    if (!s[i]) continue;
    for (let k = 0; k < 6; k++) {
      if (s[nbr[6 * i + k]]) continue;
      const dx = G.dir[12 * i + 2 * k], dy = G.dir[12 * i + 2 * k + 1];
      const mx = G.x[i] + dx / 2, my = G.y[i] + dy / 2, h = R / 2;
      walls.moveTo(X(mx - dy * h), Y(my + dx * h));
      walls.lineTo(X(mx + dy * h), Y(my - dx * h));
    }
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(20,20,20,0.22)"; ctx.lineWidth = Math.max(2, 1.1 * sc); ctx.stroke(walls);
  ctx.strokeStyle = view === "shg" ? "#1c1c1c" : "#2e2e2e"; ctx.lineWidth = Math.max(1, 0.34 * sc); ctx.stroke(walls);
  // electrode fingers: tint + outline
  const per = p.period_cols, w = Math.round(p.duty * per), cw = SQ3 / 2;
  ctx.fillStyle = au; ctx.globalAlpha = 0.09;
  for (let c0 = 0; c0 < p.nx; c0 += per) ctx.fillRect(X(c0 * cw), y0, w * cw * sc, H * sc);
  ctx.globalAlpha = 1; ctx.strokeStyle = au; ctx.lineWidth = Math.max(1, 0.16 * sc);
  for (let c0 = 0; c0 < p.nx; c0 += per) { const a = X(c0 * cw), b = X((c0 + w) * cw); ctx.beginPath(); ctx.moveTo(a, y0); ctx.lineTo(a, y0 + H * sc); ctx.moveTo(b, y0); ctx.lineTo(b, y0 + H * sc); ctx.stroke(); }
  ctx.restore();
  // bus bar and finger leads above the image
  ctx.fillStyle = au;
  ctx.fillRect(0, 0.6 * sc, Wl * sc, 2.4 * sc);
  for (let c0 = 0; c0 < p.nx; c0 += per) ctx.fillRect(X(c0 * cw), 3 * sc, w * cw * sc, (STAGE.top - 3) * sc);
  // Ps glyphs per stripe: runs of columns with more / less than half of their sites reversed
  const ys = y0 + H * sc + 3.2 * sc, rr = 1.5 * sc;
  const frac = new Float32Array(p.nx);
  for (let c = 0; c < p.nx; c++) { let n = 0; for (let r = 0; r < p.ny; r++) n += s[c * p.ny + r]; frac[c] = n / p.ny; }
  ctx.lineWidth = Math.max(1, 0.22 * sc); ctx.strokeStyle = tx; ctx.fillStyle = tx;
  let c = 0;
  while (c < p.nx) {
    const rev = frac[c] > 0.5;
    let e = c;
    while (e + 1 < p.nx && frac[e + 1] > 0.5 === rev) e++;
    if (e - c + 1 >= 4) {
      const xc = X(((c + e + 1) / 2) * cw);
      ctx.beginPath(); ctx.arc(xc, ys, rr, 0, 2 * Math.PI); ctx.stroke();
      if (rev) { const q = rr * 0.62; ctx.beginPath(); ctx.moveTo(xc - q, ys - q); ctx.lineTo(xc + q, ys + q); ctx.moveTo(xc + q, ys - q); ctx.lineTo(xc - q, ys + q); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(xc, ys, rr * 0.3, 0, 2 * Math.PI); ctx.fill(); }
    }
    c = e + 1;
  }
  // 5 um scale bar (lattice spacing 0.25 um, template)
  const L5 = (5 / 0.25) * sc, xb = Wl * sc - L5 - 1.5 * sc, yb = y0 + H * sc + 7.9 * sc;
  ctx.fillStyle = tx2; ctx.fillRect(xb, yb - 0.25 * sc, L5, Math.max(1.5, 0.4 * sc));
  ctx.font = `500 ${Math.round(1.55 * sc)}px Inter, ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "right"; ctx.textBaseline = "bottom";
  ctx.fillText("5 µm", xb - 0.8 * sc, yb + 0.9 * sc);
}

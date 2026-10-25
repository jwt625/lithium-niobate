// Software 3D for chapter 03 VISUAL figures: orthographic camera, painter's-algorithm quads with Lambert shading and
// alpha, polylines and labels, on a 2D canvas. Deterministic (no WebGL), renders on demand, works in headless capture.
// World frame = crystal frame (X, Y, Z), Z up on screen at pitch 0.

export interface Cam { yaw: number; pitch: number; scale: number }
export type RGBA = [number, number, number, number];

export interface View { W: number; H: number; cam: Cam; cx: number; cy: number }

/** Camera basis: screen right (r), screen up (u), toward the viewer (f). */
export function basis(cam: Cam): { r: number[]; u: number[]; f: number[] } {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const f = [cy * cp, sy * cp, sp];
  const r = [-sy, cy, 0];
  const u = [-cy * sp, -sy * sp, cp];
  return { r, u, f };
}
/** World point -> [screen x, screen y, depth toward the viewer]. */
export function project(v: View, p: ArrayLike<number>): [number, number, number] {
  const { r, u, f } = basis(v.cam);
  const x = p[0] * r[0] + p[1] * r[1] + p[2] * r[2];
  const y = p[0] * u[0] + p[1] * u[1] + p[2] * u[2];
  const z = p[0] * f[0] + p[1] * f[1] + p[2] * f[2];
  return [v.cx + v.cam.scale * x, v.cy - v.cam.scale * y, z];
}
/** Screen point -> world direction on the unit sphere under the cursor (front hemisphere); null outside the disc. */
export function unproject(v: View, sx: number, sy: number, radiusPx: number): [number, number, number] | null {
  const x = (sx - v.cx) / radiusPx, y = -(sy - v.cy) / radiusPx, rr = x * x + y * y;
  if (rr > 1) return null;
  const z = Math.sqrt(1 - rr);
  const { r, u, f } = basis(v.cam);
  return [x * r[0] + y * u[0] + z * f[0], x * r[1] + y * u[1] + z * f[1], x * r[2] + y * u[2] + z * f[2]];
}

export interface Mesh {
  /** vertex positions, nu * nv * 3 */
  P: Float64Array;
  nu: number;
  nv: number;
  /** wrap in v (closed in azimuth) */
  wrapV: boolean;
  /** RGBA per quad from its (i, j) lower corner */
  color: (i: number, j: number) => RGBA;
}

interface Quad { z: number; pts: number[]; c: RGBA; shade: number }

/** Draw meshes with painter's sorting. Light from the upper left, fixed in camera space. */
export function drawMeshes(ctx: CanvasRenderingContext2D, v: View, meshes: Mesh[], ambient = 0.45): void {
  const { r, u, f } = basis(v.cam);
  const L = [-0.45, 0.55, 0.7].map((c) => c / Math.hypot(-0.45, 0.55, 0.7)); // in camera coords (r, u, f)
  const quads: Quad[] = [];
  for (const m of meshes) {
    const n = m.nu * m.nv;
    const S = new Float64Array(n * 3);
    for (let k = 0; k < n; k++) {
      const x = m.P[3 * k], y = m.P[3 * k + 1], z = m.P[3 * k + 2];
      S[3 * k] = v.cx + v.cam.scale * (x * r[0] + y * r[1] + z * r[2]);
      S[3 * k + 1] = v.cy - v.cam.scale * (x * u[0] + y * u[1] + z * u[2]);
      S[3 * k + 2] = x * f[0] + y * f[1] + z * f[2];
    }
    const jMax = m.wrapV ? m.nv : m.nv - 1;
    for (let i = 0; i < m.nu - 1; i++)
      for (let j = 0; j < jMax; j++) {
        const j2 = (j + 1) % m.nv;
        const a = i * m.nv + j, b = (i + 1) * m.nv + j, c = (i + 1) * m.nv + j2, d = i * m.nv + j2;
        const c0 = m.color(i, j);
        if (c0[3] <= 0) continue;
        // face normal in world coords from the diagonals
        const e1 = [m.P[3 * c] - m.P[3 * a], m.P[3 * c + 1] - m.P[3 * a + 1], m.P[3 * c + 2] - m.P[3 * a + 2]];
        const e2 = [m.P[3 * d] - m.P[3 * b], m.P[3 * d + 1] - m.P[3 * b + 1], m.P[3 * d + 2] - m.P[3 * b + 2]];
        const nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
        const nn = Math.hypot(nx, ny, nz) || 1;
        const cr = (nx * r[0] + ny * r[1] + nz * r[2]) / nn, cu = (nx * u[0] + ny * u[1] + nz * u[2]) / nn, cf = (nx * f[0] + ny * f[1] + nz * f[2]) / nn;
        const lam = Math.abs(cr * L[0] + cu * L[1] + cf * L[2]);
        quads.push({ z: (S[3 * a + 2] + S[3 * b + 2] + S[3 * c + 2] + S[3 * d + 2]) / 4, pts: [S[3 * a], S[3 * a + 1], S[3 * b], S[3 * b + 1], S[3 * c], S[3 * c + 1], S[3 * d], S[3 * d + 1]], c: c0, shade: ambient + (1 - ambient) * lam });
      }
  }
  quads.sort((p, q) => p.z - q.z);
  for (const q of quads) {
    const [R, G, B, A] = q.c, s = q.shade;
    ctx.fillStyle = `rgba(${Math.round(R * s)},${Math.round(G * s)},${Math.round(B * s)},${A})`;
    ctx.beginPath();
    ctx.moveTo(q.pts[0], q.pts[1]); ctx.lineTo(q.pts[2], q.pts[3]); ctx.lineTo(q.pts[4], q.pts[5]); ctx.lineTo(q.pts[6], q.pts[7]);
    ctx.closePath();
    ctx.fill();
    if (A > 0.6) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke(); } // hide seams between opaque quads
  }
}

/** Polyline in world coordinates. */
export function line3(ctx: CanvasRenderingContext2D, v: View, pts: number[][], stroke: string, width = 1, dash: number[] = []): void {
  ctx.save();
  ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.setLineDash(dash);
  ctx.beginPath();
  pts.forEach((p, i) => { const [x, y] = project(v, p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
  ctx.stroke();
  ctx.restore();
}

/** Arrow from a to b (world), head in screen space. */
export function arrow3(ctx: CanvasRenderingContext2D, v: View, a: number[], b: number[], stroke: string, width = 2, head = 9): void {
  const [x0, y0] = project(v, a), [x1, y1] = project(v, b);
  ctx.save();
  ctx.strokeStyle = stroke; ctx.fillStyle = stroke; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const ang = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  if (L > head) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - head * Math.cos(ang - 0.4), y1 - head * Math.sin(ang - 0.4));
    ctx.lineTo(x1 - head * Math.cos(ang + 0.4), y1 - head * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/** Parse a CSS color (#rgb, #rrggbb, rgb(), rgba()) to RGB 0-255. */
export function rgb(css: string): [number, number, number] {
  const s = css.trim();
  if (s.startsWith("#")) {
    const h = s.length === 4 ? s.slice(1).split("").map((c) => c + c).join("") : s.slice(1, 7);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const m = /rgba?\(([^)]+)\)/.exec(s);
  if (m) { const p = m[1].split(/[ ,/]+/).map(Number); return [p[0] || 0, p[1] || 0, p[2] || 0]; }
  return [200, 200, 200];
}

/** Size a canvas to its CSS box at the device pixel ratio; returns the 2D context scaled to CSS pixels. */
export function fitCanvas(cv: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; W: number; H: number } {
  const W = cv.clientWidth, H = cv.clientHeight, k = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(W * k) || cv.height !== Math.round(H * k)) { cv.width = Math.round(W * k); cv.height = Math.round(H * k); }
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.clearRect(0, 0, W, H);
  return { ctx, W, H };
}

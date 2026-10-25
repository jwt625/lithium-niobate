// FIG-01-01 Cell explorer: chapter overlays on the shared unit-cell figure (src/lib/figures/lattice.ts, mounted unchanged).
// lattice.ts draws the cell (TECH ASCII ray caster, VISUAL three.js) from the shared orthographic camera in figstate `cell`;
// this module repeats the same projection and draws, on top of it:
//   rhombohedral primitive cell (weis1985 Eq. (1): a_R, alpha; primitive vectors (2/3,1/3,1/3), (-1/3,1/3,1/3), (-1/3,-2/3,1/3)
//     in hexagonal fractions, summing to c, so the 10-atom cell shares its long diagonal with the c axis of the column at its origin);
//   the cleavage plane (01-12), i.e. y + 2z = n in hexagonal fractions, at the n that holds the empty octahedral sites
//     (all six empty sites of the cell sit at y + 2z = 0.2917 mod 1; Li at 0.5612, Nb at 0.998: derived from the CIF);
//   the octahedral column at the cell edge: its sites in order along +c; the one nearest the pointer is highlighted.
// TECH: glyphs on the ASCII character grid (rhombohedral edges ':', plane hatch '/', column labels; inverted cell for the active
// site via a difference-blended layer). VISUAL: SVG lines and a glass sheet over the WebGL canvas. Render on demand.
import { cell as cam } from "$lib/stores/figstate";
import { cellx } from "$lib/stores/crystal";
import { Disposer, isVisual, onUi } from "../dom.ts";

type V3 = [number, number, number];
export interface ColumnSite { el: "Nb" | "Li" | "empty"; z: number }
export interface CellxData {
  a: number; c: number;
  /** cell matrix columns a1, a2, c (Angstrom) */
  M: [V3, V3, V3];
  rh: { basis: [V3, V3, V3]; aR: number; alpha: number };
  /** plane constant of the (01-12) family through the empty sites, fractional (0.2917) */
  cleaveN0: number;
  cleaveAngle: number;
  /** sites of the octahedral column at fractional (0, 0), z in [0, 1) */
  column: ColumnSite[];
  /** fractional positions of the empty sites in the cell */
  empties: V3[];
}

const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** Camera basis of lattice.ts (same formulas): view direction from yaw and pitch, c up. */
function basis(): { r: V3; u: V3; f: V3 } {
  const e: V3 = [Math.cos(cam.pitch) * Math.cos(cam.yaw), Math.cos(cam.pitch) * Math.sin(cam.yaw), Math.sin(cam.pitch)];
  const f: V3 = [-e[0], -e[1], -e[2]], r = norm(cross(f, [0, 0, 1])), u = cross(r, f);
  return { r, u, f };
}

export function mountCellx(figT: HTMLElement | null, figV: HTMLElement | null, D: CellxData): () => void {
  const dis = new Disposer();
  const cart = (f: V3): V3 => [0, 1, 2].map((k) => f[0] * D.M[0][k] + f[1] * D.M[1][k] + f[2] * D.M[2][k]) as V3;
  let hoverK = -1, queued = false;

  // ---------- geometry in Cartesian Angstrom for block n (1 or 2) ----------
  function geom(n: number) {
    const o: V3 = n === 2 ? cart([1, 1, 0]) : [0, 0, 0];
    const [b1, b2, b3] = D.rh.basis;
    const v: V3[] = [[0, 0, 0], b1, b2, b3, add(b1, b2), add(b1, b3), add(b2, b3), add(add(b1, b2), b3)].map((p) => add(o, p as V3));
    const rhEdges: [V3, V3][] = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 4], [2, 6], [3, 5], [3, 6], [4, 7], [5, 7], [6, 7]].map(([i, j]) => [v[i], v[j]]);
    // central plane of the family y + 2z = n0 + m inside the block [0, n] x [0, n] x [0, 1]
    const ncen = D.cleaveN0 + Math.round(n / 2 + 1 - D.cleaveN0); // member of the family nearest the block centre (y + 2z = n/2 + 1)
    const z0 = Math.max(0, (ncen - n) / 2), z1 = Math.min(1, ncen / 2);
    const plane: V3[] = [[0, ncen - 2 * z0, z0], [n, ncen - 2 * z0, z0], [n, ncen - 2 * z1, z1], [0, ncen - 2 * z1, z1]].map((f) => cart(f as V3));
    const onPlane: V3[] = [];
    for (const e of D.empties) for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) for (let k = 0; k <= 1; k++) {
      const f: V3 = [e[0] + i, e[1] + j, e[2] + k];
      if (f[0] > n + 1e-3 || f[1] > n + 1e-3 || f[2] > 1 + 1e-3) continue;
      if (Math.abs(f[1] + 2 * f[2] - ncen) < 1e-3) onPlane.push(cart(f));
    }
    const col = D.column.map((s) => ({ ...s, p: add(o, cart([0, 0, s.z])) }));
    const T = cart([n / 2, n / 2, 0.5]);
    let rxy = 0;
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { const p = cart([i, j, 0]); rxy = Math.max(rxy, Math.hypot(p[0] - T[0], p[1] - T[1])); }
    return { rhEdges, plane, onPlane, ncen, col, colEnds: [add(o, [0, 0, 0]), add(o, cart([0, 0, 1]))] as [V3, V3], T, halfLong: D.c / 2 + 1.1, halfShort: rxy + 0.8 };
  }
  const G1 = geom(1), G2 = geom(2);

  // ---------- readouts ----------
  const roCol = [figT?.querySelector<HTMLElement>(".cx-colro"), figV?.querySelector<HTMLElement>(".cx-colro")].filter(Boolean) as HTMLElement[];
  const roCl = [figT?.querySelector<HTMLElement>(".cx-clro"), figV?.querySelector<HTMLElement>(".cx-clro")].filter(Boolean) as HTMLElement[];
  const NAME = { Nb: "Nb", Li: "Li", empty: "empty" } as const;
  function readouts(G: ReturnType<typeof geom>): void {
    const seq = G.col.map((s, k) => {
      const t = `${NAME[s.el]} ${s.z.toFixed(3)}`;
      return k === hoverK ? `<b>${t}</b>` : t;
    }).join(" &rarr; ");
    roCol.forEach((r) => { r.innerHTML = cellx.col ? `+c: ${seq}` : "off"; });
    roCl.forEach((r) => { r.innerHTML = cellx.cl ? `y + 2z = ${G.ncen.toFixed(4)}: ${String(G.onPlane.length).padStart(2, " ")} empty sites, 0 cations` : "off"; });
  }

  // ---------- TECH: glyph overlay on the ASCII grid ----------
  const stageT = figT?.querySelector<HTMLElement>(".cstage") ?? null;
  const cvA = stageT?.querySelector<HTMLCanvasElement>("canvas.cx-ov") ?? null; // normal layer
  const cvB = stageT?.querySelector<HTMLCanvasElement>("canvas.cx-inv") ?? null; // difference layer
  function drawT(): void {
    if (!stageT || !cvA || !cvB) return;
    const W = stageT.clientWidth, H = stageT.clientHeight, d = Math.min(2, devicePixelRatio || 1);
    if (!W || !H) return;
    const ga = cvA.getContext("2d") as CanvasRenderingContext2D, gb = cvB.getContext("2d") as CanvasRenderingContext2D;
    for (const [cv, g] of [[cvA, ga], [cvB, gb]] as const) { cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W, H); }
    if (!cellx.rh && !cellx.cl && !cellx.col) return;
    // character grid exactly as lattice.ts sizes it
    const fs = Math.max(8, Math.min(11, Math.round(W / 144))), lh = Math.round(fs * 0.9);
    const font = (w: number): string => `${w} ${fs}px "IBM Plex Mono", ui-monospace, Menlo, monospace`;
    ga.font = font(400); ga.fontKerning = "none";
    const cw = ga.measureText("M".repeat(64)).width / 64 || fs * 0.6;
    const cols = Math.floor(W / cw), rows = Math.floor(H / lh), ox = (W - cols * cw) / 2, oy = (H - rows * lh) / 2;
    const G = cam.show.sup ? G2 : G1, B = basis(), land = W > H * 1.15;
    const s = Math.min((land ? W : H) / (2 * G.halfLong), (land ? H : W) / (2 * G.halfShort)) * cam.zoom;
    const P = (p: V3): [number, number] => { const q = sub(p, G.T), xr = dot(q, B.r), yu = dot(q, B.u); const [x, y] = land ? [W / 2 + yu * s, H / 2 + xr * s] : [W / 2 + xr * s, H / 2 - yu * s]; return [Math.round((x - ox) / cw - 0.5), Math.round((y - oy) / lh - 0.5)]; };
    const cs = getComputedStyle(document.documentElement), bg = cs.getPropertyValue("--bg").trim(), fg = cs.getPropertyValue("--fg").trim(), fg2 = cs.getPropertyValue("--fg2").trim();
    ga.textBaseline = "middle";
    const put = (cx: number, cy: number, ch: string, col = fg, w = 400): void => {
      if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
      const x = ox + cx * cw, y = oy + cy * lh;
      ga.fillStyle = bg; ga.fillRect(x, y, cw + 0.5, lh + 0.5);
      ga.font = font(w); ga.fillStyle = col; ga.fillText(ch, x, y + lh / 2 + 0.5);
    };
    const line = (p: V3, q: V3, ch: string, step = 1): void => {
      const [x0, y0] = P(p), [x1, y1] = P(q), n = Math.max(1, Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
      for (let i = 0; i <= n; i += step) put(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), ch);
    };
    if (cellx.cl) {
      const poly = G.plane.map(P);
      const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
      const inside = (x: number, y: number): boolean => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
      for (let y = Math.max(0, Math.min(...ys)); y <= Math.min(rows - 1, Math.max(...ys)); y++) for (let x = Math.max(0, Math.min(...xs)); x <= Math.min(cols - 1, Math.max(...xs)); x++) if ((x + 2 * y) % 6 === 0 && inside(x + 0.5, y + 0.5)) put(x, y, "/", fg2);
      for (let i = 0; i < 4; i++) line(G.plane[i], G.plane[(i + 1) % 4], "~", 1);
      G.onPlane.forEach((p) => { const [x, y] = P(p); put(x, y, "@", fg, 500); });
    }
    if (cellx.rh) G.rhEdges.forEach(([p, q]) => line(p, q, ":"));
    if (cellx.col) {
      line(G.colEnds[0], G.colEnds[1], "|", 2);
      G.col.forEach((st, k) => {
        const [x, y] = P(st.p), lab = st.el === "empty" ? "[ ]" : st.el === "Nb" ? "Nb" : "Li";
        [...lab].forEach((ch, i) => put(x + 2 + i, y, ch, k === hoverK ? fg : fg2, k === hoverK ? 500 : 400));
        if (k === hoverK) { gb.fillStyle = "#fff"; gb.fillRect(ox + (x + 1) * cw, oy + y * lh, (lab.length + 2) * cw, lh); }
      });
    }
  }

  // ---------- VISUAL: SVG overlay ----------
  const stageV = figV?.querySelector<HTMLElement>(".stage") ?? null;
  const svg = stageV?.querySelector<SVGSVGElement>("svg.cx-ov") ?? null;
  function drawV(): void {
    if (!stageV || !svg) return;
    const W = stageV.clientWidth, H = stageV.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    if (!cellx.rh && !cellx.cl && !cellx.col) { svg.innerHTML = ""; return; }
    const G = G1, B = basis(), halfH = Math.max(8.6, (6.3 * H) / W), s = (H / 2 / halfH) * cam.zoom;
    const P = (p: V3): [number, number] => { const q = sub(p, G.T); return [W / 2 + dot(q, B.r) * s, H / 2 - dot(q, B.u) * s]; };
    const f = (v: number): string => v.toFixed(1);
    let out = "";
    if (cellx.cl) {
      const poly = G.plane.map(P);
      out += `<polygon class="pl" points="${poly.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")}"/>`;
      G.onPlane.forEach((p) => { const [x, y] = P(p); out += `<circle class="pe" cx="${f(x)}" cy="${f(y)}" r="7"/>`; });
      const [lx, ly] = P(G.plane[2]);
      out += `<text class="plt" x="${f(lx + 10)}" y="${f(ly)}">(01&#773;12), ${D.cleaveAngle.toFixed(2)}&deg; to c</text>`;
    }
    if (cellx.rh) out += G.rhEdges.map(([p, q]) => { const [x1, y1] = P(p), [x2, y2] = P(q); return `<line class="rh" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`; }).join("");
    if (cellx.col) {
      const [a, b] = G.colEnds.map(P);
      out += `<line class="cl" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`;
      G.col.forEach((st, k) => {
        const [x, y] = P(st.p), on = k === hoverK;
        out += `<g class="cs ${st.el}${on ? " on" : ""}"><rect x="${f(x - 9)}" y="${f(y - 9)}" width="18" height="18" transform="rotate(45 ${f(x)} ${f(y)})"/><text x="${f(x + 16)}" y="${f(y + 5)}">${st.el === "empty" ? "empty" : st.el}</text></g>`;
      });
    }
    svg.innerHTML = out;
  }

  // ---------- hover along the column ----------
  function nearest(clientX: number, clientY: number, stage: HTMLElement, tech: boolean): number {
    const r = stage.getBoundingClientRect(), x = clientX - r.left, y = clientY - r.top, W = r.width, H = r.height, B = basis();
    const G = tech && cam.show.sup ? G2 : G1;
    let s: number, Pp: (p: V3) => [number, number];
    if (tech) {
      const land = W > H * 1.15;
      s = Math.min((land ? W : H) / (2 * G.halfLong), (land ? H : W) / (2 * G.halfShort)) * cam.zoom;
      Pp = (p) => { const q = sub(p, G.T), xr = dot(q, B.r), yu = dot(q, B.u); return land ? [W / 2 + yu * s, H / 2 + xr * s] : [W / 2 + xr * s, H / 2 - yu * s]; };
    } else {
      const halfH = Math.max(8.6, (6.3 * H) / W);
      s = (H / 2 / halfH) * cam.zoom;
      Pp = (p) => { const q = sub(p, G.T); return [W / 2 + dot(q, B.r) * s, H / 2 - dot(q, B.u) * s]; };
    }
    let best = -1, bd = Infinity;
    G.col.forEach((st, k) => { const [px, py] = Pp(st.p), dd = Math.hypot(px - x, py - y); if (dd < bd) { bd = dd; best = k; } });
    return bd < 90 ? best : -1;
  }

  function draw(): void {
    queued = false;
    readouts(cam.show.sup && !isVisual() ? G2 : G1);
    if (isVisual()) drawV(); else drawT();
    paintToggles();
  }
  const request = (): void => { if (!queued) { queued = true; requestAnimationFrame(draw); } };

  const togs = [...(figT?.querySelectorAll<HTMLButtonElement>("button[data-cx]") ?? []), ...(figV?.querySelectorAll<HTMLButtonElement>("button[data-cx]") ?? [])];
  function paintToggles(): void { togs.forEach((b) => { const on = !!cellx[b.dataset.cx as keyof typeof cellx]; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); }); }
  togs.forEach((b) => dis.on(b, "click", () => { const k = b.dataset.cx as keyof typeof cellx; cellx[k] = !cellx[k]; request(); }));

  for (const [stage, tech] of [[stageT, true], [stageV, false]] as const) {
    if (!stage) continue;
    dis.on(stage, "pointermove", (e: PointerEvent) => { if (cellx.col) { const k = nearest(e.clientX, e.clientY, stage, tech); if (k !== hoverK) hoverK = k; } request(); });
    dis.on(stage, "pointerleave", () => { hoverK = -1; request(); });
    dis.on(stage, "wheel", request, { passive: true });
    dis.on(stage, "keydown", request);
    dis.on(stage, "pointerup", request);
    dis.observe(stage, request);
  }
  for (const root of [figT, figV]) if (root) dis.on(root, "click", request);
  dis.add(onUi(request));
  void document.fonts?.ready.then(request);
  request();
  return dis.run;
}

// Fig. 1, LiNbO3 conventional hexagonal R3c cell (port of mockup/lattice.js). Render on demand, no idle loop.
// Data: /data/linbo3-cell.json (scripts/gen_cell.py from Hsu et al., Acta Cryst. B 53, 420 (1997), COD 2101845).
// TECH (#cell): full-viewport ASCII ray caster: per character cell, nearest sphere surface by z-buffer, Lambert + Blinn
//   shading mapped to a species glyph ramp; line glyphs for cell edges, octahedra edges, bonds; id-buffer picking.
// VISUAL (#fig1): three.js (npm three@0.169.0, same release as the mockup's vendored r169), imported on first use.
// Both share one orthographic camera and the toggle state (src/lib/stores/figstate.ts cell), so a mode switch keeps the view.
import { cell as cam, CELL_DEFAULT } from "$lib/stores/figstate";
import { registerPops } from "$lib/content/pops";
import { Disposer, isVisual, isLight, onUi } from "./dom.ts";

type V3 = [number, number, number];
type El = "Nb" | "Li" | "O";
type ShowKey = keyof typeof cam.show;
interface Neighbor { el: string; d_A: number; n: number }
interface SrcAtom { id: string; el: string; wyckoff: string; frac: V3; cart_A: V3; neighbors: Neighbor[]; octahedron_O_cart: V3[] }
interface CellData {
  cell: { a_A: number; c_A: number; Z: number; temperature_K: number; matrix_columns_a1_a2_c: [V3, V3, V3] };
  atoms: SrcAtom[];
  empty_octahedral_sites: SrcAtom[];
  checks: { counts: Record<string, number>; Nb_O_A: number[]; Li_O_A: number[]; Nb_offset_from_O6_centroid_along_c_A: number; Li_height_above_O3_plane_along_c_A: number };
}
interface Atom { src: SrcAtom; el: El | "empty"; kind: "atom" | "empty"; f: V3; p: V3; image: boolean; mesh?: { visible: boolean } }
interface Oct { el: El | "empty"; v: V3[]; faces: V3[]; edges: [number, number][] }
interface Scene { n: number; atoms: Atom[]; octs: Oct[]; edges: [V3, V3][]; bonds: [V3, V3, string][]; T: V3; halfLong: number; halfShort: number }
interface Colors { light: boolean; bg: string; fg: string; fg2: string; fg3: string; acc: string; Nb: string; Li: string; O: string }

const RV: Record<string, number> = { Nb: 0.42, Li: 0.36, O: 0.3, empty: 0.14 }; // VISUAL display radii, Angstrom (not ionic radii)
const RT: Record<string, number> = { Nb: 0.62, Li: 0.52, O: 0.45, empty: 0.36 }; // TECH display radii, Angstrom (not ionic radii)
const RAMP: Record<string, string> = { Nb: ".:-=+*#%@", Li: ".',;il", O: ".coO0" }; // TECH glyph ramps, shadow -> highlight
const NAME: Record<string, string> = { Nb: "Nb", Li: "Li", O: "O", empty: "empty octahedral site" };
const INSTR_T = "drag: orbit · click then wheel, or pinch: zoom · arrow keys: rotate · +/-: zoom · hover or tap a sphere";
const INSTR_V = "drag: orbit · wheel or pinch: zoom · hover or tap an atom";
const AX: { t: string; v: V3; c?: boolean }[] = [{ t: "a1", v: [1, 0, 0] }, { t: "a2", v: [-0.5, Math.sqrt(3) / 2, 0] }, { t: "c", v: [0, 0, 1], c: true }];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const f3 = (v: number): string => v.toFixed(3);
const rgb = (s: string): V3 => {
  if (s.startsWith("#")) { const h = s.length === 4 ? [...s.slice(1)].map((c) => c + c).join("") : s.slice(1); return [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16)) as V3; }
  const m = s.match(/[\d.]+/g); return m ? (m.slice(0, 3).map(Number) as V3) : [128, 128, 128];
};
const mix = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Mount Fig. 1 on the TECH ASCII section (#cell) and/or the VISUAL hero figure (#fig1). Returns the teardown. */
export function mountLattice(figT: HTMLElement | null, figV: HTMLElement | null): () => void {
  const dis = new Disposer();
  let D: CellData | null = null, S1: Scene | null = null, S2: Scene | null = null;
  let cart: (f: V3) => V3 = (f) => f;
  let mode: "tech" | "visual" | null = null, gl: GL | null = null, glFailed = false, hover: Atom | null = null, pinned: Atom | null = null, queued = false, alive = true;
  const show = cam.show;
  const allTog = [...(figT?.querySelectorAll<HTMLButtonElement>("button[data-t]") ?? []), ...(figV?.querySelectorAll<HTMLButtonElement>("button[data-t]") ?? [])];

  // ---------- data and scenes ----------
  async function load(): Promise<void> {
    const d: CellData = await (await fetch("/data/linbo3-cell.json")).json();
    if (!alive) return;
    D = d;
    const [A1, A2, C] = d.cell.matrix_columns_a1_a2_c;
    cart = (f) => [0, 1, 2].map((k) => f[0] * A1[k] + f[1] * A2[k] + f[2] * C[k]) as V3;
    S1 = scene(1); S2 = scene(2);
    dis.add(registerPops({
      "s-cell": {
        h: "Structure: LiNbO<sub>3</sub>, R3c (No. 161), hexagonal axes",
        body: `Asymmetric unit: Li 6a (0, 0, 0.2806), Nb 6a (0, 0, &minus;0.0010), O 18b (0.04751, 0.34301, 0.0625); <span class='v'>a = ${d.cell.a_A} &Aring;, c = ${d.cell.c_A} &Aring;</span>, ${d.cell.temperature_K} K, synchrotron X-ray, R = 0.015.`,
        badges: [["pc", "P-db"]],
        src: "R. Hsu, E. N. Maslen, D. du Boulay, N. Ishizawa, Acta Cryst. B 53, 420 (1997), <a href='https://doi.org/10.1107/S010876819600777X'>doi:10.1107/S010876819600777X</a>; CIF: Crystallography Open Database <a href='http://www.crystallography.net/cod/2101845.html'>2101845</a>.",
      },
      "s-cell-d": {
        h: "Derived from the CIF",
        body: `18 symmetry operators applied to the asymmetric unit: Li ${d.checks.counts.Li}, Nb ${d.checks.counts.Nb}, O ${d.checks.counts.O} per cell (Z = ${d.cell.Z}). Distances from all periodic images: Nb&ndash;O <span class='v'>${f3(d.checks.Nb_O_A[0])} &times;3, ${f3(d.checks.Nb_O_A[5])} &times;3 &Aring;</span>; Li&ndash;O <span class='v'>${f3(d.checks.Li_O_A[0])} &times;3, ${f3(d.checks.Li_O_A[5])} &times;3 &Aring;</span> (CIF: 1.876, 2.130; 2.063, 2.245). Empty octahedral sites: O<sub>6</sub> centroids with no cation within 1 &Aring;, ${d.checks.counts.empty_octahedral} per cell. Along +c each octahedral column repeats Nb, empty, Li. Nb sits ${f3(d.checks.Nb_offset_from_O6_centroid_along_c_A)} &Aring; above its O<sub>6</sub> centroid, Li ${f3(d.checks.Li_height_above_O3_plane_along_c_A)} &Aring; above its O<sub>3</sub> plane; both offsets point along +c, the P<sub>s</sub> direction of this coordinate set. Sphere radii are display choices, not ionic radii: TECH Nb 0.62, Li 0.52, O 0.45 &Aring;; VISUAL Nb 0.42, Li 0.36, O 0.30 &Aring;.`,
        badges: [["d", "derived"]],
        src: "scripts/gen_cell.py; data/linbo3-cell.json (CC BY 4.0).",
      },
    }));
  }

  // n x n x 1 block of conventional cells: boundary images, octahedra, edges, bonds, fit extents
  function scene(n: number): Scene {
    const d = D as CellData;
    const atoms: Atom[] = [], octs: Oct[] = [], edges: [V3, V3][] = [], bonds: [V3, V3, string][] = [], tol = 0.005;
    const inR = (f: V3): boolean => f[0] > -tol && f[0] < n + tol && f[1] > -tol && f[1] < n + tol && f[2] > -tol && f[2] < 1 + tol;
    const push = (src: SrcAtom, kind: "atom" | "empty"): void => {
      for (let i = -1; i <= n; i++) for (let j = -1; j <= n; j++) for (let k = -1; k <= 1; k++) {
        const f: V3 = [src.frac[0] + i, src.frac[1] + j, src.frac[2] + k];
        if (inR(f)) atoms.push({ src, el: (kind === "empty" ? "empty" : src.el) as El | "empty", kind, f, p: cart(f), image: !!(i || j || k) });
      }
    };
    d.atoms.forEach((a) => push(a, "atom"));
    d.empty_octahedral_sites.forEach((a) => push(a, "empty"));
    const srcs: [SrcAtom, El | "empty"][] = [...d.atoms.filter((a) => a.el !== "O").map((a) => [a, a.el as El] as [SrcAtom, El]), ...d.empty_octahedral_sites.map((a) => [a, "empty"] as [SrcAtom, "empty"])];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const sh = cart([i, j, 0]);
      srcs.forEach(([a, el]) => {
        const v = a.octahedron_O_cart.map((p) => [p[0] + sh[0], p[1] + sh[1], p[2] + sh[2]] as V3), faces = hull(v), es = new Set<string>();
        faces.forEach(([x, y, z]) => [[x, y], [y, z], [z, x]].forEach(([p, q]) => es.add(p < q ? `${p},${q}` : `${q},${p}`)));
        octs.push({ el, v, faces, edges: [...es].map((s) => s.split(",").map(Number) as [number, number]) });
      });
    }
    const ek = new Set<string>();
    const addE = (f: V3, g: V3): void => { const k = [f, g].map((x) => x.join(",")).sort().join("|"); if (!ek.has(k)) { ek.add(k); edges.push([cart(f), cart(g)]); } };
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const sq: [number, number][] = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      sq.forEach(([x, y], m) => { const [x2, y2] = sq[(m + 1) % 4]; addE([x, y, 0], [x2, y2, 0]); addE([x, y, 1], [x2, y2, 1]); addE([x, y, 0], [x, y, 1]); });
    }
    const Os = atoms.filter((a) => a.el === "O");
    atoms.forEach((a) => {
      if (a.kind !== "atom" || a.el === "O") return;
      const sh = sub(a.p, cart(a.src.frac));
      a.src.octahedron_O_cart.forEach((v) => {
        const w: V3 = [v[0] + sh[0], v[1] + sh[1], v[2] + sh[2]], o = Os.find((b) => Math.hypot(...sub(b.p, w)) < 0.02);
        if (o) bonds.push([a.p, o.p, a.el]);
      });
    });
    const T = cart([n / 2, n / 2, 0.5]);
    let rxy = 0;
    for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) { const p = cart([i, j, 0]); rxy = Math.max(rxy, Math.hypot(p[0] - T[0], p[1] - T[1])); }
    return { n, atoms, octs, edges, bonds, T, halfLong: d.cell.c_A / 2 + 1.1, halfShort: rxy + 0.8 };
  }

  // brute-force convex hull of a few points: triangles with all other points on one side
  function hull(v: V3[]): V3[] {
    const faces: V3[] = [], n = v.length, c = [0, 1, 2].map((k) => v.reduce((s, p) => s + p[k], 0) / n) as V3;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let d = b + 1; d < n; d++) {
      const nr = cross(sub(v[b], v[a]), sub(v[d], v[a]));
      let pos = 0, neg = 0;
      for (let k = 0; k < n; k++) { if (k === a || k === b || k === d) continue; const s = dot(nr, sub(v[k], v[a])); if (s > 1e-6) pos++; else if (s < -1e-6) neg++; }
      if (pos && neg) continue;
      faces.push(dot(nr, sub(c, v[a])) < 0 ? [a, b, d] : [a, d, b]);
    }
    return faces;
  }

  // ---------- camera (shared) ----------
  function basis(): { e: V3; f: V3; r: V3; u: V3 } {
    const e: V3 = [Math.cos(cam.pitch) * Math.cos(cam.yaw), Math.cos(cam.pitch) * Math.sin(cam.yaw), Math.sin(cam.pitch)];
    const f: V3 = [-e[0], -e[1], -e[2]], r = norm(cross(f, [0, 0, 1])), u = cross(r, f);
    return { e, f, r, u };
  }
  // TECH projection: c vertical on portrait stages, c horizontal (pointing right) on landscape stages
  function projT(W: number, H: number, S: Scene) {
    const B = basis(), land = W > H * 1.15;
    const s = Math.min((land ? W : H) / (2 * S.halfLong), (land ? H : W) / (2 * S.halfShort)) * cam.zoom;
    const P = (p: V3): { x: number; y: number; z: number } => {
      const d = sub(p, S.T), xr = dot(d, B.r), yu = dot(d, B.u), z = dot(d, B.f);
      return land ? { x: W / 2 + yu * s, y: H / 2 + xr * s, z } : { x: W / 2 + xr * s, y: H / 2 - yu * s, z };
    };
    const dir = (v: V3): [number, number] => (land ? [dot(v, B.u), dot(v, B.r)] : [dot(v, B.r), -dot(v, B.u)]);
    return { B, s, P, dir, land };
  }
  // VISUAL projection (portrait panel, matches the three.js orthographic camera)
  const stageV = figV?.querySelector<HTMLElement>(".stage") ?? null;
  function viewV() {
    const W = stageV?.clientWidth ?? 1, H = stageV?.clientHeight ?? 1;
    const halfH = Math.max(8.6, (6.3 * H) / W);
    return { W, H, halfH, halfW: (halfH * W) / H, s: (H / 2 / halfH) * cam.zoom };
  }
  function projV() {
    const B = basis(), V = viewV(), T = (S1 as Scene).T;
    return { B, V, P: (p: V3) => { const d = sub(p, T); return { x: V.W / 2 + dot(d, B.r) * V.s, y: V.H / 2 - dot(d, B.u) * V.s, z: dot(d, B.f) }; } };
  }
  function colors(): Colors {
    const cs = getComputedStyle(document.documentElement), g = (n: string): string => cs.getPropertyValue(n).trim();
    const light = isLight();
    return { light, bg: g("--bg"), fg: g("--fg"), fg2: g("--fg2"), fg3: g("--fg3"), acc: g("--acc"), Nb: g("--nb"), Li: g("--gold"), O: light ? "#c2402c" : "#e5664f" };
  }

  // ---------- TECH: ASCII ray caster ----------
  interface Asc { stage: HTMLElement; cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; fs: number; lh: number; cw: number; cols: number; rows: number; ox: number; oy: number; W: number; H: number; idb: Int32Array; ms: number[]; font: (w: number) => string; size: () => boolean; render: () => void }
  const asc: Asc | null = figT ? (() => {
    const stage = figT.querySelector<HTMLElement>(".cstage") as HTMLElement, cv = stage.querySelector("canvas") as HTMLCanvasElement, ctx = cv.getContext("2d") as CanvasRenderingContext2D;
    const L = norm([-0.5, 0.62, 0.6]), Hh = norm([L[0], L[1], L[2] + 1]);
    const st: Asc = {
      stage, cv, ctx, fs: 10, lh: 9, cw: 6, cols: 0, rows: 0, ox: 0, oy: 0, W: 0, H: 0, idb: new Int32Array(0), ms: [],
      font: (w) => `${w} ${st.fs}px "IBM Plex Mono", ui-monospace, Menlo, monospace`,
      size: () => {
        const W = stage.clientWidth, H = stage.clientHeight, d = Math.min(2, devicePixelRatio || 1);
        if (!W || !H) return false;
        cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0);
        st.fs = Math.max(8, Math.min(11, Math.round(W / 144))); st.lh = Math.round(st.fs * 0.9);
        ctx.font = st.font(400); ctx.fontKerning = "none";
        st.cw = ctx.measureText("M".repeat(64)).width / 64 || st.fs * 0.6;
        st.cols = Math.floor(W / st.cw); st.rows = Math.floor(H / st.lh);
        st.ox = (W - st.cols * st.cw) / 2; st.oy = (H - st.rows * st.lh) / 2; st.W = W; st.H = H;
        stage.dataset.grid = `${st.cols}x${st.rows}`;
        return true;
      },
      render: () => {
        if (!st.cols) return;
        const t0 = performance.now();
        const S = (show.sup ? S2 : S1) as Scene, { P, s, dir } = projT(st.W, st.H, S), C = colors();
        const { cols, rows, cw, lh, ox, oy } = st, N = cols * rows;
        const ch = new Uint16Array(N).fill(32), zb = new Float32Array(N).fill(Infinity), dz = new Float32Array(N), cl = new Uint8Array(N), idb = new Int32Array(N).fill(-1);
        const put = (x: number, y: number, z: number, code: number, k: number, id: number): void => {
          if (x < 0 || y < 0 || x >= cols || y >= rows) return;
          const i = y * cols + x;
          if (z < zb[i]) { zb[i] = z; ch[i] = code; dz[i] = z; cl[i] = k; idb[i] = id; }
        };
        // spheres (ray cast per cell inside each projected disk)
        S.atoms.forEach((a, id) => {
          if (a.kind === "empty" && !show.vac) return;
          const qp = P(a.p), R = RT[a.el], r = R * s;
          const x0 = Math.max(0, Math.floor((qp.x - r - ox) / cw)), x1 = Math.min(cols - 1, Math.ceil((qp.x + r - ox) / cw));
          const y0 = Math.max(0, Math.floor((qp.y - r - oy) / lh)), y1 = Math.min(rows - 1, Math.ceil((qp.y + r - oy) / lh));
          const ramp = RAMP[a.el], hi = hover && hover === a;
          for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
            const dx = (ox + (x + 0.5) * cw - qp.x) / r, dy = (qp.y - (oy + (y + 0.5) * lh)) / r, d2 = dx * dx + dy * dy;
            if (d2 > 1) continue;
            if (a.kind === "empty") { // faint dotted outline
              if (d2 < 0.62 || (x + y) % 2) continue;
              put(x, y, qp.z, 46, 3, id); continue;
            }
            const nz = Math.sqrt(1 - d2), lam = Math.max(0, dx * L[0] + dy * L[1] + nz * L[2]), sp = Math.max(0, dx * Hh[0] + dy * Hh[1] + nz * Hh[2]);
            let sh = 0.3 + 0.62 * lam + 0.35 * sp ** 24;
            if (C.light) sh = 1 - sh;
            const g = ramp.charCodeAt(Math.max(0, Math.min(ramp.length - 1, Math.floor(sh * ramp.length))));
            put(x, y, qp.z - R * nz, g, hi ? 4 : 0, id);
          }
        });
        // lines (z-buffered, depth interpolated)
        const slope = (dx: number, dy: number): number => { const a = (((Math.atan2(-dy, dx) * 180) / Math.PI + 180) % 180); return a < 22.5 || a >= 157.5 ? 45 : a < 67.5 ? 47 : a < 112.5 ? 124 : 92; };
        const toC = (qp: { x: number; y: number }): [number, number] => [(qp.x - ox) / cw - 0.5, (qp.y - oy) / lh - 0.5];
        const line = (p: V3, q2: V3, k: number, glyph = 0, dash = 1): void => {
          const a = P(p), b = P(q2), [x0, y0] = toC(a), [x1, y1] = toC(b), g = glyph || slope(b.x - a.x, b.y - a.y);
          const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
          for (let i = 0; i <= n; i += dash) { const t = i / n; put(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), a.z + (b.z - a.z) * t + 0.02, g, k, -1); }
        };
        S.edges.forEach(([p, q2]) => line(p, q2, 1));
        S.octs.forEach((o) => {
          if (o.el === "Nb" && show.nb) o.edges.forEach(([i, j]) => line(o.v[i], o.v[j], 2));
          else if (o.el === "Li" && show.li) o.edges.forEach(([i, j]) => line(o.v[i], o.v[j], 2, 0, 2));
          else if (o.el === "empty" && show.vac && (show.nb || show.li)) o.edges.forEach(([i, j]) => line(o.v[i], o.v[j], 3, 46, 3));
        });
        if (show.bonds) S.bonds.forEach(([p, q2]) => line(p, q2, 3, 46));
        // axis triad, lower left, always on top
        if (show.ax) {
          const o: [number, number] = [ox + 12 * cw, oy + (rows - 6) * lh], Lp = 4.2 * Math.max(cw, lh);
          AX.forEach((a) => {
            const [dx, dy] = dir(a.v), len = Math.hypot(dx, dy), e: [number, number] = [o[0] + dx * Lp, o[1] + dy * Lp];
            const [cx0, cy0] = toC({ x: o[0], y: o[1] }), [cx1, cy1] = toC({ x: e[0], y: e[1] });
            const n = Math.max(1, Math.ceil(Math.max(Math.abs(cx1 - cx0), Math.abs(cy1 - cy0)))), g = slope(dx, dy);
            if (len > 0.2) for (let i = 0; i < n; i++) put(Math.round(cx0 + ((cx1 - cx0) * i) / n), Math.round(cy0 + ((cy1 - cy0) * i) / n), -1e9, g, 5, -1);
            const ang = Math.atan2(-dy, dx), head = Math.abs(ang - Math.PI / 2) < Math.PI / 4 ? 94 : Math.abs(ang + Math.PI / 2) < Math.PI / 4 ? 118 : Math.abs(ang) < Math.PI / 4 ? 62 : 60;
            if (len > 0.2) put(Math.round(cx1), Math.round(cy1), -1e9, head, 5, -1);
            const t = a.c ? "c,Ps" : a.t, ux = len > 0.2 ? dx / len : 0, uy = len > 0.2 ? dy / len : -1;
            const off = cw * 1.5 + Math.abs(uy) * lh + Math.abs(ux) * (t.length / 2) * cw, [tx, ty] = toC({ x: e[0] + ux * off, y: e[1] + uy * off });
            [...t].forEach((c, k) => put(Math.round(tx - (t.length - 1) / 2) + k, Math.round(ty), -1e9, c.charCodeAt(0), a.c ? 6 : 5, -1));
          });
        }
        st.idb = idb;
        // output: one string per (row, color bucket)
        const F = rgb(C.fg), F2 = rgb(C.fg2), F3 = rgb(C.fg3), BG = rgb(C.bg), LV = 6, zr = S.halfLong;
        const tone = (k: number, t: number): V3 => (k === 0 ? mix(F, F3, t * 0.75) : k === 1 ? mix(F2, mix(F3, BG, 0.35), t) : k === 2 ? mix(mix(F2, F3, 0.6), mix(F3, BG, 0.5), t) : k === 3 ? mix(F3, BG, 0.2 + 0.45 * t) : k === 4 ? F : k === 6 ? rgb(C.acc) : F2);
        const groups = new Map<number, [number, Uint16Array][]>();
        for (let y = 0; y < rows; y++) {
          const row = new Map<number, Uint16Array>();
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            if (ch[i] === 32) continue;
            const k = cl[i], lvl = k <= 3 ? Math.min(LV - 1, Math.max(0, Math.floor(((dz[i] + zr) / (2 * zr)) * LV))) : 0, key = k * LV + lvl;
            let arr = row.get(key);
            if (!arr) { arr = new Uint16Array(cols).fill(32); row.set(key, arr); }
            arr[x] = ch[i];
          }
          row.forEach((arr, key) => { let g = groups.get(key); if (!g) groups.set(key, (g = [])); g.push([y, arr]); });
        }
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, st.W, st.H);
        ctx.textBaseline = "middle";
        groups.forEach((list, key) => {
          const k = Math.floor(key / LV), c = tone(k, (key % LV) / (LV - 1));
          ctx.font = st.font(k === 4 ? 500 : 400); ctx.fillStyle = `rgb(${c.map(Math.round).join(",")})`;
          list.forEach(([y, arr]) => ctx.fillText(String.fromCharCode(...arr), ox, oy + y * lh + lh / 2 + 0.5));
        });
        const ms = performance.now() - t0;
        st.ms.push(ms); if (st.ms.length > 50) st.ms.shift();
        stage.dataset.ms = ms.toFixed(2);
      },
    };
    return st;
  })() : null;

  // ---------- VISUAL: three.js ----------
  interface GL { size: () => void; render: () => void; dispose: () => void }
  async function makeGL(): Promise<GL> {
    const THREE = await import("three");
    const stage = stageV as HTMLElement, lab = stage.querySelector(".labels") as HTMLElement;
    const { atoms, octs, edges: cellEdges, T } = S1 as Scene, R = RV;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.domElement.className = "gl";
    stage.insertBefore(renderer.domElement, lab);
    const scene3 = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    camera.up.set(0, 0, 1);
    scene3.add(camera);
    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 4, 6); camera.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(4, -2, -3); camera.add(rim);
    scene3.add(amb);
    const sph = new THREE.SphereGeometry(1, 32, 20);
    const mats: Record<string, InstanceType<typeof THREE.MeshStandardMaterial> | InstanceType<typeof THREE.MeshBasicMaterial>> = {};
    (["Nb", "Li", "O"] as const).forEach((el) => { mats[el] = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.05 }); });
    mats.empty = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8 });
    atoms.forEach((a) => {
      const m = new THREE.Mesh(sph, mats[a.el]); m.position.set(...a.p); m.scale.setScalar(R[a.el]);
      scene3.add(m); a.mesh = m;
    });
    const octG = { Nb: new THREE.Group(), Li: new THREE.Group(), empty: new THREE.Group() };
    type OK = keyof typeof octG;
    const faceM = {} as Record<OK, InstanceType<typeof THREE.MeshStandardMaterial>>, edgeM = {} as Record<OK, InstanceType<typeof THREE.LineBasicMaterial> | InstanceType<typeof THREE.LineDashedMaterial>>;
    (["Nb", "Li", "empty"] as const).forEach((el) => {
      faceM[el] = new THREE.MeshStandardMaterial({ transparent: true, opacity: el === "empty" ? 0.06 : 0.22, side: THREE.DoubleSide, depthWrite: false, roughness: 0.8 });
      edgeM[el] = el === "empty" ? new THREE.LineDashedMaterial({ dashSize: 0.18, gapSize: 0.12, transparent: true, opacity: 0.9 }) : new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 });
      scene3.add(octG[el]);
    });
    octs.forEach((o) => {
      const el = o.el as OK;
      const pos = new Float32Array(o.faces.length * 9);
      o.faces.forEach((f, k) => f.forEach((vi, j) => pos.set(o.v[vi], k * 9 + j * 3)));
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.computeVertexNormals();
      octG[el].add(new THREE.Mesh(g, faceM[el]));
      const lp = new Float32Array(o.edges.length * 6);
      o.edges.forEach(([i, j], k) => { lp.set(o.v[i], k * 6); lp.set(o.v[j], k * 6 + 3); });
      const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.BufferAttribute(lp, 3));
      const ls = new THREE.LineSegments(lg, edgeM[el]); if (el === "empty") ls.computeLineDistances();
      octG[el].add(ls);
    });
    const cp = new Float32Array(cellEdges.length * 6);
    cellEdges.forEach(([p, q], k) => { cp.set(p, k * 6); cp.set(q, k * 6 + 3); });
    const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.BufferAttribute(cp, 3));
    const cellM = new THREE.LineBasicMaterial(); scene3.add(new THREE.LineSegments(cg, cellM));
    const hiM = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.9 });
    const hi = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), hiM); hi.visible = false; scene3.add(hi);

    return {
      size() { renderer.setSize(stage.clientWidth, stage.clientHeight, false); },
      dispose() { renderer.dispose(); renderer.domElement.remove(); },
      render() {
        const C = colors(), { B, V } = projV();
        scene3.background = new THREE.Color(C.bg);
        (["Nb", "Li", "O"] as const).forEach((el) => mats[el].color.set(C[el]));
        mats.empty.color.set(C.fg3);
        (["Nb", "Li", "empty"] as const).forEach((el) => { faceM[el].color.set(el === "empty" ? C.fg3 : C[el]); edgeM[el].color.set(el === "empty" ? C.fg2 : C[el]); });
        cellM.color.set(C.fg2);
        octG.Nb.visible = show.nb; octG.Li.visible = show.li; octG.empty.visible = show.vac;
        atoms.forEach((a) => { if (a.kind === "empty" && a.mesh) a.mesh.visible = show.vac; });
        const hv = hover && hover.mesh ? hover : null;
        if (hv) { hi.visible = true; hi.position.set(...hv.p); hi.scale.setScalar(R[hv.el] * 1.45 + 0.05); hiM.color.set(C.fg); } else hi.visible = false;
        camera.left = -V.halfW; camera.right = V.halfW; camera.top = V.halfH; camera.bottom = -V.halfH; camera.zoom = cam.zoom;
        camera.position.set(T[0] + B.e[0] * 60, T[1] + B.e[1] * 60, T[2] + B.e[2] * 60);
        camera.lookAt(T[0], T[1], T[2]); camera.updateProjectionMatrix();
        renderer.render(scene3, camera);
        if (!show.ax) { lab.innerHTML = ""; return; }
        const o: [number, number] = [48, V.H - 34], Lp = 22, f = (v: number): string => v.toFixed(1);
        const tr = AX.map((a) => { const dx = dot(a.v, B.r), dy = -dot(a.v, B.u); return { ...a, e: [o[0] + dx * Lp, o[1] + dy * Lp], l: [o[0] + dx * (Lp + 11), o[1] + dy * (Lp + 11)], len: Math.hypot(dx, dy) }; });
        lab.innerHTML = `<svg width="${V.W}" height="${V.H}">${tr.map((a) => {
          const ux = (a.e[0] - o[0]) / (a.len * Lp || 1), uy = (a.e[1] - o[1]) / (a.len * Lp || 1), h = 5;
          const hd = a.len < 0.25 ? "" : `<path d="M${f(a.e[0])} ${f(a.e[1])}L${f(a.e[0] - ux * h - uy * h * 0.55)} ${f(a.e[1] - uy * h + ux * h * 0.55)}L${f(a.e[0] - ux * h + uy * h * 0.55)} ${f(a.e[1] - uy * h - ux * h * 0.55)}Z"/>`;
          return `<g class="${a.c ? "c" : ""}"><line x1="${f(o[0])}" y1="${f(o[1])}" x2="${f(a.e[0])}" y2="${f(a.e[1])}"/>${hd}</g>`;
        }).join("")}</svg>` + tr.map((a) => `<span class="${a.c ? "ax" : ""}" style="left:${f(a.len < 0.25 ? o[0] + 14 : a.l[0])}px;top:${f(a.len < 0.25 ? o[1] - 10 : a.l[1])}px">${a.c ? "c, P<sub>s</sub>" : a.t.replace(/(\d)/, "<sub>$1</sub>")}</span>`).join("");
      },
    };
  }

  // ---------- mode switching, render on demand ----------
  async function setMode(): Promise<void> {
    const want = isVisual() ? "visual" : "tech";
    if (want === "visual" && figV && !gl && !glFailed) {
      try { gl = await makeGL(); if (!alive) { gl.dispose(); return; } } catch (err) { glFailed = true; console.warn("WebGL renderer unavailable", err); }
    }
    mode = want;
    hover = null; pinned = null; hidePop();
    if (mode === "visual" && gl) gl.size();
    if (mode === "tech" && asc) asc.size();
    paint();
    request();
  }
  function request(): void {
    if (queued || !D) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; if (!alive) return; if (mode === "visual") gl?.render(); else asc?.render(); });
  }
  function paint(): void {
    const rn = figT?.querySelector(".rampnote");
    if (rn) rn.textContent = isLight() ? "ramps reversed on light ground: denser glyph = shadow" : "ramps: shadow to highlight";
    allTog.forEach((b) => { const on = !!show[b.dataset.t as ShowKey]; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    const lg = figV?.querySelector(".legend1");
    if (lg && !lg.innerHTML) {
      const sw = (v: string): string => `<i class="sw" style="background:var(${v})"></i>`;
      lg.innerHTML = `<span>${sw("--nb")}Nb 6a</span><span>${sw("--gold")}Li 6a</span><span><i class="sw o"></i>O 18b</span><span><i class="sw e"></i>empty 6a (dashed O<sub>6</sub>)</span>`;
    }
  }

  // ---------- interaction ----------
  function pickV(cx: number, cy: number): Atom | null {
    const rect = (stageV as HTMLElement).getBoundingClientRect(), x = cx - rect.left, y = cy - rect.top, { P, V } = projV();
    let best: Atom | null = null, bz = Infinity;
    (S1 as Scene).atoms.forEach((a) => {
      if (a.kind === "empty" && !show.vac) return;
      const qp = P(a.p), r = Math.max(6, RV[a.el] * V.s + 2);
      if (Math.hypot(qp.x - x, qp.y - y) <= r && qp.z < bz) { bz = qp.z; best = a; }
    });
    return best;
  }
  function pickT(cx: number, cy: number): Atom | null { // id-buffer lookup of the character cell under the pointer
    const A = asc as Asc, rect = A.stage.getBoundingClientRect(), x = Math.floor((cx - rect.left - A.ox) / A.cw), y = Math.floor((cy - rect.top - A.oy) / A.lh);
    if (x < 0 || y < 0 || x >= A.cols || y >= A.rows) return null;
    const id = A.idb[y * A.cols + x];
    return id >= 0 ? ((show.sup ? S2 : S1) as Scene).atoms[id] : null;
  }
  const clampZ = (z: number): number => Math.max(0.5, Math.min(5, z));
  const setHover = (a: Atom | null): void => { if (a !== hover) { hover = a; request(); } };

  function bind(stage: HTMLElement, kind: "t" | "v"): void {
    const ptrs = new Map<number, { x: number; y: number }>();
    let drag: { x: number; y: number; yaw: number; pitch: number } | null = null, pinch0: { d: number; z: number } | null = null, moved = 0;
    const pick = (x: number, y: number): Atom | null => (!D ? null : kind === "t" ? pickT(x, y) : pickV(x, y));
    const land = (): boolean => kind === "t" && !!asc && asc.W > asc.H * 1.15;
    dis.on(stage, "pointerdown", (e: PointerEvent) => {
      if ((e.target as Element).closest("button")) return;
      try { stage.setPointerCapture(e.pointerId); } catch { /* synthetic or inactive pointer */ }
      if (kind === "t") stage.focus({ preventScroll: true });
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0;
      if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch };
      if (ptrs.size === 2) { const [p, q] = [...ptrs.values()]; pinch0 = { d: Math.hypot(p.x - q.x, p.y - q.y), z: cam.zoom }; drag = null; }
    });
    dis.on(stage, "pointermove", (e: PointerEvent) => {
      if (ptrs.has(e.pointerId)) {
        ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch0 && ptrs.size === 2) { const [p, q] = [...ptrs.values()]; cam.zoom = clampZ((pinch0.z * Math.hypot(p.x - q.x, p.y - q.y)) / Math.max(1, pinch0.d)); moved += 10; request(); return; }
        if (drag) {
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.hypot(dx, dy));
          if (moved > 3) {
            const [a, b] = land() ? [-dy, dx] : [dx, dy]; // landscape TECH: c runs horizontally
            cam.yaw = drag.yaw - a * 0.008; cam.pitch = Math.max(-1.5, Math.min(1.5, drag.pitch + (land() ? -b : b) * 0.008));
            hidePop(); request();
          }
        }
        return;
      }
      if (e.pointerType === "mouse") { const a = pick(e.clientX, e.clientY); setHover(a); if (a) showPop(a, e.clientX, e.clientY); else hidePop(); }
    });
    const up = (e: PointerEvent): void => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch0 = null;
      if (ptrs.size === 0) {
        if (moved <= 3 && e.type === "pointerup") { const a = pick(e.clientX, e.clientY); if (a && a !== pinned) { pinned = a; setHover(a); showPop(a, e.clientX, e.clientY); } else { pinned = null; setHover(null); hidePop(); } }
        drag = null;
      }
    };
    dis.on(stage, "pointerup", up); dis.on(stage, "pointercancel", up);
    dis.on(stage, "pointerleave", (e: PointerEvent) => { if (e.pointerType === "mouse" && !ptrs.size) { setHover(null); hidePop(); } });
    dis.on(stage, "wheel", (e: WheelEvent) => {
      if (kind === "t" && !e.ctrlKey && document.activeElement !== stage) return; // page scrolls until the stage is focused
      e.preventDefault(); cam.zoom = clampZ(cam.zoom * Math.exp(-e.deltaY * 0.0015)); request();
    }, { passive: false });
    if (kind === "t") dis.on(stage, "keydown", (e: KeyboardEvent) => {
      const k = e.key, st = 0.07;
      if (k === "ArrowLeft") cam.yaw += st; else if (k === "ArrowRight") cam.yaw -= st;
      else if (k === "ArrowUp") cam.pitch = Math.min(1.5, cam.pitch + st); else if (k === "ArrowDown") cam.pitch = Math.max(-1.5, cam.pitch - st);
      else if (k === "+" || k === "=") cam.zoom = clampZ(cam.zoom * 1.12); else if (k === "-" || k === "_") cam.zoom = clampZ(cam.zoom / 1.12);
      else if (k === "0" || k === "Home") Object.assign(cam, CELL_DEFAULT);
      else return;
      e.preventDefault(); request();
    });
  }
  if (asc) bind(asc.stage, "t");
  if (stageV) bind(stageV, "v");
  [...(figT?.querySelectorAll("button.reset") ?? []), ...(figV?.querySelectorAll("button.reset") ?? [])].forEach((b) => dis.on(b, "click", () => { Object.assign(cam, CELL_DEFAULT); pinned = null; setHover(null); hidePop(); request(); }));
  allTog.forEach((b) => dis.on(b, "click", () => {
    const k = b.dataset.t as ShowKey;
    show[k] = !show[k];
    if (k === "sup" || (hover?.kind === "empty" && !show.vac)) { hover = null; pinned = null; hidePop(); }
    paint(); request();
  }));

  // readouts (fixed-size rows) and the VISUAL popup
  const roT = figT?.querySelector(".readout") ?? null, roV = figV?.querySelector(".readout1") ?? null;
  const pop = document.createElement("div");
  pop.className = "pop cellpop"; pop.setAttribute("role", "status");
  document.body.appendChild(pop);
  dis.add(() => pop.remove());
  function info(a: Atom): { html: string; line: string } {
    const s = a.src, fr = s.frac.map((v) => v.toFixed(4)).join(", "), ca = s.cart_A.map((v) => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(3)).join(", ");
    const nb = s.neighbors.filter((n) => n.d_A <= 3.1).map((n) => `<tr><td>${n.el}</td><td>&times;${n.n}</td><td class="v">${n.d_A.toFixed(3)}</td></tr>`).join("");
    const head = a.kind === "empty" ? `${s.id} &middot; empty octahedral site &middot; ${s.wyckoff}` : `${s.id} &middot; ${NAME[a.el]} &middot; Wyckoff ${s.wyckoff}`;
    const img = a.image ? `<div class="dim">periodic image at (${a.f.map((v) => v.toFixed(4)).join(", ")})</div>` : "";
    const nn = s.neighbors.filter((n) => n.d_A < (a.el === "O" ? 2.3 : 3.1)).map((n) => `${n.el} ${n.d_A.toFixed(3)} ×${n.n}`).join(", ");
    return {
      html: `<div class="h">${head}</div><div>frac (x, y, z) <span class="v">${fr}</span></div><div>cart <span class="v">${ca}</span> &Aring;</div>${img}<table class="nn"><thead><tr><th>neighbor</th><th>n</th><th>d (&Aring;)</th></tr></thead><tbody>${nb}</tbody></table>`,
      line: `${s.id} · ${a.kind === "empty" ? "empty octahedral site" : a.el} · ${s.wyckoff} · frac (${fr})${a.image ? " image" : ""} · nearest: ${nn} Å`,
    };
  }
  function showPop(a: Atom, cx: number, cy: number): void {
    const I = info(a);
    if (mode === "tech") { if (roT) roT.textContent = I.line; return; }
    pop.innerHTML = I.html; if (roV) roV.textContent = I.line; pop.classList.add("show");
    const b = document.body.getBoundingClientRect(), vw = document.documentElement.clientWidth, w = pop.offsetWidth, h = pop.offsetHeight;
    let x = cx + 14, y = cy + 14;
    if (x + w > vw - 8) x = Math.max(8, cx - w - 14);
    if (y + h > innerHeight - 8) y = Math.max(8, cy - h - 14);
    pop.style.left = `${x - b.left - document.body.clientLeft}px`; pop.style.top = `${y - b.top - document.body.clientTop}px`;
  }
  function hidePop(): void { pop.classList.remove("show"); if (roT) roT.textContent = INSTR_T; if (roV) roV.textContent = INSTR_V; }
  hidePop();

  // ---------- lifecycle ----------
  dis.add(onUi(() => { if (D) void setMode(); }));
  const resize = (): void => { if (!D) return; if (mode === "tech") asc?.size(); else gl?.size(); request(); };
  if (asc) dis.observe(asc.stage, resize);
  if (stageV) dis.observe(stageV, resize);
  let started = false;
  const start = async (): Promise<void> => {
    if (started) return; started = true;
    await load();
    if (!alive || !D) return;
    try { await document.fonts.load('400 10px "IBM Plex Mono"'); await document.fonts.load('500 10px "IBM Plex Mono"'); } catch { /* font fallback */ }
    if (alive) await setMode();
  };
  const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); void start(); } }, { rootMargin: "200px" });
  [figT, figV].forEach((f) => f && io.observe(f));
  dis.add(() => io.disconnect());
  dis.add(() => { alive = false; gl?.dispose(); });
  return dis.run;
}

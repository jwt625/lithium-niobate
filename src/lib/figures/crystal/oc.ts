// 1.1 VISUAL figure: the three octahedral columns of the hexagonal cell, level by level.
// Left: side view of the columns at hexagonal (0, 0), (2/3, 1/3), (1/3, 2/3), six octahedral levels per c (centroids every c/6,
// from the cell file's columns_along_c), occupant per level, cations drawn at their CIF heights (off-centre along +c), heights to
// scale; octahedron outlines schematic. Right: top view of the selected level: the oxygen layers below and above (CIF positions)
// and the three octahedral sites of that level in a 2 x 2 block of cells. At every level one site holds Nb, one Li, one is empty.
// Pure render functions (server and client) plus a small mount for the level slider. Data: hsu1997 via COD 2101845 (P-db).
import { octcol } from "$lib/stores/crystal";
import { Disposer, onUi } from "../dom.ts";

type V3 = [number, number, number];
export type Occ = "Nb" | "Li" | "empty";
export interface OcData {
  a: number; c: number;
  /** column positions (fractional xy) and their six levels (centroid z, occupant) */
  cols: { xy: [number, number]; lv: { z: number; occ: Occ }[] }[];
  /** cations (fractional) */
  cat: { el: "Nb" | "Li"; f: V3 }[];
  /** O positions grouped in six layers (fractional), layer n at z = 1/12 + n/6 */
  oLayers: V3[][];
}

const f1 = (v: number): string => v.toFixed(1);
const COLX = [80, 205, 330];
const COLLAB = ["(0, 0)", "(&#8532;, &#8531;)", "(&#8531;, &#8532;)"];
const Y0 = 606, Y1 = 82; // z = 0 and z = 1
const yz = (z: number): number => Y0 + (Y1 - Y0) * z;

/** Side view of the three columns with the selected level highlighted. viewBox 0 0 420 640. */
export function sideSVG(D: OcData, k: number): string {
  const pxA = (Y0 - Y1) / D.c; // px per Angstrom along c
  const h = (Y0 - Y1) / 6, w = 52; // octahedron height c/6 (to scale); width schematic
  let s = "";
  // oxygen layers
  for (let n = 0; n < 6; n++) { const y = yz(1 / 12 + n / 6); s += `<line class="oc-ol" x1="34" y1="${f1(y)}" x2="392" y2="${f1(y)}"/>`; }
  s += `<text class="oc-olt" x="30" y="${f1(yz(1 / 12) + 4)}" text-anchor="end">O</text>`;
  const zk = D.cols[0].lv[k].z;
  D.cols.forEach((col, ci) => {
    const x = COLX[ci];
    s += `<text class="oc-cl" x="${x}" y="22" text-anchor="middle">${COLLAB[ci]}</text>`;
    col.lv.forEach((L, li) => {
      const y = yz(L.z), on = li === k;
      const pts = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w * 0.78, y], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2], [x - w * 0.78, y]].map(([a, b]) => `${f1(a)},${f1(b)}`).join(" ");
      s += `<polygon class="oc-oct ${L.occ}${on ? " on" : ""}" points="${pts}"/>`;
      if (L.occ === "empty") s += `<circle class="oc-ctr" cx="${x}" cy="${f1(y)}" r="2.5"/>`;
    });
  });
  // cations at their CIF heights (one image per column inside [0, 1))
  for (const t of D.cat) {
    const ci = D.cols.findIndex((col) => Math.abs(col.xy[0] - t.f[0]) < 1e-3 && Math.abs(col.xy[1] - t.f[1]) < 1e-3);
    if (ci < 0) continue;
    const z = t.f[2] - Math.floor(t.f[2]);
    s += `<circle class="oc-cat ${t.el}" cx="${COLX[ci]}" cy="${f1(yz(z))}" r="${t.el === "Nb" ? 7 : 6}"/>`;
  }
  // selected level, drawn on top
  s += `<rect class="oc-band" x="34" y="${f1(yz(zk) - h / 2)}" width="350" height="${f1(h)}"/>`;
  // scale bar: 2 Angstrom
  s += `<path class="oc-sb" d="M404 ${f1(Y0)}V${f1(Y0 - 2 * pxA)}M400 ${f1(Y0)}H408M400 ${f1(Y0 - 2 * pxA)}H408"/><text class="oc-sbt" x="404" y="${f1(Y0 + 18)}" text-anchor="middle">2 &Aring;</text>`;
  s += `<text class="oc-ax" x="404" y="${f1(Y1 - 14)}" text-anchor="middle">+c</text><path class="oc-axp" d="M404 ${f1(Y1 + 30)}V${f1(Y1 - 6)}M399 ${f1(Y1 + 1)}L404 ${f1(Y1 - 7)}L409 ${f1(Y1 + 1)}"/>`;
  return s;
}

/** Top view (projection along c) of level k: O layer below (filled), O layer above (open), the octahedral sites of the level.
 *  viewBox 0 0 420 300. 2 x 2 cells. */
export function topSVG(D: OcData, k: number): string {
  const s = 24.5, a = D.a, ox = 147, oy = 259;
  const P = (fx: number, fy: number): [number, number] => [ox + s * a * (fx - fy / 2), oy - s * a * (fy * Math.sqrt(3) / 2)];
  let o = "";
  for (let i = 0; i <= 2; i++) { const [x1, y1] = P(i, 0), [x2, y2] = P(i, 2); o += `<line class="oc-cell" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}"/>`; }
  for (let j = 0; j <= 2; j++) { const [x1, y1] = P(0, j), [x2, y2] = P(2, j); o += `<line class="oc-cell" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}"/>`; }
  const imgs = (f: V3, fn: (x: number, y: number) => void): void => {
    for (let i = -1; i <= 2; i++) for (let j = -1; j <= 2; j++) { const fx = f[0] + i, fy = f[1] + j; if (fx > -0.02 && fx < 2.02 && fy > -0.02 && fy < 2.02) { const [x, y] = P(fx, fy); fn(x, y); } }
  };
  const below = D.oLayers[k], above = D.oLayers[(k + 1) % 6];
  below.forEach((f) => imgs(f, (x, y) => { o += `<circle class="oc-ob" cx="${f1(x)}" cy="${f1(y)}" r="7"/>`; }));
  above.forEach((f) => imgs(f, (x, y) => { o += `<circle class="oc-oa" cx="${f1(x)}" cy="${f1(y)}" r="7"/>`; }));
  D.cols.forEach((col) => {
    const occ = col.lv[k].occ;
    imgs([col.xy[0], col.xy[1], 0], (x, y) => {
      if (occ === "empty") o += `<rect class="oc-site empty" x="${f1(x - 7)}" y="${f1(y - 7)}" width="14" height="14" transform="rotate(45 ${f1(x)} ${f1(y)})"/>`;
      else o += `<rect class="oc-site ${occ}" x="${f1(x - 8)}" y="${f1(y - 8)}" width="16" height="16" transform="rotate(45 ${f1(x)} ${f1(y)})"/>`;
    });
  });
  const [ax, ay] = P(1, 0), [bx, by] = P(0, 1);
  o += `<text class="oc-lab" x="${f1(ax)}" y="${f1(ay + 22)}" text-anchor="middle">a&#8321;</text><text class="oc-lab" x="${f1(bx - 16)}" y="${f1(by)}" text-anchor="end">a&#8322;</text>`;
  return o;
}

export function ocReadout(D: OcData, k: number): { lvl: string; z: string; occ: string; o: string } {
  const z = D.cols[0].lv[k].z;
  const name = (x: Occ): string => (x === "empty" ? "empty" : x);
  return {
    lvl: `${k + 1} of 6`,
    z: `${z.toFixed(4)} c = ${(z * D.c).toFixed(3)} Å`,
    occ: D.cols.map((col, i) => `${["(0, 0)", "(⅔, ⅓)", "(⅓, ⅔)"][i]} ${name(col.lv[k].occ)}`).join(" · "),
    o: `z = ${(1 / 12 + k / 6).toFixed(4)} and ${(((1 / 12 + (k + 1) / 6) % 1)).toFixed(4)}`,
  };
}

export function mountOc(root: HTMLElement | null, D: OcData): () => void {
  if (!root) return () => {};
  const dis = new Disposer();
  const side = root.querySelector<SVGSVGElement>("svg.oc-side"), top = root.querySelector<SVGSVGElement>("svg.oc-top");
  const inp = root.querySelector<HTMLInputElement>("input.oc-k"), out = root.querySelector<HTMLOutputElement>("output.oc-ko");
  const ro = (k: string): HTMLElement | null => root.querySelector<HTMLElement>(`[data-oc="${k}"]`);
  const paint = (): void => {
    const k = octcol.k;
    if (side) side.innerHTML = sideSVG(D, k);
    if (top) top.innerHTML = topSVG(D, k);
    const r = ocReadout(D, k);
    if (out) out.value = r.lvl;
    (["z", "occ", "o"] as const).forEach((key) => { const e = ro(key); if (e) e.textContent = r[key]; });
    if (inp && +inp.value !== k) inp.value = String(k);
  };
  if (inp) dis.on(inp, "input", () => { octcol.k = Math.max(0, Math.min(5, Math.round(+inp.value))); paint(); });
  root.querySelectorAll<HTMLButtonElement>("button[data-oc-step]").forEach((b) => dis.on(b, "click", () => { octcol.k = (octcol.k + Number(b.dataset.ocStep) + 6) % 6; paint(); }));
  dis.add(onUi(paint));
  if (octcol.k !== 0) paint();
  return dis.run;
}

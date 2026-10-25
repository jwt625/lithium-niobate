// FIG-01-07 Which face is +z (content/chapters/01-crystal/figures.md; manuscript Sec. 7 L2 axes table).
// Three qualitative tests on one z-cut plate, signs from the axis rules: compression along c leaves the +z face negative
// (weis1985 pp. 192-193; IEEE 176: +Z gives positive d33), cooling leaves it positive (weis1985 p. 196, p3 < 0), and a
// selective etch attacks the -z face much faster (volk2008 p. 168). Charges are signs only: no magnitudes are computed.
// Face A is the upper face as drawn, face B the lower; "turn over" rotates the plate (with its polarization) by 180 deg.
// TECH: ASCII blocks redrawn from state. VISUAL: static SVG stations whose parts are switched by data attributes, so the
// vice, thermometer and etch states animate through CSS only when effects are on (final state only under reduced motion).
import { plusz as store } from "$lib/stores/crystal";
import { Disposer } from "../dom.ts";
import { FS } from "../fmt.ts";

export type PzTest = "sq" | "cool" | "etch";
export interface PzState { flip: boolean; sq: boolean; cool: boolean; etch: boolean }
export const PZ_TESTS: PzTest[] = ["sq", "cool", "etch"];

/** Sign left on the +z face by a test (null for etch, which marks the -z face by roughness). */
const PLUS_Z_SIGN: Record<PzTest, "+" | "-" | null> = { sq: "-", cool: "+", etch: null };

// ---------- TECH ASCII (13 rows x 30 columns, fixed) ----------
const W = 30;
const row = (s: string): string => (s + " ".repeat(W)).slice(0, W);
const put = (s: string, col: number, t: string): string => s.slice(0, col) + t + s.slice(col + t.length);
function plate(lines: string[], top: number, x0: number, w: number, zUp: boolean, topEdge: string, botEdge: string): void {
  lines[top] = put(lines[top], x0, topEdge);
  for (let r = top + 1; r <= top + 3; r++) lines[r] = put(lines[r], x0, `|${" ".repeat(w - 2)}|`);
  lines[top + 4] = put(lines[top + 4], x0, botEdge);
  const c = x0 + Math.floor(w / 2) - 1;
  const arrow = zUp ? ["^", "|", "|"] : ["|", "|", "v"];
  arrow.forEach((ch, k) => (lines[top + 1 + k] = put(lines[top + 1 + k], c, ch)));
  lines[top + 2] = put(lines[top + 2], c + 2, "Ps");
}
const chargeRow = (sign: string | null, n: number): string => Array.from({ length: n }, () => sign ?? ".").join(" ");

export function pzAscii(t: PzTest, s: PzState): string {
  const L = Array.from({ length: 13 }, () => row(""));
  const zUp = !s.flip, on = s[t];
  const plusSign = PLUS_Z_SIGN[t];
  const signA = on && plusSign ? (zUp ? plusSign : plusSign === "+" ? "-" : "+") : null;
  const signB = signA ? (signA === "+" ? "-" : "+") : null;
  if (t === "sq") {
    const jaw = "====####====";
    L[0] = put(L[0], 10, "||");
    if (on) { L[0] = put(L[0], 7, "F"); L[1] = put(L[1], 10, "||"); L[2] = put(L[2], 5, jaw); L[10] = put(L[10], 5, jaw); L[11] = put(L[11], 10, "||"); L[12] = put(L[12], 7, "F"); }
    else { L[1] = put(L[1], 5, jaw); L[11] = put(L[11], 5, jaw); }
    L[12] = put(L[12], 10, "||");
    L[3] = put(L[3], 2, chargeRow(signA, 9)); L[9] = put(L[9], 2, chargeRow(signB, 9));
    plate(L, 4, 1, 20, zUp, "+------------------+", "+------------------+");
    L[3] = put(L[3], 24, "A"); L[9] = put(L[9], 24, "B");
  } else if (t === "cool") {
    L[1] = put(L[1], 2, on ? "T falling   dT < 0" : "T steady    dT = 0");
    L[3] = put(L[3], 2, chargeRow(signA, 9)); L[9] = put(L[9], 2, chargeRow(signB, 9));
    plate(L, 4, 1, 20, zUp, "+------------------+", "+------------------+");
    L[10] = put(L[10], 0, "[======================]");
    L[11] = put(L[11], 0, "| n p n p n p n p n p  |");
    L[12] = put(L[12], 0, "[======================]");
    L[3] = put(L[3], 24, "A"); L[9] = put(L[9], 24, "B");
  } else {
    const smooth = "+----------------+", rough = "+/\\/\\/\\/\\/\\/\\/\\/\\+";
    const roughA = on && !zUp, roughB = on && zUp;
    L[1] = put(L[1], 0, "|~~~~~~~~~~~~~~~~~~~~~~|");
    for (let r = 2; r <= 10; r++) { L[r] = put(L[r], 0, "|"); L[r] = put(L[r], 23, "|"); }
    plate(L, 4, 3, 18, zUp, roughA ? rough : smooth, roughB ? rough : smooth);
    L[11] = put(L[11], 0, "+----------------------+");
    L[4] = put(L[4], 26, "A"); L[8] = put(L[8], 26, "B");
  }
  return L.map((l) => l.replace(/\s+$/, "")).join("\n");
}

// ---------- readout (one line, fixed 28 ch) ----------
const padR = (x: string, n: number): string => x + FS.repeat(Math.max(0, n - x.length));
export function pzReadout(t: PzTest, s: PzState): string {
  const zUp = !s.flip, on = s[t];
  if (t === "etch") {
    const a = on && !zUp ? "rough " : "smooth", b = on && zUp ? "rough " : "smooth";
    return padR(`A ${a}  B ${b}  +z = ${on ? (zUp ? "A" : "B") : "?"}`, 28);
  }
  const plus = PLUS_Z_SIGN[t] === "+";
  const aPos = zUp === plus;
  const w = (pos: boolean): string => (pos ? "pos" : "neg");
  return on ? padR(`A ${w(aPos)}  B ${w(!aPos)}  +z = ${zUp ? "A" : "B"}`, 28) : padR("A 0    B 0    +z = ?", 28);
}

// ---------- VISUAL stations (static SVG; state through data-on / data-flip on the station element) ----------
// Plate frame: centre (150, 140), 160 x 64; the +z face is the face the Ps arrow points to (top before turning over).
const PX = 70, PY = 108, PW = 160, PH = 64;
const MARK_X = [84, 104, 124, 176, 196, 216];
function marks(y: number, sign: "+" | "-", cls: string): string {
  return `<g class="${cls}">${MARK_X.map((x) => `<g transform="translate(${x} ${y})"><circle r="6.5"/><path d="${sign === "+" ? "M-3.5 0H3.5M0 -3.5V3.5" : "M-3.5 0H3.5"}"/></g>`).join("")}</g>`;
}
function plateSvg(t: PzTest): string {
  let o = `<g class="pz-plate">`;
  o += `<rect class="pz-ln" x="${PX}" y="${PY}" width="${PW}" height="${PH}"/>`;
  if (t === "etch") {
    let zig = `M${PX} ${PY + PH}`;
    for (let x = PX + 5, k = 0; x <= PX + PW; x += 5, k++) zig += `L${x} ${PY + PH + (k % 2 ? 0 : 4.5)}`;
    o += `<path class="pz-face pz-sm" d="M${PX} ${PY}H${PX + PW}"/><path class="pz-face pz-smb" d="M${PX} ${PY + PH}H${PX + PW}"/><path class="pz-face pz-rough" d="${zig}"/>`;
    o += `<path class="pz-side" d="M${PX} ${PY}V${PY + PH}M${PX + PW} ${PY}V${PY + PH}"/>`;
  } else {
    o += `<rect class="pz-edge" x="${PX}" y="${PY}" width="${PW}" height="${PH}"/>`;
    const s = PLUS_Z_SIGN[t] as "+" | "-";
    o += marks(PY + 10, s, "pz-q") + marks(PY + PH - 10, s === "+" ? "-" : "+", "pz-q");
  }
  o += `<g class="pz-ps"><line x1="150" y1="${PY + PH - 12}" x2="150" y2="${PY + 22}"/><path d="M150 ${PY + 10}l-6 13h12z"/></g>`;
  return `${o}</g><text class="pz-pst" x="158" y="${PY + PH / 2 + 5}">P<tspan dy="4" font-size="10">s</tspan></text>`;
}
const faceLabels = `<text class="pz-fl" x="${PX + PW + 14}" y="${PY + 5}">A</text><text class="pz-fl" x="${PX + PW + 14}" y="${PY + PH + 5}">B</text>`;

export function pzSvg(t: PzTest): string {
  let o = "";
  if (t === "sq") {
    o += `<path class="pz-metal" d="M36 30H200V44H52V236H200V250H36Z"/>`; // C frame of the vice
    o += `<rect class="pz-jaw" x="96" y="${PY + PH}" width="108" height="16"/>`; // fixed lower jaw
    o += `<g class="pz-mov"><rect class="pz-jaw" x="96" y="${PY - 16}" width="108" height="16"/><rect class="pz-rod" x="146" y="26" width="8" height="${PY - 42}"/><rect class="pz-metal" x="118" y="18" width="64" height="8"/></g>`;
    o += `<g class="pz-force"><path d="M222 60V88M216 80l6 10 6 -10"/><text x="230" y="80">F</text><path d="M222 220V196M216 204l6 -10 6 10"/><text x="230" y="214">F</text></g>`;
    o += plateSvg(t) + faceLabels;
  } else if (t === "cool") {
    o += plateSvg(t) + faceLabels;
    o += `<rect class="pz-cer" x="60" y="${PY + PH}" width="176" height="7"/><rect class="pz-cer" x="60" y="${PY + PH + 33}" width="176" height="7"/>`;
    for (let k = 0; k < 9; k++) o += `<rect class="pz-pel${k % 2 ? " n" : ""}" x="${62 + k * 20}" y="${PY + PH + 9}" width="12" height="22"/>`;
    o += `<path class="pz-wire" d="M236 ${PY + PH + 14}H270M236 ${PY + PH + 26}H270"/>`;
    o += `<g class="pz-th"><rect class="pz-tube" x="262" y="34" width="12" height="96"/><circle class="pz-bulb" cx="268" cy="140" r="10"/><rect class="pz-hg" x="265" y="40" width="6" height="96"/></g>`;
    o += `<g class="pz-cold"><path d="M268 22V8M262 16l6 8 6 -8"/></g>`;
  } else {
    o += `<rect class="pz-liq" x="38" y="70" width="224" height="152"/><path class="pz-surf" d="M38 70q14 -5 28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0"/>`;
    o += `<path class="pz-dish" d="M34 52V226H266V52"/>`;
    o += plateSvg(t) + faceLabels;
  }
  return o;
}

// ---------- client mount ----------
export function mountPlusZ(figT: HTMLElement | null, figV: HTMLElement | null): () => void {
  const dis = new Disposer();
  const roots = [figT, figV].filter(Boolean) as HTMLElement[];
  const all = <T extends Element>(sel: string): T[] => roots.flatMap((r) => [...r.querySelectorAll<T>(sel)]);
  function paint(): void {
    for (const t of PZ_TESTS) {
      const a = pzAscii(t, store), r = pzReadout(t, store);
      all<HTMLElement>(`.pz-a[data-t="${t}"]`).forEach((e) => { if (e.textContent !== a) e.textContent = a; });
      all<HTMLElement>(`.pz-ro[data-t="${t}"]`).forEach((e) => { if (e.textContent !== r) e.textContent = r; });
      all<HTMLElement>(`[data-pz-st="${t}"]`).forEach((e) => { e.dataset.on = store[t] ? "1" : "0"; e.dataset.flip = store.flip ? "1" : "0"; });
    }
    all<HTMLButtonElement>("button[data-pz]").forEach((b) => {
      const k = b.dataset.pz as keyof typeof store | "reset";
      if (k === "reset") return;
      b.classList.toggle("on", store[k]); b.setAttribute("aria-pressed", String(store[k]));
    });
  }
  for (const b of all<HTMLButtonElement>("button[data-pz]")) dis.on(b, "click", () => {
    const k = b.dataset.pz as keyof typeof store | "reset";
    if (k === "reset") { store.flip = store.sq = store.cool = store.etch = false; }
    else store[k] = !store[k];
    paint();
  });
  paint();
  return dis.run;
}

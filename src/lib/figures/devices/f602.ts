// F6.02 Modulator bench: MZM transfer T(V) with operating point and swing, and the optical eye (NRZ / PAM4) for a drive
// with a first-order low-pass at the modulator 3 dB bandwidth. Physics: modulator.ts (mzmTransmission, prbs),
// devices.ts (eyeDiagramPAM, eyeOpeningsPAM, symbolsFromBits). Inputs: template V_pi / f3dB or an atlas row.
import { mzmTransmission, prbs } from "$lib/physics/modulator.ts";
import { eyeDiagramPAM, eyeOpeningsPAM, symbolsFromBits } from "$lib/physics/devices.ts";
import { Plot, type Look } from "./svgplot.ts";
import { pad, sgn, FS } from "../fmt.ts";
import type { Dev } from "./atlas.ts";

export interface BenchState { [k: string]: number | string | boolean; vpi: number; f3: number; phiB: number; vpp: number; baud: number; fmt: string; dev: string }
export const BENCH_DEFAULT: BenchState = { vpi: 2.0, f3: 100, phiB: -90, vpp: 1.0, baud: 100, fmt: "nrz", dev: "" };
export interface BenchDev { id: string; lb?: string; yr: number; vpi: number; vsrc: string; f3: number; gt: boolean; conv: string; pl: string }

/** Atlas rows usable by the bench: TFLN / TFLT MZM or IQ device rows with a V_pi (RF preferred) and a 3 dB bandwidth. */
export function benchDevices(devs: Dev[]): BenchDev[] {
  return devs.filter((d) => d.row_kind === "device" && (d.device_class === "mzm" || d.device_class === "iq_mzm") && (d.platform === "TFLN" || d.platform === "TFLT") && (d.vpi_rf_v != null || d.vpi_dc_v != null) && d.bw3db_ghz != null)
    .map((d) => ({ id: d.device_id, yr: d.year ?? 0, vpi: (d.vpi_rf_v ?? d.vpi_dc_v) as number, vsrc: d.vpi_rf_v != null ? "RF" : "DC", f3: d.bw3db_ghz as number, gt: /bw3db_ghz:gt/.test(d.qualifiers ?? ""), conv: d.vpi_convention ?? "unspecified", pl: d.platform }))
    .sort((a, b) => a.yr - b.yr || a.id.localeCompare(b.id));
}

const SPS = 64;
let cache: { key: string; T: Float64Array; hist: Uint32Array; W: number; H: number; open: number } | null = null;
/** Eye record for the state (memoized on the inputs that change it). */
export function eye(s: BenchState): { T: Float64Array; hist: Uint32Array; W: number; H: number; open: number } {
  const M = s.fmt === "pam4" ? 4 : 2;
  const key = [s.vpi, s.f3, s.phiB, s.vpp, s.baud, M].join("|");
  if (cache?.key === key) return cache;
  const bits = prbs(9, M === 4 ? 1022 : 511);
  const sym = M === 4 ? symbolsFromBits(bits, 4) : bits;
  const r = eyeDiagramPAM({ symbols: sym, M, baud: s.baud * 1e9, samplesPerSymbol: SPS, Vpp: s.vpp, Vpi: s.vpi, phi_b: (s.phiB * Math.PI) / 180, f3dB_Hz: s.f3 * 1e9, filter: "first-order", W: 2 * SPS, H: 150 });
  let ops = eyeOpeningsPAM(r.T, sym, M, SPS, SPS / 2, 8);
  if (ops.every((o) => o < 0)) ops = ops.map((o) => -o); // bias beyond null: T falls with drive level
  cache = { key, ...r, open: Math.max(0, Math.min(...ops)) };
  return cache;
}

export function benchOuts(s: BenchState): Record<string, string> {
  const t1 = mzmTransmission(s.vpp / 2, s.vpi, (s.phiB * Math.PI) / 180), t0 = mzmTransmission(-s.vpp / 2, s.vpi, (s.phiB * Math.PI) / 180);
  const er = 10 * Math.log10(Math.max(t0, t1) / Math.max(1e-12, Math.min(t0, t1)));
  const e = eye(s);
  return {
    vpi: `${pad(s.vpi.toFixed(2), 5)} V`, bias: `${pad(sgn(s.phiB, 1), 6)}°`, vr: pad((s.vpp / s.vpi).toFixed(2), 4), er: `${er > 99.9 ? "&gt;99.9" : pad(er.toFixed(1), 5)} dB`,
    eye: pad(e.open.toFixed(2), 4), vpp: `${pad(s.vpp.toFixed(2), 5)} V`, baud: `${pad(s.baud.toFixed(0), 3)} GBd`, f3: `${pad(s.f3.toFixed(0), 3)} GHz`, phib: `${pad(sgn(s.phiB, 0), 4)}°`,
    t0: pad(mzmTransmission(0, s.vpi, (s.phiB * Math.PI) / 180).toFixed(3), 5),
    ratio: pad((s.baud / s.f3).toFixed(2), 5),
    dphi: `${pad(sgn(s.phiB, 1), 6)}° ± ${pad(((90 * s.vpp) / s.vpi).toFixed(1), 5)}°`,
  };
}

/** T(V) over -2 V_pi..2 V_pi with operating point (bias) and the drive swing. */
export function benchTF(s: BenchState, w: number, h: number, look: Look): string {
  const phi = (s.phiB * Math.PI) / 180, V2 = 2 * s.vpi;
  const p = new Plot({ w, h, look, x: { min: -V2, max: V2, label: "drive voltage V (V)" }, y: { min: 0, max: 1, label: "transmission T", ticks: [0, 0.25, 0.5, 0.75, 1] } }).axes();
  const pts: [number, number][] = [];
  for (let i = 0; i <= 240; i++) { const V = -V2 + (2 * V2 * i) / 240; pts.push([V, mzmTransmission(V, s.vpi, phi)]); }
  p.vline(-s.vpi, "ref").vline(s.vpi, "ref");
  p.line(pts, "cur");
  const a = Math.max(-V2, -s.vpp / 2), b = Math.min(V2, s.vpp / 2);
  const sw: [number, number][] = [];
  for (let i = 0; i <= 60; i++) { const V = a + ((b - a) * i) / 60; sw.push([V, mzmTransmission(V, s.vpi, phi)]); }
  p.line(sw, look === "tech" ? "cur swing" : "ir1550 swing");
  const yb = p.y0 - (look === "tech" ? 8 : 10);
  p.add(`<path class="ref" d="M${p.sx(a).toFixed(1)} ${yb - 4}V${yb}H${p.sx(b).toFixed(1)}V${yb - 4}"/>`);
  p.add(`<circle class="pt0" cx="${p.sx(0).toFixed(1)}" cy="${p.sy(mzmTransmission(0, s.vpi, phi)).toFixed(1)}" r="${look === "tech" ? 3.5 : 6}"/>`);
  p.text(p.sx(s.vpi) + 3, p.y1 + (look === "tech" ? 10 : 14), "V<tspan dy='3' font-size='0.8em'>π</tspan>", "lab");
  return p.svg(`dv-plot ${look}`, "MZM transmission versus drive voltage");
}

/** Eye density raster on a canvas: 2 unit intervals across, T from -0.1 to 1.1 down. */
export function drawEye(c: HTMLCanvasElement, s: BenchState, look: Look, colors: { bg: string; fg: string; rule: string; tx: string }): void {
  const e = eye(s);
  const k = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(c.clientWidth)), h = Math.max(1, Math.round(c.clientHeight));
  c.width = Math.round(w * k); c.height = Math.round(h * k);
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.fillStyle = colors.bg; g.fillRect(0, 0, w, h);
  const off = document.createElement("canvas");
  off.width = e.W; off.height = e.H;
  const og = off.getContext("2d") as CanvasRenderingContext2D;
  const img = og.createImageData(e.W, e.H);
  let mx = 1;
  for (let i = 0; i < e.hist.length; i++) mx = Math.max(mx, e.hist[i]);
  const fg = hexRGB(colors.fg), bg = hexRGB(colors.bg);
  for (let i = 0; i < e.hist.length; i++) {
    const v = e.hist[i] ? 0.25 + 0.75 * Math.sqrt(e.hist[i] / mx) : 0;
    img.data[4 * i] = bg[0] + (fg[0] - bg[0]) * v; img.data[4 * i + 1] = bg[1] + (fg[1] - bg[1]) * v; img.data[4 * i + 2] = bg[2] + (fg[2] - bg[2]) * v; img.data[4 * i + 3] = 255;
  }
  og.putImageData(img, 0, 0);
  g.imageSmoothingEnabled = true;
  const m = look === "tech" ? 6 : 10;
  g.drawImage(off, m, m, w - 2 * m, h - 2 * m);
  g.strokeStyle = colors.rule; g.lineWidth = 1;
  g.strokeRect(m + 0.5, m + 0.5, w - 2 * m - 1, h - 2 * m - 1);
  // T = 0 and T = 1 reference lines
  for (const T of [0, 1]) { const y = m + ((1.1 - T) / 1.2) * (h - 2 * m); g.beginPath(); g.setLineDash([3, 3]); g.moveTo(m, Math.round(y) + 0.5); g.lineTo(w - m, Math.round(y) + 0.5); g.stroke(); }
  g.setLineDash([]);
  g.fillStyle = colors.tx; g.font = look === "tech" ? "10px 'IBM Plex Mono', monospace" : "13px Inter, sans-serif";
  g.fillText("T = 1", m + 4, m + ((1.1 - 1) / 1.2) * (h - 2 * m) - 4);
  g.fillText("T = 0", m + 4, m + ((1.1 - 0) / 1.2) * (h - 2 * m) - 4);
  g.fillText(`2 UI = ${(2000 / s.baud).toFixed(1)} ps`, w - m - (look === "tech" ? 108 : 130), h - m - 6);
}
function hexRGB(c: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(c.trim());
  if (m) { const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  const r = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
  return r ? [Number(r[1]), Number(r[2]), Number(r[3])] : [128, 128, 128];
}
export const FIGSPACE = FS;

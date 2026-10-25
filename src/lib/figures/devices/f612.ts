// F6.12 IDT launching a SAW across a waveguide. Acoustic wavelength = IDT period = v / f (devices.ts idtPeriod;
// single-electrode IDT, two fingers per period, finger width lambda/4). v: free-surface SAW velocity of the chosen cut
// from the partial-wave solver (saw.ts sawCut) with kushibiki1999 constants, computed at build time (derived).
import { idtPeriod } from "$lib/physics/devices.ts";
import { pad } from "../fmt.ts";
import type { Look } from "./svgplot.ts";

export interface Cut { id: string; label: string; v: number; branch: string }
export interface IdtState { [k: string]: number | string | boolean; f: number; cut: string }
export const IDT_DEFAULT: IdtState = { f: 2, cut: "128" };
export const lamUm = (s: IdtState, cuts: Cut[]): number => idtPeriod((cuts.find((c) => c.id === s.cut) ?? cuts[0]).v, s.f * 1e9) * 1e6;
export function idtOuts(s: IdtState, cuts: Cut[]): Record<string, string> {
  const l = lamUm(s, cuts), c = cuts.find((x) => x.id === s.cut) ?? cuts[0];
  return { lam: `${pad(l.toFixed(3), 6)} µm`, pitch: `${pad(l.toFixed(3), 6)} µm`, finger: `${pad((l / 4).toFixed(3), 6)} µm`, f: `${pad(s.f.toFixed(2), 4)} GHz`, v: `${c.v.toFixed(1)} m/s` };
}
/** Top view at a fixed 16 px per um (doubling f halves the pitch on screen). IDT on the left, crests travel +x across a
 *  waveguide that runs along y. TECH: line drawing; VISUAL: Au fingers, ripple crests, dashed 1550 nm waveguide. */
export function idtArt(s: IdtState, cuts: Cut[], w: number, h: number, look: Look): string {
  const k = look === "tech" ? 14 : 18; // px per um
  const lam = lamUm(s, cuts) * k;
  const x0 = 16, xi = Math.min(w * 0.42, x0 + Math.max(2, Math.floor((w * 0.42 - x0) / lam)) * lam);
  const yt = 28, yb = h - 34, busH = 8;
  const parts: string[] = [];
  parts.push(`<rect class="au" x="${x0}" y="${yt}" width="${(xi - x0).toFixed(1)}" height="${busH}"/><rect class="au" x="${x0}" y="${yb - busH}" width="${(xi - x0).toFixed(1)}" height="${busH}"/>`);
  const fw = Math.max(0.6, lam / 4);
  let i = 0;
  for (let x = x0 + lam / 8; x + fw <= xi; x += lam / 2, i++) {
    const top = i % 2 === 0;
    parts.push(`<rect class="au" x="${x.toFixed(2)}" y="${top ? yt + busH : yt + busH + 10}" width="${fw.toFixed(2)}" height="${(yb - yt - 2 * busH - 10).toFixed(1)}"/>`);
  }
  // crests (compressions) travelling +x from the IDT edge, spaced lambda
  const xw = Math.round(w * 0.74), ww = 1.2 * k;
  for (let x = xi + lam / 2, n = 0; x < w - 8; x += lam, n++) {
    const op = Math.max(0.25, 1 - n * 0.01);
    if (look === "tech") parts.push(`<path class="rip" d="M${x.toFixed(1)} ${yt + 6}V${yb - 6}" style="opacity:${op.toFixed(2)}"/>`);
    else {
      const amp = Math.min(6, lam * 0.18), segs: string[] = [];
      for (let y = yt + 6; y <= yb - 6; y += 6) segs.push(`${(x + amp * Math.sin(y / 9)).toFixed(1)},${y}`);
      parts.push(`<polyline class="rip" points="${segs.join(" ")}" style="opacity:${op.toFixed(2)}"/>`);
    }
  }
  parts.push(`<rect class="${look === "tech" ? "wg" : "ox"}" x="${xw - ww / 2}" y="6" width="${ww}" height="${h - 30}" ${look === "tech" ? 'fill="none"' : ""}/>`);
  parts.push(`<path class="ir" d="M${xw} 6V${h - 24}"/>`);
  parts.push(`<path class="dim" d="M${x0} ${h - 10}H${x0 + 5 * k}"/><text x="${x0 + 5 * k + 6}" y="${h - 6}">5 µm</text>`);
  parts.push(`<text x="${w - 6}" y="${h - 6}" text-anchor="end">${w < 600 ? "waveguide" : `waveguide (1550 nm${look === "visual" ? ", false color" : ""})`}</text>`);
  parts.push(`<text x="${(xi + 8).toFixed(1)}" y="20">${w < 600 ? "SAW →" : `SAW, λ = ${lamUm(s, cuts).toFixed(3)} µm →`}</text>`);
  return `<svg class="dv-art ${look}" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img" aria-label="Interdigital transducer launching a surface acoustic wave across a waveguide">${parts.join("")}</svg>`;
}

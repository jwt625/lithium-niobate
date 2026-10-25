// Display color of a wavelength (port of mockup/visual.js "color science").
// CIE 1931 2-degree color-matching functions, multi-lobe Gaussian fit: C. Wyman, P.-P. Sloan, P. Shirley, JCGT 2(2), 1 (2013).
// XYZ -> linear sRGB; white (equal linear sRGB = D65) added until no channel is negative, which keeps the dominant wavelength;
// max channel scaled to 1; sRGB gamma.
type RGB = [number, number, number];
const lobe = (x: number, mu: number, s1: number, s2: number): number => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
const cmf = (nm: number): RGB => [
  1.056 * lobe(nm, 599.8, 37.9, 31.0) + 0.362 * lobe(nm, 442.0, 16.0, 26.7) - 0.065 * lobe(nm, 501.1, 20.4, 26.2),
  0.821 * lobe(nm, 568.8, 46.9, 40.5) + 0.286 * lobe(nm, 530.9, 16.3, 31.1),
  1.217 * lobe(nm, 437.0, 11.8, 36.0) + 0.681 * lobe(nm, 459.0, 26.0, 13.8),
];
const toLin = ([X, Y, Z]: RGB): RGB => [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
const enc = (c: number): number => { c = Math.min(1, Math.max(0, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hex = (lin: number[]): string => "#" + lin.map((c) => Math.round(enc(c) * 255).toString(16).padStart(2, "0")).join("");
/** Linear sRGB of wavelength nm (display mapping, not a measurement).
 *  400-645 nm: the CMF fit as is. Red end (FIX-S): the Gaussian fit drifts back to orange beyond about 680 nm (700 nm came
 *  out #ff8a00, so 775 nm SHG of 1550 looked orange), whereas the true spectral locus stays red out to 780 nm; the hue is
 *  blended to pure sRGB red from 645 to 670 nm and held there. Violet end: hue held at 400 nm. Outside 400-680 nm the level
 *  falls linearly to 0.4 (reached at 780 nm and at 360 nm) so the edges read dim but visible. Non-visible light keeps a
 *  declared false color elsewhere (INT, P01/P02). */
export function spectralLin(nm: number): RGB {
  const h = Math.min(670, Math.max(400, nm));
  const c = toLin(cmf(h)), m = Math.min(0, ...c), d = c.map((v) => v - m), M = Math.max(...d) || 1;
  let r: RGB = [d[0] / M, d[1] / M, d[2] / M];
  if (h > 645) { const u = (h - 645) / 25; r = [r[0] + (1 - r[0]) * u, r[1] * (1 - u), r[2] * (1 - u)]; }
  const k = nm > 680 ? Math.max(0.4, 1 - (0.6 * (nm - 680)) / 100) : nm < 400 ? Math.max(0.4, 1 - (0.6 * (400 - nm)) / 40) : 1;
  return [r[0] * k, r[1] * k, r[2] * k];
}
/** Hex color of wavelength nm at luminance scale k, mixed toward white by w. */
export const spectral = (nm: number, k = 1, w = 0): string => hex(spectralLin(nm).map((v) => k * (v * (1 - w) + w)));

// Static SVG and text computed once at prerender (server load: serialized, not re-run on hydration), so hydration reuses the same strings
// (Node and the browser may differ in the last bit of Math.pow / Math.log, which would flip a rounded coordinate).
import { glyphSym, glyphLat, glyphTh, glyphTr, glyphR33, glyphEc, glyphRho, glyphK, recordJSON } from "$lib/figures/visual/glyphs";
import { dispersionSVG } from "$lib/figures/visual/dispersion";
import { eyeRingSVG } from "$lib/figures/visual/bench";

export const load = () => ({
  svg: {
    sym: glyphSym(), lat: glyphLat(), th: glyphTh(), tr: glyphTr(), r33: glyphR33(), ec: glyphEc(), rho: glyphRho(), k: glyphK(),
    disp: dispersionSVG(), ring: eyeRingSVG(), jsonTech: recordJSON(true), jsonVisual: recordJSON(false),
  },
});

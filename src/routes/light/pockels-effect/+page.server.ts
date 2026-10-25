// Chapter 2.2: shell overrides and the initial (default-state) markup of every readout, computed at prerender and
// serialized, so the prerendered page shows final values and hydration reuses identical strings.
import type { PageMeta } from "$lib/content/site";
import { calcRows, fbPkHTML, faPkHTML, fdRowHTML, fdSumHTML, kv, mzmFrameSVG, mzmRows, numbersHTML, roHTML, rtHTML } from "$lib/figures/eo";
import { mzmArtSVG, mzmCurveSVG, mzmReadout } from "$lib/figures/visual/mzm";
import { ellReadout } from "$lib/figures/visual/ellipsoid";
import { analyze, type EOJson } from "$lib/figures/eo";
import { rtDefault } from "./rt-default";
import fs from "node:fs";
import path from "node:path";

export const load = () => {
  rtDefault();
  // L3 numbers prerendered from the same FEM export the page fetches (static/data), so the HTML carries final values.
  const j = JSON.parse(fs.readFileSync(path.resolve("static/data/eo-overlap-li2026aa.json"), "utf8")) as EOJson;
  const A = analyze(j);
  let esMax = 0, esMin = 0;
  for (const v of A.F.esEx) { esMax = Math.max(esMax, v); esMin = Math.min(esMin, v); }
  const dneffA = A.glob.dneffA.value;
  const meta: Partial<PageMeta> = {
    title: "Pockels Effect",
    description: "Chapter 2.2: the Pockels effect in lithium niobate in three depth layers, from delta n = -(1/2) n^3 r E to the power-normalized EO overlap of a real TFLN modulator cross-section.",
    keys: ["P-comp", "P-db", "reported", "engine", "derived"],
    aside: "fem",
  };
  return {
    meta,
    init: {
      calc: kv(calcRows(1.55, 1)), mzmSvg: mzmFrameSVG(0, j.metrics.vpi_dc_v), mzmOut: kv(mzmRows(0, dneffA)), rt: rtHTML(), num: numbersHTML(A),
      ro: roHTML(null), fdRo: fdRowHTML(null, false), fdSum: fdSumHTML(A.prof.reduce((a, p) => a + p.t * A.g.dx, 0)), faPk: faPkHTML(Math.sqrt(A.eMax)), fbPk: fbPkHTML(esMax * 1e-6, esMin < -1e-6 * esMax),
      vArt: mzmArtSVG(), vCurve: mzmCurveSVG(), vMzm: mzmReadout(0), ell: ellReadout(),
    },
  };
};

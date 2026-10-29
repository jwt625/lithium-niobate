// Shared pieces of the quirks pages: page text block, scratch batches, lamp.
import { drawScratch, grain, hatchLines, rectPts, scratch, type Ctx, type Inks, type InkName, type Pt, type Rng, type Scratch } from "./kit";
import { textScratches } from "./letters";

export const TEXT_BOX = { cx: 500, cy: 846, xh: 38, maxW: 930, lineH: 86 };

/** Bake the page text in rainbow crayon at the foot of the page. */
export function bakeText(g: Ctx, ink: Inks, text: string, rng: Rng, xh = TEXT_BOX.xh, lineH = TEXT_BOX.lineH, cy = TEXT_BOX.cy): void {
  const ss = textScratches(text, TEXT_BOX.cx, cy, { xh, maxW: TEXT_BOX.maxW, lineH }, rng);
  bakeAll(g, ss, ink("rainbow"), rng);
}

export function bakeAll(g: Ctx, ss: Scratch[], ink: CanvasPattern, rng: Rng): void {
  for (const s of ss) drawScratch(g, s, ink);
  for (const s of ss) grain(g, s, rng);
}

export function drawAll(g: Ctx, ss: Scratch[], ink: CanvasPattern, frac = 1, burrs = true): void {
  for (const s of ss) drawScratch(g, s, ink, frac, burrs);
}

export interface Part { ss: Scratch[]; ink: InkName }

/** Hand lamp pointing right, lens centred on (0, 0). Body red and hatched, lens yellow. */
export function lampParts(rng: Rng): { body: Part; lens: Part; glow: Part } {
  const body: Pt[] = rectPts(-150, -40, -28, 40);
  const lens: Pt[] = [[-28, -28], [0, -46], [0, 46], [-28, 28], [-28, -28]];
  return {
    body: {
      ink: "red",
      ss: [
        scratch(body, 7, rng),
        scratch([[-112, -40], [-112, -58], [-76, -58], [-76, -40]], 6, rng),
        ...hatchLines(body.slice(0, 4), -0.9, 12, 3, rng),
      ],
    },
    lens: { ink: "yellow", ss: [scratch(lens, 7, rng)] },
    glow: { ink: "yellow", ss: hatchLines(lens.slice(0, 4), 1.57, 7, 3, rng, 0.3) },
  };
}

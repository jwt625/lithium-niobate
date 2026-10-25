// Shared helpers for the e2e suites.
import type { Page } from "@playwright/test";

export const MOCKUP = "http://127.0.0.1:47613";
export const ROUTES = [
  "/", "/light/", "/light/birefringence/", "/light/pockels-effect/", "/light/second-order/", "/light/parametric/", "/light/third-order/", "/light/eo-combs/", "/light/tfln-waveguides/",
  "/crystal/", "/crystal/lattice/", "/crystal/polarization/", "/crystal/ferroelectric-constants/", "/crystal/composition/", "/crystal/defects/", "/crystal/dopants/", "/crystal/symmetry/", "/crystal/domains/", "/crystal/poling/", "/crystal/domain-walls/",
  "/sound/", "/sound/piezoelectricity/", "/sound/bulk-waves/", "/sound/surface-waves/", "/sound/cuts/", "/sound/idt-filters/", "/sound/acousto-optics/", "/sound/phononics/",
  "/quirks/", "/quirks/photorefraction/", "/quirks/mgo-doping/", "/quirks/thin-film-photorefraction/", "/quirks/griira/", "/quirks/damage-thresholds/", "/quirks/pyroelectricity/", "/quirks/dc-bias-drift/", "/quirks/thermal-effects/", "/quirks/lithium-out-diffusion/", "/quirks/fabrication-pitfalls/",
  "/making/", "/making/raw-materials/", "/making/crystal-growth/", "/making/wafers/", "/making/bulk-waveguides/", "/making/thin-film/", "/making/wafer-suppliers/", "/making/patterning/", "/making/cladding/", "/making/electrodes/", "/making/poling/", "/making/packaging/", "/making/process-viewer/",
  "/devices/", "/devices/modulators/", "/devices/traveling-wave/", "/devices/tradeoffs/", "/devices/frequency-conversion/", "/devices/parametric/", "/devices/combs/", "/devices/quantum/", "/devices/acousto-optics/", "/devices/rf-filters/", "/devices/heterogeneous/", "/devices/tantalate/", "/devices/records/",
  "/history/", "/history/a-crystal-on-paper/", "/history/bell-labs-grows-a-crystal/", "/history/damage-to-memory/", "/history/sound-on-a-crystal/", "/history/light-in-a-channel/", "/history/taming-the-crystal/", "/history/the-internets-modulator/", "/history/peeling-the-crystal/", "/history/thin-film-renaissance/", "/history/ai-data-center/",
  "/industry/", "/industry/rock-to-chip/", "/industry/who-makes-it/", "/industry/wafers-and-lanes/", "/industry/platforms/", "/industry/ofc-2026/", "/industry/market/", "/industry/in-your-life/", "/industry/events/",
  "/lab/", "/lab/phase-matching/", "/lab/tensors/", "/data/", "/data/density/", "/data/dispersion/", "/data/api/", "/library/", "/colophon/",
];
export const MODES = ["tech", "visual"] as const;
export const THEMES = ["dark", "light"] as const;
export const WIDTHS = [1440, 390] as const;

/** Wait for fonts, data fetches, and figure rendering to settle. */
export async function settle(page: Page, ms = 2500): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(ms);
}

export const withParams = (url: string, mode: string, theme: string): string => `${url}${url.includes("?") ? "&" : "?"}mode=${mode}&theme=${theme}`;

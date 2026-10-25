<!-- /colophon/: stack, data model and status codes, provenance rules, licenses, the two design systems, field guide to the
     motifs (physics and numbers each), build date. TECH: boxed tables. VISUAL: specimen cards with code-drawn samples. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { STATUS, type StatusCode } from "$lib/content/site";
  import { STATUS_DEF } from "$lib/figures/p09/status";
  import { glyphSym } from "$lib/figures/visual/glyphs";
  import { renderConoscope } from "$lib/figures/conoscope";
  import { createRng } from "$lib/physics/prng.ts";
  import { onUi } from "$lib/figures/dom";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const C = $derived(data.counts as Record<string, number> & { status: Record<string, number> });

  // specimen drawings (deterministic)
  const stripes = (period: number, w = 220): string => { const p = period * 2; let d = ""; for (let x = 0; x < w; x += p) d += `M${x.toFixed(2)} 0h${Math.min(p / 2, w - x).toFixed(2)}v14h${(-Math.min(p / 2, w - x)).toFixed(2)}Z`; return d; };
  const vac = (() => { const r = createRng(1949); const pts: { x: number; y: number; k: 0 | 1 | 2 }[] = []; for (let j = 0; j < 9; j++) for (let i = 0; i < 28; i++) { const u = r.next(); pts.push({ x: 8 + i * 10.4 + (j % 2) * 5.2, y: 8 + j * 9, k: u < 0.0404 ? 0 : u < 0.0505 ? 2 : 1 }); } return pts; })();
  const MOTIFS = $derived([
    { id: "trace", name: "Photorefractive trace", seen: "VISUAL with motion allowed: the pointer leaves a faint 532 nm green trace that fades and is cleared 15 s after the pointer stops (display timing).", physics: "Light excites electrons from Fe<sup>2+</sup> and other donor sites; the bulk photovoltaic current moves them along the c axis until they are trapped, and the space-charge field changes n<sub>e</sub> through the Pockels effect. The written index persists for the dielectric relaxation time &epsilon;&epsilon;<sub>0</sub>/&sigma;: about 7 h to 29 days in the dark for &epsilon;<sub>33</sub> = 28 and a dark conductivity of 10<sup>&minus;14</sup> to 10<sup>&minus;16</sup> S/m (range from Volk &amp; W&ouml;hlecke 2009, p. 60).", pop: "g:photorefraction" },
    { id: "griira", name: "Green-induced infrared absorption", seen: "VISUAL: marks drawn in infrared false color within 40 px of the pointer dim to 35% and recover over 2.5 s.", physics: "532 nm light creates small polarons (electrons bound at Nb<sub>Li</sub> antisites) whose absorption band lies in the near infrared, so a green beam raises the infrared loss of a frequency doubler; the absorption decays after the green light is removed.", pop: "g:griira" },
    { id: "drift", name: "Bias drift", seen: "Footer, VISUAL: the operating point of an MZM transfer curve drifts with a single time constant of 40 s over 90&deg; (display values); a click re-locks it. TECH holds it at quadrature.", physics: "A DC bias on a thin-film LN modulator is screened by charge moving in the film, cladding and interfaces, so the phase set by a constant voltage relaxes over seconds to hours (EO response measured from 1 mHz to 1 MHz by Holzgrafe et al. 2024, doi:10.1364/OE.507536).", pop: "drift" },
    { id: "poled", name: "Poled rules", seen: `Masthead band and VISUAL section rules: alternating &plusmn;z domains at 2 px per &micro;m with the first-order QPM period of the page: ${data.qpm1064} &micro;m for 1064 &rarr; 532 nm (landing), ${data.qpm1550} &micro;m for 1550 &rarr; 775 nm (Light, phase matching).`, physics: "Reversing the ferroelectric domain every coherence length flips the sign of d<sub>33</sub> and keeps the second harmonic growing: &Lambda; = &lambda; / (2 (n<sub>e</sub>(&lambda;/2) &minus; n<sub>e</sub>(&lambda;))), computed live from the Zelmon 1997 congruent n<sub>e</sub> at 21 &deg;C.", pop: "g:qpm" },
    { id: "vacancy", name: "Li-vacancy texture", seen: "VISUAL background: a triangular dot lattice with 4.0% of the dots missing and 1.0% drawn as rings.", physics: "Congruent LN grows Li-poor, [Li]/[Nb] = 0.94 (Volk &amp; W&ouml;hlecke 2009, p. 9). In the Li-site vacancy model (Li<sub>1&minus;5x</sub>Nb<sub>x</sub>V<sub>4x</sub>)NbO<sub>3</sub>, (1 &minus; 5x)/(1 + x) = 0.94 gives x = 0.0101: 4.04% of Li sites empty and 1.01% occupied by Nb antisites. Lattice spacing is decorative.", pop: "v-vac" },
    { id: "orn", name: "3m ornaments", seen: "VISUAL: a stereogram glyph before every heading (threefold axis, three mirror planes); cards cut with one 60&deg; facet. No four-, five- or eightfold ornament appears.", physics: "LN belongs to point group 3m: one threefold rotation axis along c and three mirror planes containing it. Neumann's principle then fixes which tensor components vanish or are tied, e.g. four independent Pockels coefficients r<sub>13</sub>, r<sub>22</sub>, r<sub>33</sub>, r<sub>51</sub>.", pop: "g:point-group-3m" },
    { id: "logo", name: "Conoscope logo", seen: "Masthead logo and favicon: the computed conoscopic figure of a 0.6 mm z-cut plate between crossed polarizers, numerical aperture 0.55, no field; 632.8 nm grayscale in TECH, white light in VISUAL.", physics: "Each pixel is a propagation direction at angle &theta; to the optic axis; the retardation 2&pi;d(n<sub>o</sub> &minus; n<sub>e</sub>(&theta;))/(&lambda; cos&theta;) draws the isochromatic rings and the polarizer axes the dark cross. A transverse field makes the crystal biaxial and splits the cross (landing Fig. 0).", pop: "g:birefringence" },
    { id: "biref", name: "Birefringent headings", seen: "VISUAL with motion allowed: headings carry a faint doubled image in two hues offset by about one pixel; hovering removes it.", physics: "A ray entering a birefringent crystal splits into ordinary and extraordinary rays; for LN at 633 nm, n<sub>o</sub> &minus; n<sub>e</sub> is about 0.084, which displaces the two images of an object seen through a thick plate.", pop: "g:birefringence" },
  ]);
  const CODES = Object.keys(STATUS) as StatusCode[];
  let cono: HTMLCanvasElement;
  onMount(() => {
    const paint = (): void => { const g = cono?.getContext("2d"); if (!g) return; cono.width = cono.height = 160; renderConoscope(g, 160, { thicknessMm: 0.6, fieldKVmm: 0, fieldDir: "x", white: document.documentElement.dataset.mode === "visual", mono: document.documentElement.dataset.mode !== "visual", NA: 0.55 }); };
    paint();
    return onUi(paint);
  });
</script>

{#snippet specimen(id: string)}
  {#if id === "poled"}
    <svg viewBox="0 0 300 44" class="p9-sp"><path d={stripes(+data.qpm1064)} class="sp-dom"/><path d={stripes(+data.qpm1550)} transform="translate(0 24)" class="sp-dom"/><text x="300" y="11" text-anchor="end" class="sp-tx">{data.qpm1064} µm</text><text x="300" y="35" text-anchor="end" class="sp-tx">{data.qpm1550} µm</text></svg>
  {:else if id === "vacancy"}
    <svg viewBox="0 0 300 88" class="p9-sp">{#each vac as p, i (i)}{#if p.k === 1}<circle cx={p.x} cy={p.y} r="1.6" class="sp-dot"/>{:else if p.k === 2}<circle cx={p.x} cy={p.y} r="2.6" class="sp-ring"/>{/if}{/each}</svg>
  {:else if id === "orn"}
    <div class="p9-sp-orn">{@html glyphSym()}</div>
  {:else if id === "logo"}
    <canvas class="p9-sp-cono" bind:this={cono} width="160" height="160" aria-label="Conoscopic figure of a 0.6 mm z-cut plate"></canvas>
  {:else if id === "trace"}
    <svg viewBox="0 0 300 60" class="p9-sp"><defs><linearGradient id="p9tr" x1="0" x2="1"><stop offset="0" stop-opacity="0" class="sp-st"/><stop offset="1" stop-opacity="0.9" class="sp-st"/></linearGradient></defs><path d="M10 48C60 10 110 54 160 26S250 14 290 30" stroke="url(#p9tr)" class="sp-trace"/></svg>
  {:else if id === "griira"}
    <svg viewBox="0 0 300 40" class="p9-sp"><path d="M10 20H120" class="sp-ir"/><path d="M120 20H190" class="sp-ir sp-dim"/><path d="M190 20H290" class="sp-ir"/><circle cx="155" cy="20" r="4" class="sp-ptr"/></svg>
  {:else if id === "drift"}
    <svg viewBox="0 0 300 70" class="p9-sp"><path d={Array.from({ length: 121 }, (_, i) => `${i ? "L" : "M"}${(10 + i * 2.33).toFixed(1)} ${(60 - 50 * Math.cos((i / 120) * Math.PI) ** 2).toFixed(1)}`).join("")} class="sp-curve"/><circle cx={(10 + 60 * 2.33).toFixed(1)} cy="35" r="4" class="sp-q"/><circle cx={(10 + 90 * 2.33).toFixed(1)} cy={(60 - 50 * Math.cos(0.75 * Math.PI) ** 2).toFixed(1)} r="4" class="sp-ptr"/></svg>
  {:else}
    <div class="p9-sp-bi"><span class="biref">Aa</span></div>
  {/if}
{/snippet}

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Colophon" }]} title="Colophon"
  depth={[{ id: "stack", label: "Stack" }, { id: "model", label: "Data and provenance" }, { id: "design", label: "Design systems" }, { id: "motifs", label: "Motifs" }]}>

  <section class="lay" id="stack" data-pair="stack" data-spine="Stack">
    <div class="sh"><h2 class="biref">Stack</h2><span class="meta">built {data.built}</span></div>
    <table class="spec p9-col"><tbody>{#each data.stack as [k, v] (k)}<tr><td>{k}</td><td>{v}</td></tr>{/each}<tr><td>Hosting</td><td>static files; every page works without a server, the data API is the same static tree</td></tr><tr><td>Licenses</td><td>Code <a class="u" href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0</a> ({data.license}); data <a class="u" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; source at <a class="u" href="https://github.com/jwt625/lithium-niobate">github.com/jwt625/lithium-niobate</a></td></tr></tbody></table>
  </section>

  <section class="lay" id="model" data-pair="model" data-spine="Data and provenance">
    <div class="sh"><h2 class="biref">Data and provenance</h2><span class="meta">{C.scalar_records_public} scalar and {C.tensor_records_public} tensor records, {C.dispersion_models} dispersion models, {C.sources} sources, {C.unverified} unverified claims held apart</span></div>
    <div class="p9-colgrid">
      <div>
        <h3 class="h3">Record</h3>
        <dl class="p9-kv">
          <dt>Scalar</dt><dd>property, symbol, variant (CLN, SLN, MgO-doped, LiTaO<sub>3</sub> for comparison), value or range or text, stated uncertainty, unit as UCUM code with a QUDT URI where one exists, conditions (temperature, wavelength, frequency, mechanical and electrical boundary), frame</dd>
          <dt>Tensor</dt><dd>independent components, Voigt matrix and convention, full Cartesian tensor generated by code, 3m symmetry form, frame with +z sign definition</dd>
          <dt>Dispersion</dt><dd>formula, coefficients, validity window in wavelength and temperature, reference temperature, errata, check values reproduced at build time</dd>
          <dt>Provenance</dt><dd>source id with DOI or URL, locator (table, page, equation), original measurement when read through a compilation, status, transcription date</dd>
        </dl>
        <p class="fine">Browse: <a class="u" href="/data/">data</a>, <a class="u" href="/data/api/">API</a>, <a class="u" href="/library/">library</a>.</p>
      </div>
      <div>
        <h3 class="h3">Status codes</h3>
        <table class="idx p9-codes"><tbody>
          {#each CODES as k (k)}<tr><td><Badge code={k} /></td><td>{STATUS[k].def}</td></tr>{/each}
          <tr><td><span class="b r">P(abs)</span></td><td>{STATUS_DEF["P(abs)"]} (used in /data/ tables)</td></tr>
          <tr><td><span class="b d">C</span></td><td>{STATUS_DEF.C} (used in /data/ tables)</td></tr>
        </tbody></table>
      </div>
    </div>
    <h3 class="h3">Rules</h3>
    <ol class="p9-rules">
      <li>Values in data tables and specification cards carry a status code (table above); its popup gives the source and the locator.</li>
      <li>Unverified values (U) are never shown as fact; they live in <a class="u" href="/api/v1/unverified.json">/api/v1/unverified.json</a> with the claimed value and the claimed source.</li>
      <li>Where sources disagree, the records are listed side by side; no value is averaged or blended.</li>
      <li>A value read in a review or handbook is P-comp, never P; a vendor number is V.</li>
      <li>Numbers computed on a page from listed inputs are marked derived; parameters chosen for display are marked template.</li>
      <li>Values are re-keyed with a citation; no figure or table is copied in its layout. Images are public domain or CC with the license recorded.</li>
      <li>A placeholder states that it holds no data.</li>
    </ol>
  </section>

  <section class="lay" id="design" data-pair="design" data-spine="Design systems">
    <div class="sh"><h2 class="biref">Two design systems</h2><span class="meta">switch with TECH / VISUAL in the masthead</span></div>
    <div class="scrollx"><table class="idx p9-ds">
      <thead><tr><th>Axis</th><th>TECH</th><th>VISUAL</th></tr></thead>
      <tbody>
        <tr><td>Page</td><td>one bordered 1180 px sheet with a hard shadow</td><td>full-bleed field, 72 px optic-axis gutter at 1100 px and wider</td></tr>
        <tr><td>Type</td><td>IBM Plex Sans and Mono; every heading 13 px, hierarchy by weight and rule</td><td>Newsreader for reading and display, Inter for numbers and controls; 13 to 88 px scale</td></tr>
        <tr><td>Controls</td><td>18 px sliders, 22 px segmented buttons, active state inverted</td><td>44 px targets, diamond slider thumb, tabular 22 px readouts</td></tr>
        <tr><td>Figures</td><td>panels, ASCII renderings, static between inputs</td><td>instruments drawn as instruments, 3D where geometry explains it, render on demand</td></tr>
        <tr><td>Color</td><td>monochrome; accent equals foreground</td><td>spectral colors computed from wavelength (CIE 1931 2&deg; functions, Wyman-Sloan-Shirley 2013 fit); 1064 and 1550 nm in declared false color, always dashed; material colors for Au, Si, SiO<sub>2</sub>, LN</td></tr>
        <tr><td>Badges</td><td>mono uppercase tags; border style gives the grade</td><td>diamond glyph and word; fill gives the grade</td></tr>
        <tr><td>Motion</td><td>none</td><td>only what the reader operates plus the motifs below; off under prefers-reduced-motion</td></tr>
        <tr><td>Common</td><td colspan="2">sharp corners, dark default and light theme, no layout shift during interaction, ISO dates, SI units</td></tr>
      </tbody>
    </table></div>
  </section>

  <section class="lay" id="motifs" data-pair="motifs" data-spine="Motifs">
    <div class="sh"><h2 class="biref">Field guide to the motifs</h2><span class="meta">{MOTIFS.length} motifs; motion ones only in VISUAL</span></div>
    <div class="scrollx" data-variant="tech">
      <table class="idx p9-mt">
        <colgroup><col class="c-n"><col class="c-s"><col></colgroup>
        <thead><tr><th>Motif</th><th>Where</th><th>Physics</th></tr></thead>
        <tbody>{#each MOTIFS as m (m.id)}<tr><td class="h"><span class="term" data-pop={m.pop}>{m.name}</span></td><td>{@html m.seen}</td><td>{@html m.physics}</td></tr>{/each}</tbody>
      </table>
    </div>
    <div class="p9-vmotifs" data-variant="visual">
      {#each MOTIFS as m (m.id)}
        <article class="p9-vm v-facet">
          <div class="p9-vm-sp">{@render specimen(m.id)}</div>
          <h3><span class="term" data-pop={m.pop}>{m.name}</span></h3>
          <p class="p9-vm-seen">{@html m.seen}</p>
          <p class="p9-vm-phys">{@html m.physics}</p>
        </article>
      {/each}
    </div>
  </section>
</ChapterPage>

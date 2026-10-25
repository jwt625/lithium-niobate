<!-- Landing (port of mockup/index.html): TECH full-viewport ASCII unit cell, definition + specification + data record +
     Fig. 0 conoscope, index, instruments, chronology; VISUAL hero with the three.js cell, conoscope bench, specimen sheet,
     chapter doors, instrument cards, time axis; shared platforms line. Facts and sources: DevLog-003, research/R06, R07, R14. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { LANDING_POPS } from "$lib/content/pops-landing";
  import { CHAPTERS, chapterHref, type StatusCode } from "$lib/content/site";
  import { CHRONOLOGY, escAmp } from "$lib/content/chronology";
  import { nCLN, qpmPeriodSHG } from "$lib/figures/optics";
  import { mountLattice } from "$lib/figures/lattice";
  import { mountConoTech } from "$lib/figures/cono-tech";
  import { onUi } from "$lib/figures/dom";
  import { dispReadout, sliderOf } from "$lib/figures/visual/dispersion";
  import { fmtDn, fmtG, fmtState } from "$lib/figures/visual/bench";
  import { eraOf } from "$lib/figures/visual/timeline";
  import { whenVisual, installRangeFill } from "$lib/figures/visual/lifecycle";
  import { initBench } from "$lib/figures/visual/bench";
  import { initDispersion } from "$lib/figures/visual/dispersion";
  import { initDoors } from "$lib/figures/visual/doors";
  import { initTimeline } from "$lib/figures/visual/timeline";

  let { data }: { data: PageData } = $props();
  usePops(LANDING_POPS);

  const ne155 = nCLN("e", 1.55).toFixed(4);
  const nPair = `${nCLN("o", 1.55).toFixed(4)}, ${ne155}`;
  const qpm = `${qpmPeriodSHG(1.064).toFixed(2)} µm`;
  const disp = dispReadout(1.55);

  type Spec = [prop: string, val: string, cond: string, badges: [StatusCode, string][], ir?: boolean];
  const SPEC: Spec[] = [
    ["Point group, space group", "3m, R3c", "ferroelectric phase", [["P-comp", "s-pg"]]],
    ["Lattice a, c", "5.148, 13.863 &Aring;", "hexagonal setting, room T", [["P-comp", "s-lat"]]],
    ["Density", "4642.8 kg/m<sup>3</sup>", "congruent", [["P", "s-rho"]]],
    ["Curie temperature", "1140 &deg;C", "congruent", [["P-comp", "s-tc"]]],
    ["Melting point", "1255 &deg;C", "congruent", [["P-comp", "s-tm"]]],
    ["Coercive field", "21 kV/mm", "congruent, room T", [["P-comp", "s-ec"]]],
    ["Transparency", "0.32&ndash;5 &micro;m", "congruent; cutoff criterion not stated", [["P-comp", "s-tr"]]],
    ["n<sub>o</sub>, n<sub>e</sub>", nPair, "1550 nm, 21 &deg;C", [["P-db", "s-n"], ["derived", "s-n"]], true],
    ["r<sub>33</sub> clamped / free", "30.8 / 32.2 pm/V", "633 nm", [["P-comp", "s-r33"]]],
    ["Thermal conductivity", "3.92 W/(m&middot;K)", "congruent, room T", [["P-comp", "s-k"]]],
  ];
  // href: where the instrument runs (TECH link target), vhref (VISUAL), place: VISUAL status line; no href: not on any page
  const INSTR: [id: string, title: string, inp: string, out: string, model: string, href: string, vhref: string, place: string][] = [
    ["F1", "Conoscope, index ellipsoid", "cut, thickness, E (x, y, z), &lambda; or white light", "conoscopic figure, index ellipsoid, induced &Delta;n", "Zelmon 1997 n<sub>o</sub>, n<sub>e</sub>; r tensor (Weis &amp; Gaylord 1985)", "#fig0", "#v-conoscope", "Conoscope above"],
    ["F2", "Phase matching", "&lambda;<sub>pump</sub>, &lambda;<sub>signal</sub>, T; SHG, SFG, DFG, OPO", `QPM period (1064 &rarr; 532 nm: <span class="mono">${qpm}</span>), tuning curves, acceptance bandwidths`, "Sellmeier models with errata; coupled-mode &chi;<sup>(2)</sup>", "/lab/phase-matching/", "/lab/phase-matching/", "Lab: phase matching"],
    ["F3", "Modulator", "electrode gap, length, waveguide cross-section", "V<sub>&pi;</sub>L, velocity mismatch, RF loss, impedance, EO response", 'eo-modulator-atlas FEM, <span class="term" data-pop="atlas">checked against a scikit-fem full-vector solver</span>', "/light/pockels-effect/#l3", "/light/pockels-effect/#l3", "2.2 L3: FEM overlap"],
    ["F4", "Tensors", "Euler angles; X-, Y-, Z-cut, 128&deg; Y-X; +z flip", "rotated r, d, c, e, &epsilon;; COMSOL-ordered and JSON export", "IEEE Std 176-1987 axes", "/lab/tensors/", "/lab/tensors/", "Lab: tensors"],
    ["F5", "Platforms", "platform filter: TFLN, TFLT, SiPh, InP, BTO, polymer, bulk Ti:LN", "V<sub>&pi;</sub>L vs EO bandwidth vs year", "eo-modulator-atlas rows at commit eb97f96 (2026-10-20)", "/industry/platforms/", "/industry/platforms/", "8.4 Platform comparison"],
    ["F6", "Crystal in hand", "crystal or LNOI wafer orientation, zoom, film thickness", "R3c lattice, thin-film interference color", "Hsu 1997 CIF (COD 2101845), transfer matrix", "", "", ""],
  ];
  /** Door status when a chapter has no door line: first to last built section ("8.1 to 8.8"). */
  const doorRange = (c: (typeof CHAPTERS)[number]): string => { const b = c.sections.filter((s) => s.built); return b.length > 1 ? `${b[0].no} to ${b[b.length - 1].no}` : b.map((s) => `${s.no} ${s.title}`).join(""); };
  const ART = ["crystal", "light", "sound", "quirks", "making", "devices", "history", "industry"];
  // fixed section size per viewport: section top (below the masthead) and scrollbar width, before first paint (prerendered)
  const MAST_B = `<script>(() => { const r = document.documentElement, sec = document.currentScript.parentElement, f = () => { if (sec.offsetParent === null) return; r.style.setProperty("--mast-b", \`\${Math.round(sec.getBoundingClientRect().top + scrollY)}px\`); r.style.setProperty("--sbw", \`\${innerWidth - r.clientWidth}px\`); }; f(); addEventListener("resize", f); })();</` + `script>`;

  let cellT: HTMLElement, cellV: HTMLElement, fig0: HTMLElement, vCono: HTMLElement, vSpec: HTMLElement, vDoors: HTMLElement, vChron: HTMLElement;
  onMount(() => {
    const r = document.documentElement;
    // --mast-b: set by the inline script while parsing (direct load); computed here after client-side navigation, and when
    // #cell first becomes visible after loading in VISUAL (display:none then). Not recomputed otherwise: no shift.
    let pending = false;
    const mast = (): void => {
      if (cellT.offsetParent === null) { pending = true; return; }
      pending = false;
      r.style.setProperty("--mast-b", `${Math.round(cellT.getBoundingClientRect().top + scrollY)}px`); r.style.setProperty("--sbw", `${innerWidth - r.clientWidth}px`);
    };
    if (!r.style.getPropertyValue("--mast-b") || cellT.offsetParent === null) mast();
    addEventListener("resize", mast);
    const offs = [
      onUi(() => { if (pending) mast(); }),
      mountLattice(cellT, cellV),
      mountConoTech(fig0),
      installRangeFill(),
      whenVisual(() => initBench(vCono)),
      whenVisual(() => initDispersion(vSpec)),
      whenVisual(() => initTimeline(vChron)),
      whenVisual(() => initDoors(vDoors)),
    ];
    return () => { removeEventListener("resize", mast); offs.forEach((f) => f()); };
  });
</script>

<ModeVariant>
  {#snippet tech()}
  <section id="cell" class="cellfull" data-pair="top" aria-label="Fig. 1, LiNbO3 unit cell, ASCII rendering" bind:this={cellT}>
    {@html MAST_B}
    <div class="cbar top"><span class="lab"><b>Fig. 1</b> LiNbO<sub>3</sub> R3c cell, hexagonal axes, Z = 6</span><Badge code="P-db" pop="s-cell" /><Badge code="derived" pop="s-cell-d" /><span class="facts">a 5.148, c 13.863 &Aring; &middot; Li 6, Nb 6, O 18 &middot; Nb&ndash;O 1.876, 2.130 &Aring; &middot; Li&ndash;O 2.063, 2.245 &Aring;</span></div>
    <div class="cstage" tabindex="0" role="img" aria-label="ASCII rendering of the conventional hexagonal unit cell of lithium niobate; drag to orbit, arrow keys rotate, plus and minus zoom"><canvas aria-hidden="true"></canvas></div>
    <div class="cbar ctl"><div class="seg" role="group" aria-label="Show in Fig. 1"><button type="button" data-t="nb" title="NbO6 octahedron edges">NbO<sub>6</sub></button><button type="button" data-t="li" title="LiO6 octahedron edges (dashed)">LiO<sub>6</sub></button><button type="button" data-t="vac" title="Empty octahedral sites (dotted rings; dotted O6 edges when an octahedron toggle is on)">empty</button><button type="button" data-t="bonds" title="Nb-O and Li-O bonds inside the cell">bonds</button><button type="button" data-t="ax" title="a1, a2, c axes; Ps along +c">c, P<sub>s</sub></button><button type="button" data-t="sup" title="2 x 2 x 1 block of cells">2&times;2&times;1</button></div><button type="button" class="reset" title="Reset view (key 0)">reset</button></div>
    <div class="cbar legend"><span><b>.:-=+*#%@</b>Nb 6a, r 0.62</span><span><b>.',;il</b>Li 6a, r 0.52</span><span><b>.coO0</b>O 18b, r 0.45</span><span><b>. .</b>empty 6a ring, bonds</span><span><b>-|/\</b>cell, octahedron edges</span><span class="rampnote">ramps: shadow to highlight</span><span>near bright, far dim; r in &Aring;, display radii (not ionic)</span></div>
    <div class="cbar readout" aria-live="polite"></div>
  </section>
  {/snippet}
  {#snippet visual()}
  <section class="v-hero v-w" id="v-top" data-pair="top" data-spine="Lithium niobate">
    <div class="v-hero-text">
      <p class="v-kicker">LiNbO<sub>3</sub> &middot; trigonal &middot; point group 3m &middot; space group R3c</p>
      <h1 class="v-display biref">Lithium niobate</h1>
      <p class="v-lede">A trigonal ferroelectric oxide whose refractive index changes linearly with an applied electric field (Pockels effect) and whose second-order susceptibility <i>&chi;</i><sup>(2)</sup> is large. Ti-indiffused bulk waveguides (1974) became the standard fiber-optic modulator; since 2017, sub-micron films on insulator (TFLN) carry the same physics on chips.</p>
      <dl class="v-keys">
        <div><dt>r<sub>33</sub>, clamped, 633 nm</dt><dd>30.8<small>pm/V</small></dd><Badge code="P-comp" pop="s-r33" /></div>
        <div><dt>n<sub>e</sub>, 1550 nm, 21 &deg;C</dt><dd id="v-key-ne">{ne155}</dd><Badge code="P-db" pop="s-n" /> <Badge code="derived" pop="s-n" /></div>
        <div><dt>Curie temperature</dt><dd>1140<small>&deg;C</small></dd><Badge code="P-comp" pop="s-tc" /></div>
      </dl>
    </div>
    <figure class="v-cell" id="fig1" bind:this={cellV}>
      <div class="stage v-frame" role="img" aria-label="Conventional hexagonal unit cell of lithium niobate: 6 Li, 6 Nb, 18 O; drag to orbit, wheel or pinch to zoom">
        <div class="labels" aria-hidden="true"></div>
        <button type="button" class="reset" title="Reset view">Reset view</button>
      </div>
      <div class="v-cell-meta"><span class="v-cap"><b>Fig. 1</b>R3c cell, hexagonal axes, Z = 6</span><Badge code="P-db" pop="s-cell" /></div>
      <div class="hudrow readout1" aria-live="polite"></div>
      <div class="v-seg" role="group" aria-label="Show in Fig. 1"><button type="button" data-t="nb" title="NbO6 octahedra">NbO<sub>6</sub></button><button type="button" data-t="li" title="LiO6 octahedra">LiO<sub>6</sub></button><button type="button" data-t="vac" title="Empty octahedral sites; along +c each column repeats Nb, empty, Li">Empty sites</button><button type="button" data-t="ax" title="c axis and spontaneous polarization direction">c, P<sub>s</sub></button></div>
      <div class="legend1" aria-label="Legend"><span><i class="sw" style="background:var(--nb)"></i>Nb 6a</span><span><i class="sw" style="background:var(--gold)"></i>Li 6a</span><span><i class="sw o"></i>O 18b</span><span><i class="sw e"></i>empty 6a (dashed O<sub>6</sub>)</span></div>
    </figure>
  </section>
  {/snippet}
</ModeVariant>

<ModeVariant>
  {#snippet tech()}
  <section class="hero" id="spec" data-pair="spec" data-spine="Specification">
    <div>
      <p class="def"><b>Lithium niobate</b>, LiNbO<sub>3</sub> &mdash; trigonal ferroelectric oxide whose refractive index changes linearly with an applied electric field (Pockels effect) and whose second-order susceptibility &chi;<sup>(2)</sup> is large. Ti-indiffused bulk waveguides (1974) became the standard fiber-optic modulator; since 2017, sub-micron films on insulator (TFLN) carry the same physics on chips.</p>
      <div class="sh"><h2 class="biref">Specification</h2></div>
      <div class="scrollx">
        <table class="spec">
          <thead><tr><th>Property</th><th>Value</th><th>Condition</th><th>Status</th></tr></thead>
          <tbody>
            {#each SPEC as [p, v, c, b, ir] (p)}
              <tr><td>{@html p}</td><td class="v" class:ir-el={ir} id={ir ? "v-n" : undefined}>{@html v}</td><td class="c">{@html c}</td><td class="s">{#each b as [code, pop], i (i)}{#if i}{" "}{/if}<Badge {code} {pop} />{/each}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div id="record" class="sub" data-pair="record" data-spine="Data record">
        <div class="sh"><h2 class="biref">Data record</h2></div>
        <div class="rec-card">
          <div class="l">
            <div class="cap">n<sub>e</sub> &middot; congruent LN &middot; 1550 nm &middot; 21 &deg;C</div>
            <div class="val ir-el" id="rec-ne">{ne155}</div>
            <dl>
              <dt>Model</dt><dd>Zelmon, Small, Jundt, JOSA B 14, 3319 (1997)</dd>
              <dt>Validity</dt><dd>0.4&ndash;5.0 &micro;m, 21 &deg;C</dd>
              <dt>Erratum</dt><dd>JOSA B 43, 2788 (2026-10-22): MgO:LN o/e headings switched; CLN coefficients unaffected</dd>
              <dt>Status</dt><dd><Badge code="P-db" pop="s-n" /> <Badge code="derived" pop="s-n" /></dd>
            </dl>
          </div>
          <pre id="json" aria-label="JSON record">{@html data.svg.jsonTech}</pre>
          <div class="u">JSON twin: GET <a class="u" href="/api/v1/properties/refractive-index-e/cln.json">/api/v1/properties/refractive-index-e/cln.json</a> &middot; <a class="u" href="/api/v1/dispersion/zelmon1997-cln-e.json">/api/v1/dispersion/zelmon1997-cln-e.json</a> &middot; <a class="u" href="/llms.txt">/llms.txt</a></div>
        </div>
      </div>
    </div>
    <div class="figcol">
      <figure class="panel" id="fig0" style="margin:0" bind:this={fig0}>
        <div class="ph"><span><b>Fig. 0</b> conoscope, z-cut LN, crossed polarizers</span><span class="term" data-pop="cono">model</span></div>
        <div class="stage">
          <canvas id="conoscope" role="img" aria-label="Computed conoscopic figure of a z-cut lithium niobate plate between crossed polarizers"></canvas>
          <div class="hud tl">P &#8596; x &middot; A &#8597; y<br>NA 0.55</div>
          <div class="hud tr" id="hud-src">632.8 nm</div>
        </div>
        <div class="hudrow" aria-live="polite"><span id="hud-dn">&Delta;n<sub>ind</sub> = 0.00e+0 at 632.8 nm</span><span id="hud-st" title="optic-axis state; angle from the plate normal, in air">uniaxial</span></div>
        <div class="ctl"><label for="e">Field E &perp; c</label><input id="e" type="range" min="0" max="5" step="0.05" value="0" aria-valuetext="0.00 kilovolts per millimeter"><output id="eo" for="e">0.00 kV/mm</output></div>
        <div class="ctl"><label for="d">Thickness d</label><input id="d" type="range" min="0.2" max="2" step="0.01" value="0.6" aria-valuetext="0.60 millimeters"><output id="do" for="d">0.60 mm</output></div>
        <div class="ctl"><span class="k">E along</span><div class="seg" id="fdir" role="group" aria-label="Field direction"><button type="button" data-f="x">x</button><button type="button" data-f="y">y</button></div><span></span></div>
        <div class="ctl"><span class="k">Source</span><div class="seg" id="src" role="group" aria-label="Light source"><button type="button" data-s="633">632.8 nm</button><button type="button" data-s="white">white</button></div><span></span></div>
        <div class="pf">
          <span>n<sub>o</sub>, n<sub>e</sub> Zelmon 1997 <Badge code="P-db" pop="s-n" /></span>
          <span>r<sub>22</sub> 6.8 pm/V <Badge code="P-comp" pop="r22" /></span>
          <span>NA 0.55 <Badge code="template" pop="na" /></span>
          <span>image <Badge code="derived" pop="cono" /></span>
        </div>
      </figure>
    </div>
  </section>
  {/snippet}
  {#snippet visual()}
  <section class="v-sec v-w" id="v-conoscope" data-pair="spec" data-spine="Conoscope" bind:this={vCono}>
    <header class="v-sh">
      <h2 class="biref">Conoscope</h2>
      <p class="v-sub">A z-cut plate between crossed polarizers in convergent light shows a dark cross and rings. A field perpendicular to c acts through r<sub>22</sub>: the uniaxial crystal turns biaxial and the cross splits into two isogyres.</p>
    </header>
    <div class="v-bench">
      <div class="v-bench-art">
        <svg id="v-bench-svg" viewBox="0 0 880 290" role="img" aria-label="Optical bench: lamp, polarizer along x, condenser, z-cut LN plate between electrodes, objective, analyzer along y, Bertrand lens"></svg>
        <div class="v-bench-ctl">
          <div class="v-group"><h3>Lamp</h3>
            <div class="v-ctl"><span class="v-lab">Source</span><div class="v-seg" id="v-src" role="group" aria-label="Light source"><button type="button" data-s="633">632.8 nm</button><button type="button" data-s="white">White</button></div></div>
          </div>
          <div class="v-group"><h3>Plate</h3>
            <div class="v-ctl" style="--w:8ch"><label for="v-d">Thickness d</label><output id="v-d-o" for="v-d">0.60 mm</output><input class="v-range" id="v-d" type="range" min="0.2" max="2" step="0.01" value="0.6"></div>
          </div>
          <div class="v-group"><h3>Electrodes</h3>
            <div class="v-ctl" style="--w:10ch"><label for="v-e">Field E &perp; c</label><output id="v-e-o" for="v-e">0.00 kV/mm</output><input class="v-range" id="v-e" type="range" min="0" max="5" step="0.05" value="0"></div>
            <div class="v-ctl"><span class="v-lab">E along</span><div class="v-seg" id="v-fdir" role="group" aria-label="Field direction"><button type="button" data-f="x">x</button><button type="button" data-f="y">y</button></div></div>
          </div>
        </div>
      </div>
      <div class="v-eyepiece">
        <div class="v-eye"><canvas id="v-cono" role="img" aria-label="Computed conoscopic figure of a z-cut lithium niobate plate between crossed polarizers"></canvas><svg id="v-eye-ring" viewBox="0 0 100 100" aria-hidden="true">{@html data.svg.ring}</svg></div>
        <div class="v-ret"><canvas id="v-ret" aria-label="Isochromatic sequence along the 45 degree diagonal at E = 0" role="img"></canvas>
          <div class="v-ret-ticks"><span style="left:0">0&deg;</span><span style="left:31.6%">10&deg;</span><span style="left:62.2%">20&deg;</span><span style="left:100%">33.4&deg;</span></div>
        </div>
        <dl class="v-hud">
          <dt>Ring scale, angle in air</dt><dd>E = 0, 45&deg; diagonal</dd>
          <dt>Retardation at NA edge</dt><dd id="v-hud-g">{fmtG(0.6)}</dd>
          <dt>&Delta;n<sub>ind</sub> = n<sub>o</sub><sup>3</sup> r<sub>22</sub> E</dt><dd id="v-hud-dn">{fmtDn(0)}</dd>
          <dt>Optic-axis state</dt><dd id="v-hud-st">{fmtState(0)}</dd>
        </dl>
      </div>
    </div>
    <div class="v-prov">
      <span>n<sub>o</sub>, n<sub>e</sub> Zelmon 1997 <Badge code="P-db" pop="s-n" /></span>
      <span>r<sub>22</sub> 6.8 pm/V <Badge code="P-comp" pop="r22" /></span>
      <span>NA 0.55 <Badge code="template" pop="na" /></span>
      <span>figure, ring scale <Badge code="derived" pop="v-cono" /></span>
      <span>ring ticks: mirror-plane traces of 3m <Badge code="derived" pop="v-ring" /></span>
    </div>
  </section>

  <section class="v-sec v-w" id="v-spec" data-pair="record" data-spine="Specification" bind:this={vSpec}>
    <header class="v-sh"><h2 class="biref">Specification</h2></header>
    <div class="v-sheet">
      <article class="v-card v-facet">
        <header><h3>Symmetry</h3><Badge code="P-comp" pop="s-pg" /></header>
        <p class="v-val">3m<span class="sep">/</span>R3c</p>
        <p class="v-cond">point group / space group, ferroelectric phase</p>
        <div class="v-glyph" id="g-sym">{@html data.svg.sym}</div>
      </article>
      <article class="v-card">
        <header><h3>Lattice, hexagonal setting</h3><Badge code="P-comp" pop="s-lat" /></header>
        <p class="v-val">5.148<span class="sep">/</span>13.863<small>&Aring;</small></p>
        <p class="v-cond">a / c, room temperature</p>
        <div class="v-glyph" id="g-lat">{@html data.svg.lat}</div>
      </article>
      <article class="v-card w2">
        <header><h3>Refractive index, congruent, 21 &deg;C</h3><span><Badge code="P-db" pop="s-n" /> <Badge code="derived" pop="s-n" /></span></header>
        <div class="v-plot" id="g-n">{@html data.svg.disp}</div>
        <div class="v-ctl"><label for="v-lam">Wavelength (logarithmic slider, 0.4 to 5 &micro;m)</label><input class="v-range" id="v-lam" type="range" min="0" max="1000" step="any" value={sliderOf(1.55)}></div>
        <dl class="v-hud"><dt>&lambda;</dt><dd id="v-lam-o">{disp.lam}</dd><dt>n<sub>o</sub></dt><dd id="v-no">{disp.no}</dd><dt>n<sub>e</sub></dt><dd id="v-ne">{disp.ne}</dd><dt>&Delta;n</dt><dd id="v-dn">{disp.dn}</dd></dl>
      </article>
      <article class="v-card w2">
        <header><h3>Curie and melting temperature, congruent</h3><span><Badge code="P-comp" pop="s-tc" /> <Badge code="P-comp" pop="s-tm" /></span></header>
        <p class="v-val">1140<small>&deg;C</small><span class="sep">/</span>1255<small>&deg;C</small></p>
        <p class="v-cond">T<sub>c</sub> / T<sub>m</sub></p>
        <div class="v-glyph" id="g-th">{@html data.svg.th}</div>
      </article>
      <article class="v-card w2">
        <header><h3>Transparency, congruent</h3><Badge code="P-comp" pop="s-tr" /></header>
        <p class="v-val">0.32&ndash;5<small>&micro;m</small></p>
        <p class="v-cond">cutoff criterion not stated; dashed marks: infrared, <span class="term" data-pop="v-false">false color</span></p>
        <div class="v-glyph" id="g-tr">{@html data.svg.tr}</div>
      </article>
      <article class="v-card">
        <header><h3>r<sub>33</sub>, 633 nm</h3><Badge code="P-comp" pop="s-r33" /></header>
        <p class="v-val">30.8<span class="sep">/</span>32.2<small>pm/V</small></p>
        <p class="v-cond">clamped / free</p>
        <div class="v-glyph" id="g-r33">{@html data.svg.r33}</div>
      </article>
      <article class="v-card">
        <header><h3>Coercive field</h3><Badge code="P-comp" pop="s-ec" /></header>
        <p class="v-val">21<small>kV/mm</small></p>
        <p class="v-cond">congruent, room T; inverts P<sub>s</sub></p>
        <div class="v-glyph" id="g-ec">{@html data.svg.ec}</div>
      </article>
      <article class="v-card">
        <header><h3>Density, congruent</h3><Badge code="P" pop="s-rho" /></header>
        <p class="v-val">4642.8<small>kg/m<sup>3</sup></small></p>
        <p class="v-cond">&plusmn;0.2 kg/m<sup>3</sup></p>
        <div class="v-glyph" id="g-rho">{@html data.svg.rho}</div>
      </article>
      <article class="v-card">
        <header><h3>Thermal conductivity, room T</h3><Badge code="P-comp" pop="s-k" /></header>
        <p class="v-val">3.92<small>W/(m&middot;K)</small></p>
        <p class="v-cond">congruent</p>
        <div class="v-glyph" id="g-k">{@html data.svg.k}</div>
      </article>
      <article class="v-card w4">
        <header><h3>Data record</h3><span><Badge code="P-db" pop="s-n" /> <Badge code="derived" pop="s-n" /></span></header>
        <div class="v-rec">
          <div>
            <p class="v-cond">n<sub>e</sub> &middot; congruent LN &middot; 1550 nm &middot; 21 &deg;C</p>
            <p class="v-val" id="v-rec-ne">{ne155}</p>
            <dl>
              <dt>Model</dt><dd>Zelmon, Small, Jundt, JOSA B 14, 3319 (1997)</dd>
              <dt>Validity</dt><dd>0.4&ndash;5.0 &micro;m, 21 &deg;C</dd>
              <dt>Erratum</dt><dd>JOSA B 43, 2788 (2026-10-22): MgO:LN o/e headings switched; CLN coefficients unaffected</dd>
            </dl>
          </div>
          <pre id="v-json" aria-label="JSON record">{@html data.svg.jsonVisual}</pre>
          <p class="u">JSON twin: GET <a class="v-link" href="/api/v1/properties/refractive-index-e/cln.json">/api/v1/properties/refractive-index-e/cln.json</a> &middot; <a class="v-link" href="/api/v1/dispersion/zelmon1997-cln-e.json">/api/v1/dispersion/zelmon1997-cln-e.json</a> &middot; <a class="v-link" href="/llms.txt">/llms.txt</a></p>
        </div>
      </article>
    </div>
  </section>
  {/snippet}
</ModeVariant>

<ModeVariant>
  {#snippet tech()}
  <section id="index" data-pair="index" data-spine="Index">
    <div class="sh"><h2 class="biref">Index</h2></div>
    <div class="scrollx">
      <table class="idx kw">
        <thead><tr><th>No.</th><th>Chapter</th><th>L1</th><th>L2</th><th>L3</th></tr></thead>
        <tbody>
          {#each CHAPTERS as c (c.slug)}
            <tr><td>{c.no}</td><td class="h">{#if c.built}<a href={chapterHref(c)}>{c.title}</a>{:else}{c.title}{/if}</td><td>{#if c.slug === "light"}birefringence, <a href="/light/pockels-effect/">Pockels effect</a>, frequency conversion{:else}{@html c.kw.l1}{/if}</td><td>{@html c.kw.l2}</td><td>{@html c.kw.l3}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
  {/snippet}
  {#snippet visual()}
  <section class="v-sec v-w" id="v-chapters" data-pair="index" data-spine="Chapters" bind:this={vDoors}>
    <header class="v-sh"><h2 class="biref">Chapters</h2></header>
    <div class="v-doors">
      {#each CHAPTERS as c, i (c.slug)}
        {#if c.built}
          <a class="v-door" data-art={ART[i]} href={chapterHref(c)} data-pop="d{c.no}"><div class="v-door-art"><canvas aria-hidden="true"></canvas><span class="v-door-no">{c.no}</span></div><div class="v-door-body"><span class="v-door-t">{c.title}</span><span class="v-door-kw">{@html c.kw.l1}</span><span class="v-door-st">{c.door ?? doorRange(c)}</span></div></a>
        {:else}
          <div class="v-door" data-art={ART[i]} aria-disabled="true" data-pop="d{c.no}"><div class="v-door-art"><canvas aria-hidden="true"></canvas><span class="v-door-no">{c.no}</span></div><div class="v-door-body"><span class="v-door-t">{c.title}</span><span class="v-door-kw">{@html c.kw.l1}</span><span class="v-door-st">Not built</span></div></div>
        {/if}
      {/each}
    </div>
  </section>
  {/snippet}
</ModeVariant>

<ModeVariant>
  {#snippet tech()}
  <section id="instruments" data-pair="instruments" data-spine="Instruments">
    <div class="sh"><h2 class="biref">Instruments</h2></div>
    <div class="scrollx">
      <table class="idx kw">
        <thead><tr><th>ID</th><th>Instrument</th><th>Inputs</th><th>Outputs</th><th>Model</th></tr></thead>
        <tbody>
          {#each INSTR as [id, t, inp, out, model, href] (id)}
            <tr><td>{#if href}<a href={href}>{id}</a>{:else}{id}{/if}</td><td class="h">{#if href}<a href={href}>{t}</a>{:else}{t}{/if}</td><td>{@html inp}</td><td>{@html out}</td><td>{@html model}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
  {/snippet}
  {#snippet visual()}
  <section class="v-sec v-w" id="v-instr" data-pair="instruments" data-spine="Instruments">
    <header class="v-sh"><h2 class="biref">Instruments</h2></header>
    <div class="v-instr">
      {#each INSTR as [id, t, inp, out, model, , vhref, place] (id)}
        {@const body = `<span class="v-icard-id">${id}</span><span class="v-icard-t">${t}</span><span class="v-io"><span>${inp}</span><span class="v-io-arrow" aria-hidden="true"></span><span>${out.replace('class="mono"', 'class="v-num"')}</span></span><span class="v-icard-m">${model}</span><span class="v-icard-st">${place || "No page yet"}</span>`}
        {#if vhref}<a class="v-icard" href={vhref}>{@html body}</a>{:else}<div class="v-icard" aria-disabled="true">{@html body}</div>{/if}
      {/each}
    </div>
  </section>
  {/snippet}
</ModeVariant>

<ModeVariant>
  {#snippet tech()}
  <section id="chronology" data-pair="chronology" data-spine="Chronology">
    <div class="sh"><h2 class="biref">Chronology</h2></div>
    <div class="scrollx">
      <table class="log">
        <thead><tr><th>Date</th><th>Event</th><th>Reference</th></tr></thead>
        <tbody id="chron">
          {#each CHRONOLOGY as e (e.doi)}<tr><td>{e.date}</td><td class="e">{@html e.event}</td><td><a href="https://doi.org/{e.doi}">{e.ref}</a></td></tr>{/each}
        </tbody>
      </table>
    </div>
  </section>
  {/snippet}
  {#snippet visual()}
  <section class="v-sec v-w" id="v-chron" data-pair="chronology" data-spine="Chronology" bind:this={vChron}>
    <header class="v-sh"><h2 class="biref">Chronology</h2><p class="v-sub">Select a marker on the time axis to bring its event card into view; the cards scroll sideways.</p></header>
    <div class="v-tl-axis" id="v-tl-axis"></div>
    <ol class="v-tl-cards" id="v-tl-cards">
      {#each CHRONOLOGY as e, k (e.doi)}
        <li class="v-tl-card" data-k={k}><div class="v-tl-era era-{eraOf(e.date)}" aria-hidden="true"></div><div class="v-tl-date">{e.date.slice(0, 4)}<small>{e.date.slice(4)}</small></div><p class="v-tl-ev">{@html e.event}</p><p class="v-tl-ref">{@html `<a href="https://doi.org/${e.doi}">${escAmp(e.ref)}</a> &middot; doi:${e.doi}`}</p></li>
      {/each}
    </ol>
  </section>
  {/snippet}
</ModeVariant>

<section id="platforms" data-spine="Platforms">
  <div class="sh"><h2 class="biref">Platforms</h2></div>
  <p class="tx">V<sub>&pi;</sub>L vs EO bandwidth vs year, from eo-modulator-atlas rows at commit eb97f96 (2026-10-20): <a href="/industry/platforms/">8.4 Platform comparison</a>; device trade-offs: <a href="/devices/tradeoffs/">6.3</a>.</p>
</section>

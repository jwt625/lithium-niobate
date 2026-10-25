<!-- F2 phase-matching calculator, full screen. TECH: input panel, readout table, two monochrome plots. VISUAL: poled
     crystal drawn to scale with beams in spectral / false color, large readouts, 44 px controls, colored plots. Both bind
     to one state (src/lib/stores/p09.ts pm). Physics: src/lib/physics/sellmeier.ts, phasematching.ts. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  import { PM_MODELS, LAM, PERIOD_RANGE, sliderFromLam, sliderFromLen } from "$lib/figures/p09/pm";
  import { mountPM } from "$lib/figures/p09/pmview";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { PM_DEFAULT } from "$lib/stores/p09";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const I = $derived(data.init);
  const D = PM_DEFAULT;
  const pops = Object.fromEntries(PM_MODELS.map((m) => [`pm-${m.id}`, { h: m.label, body: m.note, badges: [[m.status === "P" ? "p" : m.status === "P-db" ? "pc" : "s", m.status]] as [string, string][], src: m.src }]));
  usePops({
    ...pops,
    fejer: { h: "QPM tuning and tolerances", body: "&Delta;k = 2&pi;(n<sub>3</sub>/&lambda;<sub>3</sub> &minus; n<sub>1</sub>/&lambda;<sub>1</sub> &minus; n<sub>2</sub>/&lambda;<sub>2</sub>) &minus; 2&pi;m/&Lambda;; acceptance from sinc<sup>2</sup>(&Delta;kL/2) = 1/2 at &Delta;kL/2 = 1.3916; d<sub>eff</sub> = (2/m&pi;) sin(m&pi;D) d<sub>33</sub>.", badges: [["d", "derived"]], src: "M. M. Fejer, G. A. Magel, D. H. Jundt, R. L. Byer, IEEE J. Quantum Electron. 28, 2631 (1992), <a href='https://doi.org/10.1109/3.161322'>doi:10.1109/3.161322</a>." },
  });
  const lamMin = 0, lamMax = 5000;
  let root: HTMLElement;
  onMount(() => { const off = [mountPM(root.closest("main") as HTMLElement), installRangeFill()]; return () => off.forEach((f) => f()); });
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Lab", href: "/lab/" }, { label: "Phase matching" }]} title="Phase matching"
  depth={[{ id: "calc", label: "Calculator" }, { id: "model", label: "Model and sources" }]}>

  <section class="lay" id="calc" data-pair="calc" data-spine="Calculator" bind:this={root}>
    <div class="sh"><h2 class="biref">Calculator</h2><span class="meta">type 0, e + e &rarr; e; first-order and odd-order QPM</span></div>

    <!-- ---------- TECH ---------- -->
    <div class="p9-pm" data-variant="tech">
      <div class="panel p9-pm-in">
        <div class="ph"><span>Inputs</span><span>model <span class="b pc" data-pmo="model-badge" data-pop="pm-{D.model}">P-db</span></span></div>
        <div class="ctl"><span class="k">Process</span><div class="seg" role="group" aria-label="Process">{#each [["shg", "SHG"], ["sfg", "SFG"], ["dfg", "DFG"], ["opo", "OPO"]] as [v, t] (v)}<button type="button" data-pmv="proc:{v}" class:on={v === D.proc}>{t}</button>{/each}</div><span></span></div>
        <div class="ctl"><label for="pm-model">Model</label><select id="pm-model" class="p9-sel" data-pm="model">{#each PM_MODELS as m (m.id)}<option value={m.id} selected={m.id === D.model}>{m.short} ({m.status})</option>{/each}</select><span></span></div>
        <div class="ctl"><label for="pm-l1" data-pml="l1">&lambda; fund.</label><input id="pm-l1" type="range" min={lamMin} max={lamMax} step="1" value={sliderFromLam(D.l1)} data-pm="l1"><output for="pm-l1" data-pmf="l1">{D.l1.toFixed(3)} µm</output></div>
        <div class="ctl p9-off"><label for="pm-l2" data-pml="l2">&lambda;2 (n/a)</label><input id="pm-l2" type="range" min={lamMin} max={lamMax} step="1" value={sliderFromLam(D.l2)} data-pm="l2" disabled><output for="pm-l2" data-pmf="l2">{D.l2.toFixed(3)} µm</output></div>
        <div class="ctl p9-off"><label for="pm-per">OPO period &Lambda;</label><input id="pm-per" type="range" min={PERIOD_RANGE[0]} max={PERIOD_RANGE[1]} step="0.01" value={D.period} data-pm="period" disabled><output for="pm-per" data-pmf="period">{D.period.toFixed(2)} µm</output></div>
        <div class="ctl p9-off"><label for="pm-t">Temperature</label><input id="pm-t" type="range" min="20" max="250" step="0.5" value={D.T} data-pm="T" disabled><output for="pm-t" data-pmf="T">21.0 °C</output></div>
        <div class="ctl"><label for="pm-l">Length L</label><input id="pm-l" type="range" min="0" max="1000" step="1" value={sliderFromLen(D.L_mm)} data-pm="L_mm"><output for="pm-l" data-pmf="L_mm">{D.L_mm.toFixed(1)} mm</output></div>
        <div class="ctl"><span class="k">QPM order m</span><div class="seg" role="group" aria-label="QPM order">{#each [1, 3, 5] as m (m)}<button type="button" data-pmv="m:{m}" class:on={m === D.m}>{m}</button>{/each}</div><span></span></div>
        <div class="ctl"><label for="pm-d">Duty cycle D</label><input id="pm-d" type="range" min="0.1" max="0.9" step="0.01" value={D.duty} data-pm="duty"><output for="pm-d" data-pmf="duty">{D.duty.toFixed(2)}</output></div>
        <div class="pf">&lambda; sliders span {LAM[0]} to {LAM[1]} &micro;m on a log scale; values outside the chosen model's window print a dash. <button type="button" class="p9-copy" data-pmreset>reset</button></div>
      </div>
      <div class="panel p9-pm-out">
        <div class="ph"><span>Readouts</span><span><span class="term" data-pop="fejer">model</span> <Badge code="derived" pop="fejer" /></span></div>
        <table class="kv p9-pmkv" data-pmo="rows">{@html I.rows}</table>
        <div class="pf p9-pm-st" data-pmo="status">{I.status}</div>
      </div>
      <div class="fig p9-pm-fig"><div class="ph"><span>Tuning curve, period fixed</span><span class="dim">sinc²(&Delta;k L/2)</span></div><svg viewBox="0 0 520 220" class="p9-plot" data-pmo="tune" role="img" aria-label="Tuning curve">{@html I.tT}</svg></div>
      <div class="fig p9-pm-fig"><div class="ph"><span>Period curve</span><span class="dim">OPO: signal and idler vs &Lambda;</span></div><svg viewBox="0 0 520 220" class="p9-plot" data-pmo="period" role="img" aria-label="Period curve">{@html I.pT}</svg></div>
    </div>

    <!-- ---------- VISUAL ---------- -->
    <div class="p9-vpm" data-variant="visual">
      <div class="p9-vpm-bench v-frame" data-pmo="bench">{@html I.bench}</div>
      <dl class="p9-vkeys">
        <div><dt>Poling period &Lambda;</dt><dd><span data-pmo="v-period">{I.period}</span><small>&micro;m</small></dd></div>
        <div><dt>Generated wavelength</dt><dd><span data-pmo="v-l3">{I.l3}</span><small>nm</small></dd></div>
        <div><dt>Coherence length</dt><dd><span data-pmo="v-lc">{I.lc}</span><small>&micro;m</small></dd></div>
        <div><dt>Acceptance FWHM</dt><dd><span data-pmo="v-fwhm">{I.fwhm}</span><small>nm</small></dd></div>
      </dl>
      <div class="p9-vpm-ctl">
        <div class="v-group"><h3>Process</h3>
          <div class="v-seg" role="group" aria-label="Process">{#each [["shg", "SHG"], ["sfg", "SFG"], ["dfg", "DFG"], ["opo", "OPO"]] as [v, t] (v)}<button type="button" data-pmv="proc:{v}" class:on={v === D.proc}>{t}</button>{/each}</div>
          <label class="p9-vlab" for="v-pm-model">Dispersion model</label>
          <select id="v-pm-model" class="p9-vsel" data-pm="model">{#each PM_MODELS as m (m.id)}<option value={m.id} selected={m.id === D.model}>{m.label.replace(/<[^>]+>/g, "")}</option>{/each}</select>
          <p class="v-cap">Status of the coefficients: <span class="b pc" data-pmo="model-badge" data-pop="pm-{D.model}">P-db</span></p>
        </div>
        <div class="v-group"><h3>Wavelengths</h3>
          <div class="v-ctl" style="--w:9ch"><label for="v-pm-l1" data-pml="l1">&lambda; fund.</label><output for="v-pm-l1" data-pmf="l1">{D.l1.toFixed(3)} µm</output><input id="v-pm-l1" type="range" min={lamMin} max={lamMax} step="1" value={sliderFromLam(D.l1)} data-pm="l1"></div>
          <div class="v-ctl p9-off" style="--w:9ch"><label for="v-pm-l2" data-pml="l2">&lambda;2 (n/a)</label><output for="v-pm-l2" data-pmf="l2">{D.l2.toFixed(3)} µm</output><input id="v-pm-l2" type="range" min={lamMin} max={lamMax} step="1" value={sliderFromLam(D.l2)} data-pm="l2" disabled></div>
          <div class="v-ctl p9-off" style="--w:9ch"><label for="v-pm-per">OPO period &Lambda;</label><output for="v-pm-per" data-pmf="period">{D.period.toFixed(2)} µm</output><input id="v-pm-per" type="range" min={PERIOD_RANGE[0]} max={PERIOD_RANGE[1]} step="0.01" value={D.period} data-pm="period" disabled></div>
        </div>
        <div class="v-group"><h3>Crystal</h3>
          <div class="v-ctl p9-off" style="--w:9ch"><label for="v-pm-t">Temperature</label><output for="v-pm-t" data-pmf="T">21.0 °C</output><input id="v-pm-t" type="range" min="20" max="250" step="0.5" value={D.T} data-pm="T" disabled></div>
          <div class="v-ctl" style="--w:9ch"><label for="v-pm-l">Length L</label><output for="v-pm-l" data-pmf="L_mm">{D.L_mm.toFixed(1)} mm</output><input id="v-pm-l" type="range" min="0" max="1000" step="1" value={sliderFromLen(D.L_mm)} data-pm="L_mm"></div>
          <div class="v-ctl" style="--w:9ch"><label for="v-pm-d">Duty cycle D</label><output for="v-pm-d" data-pmf="duty">{D.duty.toFixed(2)}</output><input id="v-pm-d" type="range" min="0.1" max="0.9" step="0.01" value={D.duty} data-pm="duty"></div>
          <div class="v-seg" role="group" aria-label="QPM order">{#each [1, 3, 5] as m (m)}<button type="button" data-pmv="m:{m}" class:on={m === D.m}>m = {m}</button>{/each}</div>
        </div>
      </div>
      <div class="p9-vpm-plots">
        <figure class="p9-vfig"><figcaption>Tuning curve at fixed period, sinc²(&Delta;k L/2)</figcaption><svg viewBox="0 0 560 260" class="p9-plot" data-pmo="tune" role="img" aria-label="Tuning curve">{@html I.tV}</svg></figure>
        <figure class="p9-vfig"><figcaption>Period against wavelength; OPO: signal and idler against period</figcaption><svg viewBox="0 0 560 260" class="p9-plot" data-pmo="period" role="img" aria-label="Period curve">{@html I.pV}</svg></figure>
      </div>
      <p class="v-cap">Wavelength sliders span 0.4 to 5 &micro;m on a log scale; a value outside the chosen model's window prints a dash.</p>
      <table class="kv p9-pmkv p9-vpmkv" data-pmo="rows">{@html I.rows}</table>
      <p class="v-cap p9-pm-st" data-pmo="status">{I.status}</p>
    </div>
  </section>

  <section class="lay" id="model" data-pair="model" data-spine="Model and sources">
    <div class="sh"><h2 class="biref">Model and sources</h2><span class="meta">bulk, plane waves, no depletion</span></div>
    <div class="body">
      <p class="tx">Waves 1 and 2 mix to wave 3 with 1/&lambda;<sub>3</sub> = 1/&lambda;<sub>1</sub> + 1/&lambda;<sub>2</sub>; for DFG and OPO, wave 3 is the pump. All three waves are extraordinary (polarized along <i>z</i>), so d<sub>33</sub> couples them; a period &Lambda; of reversed domains adds the grating vector 2&pi;m/&Lambda;.</p>
      <div class="eq"><math display="block"><mrow><mi>&Delta;</mi><mi>k</mi><mo>=</mo><mn>2</mn><mi>&pi;</mi><mrow><mo>(</mo><mfrac><msub><mi>n</mi><mn>3</mn></msub><msub><mi>&lambda;</mi><mn>3</mn></msub></mfrac><mo>&minus;</mo><mfrac><msub><mi>n</mi><mn>1</mn></msub><msub><mi>&lambda;</mi><mn>1</mn></msub></mfrac><mo>&minus;</mo><mfrac><msub><mi>n</mi><mn>2</mn></msub><msub><mi>&lambda;</mi><mn>2</mn></msub></mfrac><mo>)</mo></mrow><mo>&minus;</mo><mfrac><mrow><mn>2</mn><mi>&pi;</mi><mi>m</mi></mrow><mi>&Lambda;</mi></mfrac><mo>,</mo><mspace width="1.2em"/><msub><mi>d</mi><mi>eff</mi></msub><mo>=</mo><mfrac><mn>2</mn><mrow><mi>m</mi><mi>&pi;</mi></mrow></mfrac><mi>sin</mi><mo>(</mo><mi>m</mi><mi>&pi;</mi><mi>D</mi><mo>)</mo><msub><mi>d</mi><mn>33</mn></msub></mrow></math><span class="eqn">(1)</span></div>
      <p class="tx">Output scales as sinc<sup>2</sup>(&Delta;k L/2), which falls to one half at &Delta;k L/2 = 1.3916. The full width in a parameter <i>x</i> (wavelength or temperature) follows from the local slope:</p>
      <div class="eq"><math display="block"><mrow><msub><mi>FWHM</mi><mi>x</mi></msub><mo>=</mo><mfrac><mrow><mn>2</mn><mo>&times;</mo><mn>2.7831</mn></mrow><mrow><mi>L</mi><mo>|</mo><mo>&part;</mo><mi>&Delta;</mi><mi>k</mi><mo>/</mo><mo>&part;</mo><mi>x</mi><mo>|</mo></mrow></mfrac></mrow></math><span class="eqn">(2)</span></div>
      <p class="tx">The period is held fixed when temperature changes (thermal expansion of &Lambda; not included). dn/dT from the Gayer 2008 coefficients is anomalous in magnitude or sign (MgO5: 2.65&times;10<sup>&minus;4</sup> and 1.11&times;10<sup>&minus;4</sup> /K, MgO:SLN: &minus;7.1&times;10<sup>&minus;5</sup> /K at 1550 nm), so the temperature acceptance is not computed from them.</p>
      <h3 class="h3">Dispersion models</h3>
      <div class="scrollx">
        <table class="idx">
          <thead><tr><th>Model</th><th>Axes</th><th>Window</th><th>Notes</th><th class="r">Status</th></tr></thead>
          <tbody>
            {#each PM_MODELS as m (m.id)}
              <tr><td class="h">{@html m.label}</td><td class="mono">{m.o ? "o, e" : "e"}</td><td class="mono">{m.e.lambda_um[0]} to {m.e.lambda_um[1]} &micro;m{m.tdep && m.e.T_range_C ? `, ${m.e.T_range_C[0]} to ${m.e.T_range_C[1]} °C` : ", 21 °C"}</td><td>{@html m.note}</td><td class="r"><span class="b {m.status === 'P' ? 'p' : m.status === 'P-db' ? 'pc' : 's'}" data-pop="pm-{m.id}">{m.status}</span></td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Coefficients and windows: <a class="u" href="/data/dispersion/">dispersion models</a>; JSON at <a class="u" href="/api/v1/dispersion.json">/api/v1/dispersion.json</a>. Check values: Zelmon CLN, 21 &deg;C, SHG 1064 &rarr; 532 nm needs &Lambda; = 6.82 &micro;m and 1550 &rarr; 775 nm needs 18.99 &micro;m.</p>
    </div>
  </section>
</ChapterPage>

<!-- /data/dispersion/: n(lambda) of every dispersion model of the data API from its stored coefficients, validity bars,
     readouts at a cursor wavelength; errata, caveats and check values. TECH: panel, plot, boxed table with toggles.
     VISUAL: plot in a framed figure and one large toggle card per model. State: src/lib/stores/p09.ts disp. -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { usePops, type Pop } from "$lib/content/pops";
  import { mountDisp } from "$lib/figures/p09/dispview";
  import { slFromLam } from "$lib/figures/p09/disp";
  import { installRangeFill } from "$lib/figures/visual/lifecycle";
  import { statusCls } from "$lib/figures/p09/status";
  import { disp } from "$lib/stores/p09";
  import "$lib/figures/p09/p09.css";

  let { data }: { data: PageData } = $props();
  const I = $derived(data.init);
  const rowOf = (id: string) => I.rows.find((r) => r.id === id);
  const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const pops: Record<string, Pop> = {};
  for (const m of data.models) pops[`dm:${m.id}`] = { h: esc(m.name), body: `${m.form === "sellmeier-3term" ? "n<sup>2</sup> &minus; 1 = &Sigma; B<sub>i</sub>&lambda;<sup>2</sup>/(&lambda;<sup>2</sup> &minus; C<sub>i</sub>)" : "n<sup>2</sup> = a<sub>1</sub> + b<sub>1</sub>f + (a<sub>2</sub> + b<sub>2</sub>f)/(&lambda;<sup>2</sup> &minus; (a<sub>3</sub> + b<sub>3</sub>f)<sup>2</sup>) + (a<sub>4</sub> + b<sub>4</sub>f)/(&lambda;<sup>2</sup> &minus; a<sub>5</sub><sup>2</sup>) &minus; a<sub>6</sub>&lambda;<sup>2</sup>, f = (T &minus; 24.5)(T + 570.82)"}<br>${Object.entries(m.coefficients).map(([k, v]) => `${k} ${v}`).join(", ")}`, badges: [[statusCls(m.status), m.status]], src: `${esc(m.src)}${m.doi ? `, <a href="https://doi.org/${m.doi}">doi:${m.doi}</a>` : ""}, ${esc(m.locator)}.` };
  usePops(pops);
  let root: HTMLElement;
  onMount(() => { const off = [mountDisp(root.closest("main") as HTMLElement, data.models), installRangeFill()]; return () => off.forEach((f) => f()); });
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "Data", href: "/data/" }, { label: "dispersion" }]} title="Dispersion models"
  depth={[{ id: "viewer", label: "n(λ)" }, { id: "errata", label: "Errata and caveats" }, { id: "checks", label: "Check values" }]}>

  <section class="lay" id="viewer" data-pair="viewer" data-spine="n(λ)" bind:this={root}>
    <div class="sh"><h2 class="biref">n(&lambda;) from the stored coefficients</h2><span class="meta">{data.models.length} models; curves only inside each validity window</span></div>
    <div class="p9-dp" data-variant="tech">
      <div class="panel">
        <div class="ctl"><label for="dp-l">Cursor &lambda;</label><input id="dp-l" type="range" min="0" max="1000" step="1" value={slFromLam(disp.lam)} data-dp="lam"><output for="dp-l" data-dpf="lam">{disp.lam.toFixed(3)} µm</output></div>
        <div class="ctl"><label for="dp-t">Temperature</label><input id="dp-t" type="range" min="20" max="200" step="0.5" value={disp.T} data-dp="T"><output for="dp-t" data-dpf="T">{disp.T.toFixed(1)} °C</output></div>
        <div class="ctl"><span class="k">Axis</span><div class="seg" role="group" aria-label="Wavelength axis"><button type="button" data-dpv="log:0">linear</button><button type="button" data-dpv="log:1" class="on">log</button></div><span></span></div>
        <div class="p9-dpplot"><svg viewBox="0 0 1000 420" class="p9-plot" data-dpo="svg" role="img" aria-label="Refractive index versus wavelength">{@html I.svg}</svg></div>
        <div class="pf">Temperature acts on the Gayer 2008 models; Zelmon 1997 is defined at 21 &deg;C only. Bars: validity windows, numbered as in the table.</div>
      </div>
      <div class="scrollx">
        <table class="idx p9-dpt">
          <colgroup><col class="c-n"><col><col class="c-a"><col class="c-w"><col class="c-n7"><col class="c-n7"><col class="c-t"><col class="c-st"><col class="c-on"></colgroup>
          <thead><tr><th>No.</th><th>Model</th><th>Axis</th><th>Window</th><th class="r">n</th><th class="r">n<sub>g</sub></th><th class="r">T used</th><th>Status</th><th>Plot</th></tr></thead>
          <tbody>
            {#each data.models as m, k (m.id)}
              <tr><td>{k + 1}</td><td class="h"><span class="term" data-pop="dm:{m.id}">{m.name}</span></td><td class="mono">{m.axis}</td><td class="mono">{m.valid_lambda_um[0]} to {m.valid_lambda_um[1]} µm{m.valid_T_C ? `, ${m.valid_T_C[0]} to ${m.valid_T_C[1]} °C` : `, ${m.reference_T_C} °C`}</td>
                <td class="r mono p9-pre1" data-dpn={m.id}>{rowOf(m.id)?.n}</td><td class="r mono p9-pre1" data-dpg={m.id}>{rowOf(m.id)?.ng}</td><td class="r mono p9-pre1" data-dpt={m.id}>{rowOf(m.id)?.t}</td>
                <td><span class="b {statusCls(m.status)}" data-pop="dm:{m.id}">{m.status}</span></td>
                <td><button type="button" class="p9-tog" data-dpm={m.id} aria-pressed={disp.on.includes(m.id)} class:on={disp.on.includes(m.id)}>on</button></td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="p9-vdp" data-variant="visual">
      <figure class="p9-vfig"><figcaption>Refractive index against wavelength; dashed patterns identify the models, bars below mark their validity windows</figcaption><div class="p9-dpplot"><svg viewBox="0 0 1000 420" class="p9-plot" data-dpo="svg" role="img" aria-label="Refractive index versus wavelength">{@html I.svg}</svg></div></figure>
      <div class="p9-vpm-ctl p9-vdp-ctl">
        <div class="v-ctl" style="--w:9ch"><label for="v-dp-l">Cursor wavelength</label><output for="v-dp-l" data-dpf="lam">{disp.lam.toFixed(3)} µm</output><input id="v-dp-l" type="range" min="0" max="1000" step="1" value={slFromLam(disp.lam)} data-dp="lam"></div>
        <div class="v-ctl" style="--w:9ch"><label for="v-dp-t">Temperature (Gayer models)</label><output for="v-dp-t" data-dpf="T">{disp.T.toFixed(1)} °C</output><input id="v-dp-t" type="range" min="20" max="200" step="0.5" value={disp.T} data-dp="T"></div>
        <div class="v-group"><h3>Wavelength axis</h3><div class="v-seg" role="group" aria-label="Wavelength axis"><button type="button" data-dpv="log:0">Linear</button><button type="button" data-dpv="log:1" class="on">Log</button></div></div>
      </div>
      <div class="p9-vdp-cards">
        {#each data.models as m, k (m.id)}
          <button type="button" class="p9-vdp-card" data-dpm={m.id} aria-pressed={disp.on.includes(m.id)} class:on={disp.on.includes(m.id)}>
            <span class="p9-vdp-top"><span class="p9-vdp-no">{k + 1}</span><span class="p9-vdp-ax">n<sub>{m.axis}</sub></span></span>
            <span class="p9-vdp-name">{m.name}</span>
            <span class="p9-vdp-n" data-dpn={m.id}>{rowOf(m.id)?.n}</span>
            <span class="p9-vdp-sub">n<sub>g</sub> <span data-dpg={m.id}>{rowOf(m.id)?.ng}</span> at <span data-dpt={m.id}>{rowOf(m.id)?.t}</span></span>
            <span class="p9-vdp-sub">{m.valid_lambda_um[0]} to {m.valid_lambda_um[1]} &micro;m &middot; {m.status}</span>
          </button>
        {/each}
      </div>
    </div>
  </section>

  <section class="lay" id="errata" data-pair="errata" data-spine="Errata and caveats">
    <div class="sh"><h2 class="biref">Errata and caveats</h2><span class="meta">applied errata change the stored coefficients or their axis labels</span></div>
    <div class="scrollx">
      <table class="idx p9-err">
        <thead><tr><th>Model</th><th>Erratum</th><th>Effect</th><th>Caveats</th></tr></thead>
        <tbody>
          {#each data.models as m (m.id)}
            <tr><td class="h">{m.name}</td>
              <td>{#each m.errata as e, i (i)}{#if i}<br>{/if}{e.citation ?? "erratum"}{#if e.doi}, <a href="https://doi.org/{e.doi}">doi:{e.doi}</a>{/if}{e.applied ? " (applied)" : ""}{:else}<span class="dim">none</span>{/each}</td>
              <td>{#each m.errata as e, i (i)}{#if i}<br>{/if}{e.effect ?? ""}{:else}&ndash;{/each}</td>
              <td>{#each m.caveats as c, i (i)}{#if i}<br>{/if}{c}{:else}&ndash;{/each}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="lay" id="checks" data-pair="checks" data-spine="Check values">
    <div class="sh"><h2 class="biref">Check values</h2><span class="meta">stored reference values against this page's evaluation</span></div>
    <div class="scrollx">
      <table class="idx p9-chk">
        <thead><tr><th>Model</th><th class="r">&lambda; (nm)</th><th class="r">T (&deg;C)</th><th class="r">stored n</th><th class="r">computed n</th><th class="r">difference</th><th class="r">tolerance</th><th>Reference</th></tr></thead>
        <tbody>
          {#each data.checks as c, i (i)}
            <tr><td class="h">{c.model}</td><td class="r mono">{c.lam}</td><td class="r mono">{c.T}{c.Tused !== c.T ? ` (model ${c.Tused})` : ""}</td><td class="r mono">{c.stored.toFixed(5)}</td><td class="r mono">{c.computed.toFixed(5)}</td><td class="r mono">{(c.diff >= 0 ? "+" : "−") + Math.abs(c.diff).toExponential(1)}</td><td class="r mono">{c.tol.toExponential(0)}{c.ok ? "" : " exceeded"}</td><td>{c.source}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="fine">Coefficients and grids: <a class="u" href="/api/v1/dispersion.json">/api/v1/dispersion.json</a>, 1 nm grids under /api/v1/grids/index/, refractiveindex.info YAML per model. QPM periods from these models: <a class="u" href="/lab/phase-matching/">phase matching</a>.</p>
  </section>
</ChapterPage>

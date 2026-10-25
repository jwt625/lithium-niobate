<!-- Chapter 04 landing: sections index (TECH table / VISUAL cards over the kintsugi door art), the three shell motifs and
     the sections that explain them, cross-links. Section list: src/lib/figures/quirks/sections.ts. -->
<script lang="ts">
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { usePops } from "$lib/content/pops";
  import { QSECTIONS, qHref } from "$lib/figures/quirks/sections";
  import { MOTIF_POPS } from "$lib/figures/quirks/motifs";
  import "$lib/figures/quirks/quirks.css";

  usePops(MOTIF_POPS);
  // door art: a 532 nm photorefractive trace (decaying sine written left to right) crossed by an Au kintsugi crack
  const trace = Array.from({ length: 161 }, (_, i) => { const x = 20 + i * 7.5; const y = 120 + 46 * Math.exp(-i / 90) * Math.sin(i / 9); return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join("");
  const crack = "M690 4 L676 30 L684 41 L667 66 L672 92 L654 118 L660 139 L641 170 L647 196 L629 236";
  const branch = "M672 92 L700 104 L712 128 M654 118 L630 126 M647 196 L668 214";
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "04 Quirks" }]} title="04 Quirks"
  depth={[{ id: "sections", label: "Sections" }, { id: "motifs", label: "Motifs" }, { id: "links", label: "Cross-links" }]}>
  <section class="lay" id="sections" data-pair="sections" data-spine="Sections">
    <div class="sh"><h2 class="biref">Sections</h2></div>
    <div class="body">
      <p class="tx">Optical damage, pyroelectric charging, bias drift, green-induced infrared absorption, thermal drift, lithium loss: effects that degrade lithium niobate devices.</p>
      <div class="scrollx" data-variant="tech">
        <table class="idx q-tab">
          <thead><tr><th>No.</th><th>Section</th><th>Keywords</th></tr></thead>
          <tbody>{#each QSECTIONS as s (s.slug)}<tr><td class="q-v">{s.no}</td><td class="h"><a href={qHref(s)}>{s.title}</a></td><td class="q-w">{s.kw}</td></tr>{/each}</tbody>
        </table>
      </div>
      <div class="q-land" data-variant="visual">
        <svg class="q-svg q-door" viewBox="0 0 1240 240" role="img" aria-label="Chapter art: a green photorefractive trace crossed by a gold kintsugi crack">
          <path d={trace} class="q-tr" /><path d={trace} class="q-trg" />
          <path d={crack} class="q-kin" /><path d={branch} class="q-kin q-kb" />
        </svg>
        <div class="q-lcards">
          {#each QSECTIONS as s (s.slug)}
            <a class="q-lcard v-facet" href={qHref(s)}><span class="q-ln">{s.no}</span><span class="q-lt">{s.short}</span><span class="q-lk">{s.kw}</span></a>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <section class="lay" id="motifs" data-pair="motifs" data-spine="Motifs">
    <div class="sh"><h2 class="biref">Motifs</h2></div>
    <div class="body">
      <div class="scrollx">
        <table class="idx q-tab">
          <thead><tr><th>Motif</th><th>Where</th><th>Physics</th><th>Section</th></tr></thead>
          <tbody>
            <tr><td><span class="term" data-pop="m-trace">Cursor trace</span></td><td class="q-w">VISUAL, effects on: the pointer leaves a fading green trace</td><td class="q-w">light writes an index change that decays with the dielectric relaxation time</td><td class="h"><a href="/quirks/photorefraction/">4.1 Photorefraction</a></td></tr>
            <tr><td><span class="term" data-pop="m-griira">Infrared dimming</span></td><td class="q-w">VISUAL, effects on: false-color infrared marks dim near the pointer</td><td class="q-w">green light fills Nb antisite traps whose polarons absorb infrared light</td><td class="h"><a href="/quirks/griira/">4.4 GRIIRA</a></td></tr>
            <tr><td><span class="term" data-pop="drift">Bias meter</span></td><td class="q-w">footer, VISUAL: the operating point walks; click to re-lock</td><td class="q-w">mobile charge screens the DC bias; layered RC relaxation</td><td class="h"><a href="/quirks/dc-bias-drift/">4.7 DC bias drift</a></td></tr>
          </tbody>
        </table>
      </div>
      <p class="q-note">The motifs use display time constants (15 s trace, 40 s drift), not material values.</p>
    </div>
  </section>

  <section class="lay" id="links" data-pair="links" data-spine="Cross-links">
    <div class="sh"><h2 class="biref">Cross-links</h2></div>
    <div class="body">
      <ul class="q-list">
        <li>Pockels tensor and r<sub>33</sub> values: <a class="lk" href="/light/pockels-effect/">2.2 The Pockels effect</a>.</li>
        <li>Nb antisites, Li vacancies, composition: chapter 01 Crystal.</li>
        <li>Annealing, ion slicing, Ar<sup>+</sup> milling, poling: chapter 05 Making.</li>
        <li>Modulator records and drift-free claims in products: chapter 06 Devices.</li>
        <li>Dated events (1966 optical damage, 1968 holography, 1969 charge-drift model, 1974 bulk photovoltaic effect, 1980 and 1984 MgO): chapter 07 History.</li>
      </ul>
    </div>
  </section>
</ChapterPage>

<style>
  .q-door { margin: 8px 0 40px; }
  .q-tr { fill: none; stroke: var(--v-l532); stroke-width: 3; }
  .q-trg { fill: none; stroke: var(--v-l532); stroke-width: 12; opacity: 0.18; }
  .q-kin { fill: none; stroke: var(--v-au); stroke-width: 3; stroke-linejoin: bevel; }
  .q-kb { stroke-width: 1.5; }
  .q-lcards { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
  @media (max-width: 1200px) { .q-lcards { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (max-width: 760px) { .q-lcards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 480px) { .q-lcards { grid-template-columns: minmax(0, 1fr); } }
  .q-lcard { position: relative; display: flex; flex-direction: column; gap: 8px; min-height: 230px; padding: 20px; background: var(--v-ink1); border: 1px solid var(--v-line); color: var(--v-text); transition: border-color 240ms var(--v-ease); }
  .q-lcard:hover, .q-lcard:focus-visible { border-color: var(--v-l532); outline: none; }
  .q-ln { font: 300 44px/44px var(--v-serif); color: var(--v-text3); font-variant-numeric: lining-nums; }
  .q-lt { font: 400 24px/28px var(--v-serif); }
  .q-lk { font: 400 14px/20px var(--v-ui); color: var(--v-text3); }
</style>

<!-- fig-04-12 Drift mitigations over time (data only). Rows from manuscript sec. 4.7; no common metric: each row prints the
     metric as its source reports it. TFLT rows are a different material and keep their label. -->
<script lang="ts">
  import Src from "./ui/Src.svelte";
  import Seg from "./ui/Seg.svelte";
  import type { StatusCode } from "$lib/content/site";

  type Plat = "bulk" | "TFLN" | "TFLT";
  interface Row { y: number; id: string; plat: Plat; cls: string; what: string; metric: string; code: StatusCode; text?: string }
  const ROWS: Row[] = [
    { y: 1981, id: "yamada1981", plat: "bulk", cls: "diagnosis", what: "Ti:LN directional coupler", metric: "two components: seconds (buffer leakage), hours (photorefraction)", code: "reported" },
    { y: 1985, id: "gee1985", plat: "bulk", cls: "buffer/cladding", what: "ITO buffer instead of SiO2", metric: "< 0.3% drift in 8 h", code: "reported" },
    { y: 1986, id: "bulmer1986", plat: "bulk", cls: "cut choice", what: "x-cut instead of z-cut interferometers", metric: "x-cut thermally stable; z-cut unstable", code: "reported" },
    { y: 1996, id: "nagata1996", plat: "bulk", cls: "material processing", what: "OH reduction", metric: "improved long-term drift (title)", code: "reported", text: "reported (title)" },
    { y: 2004, id: "nagata2004", plat: "bulk", cls: "diagnosis", what: "DC-induced thermal shift", metric: "title-level", code: "reported", text: "reported (title)" },
    { y: 2011, id: "salvestrini2011", plat: "bulk", cls: "control", what: "analysis and control of drift", metric: "title-level", code: "reported", text: "reported (title)" },
    { y: 2021, id: "lomonte2021", plat: "TFLN", cls: "temperature", what: "LNOI MZI at cryogenic temperature", metric: "bias-drift-free 12 h", code: "reported" },
    { y: 2022, id: "puma2022", plat: "TFLN", cls: "interface and anneal", what: "LN/metal interface preparation, forming-gas anneal", metric: "anomalous sub-MHz response improved", code: "reported" },
    { y: 2024, id: "holzgrafe2024", plat: "TFLN", cls: "interface and anneal", what: "LN-metal interface control and annealing", metric: "relaxation slowed > 10⁴-fold", code: "reported" },
    { y: 2024, id: "lizy2024", plat: "TFLN", cls: "heterogeneous", what: "wafer-scale Si/TFLN", metric: "weak bias drift", code: "reported" },
    { y: 2024, id: "powell2024", plat: "TFLT", cls: "material swap", what: "thin-film LiTaO3", metric: "< 1 dB vs 5 dB (TFLN) output fluctuation over 46 h", code: "reported" },
    { y: 2025, id: "shi2025", plat: "TFLN", cls: "surface treatment", what: "Ar+ milling pre-treatment", metric: "no drift under DC within 1 h", code: "reported" },
    { y: 2025, id: "warner2025", plat: "TFLN", cls: "temperature", what: "liquid-nitrogen temperature", metric: "stable DC operation", code: "reported" },
    { y: 2026, id: "li2026photonics", plat: "TFLN", cls: "buffer/cladding", what: "cladding on vs off", metric: "RC 11.9 ms (clad, positive) vs 88.6 µs (unclad, negative)", code: "reported" },
    { y: 2026, id: "yeh2026", plat: "TFLN", cls: "reset protocol", what: "zero or reverse bias reset", metric: "hysteresis reversible; active reset", code: "reported" },
    { y: 2026, id: "alsayem2026", plat: "TFLT", cls: "material swap", what: "thin-film LiTaO3, hot", metric: "DC-bias stable at 120 °C (preprint)", code: "reported", text: "reported (preprint)" },
    { y: 2026, id: "liu2026acs", plat: "TFLN", cls: "thermal bias", what: "thermo-optic bias, visible and NIR", metric: "title-level", code: "reported", text: "reported (title)" },
  ];
  const CLASSES = [...new Set(ROWS.map((r) => r.cls))];
  let plat = $state<"all" | Plat>("all");
  let cls = $state<string>("all");
  let hov = $state(-1);
  const on = (r: Row) => (plat === "all" || r.plat === plat) && (cls === "all" || r.cls === cls);
  const card = $derived(hov >= 0 ? ROWS[hov] : null);
  // VISUAL timeline
  // piecewise time axis: 1978-2020 compressed into 150-330, 2020-2027 expanded into 340-630 (break drawn at 335)
  const tx = (y: number): number => (y <= 2020 ? 150 + ((y - 1978) / 42) * 180 : 340 + ((y - 2020) / 7) * 290);
  const laneY = (c: string) => 40 + CLASSES.indexOf(c) * 30;
  const jitter = (i: number) => ROWS.slice(0, i).filter((r) => r.y === ROWS[i].y && r.cls === ROWS[i].cls).length * 18;
</script>

<div class="q-fig" id="fig-04-12">
  <figure class="panel" data-variant="tech">
    <div class="ph"><span>Drift mitigations, 1981-2026: metric as reported, no common scale</span><span>17 rows; filters dim the others</span></div>
    <div class="scrollx q-f12s">
      <table class="log q-f12">
        <thead><tr><th>Year</th><th>Platform</th><th>Class</th><th>Mitigation or finding</th><th>Metric</th><th>Source</th></tr></thead>
        <tbody>{#each ROWS as r, i (r.id)}<tr class:q-off2={!on(r)}><td>{r.y}</td><td>{r.plat}</td><td>{r.cls}</td><td class="e">{r.what}</td><td class="e">{r.metric}</td><td><Src id={r.id} code={r.code} text={r.text} /></td></tr>{/each}</tbody>
      </table>
    </div>
    <div class="ctl"><span class="k">Platform</span><Seg bind:value={plat} options={[["all", "all"], ["bulk", "bulk"], ["TFLN", "TFLN"], ["TFLT", "TFLT"]]} label="Platform filter" /><span></span></div>
    <div class="ctl"><span class="k">Class</span><select class="q-sel" bind:value={cls} aria-label="Class filter"><option value="all">all classes</option>{#each CLASSES as c (c)}<option value={c}>{c}</option>{/each}</select><span></span></div>
  </figure>

  <div class="q-vfig" data-variant="visual">
    <header><h3>DC drift mitigations, 1981-2026</h3><span class="q-vq">one marker per reported result, rows by class of fix; metric as reported, no common scale</span></header>
    <div class="q-vgrid">
      <div class="q-vstage v-frame">
        <svg class="q-svg" viewBox="0 0 650 {56 + CLASSES.length * 30}" role="img" aria-label="Timeline of reported drift mitigations by class">
          <defs><pattern id="f12-h" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="4" fill="var(--v-au)" /></pattern></defs>
          <path d="M331 22 l4 -8 M336 22 l4 -8" class="q-brk" /><text x="335" y={46 + CLASSES.length * 30} text-anchor="middle" class="q-ln">axis break: scale ×6 after 2020</text>
          {#each [1980, 1990, 2000, 2010, 2020, 2022, 2024, 2026] as y (y)}<line x1={tx(y)} x2={tx(y)} y1="24" y2={30 + CLASSES.length * 30} class="gl" /><text x={tx(y)} y="16" text-anchor="middle">{y}</text>{/each}
          {#each CLASSES as c (c)}<text x="142" y={laneY(c) + 4} text-anchor="end" class="q-ln" class:dim={cls !== "all" && cls !== c} role="button" tabindex="0" aria-label="Filter class {c}" onclick={() => (cls = cls === c ? "all" : c)} onkeydown={(ev) => { if (ev.key === "Enter") cls = cls === c ? "all" : c; }}>{c}</text><line x1="150" x2="630" y1={laneY(c)} y2={laneY(c)} class="q-lane" />{/each}
          {#each ROWS as r, i (r.id)}
            {@const x = tx(r.y) + jitter(i)}{@const y = laneY(r.cls)}
            <g class="q-m" class:off={!on(r)} class:hv={hov === i} role="img" aria-label="{r.y} {r.plat} {r.what}: {r.metric}" onpointerenter={() => (hov = i)} onpointerleave={() => (hov = -1)}>
              {#if r.plat === "bulk"}<circle cx={x} cy={y} r="8" class="q-mb" />{:else if r.plat === "TFLN"}<rect x={x - 7} y={y - 7} width="14" height="14" class="q-mt" transform="rotate(45 {x} {y})" />{:else}<rect x={x - 8} y={y - 8} width="16" height="16" fill="url(#f12-h)" class="q-mtt" />{/if}
              <circle cx={x} cy={y} r="13" class="hit" />
            </g>
          {/each}
        </svg>
        <div class="q-vcard">{#if card}<b>{card.y}, {card.plat}: {card.what}</b><span>{card.metric}</span><span>{card.cls}</span>{:else}<b>Hover a marker</b><span>year, platform, mitigation, metric as reported</span><span>&nbsp;</span>{/if}</div>
      </div>
      <div class="q-vctl">
        <div class="v-ctl"><span class="v-lab">Platform</span><Seg kind="v" bind:value={plat} options={[["all", "All"], ["bulk", "Bulk"], ["TFLN", "TFLN"], ["TFLT", "TFLT"]]} label="Platform filter" /></div>
        <dl class="v-hud q-legend"><dt>circle</dt><dd>bulk Ti:LN</dd><dt>diamond</dt><dd>TFLN</dd><dt>hatched square</dt><dd>thin-film LiTaO₃</dd></dl>
        <p class="v-cap">Click a row name to filter by class.</p>
        <p class="v-cap">The same two levers recur 40 years apart: a conductive buffer in 1985, cladding and interface control in 2024-2026. Metrics are not comparable across rows and are printed as reported.</p>
      </div>
    </div>
    <div class="v-prov"><span>preprints marked in the hover card</span></div>
  </div>
</div>

<style>
  .q-f12s { max-height: none; }
  .q-f12 { margin: 6px 8px; width: calc(100% - 16px); }
  .q-f12 td { white-space: nowrap; }
  .q-f12 td.e { white-space: normal; min-width: 180px; }
  .q-f12 tr.q-off2 td { opacity: 0.25; }
  .q-sel { font: 400 11px var(--mono); background: var(--bg); color: var(--fg); border: 1px solid var(--rule2); padding: 2px 4px; border-radius: 0; justify-self: start; }
  .q-ln { font: 500 calc(12px * var(--q-k)) var(--v-ui) !important; fill: var(--v-text2) !important; }
  .q-ln.dim { opacity: 0.35; }
  .q-ln { cursor: pointer; }
  .q-lane { stroke: var(--v-line); }
  .q-brk { stroke: var(--v-text2); stroke-width: 1.5; }
  .q-m.off { opacity: 0.12; }
  .q-m.hv .q-mb, .q-m.hv .q-mt, .q-m.hv .q-mtt { stroke: var(--v-text); stroke-width: 2.5; }
  .q-mb { fill: var(--v-text2); }
  .q-mt { fill: var(--v-l532); }
  .q-mtt { stroke: var(--v-au); stroke-width: 1.5; }
  .q-vcard { display: grid; gap: 2px; align-content: start; height: 120px; overflow: hidden; margin-top: 12px; padding: 12px 16px; border: 1px solid var(--v-line2); font: 400 15px/22px var(--v-ui); color: var(--v-text2); }
  .q-vcard b { font: 500 16px/24px var(--v-ui); color: var(--v-text); }
  .q-legend dd { text-align: left; }
</style>
